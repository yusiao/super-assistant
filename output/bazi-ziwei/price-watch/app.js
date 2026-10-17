import { buildAirportDirectory, searchAirports, normalizeAirportCodes } from "./airports.js?v=17";

const state = {
  activePanel: "flightPanel",
  lastFlightPayload: null,
  flightMode: "annual_low",
  config: null,
  views: {
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
let airportDirectory = [];
let airportDirectoryPromise;
function loadAirportDirectory() {
  airportDirectoryPromise ||= fetch("./airports-data.json?v=16").then((response) => {
    if (!response.ok) throw new Error("Airport directory unavailable");
    return response.json();
  }).then((data) => { airportDirectory = buildAirportDirectory(data.airports); return airportDirectory; })
    .catch(() => { airportDirectoryPromise = null; return []; });
  return airportDirectoryPromise;
}
let flightSearchTimer = null;
const POPULAR_PLACES = [
  { iataCode: "TPE,TSA", name: "台北全部機場", city: "台北", englishName: "Taipei", country: "台灣", group: true, subtitle: "桃園 TPE · 松山 TSA" },
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
].map((place) => ({ ...place, subtitle: place.subtitle || `${place.city} · ${place.country}` }));

function placeMatches(place, query) {
  const needle = String(query || "").trim().replaceAll("臺", "台").toLocaleLowerCase("zh-Hant");
  if (!needle) return true;
  if (/^[a-z]{1,3}$/.test(needle)) return String(place.iataCode || "").toLowerCase().startsWith(needle);
  return [place.iataCode, place.name, place.city, place.country, place.englishName]
    .some((value) => String(value || "").replaceAll("臺", "台").toLocaleLowerCase("zh-Hant").includes(needle));
}

function closePlaceOptions(input) {
  const list = document.getElementById(input.getAttribute("aria-controls"));
  clearTimeout(placeSearchTimers.get(input.dataset.placeInput));
  input.dataset.optionsClosed = "true";
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
  placeOptionState.set(input, { places: [], activeIndex: -1 });
}

function selectPlace(input, place) {
  const code = normalizeAirportCodes(place.iataCode);
  input.value = place.group ? place.name : `${code} · ${place.name}`;
  input.dataset.iata = code;
  input.dataset.placeName = place.name;
  closePlaceOptions(input);
}

function renderPlaceOptions(input, places, message = "", loading = false, limit = 50) {
  const list = document.getElementById(input.getAttribute("aria-controls"));
  list.hidden = true;
  list.replaceChildren();
  const query = input.value.trim();
  const isIataPrefix = /^[A-Za-z]{1,3}$/.test(query);
  const uniquePlaces = [...new Map(places.map((place) => [place.iataCode, place])).values()]
    .sort((left, right) => {
      if (!isIataPrefix && Boolean(left.group) !== Boolean(right.group)) return left.group ? -1 : 1;
      if (isIataPrefix) {
        const prefixMatch = (place) => !place.group && place.iataCode.startsWith(query.toUpperCase());
        if (prefixMatch(left) !== prefixMatch(right)) return prefixMatch(left) ? -1 : 1;
        if (prefixMatch(left)) return left.iataCode.localeCompare(right.iataCode);
      }
      return 0;
    });
  const visiblePlaces = uniquePlaces.slice(0, limit);
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
        ? `共 ${uniquePlaces.length} 個，顯示 ${visiblePlaces.length} 個`
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
        <span class="place-option-main"><strong>${escapeHtml(place.group ? "全部" : place.iataCode)}</strong><span>${escapeHtml(place.name)}</span></span>
        <small>${escapeHtml(place.subtitle || [place.city, place.country].filter(Boolean).join(" · "))}</small>
      `;
      option.addEventListener("pointerdown", (event) => event.preventDefault());
      option.addEventListener("click", () => selectPlace(input, place));
      fragment.append(option);
    });
    list.append(fragment);
    if (uniquePlaces.length > limit) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "place-more";
      more.textContent = "顯示更多機場";
      more.addEventListener("pointerdown", (event) => event.preventDefault());
      more.addEventListener("click", () => {
        const top = list.scrollTop;
        renderPlaceOptions(input, uniquePlaces, "", false, limit + 50);
        list.scrollTop = top;
      });
      list.append(more);
    }
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
  const localMatches = query && airportDirectory.length ? searchAirports(airportDirectory, query) : POPULAR_PLACES.filter((place) => placeMatches(place, query));
  renderPlaceOptions(input, localMatches, query ? "搜尋全球機場中" : "輸入城市、機場或英文縮寫", Boolean(query));
  if (!query) return;
  placeSearchTimers.set(
    key,
    setTimeout(async () => {
      try {
        await loadAirportDirectory();
        if (input.value.trim() !== query || input.dataset.optionsClosed === "true") return;
        const matches = searchAirports(airportDirectory, query);
        if (matches.length) { renderPlaceOptions(input, matches); return; }
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
  const list = document.getElementById(input.getAttribute("aria-controls"));
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
  return normalizeAirportCodes(input.dataset.iata || input.value.split("·")[0]);
}

async function resolvePlaceCode(input) {
  const directCode = selectedPlaceCode(input);
  if (directCode) {
    const place = airportDirectory.find((place) => place.iataCode === directCode);
    if (place) selectPlace(input, place);
    else { input.value = directCode; input.dataset.iata = directCode; closePlaceOptions(input); }
    return directCode;
  }
  const query = input.value.trim();
  if (!query) return "";
  await loadAirportDirectory();
  let places = searchAirports(airportDirectory, query);
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
  const normalizedQuery = query.replaceAll("臺", "台").toLocaleLowerCase("zh-Hant");
  const selected = places.find((place) =>
    [place.iataCode, place.name, place.city, place.englishName, place.englishCity]
      .some((value) => String(value || "").replaceAll("臺", "台").toLocaleLowerCase("zh-Hant") === normalizedQuery),
  ) || (places.length === 1 ? places[0] : null);
  if (!selected && places.length) {
    renderPlaceOptions(input, places);
    throw new Error("請輸入完整城市、機場代碼，或選擇一個機場建議。");
  }
  if (!selected?.iataCode) return "";
  selectPlace(input, selected);
  return normalizeAirportCodes(selected.iataCode);
}

function flightSubmitLabel() {
  if (elements.flightForm.elements.dateConstraint.value !== "flexible" || readLegWindows().some((w) => w.departureDate || w.arrivalDate)) return "搜尋指定日期與時段";
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
    setFlightFeedback(`查詢完整航班與艙等 · 已等待 ${elapsed} 秒`, "loading", progress);
    elements.flightProgressTrack.removeAttribute("aria-valuenow");
    elements.flightProgressTrack.setAttribute("aria-valuetext", "查詢中，尚未取得完成比例");
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

function storedLocalWatches() {
  try {
    const watches = JSON.parse(localStorage.getItem("priceWatchLocalWatches") || "[]");
    return Array.isArray(watches) ? watches.filter((watch) => watch && typeof watch === "object") : [];
  } catch {
    return [];
  }
}

function localSaved() {
  return storedLocalWatches().filter((watch) => watch.type === "flight");
}

function saveLocalWatch(watch) {
  const existing = storedLocalWatches().filter((item) => item.id !== watch.id);
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
  const trackButton = item.trackable === false ? "" : '<button class="track-button" type="button">追蹤</button>';
  const stopText = Number(item.stops || 0) === 0 ? "直達" : `${Number(item.stops)} 次轉乘`;
  const flightDetails = item.legs?.length > 1 ? `<div class="flight-facts"><span>${item.legs.length} 段旅程</span><span>累計飛行 ${escapeHtml(durationText(item.duration))}</span><span>${item.stops} 次途中轉機</span></div>` : `
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
  `;
  const purchaseLabels = { skyscanner: "Skyscanner", trip: "Trip.com" };
  const purchaseActions = (item.purchaseLinks || []).map((link) => `
    <a class="purchase-link ${escapeHtml(link.kind)}" href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(purchaseLabels[link.kind] || link.label || "購票")}
    </a>
  `).join("");
  card.classList.add("flight-result");
  card.innerHTML = `
    <div class="result-main">
      <div class="result-description">
        <div>
          <h3>${escapeHtml(item.title || "搜尋結果")}</h3>
          <p class="flight-meta">${escapeHtml(item.source || "航班")}${dateText ? ` · ${escapeHtml(dateText)}` : ""}${item.tripDays ? ` · ${escapeHtml(item.tripDays)} 天` : ""}${item.sampled ? " · 抽樣價" : item.cached ? " · 探索價" : ""}</p>
        </div>
      </div>
      <div class="price-block">
        ${item.quoteStatus === "no_booking_offer" ? '<span class="fare-note">符合條件的航班組合</span>' : item.separateTickets ? '<span class="fare-note">分開購票合計</span>' : item.journeyType === "multicity" ? '<span class="fare-note">聯程整趟報價</span>' : ""}
        <span class="cabin-tag">${escapeHtml(item.cabinLabel || "經濟艙")}</span>
        <div class="price">${escapeHtml(item.priceText || money(item.price, item.currency))}</div>
      </div>
    </div>
    ${flightDetails}
    ${item.separateTickets ? '<p class="airport-change">分開購票組合，非一張聯程票。各段需分別購買；票價、行李與改退規則分開計算，跨票段不保證轉機保障。</p>' : ""}
    ${item.bookingQuote ? `<p class="fare-note">整趟購票報價${item.bookingQuote.seller ? ` · ${escapeHtml(item.bookingQuote.seller)}` : ""} · 來源未標示分開開票</p>` : ""}
    ${journeyDetails(item)}
    ${item.differentReturnAirport ? `<p class="airport-change">去回不同機場：${escapeHtml(item.departureAirport)} 出發，${escapeHtml(item.legs.at(-1).arrivalAirport)} 返回</p>` : ""}
    ${(item.airportChanges || []).map((change) => `<p class="airport-change">停留期間需自行更換機場：${escapeHtml(change.arrivalAirport)} → ${escapeHtml(change.departureAirport)}</p>`).join("")}
    <div class="cabin-comparison">${item.legs?.length > 1 && item.cabinPrices ? `<p class="fare-note">${item.separateTickets ? "分開購票艙等加總" : "整趟行程艙等總價"}</p>` : ""}${cabinComparisonHtml(item.cabinPrices, item.currency)}</div>
    <p class="upgrade-status">里程升等：待確認票種與各航段升等名額</p>
    <div class="action-row flight-actions">
      ${purchaseActions}${!item.cabinPrices && item.quoteStatus !== "no_booking_offer" ? '<button class="compare-button" type="button">比較艙等</button>' : ""}${trackButton}
    </div>
  `;
  card.querySelector(".track-button")?.addEventListener("click", () => trackResult(item));
  card.querySelector(".compare-button:not([data-leg-cabins])")?.addEventListener("click", (event) => compareCabins(item, card, event.currentTarget));
  card.querySelectorAll("[data-leg-cabins]").forEach((button) => button.addEventListener("click", () => compareLegCabins(item, Number(button.dataset.legCabins), button)));
  return card;
}

function journeyDetails(item) {
  if (!item.legs?.length) return "";
  const rows = item.legs.map((leg, index) => `
    <section class="journey-leg">
      <h4>${index + 1}. ${escapeHtml(leg.departureAirport)} → ${escapeHtml(leg.arrivalAirport)} <small>${escapeHtml(leg.departureDate)}</small></h4>
      ${(leg.segments || []).map((segment) => `<div class="segment-row">
        <strong>${escapeHtml(segment.departureAirport)} ${escapeHtml(timeText(segment.departureTime))} → ${escapeHtml(segment.arrivalAirport)} ${escapeHtml(timeText(segment.arrivalTime))}</strong>
        <span>${escapeHtml(segment.flightNumber)} · ${escapeHtml(segment.airline)} · ${escapeHtml(segment.airplane || "機型未提供")}</span>
        <span>${escapeHtml(segment.departureTime)} → ${escapeHtml(segment.arrivalTime)} · ${escapeHtml(segment.travelClass || "艙等未提供")}</span>
      </div>`).join("")}
      ${item.journeyType === "multicity" && index === 0 ? `<p class="stay-label">${escapeHtml(leg.arrivalAirport)} 停留 ${escapeHtml(item.stopoverNights)} 晚</p>` : ""}
      ${item.destinationNights != null && index === 1 ? `<p class="stay-label">${escapeHtml(leg.arrivalAirport)} 停留 ${escapeHtml(item.destinationNights)} 晚</p>` : ""}
      ${item.separateTickets ? `<p class="stay-label">此段 ${escapeHtml(leg.priceText || money(leg.price, item.currency))}</p><div class="action-row">${(leg.purchaseLinks || []).map((link) => `<a class="purchase-link" href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label || "此段購票")}</a>`).join("")}</div>` : ""}
      <button type="button" class="compare-button" data-leg-cabins="${index}">查此段艙等</button>
      <div class="leg-cabin-quotes" aria-live="polite"></div>
    </section>`).join("");
  const codes = new Set((item.segments || []).map((s) => s.flightNumber?.slice(0, 2)));
  const rules = [
    ["BR", "長榮升等規則", "https://www.evaair.com/zh-tw/customer-services/faq/detail.html?FaqCategories=Award-Program"],
    ["CI", "華航升等規則", "https://www.china-airlines.com/au/zh/member/miles/redeem/cabin-upgrade.html"],
  ].filter(([code]) => codes.has(code)).map(([, label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`).join(" · ");
  return `<details class="journey-details" ${item.journeyType === "multicity" ? "open" : ""}><summary>${item.legs.length} 段旅程・航班與機型</summary>${rows}<p class="fare-note">${item.quoteStatus === "no_booking_offer" ? "航班符合搜尋條件，尚未取得整趟購票價格；" : item.separateTickets ? "各段獨立報價加總，須分別確認可購買。" : "全行程報價；"}行李、開票及改退規則以購票頁為準。機型可能異動。${rules}</p></details>`;
}

