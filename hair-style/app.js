const $ = (selector) => document.querySelector(selector);

const state = {
  imageData: "",
  fileName: "",
  lastResult: null,
};

const labels = {
  maintenance: ["極低", "低", "中等", "偏高", "高"],
  color: ["自然黑棕", "低調提亮", "自然提亮", "明顯染髮", "高辨識度"],
  vibe: {
    clean: "乾淨俐落",
    soft: "柔和自然",
    editorial: "高級感",
    bold: "明顯改造",
  },
  length: {
    open: "都可嘗試",
    short: "偏短髮",
    medium: "中長度",
    long: "保留長度",
  },
  texture: {
    unknown: "由照片判斷",
    straight: "直髮",
    wavy: "自然捲/微捲",
    curly: "捲髮",
    fine: "細軟髮",
    thick: "粗硬髮",
  },
};

const photoInput = $("#photoInput");
const photoDrop = $("#photoDrop");
const previewImage = $("#previewImage");
const photoCopy = $("#photoCopy");
const styleForm = $("#styleForm");
const providerStatus = $("#providerStatus");
const maintenance = $("#maintenance");
const colorBoldness = $("#colorBoldness");
const maintenanceOutput = $("#maintenanceOutput");
const colorOutput = $("#colorOutput");
const submitButton = $("#submitButton");
const toast = $("#toast");
const results = $("#results");
const beforeImage = $("#beforeImage");
const afterImage = $("#afterImage");
const imagePlaceholder = $("#imagePlaceholder");
const afterCaption = $("#afterCaption");
const shapeLabel = $("#shapeLabel");
const confidenceLabel = $("#confidenceLabel");
const summaryText = $("#summaryText");
const cueList = $("#cueList");
const recommendations = $("#recommendations");
const resultTitle = $("#resultTitle");
const shareButton = $("#shareButton");
const submitButtonLabel = $("#submitButton .button-label");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function updateRangeLabels() {
  maintenanceOutput.textContent = labels.maintenance[Number(maintenance.value) - 1];
  colorOutput.textContent = labels.color[Number(colorBoldness.value) - 1];
}

function setStatus(text, mode = "") {
  providerStatus.textContent = text;
  providerStatus.className = `status-pill ${mode}`.trim();
}

function isFilePreview() {
  return location.protocol === "file:" || new URLSearchParams(location.search).has("demo");
}

function collectPreferences() {
  const vibe = styleForm.querySelector('input[name="vibe"]:checked')?.value || "clean";
  return {
    vibe,
    vibeLabel: labels.vibe[vibe],
    lengthPreference: $("#lengthPreference").value,
    lengthLabel: labels.length[$("#lengthPreference").value],
    texture: $("#texture").value,
    textureLabel: labels.texture[$("#texture").value],
    maintenance: Number(maintenance.value),
    maintenanceLabel: labels.maintenance[Number(maintenance.value) - 1],
    colorBoldness: Number(colorBoldness.value),
    colorLabel: labels.color[Number(colorBoldness.value) - 1],
    notes: $("#notes").value.trim().slice(0, 420),
  };
}

function imageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("無法讀取這張照片，請改用 JPG、PNG 或 WEBP。"));
    };
    image.src = url;
  });
}

async function compressPhoto(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("請選擇照片檔案。");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("照片太大，請改用 12MB 以下的圖片。");
  }

  const image = await imageFromFile(file);
  let maxSide = 1500;
  let quality = .84;
  let dataUrl = "";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#f7f2e9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length < 4_800_000) break;
    maxSide = Math.round(maxSide * .82);
    quality -= .08;
  }

  return dataUrl;
}

function setPreview(dataUrl, fileName = "") {
  state.imageData = dataUrl;
  state.fileName = fileName;
  previewImage.src = dataUrl;
  previewImage.hidden = false;
  photoCopy.hidden = true;
}

function clearPreview() {
  state.imageData = "";
  state.fileName = "";
  state.lastResult = null;
  photoInput.value = "";
  previewImage.removeAttribute("src");
  previewImage.hidden = true;
  photoCopy.hidden = false;
  results.hidden = true;
}

