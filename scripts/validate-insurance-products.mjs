import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MIN_INDEX_PRODUCTS = Number(process.env.MIN_FINFO_INDEX_PRODUCTS || 3000);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function productsFrom(relativePath) {
  const payload = readJson(relativePath);
  if (!Array.isArray(payload.products)) throw new Error(`${relativePath} has no products array`);
  return payload.products;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function byCode(products) {
  return new Map(products.map((product) => [String(product.code || "").toUpperCase(), product]));
}

function planKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[（(].*?[）)]/g, "")
    .toUpperCase();
}

function tableForPlan(tables, plan) {
  return Object.entries(tables || {}).find(([label]) => planKey(label) === planKey(plan))?.[1];
}

function premiumAt(rows, age) {
  return Number(rows?.find((row) => Number(row.age) === age)?.premium || 0);
}

function referencePremiumAt(rows, age) {
  if (!Array.isArray(rows) || !rows.length) return 0;
  return Number(
    rows.find((row) => Number(row.age) === age)?.premium
    || rows.find((row) => Number(row.age) > age)?.premium
    || rows.at(-1)?.premium
    || 0,
  );
}

function assertClose(actual, expected, label) {
  assert(Math.abs(actual - expected) < 0.001, `${label}: expected ${expected}, got ${actual}`);
}

function premiumForCoverage(product, rawPremium, coverageWan, pricingModel = product?.ratePricingModel || "coverageUnit") {
  if (pricingModel === "planTotal") return Number(rawPremium) || 0;
  const coverage = Math.max(0, Number(coverageWan) || 0) * 10000;
  const rateUnitCoverage = Math.max(1, Number(product?.rateUnitCoverage) || 1);
  return (Number(rawPremium) || 0) * (coverage > 0 ? coverage / rateUnitCoverage : 1);
}

const indexProducts = productsFrom("data/insurance/products-finfo-index.json");
const detailProducts = productsFrom("data/insurance/products-finfo-feed.json");
const outputProducts = productsFrom("output/insurance-planner/products.json");
const cloudflareProducts = productsFrom("output/insurance-planner-cloudflare/products.json");

assert(indexProducts.length >= MIN_INDEX_PRODUCTS,
  `Finfo index unexpectedly shrank to ${indexProducts.length} products (minimum ${MIN_INDEX_PRODUCTS})`);

for (const [label, products] of [["index", indexProducts], ["detail feed", detailProducts], ["output", outputProducts]]) {
  const codes = products.map((product) => String(product.code || "").toUpperCase()).filter(Boolean);
  assert(codes.length === new Set(codes).size, `${label} contains duplicate product codes`);
}

const outputByCode = byCode(outputProducts);
const cloudflareByCode = byCode(cloudflareProducts);
for (const indexed of indexProducts) {
  const code = String(indexed.code || "").toUpperCase();
  assert(outputByCode.has(code), `output is missing indexed product ${code}`);
  assert(cloudflareByCode.has(code), `Cloudflare output is missing indexed product ${code}`);
}

assert(outputProducts.length === cloudflareProducts.length,
  `local and Cloudflare product counts differ (${outputProducts.length} vs ${cloudflareProducts.length})`);

for (const detail of detailProducts) {
  const code = String(detail.code || "").toUpperCase();
  const output = outputByCode.get(code);
  assert(output, `output is missing detailed product ${code}`);
  assert(output.name && output.insurer && output.sourceUrl, `${code} is missing identity or source data`);
  if (detail.rateStatus === "ready") {
    assert(Number(output.rateUnitCoverage) > 0, `${code} has no rate unit coverage`);
    const genderRows = Object.values(output.rateTablesByGender || {})
      .reduce((total, rows) => total + (Array.isArray(rows) ? rows.length : 0), 0);
    const structuredRows = Array.isArray(output.structuredRateTable?.rows)
      ? output.structuredRateTable.rows.length
      : 0;
    assert(genderRows > 0 || structuredRows > 0, `${code} has no usable rate rows`);
  }
}