function cabinComparisonHtml(prices, currency) {
  if (!prices?.length) return "";
  return `<dl class="inline-cabins">${prices.map((cabin) => `<div><dt>${escapeHtml(cabin.label)}</dt><dd>${cabin.available ? escapeHtml(cabin.priceText || money(cabin.price, currency)) : cabin.status === "failed" ? "查詢失敗" : "未取得報價"}</dd>${cabin.legs?.[0] ? `<small>${escapeHtml(cabin.legs[0].departureAirport)} 出發</small>` : ""}</div>`).join("")}</dl><small class="fare-note">同日期、符合條件的艙等報價；未鎖定班號的航班可能不同</small>`;
}

async function compareLegCabins(item, index, button) {
  const original = item.searchPayload || state.lastFlightPayload;
  const leg = item.legs[index];
  const window = { ...(original.legTimeWindows?.[index] || {}), departureDate: leg.departureDate };
  delete window.departureDateAlternative;
  const quotes = button.nextElementSibling;
  button.disabled = true;
  button.textContent = "查詢中…";
  try {
    const response = await api("/api/price-watch/search", { method: "POST", body: JSON.stringify({
      ...original, type: "flight", journeyType: "simple", includeReturn: false, tripDays: 0, compareDurations: false,
      departureId: leg.departureAirport, arrivalId: leg.arrivalAirport, dateConstraint: "departure",
      fixedDepartureDate: leg.departureDate, fixedReturnDate: "", flightMode: "date_window", startDate: leg.departureDate,
      lookaheadDays: 0, comparisonPlan: undefined, legTimeWindows: [window],
    }) });
    quotes.innerHTML = `<p class="fare-note">單段另購報價，不可相加視為聯程總價</p>${cabinComparisonHtml(response.insights?.cabinPrices, item.currency)}`;
    button.textContent = "重新查此段艙等";
  } catch (error) {
    quotes.textContent = searchErrorMessage(error, "此段艙等暫時無法查詢。");
    button.textContent = "重試此段艙等";
  } finally { button.disabled = false; }
}

