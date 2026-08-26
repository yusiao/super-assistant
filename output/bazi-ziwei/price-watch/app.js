const state = {
  activeType: "product",
  activePanel: "productPanel",
  lastProductQuery: "",
  lastFlightPayload: null,
  flightMode: "annual_low",
  config: null,
  views: {
    productPanel: { title: "商品結果", results: [], insights: null, searched: false, status: { text: "準備搜尋", kind: "ready" } },
    flightPanel: { title: "機票結果", results: [], insights: null, currency: "TWD", searched: false, status: { text: "準備搜尋", kind: "ready" } },
    savedPanel: { status: { text: "載入追蹤中", kind: "ready" } },
  },
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
  flightSearchFeedback: document.querySelector("#flightSearchFeedback"),
  flightProgressTrack: document.querySelector("#flightProgressTrack"),
  flightProgressBar: document.querySelector("#flightProgressBar"),
  flightProgressText: document.querySelector("#flightProgressText"),
  departurePlaces: document.querySelector("#departurePlaceOptions"),
  arrivalPlaces: document.querySelector("#arrivalPlaceOptions"),
  resultsZone: document.querySelector(".results-zone"),
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
  durationOverview: document.querySelector("#durationOverview"),
  durationSummary: document.querySelector("#durationSummary"),
  durationList: document.querySelector("#durationList"),
  cabinOverview: document.querySelector("#cabinOverview"),
  cabinPriceGrid: document.querySelector("#cabinPriceGrid"),
  productQualityNotice: document.querySelector("#productQualityNotice"),
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

function paintStatus(text, kind = "ready") {
  elements.statusStrip.classList.remove("ready", "error");
  elements.statusStrip.classList.add(kind);
  elements.statusText.textContent = text;
}

function setPanelStatus(panelId, text, kind = "ready") {
  state.views[panelId].status = { text, kind };
  if (state.activePanel === panelId) paintStatus(text, kind);
}

function setStatus(text, kind = "ready") {
  setPanelStatus(state.activePanel, text, kind);
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

function durationText(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return "時間未提供";
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return `${hours ? `${hours} 小時` : ""}${remainder ? ` ${remainder} 分` : ""}`.trim();
}

function timeText(value) {
  const text = String(value || "");
  const match = text.match(/(?:\d{4}-\d{2}-\d{2}\s+)?(\d{1,2}:\d{2})/);
  return match ? match[1] : text || "--:--";
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
const placeOptionState = new WeakMap();
let flightSearchTimer = null;
const POPULAR_PLACES = [
  { iataCode: "TPE", name: "臺灣桃園國際機場", city: "台北", country: "台灣" },
  { iataCode: "TSA", name: "台北松山機場", city: "台北", country: "台灣" },
  { iataCode: "KHH", name: "高雄國際機場", city: "高雄", country: "台灣" },
  { iataCode: "HND", name: "東京國際機場（羽田機場）", city: "東京", country: "日本" },
  { iataCode: "NRT", name: "成田國際機場", city: "東京", country: "日本" },
  { iataCode: "KIX", name: "關西國際機場", city: "大阪", country: "日本" },
  { iataCode: "ICN", name: "仁川國際機場", city: "首爾", country: "南韓" },
  { iataCode: "HKG", name: "香港國際機場", city: "香港", country: "香港" },
  { iataCode: "BKK", name: "蘇凡納布國際機場", city: "曼谷", country: "泰國" },
  { iataCode: "SIN", name: "新加坡樟宜機場", city: "新加坡", country: "新加坡" },
  { iataCode: "LAX", name: "洛杉磯國際機場", city: "洛杉磯", country: "美國" },
  { iataCode: "JFK", name: "約翰·甘迺迪國際機場", city: "紐約", country: "美國" },
  { iataCode: "LHR", name: "倫敦希斯洛機場", city: "倫敦", country: "英國" },
  { iataCode: "CDG", name: "巴黎夏爾·戴高樂機場", city: "巴黎", country: "法國" },
  { iataCode: "SYD", name: "雪梨金斯福德·史密斯機場", city: "雪梨", country: "澳洲" },
].map((place) => ({ ...place, subtitle: `${place.city} · ${place.country}` }));

function placeMatches(place, query) {
  const needle = String(query || "").trim().toLocaleLowerCase("zh-Hant");
  if (!needle) return true;
  if (/^[a-z]{1,3}$/.test(needle)) return String(place.iataCode || "").toLowerCase().startsWith(needle);
  return [place.iataCode, place.name, place.city, place.country]
    .some((value) => String(value || "").toLocaleLowerCase("zh-Hant").includes(needle));
}

function closePlaceOptions(input) {
  const list = input.dataset.placeInput === "arrival" ? elements.arrivalPlaces : elements.departurePlaces;
  clearTimeout(placeSearchTimers.get(input.dataset.placeInput));
  input.dataset.optionsClosed = "true";
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
  placeOptionState.set(input, { places: [], activeIndex: -1 });
}

function selectPlace(input, place) {
  input.value = `${place.iataCode} · ${place.name}`;
  input.dataset.iata = place.iataCode;
  input.dataset.placeName = place.name;
  closePlaceOptions(input);
}

function renderPlaceOptions(input, places, message = "", loading = false) {
  const list = input.dataset.placeInput === "arrival" ? elements.arrivalPlaces : elements.departurePlaces;
  list.hidden = true;
  list.replaceChildren();
  const query = input.value.trim();
  const isIataPrefix = /^[A-Za-z]{1,3}$/.test(query);
  const uniquePlaces = [...new Map(places.map((place) => [place.iataCode, place])).values()]
    .sort((left, right) => {
      if (isIataPrefix) return left.iataCode.localeCompare(right.iataCode);
      return 0;
    });
  const visiblePlaces = uniquePlaces.slice(0, 50);
  placeOptionState.set(input, { places: visiblePlaces, activeIndex: -1 });
  if (!uniquePlaces.length) {
    const empty = document.createElement("p");
    empty.className = "place-empty";
    empty.textContent = message || "找不到符合的機場";
    list.append(empty);
  } else {
    const summary = document.createElement("p");
    summary.className = "place-results-summary";
    summary.textContent = loading
      ? `先顯示 ${visiblePlaces.length} 個，正在搜尋全球機場…`
      : uniquePlaces.length > visiblePlaces.length
        ? `共 ${uniquePlaces.length} 個，先顯示前 ${visiblePlaces.length} 個；請繼續輸入縮寫縮小範圍`
        : `共 ${uniquePlaces.length} 個符合的機場`;
    list.append(summary);
    const fragment = document.createDocumentFragment();
    visiblePlaces.forEach((place) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "place-option";
      option.setAttribute("role", "option");
      option.dataset.iata = place.iataCode;
      option.innerHTML = `
        <span class="place-option-main"><strong>${escapeHtml(place.iataCode)}</strong><span>${escapeHtml(place.name)}</span></span>
        <small>${escapeHtml(place.subtitle || [place.city, place.country].filter(Boolean).join(" · "))}</small>
      `;
      option.addEventListener("pointerdown", (event) => event.preventDefault());
      option.addEventListener("click", () => selectPlace(input, place));
      fragment.append(option);
    });
    list.append(fragment);
  }
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

function mergePlaces(localPlaces, remotePlaces) {
  const merged = new Map(remotePlaces.map((place) => [place.iataCode, place]));
  localPlaces.forEach((place) => merged.set(place.iataCode, { ...merged.get(place.iataCode), ...place }));
  return [...merged.values()];
}

function schedulePlaceSearch(input) {
  const key = input.dataset.placeInput;
  clearTimeout(placeSearchTimers.get(key));
  input.dataset.optionsClosed = "";
  input.dataset.iata = "";
  input.dataset.placeName = "";
  const query = input.value.trim();
  const localMatches = POPULAR_PLACES.filter((place) => placeMatches(place, query));
  renderPlaceOptions(input, localMatches, query ? "搜尋全球機場中" : "輸入城市、機場或英文縮寫", Boolean(query));
  if (!query) return;
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
        if (input.value.trim() !== query || input.dataset.optionsClosed === "true") return;
        renderPlaceOptions(input, mergePlaces(localMatches, response.places || []));
      } catch {
        if (input.value.trim() === query && input.dataset.optionsClosed !== "true" && !localMatches.length) {
          renderPlaceOptions(input, [], "暫時無法取得機場建議");
        }
      }
    }, 250),
  );
}

