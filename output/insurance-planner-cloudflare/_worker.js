const FINFO_BASE = "https://finfo.tw";
const USER_AGENT = "JarvisInsurancePlanner/1.0 (+https://jarvis-insurance-planner.pages.dev/)";
const MAX_HTML_BYTES = 1_200_000;
const MAX_JSON_BYTES = 300_000;
const FETCH_TIMEOUT_MS = 9000;
const CACHE_SECONDS = 60 * 60 * 24 * 7;
const LIVE_CACHE_VERSION = "4";
const SESSION_COOKIE = "jarvis_insurance_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 100_000;
const LEGACY_PASSWORD_ITERATIONS = 20_000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 8;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_MAX_ATTEMPTS = 5;
const MAX_AUTH_JSON_BYTES = 12_000;
const MAX_ACCOUNT_DATA_BYTES = 600_000;

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": status === 200 ? `public, max-age=300, s-maxage=${CACHE_SECONDS}` : "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function privateJsonResponse(payload, status = 200, extraHeaders = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": "no-store, private",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function passwordHash(password, salt, iterations = PASSWORD_ITERATIONS) {
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > PASSWORD_ITERATIONS) {
    throw new Error("invalid_password_iterations");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    salt: new TextEncoder().encode(salt),
    iterations,
  }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}

function storedPasswordIterations(value) {
  const iterations = Number(value || LEGACY_PASSWORD_ITERATIONS);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > PASSWORD_ITERATIONS) {
    return LEGACY_PASSWORD_ITERATIONS;
  }
  return iterations;
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(String(left));
  const b = new TextEncoder().encode(String(right));
  if (a.byteLength !== b.byteLength) return false;
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(a, b);
  }
  let difference = 0;
  for (let index = 0; index < a.byteLength; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function cookiesFromRequest(request) {
  const cookies = new Map();
  for (const part of String(request.headers.get("cookie") || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    cookies.set(part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim()));
  }
  return cookies;
}

function sessionCookie(request, token, maxAge = SESSION_MAX_AGE_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

function sameOriginRequest(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function authorizedLoadTest(request, env) {
  const expected = String(env.INSURANCE_LOAD_TEST_TOKEN || "");
  const provided = String(request.headers.get("x-insurance-load-test-token") || "");
  const hostname = new URL(request.url).hostname;
  if (!expected || !provided || hostname === "jarvis-insurance-planner.pages.dev") return false;
  return constantTimeEqual(provided, expected);
}

async function readJsonBody(request, limit) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > limit) throw new Error("request_too_large");
  const text = await readTextLimited(request, limit);
  return text ? JSON.parse(text) : {};
}

function normalizeUsername(value) {
  return String(value ?? "").trim().toLowerCase();
}

function validUsername(value) {
  return /^[a-z0-9][a-z0-9._@-]{3,39}$/.test(value);
}

function displayName(value, fallback) {
  return String(value ?? fallback ?? "").replace(/\s+/g, " ").trim().slice(0, 30);
}

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
  };
}

async function rateLimitKey(request, action, username = "") {
  const address = request.headers.get("cf-connecting-ip") || "local";
  return sha256(`${action}|${address}|${username}`);
}

async function rateLimitStatus(env, key, windowMs, maxAttempts) {
  const now = Date.now();
  const row = await env.DB.prepare(
    "SELECT attempt_count, window_started_at FROM auth_limits WHERE rate_key = ?",
  ).bind(key).first();
  if (!row || now - Number(row.window_started_at) >= windowMs) {
    return { blocked: false, attempts: 0, retryAfter: 0 };
  }
  const attempts = Number(row.attempt_count || 0);
  return {
    blocked: attempts >= maxAttempts,
    attempts,
    retryAfter: Math.max(1, Math.ceil((windowMs - (now - Number(row.window_started_at))) / 1000)),
  };
}

async function recordRateLimitFailure(env, key, windowMs) {
  const now = Date.now();
  const row = await env.DB.prepare(
    "SELECT attempt_count, window_started_at FROM auth_limits WHERE rate_key = ?",
  ).bind(key).first();
  if (!row || now - Number(row.window_started_at) >= windowMs) {
    await env.DB.prepare(
      `INSERT INTO auth_limits (rate_key, attempt_count, window_started_at, updated_at)
       VALUES (?, 1, ?, ?)
       ON CONFLICT(rate_key) DO UPDATE SET attempt_count = 1, window_started_at = excluded.window_started_at, updated_at = excluded.updated_at`,
    ).bind(key, now, now).run();
    return;
  }
  await env.DB.prepare(
    "UPDATE auth_limits SET attempt_count = attempt_count + 1, updated_at = ? WHERE rate_key = ?",
  ).bind(now, key).run();
}