async function quoteFormLeg(index, button) {
  const form = elements.flightForm;
  const data = Object.fromEntries(new FormData(form));
  const multi = data.journeyType === "multicity";
  const routes = multi ? [["departureId", "stopoverId"], ["stopoverId", "arrivalId"], ["arrivalId", "departureId"]]
    : [["departureId", "arrivalId"], ["arrivalId", "departureId"]];
  const window = { ...readLegWindows()[index] };
  if (!window.departureDate && index === 0 && ["departure", "both"].includes(data.dateConstraint)) window.departureDate = data.fixedDepartureDate;
  if (!window.departureDate && index === (multi ? 2 : 1) && ["return", "both"].includes(data.dateConstraint)) window.departureDate = data.fixedReturnDate;
  const quotes = button.nextElementSibling;
  button.disabled = true;
  button.textContent = "查詢中…";
  try {
    if (!window.departureDate && !window.arrivalDate) throw new Error("請先填這一段的出發或抵達日期。");
    const [departureId, arrivalId] = await Promise.all(routes[index].map((key) => resolvePlaceCode(form.elements[key])));
    const response = await api("/api/price-watch/search", { method: "POST", body: JSON.stringify({
      type: "flight", journeyType: "simple", tripDays: 0, compareDurations: false, departureId, arrivalId,
      flightMode: "date_window", dateConstraint: "flexible", startDate: "", legTimeWindows: [window],
      airlineType: data.airlineType, journeyAirline: data.journeyAirline, routeType: data.routeType, currency: data.currency, market: data.market,
      excludedAirlines: [...new FormData(form).getAll("excludedAirlines"), ...(data.otherExcludedAirlines || "").split(/[,，\s]+/).filter(Boolean)],
      excludedAircraft: [...new FormData(form).getAll("excludedAircraft"), ...(data.otherExcludedAircraft || "").split(/[,，]+/).map((s) => s.trim()).filter(Boolean)],
      allowUnknownAircraft: form.elements.allowUnknownAircraft.checked,
    }) });
    const prices = response.insights?.cabinPrices;
    quotes.innerHTML = `<p class="fare-note">單段另購報價，不可相加視為聯程總價</p>
      ${(response.results || []).map((item) => `<p class="fare-note">${escapeHtml(item.departureDate)} 經濟艙 ${escapeHtml(item.priceText)}</p>`).join("")}
      ${response.results?.[0] ? `<p class="fare-note">艙等對照出發日：${escapeHtml(response.results[0].departureDate)}</p>` : ""}
      ${cabinComparisonHtml(prices, data.currency)}
      ${!response.results?.length ? '<p class="fare-note">目前未取得符合此段條件的報價，不代表航空公司已售罄。</p>' : ""}`;
  } catch (error) { quotes.textContent = searchErrorMessage(error, "此段暫時無法查價。"); }
  finally { button.disabled = false; button.textContent = "單段查價／艙等"; }
}