function movePlaceSelection(input, direction) {
  const list = input.dataset.placeInput === "arrival" ? elements.arrivalPlaces : elements.departurePlaces;
  const options = [...list.querySelectorAll(".place-option")];
  if (!options.length) return;
  const stateForInput = placeOptionState.get(input) || { places: [], activeIndex: -1 };
  const activeIndex = (stateForInput.activeIndex + direction + options.length) % options.length;
  options.forEach((option, index) => {
    option.classList.toggle("active", index === activeIndex);
    option.setAttribute("aria-selected", String(index === activeIndex));
  });
  placeOptionState.set(input, { ...stateForInput, activeIndex });
  options[activeIndex].scrollIntoView({ block: "nearest" });
}

function placeInputKeydown(event) {
  const input = event.currentTarget;
  const stateForInput = placeOptionState.get(input) || { places: [], activeIndex: -1 };
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    movePlaceSelection(input, event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Enter" && stateForInput.activeIndex >= 0) {
    event.preventDefault();
    selectPlace(input, stateForInput.places[stateForInput.activeIndex]);
  } else if (event.key === "Escape") {
    closePlaceOptions(input);
  }
}

function selectedPlaceCode(input) {
  if (input.dataset.iata) return input.dataset.iata;
  const match = input.value.trim().toUpperCase().match(/^([A-Z]{3})(?:\b|\s|·)/);
  return match ? match[1] : "";
}

