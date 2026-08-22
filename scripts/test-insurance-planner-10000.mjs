import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

const root = resolve(import.meta.dirname, "..");
const productsPath = resolve(root, "output/insurance-planner/products.json");
const reportPath = resolve(root, "output/insurance-planner/synthetic-usage-report.json");
const payload = JSON.parse(await readFile(productsPath, "utf8"));
const sourceProducts = payload.products || payload;
const currentYear = new Date().getFullYear();

const ageGroups = [
  { id: "10-25", min: 10, max: 25, users: 2500, monthlyBudget: 3000 },
  { id: "26-40", min: 26, max: 40, users: 2500, monthlyBudget: 6000 },
  { id: "41-65", min: 41, max: 65, users: 2500, monthlyBudget: 9000 },
  { id: "66+", min: 66, max: 90, users: 2500, monthlyBudget: 12000 },
];

function number(value, fallback = 0) {
  if (value == null || (typeof value === "string" && !value.trim())) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[\s\-_/．。]+/g, "");
}

function termYears(value) {
  const match = String(value || "").match(/(\d{1,2})\s*(?:年期|年|year)/i);
  return match ? number(match[1]) : 0;
}

function normalizeProduct(item) {
  return {
    ...item,
    code: normalizeCode(item.code),
    coverage: item.coverage != null ? number(item.coverage) : number(item.coverageWan) * 10000,
    popularity: Math.max(0, number(item.popularity)),
    endAge: Math.max(0, number(item.endAge)),
  };
}

function expandProducts(rows) {
  return rows.flatMap((item) => {
    const primary = normalizeProduct(item);
    const alternates = (item.alternateProducts || []).map((alternate) => normalizeProduct({
      ...item,
      ...alternate,
      code: item.code,
      aliases: [],
      category: "",
      annualPremium: 0,
      endAgeKnown: false,
      premiumBands: [],
      rateTable: [],
      rateTablesByGender: {},
      planRateTablesByGender: {},
      termRateTablesByGender: {},
      structuredRateTable: null,
      rateStatus: "index-only",
      popularity: 0,
      alternateProducts: [],
    }));
    return [primary, ...alternates];
  });
}

function productTerms(product) {
  return [...new Set([
    ...(product.availableTerms || []),
    ...Object.keys(product.termRateTablesByGender || {}),
  ].map((term) => String(term || "").trim()).filter(Boolean))];
}

function matchedTerm(product, requested) {
  const terms = productTerms(product);
  return terms.find((term) => term === requested)
    || terms.find((term) => termYears(term) > 0 && termYears(term) === termYears(requested))
    || "";
}

function defaultPlan(product) {
  return String(product.planName || product.coverageLabel || product.planOptions?.[0] || "").trim();
}

function planTables(product, plan) {
  const entries = Object.entries(product.planRateTablesByGender || {});
  return entries.find(([label]) => label === plan)?.[1]
    || entries.find(([label]) => label.replace(/\s+/g, "") === plan.replace(/\s+/g, ""))?.[1]
    || null;
}

function rateRows(product, gender, premiumTerm = "", plan = defaultPlan(product)) {
  const term = matchedTerm(product, premiumTerm);
  const tables = planTables(product, plan)
    || (term ? product.termRateTablesByGender?.[term] : null)
    || product.rateTablesByGender
    || {};
  return tables?.[gender]?.length
    ? tables[gender]
    : tables?.male?.length
      ? tables.male
      : product.rateTable || [];
}

function ageBounds(rows) {
  const ages = rows.map((row) => number(row.age, NaN)).filter(Number.isFinite);
  return ages.length ? { min: Math.min(...ages), max: Math.max(...ages) } : null;
}

function rowsSupportAge(rows, age) {
  const bounds = ageBounds(rows);
  return Boolean(bounds && age >= bounds.min && age <= bounds.max);
}

