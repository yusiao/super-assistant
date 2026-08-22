import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyInsuranceProductOverrides } from "./insurance-product-overrides.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productsPath = resolve(root, "output/insurance-planner/products.json");
const cloudflareProductsPath = resolve(root, "output/insurance-planner-cloudflare/products.json");
const localFeedPaths = [
  resolve(root, "data/insurance/products-feed.json"),
  resolve(root, "data/insurance/products-finfo-index.json"),
  resolve(root, "data/insurance/products-finfo-feed.json"),
];
const DISCOVERED_SOURCES = new Set(["public-product-list", "public-discovery", "finfo-index", "finfo-public"]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[\s\-_/．。]+/g, "");
}

function normalizeBenefitAmount(value) {
  const text = String(value || "").trim();
  return /依方案限額|依條款限額/.test(text) ? "待條款解析" : text;
}

function normalizeBenefitRows(rows) {
  return Array.isArray(rows)
    ? rows.map((benefit) => ({
      item: String(benefit.item || benefit.name || benefit.label || "").trim(),
      amount: normalizeBenefitAmount(benefit.amount || benefit.coverage || benefit.value),
      note: String(benefit.note || benefit.description || "").trim(),
    })).filter((benefit) => benefit.item || benefit.amount || benefit.note)
    : [];
}

function normalizePlanBenefitTables(tables) {
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) return {};
  return Object.fromEntries(
    Object.entries(tables)
      .map(([plan, rows]) => [String(plan || "").trim(), normalizeBenefitRows(rows)])
      .filter(([plan, rows]) => plan && rows.length),
  );
}

function normalizePurchaseRequirements(rows) {
  return Array.isArray(rows)
    ? rows.map((requirement) => {
      if (typeof requirement === "string") {
        return { type: "requiresProduct", code: normalizeCode(requirement), name: "", timing: "before", note: "" };
      }
      return {
        type: String(requirement.type || requirement.kind || "requiresProduct").trim() || "requiresProduct",
        code: normalizeCode(requirement.code || requirement.productCode || requirement.requiredProductCode),
        name: String(requirement.name || requirement.productName || requirement.requiredProductName || "").trim(),
        timing: String(requirement.timing || requirement.relation || "before").trim() || "before",
        note: String(requirement.note || requirement.description || "").trim(),
      };
    }).filter((requirement) => requirement.code || requirement.name)
    : [];
}

function planTotalRateRows(item) {
  const tables = item?.rateTablesByGender;
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) return [];
  const male = Array.isArray(tables.male) ? tables.male : [];
  if (male.length) return male;
  return Object.values(tables).find((rows) => Array.isArray(rows) && rows.length) || [];
}

function premiumAtAge(rows, age) {
  return Number(
    rows.find((row) => Number(row.age) === age)?.premium
    || rows.find((row) => Number(row.age) > age)?.premium
    || rows.at(-1)?.premium
    || 0,
  );
}

function normalizeProduct(item) {
  const code = normalizeCode(item.code || item.productCode || item.policyCode || item.id);
  const name = String(item.name || item.productName || item.title || "").trim();
  const insurer = String(item.insurer || item.company || item.companyName || item.insurerName || "").trim();
  const aliases = Array.isArray(item.aliases)
    ? item.aliases.map(normalizeCode).filter(Boolean)
    : [];
  const inferredPlanTotal = item.ratePricingModel === "planTotal"
    || String(item.premiumChange || "").includes("Finfo 公開 premiums API");
  const rows = inferredPlanTotal ? planTotalRateRows(item) : [];
  const coverageWan = Math.max(0, Number(item.coverageWan || item.coverageInWan || 0));
  const planName = String(item.planName || item.plan || item.selectedPlan || "").trim();
  const coverageLabel = String(item.coverageLabel || item.planLabel || item.coverageDescription || "").trim();
  const benefits = normalizeBenefitRows(item.benefits);
  const planOptions = Array.isArray(item.planOptions)
    ? item.planOptions.map((plan) => String(plan || "").trim()).filter(Boolean)
    : [];
  const planBenefitTables = normalizePlanBenefitTables(item.planBenefitTables || item.benefitTablesByPlan || item.claimTablesByPlan);
  const purchaseRequirements = normalizePurchaseRequirements(item.purchaseRequirements || item.requirements || item.requiredProducts || item.requiredProductCodes);
  const normalized = {
    ...item,
    code,
    aliases,
    name,
    insurer,
  };
  if (planName) normalized.planName = planName;
  if (coverageLabel) normalized.coverageLabel = coverageLabel;
  if (benefits.length) normalized.benefits = benefits;
  if (planOptions.length) normalized.planOptions = [...new Set(planOptions)];
  if (Object.keys(planBenefitTables).length) normalized.planBenefitTables = planBenefitTables;
  if (purchaseRequirements.length) normalized.purchaseRequirements = purchaseRequirements;
  if (!inferredPlanTotal || !rows.length) return normalized;

  const annualPremium = premiumAtAge(rows, 35);
  return {
    ...normalized,
    annualPremium: annualPremium || Number(item.annualPremium) || 0,
    premiumBands: rows.slice(0, 12).map((row) => ({
      age: `${Number(row.age)}歲`,
      premium: Number(row.premium) || 0,
    })),
    ratePricingModel: "planTotal",
    termRatePricingModel: item.termRatePricingModel || "coverageUnit",
    rateUnitCoverage: coverageWan > 0
      ? coverageWan * 10000
      : Math.max(1, Number(item.rateUnitCoverage) || 1),
  };
}

function productRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.productCatalog)) return payload.productCatalog;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function isDiscoveredProduct(item) {
  return DISCOVERED_SOURCES.has(String(item?.source || ""));
}

function productAlternate(item) {
  return {
    insurer: item.insurer,
    name: item.name,
    effectiveDate: item.effectiveDate || "",
    sourceUrl: item.sourceUrl || "",
  };
}

function mergedAlternateProducts(primary, ...groups) {
  const byInsurer = new Map();
  groups.flat().filter(Boolean).forEach((item) => {
    if (!item.insurer || item.insurer === primary.insurer) return;
    const previous = byInsurer.get(item.insurer);
    if (!previous || String(item.effectiveDate || "") > String(previous.effectiveDate || "")) {
      byInsurer.set(item.insurer, productAlternate(item));
    }
  });
  return Array.from(byInsurer.values());
}

function mergeProducts(existingRows, incomingRows) {
  const merged = new Map();
  [...existingRows, ...incomingRows].forEach((item) => {
    const normalized = normalizeProduct(item);
    if (!normalized.code || !normalized.name || !normalized.insurer) return;
    const previous = merged.get(normalized.code);
    if (!previous) {
      merged.set(normalized.code, normalized);
      return;
    }
    const sameCompany = previous.insurer === normalized.insurer;
    const primary = sameCompany ? { ...previous, ...normalized } : normalized;
    primary.alternateProducts = mergedAlternateProducts(
      primary,
      previous.alternateProducts || [],
      normalized.alternateProducts || [],
      sameCompany ? [] : [previous],
    );
    merged.set(normalized.code, primary);
  });
  return Array.from(merged.values()).sort((a, b) => a.code.localeCompare(b.code, "en"));
}

async function loadRemoteFeed() {
  const url = process.env.INSURANCE_PRODUCT_FEED_URL;
  if (!url) return [];
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Feed request failed: ${response.status} ${response.statusText}`);
  return productRows(await response.json());
}

const current = readJson(productsPath);
const incoming = [];

for (const localFeedPath of localFeedPaths) {
  if (existsSync(localFeedPath)) incoming.push(...productRows(readJson(localFeedPath)));
}
incoming.push(...await loadRemoteFeed());

if (!incoming.length) {
  console.log("No product feed configured. Set INSURANCE_PRODUCT_FEED_URL or add data/insurance/products-feed.json.");
  process.exit(0);
}

const currentRows = productRows(current);
const replaceSources = new Set(incoming.filter(isDiscoveredProduct).map((item) => item.source));
const baseRows = replaceSources.size
  ? currentRows.filter((item) => !replaceSources.has(String(item?.source || "")))
  : currentRows;

const next = {
  ...current,
  updatedAt: process.env.INSURANCE_PRODUCTS_UPDATED_AT || new Date().toISOString().slice(0, 10),
  sourceStatus: "full-code-index",
  sourceNote: "商品代號由 Finfo 公開 sitemap 每週全量索引；保障與費率由即時查詢及批次解析補齊，仍以各保險公司正式條款與費率表為準。",
  products: applyInsuranceProductOverrides(mergeProducts(baseRows, incoming)),
};

const serialized = `${JSON.stringify(next, null, 2)}\n`;
writeFileSync(productsPath, serialized, "utf8");
writeFileSync(cloudflareProductsPath, serialized, "utf8");
console.log(`Updated ${next.products.length} insurance products in ${productsPath}`);
console.log(`Synced ${cloudflareProductsPath}`);
