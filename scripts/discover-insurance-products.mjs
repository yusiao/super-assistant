import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = resolve(root, "data/insurance");
const sourcePath = resolve(dataDir, "public-sources.tw.json");
const feedPath = resolve(dataDir, "products-feed.json");
const discoveredPath = resolve(dataDir, "products-discovered.json");
const reportPath = resolve(dataDir, "discovery-report.json");

const USER_AGENT = "JarvisInsurancePlanner/1.0 (+https://jarvis-insurance-planner.pages.dev/)";
const MAX_PAGES_PER_INSURER = Number(process.env.INSURANCE_DISCOVERY_MAX_PAGES || 5);
const FETCH_TIMEOUT_MS = Number(process.env.INSURANCE_DISCOVERY_TIMEOUT_MS || 7000);
const PRODUCT_LINK_WORDS = [
  "商品", "保險", "保障", "壽險", "健康", "醫療", "癌", "傷害", "失能", "長照", "年金",
  "條款", "費率", "DM", "PDF", "附約", "主約", "投資型", "products", "product", "insurance",
];
const PRODUCT_NAME_RE = /([\u4e00-\u9fffA-Za-z0-9（）()「」『』、·．\-\s]{6,80}(?:保險|附約|年金|壽險|健康保險|傷害保險|醫療保險|癌症健康保險)[\u4e00-\u9fffA-Za-z0-9（）()「」『』、·．\-\s]{0,30})/g;
const PRODUCT_CODE_RE = /(?:商品代號|保險代號|險種代號|代號|簡稱|code|Code)[:：\s　]*([A-Z][A-Z0-9]{1,7})/gi;
const URL_CODE_RE = /(?:^|[^A-Z0-9])([A-Z]{2,4}[0-9A-Z]{0,3})(?:[^A-Z0-9]|$)/g;
const STOP_CODES = new Set(["APP", "API", "CMS", "CSS", "CSV", "DM", "EDM", "HTML", "HTTP", "HTTPS", "PDF", "TW", "WWW", "XLS", "XLSX", "OIU"]);
const NON_PRODUCT_DOC_RE = /(服務契約|健康告知|聲明書|受益人|預定利率|指南|商品說明書$|網路保險服務|保險單紅利|宣告利率|紅利|隱私權|防制|洗錢|申請書|要保書|理賠|公告|流程|APP|Cookie)/i;
const NON_PRODUCT_NAME_RE = /(繳費年期|保障年期|投保年齡|同保險年期|同保障年期|同繳費年期|同主契約繳費|請詳現行投保規則)/i;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeSpace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function stripHtml(value) {
  return normalizeSpace(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'"),
  );
}

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#xff0c;/gi, "，")
    .replace(/&#xff1f;/gi, "？");
}

function htmlLines(value) {
  return decodeHtmlEntities(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style[\s\S]*?<\/style>/gi, "\n")
      .replace(/<(br|hr)\b[^>]*>/gi, "\n")
      .replace(/<\/(a|article|dd|div|dt|figcaption|h[1-6]|li|p|section|span|td|th|tr|ul|ol)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split(/\r?\n/)
    .map((line) => normalizeSpace(line))
    .filter(Boolean);
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[\s\-_/．。]+/g, "");
}

function toAbsoluteUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

function sameHost(url, home) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") === new URL(home).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

function categoryFromName(value) {
  const text = String(value ?? "");
  if (/癌|重大傷病|重大疾病|特定傷病/.test(text)) return "critical";
  if (/醫療|住院|手術|健康|實支/.test(text)) return "medical";
  if (/傷害|意外/.test(text)) return "accident";
  if (/失能|殘扶|扶助/.test(text)) return "disability";
  if (/長照|長期照顧|看護/.test(text)) return "longcare";
  if (/年金|儲蓄|利變|還本/.test(text)) return "savings";
  if (/壽險|人壽|定期|終身/.test(text)) return "life";
  return "medical";
}

function endAgeFromText(value) {
  const text = String(value ?? "");
  if (/終身/.test(text)) return 100;
  const match = text.match(/(?:保障年期|保障至|續保至|至|到|滿)\s*(\d{2,3})\s*歲|(\d{2,3})\s*歲屆滿/);
  return match ? Number(match[1] || match[2]) : 100;
}

