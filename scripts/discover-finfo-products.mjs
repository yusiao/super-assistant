import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = resolve(root, "data/insurance");
const seedsPath = resolve(dataDir, "finfo-code-seeds.json");
const indexPath = resolve(dataDir, "products-finfo-index.json");
const feedPath = resolve(dataDir, "products-finfo-feed.json");
const reportPath = resolve(dataDir, "finfo-discovery-report.json");
const enrichmentStatePath = resolve(dataDir, "finfo-enrichment-state.json");
const pdfExtractorPath = resolve(root, "scripts/extract-finfo-rate-pdf.py");

const FINFO_BASE = "https://finfo.tw";
const USER_AGENT = "JarvisInsurancePlanner/1.0 (+https://jarvis-insurance-planner.pages.dev/)";
const FETCH_TIMEOUT_MS = Number(process.env.FINFO_DISCOVERY_TIMEOUT_MS || 10000);
const DEFAULT_PREMIUM_AGE = Number(process.env.FINFO_DEFAULT_PREMIUM_AGE || 35);
const OPTION_AGES = [DEFAULT_PREMIUM_AGE, 30, 20, 15, 1, 0, 40, 50, 60, 65, 70];
const RATE_GENDERS = ["male", "female"];
const PYTHON_EXECUTABLE = process.env.PYTHON || process.env.PYTHON_EXECUTABLE || "python";
const DETAIL_LIMIT = Math.max(0, Number(process.env.FINFO_DETAIL_LIMIT || 24));

const INSURERS = [
  "全球人壽", "遠雄人壽", "新光人壽", "富邦人壽", "凱基人壽", "國泰人壽", "臺銀人壽",
  "台灣人壽", "南山人壽", "友邦人壽", "三商美邦人壽", "元大人壽", "保誠人壽",
  "安達人壽", "宏泰人壽", "安聯人壽", "第一金人壽", "法國巴黎人壽", "合作金庫人壽",
  "康健人壽", "台新人壽", "郵政簡易人壽", "富邦產物", "新安東京海上產物", "兆豐產物",
  "華南產物", "第一產物", "明台產物", "法國巴黎產物", "中國信託產物", "國泰產物",
  "新光產物", "旺旺友聯產物", "泰安產物", "和泰產物", "臺灣產物", "南山產物",
].sort((a, b) => b.length - a.length);

function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[\s\-_/／]+/g, "");
}

function normalizeSpace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#xff0c;/gi, "，")
    .replace(/&#xff1a;/gi, "：");
}

function stripHtml(value) {
  return normalizeSpace(decodeHtmlEntities(String(value ?? "").replace(/<[^>]+>/g, " ")));
}

function htmlText(value) {
  return stripHtml(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " "),
  );
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.4",
        accept: "text/html,application/json,*/*;q=0.8",
      },
    });
    const body = await response.text();
    return { ok: response.ok, status: response.status, body, url: response.url };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const response = await fetchText(url);
  if (!response.ok) throw new Error(`Finfo request failed: ${response.status}`);
  return JSON.parse(response.body);
}