async function clearRateLimit(env, key) {
  await env.DB.prepare("DELETE FROM auth_limits WHERE rate_key = ?").bind(key).run();
}

async function currentSession(request, env) {
  if (!env.DB) return null;
  const token = cookiesFromRequest(request).get(SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT users.id, users.username, users.display_name, sessions.expires_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
  ).bind(tokenHash, now).first();
  return row ? { tokenHash, user: publicUser(row) } : null;
}

async function createSession(request, env, userId) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).bind(tokenHash, userId, now, now + SESSION_MAX_AGE_SECONDS * 1000).run();
  return sessionCookie(request, token);
}

function validAccountData(data) {
  return data
    && typeof data === "object"
    && !Array.isArray(data)
    && data.profile
    && typeof data.profile === "object"
    && Array.isArray(data.policies)
    && data.policies.length <= 500
    && (!data.insuredPeople || (Array.isArray(data.insuredPeople) && data.insuredPeople.length <= 100))
    && (!data.productCatalog || (Array.isArray(data.productCatalog) && data.productCatalog.length <= 2000));
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[\s\-_/．。]+/g, "");
}

function normalizeSpace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#xff0c;/gi, "，")
    .replace(/&#xff1a;/gi, "：");
}

function htmlText(value) {
  return normalizeSpace(decodeHtml(String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")));
}

async function readTextLimited(response, limit) {
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > limit) throw new Error(`upstream response exceeds ${limit} bytes`);
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let output = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) throw new Error(`upstream response exceeds ${limit} bytes`);
      output += decoder.decode(value, { stream: true });
    }
    output += decoder.decode();
    return output;
  } finally {
    reader.releaseLock();
  }
}

async function fetchFinfoText(url, limit, accept) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.4",
        accept,
      },
    });
    if (!response.ok) throw new Error(`Finfo request failed: ${response.status}`);
    return await readTextLimited(response, limit);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFinfoJson(url) {
  return JSON.parse(await fetchFinfoText(url, MAX_JSON_BYTES, "application/json"));
}

function parseProductUrl(url) {
  try {
    const parsedUrl = new URL(url, FINFO_BASE);
    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "finfo.tw") return null;
    const parts = decodeURIComponent(parsedUrl.pathname).split("/").filter(Boolean);
    if (parts[0] !== "products" || !parts[1]) return null;
    const match = parts[1].match(/^([A-Za-z0-9]+)-(.+)-(\d{4}-\d{2}-\d{2})$/);
    if (!match) return null;
    const [, rawCode, fullName, effectiveDate] = match;
    const code = normalizeCode(rawCode);
    const insurer = fullName.match(/^(.{2,24}?人壽)/)?.[1] || "";
    if (!code || !insurer || /產險|產物/.test(insurer)) return null;
    return {
      code,
      insurer,
      name: normalizeSpace(fullName.slice(insurer.length)),
      fullName,
      effectiveDate,
      slug: parts[1],
      sourceUrl: parsedUrl.toString(),
    };
  } catch {
    return null;
  }
}

