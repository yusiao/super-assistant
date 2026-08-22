import { gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = resolve(root, "data/insurance");
const insurersPath = resolve(dataDir, "life-insurers.tw.json");
const feedPath = resolve(dataDir, "products-finfo-index.json");
const reportPath = resolve(dataDir, "finfo-index-report.json");

const FINFO_SITEMAP_URL = process.env.FINFO_SITEMAP_URL || "https://finfo.tw/sitemap.xml.gz";
const FETCH_TIMEOUT_MS = Number(process.env.FINFO_INDEX_TIMEOUT_MS || 30000);
const USER_AGENT = "JarvisInsurancePlanner/1.0 (+https://jarvis-insurance-planner.pages.dev/)";

function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[\s\-_/．。]+/g, "");
}

function normalizeSpace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeXml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function xmlLocations(xml) {
  return [...String(xml).matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean);
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
        accept: "application/xml,text/xml,application/gzip,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`Finfo sitemap request failed: ${response.status} ${url}`);
    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

function sitemapText(buffer) {
  const gzip = buffer[0] === 0x1f && buffer[1] === 0x8b;
  return (gzip ? gunzipSync(buffer) : buffer).toString("utf8");
}

async function discoverSitemapUrls(rootUrl) {
  const pending = [rootUrl];
  const seen = new Set();
  const pages = [];
  const urls = [];

  while (pending.length) {
    const url = pending.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const xml = sitemapText(await fetchBuffer(url));
    const locations = xmlLocations(xml);
    pages.push({ url, locations: locations.length, type: /<sitemapindex\b/i.test(xml) ? "index" : "urlset" });
    if (/<sitemapindex\b/i.test(xml)) {
      locations.filter((item) => /sitemap[^/]*\.xml(?:\.gz)?(?:\?|$)/i.test(item)).forEach((item) => pending.push(item));
    } else {
      urls.push(...locations);
    }
  }

  return { pages, urls: [...new Set(urls)] };
}

const insurerPayload = readJson(insurersPath, { insurers: [] });
const previousPayload = readJson(feedPath, { products: [] });
const insurerNames = [...new Set([
  ...(insurerPayload.insurers || []).flatMap((item) => [item.shortName, item.name]),
  "中國人壽",
  "康健人壽",
  "保德信人壽",
  "英國保誠人壽",
  "紐約人壽",
  "荷蘭人壽",
  "ING安泰人壽",
  "中央信託局",
])].filter(Boolean).sort((a, b) => b.length - a.length);

function insurerFromFullName(fullName) {
  const known = insurerNames.find((name) => fullName.startsWith(name));
  if (known) return known.replace(/保險(?:事業)?股份有限公司.*$/, "");
  const fallback = fullName.match(/^(.{2,24}?人壽)/)?.[1] || "";
  return /產險|產物/.test(fallback) ? "" : fallback;
}

function parseProductUrl(url) {
  let slug = "";
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== "finfo.tw") return null;
    const parts = decodeURIComponent(parsedUrl.pathname).split("/").filter(Boolean);
    if (parts[0] !== "products" || !parts[1]) return null;
    slug = parts[1];
  } catch {
    return null;
  }

  const match = slug.match(/^([A-Za-z0-9]+)-(.+)-(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const [, rawCode, fullName, effectiveDate] = match;
  const code = normalizeCode(rawCode);
  const insurer = insurerFromFullName(fullName);
  if (!code || !insurer) return null;
  const name = normalizeSpace(fullName.slice(insurer.length));
  if (!name) return null;
  return { code, name, insurer, fullName, effectiveDate, sourceUrl: url };
}

function categoryFromName(value) {
  const text = String(value ?? "");
  if (/重大傷病|重大疾病|特定傷病|癌症|防癌/.test(text)) return "critical";
  if (/醫療|住院|手術|實支|健康/.test(text)) return "medical";
  if (/意外|傷害/.test(text)) return "accident";
  if (/長照|長期照顧|失能|殘廢/.test(text)) return "longcare";
  if (/年金|儲蓄|還本|利率變動|增額|養老/.test(text)) return "savings";
  return "life";
}

function premiumModeFromName(value) {
  return /一年期|一年定期|定期.*附約|傷害.*附約/.test(String(value ?? "")) ? "ageBand" : "level";
}

function newerProduct(a, b) {
  return String(b.effectiveDate).localeCompare(String(a.effectiveDate))
    || a.insurer.localeCompare(b.insurer, "zh-Hant")
    || a.name.localeCompare(b.name, "zh-Hant");
}

const sitemap = await discoverSitemapUrls(FINFO_SITEMAP_URL);
const versions = sitemap.urls.map(parseProductUrl).filter(Boolean);
const grouped = new Map();
for (const version of versions) {
  if (!grouped.has(version.code)) grouped.set(version.code, []);
  grouped.get(version.code).push(version);
}

const generatedAt = new Date().toISOString();
const products = [...grouped.entries()].map(([code, rows]) => {
  const sorted = [...rows].sort(newerProduct);
  const latest = sorted[0];
  const alternateProducts = [];
  const alternateInsurers = new Set([latest.insurer]);
  for (const candidate of sorted.slice(1)) {
    if (alternateInsurers.has(candidate.insurer)) continue;
    alternateInsurers.add(candidate.insurer);
    alternateProducts.push({
      insurer: candidate.insurer,
      name: candidate.name,
      effectiveDate: candidate.effectiveDate,
      sourceUrl: candidate.sourceUrl,
    });
  }
  return {
    code,
    name: latest.name,
    insurer: latest.insurer,
    category: categoryFromName(latest.fullName),
    endAgeKnown: false,
    premiumMode: premiumModeFromName(latest.fullName),
    premiumChange: "已收錄商品代號與最新版；選取後會自動查詢保障年齡及公開費率。",
    rateStatus: "index-only",
    source: "finfo-index",
    sourceUrl: latest.sourceUrl,
    effectiveDate: latest.effectiveDate,
    versionCount: rows.length,
    alternateProducts,
  };
}).sort((a, b) => a.code.localeCompare(b.code, "en"));

const duplicateCodes = [...grouped.entries()]
  .filter(([, rows]) => new Set(rows.map((item) => item.insurer)).size > 1)
  .map(([code, rows]) => ({
    code,
    insurers: [...new Set(rows.map((item) => item.insurer))],
    versions: rows.length,
  }))
  .sort((a, b) => a.code.localeCompare(b.code, "en"));
const previousByCode = new Map((previousPayload.products || []).map((product) => [normalizeCode(product.code), product]));
const currentByCode = new Map(products.map((product) => [normalizeCode(product.code), product]));
const addedProducts = products
  .filter((product) => !previousByCode.has(product.code))
  .map((product) => ({ code: product.code, insurer: product.insurer, name: product.name, effectiveDate: product.effectiveDate }));
const updatedProducts = products
  .filter((product) => {
    const previous = previousByCode.get(product.code);
    return previous && (previous.sourceUrl !== product.sourceUrl || previous.name !== product.name || previous.insurer !== product.insurer);
  })
  .map((product) => ({
    code: product.code,
    previousEffectiveDate: previousByCode.get(product.code)?.effectiveDate || "",
    effectiveDate: product.effectiveDate,
    insurer: product.insurer,
    name: product.name,
  }));
const removedProducts = (previousPayload.products || [])
  .filter((product) => !currentByCode.has(normalizeCode(product.code)))
  .map((product) => ({ code: product.code, insurer: product.insurer, name: product.name, effectiveDate: product.effectiveDate }));

writeJson(feedPath, {
  schemaVersion: 1,
  generatedAt,
  source: "finfo-index",
  sourceNote: "由 Finfo robots.txt 指定之公開 sitemap 自動建立；商品詳細保障與費率仍以保險公司正式文件為準。",
  sitemapUrl: FINFO_SITEMAP_URL,
  products,
});

writeJson(reportPath, {
  schemaVersion: 1,
  generatedAt,
  sitemapUrl: FINFO_SITEMAP_URL,
  sitemapPages: sitemap.pages,
  totalUrls: sitemap.urls.length,
  lifeProductVersions: versions.length,
  uniqueCodes: products.length,
  duplicateCodeCount: duplicateCodes.length,
  duplicateCodes,
  changes: {
    addedCount: addedProducts.length,
    updatedCount: updatedProducts.length,
    removedFromSitemapCount: removedProducts.length,
    addedProducts,
    updatedProducts,
    removedProducts,
  },
  verification: Object.fromEntries(["DCE", "T08F0", "OTL1"].map((code) => [
    code,
    products.find((product) => product.code === code) || null,
  ])),
});

console.log(`Indexed ${products.length} life-insurance codes from ${versions.length} Finfo product versions.`);
console.log(`Wrote ${feedPath}`);