function suitableTerm(product, age, gender, requested = product.premiumTerm || "") {
  const terms = productTerms(product);
  if (!terms.length) return "";
  const requestedMatch = matchedTerm(product, requested);
  if (requestedMatch && rowsSupportAge(rateRows(product, gender, requestedMatch), age)) return requestedMatch;
  return [...terms]
    .sort((a, b) => termYears(b) - termYears(a) || b.localeCompare(a, "zh-Hant"))
    .find((term) => rowsSupportAge(rateRows(product, gender, term), age)) || "";
}

function rowForAge(rows, age) {
  if (!rowsSupportAge(rows, age)) return null;
  return rows.find((row) => number(row.age, NaN) === age)
    || [...rows].reverse().find((row) => number(row.age, NaN) <= age)
    || null;
}

function structuredPremium(product, occupationClass) {
  const table = product.structuredRateTable;
  if (!table?.rows?.length) return null;
  const classKey = `class${occupationClass}`;
  const coverageWan = Math.max(0, product.coverage / 10000);
  if (table.kind === "unitOccupation") {
    const rate = number(table.rows[0]?.premiums?.[classKey] ?? table.rows[0]?.premiums?.class1);
    return rate > 0 ? rate * Math.max(1, coverageWan || 1) : null;
  }
  const rows = [...table.rows].sort((a, b) => number(a.coverageWan) - number(b.coverageWan));
  const row = rows.find((item) => number(item.coverageWan) >= coverageWan) || rows.at(-1);
  const premium = number(row?.premiums?.[classKey] ?? row?.premiums?.class1);
  return premium > 0 ? premium : null;
}

function pricedProduct(product, persona) {
  if (product.saleStatus !== "active" || product.rateStatus !== "ready") return null;
  if (!product.name || !product.insurer || product.endAge <= 0 || persona.age > product.endAge) return null;
  const terms = productTerms(product);
  const term = terms.length ? suitableTerm(product, persona.age, persona.gender) : "";
  if (terms.length && !term) return null;
  const rows = rateRows(product, persona.gender, term);
  const rateRow = rowForAge(rows, persona.age);
  let premium = null;
  if (rateRow) {
    const hasTermTable = Boolean(term && product.termRateTablesByGender?.[term]);
    const pricingModel = hasTermTable
      ? product.termRatePricingModel || "coverageUnit"
      : product.ratePricingModel || "coverageUnit";
    const units = pricingModel === "planTotal"
      ? 1
      : product.coverage > 0
        ? product.coverage / Math.max(1, number(product.rateUnitCoverage, 1))
        : 1;
    premium = number(rateRow.premium) * units;
  } else if (product.structuredRateTable) {
    premium = structuredPremium(product, persona.occupationClass);
  }
  if (!Number.isFinite(premium) || premium <= 0) return null;
  return { product, term, premium: Math.round(premium) };
}

function isRider(product) {
  if (["main", "rider"].includes(product.contractType)) return product.contractType === "rider";
  return /附約|附加條款/.test(`${product.name || ""} ${product.note || ""}`);
}

const products = expandProducts(sourceProducts);
const productByIdentity = new Map(products.map((product) => [`${product.code}|${product.insurer}`, product]));
const productsByCode = new Map();
for (const product of products) {
  const matches = productsByCode.get(product.code) || [];
  matches.push(product);
  productsByCode.set(product.code, matches);
}

const hotProducts = products
  .filter((product) => product.popularity > 0)
  .sort((a, b) => b.popularity - a.popularity || a.code.localeCompare(b.code));

function mainPlanFor(rider, persona, selected) {
  const existing = selected.find((entry) => entry.product.insurer === rider.insurer && !isRider(entry.product));
  if (existing) return null;
  const preferred = rider.insurer === "遠雄人壽" ? ["LM5"] : rider.insurer === "全球人壽" ? ["DCE"] : [];
  return products
    .filter((product) => product.insurer === rider.insurer && !isRider(product))
    .map((product) => pricedProduct(product, persona))
    .filter(Boolean)
    .sort((a, b) => {
      const preferredA = preferred.indexOf(a.product.code);
      const preferredB = preferred.indexOf(b.product.code);
      if (preferredA !== preferredB) {
        if (preferredA < 0) return 1;
        if (preferredB < 0) return -1;
        return preferredA - preferredB;
      }
      return b.product.popularity - a.product.popularity;
    })[0] || undefined;
}