function isFormalProductName(value) {
  const text = String(value ?? "").replace(/^#+\s*/, "").trim();
  if (NON_PRODUCT_NAME_RE.test(text)) return false;
  if (!text || text.length > 64 || /[，,。]/.test(text) || NON_PRODUCT_DOC_RE.test(text)) return false;
  if (/(保險金|保障|給付|申請|最低|較一般|一次|即可|輕鬆)/.test(text) && !/(保險附約|保險$|保險[（(]|年金保險|終身保險|健康保險|傷害保險|壽險$)/.test(text)) return false;
  return /(保險|附約|年金)/.test(text);
}

function linkScore(link) {
  const haystack = `${link.text} ${link.url}`.toLowerCase();
  let score = 0;
  for (const word of PRODUCT_LINK_WORDS) {
    if (haystack.includes(word.toLowerCase())) score += 2;
  }
  if (/\.(pdf|xls|xlsx|csv)(?:$|\?)/i.test(link.url)) score += 5;
  if (/sitemap|robots|login|privacy|terms|contact|facebook|youtube|line\.me/i.test(link.url)) score -= 6;
  return score;
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
        accept: "text/html,application/xhtml+xml,application/xml,text/plain,*/*;q=0.7",
      },
    });
    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();
    return { ok: response.ok, status: response.status, contentType, body, finalUrl: response.url };
  } finally {
    clearTimeout(timeout);
  }
}

function parseLinks(html, baseUrl) {
  const links = [];
  const attrRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = attrRe.exec(html))) {
    const url = toAbsoluteUrl(match[1], baseUrl);
    if (!url || !/^https?:/i.test(url)) continue;
    links.push({ url, text: stripHtml(match[2]) });
  }
  const assetRe = /https?:\/\/[^\s"'<>]+?\.(?:pdf|xls|xlsx|csv)(?:\?[^\s"'<>]*)?/gi;
  while ((match = assetRe.exec(html))) {
    links.push({ url: match[0], text: decodeURIComponent(match[0].split("/").pop() || "") });
  }
  return links;
}

function sitemapUrls(xml, baseUrl) {
  const urls = [];
  const locRe = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match;
  while ((match = locRe.exec(xml))) {
    const url = toAbsoluteUrl(match[1], baseUrl);
    if (url) urls.push(url);
  }
  return urls;
}

function candidateFromText({ insurer, tiiCode, sourceUrl, sourceText, linkText = "" }) {
  const text = normalizeSpace(`${linkText} ${sourceText}`).slice(0, 30000);
  const codes = new Set();
  let match;
  while ((match = PRODUCT_CODE_RE.exec(text))) codes.add(normalizeCode(match[1]));
  if (/\/products?\//i.test(sourceUrl)) {
    while ((match = URL_CODE_RE.exec(sourceUrl))) {
      const code = normalizeCode(match[1]);
      if (/^[A-Z]{2,4}[0-9A-Z]{0,3}$/.test(code) && !STOP_CODES.has(code)) codes.add(code);
    }
  }

  const names = new Set();
  while ((match = PRODUCT_NAME_RE.exec(text))) {
    const name = normalizeSpace(match[1]).replace(/[，,。；;：:]+$/g, "");
    if (name.length >= 8 && name.length <= 90) names.add(name);
  }

  const name = Array.from(names).sort((a, b) => b.length - a.length)[0] || normalizeSpace(linkText);
  const code = Array.from(codes)[0] || "";
  if (!name || !/(保險|附約|年金|壽險)/.test(name)) return null;
  const isNonProductDocument = NON_PRODUCT_DOC_RE.test(name) || NON_PRODUCT_DOC_RE.test(linkText);

  let confidence = (code ? 0.35 : 0) + (sourceUrl.match(/\.(pdf|xls|xlsx|csv)(?:$|\?)/i) ? 0.25 : 0) + (/(條款|費率|商品|DM)/.test(text) ? 0.25 : 0) + (name.includes(insurer.replace("人壽", "")) ? 0.05 : 0);
  if (isNonProductDocument) confidence = Math.min(confidence, 0.4);
  const ageRatedProduct = /(費率|年齡|自然費率|級距|定期|一年期|一年定期|[0-9０-９]+年期|歲滿期|續保年齡)/.test(text);
  return {
    code: code || `DISC-${tiiCode}-${Math.abs(hashCode(`${sourceUrl}:${name}`)).toString(36).toUpperCase().slice(0, 6)}`,
    aliases: code ? [] : [`DISCOVERED-${tiiCode}`],
    name,
    insurer,
    category: categoryFromName(name),
    coverageWan: 0,
    endAge: 100,
    premiumMode: ageRatedProduct ? "ageBand" : "level",
    premiumChange: ageRatedProduct ? "公開來源提到定期、費率或年齡級距；保費應依年齡或續保年齡調整，仍需正式費率表解析後才能精算。" : "需以正式條款與費率表為準。",
    rateStatus: "missing",
    rateUnitCoverage: 1000000,
    rateSource: sourceUrl,
    source: "public-discovery",
    sourceUrl,
    discoveredAt: new Date().toISOString(),
    confidence: Number(confidence.toFixed(2)),
    rejected: isNonProductDocument,
    rejectionReason: isNonProductDocument ? "non-product-document" : "",
    note: "由公開網站自動發現；尚未完成正式費率表結構化解析，使用前需人工或後續解析器確認。",
  };
}