const tripLinkFields = ["journeyType", "ticketMode", "includeReturn", "dateConstraint", "fixedDepartureDate", "fixedReturnDate", "tripDays", "startDate", "lookaheadDays", "stopoverMinNights", "stopoverMaxNights", "destinationMinNights", "destinationMaxNights", "airlineType", "journeyAirline", "routeType", "currency", "market"];
function applyTripFromLink() {
  if (!location.hash.startsWith("#trip=")) return;
  try {
    if (location.hash.length > 12000) throw new Error();
    const trip = JSON.parse(decodeURIComponent(location.hash.slice(6)));
    const form = elements.flightForm;
    if (!trip || !Array.isArray(trip.legTimeWindows) || trip.legTimeWindows.length > 3) throw new Error();
    form.elements.journeyAirline.value = "";
    form.elements.ticketMode.value = "through";
    trip.ticketMode = trip.ticketMode === "separate" ? "separate" : "through";
    for (const key of tripLinkFields) if (trip[key] !== undefined) {
      if (key === "includeReturn") form.elements[key].checked = trip[key] === true;
      else form.elements[key].value = String(trip[key]).slice(0, 100);
    }
    for (const key of ["excludedAirlines", "excludedAircraft"]) {
      const selected = Array.isArray(trip[key]) ? trip[key] : [];
      form.querySelectorAll(`[name="${key}"]`).forEach((input) => { input.checked = selected.includes(input.value); });
    }
    for (const key of ["otherExcludedAirlines", "otherExcludedAircraft"]) form.elements[key].value = String(trip[key] || "").slice(0, 500);
    form.elements.allowUnknownAircraft.checked = trip.allowUnknownAircraft === true;
    if (!["simple", "oneway", "multicity"].includes(form.elements.journeyType.value)) throw new Error();
    for (const key of ["departureId", "stopoverId", "arrivalId"]) if (trip[key]) {
      const code = normalizeAirportCodes(trip[key]);
      if (!code) throw new Error();
      selectPlace(form.elements[key], airportDirectory.find((place) => place.iataCode === code) || { iataCode: code, name: code });
    }
    form.querySelector('[name="journeyType"]:checked').dispatchEvent(new Event("change"));
    document.querySelectorAll("[data-leg-role]").forEach((fieldset, index) => {
      const window = trip.legTimeWindows[index] || {};
      fieldset.querySelectorAll("[data-window-field]").forEach((input) => {
        input.value = String(window[input.dataset.windowField] || "").slice(0, 100);
        input._flatpickr?.setDate(input.value, false);
      });
    });
    setFlightMode(trip.flightMode === "date_window" ? "date_window" : "annual_low");
    document.querySelector(".leg-schedules").open = true;
    setStatus("行程已帶入，請確認後搜尋");
  } catch { setStatus("行程連結格式不正確，請重新填寫條件", "error"); }
}