async function resolvePlaceCode(input) {
  const directCode = selectedPlaceCode(input);
  if (directCode) return directCode;
  const query = input.value.trim();
  if (!query) return "";
  const stateForInput = placeOptionState.get(input) || { places: [] };
  let places = stateForInput.places || [];
  if (!places.length) {
    try {
      const response = await api("/api/price-watch/places", {
        method: "POST",
        body: JSON.stringify({
          query,
          market: elements.flightForm.elements.market.value || "TW",
          locale: "zh-TW",
          isDestination: input.dataset.placeInput === "arrival",
        }),
      });
      places = response.places || [];
    } catch {
      return "";
    }
  }
  const normalizedQuery = query.toLocaleLowerCase("zh-Hant");
  const selected = places.find((place) =>
    [place.iataCode, place.name, place.city]
      .some((value) => String(value || "").toLocaleLowerCase("zh-Hant") === normalizedQuery),
  ) || places[0];
  if (!selected?.iataCode) return "";
  selectPlace(input, selected);
  return selected.iataCode;
}

function flightSubmitLabel() {
  return state.flightMode === "date_window" ? "搜尋日期區間" : "探索未來一年低價";
}

function setFlightFeedback(text = "", kind = "", progress = null) {
  elements.flightProgressText.textContent = text;
  elements.flightSearchFeedback.className = `search-feedback ${kind}`.trim();
  elements.flightSearchFeedback.hidden = !text;
  const showProgress = Number.isFinite(progress);
  elements.flightProgressTrack.hidden = !showProgress;
  if (showProgress) {
    const value = Math.max(0, Math.min(100, Number(progress)));
    elements.flightProgressBar.style.width = `${value}%`;
    elements.flightProgressTrack.setAttribute("aria-valuenow", String(Math.round(value)));
  }
}

