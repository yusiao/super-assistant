const $ = (selector) => document.querySelector(selector);
const form = $("#warrant-form");
const input = $("#warrant-code");
const searchButton = $("#search-button");
const refreshButton = $("#refresh-button");
const result = $("#result");
const rankingResult = $("#ranking-result");
const emptyState = $("#empty-state");
const message = $("#form-message");
const livePill = $("#live-pill");
const recent = $("#recent");
const recentList = $("#recent-list");
const dialog = $("#info-dialog");
const rankButton = $("#rank-button");

let activeCode = "";
let activeStock = "";
let activeMode = "";
let refreshTimer = null;
let inFlight = false;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  lookup(input.value, false);
});

input.addEventListener("input", () => {
  input.value = normalizeCode(input.value);
  message.textContent = "";
});

refreshButton.addEventListener("click", () => activeCode && lookup(activeCode, true));
rankButton.addEventListener("click", () => activeStock && lookupRankings(activeStock, false, false));
livePill.addEventListener("click", () => {
  if (activeMode === "ranking" && activeStock) lookupRankings(activeStock, true, result.hidden);
  else if (activeCode) lookup(activeCode, true);
});
$("#value-info").addEventListener("click", () => dialog.showModal());
$("#dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => event.target === dialog && dialog.close());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && activeMode === "warrant" && activeCode) lookup(activeCode, true);
});

function validCode(value) {
  return /^[0-9A-Z]{5,6}$/.test(value);
}
function validStockCode(value) {
  return /^[0-9]{4}$/.test(value);
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 6);
}

