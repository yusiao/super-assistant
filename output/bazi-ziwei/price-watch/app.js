const state = {
  activeType: "product",
  lastProductQuery: "",
  lastFlightPayload: null,
  flightMode: "annual_low",
  results: [],
  config: null,
};

const elements = {
  settingsButton: document.querySelector("#settingsButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  accessTokenInput: document.querySelector("#accessTokenInput"),
  apiBaseInput: document.querySelector("#apiBaseInput"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  statusStrip: document.querySelector("#statusStrip"),
  statusText: document.querySelector("#statusText"),
  productForm: document.querySelector("#productForm"),
  flightForm: document.querySelector("#flightForm"),
  flightModeButtons: document.querySelectorAll("[data-flight-mode]"),
  windowFlightFields: document.querySelector("#windowFlightFields"),
  flightSubmitButton: document.querySelector("#flightSubmitButton"),
  departurePlaces: document.querySelector("#departurePlaces"),
  arrivalPlaces: document.querySelector("#arrivalPlaces"),
  resultList: document.querySelector("#resultList"),
  resultCount: document.querySelector("#resultCount"),
  resultsTitle: document.querySelector("#resultsTitle"),
  flightYearStats: document.querySelector("#flightYearStats"),
  currentYearLabel: document.querySelector("#currentYearLabel"),
  currentYearAverage: document.querySelector("#currentYearAverage"),
  currentYearMeta: document.querySelector("#currentYearMeta"),
  previousYearLabel: document.querySelector("#previousYearLabel"),
  previousYearAverage: document.querySelector("#previousYearAverage"),
  previousYearMeta: document.querySelector("#previousYearMeta"),
  savedList: document.querySelector("#savedList"),
  refreshSavedButton: document.querySelector("#refreshSavedButton"),
  emptyTemplate: document.querySelector("#emptyTemplate"),
};

function token() {
  return localStorage.getItem("priceWatchAccessToken") || "";
}

function apiBase() {
  return (localStorage.getItem("priceWatchApiBase") || "").replace(/\/$/, "");
}

function setStatus(text, kind = "ready") {
  elements.statusStrip.classList.remove("ready", "error");
  elements.statusStrip.classList.add(kind);
  elements.statusText.textContent = text;
}

function money(value, currency = "TWD") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  const rounded = Math.round(number);
  if (currency === "TWD") return `NT$${rounded.toLocaleString("zh-TW")}`;
  return `${currency} ${rounded.toLocaleString("en-US")}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function stableId(prefix, value) {
  let hash = 2166136261;
  for (const character of String(value || "")) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

const placeSearchTimers = new Map();

function schedulePlaceSearch(input) {
  const key = input.dataset.placeInput;
  clearTimeout(placeSearchTimers.get(key));
  const query = input.value.trim();
  if (query.length < 2 || /^[A-Za-z]{3,4}$/.test(query)) return;
  placeSearchTimers.set(
    key,
    setTimeout(async () => {
      try {
        const response = await api("/api/price-watch/places", {
          method: "POST",
          body: JSON.stringify({
            query,
            market: elements.flightForm.elements.market.value || "TW",
            locale: "zh-TW",
            isDestination: key === "arrival",
          }),
        });
        const list = key === "arrival" ? elements.arrivalPlaces : elements.departurePlaces;
        list.replaceChildren();
        (response.places || []).forEach((place) => {
          const option = document.createElement("option");
          option.value = place.iataCode;
          option.label = [place.name, place.subtitle].filter(Boolean).join(" · ");
          list.append(option);
        });
      } catch {
        // Users can still enter an IATA city or airport code directly.
      }
    }, 300),
  );
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token()) headers["X-Price-Watch-Token"] = token();
  const response = await fetch(`${apiBase()}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

function localSaved() {
  try {
    return JSON.parse(localStorage.getItem("priceWatchLocalWatches") || "[]");
  } catch {
    return [];
  }
}

function saveLocalWatch(watch) {
  const existing = localSaved().filter((item) => item.id !== watch.id);
  existing.push(watch);
  localStorage.setItem("priceWatchLocalWatches", JSON.stringify(existing));
}

function emptyNode() {
  return elements.emptyTemplate.content.firstElementChild.cloneNode(true);
}

function resultCard(item) {
  const card = document.createElement("article");
  card.className = "result-card";
  const dateText = item.returnDate ? `${item.departureDate} - ${item.returnDate}` : item.departureDate || "";
  const meta = item.type === "flight"
    ? `<p class="flight-meta">${escapeHtml(item.source || item.airline || "航班")} ${dateText ? ` · ${escapeHtml(dateText)}` : ""}${item.cached ? " · 探索價" : ""}</p>`
    : `<p class="source-line">${escapeHtml(item.source || "來源")}</p>`;
  const actionClass = item.trackable === false ? "action-row single" : "action-row";
  const trackButton = item.trackable === false ? "" : '<button class="track-button" type="button">追蹤</button>';
  card.innerHTML = `
    <div class="result-main">
      <div>
        <h3>${escapeHtml(item.title || "搜尋結果")}</h3>
        ${meta}
      </div>
      <div class="price">${escapeHtml(item.priceText || money(item.price, item.currency))}</div>
    </div>
    <div class="${actionClass}">
      <a class="secondary-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">開啟</a>
      ${trackButton}
    </div>
  `;
  card.querySelector(".track-button")?.addEventListener("click", () => trackResult(item));
  return card;
}

function externalProductResult(query) {
  return {
    id: stableId("external-product", query),
    type: "product",
    title: `Google Shopping：${query}`,
    source: "外部搜尋",
    priceText: "",
    link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
    trackable: false,
  };
}

function externalFlightResult(payload) {
  const query = `${payload.departureId} ${payload.arrivalId} ${payload.startDate || ""}`.trim();
  return {
    id: stableId("external-flight", query),
    type: "flight",
    title: `${payload.departureId}-${payload.arrivalId} Google Flights`,
    source: "外部搜尋",
    airline: "Google Flights",
    priceText: "",
    link: `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`,
    trackable: false,
  };
}

function renderResults(title, results) {
  elements.resultsTitle.textContent = title;
  elements.resultCount.textContent = results.length ? `${results.length} 筆` : "";
  elements.resultList.replaceChildren();
  if (!results.length) {
    elements.resultList.append(emptyNode());
    return;
  }
  results.forEach((item) => elements.resultList.append(resultCard(item)));
}

function revealResults() {
  if (!window.matchMedia("(max-width: 619px)").matches) return;
  requestAnimationFrame(() => {
    document.querySelector(".results-zone")?.scrollIntoView({ behavior: "auto", block: "start" });
  });
}

function renderFlightYearStats(stats, currency = "TWD") {
  if (!stats || !Number.isInteger(Number(stats.year))) {
    elements.flightYearStats.hidden = true;
    return;
  }
  const year = Number(stats.year);
  const previousYear = Number(stats.previousYear || year - 1);
  const currentCount = Number(stats.sampleCount || 0);
  const previousCount = Number(stats.previousSampleCount || 0);
  elements.currentYearLabel.textContent = `${year} 平均`;
  elements.currentYearAverage.textContent = stats.average == null ? "尚無資料" : money(stats.average, currency);
  elements.currentYearMeta.textContent = currentCount ? `${currentCount} 個出發日探索價` : "尚未取得該年報價";
  elements.previousYearLabel.textContent = `${previousYear} 平均`;
  elements.previousYearAverage.textContent = stats.previousAverage == null ? "尚無去年資料" : money(stats.previousAverage, currency);
  elements.previousYearMeta.textContent = previousCount ? `${previousCount} 個每日歷史樣本` : "啟用後開始累積";
  elements.flightYearStats.hidden = false;
}

function watchFromResult(item) {
  const targetInput = state.activeType === "flight"
    ? elements.flightForm.elements.targetPrice
    : elements.productForm.elements.targetPrice;
  const targetPrice = targetInput.value || item.price;
  if (item.type === "flight" && state.lastFlightPayload) {
    const flight = state.lastFlightPayload;
    const modeLabel = flight.flightMode === "annual_low" ? "未來一年最低" : `${flight.startDate} 起 ${flight.lookaheadDays} 天`;
    return {
      type: "flight",
      id: stableId("flight", `${flight.departureId}-${flight.arrivalId}-${flight.flightMode}-${flight.startDate}-${flight.tripDays}`),
      name: `${flight.departureId} 到 ${flight.arrivalId} ${modeLabel}`,
      targetPrice,
      ...flight,
    };
  }
  return {
    type: "product",
    id: stableId("product", state.lastProductQuery || item.title),
    name: state.lastProductQuery || item.title,
    query: state.lastProductQuery || item.title,
    targetPrice,
    currency: item.currency || elements.productForm.elements.currency.value,
  };
}

async function trackResult(item) {
  const payload = watchFromResult(item);
  try {
    const data = await api("/api/price-watch/watches", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStatus(`已加入追蹤：${data.watch.name}`);
    await renderSaved();
  } catch (error) {
    saveLocalWatch(payload);
    setStatus("已存到手機本機追蹤", "ready");
    await renderSaved();
  }
}

async function searchProduct(event) {
  event.preventDefault();
  state.activeType = "product";
  elements.flightYearStats.hidden = true;
  const data = formData(elements.productForm);
  state.lastProductQuery = data.query.trim();
  setStatus("搜尋商品中");
  try {
    const response = await api("/api/price-watch/search", {
      method: "POST",
      body: JSON.stringify({
        type: "product",
        query: data.query,
        currency: data.currency || "TWD",
      }),
    });
    state.results = response.results || [];
    renderResults("商品結果", state.results);
    revealResults();
    setStatus(state.results.length ? "搜尋完成" : "沒有找到價格");
  } catch (error) {
    state.results = [externalProductResult(state.lastProductQuery)];
    renderResults("商品結果", state.results);
    revealResults();
    setStatus("搜尋 API 尚未連線，可先開啟 Google Shopping", "error");
  }
}

async function searchFlight(event) {
  event.preventDefault();
  state.activeType = "flight";
  const data = formData(elements.flightForm);
  const departureId = data.departureId.trim().toUpperCase();
  const arrivalId = data.arrivalId.trim().toUpperCase();
  if (!/^[A-Z]{3,4}$/.test(departureId) || !/^[A-Z]{3,4}$/.test(arrivalId)) {
    setStatus("請從地點建議選擇城市或機場", "error");
    return;
  }
  state.lastFlightPayload = {
    flightMode: state.flightMode,
    departureId,
    arrivalId,
    startDate: state.flightMode === "date_window" ? data.startDate : "",
    tripDays: Number(data.tripDays || 0),
    lookaheadDays: Number(data.lookaheadDays || 30),
    targetPrice: data.targetPrice,
    currency: data.currency || "TWD",
    market: data.market || "TW",
    locale: "zh-TW",
  };
  setStatus(state.flightMode === "annual_low" ? "搜尋未來一年最低價" : "搜尋日期區間票價");
  try {
    const response = await api("/api/price-watch/search", {
      method: "POST",
      body: JSON.stringify({
        type: "flight",
        ...state.lastFlightPayload,
      }),
    });
    state.results = response.results || [];
    renderFlightYearStats(response.insights?.yearStats, response.currency || data.currency || "TWD");
    renderResults(state.flightMode === "annual_low" ? "全年最低票價" : "日期區間票價", state.results);
    revealResults();
    setStatus(state.results.length ? "搜尋完成" : "沒有找到票價");
  } catch (error) {
    state.results = [externalFlightResult(state.lastFlightPayload)];
    elements.flightYearStats.hidden = true;
    renderResults("機票結果", state.results);
    revealResults();
    setStatus("搜尋 API 尚未連線，可先開啟 Google Flights", "error");
  }
}

function setFlightMode(mode) {
  state.flightMode = mode;
  elements.flightModeButtons.forEach((button) => button.classList.toggle("active", button.dataset.flightMode === mode));
  const isWindow = mode === "date_window";
  elements.windowFlightFields.hidden = !isWindow;
  elements.flightForm.elements.startDate.required = isWindow;
  elements.flightSubmitButton.textContent = isWindow ? "搜尋日期區間" : "找未來一年最低價";
}

function savedItem(watch, origin) {
  const item = document.createElement("article");
  item.className = "saved-item";
  item.innerHTML = `
    <div>
      <h3>${escapeHtml(watch.name || watch.id)}</h3>
      <p>${escapeHtml(origin)} · ${escapeHtml(watch.type || "watch")} · 目標 ${escapeHtml(watch.target_price || watch.targetPrice || "-")}</p>
    </div>
  `;
  return item;
}

async function renderSaved() {
  elements.savedList.replaceChildren();
  const nodes = [];
  if (token()) {
    try {
      const data = await api("/api/price-watch/watches");
      (data.watches || []).forEach((watch) => nodes.push(savedItem(watch, "雲端")));
    } catch {
      // Local fallback below still renders.
    }
  }
  localSaved().forEach((watch) => nodes.push(savedItem(watch, "手機")));
  if (!nodes.length) {
    elements.savedList.append(emptyNode());
    return;
  }
  nodes.forEach((node) => elements.savedList.append(node));
}

function switchPanel(panelId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.panel === panelId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
  if (panelId === "savedPanel") renderSaved();
}

async function loadConfig() {
  try {
    state.config = await api("/api/price-watch/config", { headers: {} });
    setStatus(state.config.hasSerpApi || state.config.hasSkyscanner ? "準備搜尋" : "尚未設定搜尋 API");
  } catch {
    setStatus(token() ? "準備搜尋" : "需要同步金鑰");
  }
}

function boot() {
  elements.accessTokenInput.value = token();
  elements.apiBaseInput.value = apiBase();
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchPanel(tab.dataset.panel));
  });
  elements.productForm.addEventListener("submit", searchProduct);
  elements.flightForm.addEventListener("submit", searchFlight);
  elements.flightModeButtons.forEach((button) => {
    button.addEventListener("click", () => setFlightMode(button.dataset.flightMode));
  });
  document.querySelectorAll("[data-place-input]").forEach((input) => {
    input.addEventListener("input", () => schedulePlaceSearch(input));
  });
  elements.refreshSavedButton.addEventListener("click", renderSaved);
  elements.settingsButton.addEventListener("click", () => {
    elements.accessTokenInput.value = token();
    elements.apiBaseInput.value = apiBase();
    elements.settingsDialog.showModal();
  });
  elements.saveSettingsButton.addEventListener("click", () => {
    localStorage.setItem("priceWatchAccessToken", elements.accessTokenInput.value.trim());
    localStorage.setItem("priceWatchApiBase", elements.apiBaseInput.value.trim().replace(/\/$/, ""));
    setStatus(token() ? "同步金鑰已儲存" : "需要同步金鑰");
    renderSaved();
  });
  renderResults("搜尋結果", []);
  renderSaved();
  setFlightMode("annual_low");
  loadConfig();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