function setFlightLoading(loading) {
  clearInterval(flightSearchTimer);
  flightSearchTimer = null;
  elements.flightSubmitButton.disabled = loading;
  elements.flightSubmitButton.classList.toggle("loading", loading);
  elements.flightSubmitButton.setAttribute("aria-busy", String(loading));
  if (!loading) {
    elements.flightSubmitButton.textContent = flightSubmitLabel();
    return;
  }
  let elapsed = 0;
  elements.flightSubmitButton.textContent = "搜尋中…";
  const update = () => {
    const progress = Math.min(92, 8 + elapsed * 3.2);
    const stage = elapsed < 3
      ? "解析機場"
      : elapsed < 9
        ? "搜尋代表日期"
        : elapsed < 19
          ? "比較三種艙等"
          : "整理最低票價";
    setFlightFeedback(`${stage} · 已等待 ${elapsed} 秒`, "loading", progress);
    elapsed += 1;
  };
  update();
  flightSearchTimer = setInterval(update, 1000);
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
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.code = data.code || "";
    throw error;
  }
  return data;
}

function searchErrorMessage(error, fallback) {
  const message = error?.message || "";
  if (error?.status === 401) return "搜尋需要同步金鑰：請點右上設定輸入 PRICE_WATCH_ACCESS_TOKEN。";
  if (/SERPAPI_API_KEY/i.test(message)) return "尚未設定 SerpApi 搜尋 API。";
  if (error?.code === "rate_limited" || error?.status === 429) return message || "公開搜尋太頻繁，請稍後再試。";
  if (error?.code === "provider_quota") return "SerpApi 查詢額度目前不足，請稍後再試或升級方案。";
  if (error?.code === "provider_timeout" || error?.status === 504) return "資料來源回應逾時，請稍後重試或縮小搜尋條件。";
  if (error?.code === "provider_error" || error?.status === 502) return "資料來源暫時無法回應，請稍後重試。";
  if (/[\u3400-\u9fff]/.test(message)) return message;
  return fallback;
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
  const isFlight = item.type === "flight";
  const meta = isFlight
    ? `<p class="flight-meta">${escapeHtml(item.source || "航班")} ${dateText ? ` · ${escapeHtml(dateText)}` : ""}${item.tripDays ? ` · ${escapeHtml(item.tripDays)} 天` : ""}${item.sampled ? " · 抽樣價" : item.cached ? " · 探索價" : ""}</p>`
    : `<p class="source-line">${escapeHtml(item.source || "來源")}</p>`;
  const productImage = !isFlight && item.thumbnail
    ? `<img class="product-thumbnail" src="${safeUrl(item.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
    : "";
  const productFacts = !isFlight ? `
    <div class="product-facts">
      <span>${escapeHtml(item.priceKindLabel || "標示總價")}</span>
      <span>${escapeHtml(item.conditionLabel || "商品狀態未標示")}</span>
      ${Number.isFinite(Number(item.matchScore)) ? `<span>型號符合 ${escapeHtml(item.matchScore)}%</span>` : ""}
    </div>
  ` : "";
  const actionClass = isFlight ? "action-row flight-actions" : item.trackable === false ? "action-row single" : "action-row";
  const trackButton = item.trackable === false ? "" : '<button class="track-button" type="button">追蹤</button>';
  const stopText = Number(item.stops || 0) === 0 ? "直達" : `${Number(item.stops)} 次轉乘`;
  const flightDetails = isFlight ? `
    <div class="flight-route" aria-label="航班詳情">
      <div class="flight-time"><strong>${escapeHtml(timeText(item.departure))}</strong><span>${escapeHtml(item.departureAirport || "出發")}</span></div>
      <div class="flight-journey"><span>${escapeHtml(durationText(item.duration))}</span><i></i><b>${escapeHtml(stopText)}</b></div>
      <div class="flight-time align-end"><strong>${escapeHtml(timeText(item.arrival))}</strong><span>${escapeHtml(item.arrivalAirport || "抵達")}</span></div>
    </div>
    <div class="flight-facts">
      <span>${escapeHtml(item.airline || "航空公司未提供")}</span>
      <span>${escapeHtml(item.cabinLabel || "經濟艙")}</span>
      <span>${escapeHtml(item.airlineTypeLabel || "航空類型未分類")}</span>
    </div>
  ` : "";
  const purchaseLabels = { official: "航空官網", skyscanner: "Skyscanner", trip: "Trip.com" };
  const purchaseActions = (item.purchaseLinks || []).map((link) => `
    <a class="purchase-link ${escapeHtml(link.kind)}" href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(purchaseLabels[link.kind] || link.label || "購票")}
    </a>
  `).join("");
  const actions = isFlight
    ? `${purchaseActions}${trackButton}`
    : `<a class="secondary-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">開啟</a>${trackButton}`;
  card.classList.toggle("flight-result", isFlight);
  card.innerHTML = `
    <div class="result-main">
      <div class="result-description">
        ${productImage}
        <div>
          <h3>${escapeHtml(item.title || "搜尋結果")}</h3>
          ${meta}
          ${productFacts}
        </div>
      </div>
      <div class="price-block">
        ${isFlight ? `<span class="cabin-tag">${escapeHtml(item.cabinLabel || "經濟艙")}</span>` : ""}
        <div class="price">${escapeHtml(item.priceText || money(item.price, item.currency))}</div>
      </div>
    </div>
    ${flightDetails}
    <div class="${actionClass}">
      ${actions}
    </div>
  `;
  card.querySelector(".track-button")?.addEventListener("click", () => trackResult(item));
  return card;
}

function renderCabinOverview(prices, currency = "TWD") {
  elements.cabinPriceGrid.replaceChildren();
  if (!Array.isArray(prices) || !prices.length) {
    elements.cabinOverview.hidden = true;
    return;
  }
  prices.forEach((cabin) => {
    const tile = document.createElement("article");
    tile.className = `cabin-price ${cabin.available ? "" : "unavailable"}`.trim();
    tile.innerHTML = `
      <span>${escapeHtml(cabin.label)}</span>
      <strong>${cabin.available ? escapeHtml(cabin.priceText || money(cabin.price, currency)) : "查無票價"}</strong>
      <small>${cabin.departureDate ? `${escapeHtml(cabin.departureDate)} · ${escapeHtml(cabin.airline || "航班")}` : "目前樣本無結果"}</small>
    `;
    elements.cabinPriceGrid.append(tile);
  });
  elements.cabinOverview.hidden = false;
}

function renderDurationAlternatives(insights, currency = "TWD") {
  const alternatives = Array.isArray(insights?.durationAlternatives)
    ? insights.durationAlternatives.filter((item) => item.isCheaper)
    : [];
  elements.durationList.replaceChildren();
  if (!alternatives.length) {
    elements.durationOverview.hidden = true;
    elements.durationSummary.textContent = "";
    return;
  }
  const selectedDays = Number(insights?.selectedDurationBest?.tripDays || alternatives[0]?.requestedTripDays || 0);
  elements.durationSummary.textContent = selectedDays ? `原選 ${selectedDays} 天` : "鄰近天數";
  alternatives.forEach((item) => {
    const row = document.createElement("article");
    row.className = "duration-option";
    const dateText = item.returnDate ? `${item.departureDate} - ${item.returnDate}` : item.departureDate || "";
    const purchaseLink = (item.purchaseLinks || []).find((link) => link.kind === "official")
      || (item.purchaseLinks || []).find((link) => link.kind === "skyscanner")
      || { url: item.link, label: "查看票價" };
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.tripDays)} 天</strong>
        <span>${escapeHtml(dateText)}</span>
      </div>
      <div class="duration-price">
        <strong>${escapeHtml(item.priceText || money(item.price, currency))}</strong>
        <span>省 ${escapeHtml(item.savingsText || money(item.savings, currency))}</span>
      </div>
      <a href="${safeUrl(purchaseLink.url)}" target="_blank" rel="noopener noreferrer">查看</a>
    `;
    elements.durationList.append(row);
  });
  elements.durationOverview.hidden = false;
}