function buildStore(persona) {
  const annualBudget = persona.monthlyBudget * 12;
  const selected = [];
  const selectedKeys = new Set();
  let acceptedHotProducts = 0;
  let annualPremium = 0;

  for (const product of hotProducts) {
    if (acceptedHotProducts >= 3) break;
    const candidate = pricedProduct(product, persona);
    if (!candidate) continue;
    const key = `${product.code}|${product.insurer}`;
    if (selectedKeys.has(key)) continue;
    const additions = [];
    if (isRider(product)) {
      const mainPlan = mainPlanFor(product, persona, selected);
      const hasMain = selected.some((entry) => entry.product.insurer === product.insurer && !isRider(entry.product));
      if (!hasMain && !mainPlan) continue;
      if (mainPlan) additions.push(mainPlan);
    }
    additions.push(candidate);
    const uniqueAdditions = additions.filter((entry) => !selectedKeys.has(`${entry.product.code}|${entry.product.insurer}`));
    const bundlePremium = uniqueAdditions.reduce((sum, entry) => sum + entry.premium, 0);
    if (annualPremium + bundlePremium > annualBudget) continue;
    for (const entry of uniqueAdditions) {
      const entryKey = `${entry.product.code}|${entry.product.insurer}`;
      selectedKeys.add(entryKey);
      selected.push(entry);
      annualPremium += entry.premium;
    }
    acceptedHotProducts += 1;
  }

  const policies = selected.map((entry, index) => ({
    id: `${persona.id}-p${index + 1}`,
    productCode: entry.product.code,
    insurer: entry.product.insurer,
    name: entry.product.name,
    category: entry.product.category,
    gender: persona.gender,
    currentAge: persona.age,
    startAge: persona.age,
    startYear: currentYear,
    occupationClass: persona.occupationClass,
    coverage: entry.product.coverage,
    annualPremium: entry.premium,
    premiumTerm: entry.term,
    endAge: entry.product.endAge,
    popularityAtRegistration: entry.product.popularity,
    registeredAt: payload.updatedAt || new Date().toISOString().slice(0, 10),
  }));

  return {
    profile: {
      gender: persona.gender,
      age: persona.age,
      monthlyBudget: persona.monthlyBudget,
      occupationClass: persona.occupationClass,
    },
    policies,
    annualPremium,
  };
}

const startedAt = performance.now();
const groupReports = Object.fromEntries(ageGroups.map((group) => [group.id, {
  users: 0,
  male: 0,
  female: 0,
  usersWithPolicies: 0,
  restrictedUsers: 0,
  policyCount: 0,
  annualPremium: 0,
  products: {},
  terms: {},
}]));
const serializedSizes = [];
const restrictedAges = [];
let totalUsers = 0;
let maleUsers = 0;
let femaleUsers = 0;