async function copyTripLink() {
  const form = elements.flightForm;
  const trip = Object.fromEntries(tripLinkFields.map((key) => [key, key === "includeReturn" ? form.elements[key].checked : form.elements[key].value]));
  for (const key of ["departureId", "arrivalId", "stopoverId"]) trip[key] = selectedPlaceCode(form.elements[key]);
  trip.flightMode = state.flightMode;
  trip.legTimeWindows = readLegWindows();
  for (const key of ["excludedAirlines", "excludedAircraft"]) trip[key] = [...form.querySelectorAll(`[name="${key}"]:checked`)].map((input) => input.value);
  for (const key of ["otherExcludedAirlines", "otherExcludedAircraft"]) trip[key] = form.elements[key].value;
  trip.allowUnknownAircraft = form.elements.allowUnknownAircraft.checked;
  const url = new URL(location.href);
  url.hash = `trip=${encodeURIComponent(JSON.stringify(trip))}`;
  try { await navigator.clipboard.writeText(url.href); setStatus("行程連結已複製（不含同步金鑰）"); }
  catch { setStatus("無法複製，請允許瀏覽器使用剪貼簿", "error"); }
}

async function compareCabins(item, card, button) {
  button.disabled = true;
  button.textContent = "比較中…";
  const original = item.searchPayload || state.lastFlightPayload;
  try {
    const response = await api("/api/price-watch/search", { method: "POST", body: JSON.stringify({
      ...original, type: "flight", flightMode: "date_window", startDate: item.departureDate, lookaheadDays: 0,
      tripDays: item.tripDays, compareDurations: false, comparisonPlan: item.plan,
      ticketMode: item.separateTickets ? "separate" : "through",
    }) });
    const prices = response.insights?.cabinPrices;
    if (!response.results?.length) throw new Error("目前未取得相同日期的完整行程報價。");
    item.cabinPrices = prices;
    card.querySelector(".cabin-comparison").innerHTML = `${item.legs?.length > 1 ? `<p class="fare-note">${item.separateTickets ? "分開購票艙等加總" : "整趟行程艙等總價"}</p>` : ""}${cabinComparisonHtml(prices, item.currency)}`;
    button.remove();
  } catch (error) {
    button.disabled = false;
    button.textContent = "重試艙等比較";
    setPanelStatus("flightPanel", searchErrorMessage(error, "艙等比較失敗，請稍後重試。"), "error");
  }
}

function setupJourneyFields() {
  const aircraft = ["737 MAX", "737", "747", "777", "787", "A320", "A321", "A330", "A350", "A380", "ATR", "DHC-8"];
  const airlines = [["BR", "長榮"], ["CI", "華航"], ["JX", "星宇"], ["IT", "台灣虎航"], ["TR", "酷航"], ["MM", "樂桃"],
    ["CX", "國泰"], ["UO", "香港快運"], ["MU", "中國東方航空"], ["JL", "日本航空"], ["NH", "全日空"], ["KE", "大韓航空"], ["SQ", "新加坡航空"]];
  document.querySelector("#aircraftChoices").innerHTML = aircraft.map((model) => `<label class="check-option"><input type="checkbox" name="excludedAircraft" value="${model}" /><span>${model}</span></label>`).join("");
  document.querySelector("#airlineChoices").innerHTML = airlines.map(([code, name]) => `<label class="check-option"><input type="checkbox" name="excludedAirlines" value="${code}" /><span>${name} ${code}</span></label>`).join("");
  document.querySelector("#airlineSuggestions").innerHTML = airlines.map(([code, name]) => `<option value="${code}">${name}</option>`).join("");
  const update = () => {
    const form = elements.flightForm;
    const multi = form.elements.journeyType.value === "multicity";
    form.elements.departureId.closest("label").querySelector("span").textContent = multi ? "出發地 A" : "出發地";
    form.elements.arrivalId.closest("label").querySelector("span").textContent = multi ? "目的地 C" : "目的地";
    const stopover = document.querySelector("#stopoverFields");
    document.querySelector("#ticketModeField").hidden = !multi;
    form.elements.ticketMode.disabled = !multi;
    stopover.hidden = !multi;
    stopover.disabled = !multi;
    document.querySelector("#tripDaysField").hidden = multi;
    form.elements.tripDays.disabled = multi;
    const destination = document.querySelector("#destinationStayFields");
    destination.hidden = !multi || !form.elements.includeReturn.checked;
    destination.disabled = destination.hidden;
    updateDateFields();
    renderLegWindows();
  };
  document.querySelectorAll('[name="journeyType"], [name="includeReturn"]').forEach((input) => input.addEventListener("change", update));
  update();
}

const legWindowDrafts = new Map();
function readLegWindows() {
  return [...document.querySelectorAll("[data-leg-role]")].map((fieldset) => Object.fromEntries(
    [...fieldset.querySelectorAll("[data-window-field]")].filter((input) => input.value).map((input) => [input.dataset.windowField, input.value]),
  ));
}

