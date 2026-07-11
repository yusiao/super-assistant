(() => {
  "use strict";

  const config = window.TRANSIT_CONFIG || {};
  const form = document.querySelector("#journey-form");
  const originInput = document.querySelector("#origin");
  const destinationInput = document.querySelector("#destination");
  const datetimeRow = document.querySelector("#datetime-row");
  const datetimeInput = document.querySelector("#datetime-input");
  const datetimeLabel = document.querySelector("#datetime-label");
  const searchButton = document.querySelector("#search-button");
  const formMessage = document.querySelector("#form-message");
  const results = document.querySelector("#results");
  const routeResults = document.querySelector("#route-results");
  const resultContext = document.querySelector("#result-context");
  const routeTemplate = document.querySelector("#route-card-template");
  const installButton = document.querySelector("#install-button");
  let timeMode = "now";
  let installPrompt = null;

  const pad = (value) => String(value).padStart(2, "0");
  const formatTime = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const formatDateTimeValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const formatShortDate = (date) => `${date.getMonth() + 1}/${date.getDate()} ${formatTime(date)}`;
  const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000);
  const formatServiceTime = (value) => {
    const match = String(value || "").match(/T(\d{2}:\d{2})/);
    return match ? match[1] : "--:--";
  };
  const clearCoordinate = (input) => {
    delete input.dataset.lat;
    delete input.dataset.lon;
  };

  function updateClock() {
    document.querySelector("#hero-clock").textContent = formatTime(new Date());
  }

  function setDefaultDateTime() {
    const value = new Date(Date.now() + 30 * 60_000);
    value.setSeconds(0, 0);
    datetimeInput.min = formatDateTimeValue(new Date());
    datetimeInput.value = formatDateTimeValue(value);
  }

  function selectTimeMode(mode) {
    timeMode = mode;
    document.querySelectorAll(".time-tab").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    datetimeRow.hidden = mode === "now";
    datetimeInput.required = mode !== "now";
    datetimeLabel.textContent = mode === "arrive" ? "希望抵達日期與時間" : "出發日期與時間";
    if (mode !== "now" && !datetimeInput.value) setDefaultDateTime();
  }

  function getRequestedDate() {
    if (timeMode === "now") return new Date();
    const date = new Date(datetimeInput.value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
  }

  function buildDemoRoutes(origin, destination, requestedDate) {
    const seed = [...`${origin}${destination}`].reduce((total, character) => total + character.charCodeAt(0), 0);
    const baseDuration = 48 + (seed % 9);
    const durations = [baseDuration, baseDuration + 9, baseDuration + 17];
    const variants = [
      {
        badge: "推薦最快",
        modes: [
          { type: "walk", label: "步行" },
          { type: "bus", label: "接駁" },
          { type: "rail", label: "機捷" },
          { type: "walk", label: "步行" }
        ],
        transfers: 1,
        walk: 11,
        details: ["步行前往鄰近站點", "搭乘接駁公車前往機場捷運轉乘站", "搭乘機場捷運往林口方向", "下車後步行抵達目的地"]
      },
      {
        badge: "少走路",
        modes: [
          { type: "walk", label: "步行" },
          { type: "bus", label: "公車" },
          { type: "bus", label: "公車" },
          { type: "walk", label: "步行" }
        ],
        transfers: 1,
        walk: 6,
        details: ["步行前往最近公車站", "搭乘第一段市區公車", "轉乘往林口方向公車", "下車後短距離步行抵達"]
      },
      {
        badge: "少轉乘",
        modes: [
          { type: "walk", label: "步行" },
          { type: "bus", label: "直達" },
          { type: "walk", label: "步行" }
        ],
        transfers: 0,
        walk: 15,
        details: ["步行前往直達路線站牌", "搭乘往林口方向直達公車", "下車後步行抵達目的地"]
      }
    ];

    return durations.map((duration, index) => {
      const arrival = timeMode === "arrive" ? requestedDate : addMinutes(requestedDate, duration);
      const departure = timeMode === "arrive" ? addMinutes(requestedDate, -duration) : requestedDate;
      return { ...variants[index], duration, departure, arrival };
    });
  }

  async function queryRoutes(origin, destination, requestedDate) {
    if (!config.routingEndpoint) return buildDemoRoutes(origin, destination, requestedDate);
    const response = await fetch(config.routingEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: originInput.dataset.lat && originInput.dataset.lon
          ? { label: origin, lat: Number(originInput.dataset.lat), lon: Number(originInput.dataset.lon) }
          : origin,
        destination: destinationInput.dataset.lat && destinationInput.dataset.lon
          ? { label: destination, lat: Number(destinationInput.dataset.lat), lon: Number(destinationInput.dataset.lon) }
          : destination,
        timeMode,
        datetime: requestedDate.toISOString()
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error?.message || "路線服務暫時無法回應");
    return payload.map((route) => ({
      ...route,
      departure: new Date(route.departure),
      arrival: new Date(route.arrival)
    }));
  }

  function renderRoutes(routes, origin, destination) {
    routeResults.replaceChildren();
    resultContext.innerHTML = `<strong>${escapeHtml(origin)}</strong> → <strong>${escapeHtml(destination)}</strong><br>${timeMode === "arrive" ? "希望抵達" : "預計出發"}：${formatShortDate(timeMode === "arrive" ? routes[0].arrival : routes[0].departure)}`;

    routes.forEach((route, index) => {
      const fragment = routeTemplate.content.cloneNode(true);
      const card = fragment.querySelector(".route-card");
      if (index === 0) card.classList.add("recommended");
      fragment.querySelector(".route-time strong").textContent = route.duration;
      fragment.querySelector(".arrival-time").textContent = `${formatTime(route.departure)} 出發 · ${formatTime(route.arrival)} 抵達`;
      fragment.querySelector(".route-badge").textContent = route.badge;
      fragment.querySelector(".mode-summary").textContent = route.modes.map((mode) => mode.label).join(" · ");

      const line = fragment.querySelector(".journey-line");
      route.modes.forEach((mode, modeIndex) => {
        const node = document.createElement("span");
        node.className = `mode-node ${mode.type}`;
        node.textContent = mode.label;
        line.append(node);
        if (modeIndex < route.modes.length - 1) {
          const connector = document.createElement("i");
          connector.className = "mode-connector";
          line.append(connector);
        }
      });

      fragment.querySelector(".route-meta").innerHTML = `<span>轉乘 ${route.transfers} 次</span><span>步行約 ${route.walk} 分鐘</span><span>${escapeHtml(route.source || "示範估算")}</span>`;
      const details = fragment.querySelector(".route-details");
      route.details.forEach((detail, detailIndex) => {
        const step = document.createElement("div");
        if (typeof detail === "string") {
          step.className = "detail-step legacy";
          step.innerHTML = `<b>${detailIndex + 1}</b><span>${escapeHtml(detail)}</span>`;
        } else {
          const routeName = detail.route || detail.label || "公共運輸";
          const title = detail.type === "walk"
            ? `步行約 ${detail.duration} 分鐘`
            : `${routeName}${detail.headsign ? ` 往 ${detail.headsign}` : ""}`;
          const meta = [
            detail.type !== "walk" && detail.route ? `班次 ${detail.route}` : "",
            detail.agency,
            detail.stopCount ? `途經 ${detail.stopCount} 站` : "",
            detail.fare ? `票價約 $${detail.fare}` : ""
          ].filter(Boolean);
          step.className = `detail-step ${detail.type || "transit"}`;
          step.innerHTML = `
            <b>${escapeHtml(detail.type === "walk" ? "步行" : routeName)}</b>
            <div class="detail-step-body">
              <strong>${escapeHtml(title)}</strong>
              <div class="detail-stations">
                <div><time>${formatServiceTime(detail.departure)}</time><span>${escapeHtml(detail.from || "起點")}</span></div>
                <i aria-hidden="true"></i>
                <div><time>${formatServiceTime(detail.arrival)}</time><span>${escapeHtml(detail.to || "目的地")}</span></div>
              </div>
              ${meta.length ? `<p>${meta.map(escapeHtml).join(" · ")}</p>` : ""}
            </div>`;
        }
        details.append(step);
      });
      const detailButton = fragment.querySelector(".route-detail-button");
      detailButton.addEventListener("click", () => {
        const open = details.hidden;
        details.hidden = !open;
        detailButton.firstChild.textContent = open ? "收起完整步驟 " : "查看完整步驟 ";
        detailButton.querySelector("span").textContent = open ? "−" : "＋";
      });
      routeResults.append(fragment);
    });

    results.hidden = false;
    requestAnimationFrame(() => results.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  document.querySelectorAll(".time-tab").forEach((button) => button.addEventListener("click", () => selectTimeMode(button.dataset.mode)));
  originInput.addEventListener("input", () => clearCoordinate(originInput));
  destinationInput.addEventListener("input", () => clearCoordinate(destinationInput));

  document.querySelector("#swap-button").addEventListener("click", () => {
    const origin = originInput.value;
    const originCoordinate = { lat: originInput.dataset.lat, lon: originInput.dataset.lon };
    const destinationCoordinate = { lat: destinationInput.dataset.lat, lon: destinationInput.dataset.lon };
    originInput.value = destinationInput.value;
    destinationInput.value = origin;
    clearCoordinate(originInput);
    clearCoordinate(destinationInput);
    if (destinationCoordinate.lat && destinationCoordinate.lon) Object.assign(originInput.dataset, destinationCoordinate);
    if (originCoordinate.lat && originCoordinate.lon) Object.assign(destinationInput.dataset, originCoordinate);
  });

  document.querySelector("#demo-preset").addEventListener("click", () => {
    originInput.value = "三重國小站";
    destinationInput.value = "林口長庚紀念醫院";
    clearCoordinate(originInput);
    clearCoordinate(destinationInput);
    formMessage.textContent = "";
  });

  document.querySelector("#locate-button").addEventListener("click", () => {
    formMessage.textContent = "";
    if (!navigator.geolocation) {
      formMessage.textContent = "此裝置不支援定位，請直接輸入起點。";
      return;
    }
    const locateButton = document.querySelector("#locate-button");
    locateButton.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        originInput.value = "目前位置";
        originInput.dataset.lat = position.coords.latitude;
        originInput.dataset.lon = position.coords.longitude;
        locateButton.disabled = false;
      },
      () => {
        formMessage.textContent = "無法取得位置，請允許定位或直接輸入地址。";
        locateButton.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "";
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();
    const requestedDate = getRequestedDate();
    if (!origin || !destination) {
      formMessage.textContent = "請輸入起點與目的地。";
      (!origin ? originInput : destinationInput).focus();
      return;
    }
    if (!requestedDate) {
      formMessage.textContent = "請選擇有效的日期與時間。";
      datetimeInput.focus();
      return;
    }

    searchButton.classList.add("loading");
    searchButton.querySelector("span").textContent = "正在排出最快路線…";
    try {
      const [routes] = await Promise.all([
        queryRoutes(origin, destination, requestedDate),
        new Promise((resolve) => setTimeout(resolve, 520))
      ]);
      renderRoutes(routes, origin, destination);
      localStorage.setItem("transit:lastJourney", JSON.stringify({ origin, destination }));
    } catch (error) {
      formMessage.textContent = error.message || "查詢失敗，請稍後再試。";
    } finally {
      searchButton.classList.remove("loading");
      searchButton.querySelector("span").textContent = "找最快路線";
    }
  });

  document.querySelector("#close-results").addEventListener("click", () => {
    results.hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.querySelector("#saved-button").addEventListener("click", () => {
    const last = JSON.parse(localStorage.getItem("transit:lastJourney") || "null");
    if (!last) {
      formMessage.textContent = "完成一次查詢後，最近路線會出現在這裡。";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    originInput.value = last.origin;
    destinationInput.value = last.destination;
    clearCoordinate(originInput);
    clearCoordinate(destinationInput);
    formMessage.textContent = "已帶入最近查詢。";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });

  async function checkDataService() {
    const status = document.querySelector("#data-status");
    const disclaimer = document.querySelector("#data-disclaimer");
    if (!config.healthEndpoint) return;
    try {
      const response = await fetch(config.healthEndpoint, { cache: "no-store" });
      const health = await response.json();
      if (health.configured) {
        status.classList.add("live");
        status.innerHTML = "<span></span> TDX 正式資料";
        status.setAttribute("aria-label", "TDX 正式交通資料已連線");
      } else {
        status.innerHTML = "<span></span> 待設定金鑰";
        status.setAttribute("aria-label", "TDX 金鑰尚未設定");
        disclaimer.textContent = "後端串接已完成，設定 TDX Client ID 與 Client Secret 後即可啟用正式旅運規劃。";
      }
    } catch {
      status.innerHTML = "<span></span> 服務離線";
      disclaimer.textContent = "目前無法連線交通資料服務，請稍後再試。";
    }
  }

  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
  setDefaultDateTime();
  updateClock();
  checkDataService();
  setInterval(updateClock, 30_000);
})();