async function handlePhoto(file) {
  try {
    showToast("照片處理中");
    const dataUrl = await compressPhoto(file);
    setPreview(dataUrl, file.name);
    showToast("照片已準備好");
  } catch (error) {
    showToast(error.message || "照片處理失敗。");
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButtonLabel.textContent = isLoading ? "生成中..." : "生成髮型提案";
}

function renderLoading() {
  results.hidden = false;
  beforeImage.src = state.imageData;
  afterImage.hidden = true;
  imagePlaceholder.hidden = false;
  imagePlaceholder.textContent = "生成示意圖中";
  imagePlaceholder.classList.add("loading");
  afterCaption.textContent = "After";
  resultTitle.textContent = "正在分析頭型";
  shapeLabel.textContent = "分析中";
  confidenceLabel.textContent = "--";
  summaryText.textContent = "Jarvis 正在整理頭型、臉部比例、髮色與日常維護條件。";
  cueList.innerHTML = "";
  recommendations.innerHTML = "";
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function normalizedColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : "#6b4b3e";
}

function renderRecommendations(items = []) {
  recommendations.innerHTML = items.map((item, index) => `
    <article class="style-card">
      <div class="card-topline">
        <div>
          <p>${index === 0 ? "首選" : `方案 ${index + 1}`}</p>
          <h3>${escapeHtml(item.title || "髮型方案")}</h3>
        </div>
        <span class="swatch" style="--swatch:${normalizedColor(item.colorHex)}" title="${escapeHtml(item.color || "髮色")}"></span>
      </div>
      <dl>
        <div><dt>剪裁</dt><dd>${escapeHtml(item.cut || item.haircut || "依臉型調整層次")}</dd></div>
        <div><dt>髮色</dt><dd>${escapeHtml(item.color || "自然棕色系")}</dd></div>
        <div><dt>理由</dt><dd>${escapeHtml(item.why || "平衡頭型比例並提高輪廓清晰度。")}</dd></div>
        <div><dt>整理</dt><dd>${escapeHtml(item.maintenance || "日常吹整即可維持。")}</dd></div>
        <div><dt>給設計師</dt><dd>${escapeHtml(item.salonBrief || "保留臉周修飾，避免厚重髮量壓低輪廓。")}</dd></div>
      </dl>
    </article>
  `).join("");
}

function renderResult(result) {
  const analysis = result.analysis || {};
  const image = result.image || {};
  const cues = Array.isArray(analysis.cues) ? analysis.cues : [];

  state.lastResult = result;
  results.hidden = false;
  beforeImage.src = state.imageData;
  resultTitle.textContent = analysis.bestFor || "你的髮型方向";
  shapeLabel.textContent = analysis.headShape || "未能判定";
  confidenceLabel.textContent = analysis.confidence || "參考";
  summaryText.textContent = analysis.summary || "這份提案以臉型平衡、髮際線修飾、髮色明暗與日常維護為主。";
  cueList.innerHTML = cues.map((cue) => `<span>${escapeHtml(cue)}</span>`).join("");
  renderRecommendations(analysis.recommendations || []);

  imagePlaceholder.classList.remove("loading");
  if (image.imageUrl) {
    afterImage.src = image.imageUrl;
    afterImage.hidden = false;
    imagePlaceholder.hidden = true;
    afterCaption.textContent = image.provider || "AI 生成";
  } else {
    afterImage.hidden = true;
    imagePlaceholder.hidden = false;
    imagePlaceholder.textContent = result.warning || image.message || "已完成分析，未生成示意圖";
    afterCaption.textContent = "After";
  }

  shareButton.hidden = !navigator.share;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function demoResult(payload) {
  const prefs = payload.preferences;
  const bold = prefs.colorBoldness >= 4;
  const short = prefs.lengthPreference === "short";
  const soft = prefs.vibe === "soft";
  const lowCare = prefs.maintenance <= 2;
  const color = bold ? "霧感莓棕或冷茶棕" : prefs.colorBoldness <= 2 ? "黑茶色或深可可棕" : "柔霧拿鐵棕";

  return {
    analysis: {
      headShape: "橢圓偏圓",
      confidence: "Demo",
      bestFor: short ? "輕層次短髮與臉周修飾" : "臉周層次與柔霧髮色",
      summary: "本機預覽無法讀取後端視覺模型，這裡先用偏好產生示範提案。部署到 Cloudflare 並設定模型後，會依照片分析頭型。",
      cues: ["臉周留出修飾線", "頂部保留空氣感", lowCare ? "低維護" : "可接受造型", color],
      recommendations: [
        {
          title: short ? "空氣感短鮑伯" : "鎖骨層次剪",
          cut: short ? "下巴到嘴角之間的短鮑伯，頂部輕層次，側邊不要削太薄。" : "鎖骨附近長度，臉周從顴骨下方開始做柔層次。",
          color,
          colorHex: bold ? "#8d3f49" : "#76513f",
          why: "保留頭頂高度，讓臉型看起來更修長，臉周線條也更乾淨。",
          maintenance: lowCare ? "每 8 到 10 週修剪，平常吹乾即可。" : "每 6 到 8 週修剪，可用圓梳做髮根蓬度。",
          salonBrief: "臉周不要一刀切，瀏海與側邊需要能自然銜接。",
        },
        {
          title: soft ? "柔霧法式瀏海" : "側分輪廓層次",
          cut: soft ? "眉下薄瀏海加兩側弧形鬚髮，整體中長層次。" : "6:4 側分，顴骨到下顎有轉折層次。",
          color: prefs.colorBoldness >= 3 ? "亞麻可可棕" : "自然深棕",
          colorHex: prefs.colorBoldness >= 3 ? "#9b7356" : "#4a352c",
          why: "瀏海與側分能修飾額頭和顴骨，讓頭型比例更完整。",
          maintenance: "瀏海需 3 到 4 週微修，其餘長度可拉長保養週期。",
          salonBrief: "瀏海要保留透明感，避免厚重齊瀏海。",
        },
        {
          title: "高光輪廓染",
          cut: "維持原長度，增加臉周兩束輕高光與髮尾層次。",
          color: bold ? "冷棕底色加莓棕高光" : "黑茶底色加低調焦糖光",
          colorHex: bold ? "#a65051" : "#c08a52",
          why: "利用明暗讓臉周變亮，不大幅改長度也有新鮮感。",
          maintenance: "高光區每 10 到 12 週補色，日常使用護色洗髮。",
          salonBrief: "高光只放臉周與表層少量區域，避免整頭漂染。",
        },
      ],
    },
    image: null,
    warning: "本機 Demo 未生成示意圖。",
  };
}

async function generate(payload) {
  if (isFilePreview()) {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    return demoResult(payload);
  }

  const response = await fetch("/api/hair-style/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `生成失敗，HTTP ${response.status}`);
  }
  return data;
}

async function loadConfig() {
  if (isFilePreview()) {
    setStatus("本機預覽", "warn");
    return;
  }
  try {
    const response = await fetch("/api/hair-style/config", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "config failed");
    const providers = data.providers?.length ? data.providers.join(" / ") : "demo";
    setStatus(providers, data.providers?.length ? "ready" : "warn");
  } catch (error) {
    setStatus("未連後端", "warn");
  }
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (file) handlePhoto(file);
});

$("#changePhoto").addEventListener("click", () => photoInput.click());
$("#bottomUpload").addEventListener("click", () => photoInput.click());
$("#clearPhoto").addEventListener("click", clearPreview);

["dragenter", "dragover"].forEach((eventName) => {
  photoDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    photoDrop.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  photoDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    photoDrop.classList.remove("dragging");
  });
});