function renderLegWindows() {
  const current = readLegWindows();
  document.querySelectorAll("[data-leg-role]").forEach((fieldset, index) => legWindowDrafts.set(fieldset.dataset.legRole, current[index]));
  document.querySelectorAll(".leg-date").forEach((input) => input._flatpickr?.destroy());
  const form = elements.flightForm;
  const multi = form.elements.journeyType.value === "multicity";
  const roles = multi ? [["outbound", "第 1 段：出發地 A → 停留地 B"], ["onward", "第 2 段：停留地 B → 目的地 C"],
    ...(form.elements.includeReturn.checked ? [["return", "第 3 段：目的地 C → 出發地 A"]] : [])]
    : [["outbound", "去程：出發地 → 目的地"], ...(form.elements.journeyType.value === "oneway" ? [] : [["return", "回程：目的地 → 出發地"]])];
  document.querySelector("#legScheduleFields").innerHTML = roles.map(([role, label], index) => {
    const values = legWindowDrafts.get(role) || {};
    return `<fieldset data-leg-role="${role}"><legend>${label}</legend>${[["departure", "出發"], ["arrival", "抵達"]].map(([key, title]) => `
      <div class="leg-event-grid">
        <label class="leg-event-date"><span>${title}日期（選填）</span><input type="date" data-window-field="${key}Date" value="${escapeHtml(values[`${key}Date`] || "")}" /></label>
        <label><span>${title}從</span><input type="time" data-window-field="${key}TimeFrom" value="${escapeHtml(values[`${key}TimeFrom`] || "")}" /></label>
        <label><span>${title}至</span><input type="time" data-window-field="${key}TimeTo" value="${escapeHtml(values[`${key}TimeTo`] || "")}" /></label>
      </div>${key === "departure" && role === "outbound" ? `<label><span>另一出發日（擇低價，選填）</span><input type="date" data-window-field="departureDateAlternative" value="${escapeHtml(values.departureDateAlternative || "")}" /></label>` : ""}`).join("")}
      <div class="leg-carrier-grid">
        <label><span>指定航空公司（選填）</span><input list="airlineSuggestions" data-window-field="airline" placeholder="MU／中國東方航空" value="${escapeHtml(values.airline || "")}" maxlength="80" /></label>
        <label><span>必搭班號（依序，逗號分隔，選填）</span><input data-window-field="flightNumbers" placeholder="MU5616, MU5005" value="${escapeHtml(String(values.flightNumbers || ""))}" maxlength="100" autocapitalize="characters" spellcheck="false" /></label>
      </div><button type="button" class="compare-button" data-form-leg="${index}">單段查價／艙等</button><div class="leg-form-quotes" aria-live="polite"></div></fieldset>`;
  }).join("");
  document.querySelectorAll("[data-form-leg]").forEach((button) => button.addEventListener("click", () => quoteFormLeg(Number(button.dataset.formLeg), button)));
  document.querySelectorAll("[data-window-field]").forEach((input) => input.addEventListener("change", updateDateFields));
  setupLegDatePickers();
  updateDateFields();
}

function setupLegDatePickers() {
  if (!window.flatpickr) return;
  document.querySelectorAll('#legScheduleFields input[type="date"]').forEach((input) => {
    input.classList.add("leg-date");
    input.placeholder = "選擇日期";
    window.flatpickr(input, {
      locale: "zh_tw", dateFormat: "Y-m-d", ariaDateFormat: "Y年m月d日",
      disableMobile: true, allowInput: true, animate: false, position: "auto center",
      onOpen: (_, __, picker) => {
        const fieldset = input.closest("[data-leg-role]");
        const fields = [...document.querySelectorAll("[data-leg-role]")];
        const previous = fields[fields.indexOf(fieldset) - 1];
        const departure = fieldset.querySelector('[data-window-field="departureDate"]').value;
        const anchor = input.value || departure
          || previous?.querySelector('[data-window-field="arrivalDate"]').value
          || previous?.querySelector('[data-window-field="departureDate"]').value
          || elements.flightForm.elements.fixedDepartureDate.value;
        picker.setDate(input.value, false);
        // Move only the calendar view, never silently add an arrival-date constraint.
        picker.jumpToDate(anchor || new Date());
      },
      onReady: (_, __, picker) => {
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "date-clear";
        clear.textContent = "清除日期";
        clear.addEventListener("click", () => { picker.clear(); picker.close(); });
        picker.calendarContainer.append(clear);
        input.addEventListener("keydown", (event) => {
          if (event.key === "Escape") { picker.close(); event.stopPropagation(); }
        });
      },
    });
  });
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
      ${cabin.separateTickets ? '<small>分開購票合計</small>' : ""}
      <strong>${cabin.available ? escapeHtml(cabin.priceText || money(cabin.price, currency)) : cabin.status === "failed" ? "查詢失敗" : "未取得報價"}</strong>
      <small>${cabin.departureDate ? `${escapeHtml(cabin.departureDate)} · ${escapeHtml(cabin.legs?.[0]?.departureAirport || "")} ${escapeHtml(cabin.airline || "航班")}` : "目前樣本無結果"}</small>
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
  renderFlightYearStats(view.insights?.yearStats, view.currency);
  renderDurationAlternatives(view.insights, view.currency);
  renderCabinOverview(view.unpricedResults?.length && !view.results.length ? [] : view.insights?.cabinPrices, view.currency);
  renderResults(view.searched ? view.title : "機票搜尋結果", [...view.results, ...(view.unpricedResults || [])]);
  renderTicketQuoteStatus(view);
}

function renderTicketQuoteStatus(view) {
  const section = document.querySelector("#ticketQuoteStatus");
  section.replaceChildren();
  section.hidden = !view.searched || view.journeyType !== "multicity";
  if (section.hidden) return;
  const separate = view.ticketMode === "separate";
  const title = document.createElement("h3");
  title.textContent = separate ? "分開購票" : "多城市聯程";
  const message = document.createElement("p");
  message.textContent = view.results.length
    ? separate ? "各段獨立購票，合計不是一張聯程票價。" : "資料來源提供整趟報價，非各段相加；是否以一張票開立及轉機保障，仍須由購票頁確認。"
    : view.unpricedResults?.length ? "已找到符合條件的航班，但尚未取得整趟聯程購票價格；是否能開立一張票仍待確認。"
    : view.insights ? separate ? "未取得完整的分段購票組合。" : "未取得聯程報價，不代表航空公司無票；未以分段加總替代。"
      : "查詢失敗，尚無法確認報價。";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "compare-button";
  button.textContent = separate ? "改查聯程整趟報價" : "改查分開購票價格";
  button.addEventListener("click", () => {
    if (elements.flightSubmitButton.disabled) return;
    elements.flightForm.elements.ticketMode.value = separate ? "through" : "separate";
    elements.flightForm.requestSubmit();
  });
  section.append(title, message, button);
  if (!view.results.length && !view.unpricedResults?.length) elements.resultList.replaceChildren();
}