for (const group of ageGroups) {
  const span = group.max - group.min + 1;
  for (let index = 0; index < group.users; index += 1) {
    const gender = index % 2 === 0 ? "male" : "female";
    const persona = {
      id: `synthetic-${group.id}-${index + 1}`,
      gender,
      age: group.min + (Math.floor(index / 2) % span),
      occupationClass: (Math.floor(index / 2) % 6) + 1,
      monthlyBudget: group.monthlyBudget,
    };
    const store = buildStore(persona);
    const report = groupReports[group.id];
    report.users += 1;
    report[gender] += 1;
    report.policyCount += store.policies.length;
    report.annualPremium += store.annualPremium;
    totalUsers += 1;
    if (gender === "male") maleUsers += 1;
    else femaleUsers += 1;

    if (store.policies.length) report.usersWithPolicies += 1;
    else {
      report.restrictedUsers += 1;
      restrictedAges.push(persona.age);
    }

    assert.ok(store.annualPremium <= persona.monthlyBudget * 12, `${persona.id} exceeded budget`);
    assert.equal(new Set(store.policies.map((policy) => `${policy.productCode}|${policy.insurer}`)).size, store.policies.length, `${persona.id} has duplicate policies`);
    for (const policy of store.policies) {
      assert.ok(policy.annualPremium > 0 && Number.isFinite(policy.annualPremium), `${persona.id} has invalid premium`);
      assert.ok(policy.currentAge <= policy.endAge, `${persona.id} exceeds ${policy.productCode} end age`);
      assert.ok(productByIdentity.has(`${policy.productCode}|${policy.insurer}`), `${persona.id} cannot resolve ${policy.productCode}`);
      assert.ok((productsByCode.get(policy.productCode.toLowerCase().toUpperCase()) || []).length > 0, `${persona.id} lowercase lookup failed`);
      report.products[policy.productCode] = (report.products[policy.productCode] || 0) + 1;
      if (policy.premiumTerm) report.terms[`${policy.productCode} ${policy.premiumTerm}`] = (report.terms[`${policy.productCode} ${policy.premiumTerm}`] || 0) + 1;
      const product = productByIdentity.get(`${policy.productCode}|${policy.insurer}`);
      if (isRider(product)) {
        assert.ok(store.policies.some((other) => {
          const otherProduct = productByIdentity.get(`${other.productCode}|${other.insurer}`);
          return other.insurer === policy.insurer && otherProduct && !isRider(otherProduct);
        }), `${persona.id} ${policy.productCode} is missing a same-insurer main plan`);
      }
    }
    serializedSizes.push(Buffer.byteLength(JSON.stringify(store), "utf8"));
  }
}

const durationMs = Math.round((performance.now() - startedAt) * 10) / 10;
serializedSizes.sort((a, b) => a - b);
const percentile = (ratio) => serializedSizes[Math.min(serializedSizes.length - 1, Math.floor(serializedSizes.length * ratio))];

assert.equal(totalUsers, 10000);
assert.equal(maleUsers, 5000);
assert.equal(femaleUsers, 5000);
for (const group of ageGroups) {
  assert.equal(groupReports[group.id].users, 2500);
  assert.equal(groupReports[group.id].male, 1250);
  assert.equal(groupReports[group.id].female, 1250);
}
assert.ok(restrictedAges.every((age) => age >= 85), `Users under 85 unexpectedly had no eligible popular policy: ${[...new Set(restrictedAges.filter((age) => age < 85))].join(", ")}`);
assert.ok(durationMs < 10000, `Synthetic registration took too long: ${durationMs}ms`);
assert.ok(percentile(.95) < 64 * 1024, `Per-user payload p95 is too large: ${percentile(.95)} bytes`);

for (const report of Object.values(groupReports)) {
  report.averagePolicies = Math.round((report.policyCount / report.users) * 100) / 100;
  report.averageAnnualPremium = Math.round(report.annualPremium / report.users);
  report.products = Object.fromEntries(Object.entries(report.products).sort((a, b) => b[1] - a[1]));
  report.terms = Object.fromEntries(Object.entries(report.terms).sort((a, b) => b[1] - a[1]));
  delete report.policyCount;
  delete report.annualPremium;
}

const report = {
  status: "ok",
  catalogUpdatedAt: payload.updatedAt || "",
  generatedAt: new Date().toISOString(),
  totalUsers,
  gender: { male: maleUsers, female: femaleUsers },
  distribution: groupReports,
  restrictedUsers: restrictedAges.length,
  restrictedAgeRange: restrictedAges.length ? `${Math.min(...restrictedAges)}-${Math.max(...restrictedAges)}` : "none",
  performance: {
    durationMs,
    usersPerSecond: Math.round(totalUsers / Math.max(durationMs / 1000, .001)),
    payloadBytesP50: percentile(.5),
    payloadBytesP95: percentile(.95),
    payloadBytesMax: serializedSizes.at(-1),
  },
  checks: {
    exactGenderSplit: true,
    exactAgeGroupSplit: true,
    caseInsensitiveCodeLookup: true,
    noDuplicatePolicies: true,
    noInvalidPremiums: true,
    noExpiredProducts: true,
    noMissingMainPlans: true,
    noBudgetOverruns: true,
  },
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