for (const product of outputProducts) {
  const code = String(product.code || "").toUpperCase();
  const planOptions = Array.isArray(product.planOptions) ? product.planOptions.filter(Boolean) : [];
  const planBenefitTables = product.planBenefitTables || {};
  const planRateTables = product.planRateTablesByGender || {};
  if (planOptions.length > 1 && Object.keys(planBenefitTables).length) {
    for (const plan of planOptions) {
      assert(Array.isArray(tableForPlan(planBenefitTables, plan)) && tableForPlan(planBenefitTables, plan).length,
        `${code} is missing benefit rows for ${plan}`);
    }
  }
  if (planOptions.length > 1 && Object.keys(planRateTables).length) {
    for (const plan of planOptions) {
      const tables = tableForPlan(planRateTables, plan);
      assert(tables && Object.values(tables).some((rows) => Array.isArray(rows) && rows.length),
        `${code} is missing rate rows for ${plan}`);
    }
  }
  const comesFromFinfoPremiumApi = String(product.premiumChange || "").includes("Finfo 公開 premiums API");
  if (comesFromFinfoPremiumApi) {
    assert(product.ratePricingModel === "planTotal", `${code} Finfo plan premium is missing planTotal pricing semantics`);
  }
  if (product.ratePricingModel !== "planTotal") continue;

  const rows = product.rateTablesByGender?.male?.length
    ? product.rateTablesByGender.male
    : Object.values(product.rateTablesByGender || {}).find((table) => Array.isArray(table) && table.length) || [];
  assert(rows.length > 0, `${code} planTotal product has no rate rows`);
  const coverage = Number(product.coverageWan || 0) * 10000;
  if (coverage > 0) {
    assertClose(Number(product.rateUnitCoverage), coverage, `${code} planTotal reference coverage`);
  }
  const expectedAnnualPremium = referencePremiumAt(rows, 35);
  assert(expectedAnnualPremium > 0, `${code} planTotal product has no reference premium`);
  assertClose(Number(product.annualPremium), expectedAnnualPremium, `${code} planTotal annual premium`);
  assertClose(Number(product.premiumBands?.[0]?.premium), Number(rows[0]?.premium), `${code} first premium band`);
}

const dce = outputByCode.get("DCE");
assert(dce?.insurer === "全球人壽", "DCE did not resolve to the current Global Life product");
assert(dce?.availableTerms?.length === 5, "DCE should expose five premium terms");
assertClose(premiumAt(dce?.termRateTablesByGender?.["20年期"]?.male, 35), 378, "DCE male age 35 20-year rate");
assertClose(premiumAt(dce?.termRateTablesByGender?.["30年期"]?.male, 35), 306, "DCE male age 35 rate");
assert(Number(dce?.annualPremium) === 6120, `DCE annual premium should be 6120, got ${dce?.annualPremium}`);

const t08f0 = outputByCode.get("T08F0");
assert(t08f0?.insurer === "台灣人壽", "T08F0 insurer mismatch");
assert(t08f0?.endAge === 110 && t08f0?.premiumTermYears === 20, "T08F0 lifetime or premium term mismatch");
assert(t08f0?.availableTerms?.length === 3, "T08F0 should expose three premium terms");
assertClose(premiumAt(t08f0?.termRateTablesByGender?.["20年期"]?.male, 35), 32.6, "T08F0 male age 35 rate");
assert(Number(t08f0?.annualPremium) === 3260, `T08F0 annual premium should be 3260, got ${t08f0?.annualPremium}`);

const otl1 = outputByCode.get("OTL1");
assert(otl1?.insurer === "台灣人壽", "OTL1 insurer mismatch");
assert(otl1?.rateBasis === "attainedAge", "OTL1 should price by attained age");
assert(otl1?.rateTablesByGender?.male?.length >= 80, "OTL1 male rate table is incomplete");
assertClose(premiumAt(otl1?.rateTablesByGender?.male, 35), 18.8, "OTL1 male age 35 rate");
assertClose(premiumAt(otl1?.rateTablesByGender?.male, 45), 42, "OTL1 male age 45 rate");
assert(Number(otl1?.annualPremium) === 1880, `OTL1 annual premium should be 1880, got ${otl1?.annualPremium}`);