function extractStructuredProducts({ insurer, tiiCode, sourceUrl, html }) {
  const lines = htmlLines(html);
  const products = [];
  for (let index = 0; index < lines.length; index += 1) {
    const relation = /^(主約|附約)$/.test(lines[index]) ? lines[index] : "";
    if (!relation) continue;

    let codeLine = "";
    let nameLine = "";
    let nameIndex = -1;
    for (let offset = 1; offset <= 8 && index + offset < lines.length; offset += 1) {
      const line = lines[index + offset];
      if (!codeLine && /^[A-Z0-9]{2,8}(?:\/[A-Z0-9]{2,8})*$/.test(line) && !STOP_CODES.has(line)) {
        codeLine = line;
        continue;
      }
      if (codeLine && isFormalProductName(line)) {
        nameLine = line.replace(/^#+\s*/, "");
        nameIndex = index + offset;
        break;
      }
    }
    if (!codeLine || !nameLine) continue;

    const codes = codeLine.split("/").map(normalizeCode).filter((code) => code && !STOP_CODES.has(code));
    if (!codes.length) continue;

    const detailLines = [];
    for (let cursor = nameIndex + 1; cursor < Math.min(lines.length, nameIndex + 18); cursor += 1) {
      if (/^(主約|附約)$/.test(lines[cursor])) break;
      detailLines.push(lines[cursor]);
    }
    const detailText = detailLines.join(" ");
    const endAge = endAgeFromText(detailText);
    const premiumMode = /1年期|同保險年期|同保障年期|定期|年齡|級距/.test(detailText) ? "ageBand" : "level";

    products.push({
      code: codes[0],
      aliases: codes.slice(1),
      name: nameLine,
      insurer,
      category: categoryFromName(`${nameLine} ${detailText}`),
      coverageWan: 0,
      endAge,
      premiumMode,
      premiumChange: premiumMode === "ageBand" ? "公開商品頁列示為定期或年齡相關商品；正式保費仍需費率表。" : "需以正式條款與費率表為準。",
      rateStatus: "missing",
      rateUnitCoverage: 1000000,
      rateSource: sourceUrl,
      source: "public-product-list",
      sourceUrl,
      discoveredAt: new Date().toISOString(),
      confidence: 0.95,
      rejected: false,
      rejectionReason: "",
      note: `${relation}；${detailText}`.slice(0, 240),
    });
  }
  return products;
}

function hashCode(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}

function mergeByCode(items) {
  const merged = new Map();
  for (const item of items) {
    const key = normalizeCode(item.code);
    if (!key) continue;
    const current = merged.get(key);
    if (!current || Number(item.confidence || 0) > Number(current.confidence || 0)) merged.set(key, item);
  }
  return Array.from(merged.values()).sort((a, b) => String(a.insurer).localeCompare(String(b.insurer), "zh-Hant") || String(a.code).localeCompare(String(b.code)));
}

async function discoverInsurer(source) {
  const pages = [];
  const products = [];
  const errors = [];
  const queued = new Map();
  const seen = new Set();

  const enqueue = (url, text = "", priority = false) => {
    if (!url || seen.has(url) || queued.has(url)) return;
    if (!priority) {
      queued.set(url, text);
      return;
    }
    const entries = Array.from(queued.entries());
    queued.clear();
    queued.set(url, text);
    for (const [queuedUrl, queuedText] of entries) queued.set(queuedUrl, queuedText);
  };

  enqueue(source.homepage, "homepage", true);
  for (const seedUrl of Array.isArray(source.seedUrls) ? source.seedUrls : []) enqueue(seedUrl, "seed", true);
  for (const path of ["/robots.txt", "/sitemap.xml", "/sitemap_index.xml"]) enqueue(toAbsoluteUrl(path, source.homepage));

  while (queued.size && seen.size < MAX_PAGES_PER_INSURER) {
    const [url, linkText] = queued.entries().next().value;
    queued.delete(url);
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const response = await fetchText(url);
      pages.push({ url, status: response.status, contentType: response.contentType });
      if (!response.ok) continue;

      if (/xml|sitemap|robots|text\/plain/i.test(response.contentType) || /sitemap|robots/i.test(url)) {
        for (const candidateUrl of sitemapUrls(response.body, response.finalUrl)) {
          const text = decodeURIComponent(candidateUrl.split("/").pop() || "");
          if (sameHost(candidateUrl, source.homepage) && linkScore({ url: candidateUrl, text }) > 0) enqueue(candidateUrl, text);
        }
      }

      const text = stripHtml(response.body);
      products.push(...extractStructuredProducts({
        insurer: source.name,
        tiiCode: source.tiiCode,
        sourceUrl: response.finalUrl || url,
        html: response.body,
      }));
      const candidate = candidateFromText({
        insurer: source.name,
        tiiCode: source.tiiCode,
        sourceUrl: response.finalUrl || url,
        sourceText: text,
        linkText,
      });
      if (candidate && candidate.confidence >= 0.35) products.push(candidate);

      for (const link of parseLinks(response.body, response.finalUrl || url)) {
        if (!sameHost(link.url, source.homepage) && !/\.(pdf|xls|xlsx|csv)(?:$|\?)/i.test(link.url)) continue;
        if (linkScore(link) >= 2) enqueue(link.url, link.text);
      }
    } catch (error) {
      errors.push({ url, message: error?.message || String(error) });
    }
  }

  return {
    insurer: source.name,
    tiiCode: source.tiiCode,
    homepage: source.homepage,
    pagesChecked: pages.length,
    productsFound: products.length,
    pages,
    errors,
    products,
  };
}