function productLinksFromHtml(html, code) {
  const normalized = normalizeCode(code);
  const matches = [];
  for (const match of String(html).matchAll(/href=["']([^"']*\/products\/[^"'#?]+)["']/gi)) {
    const parsed = parseProductUrl(decodeHtml(match[1]));
    if (parsed?.code === normalized) matches.push(parsed);
  }
  for (const match of String(html).matchAll(/data-product-slug=["']([^"']+)["']/gi)) {
    const parsed = parseProductUrl(`${FINFO_BASE}/products/${decodeHtml(match[1])}`);
    if (parsed?.code === normalized) matches.push(parsed);
  }
  return [...new Map(matches.map((item) => [item.sourceUrl, item])).values()]
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
}

async function resolveProduct(code, source) {
  const direct = parseProductUrl(source);
  if (direct?.code === code) return direct;
  const searchUrls = [
    `${FINFO_BASE}/products?q%5Bkeyword%5D=${encodeURIComponent(code)}`,
    `${FINFO_BASE}/products/${encodeURIComponent(code)}-`,
  ];
  for (const searchUrl of searchUrls) {
    try {
      const html = await fetchFinfoText(searchUrl, MAX_HTML_BYTES, "text/html");
      const product = productLinksFromHtml(html, code)[0];
      if (product) return product;
    } catch {
      // Try the alternate public lookup route before returning not found.
    }
  }
  return null;
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

function optionsWithPlan(options, plan) {
  const selectedPlan = normalizeSpace(plan);
  if (!options || !selectedPlan) return options;
  return {
    ...options,
    hottest_combination: {
      ...(options.hottest_combination || {}),
      plan: selectedPlan,
      insured_amount: null,
    },
  };
}

function termYears(value) {
  const text = String(value ?? "");
  if (/一年期|一年/.test(text)) return 1;
  const match = text.match(/(\d{1,2})\s*(?:年期|年|year)/i);
  return match ? Number(match[1]) : 0;
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

function parseCoverageWan(options) {
  const hot = options?.hottest_combination || {};
  const amount = Number(hot.insured_amount || 0);
  if (amount) return options?.unit === "ten_thousand_dollars" ? amount : amount >= 10000 ? amount / 10000 : amount;
  const planText = String(hot.plan || optionValue(options?.plan) || "");
  const wan = planText.match(/(\d+(?:\.\d+)?)\s*萬/);
  return wan ? Number(wan[1]) : 0;
}

function formatWanAmount(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : String(number).replace(/\.0+$/, "");
}

function planNameFromOptions(options) {
  return normalizeSpace(String(options?.hottest_combination?.plan || optionValue(options?.plan) || ""));
}

function coverageLabelFromOptions(options, coverageWan) {
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

function hnrdBenefits() {
  return [
    { item: "每日病房費", amount: "1,000 元/日", note: "一般住院實支實付；Finfo 公開頁列示" },
    { item: "加護病房", amount: "3,000 元/日", note: "Finfo 公開頁列示" },
    { item: "住院醫療雜費", amount: "90,000 元/次", note: "住院雜費；此商品須搭配 HNRC 同時購買" },
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
    const label = options.find((plan) => planLabelMatches(plan, "計劃三")) || "計劃三";
    return { [label]: hnrdBenefits() };
  }
  return {};
}

function benefitsForKnownPlan(code, planLabel, planOptions = []) {
  const tables = knownPlanBenefitTables(code, planOptions);
  const selected = normalizeSpace(planLabel);
  const exact = tables[selected];
  if (exact) return exact;
  const match = Object.entries(tables).find(([plan]) => planLabelMatches(plan, selected));
  return match ? match[1] : (normalizeCode(code) === "HNRD" ? hnrdBenefits() : []);
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

function parseEndAge(text, options) {
  const period = String(options?.period_of_insurance || "");
  if (/保障終身/.test(period)) return { endAge: 110, endAgeKnown: true };
  for (const source of [period, text]) {
    const match = source.match(/(?:最高保障至|續保至|保障至)\s*(\d{2,3})\s*歲/);
    if (match) return { endAge: Math.min(110, Number(match[1])), endAgeKnown: true };
  }
  const max = Number(options?.insurable_age_bound?.max || 0);
  return { endAge: max || 100, endAgeKnown: Boolean(max) };
}

function parseDocuments(html) {
  const documents = {};
  for (const match of String(html).matchAll(/<a[^>]+href=["']([^"']*drive\.google[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeHtml(match[1]);
    const label = htmlText(match[2]);
    if (/DM/i.test(label)) documents.dm = href;
    else if (/條款/.test(label)) documents.terms = href;
    else if (/費率/.test(label)) documents.rates = href;
  }
  return documents;
}

async function loadOptions(slug, preferredAge) {
  const ages = [...new Set([preferredAge, 35, 30, 20, 15, 1, 0, 40, 50, 60, 65, 70]
    .map((age) => Math.max(0, Math.min(100, Number(age) || 0))))];
  for (const age of ages) {
    try {
      const url = `${FINFO_BASE}/api/products/${encodeURIComponent(slug)}/product_options?age=${age}&ignore_renewal_limit=true`;
      const options = await fetchFinfoJson(url);
      if (options && !options.status) return { age, options };
    } catch {
      // Try another valid age before reporting the product as basic-only.
    }
  }
  return { age: preferredAge, options: null };
}

async function loadJobs(slug, age) {
  try {
    const payload = await fetchFinfoJson(`${FINFO_BASE}/api/products/${encodeURIComponent(slug)}/jobs?age=${age}`);
    return Array.isArray(payload.jobs) ? payload.jobs : [];
  } catch {
    return [];
  }
}

function premiumParams({ age, options, jobs, gender, plan = "" }) {
  const hot = options?.hottest_combination || {};
  const params = new URLSearchParams({ age: String(age), gender });
  const job = jobs.find(Boolean);
  if (job != null) params.set("job", String(job));
  const term = hot.term ?? optionValue(options?.term);
  if (term) params.set("term", String(term));
  const selectedPlan = normalizeSpace(plan) || hot.plan || optionValue(options?.plan);
  if (selectedPlan) params.set("plan", String(selectedPlan));
  const amount = hot.insured_amount ?? optionValue(options?.db);
  if (amount) params.set("insured_amount", String(amount));
  const renewal = optionValue(options?.is_renewal);
  if (renewal) params.set("is_renewal", String(renewal));
  return params;
}

async function loadRates({ slug, startAge, options, jobs, gender, plan = "" }) {
  if (!options) return [];
  const params = premiumParams({ age: startAge, options, jobs, gender, plan });
  const payload = await fetchFinfoJson(`${FINFO_BASE}/api/products/${encodeURIComponent(slug)}/premiums?${params}`);
  const prices = Array.isArray(payload.price) ? payload.price : [];
  return prices.slice(1)
    .map((premium, index) => ({ age: startAge + index, premium: Number(premium) || 0 }))
    .filter((row) => row.premium > 0);
}

function premiumAtAge(rows, age) {
  return rows.find((row) => row.age === age)?.premium
    || rows.find((row) => row.age > age)?.premium
    || rows.at(-1)?.premium
    || 0;
}

function displayedPremium(html) {
  const match = String(html).match(/年繳保費\s*<span[^>]*>\s*([\d,]+)\s*<\/span>/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function saleStatusFromPage(text) {
  const value = String(text || "");
  if (/現售中/.test(value)) return "active";
  if (/停售/.test(value)) return "discontinued";
  return "unknown";
}

function catalogRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.productCatalog)) return payload.productCatalog;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function catalogSourceForCode(request, env, code) {
  if (!env?.ASSETS) return "";
  try {
    const productsUrl = new URL("/products.json", request.url);
    const response = await env.ASSETS.fetch(new Request(productsUrl));
    if (!response.ok) return "";
    const payload = await response.json();
    const product = catalogRows(payload).find((item) => normalizeCode(item.code) === code);
    const sourceUrl = normalizeSpace(product?.sourceUrl || product?.productUrl || "");
    return parseProductUrl(sourceUrl)?.code === code ? sourceUrl : "";
  } catch {
    return "";
  }
}

async function buildProduct(code, source, preferredAge, preferredGender, preferredPlan = "") {
  const parsed = await resolveProduct(code, source);
  if (!parsed) return null;
  const html = await fetchFinfoText(parsed.sourceUrl, MAX_HTML_BYTES, "text/html");
  const text = htmlText(html);
  const saleStatus = saleStatusFromPage(text);
  const optionResult = await loadOptions(parsed.slug, preferredAge);
  const rawOptions = optionResult.options;
  const planOptions = optionArray(rawOptions?.plan);
  const selectedPlan = planOptions.find((plan) => planLabelMatches(plan, preferredPlan)) || normalizeSpace(preferredPlan);
  const options = optionsWithPlan(rawOptions, selectedPlan);
  const minAge = Math.max(0, Number(options?.insurable_age_bound?.min ?? optionResult.age ?? preferredAge));
  const maxAge = Math.max(minAge, Number(options?.insurable_age_bound?.max ?? minAge));
  const startAge = Math.min(minAge, maxAge);
  const jobs = await loadJobs(parsed.slug, startAge);
  const [male, female] = await Promise.all([
    loadRates({ slug: parsed.slug, startAge, options, jobs, gender: "male", plan: selectedPlan }).catch(() => []),
    loadRates({ slug: parsed.slug, startAge, options, jobs, gender: "female", plan: selectedPlan }).catch(() => []),
  ]);
  const rateTablesByGender = Object.fromEntries([
    ["male", male],
    ["female", female],
  ].filter(([, rows]) => rows.length));
  const selectedRows = preferredGender === "female" && female.length ? female : male.length ? male : female;
  const coverageWan = parseCoverageWan(options);
  const planName = planNameFromOptions(options);
  const coverageLabel = coverageLabelFromOptions(options, coverageWan);
  const category = categoryFromName(parsed.fullName);
  const hotTerm = String(options?.hottest_combination?.term || optionValue(options?.term) || "");
  const optionSummary = [
    options?.subcate,
    options?.period_of_insurance,
    options?.feature,
    hotTerm,
    planName,
  ].filter(Boolean).join("；");
  const planBenefitTables = knownPlanBenefitTables(parsed.code, planOptions);
  const knownBenefits = benefitsForKnownPlan(parsed.code, coverageLabel, planOptions);
  const benefits = knownBenefits.length
    ? knownBenefits
    : inferBenefitsFromProduct({
      fullName: parsed.fullName,
      category,
      coverageWan,
      coverageLabel,
      text: `${optionSummary} ${extractBenefitText(text)}`,
    });
  const premiumTermYears = termYears(hotTerm);
  const endAge = parseEndAge(text, options);
  const hasRates = Boolean(male.length || female.length);
  const referencePremium = displayedPremium(html);
  const annualPremium = hasRates ? premiumAtAge(selectedRows, preferredAge) : 0;
  const availableTerms = [...new Set((Array.isArray(options?.term) ? options.term : [options?.term])
    .filter(Boolean).map(String))];

  return {
    code: parsed.code,
    aliases: [],
    name: parsed.name,
    insurer: parsed.insurer,
    category,
    contractType: /附約|附加條款/.test(parsed.fullName) ? "rider" : "main",
    coverageWan,
    planName,
    coverageLabel,
    planOptions,
    planBenefitTables,
    annualPremium,
    endAge: endAge.endAge,
    endAgeKnown: endAge.endAgeKnown,
    premiumMode: hasRates ? "ageBand" : "level",
    rateBasis: premiumTermYears > 1 ? "issueAge" : "attainedAge",
    premiumTerm: hotTerm,
    premiumTermYears,
    availableTerms,
    premiumChange: hasRates
      ? "已由 Finfo 公開保費 API 即時取得男女年齡費率；實際金額仍以保險公司正式費率表為準。"
      : "已取得商品選項，但公開保費 API 未提供完整級距；系統會保留費率文件供每週批次解析。",
    premiumBands: selectedRows.slice(0, 12).map((row) => ({ age: `${row.age}歲`, premium: row.premium })),
    rateStatus: hasRates ? "ready" : "missing",
    ratePricingModel: hasRates ? "planTotal" : "coverageUnit",
    termRatePricingModel: "coverageUnit",
    rateUnitCoverage: Math.max(10000, coverageWan * 10000),
    rateSource: parsed.sourceUrl,
    rateTable: selectedRows,
    rateTablesByGender,
    referencePremium,
    source: "finfo-live",
    sourceName: "Finfo保險資訊站即時公開資料",
    sourceUrl: parsed.sourceUrl,
    effectiveDate: parsed.effectiveDate,
    saleStatus,
    saleStatusCheckedAt: new Date().toISOString(),
    documents: parseDocuments(html),
    purchaseRequirements: knownPurchaseRequirements(parsed.code),
    benefits,
    note: `即時查詢於 ${new Date().toISOString()}；${options?.period_of_insurance || "保障期間待正式文件確認"}`,
  };
}

async function registerAccount(request, env) {
  if (request.method !== "POST") return privateJsonResponse({ error: "method_not_allowed" }, 405, { allow: "POST" });
  if (!sameOriginRequest(request)) return privateJsonResponse({ error: "invalid_origin" }, 403);
  const payload = await readJsonBody(request, MAX_AUTH_JSON_BYTES);
  const username = normalizeUsername(payload.username);
  const password = String(payload.password || "");
  const name = displayName(payload.displayName, username);
  const privacyAccepted = payload.privacyAccepted === true;
  if (!validUsername(username)) {
    return privateJsonResponse({ error: "invalid_username", message: "帳號需為 4 至 40 個英文字母、數字或 . _ @ -" }, 400);
  }
  if (password.length < 8 || password.length > 128) {
    return privateJsonResponse({ error: "invalid_password", message: "密碼至少需要 8 個字元" }, 400);
  }
  if (!name) return privateJsonResponse({ error: "invalid_display_name", message: "請輸入顯示名稱" }, 400);
  if (!privacyAccepted) {
    return privateJsonResponse({ error: "privacy_consent_required", message: "請先同意敏感資料儲存與同步說明" }, 400);
  }
  const isAuthorizedLoadTest = authorizedLoadTest(request, env);
  const registerKey = isAuthorizedLoadTest ? "" : await rateLimitKey(request, "register");
  if (!isAuthorizedLoadTest) {
    const registerLimit = await rateLimitStatus(env, registerKey, REGISTER_WINDOW_MS, REGISTER_MAX_ATTEMPTS);
    if (registerLimit.blocked) {
      return privateJsonResponse({ error: "too_many_registrations", message: "建立帳號次數過多，請稍後再試" }, 429, {
        "retry-after": String(registerLimit.retryAfter),
      });
    }
    await recordRateLimitFailure(env, registerKey, REGISTER_WINDOW_MS);
  }

  const userId = crypto.randomUUID();
  const salt = randomToken(18);
  const hash = await passwordHash(password, salt);
  const now = Date.now();
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, username, display_name, password_hash, password_salt, password_iterations, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(userId, username, name, hash, salt, PASSWORD_ITERATIONS, now, now).run();
  } catch (error) {
    if (/UNIQUE|constraint/i.test(String(error?.message || error))) {
      return privateJsonResponse({ error: "username_exists", message: "這個帳號已被使用" }, 409);
    }
    throw error;
  }
  const cookie = await createSession(request, env, userId);
  return privateJsonResponse({
    authenticated: true,
    user: { id: userId, username, displayName: name },
    hasData: false,
  }, 201, { "set-cookie": cookie });
}

async function loginAccount(request, env) {
  if (request.method !== "POST") return privateJsonResponse({ error: "method_not_allowed" }, 405, { allow: "POST" });
  if (!sameOriginRequest(request)) return privateJsonResponse({ error: "invalid_origin" }, 403);
  const payload = await readJsonBody(request, MAX_AUTH_JSON_BYTES);
  const username = normalizeUsername(payload.username);
  const password = String(payload.password || "");
  const loginKey = await rateLimitKey(request, "login", username);
  const loginLimit = await rateLimitStatus(env, loginKey, LOGIN_WINDOW_MS, LOGIN_MAX_FAILURES);
  if (loginLimit.blocked) {
    return privateJsonResponse({ error: "too_many_login_attempts", message: "登入失敗次數過多，請稍後再試" }, 429, {
      "retry-after": String(loginLimit.retryAfter),
    });
  }
  const row = validUsername(username)
    ? await env.DB.prepare(
      "SELECT id, username, display_name, password_hash, password_salt, password_iterations FROM users WHERE username = ?",
    ).bind(username).first()
    : null;
  const storedIterations = storedPasswordIterations(row?.password_iterations);
  const candidate = await passwordHash(
    password,
    row?.password_salt || "jarvis-insurance-invalid-account",
    storedIterations,
  );
  if (!row || !constantTimeEqual(candidate, row.password_hash)) {
    await recordRateLimitFailure(env, loginKey, LOGIN_WINDOW_MS);
    return privateJsonResponse({ error: "invalid_credentials", message: "帳號或密碼不正確" }, 401);
  }
  await clearRateLimit(env, loginKey);
  if (storedIterations < PASSWORD_ITERATIONS || Number(row.password_iterations) !== storedIterations) {
    const upgradedSalt = randomToken(18);
    const upgradedHash = await passwordHash(password, upgradedSalt, PASSWORD_ITERATIONS);
    await env.DB.prepare(
      `UPDATE users
       SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = ?
       WHERE id = ?`,
    ).bind(upgradedHash, upgradedSalt, PASSWORD_ITERATIONS, Date.now(), row.id).run();
    console.log(JSON.stringify({ event: "account_password_hash_upgraded", userId: row.id }));
  }
  const cookie = await createSession(request, env, row.id);
  const stored = await env.DB.prepare("SELECT revision FROM user_data WHERE user_id = ?").bind(row.id).first();
  return privateJsonResponse({
    authenticated: true,
    user: publicUser(row),
    hasData: Boolean(stored),
  }, 200, { "set-cookie": cookie });
}

async function logoutAccount(request, env) {
  if (request.method !== "POST") return privateJsonResponse({ error: "method_not_allowed" }, 405, { allow: "POST" });
  if (!sameOriginRequest(request)) return privateJsonResponse({ error: "invalid_origin" }, 403);
  const session = await currentSession(request, env);
  if (session) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(session.tokenHash).run();
  }
  return privateJsonResponse({ authenticated: false }, 200, {
    "set-cookie": sessionCookie(request, "", 0),
  });
}

async function accountSession(request, env) {
  if (request.method !== "GET") return privateJsonResponse({ error: "method_not_allowed" }, 405, { allow: "GET" });
  const session = await currentSession(request, env);
  if (!session) return privateJsonResponse({ authenticated: false });
  const stored = await env.DB.prepare(
    "SELECT revision, updated_at FROM user_data WHERE user_id = ?",
  ).bind(session.user.id).first();
  return privateJsonResponse({
    authenticated: true,
    user: session.user,
    hasData: Boolean(stored),
    revision: Number(stored?.revision || 0),
    updatedAt: Number(stored?.updated_at || 0),
  });
}

async function accountData(request, env) {
  const session = await currentSession(request, env);
  if (!session) return privateJsonResponse({ error: "authentication_required", message: "請先登入" }, 401);

  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT data_json, revision, updated_at FROM user_data WHERE user_id = ?",
    ).bind(session.user.id).first();
    if (!row) return privateJsonResponse({ data: null, revision: 0, updatedAt: 0 });
    return privateJsonResponse({
      data: JSON.parse(row.data_json),
      revision: Number(row.revision || 0),
      updatedAt: Number(row.updated_at || 0),
    });
  }

  if (request.method !== "PUT") {
    return privateJsonResponse({ error: "method_not_allowed" }, 405, { allow: "GET, PUT" });
  }
  if (!sameOriginRequest(request)) return privateJsonResponse({ error: "invalid_origin" }, 403);
  const payload = await readJsonBody(request, MAX_ACCOUNT_DATA_BYTES);
  if (!validAccountData(payload.data)) {
    return privateJsonResponse({ error: "invalid_account_data", message: "保單資料格式不正確" }, 400);
  }
  const dataJson = JSON.stringify(payload.data);
  if (new TextEncoder().encode(dataJson).byteLength > MAX_ACCOUNT_DATA_BYTES) {
    return privateJsonResponse({ error: "account_data_too_large", message: "保單資料超過同步上限" }, 413);
  }
  const expectedRevision = Math.max(0, Math.floor(Number(payload.revision) || 0));
  const now = Date.now();
  const writeResult = expectedRevision === 0
    ? await env.DB.prepare(
      `INSERT OR IGNORE INTO user_data (user_id, data_json, revision, updated_at)
       VALUES (?, ?, 1, ?)`,
    ).bind(session.user.id, dataJson, now).run()
    : await env.DB.prepare(
      `UPDATE user_data
       SET data_json = ?, revision = revision + 1, updated_at = ?
       WHERE user_id = ? AND revision = ?`,
    ).bind(dataJson, now, session.user.id, expectedRevision).run();
  const changes = Number(writeResult?.meta?.changes ?? writeResult?.changes ?? 0);
  if (changes !== 1) {
    const current = await env.DB.prepare(
      "SELECT data_json, revision, updated_at FROM user_data WHERE user_id = ?",
    ).bind(session.user.id).first();
    console.warn(JSON.stringify({
      event: "account_sync_conflict",
      userId: session.user.id,
      expectedRevision,
      currentRevision: Number(current?.revision || 0),
    }));
    return privateJsonResponse({
      error: "sync_conflict",
      message: "另一台裝置已更新資料，正在安全合併",
      data: current?.data_json ? JSON.parse(current.data_json) : null,
      revision: Number(current?.revision || 0),
      updatedAt: Number(current?.updated_at || 0),
    }, 409);
  }
  const updated = await env.DB.prepare(
    "SELECT revision, updated_at FROM user_data WHERE user_id = ?",
  ).bind(session.user.id).first();
  return privateJsonResponse({
    saved: true,
    revision: Number(updated?.revision || 1),
    updatedAt: Number(updated?.updated_at || now),
  });
}

async function deleteAccount(request, env) {
  if (request.method !== "DELETE") return privateJsonResponse({ error: "method_not_allowed" }, 405, { allow: "DELETE" });
  if (!sameOriginRequest(request)) return privateJsonResponse({ error: "invalid_origin" }, 403);
  const session = await currentSession(request, env);
  if (!session) return privateJsonResponse({ error: "authentication_required", message: "請先登入" }, 401);
  const payload = await readJsonBody(request, MAX_AUTH_JSON_BYTES);
  const password = String(payload.password || "");
  const deleteKey = await rateLimitKey(request, "delete", session.user.username);
  const deleteLimit = await rateLimitStatus(env, deleteKey, LOGIN_WINDOW_MS, LOGIN_MAX_FAILURES);
  if (deleteLimit.blocked) {
    return privateJsonResponse({ error: "too_many_delete_attempts", message: "驗證失敗次數過多，請稍後再試" }, 429, {
      "retry-after": String(deleteLimit.retryAfter),
    });
  }
  const row = await env.DB.prepare(
    "SELECT password_hash, password_salt, password_iterations FROM users WHERE id = ?",
  ).bind(session.user.id).first();
  const candidate = await passwordHash(
    password,
    row?.password_salt || "jarvis-insurance-invalid-account",
    storedPasswordIterations(row?.password_iterations),
  );
  if (!row || !constantTimeEqual(candidate, row.password_hash)) {
    await recordRateLimitFailure(env, deleteKey, LOGIN_WINDOW_MS);
    return privateJsonResponse({ error: "invalid_credentials", message: "密碼不正確" }, 401);
  }
  await clearRateLimit(env, deleteKey);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM user_data WHERE user_id = ?").bind(session.user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(session.user.id),
    env.DB.prepare("DELETE FROM users WHERE id = ?").bind(session.user.id),
  ]);
  console.log(JSON.stringify({ event: "account_deleted", userId: session.user.id }));
  return privateJsonResponse({ deleted: true, authenticated: false }, 200, {
    "set-cookie": sessionCookie(request, "", 0),
  });
}

async function handleAccountRequest(request, env) {
  if (!env.DB) return privateJsonResponse({ error: "account_storage_unavailable" }, 503);
  const pathname = new URL(request.url).pathname;
  if (pathname === "/api/auth/register") return registerAccount(request, env);
  if (pathname === "/api/auth/login") return loginAccount(request, env);
  if (pathname === "/api/auth/logout") return logoutAccount(request, env);
  if (pathname === "/api/auth/session") return accountSession(request, env);
  if (pathname === "/api/account/data") return accountData(request, env);
  if (pathname === "/api/account") return deleteAccount(request, env);
  return privateJsonResponse({ error: "not_found" }, 404);
}

function secureAssetResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("content-security-policy", "default-src 'self'; connect-src 'self' https://finfo.tw; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handleProductRequest(request, env, ctx) {
  if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405, { allow: "GET" });
  const url = new URL(request.url);
  const code = normalizeCode(url.searchParams.get("code"));
  if (!/^[A-Z0-9]{1,20}$/.test(code)) return jsonResponse({ error: "invalid_product_code" }, 400);

  const preferredAge = Math.max(0, Math.min(100, Number(url.searchParams.get("age")) || 35));
  const preferredGender = url.searchParams.get("gender") === "female" ? "female" : "male";
  let source = url.searchParams.get("source") || "";
  const preferredPlan = normalizeSpace(url.searchParams.get("plan") || "");
  if (parseProductUrl(source)?.code !== code) {
    source = await catalogSourceForCode(request, env, code) || source;
  }

  const cacheUrl = new URL("/api/product", url.origin);
  cacheUrl.searchParams.set("schema", LIVE_CACHE_VERSION);
  cacheUrl.searchParams.set("code", code);
  cacheUrl.searchParams.set("age", String(preferredAge));
  cacheUrl.searchParams.set("gender", preferredGender);
  if (preferredPlan) cacheUrl.searchParams.set("plan", preferredPlan);
  const parsedSource = parseProductUrl(source);
  if (parsedSource?.code === code) cacheUrl.searchParams.set("version", parsedSource.effectiveDate);
  const cacheKey = new Request(cacheUrl, { method: "GET" });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const product = await buildProduct(code, source, preferredAge, preferredGender, preferredPlan);
  if (!product) return jsonResponse({ error: "product_not_found", code }, 404);

  const response = jsonResponse({ product, fetchedAt: new Date().toISOString() });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/auth/") || url.pathname.startsWith("/api/account")) {
      try {
        return await handleAccountRequest(request, env);
      } catch (error) {
        console.error(JSON.stringify({ event: "account_api_failed", message: error?.message || String(error) }));
        const status = error?.message === "request_too_large" ? 413 : error instanceof SyntaxError ? 400 : 500;
        return privateJsonResponse({ error: status === 500 ? "account_request_failed" : error.message }, status);
      }
    }
    if (url.pathname === "/api/product") {
      try {
        return await handleProductRequest(request, env, ctx);
      } catch (error) {
        console.error(JSON.stringify({ event: "finfo_live_lookup_failed", message: error?.message || String(error) }));
        return jsonResponse({ error: "upstream_lookup_failed" }, 502);
      }
    }
    return secureAssetResponse(await env.ASSETS.fetch(request));
  },
};