const xhb = outputByCode.get("XHB");
assert(xhb?.insurer === "全球人壽", "XHB insurer mismatch");
assert(xhb?.ratePricingModel === "planTotal", "XHB should use the selected plan's total premium");
assert(Number(xhb?.rateUnitCoverage) === 200000, `XHB selected plan coverage should be 200000, got ${xhb?.rateUnitCoverage}`);
assertClose(premiumAt(xhb?.rateTablesByGender?.male, 35), 4705, "XHB male age 35 premium");
assertClose(premiumAt(xhb?.rateTablesByGender?.female, 35), 6140, "XHB female age 35 premium");
assertClose(Number(xhb?.annualPremium), 4705, "XHB annual premium");
assertClose(premiumForCoverage(xhb, 4705, 20), 4705, "XHB selected plan premium");
assertClose(premiumForCoverage(xhb, 4705, 100), 4705, "XHB plan premium must not be rescaled by coverage");
assert(xhb?.saleStatus === "discontinued", `XHB should be discontinued, got ${xhb?.saleStatus}`);

const xcd = outputByCode.get("XCD");
assert(xcd?.insurer === "遠雄人壽", "XCD insurer mismatch");
assert(xcd?.ratePricingModel === "planTotal", "XCD should use the selected plan's total premium");
assert(Number(xcd?.rateUnitCoverage) === 60000, `XCD selected plan coverage should be 60000, got ${xcd?.rateUnitCoverage}`);
assertClose(premiumAt(xcd?.rateTablesByGender?.male, 35), 2760, "XCD male age 35 premium");
assertClose(premiumAt(xcd?.rateTablesByGender?.female, 35), 6258, "XCD female age 35 premium");
assertClose(Number(xcd?.annualPremium), 2760, "XCD annual premium");
assertClose(premiumForCoverage(xcd, 2760, 6), 2760, "XCD selected plan premium");
assertClose(premiumForCoverage(xcd, 2760, 100), 2760, "XCD plan premium must not be rescaled by coverage");
assert(xcd?.saleStatus === "active", `XCD should be active, got ${xcd?.saleStatus}`);

const hnrc = outputByCode.get("HNRC");
assert(hnrc?.insurer === "台灣人壽", "HNRC insurer mismatch");
assert(hnrc?.planName === "計劃三 (雜費15萬)", `HNRC planName mismatch: ${hnrc?.planName}`);
assert(hnrc?.coverageLabel === "計劃三 (雜費15萬)", `HNRC coverageLabel mismatch: ${hnrc?.coverageLabel}`);
assert(hnrc?.ratePricingModel === "planTotal", "HNRC should use the selected plan's total premium");
assert(Number(hnrc?.annualPremium) === 5657, `HNRC annual premium should be 5657, got ${hnrc?.annualPremium}`);
assert(Array.isArray(hnrc?.planOptions) && hnrc.planOptions.length === 5, `HNRC should expose 5 plan options, got ${hnrc?.planOptions?.length}`);
assert(Object.keys(hnrc?.planRateTablesByGender || {}).length === 5, "HNRC should expose rates for all 5 plans");
const hnrcPlan2Label = hnrc.planOptions.find((plan) => planKey(plan) === "計劃二");
const hnrcPlan2 = tableForPlan(hnrc?.planBenefitTables, hnrcPlan2Label) || [];
const hnrcPlan2Rates = tableForPlan(hnrc?.planRateTablesByGender, hnrcPlan2Label)?.male || [];
assert(hnrcPlan2.some((item) => item.item === "住院醫療雜費" && item.amount === "120,000 元/次"), "HNRC plan 2 should expose 120,000 medical expense benefit");
assertClose(premiumAt(hnrcPlan2Rates, 14), 2954, "HNRC plan 2 male age 14 premium");
assertClose(premiumAt(hnrcPlan2Rates, 34), 3667, "HNRC plan 2 male age 34 premium");
assertClose(premiumAt(hnrcPlan2Rates, 35), 4463, "HNRC plan 2 male age 35 premium");
const hnrcPlan3 = hnrc?.planBenefitTables?.["計劃三 (雜費15萬)"] || [];
assert(hnrcPlan3.some((item) => item.item === "每日病房費" && item.amount === "2,000 元/日"), "HNRC plan 3 should expose daily room benefit");
assert(hnrcPlan3.some((item) => item.item === "住院醫療雜費" && item.amount === "150,000 元/次"), "HNRC plan 3 should expose medical expense benefit amount");
assert(hnrcPlan3.some((item) => item.item === "外科／門診手術費" && item.amount === "最高 200,000 元/次"), "HNRC plan 3 should expose surgery benefit amount");
assert(hnrcPlan3.some((item) => item.item === "出院後腫瘤門診治療" && item.amount === "80,000 元/年"), "HNRC plan 3 should expose tumor outpatient benefit amount");
assert(hnrcPlan3.some((item) => item.item === "住院前後門診" && item.amount === "1,200 元/次"), "HNRC plan 3 should expose outpatient benefit amount");
assert(!JSON.stringify(hnrc?.benefits || []).match(/依方案限額|依條款限額/), "HNRC benefits must not use vague amount labels");