async function fetchBuffer(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.4",
        accept: "application/pdf,application/octet-stream,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`download failed: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

function googleDriveFileId(url) {
  const text = String(url || "");
  return text.match(/\/file\/d\/([^/?#]+)/)?.[1]
    || text.match(/[?&]id=([^&#]+)/)?.[1]
    || "";
}

function directGoogleDriveDownloadUrl(url) {
  const id = googleDriveFileId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}` : "";
}

function productLinksFromHtml(html) {
  const links = [];
  for (const match of html.matchAll(/href="([^"]*\/products\/[^"#?]+)"/g)) {
    try {
      const url = new URL(match[1], FINFO_BASE);
      const parts = decodeURIComponent(url.pathname).split("/").filter(Boolean);
      if (parts[0] !== "products" || !parts[1] || parts[1] === "new") continue;
      links.push(url.toString());
    } catch {
      // Ignore malformed relative links.
    }
  }
  return [...new Set(links)];
}

function productSlugFromUrl(url) {
  const parsed = new URL(url, FINFO_BASE);
  return decodeURIComponent(parsed.pathname).split("/").filter(Boolean)[1] || "";
}

function parseProductSlug(url) {
  const slug = productSlugFromUrl(url);
  const match = slug.match(/^([A-Za-z0-9]+)-(.+)-(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const [, code, fullName, effectiveDate] = match;
  const insurer = INSURERS.find((name) => fullName.startsWith(name)) || "";
  const name = insurer ? fullName.slice(insurer.length) : fullName;
  return {
    slug,
    code: normalizeCode(code),
    fullName,
    insurer,
    name: normalizeSpace(name),
    effectiveDate,
  };
}

function categoryFromName(value) {
  const text = String(value ?? "");
  if (/重大傷病|重大疾病|特定傷病|癌|防癌/.test(text)) return "critical";
  if (/醫療|住院|手術|實支|健康/.test(text)) return "medical";
  if (/傷害|意外|失能/.test(text)) return "accident";
  if (/長期照顧|長照|照護/.test(text)) return "longcare";
  if (/年金|利率變動|還本|增額|美元|外幣|分紅/.test(text)) return "savings";
  if (/壽險|定期保險|終身保險/.test(text)) return "life";
  return "medical";
}

function isAgeRatedProduct(value) {
  return /年齡|級距|自然費率|隨年齡|定期|一年期|一年定期|[0-9０-９]+年期|歲滿期|續保年齡/.test(String(value ?? ""));
}

function numberFromText(value) {
  const match = String(value ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function parsePopularity(text) {
  const match = text.match(/過去一個月有\s*([\d,]+)\s*人加入試算表/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function parseEndAge({ html, text, options }) {
  if (/保障終身/.test(String(options?.period_of_insurance || "")) || /保障終身/.test(text)) return 110;
  const candidates = [];
  const period = String(options?.period_of_insurance || "");
  for (const source of [period, text]) {
    for (const re of [/最高保障至\s*(\d{2,3})\s*歲/, /續保年齡：?可續保至\s*(\d{2,3})\s*歲/, /保障至\s*(\d{2,3})\s*歲/]) {
      const match = source.match(re);
      if (match) candidates.push(Number(match[1]));
    }
  }
  const bracket = html.match(/年齡：[\s\S]{0,80}\[\s*(\d{1,3})\s*-\s*(\d{1,3})\s*\]/);
  if (bracket) candidates.push(Number(bracket[2]));
  if (options?.insurable_age_bound?.max) candidates.push(Number(options.insurable_age_bound.max));
  return Math.max(18, Math.min(110, candidates.find(Boolean) || 100));
}

function parseCoverageWan({ name, options }) {
  const hot = options?.hottest_combination || {};
  if (hot.insured_amount) {
    const amount = Number(hot.insured_amount);
    if (options?.unit === "ten_thousand_dollars") return amount;
    return amount >= 10000 ? Math.round(amount / 10000) : amount;
  }
  const planText = String(hot.plan || options?.plan?.[0] || name || "");
  const wan = planText.match(/(\d+(?:\.\d+)?)\s*萬/);
  if (wan) return numberFromText(wan[1]);
  return 0;
}

function formatWanAmount(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : String(number).replace(/\.0+$/, "");
}

function planNameFromOptions(options) {
  return normalizeSpace(String(options?.hottest_combination?.plan || optionValue(options?.plan) || ""));
}

function coverageLabelFromOptions({ options, coverageWan }) {
  const planName = planNameFromOptions(options);
  if (!planName) return coverageWan > 0 ? `${formatWanAmount(coverageWan)}萬` : "";
  if (coverageWan > 0 && !/萬/.test(planName)) return `${planName} (雜費${formatWanAmount(coverageWan)}萬)`;
  return planName;
}

function formatCurrency(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("zh-TW")} 元`;
}

const HNRC_PLAN_LIMITS = [
  { key: "計劃一", label: "計劃一 (雜費9萬)", room: 1000, medical: 90000, surgery: 160000, tumor: 40000, outpatient: 600, supplement: 2000 },
  { key: "計劃二", label: "計劃二 (雜費12萬)", room: 1500, medical: 120000, surgery: 180000, tumor: 60000, outpatient: 900, supplement: 3000 },
  { key: "計劃三", label: "計劃三 (雜費15萬)", room: 2000, medical: 150000, surgery: 200000, tumor: 80000, outpatient: 1200, supplement: 4000 },
  { key: "計劃四", label: "計劃四 (雜費18萬)", room: 2500, medical: 180000, surgery: 220000, tumor: 100000, outpatient: 1500, supplement: 5000 },
  { key: "計劃五", label: "計劃五 (雜費21萬)", room: 3000, medical: 210000, surgery: 240000, tumor: 120000, outpatient: 1800, supplement: 6000 },
];

const HNRD_PLAN_TOTALS = [
  { key: "計劃一", room: 2000, medical: 180000, surgery: 220000, tumor: 70000, outpatient: 800, supplement: 4000 },
  { key: "計劃二", room: 2500, medical: 210000, surgery: 240000, tumor: 90000, outpatient: 1100, supplement: 5000 },
  { key: "計劃三", room: 3000, medical: 240000, surgery: 260000, tumor: 110000, outpatient: 1400, supplement: 6000 },
  { key: "計劃四", room: 3500, medical: 270000, surgery: 280000, tumor: 130000, outpatient: 1700, supplement: 7000 },
  { key: "計劃五", room: 4000, medical: 300000, surgery: 300000, tumor: 150000, outpatient: 2000, supplement: 8000 },
];

function hnrcBenefits(row) {
  return [
    { item: "每日病房費", amount: `${formatCurrency(row.room)}/日`, note: "一般病房；特殊病房最高 3 倍，特殊病房日數依條款" },
    { item: "住院醫療雜費", amount: `${formatCurrency(row.medical)}/次`, note: "住院 1-30 日；31-60 日 2 倍、61-90 日 3 倍、91-180 日 4 倍、181 日以上 5 倍" },
    { item: "外科／門診手術費", amount: `最高 ${formatCurrency(row.surgery)}/次`, note: "依手術表比例核付；同一次住院合計上限同本限額" },
    { item: "出院後腫瘤門診治療", amount: `${formatCurrency(row.tumor)}/年`, note: "放射線或化學治療依附表比例；年度合計上限" },
    { item: "住院前後門診", amount: `${formatCurrency(row.outpatient)}/次`, note: "住院或門診手術前 7 日、後 14 日內同一事故門診" },
    { item: "補充保險金", amount: `${formatCurrency(row.supplement)}/次`, note: "實際自付任一項超過該項限額時，依條款補足差額，上限為本限額" },
  ];
}

function hnrdBenefits(total, deductible) {
  const note = (deductibleAmount, totalAmount, unit) => `自負額 ${formatCurrency(deductibleAmount)}${unit}；搭配 HNRC 同計畫後總限額 ${formatCurrency(totalAmount)}${unit}`;
  return [
    { item: "每日病房費", amount: "1,000 元/日", note: note(deductible.room, total.room, "/日") },
    { item: "住院醫療雜費", amount: "90,000 元/次", note: note(deductible.medical, total.medical, "/次") },
    { item: "外科／門診手術費", amount: "最高 60,000 元/次", note: note(deductible.surgery, total.surgery, "/次") },
    { item: "出院後腫瘤門診治療", amount: "30,000 元/年", note: note(deductible.tumor, total.tumor, "/年") },
    { item: "住院前後門診", amount: "200 元/次", note: note(deductible.outpatient, total.outpatient, "/次") },
    { item: "補充保險金", amount: "2,000 元/次", note: note(deductible.supplement, total.supplement, "/次") },
  ];
}

function knownPlanBenefitTables(code, planOptions = []) {
  const normalizedCode = normalizeCode(code);
  const options = optionArray(planOptions);
  if (normalizedCode === "HNRC") {
    return Object.fromEntries(HNRC_PLAN_LIMITS.map((row) => {
      const label = options.find((plan) => planLabelMatches(plan, row.key)) || row.label;
      return [label, hnrcBenefits(row)];
    }));
  }
  if (normalizedCode === "HNRD") {
    return Object.fromEntries(HNRD_PLAN_TOTALS.map((total, index) => {
      const label = options.find((plan) => planLabelMatches(plan, total.key)) || total.key;
      return [label, hnrdBenefits(total, HNRC_PLAN_LIMITS[index])];
    }));
  }
  return {};
}

function benefitsForKnownPlan(code, planLabel, planOptions = []) {
  const tables = knownPlanBenefitTables(code, planOptions);
  const selected = normalizeSpace(planLabel);
  const exact = tables[selected];
  if (exact) return exact;
  const match = Object.entries(tables).find(([plan]) => planLabelMatches(plan, selected));
  return match ? match[1] : [];
}

function knownPurchaseRequirements(code) {
  if (normalizeCode(code) !== "HNRD") return [];
  return [
    {
      type: "requiresProduct",
      code: "HNRC",
      name: "台灣人壽新住院醫療保險附約(85)",
      timing: "sameTime",
      note: "HNRD 須搭配 HNRC 同時購買，是用來加強 HNRC 的保障額度。",
    },
  ];
}

function inferBenefitsFromProduct({ fullName, category, coverageWan, coverageLabel, text }) {
  const sourceText = `${fullName || ""} ${category || ""} ${coverageLabel || ""} ${text || ""}`;
  const coverageAmount = coverageWan > 0 ? `${formatWanAmount(coverageWan)}萬` : (coverageLabel || "待條款解析");
  const benefits = [];
  const add = (item, amount = "待條款解析", note = "") => {
    if (!item || benefits.some((benefit) => benefit.item === item)) return;
    benefits.push({ item, amount, note });
  };

  const misc = String(coverageLabel || "").match(/雜費\s*(\d+(?:\.\d+)?)\s*萬/);
  if (misc) add("住院醫療雜費", `${misc[1]}萬`, coverageLabel);
  if (/住院|醫療|實支/.test(sourceText)) add("住院醫療", coverageLabel || "待條款解析");
  if (/門診.*(手術|雜費)|手術費與雜費/.test(sourceText)) add("門診手術費／雜費", "待條款解析");
  if (/手術/.test(sourceText)) add("手術醫療", "待條款解析");
  if (/腫瘤門診/.test(sourceText)) add("出院後腫瘤門診治療", "待條款解析");
  if (/重大傷病|重大疾病/.test(sourceText)) add("重大傷病／疾病保險金", coverageAmount);
  if (/癌症|防癌/.test(sourceText)) add("癌症保障", coverageAmount);
  if (/意外|傷害/.test(sourceText)) add("意外身故／失能或醫療", coverageAmount);
  if (/身故|定期壽險|壽險/.test(sourceText)) add("身故／完全失能保險金", coverageAmount);
  if (/長照|長期照顧/.test(sourceText)) add("長期照顧保險金", coverageAmount);
  if (!benefits.length && coverageAmount) add("主要保障", coverageAmount);

  return benefits.slice(0, 6);
}

function extractBenefitText(text) {
  const value = normalizeSpace(text);
  const match = value.match(/理賠項目([\s\S]{0,4000}?)(?:版本紀錄|熱門|相關範本|相關討論|我要發問|保險比較|$)/);
  return match ? normalizeSpace(match[1]) : "";
}

function parseDocuments(html) {
  const docs = {};
  for (const match of html.matchAll(/<a[^>]+href="([^"]*drive\.google[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeHtmlEntities(match[1]);
    const text = stripHtml(match[2]);
    if (/DM/i.test(text)) docs.dm = href;
    else if (/條款/.test(text)) docs.terms = href;
    else if (/費率/.test(text)) docs.rates = href;
  }
  return docs;
}

function exactLinksForCode(code, links) {
  const normalized = normalizeCode(code);
  return links
    .map((url) => ({ url, parsed: parseProductSlug(url) }))
    .filter((item) => item.parsed?.code === normalized)
    .map((item) => item.url);
}

function sortProductUrls(urls, preferredProduct = null) {
  const preferredInsurer = String(preferredProduct?.insurer || "");
  const preferredUrl = String(preferredProduct?.sourceUrl || "");
  return [...urls].sort((a, b) => {
    const parsedA = parseProductSlug(a);
    const parsedB = parseProductSlug(b);
    const insurerA = preferredInsurer && parsedA?.insurer === preferredInsurer ? 1 : 0;
    const insurerB = preferredInsurer && parsedB?.insurer === preferredInsurer ? 1 : 0;
    if (insurerA !== insurerB) return insurerB - insurerA;
    const urlA = preferredUrl && a === preferredUrl ? 1 : 0;
    const urlB = preferredUrl && b === preferredUrl ? 1 : 0;
    return urlB - urlA
      || String(parsedB?.effectiveDate || "").localeCompare(String(parsedA?.effectiveDate || ""));
  });
}

async function findProductUrl(code, indexedProduct = null, preferredProduct = null) {
  const indexedUrls = [
    indexedProduct?.sourceUrl,
    ...(indexedProduct?.alternateProducts || []).map((item) => item?.sourceUrl),
  ].filter(Boolean);
  const indexedExact = sortProductUrls(exactLinksForCode(code, indexedUrls), preferredProduct);
  if (indexedExact.length) {
    return {
      searchUrl: indexedProduct?.sourceUrl || indexedExact[0],
      links: indexedUrls,
      exact: indexedExact,
      selectedUrl: indexedExact[0],
      source: "finfo-sitemap-index",
    };
  }

  const url = `${FINFO_BASE}/products?q%5Bkeyword%5D=${encodeURIComponent(code)}`;
  const response = await fetchText(url);
  if (!response.ok) throw new Error(`Finfo search failed: ${response.status}`);
  const links = productLinksFromHtml(response.body);
  const exact = sortProductUrls(exactLinksForCode(code, links), preferredProduct);
  return {
    searchUrl: url,
    links,
    exact,
    selectedUrl: exact[0] || "",
  };
}

function optionValue(value) {
  if (Array.isArray(value)) return value.find((item) => item != null && item !== "") ?? "";
  return value ?? "";
}

function optionArray(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeSpace(item)).filter(Boolean);
  const text = normalizeSpace(value);
  return text ? [text] : [];
}

function planKey(value) {
  return normalizeSpace(value)
    .replace(/\s+/g, "")
    .replace(/[（(].*?[）)]/g, "")
    .toUpperCase();
}

function planLabelMatches(a, b) {
  const left = normalizeSpace(a);
  const right = normalizeSpace(b);
  return Boolean(left && right && (left === right || planKey(left) === planKey(right)));
}

async function loadProductOptions(slug) {
  const errors = [];
  for (const age of OPTION_AGES) {
    try {
      const url = `${FINFO_BASE}/api/products/${encodeURIComponent(slug)}/product_options?age=${age}&ignore_renewal_limit=true`;
      const options = await fetchJson(url);
      if (options && !options.status) return { age, options };
      errors.push(`${age}: ${options?.message || "empty"}`);
    } catch (error) {
      errors.push(`${age}: ${error.message}`);
    }
  }
  return { age: DEFAULT_PREMIUM_AGE, options: null, errors };
}

async function loadJobs(slug, age) {
  try {
    const payload = await fetchJson(`${FINFO_BASE}/api/products/${encodeURIComponent(slug)}/jobs?age=${age}`);
    return Array.isArray(payload.jobs) ? payload.jobs : [];
  } catch {
    return [];
  }
}

function premiumParams({ age, options, jobs, gender = "male", plan = "" }) {
  const hot = options?.hottest_combination || {};
  const params = new URLSearchParams({ age: String(age), gender });
  const job = jobs.find(Boolean);
  if (job) params.set("job", job);
  const term = hot.term ?? optionValue(options?.term);
  if (term) params.set("term", String(term));
  const selectedPlan = normalizeSpace(plan) || hot.plan || optionValue(options?.plan);
  if (selectedPlan) params.set("plan", String(selectedPlan));
  const insuredAmount = hot.insured_amount ?? optionValue(options?.db);
  if (insuredAmount) params.set("insured_amount", String(insuredAmount));
  const renewal = optionValue(options?.is_renewal);
  if (renewal) params.set("is_renewal", String(renewal));
  return params;
}

async function loadRateTable({ slug, startAge, options, gender = "male", plan = "" }) {
  if (!options) return { rateTable: [], premiumUrl: "", jobs: [], error: "missing product_options" };
  const jobs = await loadJobs(slug, startAge);
  const params = premiumParams({ age: startAge, options, jobs, gender, plan });
  const premiumUrl = `${FINFO_BASE}/api/products/${encodeURIComponent(slug)}/premiums?${params.toString()}`;
  try {
    const payload = await fetchJson(premiumUrl);
    const prices = Array.isArray(payload.price) ? payload.price : [];
    const rateTable = prices
      .slice(1)
      .map((premium, index) => ({ age: startAge + index, premium: Number(premium) || 0 }))
      .filter((row) => row.premium > 0);
    return { rateTable, premiumUrl, jobs, gender };
  } catch (error) {
    return { rateTable: [], premiumUrl, jobs, gender, error: error.message };
  }
}

async function loadPlanRateTablesByGender({ slug, startAge, options, planOptions }) {
  if (!options || planOptions.length <= 1) return {};
  const entries = await Promise.all(planOptions.map(async (plan) => {
    const results = await Promise.all(RATE_GENDERS.map(async (gender) => [
      gender,
      await loadRateTable({ slug, startAge, options, gender, plan }),
    ]));
    const tables = Object.fromEntries(results
      .filter(([, result]) => result.rateTable.length)
      .map(([gender, result]) => [gender, result.rateTable]));
    return [plan, tables];
  }));
  return Object.fromEntries(entries.filter(([, tables]) => Object.keys(tables).length));
}

function premiumAtAge(rateTable, age) {
  return rateTable.find((row) => row.age === age)?.premium
    || rateTable.find((row) => row.age >= age)?.premium
    || rateTable[0]?.premium
    || 0;
}

function saleStatusFromPage(text) {
  const value = String(text || "");
  if (/現售中/.test(value)) return "active";
  if (/停售/.test(value)) return "discontinued";
  return "unknown";
}

function termYears(value) {
  const match = String(value ?? "").match(/(\d{1,2})\s*(?:\u5e74\s*\u671f|\u5e74|year)/i);
  return match ? Number(match[1]) : 0;
}

function normalizeTermLabel(value) {
  const years = termYears(value);
  return years ? `${years}\u5e74\u671f` : "";
}

function sortTermLabels(a, b) {
  return termYears(a) - termYears(b) || String(a).localeCompare(String(b), "zh-Hant");
}

function maxGenderRateRows(tables) {
  return Math.max(0, ...Object.values(tables || {}).map((rows) => Array.isArray(rows) ? rows.length : 0));
}

function maxTermRateRows(termTables) {
  return Math.max(0, ...Object.values(termTables || {}).map(maxGenderRateRows));
}

function chooseTermRateTables(termTables, options) {
  const terms = Object.keys(termTables || {});
  if (!terms.length) return { selectedTerm: "", selectedTables: {} };

  const preferred = [
    normalizeTermLabel(options?.hottest_combination?.term),
    normalizeTermLabel(optionValue(options?.term)),
  ].filter(Boolean);
  const selectedTerm = preferred
    .map((term) => terms.find((candidate) => normalizeTermLabel(candidate) === term))
    .find(Boolean)
    || [...terms].sort(sortTermLabels).at(-1)
    || "";
  return {
    selectedTerm,
    selectedTables: selectedTerm ? termTables[selectedTerm] || {} : {},
  };
}

function premiumWithUnits(premium, coverageWan, rateUnitCoverage, ratePricingModel = "coverageUnit") {
  const base = Number(premium) || 0;
  if (!base) return 0;
  if (ratePricingModel === "planTotal") return base;
  const coverage = Math.max(0, Number(coverageWan) || 0) * 10000;
  const units = coverage > 0 && Number(rateUnitCoverage) > 0
    ? coverage / Number(rateUnitCoverage)
    : 1;
  return base * units;
}

function premiumAtAgeWithUnits(rateTable, age, coverageWan, rateUnitCoverage, ratePricingModel) {
  return premiumWithUnits(premiumAtAge(rateTable, age), coverageWan, rateUnitCoverage, ratePricingModel);
}

function premiumBandsWithUnits(rateTable, coverageWan, rateUnitCoverage, ratePricingModel) {
  return rateTable.slice(0, 12).map((row) => ({
    age: `${row.age}\u6b72`,
    premium: Math.round(premiumWithUnits(row.premium, coverageWan, rateUnitCoverage, ratePricingModel)),
  }));
}

function premiumFromStructuredRateTable(structuredRateTable, coverageWan, occupationClass = 1) {
  if (!structuredRateTable?.rows?.length) return 0;
  const classKey = `class${occupationClass}`;

  if (structuredRateTable.kind === "unitOccupation") {
    const row = structuredRateTable.rows[0];
    const premiumPerWan = Number(row?.premiums?.[classKey] ?? row?.premiums?.class1 ?? 0);
    return premiumPerWan * Math.max(1, Number(coverageWan) || 0);
  }

  if (structuredRateTable.kind === "coverageOccupation") {
    const rows = [...structuredRateTable.rows].sort((a, b) => Number(a.coverageWan) - Number(b.coverageWan));
    const target = Number(coverageWan) || Number(rows[0]?.coverageWan) || 0;
    const row = rows.find((item) => Number(item.coverageWan) >= target) || rows.at(-1);
    return Number(row?.premiums?.[classKey] ?? row?.premiums?.class1 ?? 0);
  }

  return 0;
}

async function extractDriveRateTable({ code, ratesUrl }) {
  const downloadUrl = directGoogleDriveDownloadUrl(ratesUrl);
  if (!downloadUrl || !existsSync(pdfExtractorPath)) return { result: null, error: "" };

  const tempPath = resolve(tmpdir(), `finfo-${code}-${googleDriveFileId(ratesUrl)}.pdf`);
  try {
    const buffer = await fetchBuffer(downloadUrl);
    writeFileSync(tempPath, buffer);
    const output = execFileSync(PYTHON_EXECUTABLE, [pdfExtractorPath, tempPath, "--code", code], {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 5,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    const result = JSON.parse(output);
    return { result, error: "" };
  } catch (error) {
    return { result: null, error: error.message };
  } finally {
    try {
      if (existsSync(tempPath)) unlinkSync(tempPath);
    } catch {
      // Best effort temp cleanup.
    }
  }
}

async function discoverCode(code, indexedProduct = null, preferredProduct = null) {
  const search = await findProductUrl(code, indexedProduct, preferredProduct);
  if (!search.selectedUrl) {
    return { code, found: false, search, product: null, error: "no exact Finfo product link" };
  }

  const parsed = parseProductSlug(search.selectedUrl);
  if (!parsed?.name || !parsed.insurer) {
    return { code, found: false, search, product: null, error: "unable to parse product slug" };
  }

  const page = await fetchText(search.selectedUrl);
  if (!page.ok) {
    return { code, found: false, search, product: null, error: `product page failed: ${page.status}` };
  }

  const text = htmlText(page.body);
  const saleStatus = saleStatusFromPage(text);
  const docs = parseDocuments(page.body);
  const optionResult = await loadProductOptions(parsed.slug);
  const minAge = Number(optionResult.options?.insurable_age_bound?.min ?? optionResult.age ?? DEFAULT_PREMIUM_AGE);
  const maxAge = Number(optionResult.options?.insurable_age_bound?.max ?? DEFAULT_PREMIUM_AGE);
  const startAge = Math.max(0, Math.min(minAge, maxAge || minAge));
  const planOptions = optionArray(optionResult.options?.plan);
  const rateResults = Object.fromEntries(await Promise.all(RATE_GENDERS.map(async (gender) => [
    gender,
    await loadRateTable({ slug: parsed.slug, startAge, options: optionResult.options, gender }),
  ])));
  const rateTablesByGender = Object.fromEntries(Object.entries(rateResults)
    .filter(([, result]) => result.rateTable.length)
    .map(([gender, result]) => [gender, result.rateTable]));
  const planRateTablesByGender = await loadPlanRateTablesByGender({
    slug: parsed.slug,
    startAge,
    options: optionResult.options,
    planOptions,
  });
  const rateResult = rateResults.male?.rateTable.length
    ? rateResults.male
    : Object.values(rateResults).find((result) => result.rateTable.length)
      || { rateTable: [], premiumUrl: "", error: "missing gender rate table" };
  const popularity = parsePopularity(text);
  const endAge = parseEndAge({ html: page.body, text, options: optionResult.options });
  const rateSource = docs.rates || search.selectedUrl;
  const driveRate = docs.rates
    ? await extractDriveRateTable({ code: parsed.code, ratesUrl: docs.rates })
    : { result: null, error: "" };
  const driveTermRateTablesByGender = driveRate.result?.termRateTablesByGender || {};
  const chosenTermRate = chooseTermRateTables(driveTermRateTablesByGender, optionResult.options);
  const driveRateTablesByGender = maxGenderRateRows(chosenTermRate.selectedTables)
    ? chosenTermRate.selectedTables
    : driveRate.result?.rateTablesByGender || {};
  const structuredRateTable = driveRate.result?.structuredRateTable || null;
  const mergedRateTablesByGender = Object.keys(rateTablesByGender).length
    ? rateTablesByGender
    : driveRateTablesByGender;
  const mergedRateTable = rateResult.rateTable.length
    ? rateResult.rateTable
    : (mergedRateTablesByGender.male || Object.values(mergedRateTablesByGender).find((rows) => rows?.length) || []);
  const optionTerms = [
    optionResult.options?.hottest_combination?.term,
    ...(Array.isArray(optionResult.options?.term) ? optionResult.options.term : [optionResult.options?.term]),
  ].map(normalizeTermLabel).filter(Boolean);
  const availableTerms = [...new Set([
    ...Object.keys(driveTermRateTablesByGender),
    ...optionTerms,
  ])].sort(sortTermLabels);
  const premiumTerm = chosenTermRate.selectedTerm
    || normalizeTermLabel(optionResult.options?.hottest_combination?.term)
    || normalizeTermLabel(optionValue(optionResult.options?.term))
    || "";
  const premiumTermYears = termYears(premiumTerm);
  const optionSummary = [
    optionResult.options?.subcate,
    optionResult.options?.period_of_insurance,
    optionResult.options?.feature,
    optionResult.options?.hottest_combination?.term,
    optionResult.options?.hottest_combination?.plan,
  ].filter(Boolean).join("；");
  const coverageWan = parseCoverageWan({ name: parsed.fullName, options: optionResult.options });
  const planName = planNameFromOptions(optionResult.options);
  const coverageLabel = coverageLabelFromOptions({ options: optionResult.options, coverageWan });
  const planBenefitTables = knownPlanBenefitTables(parsed.code, planOptions);
  const knownBenefits = benefitsForKnownPlan(parsed.code, coverageLabel, planOptions);
  const benefits = knownBenefits.length
    ? knownBenefits
    : inferBenefitsFromProduct({
      fullName: parsed.fullName,
      category: categoryFromName(parsed.fullName),
      coverageWan,
      coverageLabel,
      text: `${optionSummary} ${extractBenefitText(text)}`,
    });
  const structuredAnnualPremium = premiumFromStructuredRateTable(structuredRateTable, coverageWan, 1);
  const hasApiRates = Object.keys(rateTablesByGender).length > 0;
  const ratePricingModel = hasApiRates
    ? "planTotal"
    : structuredRateTable
      ? "structured"
      : "coverageUnit";
  const rateUnitCoverage = hasApiRates
    ? Math.max(10000, coverageWan * 10000)
    : Number(driveRate.result?.rateUnitCoverage) || 1000000;
  const hasDriveRate = Boolean(mergedRateTable.length || structuredRateTable);
  const ageRatedProduct = Boolean(mergedRateTable.length) || isAgeRatedProduct(`${parsed.fullName} ${text} ${optionSummary}`);
  const annualPremium = premiumAtAgeWithUnits(
    mergedRateTable,
    DEFAULT_PREMIUM_AGE,
    coverageWan,
    rateUnitCoverage,
    ratePricingModel,
  ) || structuredAnnualPremium;

  const product = {
    code: parsed.code,
    aliases: [`FINFO-${parsed.code}`],
    name: parsed.name,
    insurer: parsed.insurer,
    category: categoryFromName(parsed.fullName),
    contractType: /附約|附加條款/.test(parsed.fullName) ? "rider" : "main",
    coverageWan,
    planName,
    coverageLabel,
    planOptions,
    planBenefitTables,
    annualPremium,
    endAge,
    premiumMode: mergedRateTable.length ? "ageBand" : "level",
    rateBasis: premiumTermYears ? "issueAge" : "attainedAge",
    premiumTerm,
    premiumTermYears,
    availableTerms,
    premiumChange: rateResult.rateTable.length
      ? "Finfo 公開 premiums API 已取得熱門方案年齡級距保費；實際仍需以保險公司正式費率表為準。"
      : structuredRateTable
        ? "已解析 Finfo 商品頁連結之 Google Drive 費率表；此商品依保額/限額與職業類別計算，正式金額仍需以保險公司費率表為準。"
      : ageRatedProduct
        ? "Finfo 已提供商品基本資料；商品屬定期或年齡相關保障，保費應依年齡或續保年齡調整，正式金額仍需費率表。"
        : "Finfo 已提供商品基本資料；此商品暫未取得公開保費級距。",
    premiumBands: premiumBandsWithUnits(mergedRateTable, coverageWan, rateUnitCoverage, ratePricingModel),
    rateStatus: hasDriveRate ? "ready" : "missing",
    ratePricingModel,
    termRatePricingModel: Object.keys(driveTermRateTablesByGender).length ? "coverageUnit" : ratePricingModel,
    rateUnitCoverage,
    rateSource,
    rateTable: mergedRateTable,
    rateTablesByGender: mergedRateTablesByGender,
    planRateTablesByGender,
    termRateTablesByGender: driveTermRateTablesByGender,
    structuredRateTable,
    source: "finfo-public",
    sourceUrl: search.selectedUrl,
    sourceName: "Finfo保險資訊站",
    effectiveDate: parsed.effectiveDate,
    saleStatus,
    saleStatusCheckedAt: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    confidence: 0.9,
    popularity,
    documents: docs,
    purchaseRequirements: knownPurchaseRequirements(parsed.code),
    benefits,
    note: `Finfo 搜尋精準命中；${optionSummary || "商品頁公開資料"}${driveRate.error ? `；Drive費率表解析失敗：${driveRate.error}` : ""}`.slice(0, 240),
  };

  return {
    code,
    found: true,
    search,
    product,
    optionAge: optionResult.age,
    rateRows: Math.max(maxGenderRateRows(mergedRateTablesByGender), mergedRateTable.length, maxTermRateRows(driveTermRateTablesByGender), structuredRateTable?.rows?.length || 0),
    premiumUrl: rateResult.premiumUrl,
    premiumUrlsByGender: Object.fromEntries(Object.entries(rateResults).map(([gender, result]) => [gender, result.premiumUrl])),
    driveRateRows: Math.max(maxGenderRateRows(driveRateTablesByGender), maxTermRateRows(driveTermRateTablesByGender), structuredRateTable?.rows?.length || 0),
    driveRateWarnings: driveRate.result?.warnings || [],
    driveRateError: driveRate.error,
    alternateExactUrls: search.exact.slice(1),
    errors: [optionResult.errors, ...Object.values(rateResults).map((result) => result.error), driveRate.error].flat().filter(Boolean),
  };
}

const seedPayload = readJson(seedsPath, { codes: [] });
const indexPayload = readJson(indexPath, { products: [] });
const existingPayload = readJson(feedPath, { products: [] });
const enrichmentState = readJson(enrichmentStatePath, { attempts: {} });
const envCodes = String(process.env.FINFO_PRODUCT_CODES || "")
  .split(/[,\s]+/)
  .map(normalizeCode)
  .filter(Boolean);
const indexedProducts = (indexPayload.products || [])
  .filter((item) => item?.code && item?.sourceUrl);
const indexByCode = new Map(indexedProducts.map((item) => [normalizeCode(item.code), item]));
const existingProducts = (existingPayload.products || []).filter((item) => item?.code);
const existingByCode = new Map(existingProducts.map((item) => [normalizeCode(item.code), item]));
const seedCodes = process.env.FINFO_INCLUDE_SEEDS === "0" ? [] : (seedPayload.codes || []);
const priorityCodes = [...new Set([...seedCodes, ...envCodes].map(normalizeCode).filter(Boolean))];
const prioritySet = new Set(priorityCodes);
const orderedIndexedProducts = indexedProducts
  .filter((item) => {
    const code = normalizeCode(item.code);
    return code && !prioritySet.has(code);
  })
  .sort((a, b) => String(b.effectiveDate || "").localeCompare(String(a.effectiveDate || ""))
    || normalizeCode(a.code).localeCompare(normalizeCode(b.code), "en"));
const attemptByCode = enrichmentState.attempts && typeof enrichmentState.attempts === "object"
  ? enrichmentState.attempts
  : {};
const attemptTime = (item) => Date.parse(attemptByCode[normalizeCode(item.code)]?.attemptedAt || "") || 0;
const statusRefreshCutoff = Date.now() - (Number(process.env.FINFO_STATUS_REFRESH_DAYS || 35) * 24 * 60 * 60 * 1000);
const staleStatusProducts = orderedIndexedProducts
  .filter((item) => {
    const existing = existingByCode.get(normalizeCode(item.code));
    const checkedAt = Date.parse(existing?.saleStatusCheckedAt || "");
    return existing && (!Number.isFinite(checkedAt) || checkedAt < statusRefreshCutoff);
  })
  .sort((a, b) => Number(existingByCode.get(normalizeCode(b.code))?.popularity || 0)
    - Number(existingByCode.get(normalizeCode(a.code))?.popularity || 0));
const pendingDetailProducts = orderedIndexedProducts
  .filter((item) => existingByCode.get(normalizeCode(item.code))?.rateStatus !== "ready")
  .sort((a, b) => attemptTime(a) - attemptTime(b)
    || String(b.effectiveDate || "").localeCompare(String(a.effectiveDate || ""))
    || normalizeCode(a.code).localeCompare(normalizeCode(b.code), "en"));
const statusRefreshLimit = DETAIL_LIMIT > 0 ? Math.max(1, Math.floor(DETAIL_LIMIT * 0.15)) : 0;
const selectedStatusProducts = staleStatusProducts.slice(0, statusRefreshLimit);
const detailRefreshLimit = Math.max(0, DETAIL_LIMIT - selectedStatusProducts.length);
const automaticCodes = [
  ...pendingDetailProducts.slice(0, detailRefreshLimit),
  ...selectedStatusProducts,
]
  .filter((item, index, items) => items.findIndex((candidate) => normalizeCode(candidate.code) === normalizeCode(item.code)) === index)
  .map((item) => normalizeCode(item.code));
const codes = [...new Set([...priorityCodes, ...automaticCodes])];

const results = [];
for (const code of codes) {
  try {
    const result = await discoverCode(code, indexByCode.get(code), existingByCode.get(code));
    results.push(result);
    console.log(`${code}: ${result.found ? `${result.product.insurer} ${result.product.name} (${result.rateRows} rates)` : result.error}`);
  } catch (error) {
    results.push({ code, found: false, error: error.message });
    console.log(`${code}: ${error.message}`);
  }
}

const detailedByCode = new Map(existingProducts.map((item) => [normalizeCode(item.code), item]));
results
  .filter((result) => result.found && result.product)
  .forEach((result) => detailedByCode.set(normalizeCode(result.product.code), result.product));
const products = [...detailedByCode.values()].sort((a, b) => a.code.localeCompare(b.code, "en"));
const saleStatusChanges = results
  .filter((result) => result.found && result.product)
  .map((result) => {
    const previous = existingByCode.get(normalizeCode(result.product.code));
    return {
      code: result.product.code,
      previous: previous?.saleStatus || "unknown",
      current: result.product.saleStatus || "unknown",
    };
  })
  .filter((change) => change.previous !== change.current);
const now = new Date().toISOString();
const nextAttempts = { ...attemptByCode };
for (const result of results) {
  nextAttempts[normalizeCode(result.code)] = {
    attemptedAt: now,
    found: Boolean(result.found && result.product),
    rateStatus: result.product?.rateStatus || "missing",
    saleStatus: result.product?.saleStatus || "unknown",
    error: result.found ? "" : String(result.error || "unknown_error").slice(0, 180),
  };
}
const indexedCodeSet = new Set(indexedProducts.map((item) => normalizeCode(item.code)));
for (const code of Object.keys(nextAttempts)) {
  if (!indexedCodeSet.has(code)) delete nextAttempts[code];
}
const readyDetailCodes = new Set(products
  .filter((product) => product.rateStatus === "ready")
  .map((product) => normalizeCode(product.code)));
const pendingDetailCodes = indexedProducts
  .map((product) => normalizeCode(product.code))
  .filter((code) => code && !readyDetailCodes.has(code));

writeJson(feedPath, {
  schemaVersion: 1,
  generatedAt: now,
  source: "finfo-public",
  sourceNote: "由 Finfo 公開商品搜尋、商品頁與公開 premiums API 產生；保費仍需以保險公司正式費率表與條款為準。",
  codes: products.map((product) => product.code),
  products,
});

writeJson(enrichmentStatePath, {
  schemaVersion: 1,
  updatedAt: now,
  detailLimit: DETAIL_LIMIT,
  statusRefreshLimit,
  attempts: nextAttempts,
});

writeJson(reportPath, {
  schemaVersion: 1,
  generatedAt: now,
  source: "finfo-public",
  indexedCodes: indexedProducts.length,
  requestedCodes: codes.length,
  priorityCodes,
  automaticCodes,
  automaticDetailCodes: automaticCodes.filter((code) => pendingDetailProducts.some((item) => normalizeCode(item.code) === code)),
  automaticStatusRefreshCodes: automaticCodes.filter((code) => staleStatusProducts.some((item) => normalizeCode(item.code) === code)),
  productsFoundThisRun: results.filter((result) => result.found && result.product).length,
  detailedProductsStored: products.length,
  readyRateProducts: readyDetailCodes.size,
  pendingDetailCount: pendingDetailCodes.length,
  pendingDetailExamples: pendingDetailCodes.slice(0, 500),
  saleStatusChanges,
  unresolvedCodes: results.filter((result) => !result.found).map((result) => ({
    code: result.code,
    error: result.error,
  })),
  ambiguousCodes: results
    .filter((result) => result.alternateExactUrls?.length)
    .map((result) => ({
      code: result.code,
      selectedUrl: result.search.selectedUrl,
      alternateExactUrls: result.alternateExactUrls,
    })),
  results,
});

console.log(`Stored ${products.length} detailed Finfo products; ${pendingDetailCodes.length} indexed codes remain queued for rate enrichment.`);
console.log(`Wrote ${feedPath}`);