photoDrop.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) handlePhoto(file);
});

maintenance.addEventListener("input", updateRangeLabels);
colorBoldness.addEventListener("input", updateRangeLabels);

styleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.imageData) {
    showToast("請先上傳一張正面頭像。");
    photoInput.click();
    return;
  }

  const payload = {
    imageData: state.imageData,
    preferences: collectPreferences(),
    generateImage: $("#generateImage").checked,
  };

  try {
    setLoading(true);
    renderLoading();
    const result = await generate(payload);
    renderResult(result);
    showToast("髮型提案完成");
  } catch (error) {
    imagePlaceholder.classList.remove("loading");
    imagePlaceholder.textContent = error.message || "生成失敗。";
    showToast(error.message || "生成失敗。");
  } finally {
    setLoading(false);
  }
});

shareButton.addEventListener("click", async () => {
  if (!state.lastResult || !navigator.share) return;
  const analysis = state.lastResult.analysis || {};
  const top = analysis.recommendations?.[0];
  try {
    await navigator.share({
      title: "Jarvis Hair Studio",
      text: `${analysis.headShape || "頭型"}：${top?.title || "髮型提案"}，髮色 ${top?.color || "自然棕色系"}`,
    });
  } catch (error) {
    if (error.name !== "AbortError") showToast("分享沒有完成。");
  }
});

if ("serviceWorker" in navigator && !isFilePreview()) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

updateRangeLabels();
loadConfig();