function watchFromResult(item) {
  const flight = { ...(item.searchPayload || state.lastFlightPayload), ...(item.separateTickets ? { ticketMode: "separate" } : {}) };
  const placeLabel = (code) => airportDirectory.find((place) => place.group && place.iataCode === code)?.name || code;
  const originLabel = placeLabel(flight.departureId);
  const arrivalLabel = placeLabel(flight.arrivalId);
  const modeLabel = dateConstraintLabel(flight) || (flight.flightMode === "annual_low" ? "未來一年低價探索" : `${flight.startDate} 起 ${flight.lookaheadDays} 天`);
  return {
    ...flight,
    type: "flight",
    id: stableId("flight", JSON.stringify({ ...flight, targetPrice: undefined, travelClass: item.travelClass || "1" })),
    name: flight.journeyType === "multicity"
      ? `${originLabel} → ${placeLabel(flight.stopoverId)}（${flight.stopoverMinNights}–${flight.stopoverMaxNights} 晚）→ ${arrivalLabel}${flight.includeReturn ? ` → ${originLabel}` : ""} · ${modeLabel} · ${item.cabinLabel || "經濟艙"}${item.separateTickets ? " · 分開購票" : ""}`
      : `${originLabel} 到 ${arrivalLabel} ${modeLabel} · ${flight.tripDays ? `${flight.tripDays} 天${flight.dateConstraint === "both" ? "" : "為主"}` : "單程"} · ${item.cabinLabel || "經濟艙"}`,
    targetPrice: elements.flightForm.elements.targetPrice.value || item.price,
    travelClass: item.travelClass || "1",
    cabinClass: item.cabinClass || "economy",
    cabinLabel: item.cabinLabel || "經濟艙",
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

async function searchFlight(event) {
  event.preventDefault();
  if (elements.flightSubmitButton.disabled) return;
  const data = formData(elements.flightForm);
  setFlightLoading(true);
  setPanelStatus("flightPanel", "正在解析出發地與目的地");
  try {
    const [departureId, arrivalId] = await Promise.all([
      resolvePlaceCode(elements.flightForm.elements.departureId),
      resolvePlaceCode(elements.flightForm.elements.arrivalId),
    ]);
    const multi = data.journeyType === "multicity";
    const legTimeWindows = readLegWindows();
    const hasLegDates = legTimeWindows.some((w) => w.departureDate || w.arrivalDate);
    const stopoverId = multi ? await resolvePlaceCode(elements.flightForm.elements.stopoverId) : "";
    if (!normalizeAirportCodes(departureId) || !normalizeAirportCodes(arrivalId) || (multi && !normalizeAirportCodes(stopoverId))) {
      throw new Error("請輸入至少兩個字，或從機場建議中選擇");
    }
    state.lastFlightPayload = {
      flightMode: data.dateConstraint === "flexible" && !hasLegDates ? state.flightMode : "date_window",
      legTimeWindows,
      dateConstraint: data.dateConstraint,
      fixedDepartureDate: data.fixedDepartureDate || "",
      fixedReturnDate: data.fixedReturnDate || "",
      departureId,
      arrivalId,
      startDate: state.flightMode === "date_window" ? data.startDate : "",
      tripDays: data.journeyType === "oneway" ? 0 : !multi && data.dateConstraint === "both" ? Math.round((Date.parse(data.fixedReturnDate) - Date.parse(data.fixedDepartureDate)) / 86400000) : Number(data.tripDays || 0),
      lookaheadDays: Number(data.lookaheadDays ?? 30),
      targetPrice: data.targetPrice,
      airlineType: data.airlineType || "all",
      journeyAirline: data.journeyAirline || "",
      routeType: data.routeType || "any",
      currency: data.currency || "TWD",
      market: data.market || "TW",
      locale: "zh-TW",
      journeyType: multi ? "multicity" : "simple",
      ticketMode: multi && data.ticketMode === "separate" ? "separate" : "through",
      stopoverId,
      stopoverMinNights: Number(data.stopoverMinNights || 2),
      stopoverMaxNights: Number(data.stopoverMaxNights || 5),
      includeReturn: data.includeReturn === "on",
      destinationMinNights: Number(data.destinationMinNights || 3),
      destinationMaxNights: Number(data.destinationMaxNights || 7),
      excludedAirlines: [...new FormData(elements.flightForm).getAll("excludedAirlines"), ...String(data.otherExcludedAirlines || "").split(/[,，\s]+/).filter(Boolean)].map((code) => code.toUpperCase()),
      excludedAircraft: [...new FormData(elements.flightForm).getAll("excludedAircraft"), ...String(data.otherExcludedAircraft || "").split(/[,，]+/).map((model) => model.trim()).filter(Boolean)],
      allowUnknownAircraft: data.allowUnknownAircraft === "on",
      departureTimeFrom: data.departureTimeFrom,
      departureTimeTo: data.departureTimeTo,
      arrivalTimeFrom: data.arrivalTimeFrom,
      arrivalTimeTo: data.arrivalTimeTo,
    };
    setPanelStatus("flightPanel", data.dateConstraint !== "flexible" || hasLegDates ? "搜尋指定日期與時段票價" : state.flightMode === "annual_low" ? "探索未來一年代表日期" : "搜尋日期區間票價");
    const response = await api("/api/price-watch/search", {
      method: "POST",
      body: JSON.stringify({
        type: "flight",
        ...state.lastFlightPayload,
      }),
    });
    const view = state.views.flightPanel;
    view.results = (response.results || []).map((item) => ({ ...item, searchPayload: structuredClone(state.lastFlightPayload) }));
    view.unpricedResults = (response.unpricedResults || []).map((item) => ({ ...item, searchPayload: structuredClone(state.lastFlightPayload) }));
    view.insights = response.insights || null;
    view.currency = response.currency || data.currency || "TWD";
    view.searched = true;
    view.journeyType = state.lastFlightPayload.journeyType;
    view.ticketMode = state.lastFlightPayload.ticketMode;
    view.title = multi ? view.ticketMode === "separate" ? "多城市分開購票" : "多城市聯程整趟報價" : data.dateConstraint !== "flexible" || hasLegDates ? "指定日期與時段票價" : state.flightMode === "annual_low" ? "全年抽樣低價候選" : "日期區間抽樣票價";
    if (state.activePanel === "flightPanel") {
      renderActiveView();
      revealResults();
    }
    setFlightLoading(false);
    const resultMessage = response.insights?.samplingNotice || (view.results.length ? "搜尋完成" : "沒有找到票價");
    if (view.results.length || view.unpricedResults.length) {
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
    view.unpricedResults = [];
    view.insights = null;
    view.searched = true;
    view.title = "機票結果";
    view.journeyType = data.journeyType;
    view.ticketMode = data.ticketMode || "through";
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
  updateDateFields();
}

function dateConstraintLabel(flight) {
  return [flight.fixedDepartureDate ? `${flight.fixedDepartureDate} 出發` : "", flight.fixedReturnDate ? `${flight.fixedReturnDate} 回程起飛` : "",
    flight.journeyAirline ? `全程 ${flight.journeyAirline}` : "",
    ...(flight.legTimeWindows || []).flatMap((w, index) => [w.departureDate ? `第${index + 1}段 ${w.departureDate}${w.departureDateAlternative ? ` 或 ${w.departureDateAlternative}` : ""} 出發` : "", w.arrivalDate ? `第${index + 1}段 ${w.arrivalDate} 抵達` : "", w.airline || "", String(w.flightNumbers || "")])].filter(Boolean).join(" · ");
}

function updateDateFields() {
  const form = elements.flightForm;
  const oneway = form.elements.journeyType.value === "oneway";
  for (const option of form.elements.dateConstraint.options) option.disabled = oneway && ["return", "both"].includes(option.value);
  if (oneway && ["return", "both"].includes(form.elements.dateConstraint.value)) form.elements.dateConstraint.value = "flexible";
  const constraint = form.elements.dateConstraint.value;
  const flexible = constraint === "flexible";
  document.querySelector("#flexibleModeSwitch").hidden = !flexible;
  document.querySelector("#fixedFlightFields").hidden = flexible;
  for (const [key, id, show] of [["fixedDepartureDate", "fixedDepartureField", ["departure", "both"].includes(constraint)], ["fixedReturnDate", "fixedReturnField", ["return", "both"].includes(constraint)]]) {
    document.getElementById(id).hidden = !show;
    form.elements[key].disabled = !show;
    form.elements[key].required = show;
  }
  form.elements.tripDays.disabled = form.elements.journeyType.value !== "simple" || constraint === "both";
  document.querySelector("#tripDaysField").hidden = form.elements.tripDays.disabled;
  const isWindow = flexible && state.flightMode === "date_window";
  elements.windowFlightFields.hidden = !isWindow;
  elements.flightForm.elements.startDate.required = isWindow && !readLegWindows().some((w) => w.departureDate || w.arrivalDate);
  if (!elements.flightSubmitButton.disabled) elements.flightSubmitButton.textContent = flightSubmitLabel();
}

function savedItem(watch, origin) {
  const item = document.createElement("article");
  item.className = "saved-item";
  item.innerHTML = `
    <div>
      <h3>${escapeHtml(watch.name || watch.id)}</h3>
      <p>${escapeHtml(origin)} · 航班 · 目標 ${escapeHtml(watch.target_price || watch.targetPrice || "-")}</p>
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
      (data.watches || []).filter((watch) => watch?.type === "flight").forEach((watch) => nodes.push(savedItem(watch, "雲端")));
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
    setPanelStatus("flightPanel", ready ? "準備搜尋" : "尚未設定機票搜尋 API", ready ? "ready" : "error");
  } catch {
    setPanelStatus("flightPanel", token() ? "準備搜尋" : "搜尋服務狀態暫時無法確認", token() ? "ready" : "error");
  }
}

function boot() {
  setupJourneyFields();
  void loadAirportDirectory();
  elements.flightForm.elements.dateConstraint.addEventListener("change", () => {
    if (["return", "both"].includes(elements.flightForm.elements.dateConstraint.value) && elements.flightForm.elements.journeyType.value === "multicity") {
      elements.flightForm.elements.includeReturn.checked = true;
      elements.flightForm.elements.includeReturn.dispatchEvent(new Event("change"));
    }
    updateDateFields();
  });
  if (!elements.flightForm.elements.departureId.value) selectPlace(elements.flightForm.elements.departureId, POPULAR_PLACES[0]);
  elements.accessTokenInput.value = token();
  elements.apiBaseInput.value = apiBase();
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchPanel(tab.dataset.panel));
  });
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
  applyTripFromLink();
  window.addEventListener("hashchange", applyTripFromLink);
  document.querySelector("#copyTripLinkButton").addEventListener("click", copyTripLink);
  loadConfig();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js?v=21").catch(() => {});
  }
}

boot();