async function lookup(rawCode, silent) {
  const code = normalizeCode(rawCode);
  if (validStockCode(code)) return lookupRankings(code, silent, true);
  if (!validCode(code)) {
    message.textContent = "請輸入 5～6 碼權證代號，或 4 碼股票代號。";
    input.focus();
    return;
  }
  if (inFlight) return;
  inFlight = true;
  activeCode = code;
  activeMode = "warrant";
  input.value = code;
  setLoading(true, silent);

  try {
    const response = await fetch(`/api/warrant?code=${encodeURIComponent(code)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "行情服務暫時無法回應。請稍後再試。");
    render(payload);
    remember(code);
    syncUrl(code);
    message.textContent = "";
    scheduleRefresh();
  } catch (error) {
    message.textContent = error.message;
    setLiveState("error", "更新失敗");
    if (!result.hidden) scheduleRefresh(12_000);
  } finally {
    inFlight = false;
    setLoading(false, silent);
  }
}

async function lookupRankings(rawStock, silent, standalone) {
  const stock = normalizeCode(rawStock);
  if (!validStockCode(stock)) {
    message.textContent = "請輸入 4 碼股票代號，例如 2317。";
    input.focus();
    return;
  }
  if (inFlight) return;
  inFlight = true;
  activeStock = stock;
  activeMode = "ranking";
  input.value = stock;
  clearTimeout(refreshTimer);
  setLoading(true, silent);

  try {
    const response = await fetch(`/api/rankings?stock=${encodeURIComponent(stock)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "排行服務暫時無法回應。請稍後再試。");
    renderRanking(payload, standalone);
    remember(stock);
    syncRankingUrl(stock);
    message.textContent = "";
  } catch (error) {
    message.textContent = error.message;
    setLiveState("error", "排行失敗");
  } finally {
    inFlight = false;
    setLoading(false, silent);
  }
}

function render(data) {
  const u = data.underlying;
  const w = data.warrant;
  const v = data.valuation;
  const terms = data.terms;
  setText("#market-tag", data.market === "tse" ? "上市" : "上櫃");
  setText("#kind-tag", data.kind === "call" ? "認購" : "認售");
  setText("#warrant-name", w.name);
  setText("#warrant-code-label", w.code);
  setText("#underlying-name", u.name);
  setText("#underlying-code", u.code);
  setText("#underlying-price", price(u.price));

  const changeEl = $("#underlying-change");
  const sign = u.change > 0 ? "+" : "";
  changeEl.textContent = `${sign}${price(u.change)}  ${sign}${number(u.changePercent, 2)}%`;
  changeEl.className = u.change > 0 ? "up" : u.change < 0 ? "down" : "";

  setText("#warrant-last", price(w.last));
  setText("#warrant-bid", price(w.bid));
  setText("#warrant-ask", price(w.ask));
  setText("#trade-status", w.last == null ? "尚無成交" : "最新成交");
  setText("#intrinsic-value", price(v.intrinsic));
  setText("#value-state", v.intrinsic > 0 ? `${data.kind === "call" ? "認購" : "認售"}價內` : "目前價外／價平");
  setText("#strike", price(terms.strike));
  setText("#ratio", `1 : ${number(terms.ratio, 4)}`);
  setText("#moneyness", `${v.inTheMoney ? "價內" : v.moneyness === 0 ? "價平" : "價外"} ${number(Math.abs(v.moneyness), 2)}%`);
  setText("#expiry", terms.expiry || "—");
  setText("#time-value", w.last == null ? "—" : price(v.timeValue));
  setText("#break-even", v.breakEven == null ? "—" : price(v.breakEven));
  setText("#quote-time", `${formatDate(data.quoteAt)}\n${u.priceSource === "last" ? "成交價" : "參考價"}`);
  renderRecommendation(data.recommendation);
  $("#data-note").textContent = data.notice;
  result.hidden = false;
  rankingResult.hidden = true;
  emptyState.hidden = true;
  activeStock = u.code;
  rankButton.disabled = false;
  setLiveState("live", "每 5 秒更新");
}

function renderRanking(data, standalone) {
  const stock = data.stock || {};
  setText("#ranking-stock-name", stock.name);
  setText("#ranking-stock-code", stock.code);
  setText("#ranking-stock-price", price(stock.price));
  setText("#ranking-summary", `${data.methodology?.summary || "依條件分數排序。"} 共評估 ${number(data.universe?.scored, 0)} 檔。`);
  renderRankingList("#ranking-call-list", data.ranking?.calls || []);
  renderRankingList("#ranking-put-list", data.ranking?.puts || []);
  rankingResult.hidden = false;
  if (standalone) result.hidden = true;
  emptyState.hidden = true;
  setLiveState("live", "排行已更新");
}

function renderRankingList(selector, items) {
  const list = $(selector);
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "ranking-empty";
    empty.textContent = "目前沒有足夠資料可排序。";
    list.replaceChildren(empty);
    return;
  }
  list.replaceChildren(...items.map((item, index) => rankingCard(item, index + 1)));
}