const hnrd = outputByCode.get("HNRD");
assert(hnrd?.insurer === "台灣人壽", "HNRD insurer mismatch");
assert(hnrd?.planName === "計劃三", `HNRD planName should be 計劃三, got ${hnrd?.planName}`);
assert(hnrd?.coverageLabel === "計劃三", `HNRD coverageLabel mismatch: ${hnrd?.coverageLabel}`);
assert(hnrd?.ratePricingModel === "planTotal", "HNRD should use the selected plan's total premium");
assert(Number(hnrd?.annualPremium) === 2721, `HNRD annual premium should be 2721, got ${hnrd?.annualPremium}`);
assert(Array.isArray(hnrd?.planOptions) && hnrd.planOptions.length === 5, `HNRD should expose 5 plan options, got ${hnrd?.planOptions?.length}`);
assert(Object.keys(hnrd?.planBenefitTables || {}).length === 5, "HNRD should expose benefits for all 5 plans");
assert(Object.keys(hnrd?.planRateTablesByGender || {}).length === 5, "HNRD should expose rates for all 5 plans");
const hnrdPlan2 = tableForPlan(hnrd?.planBenefitTables, "計劃二") || [];
const hnrdPlan2Rates = tableForPlan(hnrd?.planRateTablesByGender, "計劃二")?.male || [];
assert(hnrdPlan2.length === 6, `HNRD plan 2 should expose 6 benefit rows, got ${hnrdPlan2.length}`);
assert(hnrdPlan2.some((item) => item.item === "住院醫療雜費" && item.amount === "90,000 元/次" && item.note.includes("210,000 元/次")), "HNRD plan 2 should add 90,000 medical expense and show the 210,000 combined limit");
assertClose(premiumAt(hnrdPlan2Rates, 14), 1689, "HNRD plan 2 male age 14 premium");
assertClose(premiumAt(hnrdPlan2Rates, 34), 2060, "HNRD plan 2 male age 34 premium");
assertClose(premiumAt(hnrdPlan2Rates, 35), 2531, "HNRD plan 2 male age 35 premium");
assert(hnrd?.contractType === "rider", "HNRD should be marked as a rider");
assert((hnrd?.purchaseRequirements || []).some((item) => item.code === "HNRC" && item.timing === "sameTime"), "HNRD should record HNRC as a same-time purchase requirement");
assert((hnrd?.benefits || []).some((item) => item.item === "每日病房費" && item.amount === "1,000 元/日"), "HNRD should expose daily room benefit");
assert((hnrd?.benefits || []).some((item) => item.item === "住院醫療雜費" && item.amount === "90,000 元/次"), "HNRD should expose medical expense benefit amount");
assert(!(hnrd?.benefits || []).some((item) => item.item === "加護病房"), "HNRD should not invent a standalone ICU row absent from the formal limit table");
assert(!JSON.stringify(hnrd?.benefits || []).match(/計劃三|依方案限額|依條款限額/), "HNRD benefits must not use vague amount labels");

assertClose(premiumForCoverage(dce, 306, 20), 6120, "DCE coverage-unit pricing remains intact");
assert(dce?.saleStatus === "active", `DCE should be active, got ${dce?.saleStatus}`);

console.log(JSON.stringify({
  status: "ok",
  indexedProducts: indexProducts.length,
  detailedProducts: detailProducts.length,
  publishedProducts: outputProducts.length,
  regressionCodes: ["DCE", "T08F0", "OTL1", "XHB", "XCD", "HNRC", "HNRD"],
}, null, 2));
