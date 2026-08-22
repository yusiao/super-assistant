import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const appPath = resolve(root, "output/insurance-planner/app.js");
const indexPath = resolve(root, "output/insurance-planner/index.html");
const swPath = resolve(root, "output/insurance-planner/sw.js");
const productsPath = resolve(root, "output/insurance-planner/products.json");
const workerPath = resolve(root, "output/insurance-planner/_worker.js");
const workflowPath = resolve(root, ".github/workflows/update-insurance-products.yml");

const [app, index, sw, productPayload, worker, workflow] = await Promise.all([
  readFile(appPath, "utf8"),
  readFile(indexPath, "utf8"),
  readFile(swPath, "utf8"),
  readFile(productsPath, "utf8").then(JSON.parse),
  readFile(workerPath, "utf8"),
  readFile(workflowPath, "utf8"),
]);

new Function(app);
assert.match(index, /id="cancerHistoryDetails"[^>]*hidden/);
assert.match(index, /src="app-v45\.js"/);
assert.match(sw, /jarvis-insurance-planner-v45/);
assert.match(sw, /app-v45\.js/);
assert.match(index, /id="accountPrivacyConsent"/);
assert.match(index, /id="accountDeleteForm"/);
assert.match(worker, /const PASSWORD_ITERATIONS = 600_000/);
assert.match(worker, /error: "sync_conflict"/);
assert.match(worker, /pathname === "\/api\/account"/);
assert.match(workflow, /test-insurance-planner-10000\.mjs/);
assert.match(workflow, /if: github\.event_name == 'workflow_dispatch'/);
assert.match(workflow, /check-insurance-catalog-alerts\.mjs/);
assert.match(app, /今年保費<\/dt><dd>\$\{moneyExact\(currentPremium \|\| 0\)\}/);
assert.match(app, /if \(\$\("#productCode"\)\?\.value\.trim\(\)\) renderRatePreview\(\{ updatePremium: true \}\)/);