function externalProductResult(query) {
  return {
    id: stableId("external-product", query),
    type: "product",
    title: `備用 Google Shopping：${query}`,
    source: "外部備用搜尋",
    priceText: "",
    link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
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

function renderProductQuality(insights) {
  if (!insights) {
    elements.productQualityNotice.hidden = true;
    elements.productQualityNotice.textContent = "";
    return;
  }
  const comparable = Number(insights.comparableResultCount || 0);
  const raw = Number(insights.rawResultCount || 0);
  elements.productQualityNotice.textContent = `${insights.notice || "結果已完成價格品質檢查"} 可比總價 ${comparable}／${raw} 筆。`;
  elements.productQualityNotice.hidden = false;
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
  const currentRange = stats.minimum == null || stats.maximum == null
    ? ""
    : ` · ${money(stats.minimum, currency)}–${money(stats.maximum, currency)}`;
  const previousRange = stats.previousMinimum == null || stats.previousMaximum == null
    ? ""
    : ` · ${money(stats.previousMinimum, currency)}–${money(stats.previousMaximum, currency)}`;
  elements.currentYearLabel.textContent = `${year} 抽樣均價`;
  elements.currentYearAverage.textContent = stats.average == null ? "尚無資料" : money(stats.average, currency);
  elements.currentYearMeta.textContent = currentCount ? `${currentCount} 個經濟艙出發日樣本${currentRange}` : "尚未取得該年報價";
  elements.previousYearLabel.textContent = `${previousYear} 累積觀測均價`;
  elements.previousYearAverage.textContent = stats.previousAverage == null ? "尚無去年資料" : money(stats.previousAverage, currency);
  elements.previousYearMeta.textContent = previousCount ? `${previousCount} 次歷史觀測${previousRange}` : "啟用追蹤後開始累積，非航空公司完整年資料";
  elements.flightYearStats.hidden = false;
}

function renderActiveView() {
  const panelId = state.activePanel;
  const view = state.views[panelId];
  paintStatus(view.status.text, view.status.kind);
  if (panelId === "savedPanel") {
    elements.resultsZone.hidden = true;
    return;
  }
  elements.resultsZone.hidden = false;
  if (panelId === "productPanel") {
    elements.flightYearStats.hidden = true;
    elements.durationOverview.hidden = true;
    elements.cabinOverview.hidden = true;
    renderProductQuality(view.insights);
    renderResults(view.searched ? view.title : "商品搜尋結果", view.results);
    return;
  }
  elements.productQualityNotice.hidden = true;
  renderFlightYearStats(view.insights?.yearStats, view.currency);
  renderDurationAlternatives(view.insights, view.currency);
  renderCabinOverview(view.insights?.cabinPrices, view.currency);
  renderResults(view.searched ? view.title : "機票搜尋結果", view.results);
}

function watchFromResult(item) {
  const targetInput = state.activeType === "flight"
    ? elements.flightForm.elements.targetPrice
    : elements.productForm.elements.targetPrice;
  const targetPrice = targetInput.value || item.price;
  if (item.type === "flight" && state.lastFlightPayload) {
    const flight = state.lastFlightPayload;
    const modeLabel = flight.flightMode === "annual_low" ? "未來一年低價探索" : `${flight.startDate} 起 ${flight.lookaheadDays} 天`;
    return {
      type: "flight",
      id: stableId("flight", `${flight.departureId}-${flight.arrivalId}-${flight.flightMode}-${flight.startDate}-${flight.tripDays}-${item.travelClass || "1"}`),
      name: `${flight.departureId} 到 ${flight.arrivalId} ${modeLabel} · ${flight.tripDays ? `${flight.tripDays} 天為主` : "單程"} · ${item.cabinLabel || "經濟艙"}`,
      targetPrice,
      ...flight,
      travelClass: item.travelClass || "1",
      cabinClass: item.cabinClass || "economy",
      cabinLabel: item.cabinLabel || "經濟艙",
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
  const sourcePanel = state.activePanel;
  try {
    const data = await api("/api/price-watch/watches", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setPanelStatus(sourcePanel, `已加入雲端追蹤：${data.watch.name}`);
    await renderSaved();
  } catch (error) {
    saveLocalWatch(payload);
    const message = error.status === 401
      ? "同步金鑰無效，已先存到這支手機"
      : "雲端暫時無法同步，已先存到這支手機";
    setPanelStatus(sourcePanel, message, error.status === 401 ? "error" : "ready");
    await renderSaved();
  }
}

async function searchProduct(event) {
  event.preventDefault();
  state.activeType = "product";
  const data = formData(elements.productForm);
  state.lastProductQuery = data.query.trim();
  setPanelStatus("productPanel", "搜尋並檢查商品價格中");
  try {
    const response = await api("/api/price-watch/search", {
      method: "POST",
      body: JSON.stringify({
        type: "product",
        query: data.query,
        currency: data.currency || "TWD",
      }),
    });
    const view = state.views.productPanel;
    view.results = response.results || [];
    view.insights = response.insights || null;
    view.searched = true;
    view.title = "可比商品總價";
    if (state.activePanel === "productPanel") {
      renderActiveView();
      revealResults();
    }
    const excluded = Number(response.insights?.excludedCount || 0);
    setPanelStatus(
      "productPanel",
      view.results.length ? `搜尋完成，已排除 ${excluded} 筆不可靠價格` : response.insights?.notice || "沒有找到可比較的總價",
      view.results.length ? "ready" : "error",
    );
  } catch (error) {
    const view = state.views.productPanel;
    view.results = error.status === 401 ? [] : [externalProductResult(state.lastProductQuery)];
    view.insights = null;
    view.searched = true;
    view.title = "商品結果";
    if (state.activePanel === "productPanel") {
      renderActiveView();
      revealResults();
    }
    setPanelStatus("productPanel", searchErrorMessage(error, "商品搜尋暫時失敗，請稍後再試。"), "error");
  }
}

async function searchFlight(event) {
  event.preventDefault();
  if (elements.flightSubmitButton.disabled) return;
  state.activeType = "flight";
  const data = formData(elements.flightForm);
  setFlightLoading(true);
  setPanelStatus("flightPanel", "正在解析出發地與目的地");
  try {
    const [departureId, arrivalId] = await Promise.all([
      resolvePlaceCode(elements.flightForm.elements.departureId),
      resolvePlaceCode(elements.flightForm.elements.arrivalId),
    ]);
    if (!/^[A-Z]{3}$/.test(departureId) || !/^[A-Z]{3}$/.test(arrivalId)) {
      throw new Error("請輸入至少兩個字，或從機場建議中選擇");
    }
    state.lastFlightPayload = {
      flightMode: state.flightMode,
      departureId,
      arrivalId,
      startDate: state.flightMode === "date_window" ? data.startDate : "",
      tripDays: Number(data.tripDays || 0),
      lookaheadDays: Number(data.lookaheadDays || 30),
      targetPrice: data.targetPrice,
      airlineType: data.airlineType || "all",
      routeType: data.routeType || "any",
      currency: data.currency || "TWD",
      market: data.market || "TW",
      locale: "zh-TW",
    };
    setPanelStatus("flightPanel", state.flightMode === "annual_low" ? "探索未來一年代表日期" : "搜尋日期區間票價");
    const response = await api("/api/price-watch/search", {
      method: "POST",
      body: JSON.stringify({
        type: "flight",
        ...state.lastFlightPayload,
      }),
    });
    const view = state.views.flightPanel;
    view.results = response.results || [];
    view.insights = response.insights || null;
    view.currency = response.currency || data.currency || "TWD";
    view.searched = true;
    view.title = state.flightMode === "annual_low" ? "全年抽樣低價候選" : "日期區間抽樣票價";
    if (state.activePanel === "flightPanel") {
      renderActiveView();
      revealResults();
    }
    setFlightLoading(false);
    const resultMessage = response.insights?.samplingNotice || (view.results.length ? "搜尋完成" : "沒有找到票價");
    if (view.results.length) {
      setPanelStatus("flightPanel", resultMessage);
      setFlightFeedback("查詢完成", "complete", 100);
      setTimeout(() => setFlightFeedback(""), 900);
    } else {
      setPanelStatus("flightPanel", resultMessage, "error");
      setFlightFeedback(resultMessage, "error");
    }
  } catch (error) {
    setFlightLoading(false);
    const view = state.views.flightPanel;
    view.results = [];
    view.insights = null;
    view.searched = true;
    view.title = "機票結果";
    if (state.activePanel === "flightPanel") {
      renderActiveView();
      revealResults();
    }
    const message = error.message?.startsWith("請輸入")
      ? error.message
      : searchErrorMessage(error, "機票查價暫時失敗，請稍後重試。");
    setFlightFeedback(message, "error");
    setPanelStatus("flightPanel", message, "error");
  }
}

function setFlightMode(mode) {
  state.flightMode = mode;
  elements.flightModeButtons.forEach((button) => button.classList.toggle("active", button.dataset.flightMode === mode));
  const isWindow = mode === "date_window";
  elements.windowFlightFields.hidden = !isWindow;
  elements.flightForm.elements.startDate.required = isWindow;
  if (!elements.flightSubmitButton.disabled) elements.flightSubmitButton.textContent = flightSubmitLabel();
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

function savedError(message) {
  const item = document.createElement("div");
  item.className = "saved-sync-error";
  item.innerHTML = `<strong>雲端追蹤未同步</strong><span>${escapeHtml(message)}</span>`;
  return item;
}

async function renderSaved() {
  elements.savedList.replaceChildren();
  const nodes = [];
  let cloudError = null;
  if (token()) {
    try {
      const data = await api("/api/price-watch/watches");
      (data.watches || []).forEach((watch) => nodes.push(savedItem(watch, "雲端")));
    } catch (error) {
      cloudError = error;
      nodes.push(savedError(error.status === 401 ? "同步金鑰無效，請到右上角設定更新。" : "雲端服務暫時無法連線，手機資料仍可使用。"));
    }
  }
  localSaved().forEach((watch) => nodes.push(savedItem(watch, "手機")));
  if (!nodes.length) {
    elements.savedList.append(emptyNode());
    setPanelStatus("savedPanel", token() ? "追蹤清單目前是空的" : "尚未設定雲端同步金鑰");
    return;
  }
  nodes.forEach((node) => elements.savedList.append(node));
  if (cloudError) {
    setPanelStatus("savedPanel", cloudError.status === 401 ? "同步金鑰無效" : "雲端追蹤暫時無法同步", "error");
  } else {
    setPanelStatus("savedPanel", `已載入 ${nodes.length} 筆追蹤`);
  }
}

function switchPanel(panelId) {
  state.activePanel = panelId;
  if (panelId === "productPanel") state.activeType = "product";
  if (panelId === "flightPanel") state.activeType = "flight";
  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.panel === panelId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
  renderActiveView();
  if (panelId === "savedPanel") renderSaved();
}

async function loadConfig() {
  try {
    state.config = await api("/api/price-watch/config", { headers: {} });
    const ready = state.config.hasSerpApi || state.config.hasSkyscanner;
    setPanelStatus("productPanel", state.config.hasSerpApi ? "準備搜尋" : "尚未設定商品搜尋 API", state.config.hasSerpApi ? "ready" : "error");
    setPanelStatus("flightPanel", ready ? "準備搜尋" : "尚未設定機票搜尋 API", ready ? "ready" : "error");
  } catch {
    setPanelStatus("productPanel", token() ? "準備搜尋" : "搜尋服務狀態暫時無法確認", token() ? "ready" : "error");
    setPanelStatus("flightPanel", token() ? "準備搜尋" : "搜尋服務狀態暫時無法確認", token() ? "ready" : "error");
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
    input.addEventListener("focus", () => {
      if (input.dataset.iata) renderPlaceOptions(input, POPULAR_PLACES);
      else schedulePlaceSearch(input);
    });
    input.addEventListener("keydown", placeInputKeydown);
  });
  document.addEventListener("pointerdown", (event) => {
    document.querySelectorAll("[data-place-input]").forEach((input) => {
      if (!input.closest(".place-combobox")?.contains(event.target)) closePlaceOptions(input);
    });
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
    setStatus(token() ? "同步金鑰已儲存" : "已改用手機本機追蹤");
    renderSaved();
  });
  renderActiveView();
  renderSaved();
  setFlightMode("annual_low");
  loadConfig();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js?v=7").catch(() => {});
  }
}

boot();