const payload = readJson(sourcePath);
const sources = Array.isArray(payload.sources) ? payload.sources : [];
const results = [];
for (const source of sources) {
  // Keep requests sequential to avoid stressing insurer websites.
  results.push(await discoverInsurer(source));
  console.log(`${source.name}: checked ${results.at(-1).pagesChecked}, found ${results.at(-1).productsFound}`);
}

const discovered = mergeByCode(results.flatMap((result) => result.products));
const feedProducts = discovered.filter((item) => item.confidence >= 0.75 && !item.rejected && !String(item.code).startsWith("DISC-"));
const now = new Date().toISOString();

writeJson(discoveredPath, {
  schemaVersion: 1,
  generatedAt: now,
  source: "public-discovery",
  products: discovered,
});

writeJson(feedPath, {
  schemaVersion: 1,
  generatedAt: now,
  source: "public-discovery",
  sourceNote: "自各壽險公司公開頁面自動發現；只匯入可信度較高的商品候選，費率表仍需後續解析。",
  products: feedProducts,
});

writeJson(reportPath, {
  schemaVersion: 1,
  generatedAt: now,
  sourceCount: sources.length,
  productsDiscovered: discovered.length,
  feedProducts: feedProducts.length,
  unresolvedInsurers: results.filter((result) => result.productsFound === 0).map((result) => ({
    tiiCode: result.tiiCode,
    name: result.insurer,
    homepage: result.homepage,
    pagesChecked: result.pagesChecked,
    errors: result.errors.slice(0, 5),
  })),
  results,
});

console.log(`Discovered ${discovered.length} candidates; wrote ${feedProducts.length} to ${feedPath}`);