function functionSource(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Missing function ${name}`);
  const next = app.indexOf("\nfunction ", start + 10);
  return app.slice(start, next < 0 ? app.length : next);
}

const meaningfulRecommendationImpact = new Function(
  `${functionSource("meaningfulRecommendationImpact")}; return meaningfulRecommendationImpact;`,
)();
assert.equal(meaningfulRecommendationImpact({ category: "life", gap: 17_100_000 }, 100_000), false);
assert.equal(meaningfulRecommendationImpact({ category: "critical", gap: 2_700_000 }, 200_000), true);

const recommendationRelevance = new Function(
  `${functionSource("recommendationRelevance")}; return recommendationRelevance;`,
)();
assert.equal(recommendationRelevance({ name: "真實在傷害醫療保險附約", note: "意外實支", category: "medical" }, "medical"), 0);

const toNumber = new Function(`${functionSource("toNumber")}; return toNumber;`)();
assert.equal(toNumber("", 100), 100);
assert.equal(toNumber("  ", 85), 85);

const mergeAccountStores = new Function(`
  const defaultProfile = { age: 35, monthlyBudget: 10000 };
  const defaultCancerCase = { hasHistory: "no" };
  const normalizeProductCode = (value) => String(value || "").trim().toUpperCase();
  const normalizedStoredData = (parsed = {}) => ({
    profile: { ...defaultProfile, ...(parsed.profile || {}) },
    policies: Array.isArray(parsed.policies) ? parsed.policies : [],
    insuredPeople: Array.isArray(parsed.insuredPeople) ? parsed.insuredPeople : [],
    lastPolicyOwner: parsed.lastPolicyOwner || "self",
    cancerCase: { ...defaultCancerCase, ...(parsed.cancerCase || {}) },
    productCatalog: Array.isArray(parsed.productCatalog) ? parsed.productCatalog : [],
  });
  ${functionSource("sameStoredValue")}
  ${functionSource("mergeRecord")}
  ${functionSource("mergeStoredCollection")}
  ${functionSource("mergeAccountStores")}
  return mergeAccountStores;
`)();
const mergeBase = {
  profile: { age: 35, monthlyBudget: 10000 },
  policies: [{ id: "p1", annualPremium: 1000 }],
  insuredPeople: [],
  cancerCase: { hasHistory: "no" },
  productCatalog: [],
};
const mergedDevices = mergeAccountStores(
  mergeBase,
  { ...mergeBase, policies: [{ id: "p1", annualPremium: 1000 }, { id: "p-local", annualPremium: 2000 }] },
  { ...mergeBase, profile: { age: 36, monthlyBudget: 10000 }, policies: [{ id: "p1", annualPremium: 1000 }, { id: "p-remote", annualPremium: 3000 }] },
);
assert.deepEqual(mergedDevices.data.policies.map((policy) => policy.id), ["p1", "p-local", "p-remote"]);
assert.equal(mergedDevices.data.profile.age, 36);
assert.equal(mergedDevices.conflicts, 0);
const sameFieldConflict = mergeAccountStores(
  mergeBase,
  { ...mergeBase, policies: [{ id: "p1", annualPremium: 1200 }] },
  { ...mergeBase, policies: [{ id: "p1", annualPremium: 1400 }] },
);
assert.equal(sameFieldConflict.data.policies[0].annualPremium, 1200);
assert.equal(sameFieldConflict.conflicts, 1);

const rateRowForAge = new Function(`
  const rows = [{ age: 0, premium: 100 }, { age: 45, premium: 200 }];
  const rateTableForGender = () => rows;
  const rateTableAgeBounds = () => ({ min: 0, max: 45 });
  ${functionSource("rateRowForAge")}
  return rateRowForAge;
`)();
assert.equal(rateRowForAge({}, 66, "male"), null);
assert.deepEqual(rateRowForAge({}, 40, "male"), { age: 0, premium: 100 });

const suitablePremiumTerm = new Function(`
  const termYears = (value) => Number(String(value).match(/\\d+/)?.[0] || 0);
  const productPremiumTerms = (product) => Object.keys(product.maxAgeByTerm);
  const matchedPremiumTerm = (product, value) => productPremiumTerms(product).find((term) => term === value) || "";
  const rateTableSupportsAge = (product, age, gender, term) => age <= product.maxAgeByTerm[term];
  ${functionSource("suitablePremiumTerm")}
  return suitablePremiumTerm;
`)();
const dceTerms = { maxAgeByTerm: { "10年期": 65, "15年期": 60, "20年期": 55, "25年期": 50, "30年期": 45 } };
const lm5Terms = { maxAgeByTerm: { "6年期": 84, "10年期": 75, "15年期": 68, "20年期": 63 } };
assert.equal(suitablePremiumTerm(dceTerms, 61, "male", "30年期"), "10年期");
assert.equal(suitablePremiumTerm(dceTerms, 46, "female", "30年期"), "25年期");
assert.equal(suitablePremiumTerm(lm5Terms, 70, "male", "20年期"), "10年期");
assert.equal(suitablePremiumTerm(lm5Terms, 85, "female", "20年期"), "");

const premiumFromStructuredRateTable = new Function(`
  const policyCurrentAge = (policy) => policy.currentAge;
  const toNumber = (value, fallback = 0) => value == null || value === "" ? fallback : Number(value);
  const policyOccupationClass = () => 1;
  ${functionSource("premiumFromStructuredRateTable")}
  return premiumFromStructuredRateTable;
`)();
const structuredProduct = {
  endAge: 75,
  structuredRateTable: {
    kind: "unitOccupation",
    rows: [{ coverageWan: 1, premiums: { class1: 7.3 } }],
  },
};
assert.equal(premiumFromStructuredRateTable(structuredProduct, { currentAge: 75, coverage: 1_000_000 }), 730);
assert.equal(premiumFromStructuredRateTable(structuredProduct, { currentAge: 76, coverage: 1_000_000 }), null);

const recommendationPremium = new Function(`
  const store = { profile: { age: 35, gender: "male" } };
  const defaultProfile = { age: 35 };
  const insuredPersonById = () => ({ currentAge: 61, gender: "female", occupationClass: 1 });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const toNumber = (value, fallback = 0) => value == null || value === "" ? fallback : Number(value);
  const normalizedGender = (value) => value === "female" ? "female" : "male";
  const selectedPlanLabel = () => "";
  const matchedPremiumTerm = () => "";
  const productPremiumTerms = () => [];
  const suitablePremiumTerm = () => "";
  const policyOccupationClass = () => 1;
  const currentCalendarYear = () => 2026;
  const termYears = () => 0;
  const hasRateTable = () => false;
  const hasStructuredRateTable = () => false;
  ${functionSource("recommendationPremium")}
  return recommendationPremium;
`)();
assert.equal(recommendationPremium({ annualPremium: 321, coverage: 0, endAge: 85 }, "self"), 321);

const claimBenefitMatches = new Function(
  `const UNKNOWN_BENEFIT_AMOUNT = "待條款解析"; ${functionSource("claimBenefitMatches")}; return claimBenefitMatches;`,
)();
const surgeryScenario = { benefit: /手術|開刀|醫療雜費|處置/, categories: ["medical"] };
const policyWithBroadNote = { category: "medical", name: "醫療附約", note: "包含手術與腫瘤門診" };
assert.equal(claimBenefitMatches(policyWithBroadNote, { item: "出院後腫瘤門診治療", amount: "60,000 元/年", note: "化學治療" }, surgeryScenario), false);
assert.equal(claimBenefitMatches(policyWithBroadNote, { item: "門診手術費", amount: "180,000 元/次", note: "" }, surgeryScenario), true);

const cancerCaseValidation = new Function(`
  const store = { profile: { age: 38 } };
  const defaultProfile = { age: 35 };
  const cancerTypeProfiles = { colorectal: {} };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const normalizePersonAge = (value) => value === "" || value == null ? null : clamp(Math.round(Number(value)), 0, 100);
  ${functionSource("cancerCaseValidation")}
  return cancerCaseValidation;
`)();
assert.match(cancerCaseValidation({ hasHistory: "yes", cancerType: "colorectal", diagnosisAge: 45, treatmentStatus: "remission", yearsSinceTreatment: 0 })[0], /不能大於目前年齡/);
assert.equal(cancerCaseValidation({ hasHistory: "yes", cancerType: "colorectal", diagnosisAge: 30, treatmentStatus: "remission", yearsSinceTreatment: 5 }).length, 0);

const products = productPayload.products || productPayload;
const hnrc = products.find((product) => product.code === "HNRC" && product.insurer === "台灣人壽");
assert.equal(hnrc?.endAge, 85);
assert.equal(Math.max(...(hnrc?.rateTable || []).map((row) => Number(row.age) || 0)), 85);
assert.match(app, /const endAgeKnown = item\.endAgeKnown === true \|\| explicitEndAge > 0 \|\| inferredEndAge > 0/);
const expandedProducts = products.flatMap((product) => [
  product,
  ...(product.alternateProducts || []).map((alternate) => ({ ...product, ...alternate, code: product.code })),
]);
assert.ok(expandedProducts.length >= 4_000, `Expected full Finfo choices, got ${expandedProducts.length}`);
assert.ok(expandedProducts.filter((product) => product.insurer === "安聯人壽").length >= 89);
assert.ok(expandedProducts.filter((product) => Number(product.popularity || 0) === 0).length >= 3_500);

console.log(`insurance planner v45 regression checks passed: ${expandedProducts.length} product choices, ${expandedProducts.filter((product) => product.insurer === "安聯人壽").length} Allianz products`);