function rankingCard(item, rank) {
  const card = document.createElement("article");
  card.className = "ranking-item";

  const head = document.createElement("div");
  head.className = "ranking-item-head";
  const title = document.createElement("div");
  const rankEl = document.createElement("span");
  rankEl.textContent = `#${rank}`;
  const codeEl = document.createElement("strong");
  codeEl.textContent = item.code;
  const nameEl = document.createElement("small");
  nameEl.textContent = item.name;
  title.append(rankEl, codeEl, nameEl);
  const score = document.createElement("b");
  score.className = `recommendation-label ${item.tone || ""}`.trim();
  score.textContent = `${item.score} ${item.label}`;
  head.append(title, score);

  const metrics = document.createElement("div");
  metrics.className = "ranking-metrics";
  metrics.append(
    miniMetric("買／賣", `${price(item.quote?.bid)} / ${price(item.quote?.ask)}`),
    miniMetric("履約價", price(item.terms?.strike)),
    miniMetric("損平", price(item.valuation?.breakEven)),
    miniMetric("到期", item.terms?.expiry || "—")
  );

  const reasons = document.createElement("ul");
  reasons.className = "ranking-reasons";
  for (const reason of (item.reasons || []).slice(0, 2)) {
    const li = document.createElement("li");
    li.textContent = reason;
    reasons.append(li);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "查看淨值";
  button.addEventListener("click", () => lookup(item.code, false));

  card.append(head, metrics, reasons, button);
  return card;
}

function miniMetric(label, value) {
  const box = document.createElement("span");
  const labelEl = document.createElement("i");
  labelEl.textContent = label;
  const valueEl = document.createElement("b");
  valueEl.textContent = value;
  box.append(labelEl, valueEl);
  return box;
}

function renderRecommendation(recommendation) {
  const scoreEl = $("#recommendation-score");
  const labelEl = $("#recommendation-label");
  const summaryEl = $("#recommendation-summary");
  const reasonsEl = $("#recommendation-reasons");
  if (!scoreEl || !labelEl || !summaryEl || !reasonsEl) return;

  const score = Number(recommendation?.score);
  scoreEl.textContent = Number.isFinite(score) ? String(Math.round(score)) : "—";
  labelEl.textContent = recommendation?.label || "—";
  labelEl.className = `recommendation-label ${recommendation?.tone || ""}`.trim();
  summaryEl.textContent = recommendation?.summary || "依流動性、損益兩平、價內外程度與到期天數評估。";

  const reasons = Array.isArray(recommendation?.reasons) ? recommendation.reasons.slice(0, 4) : [];
  reasonsEl.replaceChildren(...reasons.map((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    return item;
  }));
}

function setText(selector, value) { $(selector).textContent = value ?? "—"; }
function number(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("zh-TW", { minimumFractionDigits: 0, maximumFractionDigits: digits });
}
function price(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const n = Number(value);
  return n.toLocaleString("zh-TW", { minimumFractionDigits: n < 10 ? 2 : 1, maximumFractionDigits: n < 10 ? 4 : 2 });
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}
function setLoading(value, silent) {
  searchButton.disabled = value;
  refreshButton.classList.toggle("loading", value);
  if (value && !silent) searchButton.querySelector("span").textContent = "查詢中";
  else searchButton.querySelector("span").textContent = "查詢";
}
function setLiveState(state, label) {
  livePill.className = `live-pill ${state}`;
  livePill.querySelector("span").textContent = label;
}
function scheduleRefresh(delay = 5_000) {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    if (!document.hidden && activeCode) lookup(activeCode, true);
    else scheduleRefresh(delay);
  }, delay);
}
function remember(code) {
  const codes = [code, ...loadRecent().filter((item) => item !== code)].slice(0, 4);
  localStorage.setItem("warrant-now-recent", JSON.stringify(codes));
  renderRecent();
}
function loadRecent() {
  try { return JSON.parse(localStorage.getItem("warrant-now-recent")) || []; }
  catch { return []; }
}
function renderRecent() {
  const codes = loadRecent();
  recent.hidden = codes.length === 0;
  recentList.replaceChildren(...codes.map((code) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = code;
    button.addEventListener("click", () => lookup(code, false));
    return button;
  }));
}

function initialCodeFromUrl() {
  const code = normalizeCode(new URL(window.location.href).searchParams.get("code"));
  return validCode(code) ? code : "";
}
function initialStockFromUrl() {
  const stock = normalizeCode(new URL(window.location.href).searchParams.get("stock"));
  return validStockCode(stock) ? stock : "";
}

function syncUrl(code) {
  if (!validCode(code)) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get("code") === code && !url.searchParams.has("stock")) return;
  url.searchParams.set("code", code);
  url.searchParams.delete("stock");
  window.history.replaceState(null, "", url);
}
function syncRankingUrl(stock) {
  if (!validStockCode(stock)) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get("stock") === stock && !url.searchParams.has("code")) return;
  url.searchParams.set("stock", stock);
  url.searchParams.delete("code");
  window.history.replaceState(null, "", url);
}

renderRecent();
const initialStock = initialStockFromUrl();
const initialCode = initialCodeFromUrl();
if (initialStock) {
  input.value = initialStock;
  lookupRankings(initialStock, false, true);
} else if (initialCode) {
  input.value = initialCode;
  lookup(initialCode, false);
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
