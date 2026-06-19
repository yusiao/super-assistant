const PILLAR_NAMES = ["年柱", "月柱", "日柱", "時柱"];
const ELEMENTS = ["木", "火", "土", "金", "水"];
const GAN_ELEMENT = {
  "甲": "木",
  "乙": "木",
  "丙": "火",
  "丁": "火",
  "戊": "土",
  "己": "土",
  "庚": "金",
  "辛": "金",
  "壬": "水",
  "癸": "水",
};
const ZHI_ELEMENT = {
  "子": "水",
  "丑": "土",
  "寅": "木",
  "卯": "木",
  "辰": "土",
  "巳": "火",
  "午": "火",
  "未": "土",
  "申": "金",
  "酉": "金",
  "戌": "土",
  "亥": "水",
};
const TOPIC_CONFIG = {
  relationship: {
    label: "感情",
    palaces: ["夫妻宮", "福德宮", "命宮"],
    elements: ["水", "火"],
    prompt: "看互動品質、情緒流動與相處舒適度。",
  },
  marriage: {
    label: "姻緣",
    palaces: ["夫妻宮", "命宮", "遷移宮"],
    elements: ["木", "火"],
    prompt: "看正式關係、對象緣分與外部機會。",
  },
  career: {
    label: "事業",
    palaces: ["官祿宮", "命宮", "遷移宮"],
    elements: ["木", "火", "金"],
    prompt: "看職涯方向、執行力、曝光與制度壓力。",
  },
  parents: {
    label: "父母",
    palaces: ["父母宮", "福德宮", "命宮"],
    elements: ["木", "土"],
    prompt: "看長輩緣、家庭支持與溝通模式。",
  },
  property: {
    label: "財產",
    palaces: ["財帛宮", "田宅宮", "官祿宮"],
    elements: ["土", "金"],
    prompt: "看現金流、資產承載與工作帶財。",
  },
  health: {
    label: "健康",
    palaces: ["疾厄宮", "命宮", "福德宮"],
    elements: ["土", "水"],
    prompt: "看身體壓力、恢復力與長期作息。",
  },
};
const SCOPE_LABELS = {
  natal: "本命",
  decadal: "大限",
  yearly: "流年",
  monthly: "流月",
};
const HELPFUL_STARS = [
  "紫微",
  "天府",
  "天相",
  "太陽",
  "太陰",
  "天梁",
  "武曲",
  "天同",
  "左輔",
  "右弼",
  "文昌",
  "文曲",
  "天魁",
  "天鉞",
  "祿存",
  "天馬",
  "化祿",
  "化權",
  "化科",
  "紅鸞",
  "天喜",
  "天姚",
  "龍德",
  "天德",
  "月德",
  "青龍",
  "恩光",
  "封誥",
  "三台",
  "八座",
  "台輔",
  "天福",
];
const CHALLENGE_STARS = [
  "七殺",
  "破軍",
  "廉貞",
  "巨門",
  "擎羊",
  "陀羅",
  "火星",
  "鈴星",
  "地空",
  "地劫",
  "天空",
  "旬空",
  "孤辰",
  "寡宿",
  "天刑",
  "天哭",
  "天虛",
  "大耗",
  "小耗",
  "劫煞",
  "劫殺",
  "災煞",
  "天煞",
  "白虎",
  "喪門",
  "弔客",
  "病符",
  "伏兵",
  "官符",
  "化忌",
];
const FLOWER_STARS = ["紅鸞", "天喜", "天姚", "咸池"];
const PARTNER_CAREER_RULES = [
  [["天機", "文昌", "文曲"], ["科技產品、資料分析、顧問、教育研究"]],
  [["巨門"], ["法律、公關、媒體、業務談判、語言溝通"]],
  [["太陽"], ["管理職、公共服務、品牌行銷、外勤型工作"]],
  [["太陰"], ["金融會計、設計美感、不動產、照護服務"]],
  [["武曲", "祿存"], ["金融投資、工程技術、營運管理、制度型職務"]],
  [["天府", "紫微", "天相"], ["行政管理、政府機構、大型組織、資源整合"]],
  [["廉貞"], ["法務稽核、制度管理、審美設計、策略職"]],
  [["貪狼", "紅鸞", "天喜", "天姚", "咸池"], ["業務開發、娛樂美學、餐旅社交、內容行銷"]],
  [["七殺", "破軍"], ["新創、工程現場、軍警消防、專案開拓"]],
  [["天梁", "天魁", "天鉞"], ["醫療照護、教育顧問、專業證照、公益服務"]],
  [["天馬"], ["國際貿易、旅運物流、跨城市移動型工作"]],
];
const ELEMENT_WORDS = {
  "木": "成長、規劃與開展",
  "火": "表達、熱度與曝光",
  "土": "穩定、承載與資產",
  "金": "規則、決斷與收斂",
  "水": "感受、流動與應變",
};
const ASTRO_CONFIG = {
  algorithm: "zhongzhou",
};
const ASTRO_SCHOOL_LABEL = "中州派設定";
const HOUR_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCH_GRID = {
  "巳": [1, 1],
  "午": [1, 2],
  "未": [1, 3],
  "申": [1, 4],
  "辰": [2, 1],
  "酉": [2, 4],
  "卯": [3, 1],
  "戌": [3, 4],
  "寅": [4, 1],
  "丑": [4, 2],
  "子": [4, 3],
  "亥": [4, 4],
};
const TW_MAP = {
  "阳": "陽",
  "阴": "陰",
  "时": "時",
  "财": "財",
  "禄": "祿",
  "权": "權",
  "宫": "宮",
  "迁": "遷",
  "仆": "僕",
  "机": "機",
  "杀": "殺",
  "贪": "貪",
  "罗": "羅",
  "铃": "鈴",
  "辅": "輔",
  "马": "馬",
  "钺": "鉞",
  "钧": "鈞",
  "龙": "龍",
  "凤": "鳳",
  "鸾": "鸞",
  "寿": "壽",
  "厨": "廚",
  "华": "華",
  "盖": "蓋",
  "虚": "虛",
  "伤": "傷",
  "灾": "災",
  "岁": "歲",
  "驿": "驛",
  "临": "臨",
  "将": "將",
  "阴": "陰",
  "贵": "貴",
  "劫": "劫",
};

const form = document.querySelector("#birth-form");
const dateInput = document.querySelector("#birth-date");
const timeInput = document.querySelector("#birth-time");
const sampleButton = document.querySelector("#sample-button");
const errorMessage = document.querySelector("#error-message");
const summaryStrip = document.querySelector("#summary-strip");
const pillarGrid = document.querySelector("#pillar-grid");
const elementBars = document.querySelector("#element-bars");
const nayinList = document.querySelector("#nayin-list");
const astrolabeGrid = document.querySelector("#astrolabe-grid");
const scopeSelect = document.querySelector("#scope-select");
const decadalSelect = document.querySelector("#decadal-select");
const targetYearInput = document.querySelector("#target-year");
const targetMonthInput = document.querySelector("#target-month");
const topicSelect = document.querySelector("#topic-select");
const decadalControl = document.querySelector("#decadal-control");
const yearControl = document.querySelector("#year-control");
const monthControl = document.querySelector("#month-control");
const readingOutput = document.querySelector("#reading-output");
const partnerOutput = document.querySelector("#partner-output");
const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");

let currentChart = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toTraditional(value) {
  return String(value ?? "").replace(/[阳阴时财禄权宫迁仆机杀贪罗铃辅马钺钧龙凤鸾寿厨华盖虚伤灾岁驿临将贵]/g, (char) => TW_MAP[char] || char);
}

function getFormValues() {
  const birthDate = dateInput.value;
  const birthTime = timeInput.value;
  const gender = new FormData(form).get("gender") || "女";

  if (!birthDate || !birthTime) {
    throw new Error("請填入完整出生日期與時間。");
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  return { birthDate, birthTime, gender, year, month, day, hour, minute };
}

function getTimeIndex(hour) {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

function getTimeRange(index) {
  const ranges = [
    "23:00-00:59",
    "01:00-02:59",
    "03:00-04:59",
    "05:00-06:59",
    "07:00-08:59",
    "09:00-10:59",
    "11:00-12:59",
    "13:00-14:59",
    "15:00-16:59",
    "17:00-18:59",
    "19:00-20:59",
    "21:00-22:59",
  ];
  return ranges[index] || "";
}

function splitPillar(pillar) {
  const text = String(pillar || "");
  return {
    stem: text.slice(0, 1),
    branch: text.slice(1, 2),
    text,
  };
}

function countElements(pillars) {
  const counts = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));
  pillars.forEach((pillar) => {
    const { stem, branch } = splitPillar(pillar);
    if (GAN_ELEMENT[stem]) counts[GAN_ELEMENT[stem]] += 1;
    if (ZHI_ELEMENT[branch]) counts[ZHI_ELEMENT[branch]] += 1;
  });
  return counts;
}

function starName(star) {
  if (!star) return "";
  const brightness = star.brightness ? ` ${star.brightness}` : "";
  return toTraditional(`${star.name}${brightness}`);
}

function renderStarChips(stars, type, limit = 7) {
  if (!stars || stars.length === 0) {
    return "";
  }

  const visible = stars.slice(0, limit);
  const rest = stars.length - visible.length;
  const chips = visible
    .map((star) => `<span class="star-chip ${type}">${escapeHtml(starName(star))}</span>`)
    .join("");
  const more = rest > 0 ? `<span class="star-chip">+${rest}</span>` : "";
  return `<div class="star-line">${chips}${more}</div>`;
}

function renderAuxiliaryChips(palace) {
  const groups = [
    ["歲前", palace.suiqian12],
    ["將前", palace.jiangqian12],
    ["博士", palace.boshi12],
    ["長生", palace.changsheng12],
  ].filter(([, value]) => value);

  if (!groups.length) return "";

  return `
    <div class="aux-line">
      ${groups.map(([label, value]) => `
        <span class="aux-chip"><b>${escapeHtml(label)}</b>${escapeHtml(toTraditional(value))}</span>
      `).join("")}
    </div>
  `;
}

function getSafeNumber(input, fallback, min, max) {
  const value = Number(input.value || fallback);
  if (Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizePalaceName(name) {
  return toTraditional(name).replaceAll("宫", "宮").replaceAll("禄", "祿");
}

function palaceKey(name) {
  return normalizePalaceName(name).replace(/宮$/, "");
}

function findPalaceByName(astrolabe, palaceName) {
  return astrolabe.palaces.find((palace) => palaceKey(palace.name) === palaceKey(palaceName));
}

function getLifePalace(astrolabe) {
  return findPalaceByName(astrolabe, "命宮");
}

function getBodyPalace(astrolabe) {
  return astrolabe.palaces.find((palace) => palace.isBodyPalace) || null;
}

function getCausePalace(astrolabe) {
  const yearStem = astrolabe.rawDates?.chineseDate?.yearly?.[0];
  if (!yearStem) return null;
  return astrolabe.palaces.find((palace) => palace.heavenlyStem === yearStem) || null;
}

function palaceLabel(palace) {
  if (!palace) return "未取得";
  return `${normalizePalaceName(palace.name)} ${toTraditional(palace.heavenlyStem || "")}${toTraditional(palace.earthlyBranch || "")}`;
}

function allPalaceStars(palace, extraStars = []) {
  return [
    ...(palace?.majorStars || []),
    ...(palace?.minorStars || []),
    ...(palace?.adjectiveStars || []),
    ...extraStars,
  ];
}

function starPlainName(star) {
  return toTraditional(star?.name || "");
}

function starDisplayName(star) {
  const name = starName(star);
  const mutagen = toTraditional(star?.mutagen || "");
  return mutagen ? `${name}化${mutagen}` : name;
}

function hasAnyKeyword(value, keywords) {
  return keywords.some((keyword) => value.includes(keyword));
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function summarizeStarNames(stars, fallback = "未見明顯星曜") {
  const names = uniqueItems(stars.map(starDisplayName));
  return names.length ? names.slice(0, 5).join("、") : fallback;
}

function palaceAuxiliaryNames(palace) {
  return [
    palace?.suiqian12,
    palace?.jiangqian12,
    palace?.boshi12,
    palace?.changsheng12,
  ].map(toTraditional).filter(Boolean);
}

function evaluatePalace(palace, extraStars = []) {
  const auxiliaryStars = palaceAuxiliaryNames(palace).map((name) => ({
    name,
    type: "auxiliary",
    scope: "origin",
  }));
  const stars = allPalaceStars(palace, [...auxiliaryStars, ...extraStars]);
  const helpful = [];
  const challenges = [];
  const flowers = [];
  let score = 0;

  stars.forEach((star) => {
    const name = starPlainName(star);
    const display = starDisplayName(star);
    const mutagen = toTraditional(star.mutagen || "");
    const brightness = toTraditional(star.brightness || "");

    if (hasAnyKeyword(name, HELPFUL_STARS) || ["soft", "lucun", "tianma"].includes(star.type)) {
      helpful.push(display);
      score += star.scope === "origin" ? 1.4 : 1;
    }

    if (hasAnyKeyword(name, CHALLENGE_STARS) || star.type === "tough") {
      challenges.push(display);
      score -= star.scope === "origin" ? 1.5 : 1.1;
    }

    if (hasAnyKeyword(name, FLOWER_STARS) || star.type === "flower") {
      flowers.push(display);
      score += 0.8;
    }

    if (["祿", "权", "權", "科"].includes(mutagen)) {
      score += 1.2;
      helpful.push(display);
    }

    if (mutagen === "忌") {
      score -= 1.8;
      challenges.push(display);
    }

    if (["廟", "旺", "得", "利"].includes(brightness)) score += 0.35;
    if (["陷", "不"].includes(brightness)) score -= 0.35;
  });

  return {
    palace,
    score,
    stars,
    helpful: uniqueItems(helpful),
    challenges: uniqueItems(challenges),
    flowers: uniqueItems(flowers),
  };
}

function elementInsight(counts, topic) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const weakestValue = Math.min(...Object.values(counts));
  const weak = sorted.filter(([, value]) => value === weakestValue).map(([element]) => element);
  const supported = topic.elements.filter((element) => counts[element] > 0);
  const missing = topic.elements.filter((element) => counts[element] === 0);
  const score = supported.length * 0.7 - missing.length * 0.9;
  const supportText = supported.length
    ? `${supported.join("、")}有根，對${topic.label}的${supported.map((element) => ELEMENT_WORDS[element]).join("、")}較有支撐`
    : `${topic.label}參考的${topic.elements.join("、")}不明顯，需要靠後天節奏補足`;
  const missingText = missing.length ? `；${missing.join("、")}偏弱時，容易在${topic.prompt}` : "";

  return {
    score,
    dominant: dominant[0],
    weak,
    text: `八字五行以${dominant[0]}較明顯，偏弱為${weak.join("、")}。${supportText}${missingText}。`,
  };
}

function renderDecadalOptions(astrolabe, formValues) {
  const previous = decadalSelect.value;
  decadalSelect.innerHTML = astrolabe.palaces
    .map((palace, index) => {
      const range = palace.decadal?.range;
      const rangeLabel = range ? `${range[0]}-${range[1]}歲` : "未定歲數";
      const branch = `${toTraditional(palace.heavenlyStem || "")}${toTraditional(palace.earthlyBranch || "")}`;
      return `<option value="${index}">${rangeLabel} ${normalizePalaceName(palace.name)} ${branch}</option>`;
    })
    .join("");

  const values = [...decadalSelect.options].map((option) => option.value);
  if (values.includes(previous)) {
    decadalSelect.value = previous;
    return;
  }

  const nominalAge = new Date().getFullYear() - formValues.year + 1;
  const currentIndex = astrolabe.palaces.findIndex((palace) => {
    const range = palace.decadal?.range;
    return range && nominalAge >= range[0] && nominalAge <= range[1];
  });
  decadalSelect.value = String(currentIndex >= 0 ? currentIndex : 0);
}

function getHoroscopeSafe(astrolabe, targetDate) {
  try {
    return astrolabe.horoscope(targetDate);
  } catch (error) {
    return null;
  }
}

function buildPeriodContext(chart) {
  const scope = scopeSelect.value;
  const selectedDecadalIndex = getSafeNumber(decadalSelect, 0, 0, 11);
  const targetYear = getSafeNumber(targetYearInput, new Date().getFullYear(), 1900, 2100);
  const targetMonth = getSafeNumber(targetMonthInput, new Date().getMonth() + 1, 1, 12);
  let targetDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  let horoscope = null;
  let periodIndex = null;
  let periodName = SCOPE_LABELS[scope];

  if (scope === "decadal") {
    const range = chart.astrolabe.palaces[selectedDecadalIndex]?.decadal?.range || [1, 10];
    const representativeYear = chart.formValues.year + range[0] - 1;
    targetDate = `${representativeYear}-01-01`;
    horoscope = getHoroscopeSafe(chart.astrolabe, targetDate);
    periodIndex = selectedDecadalIndex;
    periodName = `${SCOPE_LABELS[scope]} ${range[0]}-${range[1]}歲`;
  }

  if (scope === "yearly") {
    horoscope = getHoroscopeSafe(chart.astrolabe, `${targetYear}-01-01`);
    periodIndex = horoscope?.yearly?.index ?? null;
    periodName = `${targetYear} ${SCOPE_LABELS[scope]}`;
  }

  if (scope === "monthly") {
    horoscope = getHoroscopeSafe(chart.astrolabe, targetDate);
    periodIndex = horoscope?.monthly?.index ?? null;
    periodName = `${targetYear}年${targetMonth}月 ${SCOPE_LABELS[scope]}`;
  }

  return {
    scope,
    targetYear,
    targetMonth,
    horoscope,
    periodIndex,
    periodName,
    periodPalace: Number.isInteger(periodIndex) ? chart.astrolabe.palaces[periodIndex] : null,
  };
}

function periodStarsAt(context, index) {
  if (!context.horoscope || !Number.isInteger(index)) return [];
  const layers = [];
  if (["decadal", "yearly", "monthly"].includes(context.scope)) layers.push("decadal");
  if (["yearly", "monthly"].includes(context.scope)) layers.push("yearly");
  if (context.scope === "monthly") layers.push("monthly");
  return layers.flatMap((layer) => context.horoscope?.[layer]?.stars?.[index] || []);
}

function scoreTone(score) {
  if (score >= 7) return "機會明顯，可以主動推進";
  if (score >= 3) return "有支撐，但要把節奏整理好";
  if (score >= 0) return "吉凶交雜，適合先穩住基本盤";
  return "壓力較顯，宜保守處理並先修正盲點";
}

function topicAdvice(topicKey) {
  return {
    relationship: "建議把期待、界線與溝通頻率說清楚，少用猜測代替確認。",
    marriage: "建議看重可長期磨合的生活節奏，不只看短期吸引力。",
    career: "建議把職責、作品與可量化成果整理出來，機會來時比較接得住。",
    parents: "建議先處理資訊不對稱，重要決定用具體安排取代情緒拉扯。",
    property: "建議保守估現金流與維修成本，資產配置不要只看進場點。",
    health: "建議把睡眠、飲食、壓力源與檢查追蹤制度化；身體不適仍以專業醫療為準。",
  }[topicKey];
}

function describePalaceEvaluation(evaluation) {
  const palace = evaluation.palace;
  const mainStars = summarizeStarNames(palace.majorStars || [], "主星不突出");
  const helpful = evaluation.helpful.length ? `助力見${evaluation.helpful.slice(0, 4).join("、")}` : "助力星不算集中";
  const challenges = evaluation.challenges.length ? `壓力點見${evaluation.challenges.slice(0, 4).join("、")}` : "煞忌壓力不重";
  return `${normalizePalaceName(palace.name)}在${toTraditional(palace.heavenlyStem)}${toTraditional(palace.earthlyBranch)}，主星為${mainStars}，${helpful}，${challenges}`;
}

function palaceStarNames(palace) {
  return uniqueItems([
    ...(palace?.majorStars || []).map(starDisplayName),
    ...(palace?.minorStars || []).map(starDisplayName),
    ...(palace?.adjectiveStars || []).map(starDisplayName),
    ...palaceAuxiliaryNames(palace),
  ]);
}

function namesIncludeAny(names, keywords) {
  return keywords.some((keyword) => names.some((name) => name.includes(keyword)));
}

function inferPartnerCareers(starNames, spousePalace) {
  const careers = [];
  PARTNER_CAREER_RULES.forEach(([keywords, options]) => {
    if (namesIncludeAny(starNames, keywords)) {
      careers.push(...options);
    }
  });

  const branchElement = ZHI_ELEMENT[spousePalace?.earthlyBranch] || "";
  if (branchElement === "木") careers.push("企劃、教育、顧問、產品成長相關");
  if (branchElement === "火") careers.push("行銷、公眾表達、內容、表演或曝光型工作");
  if (branchElement === "土") careers.push("不動產、營運、專案管理、資產管理");
  if (branchElement === "金") careers.push("金融、法務、工程、制度與品質管理");
  if (branchElement === "水") careers.push("研究、跨域協調、心理諮詢、旅運貿易");

  return uniqueItems(careers).slice(0, 5);
}

function inferPartnerAppearance(starNames, spousePalace) {
  const branchElement = ZHI_ELEMENT[spousePalace?.earthlyBranch] || "木";
  const base = {
    "木": {
      build: "修長、四肢比例明顯，動作帶彈性",
      face: "臉型偏長或橢圓，眉眼清秀，氣質年輕",
      avatarClass: "tall",
    },
    "火": {
      build: "偏精瘦或運動型，走路速度快，存在感強",
      face: "眼神亮、表情鮮明，笑起來有記憶點",
      avatarClass: "athletic",
    },
    "土": {
      build: "身形穩、肩背或骨架較有份量",
      face: "臉部線條較厚實，給人可靠、耐看的印象",
      avatarClass: "solid",
    },
    "金": {
      build: "骨架俐落，比例乾淨，穿著偏簡潔",
      face: "輪廓分明，鼻樑、下顎或眉骨較有線條",
      avatarClass: "sharp",
    },
    "水": {
      build: "線條柔和，身形不一定壯但有流動感",
      face: "眼神柔、膚質或氣色較細膩，容易有親近感",
      avatarClass: "soft",
    },
  }[branchElement];
  const notes = [];

  if (namesIncludeAny(starNames, ["天機"])) notes.push("天機使外型更顯機靈、敏捷，眼神與肢體反應快。");
  if (namesIncludeAny(starNames, ["巨門"])) notes.push("巨門強化口條與嘴部表情，聲音、說話方式容易成為辨識點。");
  if (namesIncludeAny(starNames, ["太陽"])) notes.push("太陽使氣場較明朗，五官或笑容比較外放。");
  if (namesIncludeAny(starNames, ["太陰"])) notes.push("太陰使外貌偏柔和、乾淨，氣質較安靜細緻。");
  if (namesIncludeAny(starNames, ["武曲", "七殺", "破軍"])) notes.push("武殺破系會讓身形更俐落，骨架或肌肉感較明顯。");
  if (namesIncludeAny(starNames, ["紅鸞", "天喜", "天姚", "咸池"])) notes.push("桃花星使打扮、親和力或吸引力更容易被注意。");
  if (namesIncludeAny(starNames, ["擎羊", "陀羅", "火星", "鈴星"])) notes.push("煞星入參考時，外型可能帶銳利、冷感或高壓工作的痕跡。");

  return {
    ...base,
    element: branchElement,
    notes,
  };
}

function buildPartnerProfile(chart) {
  const astrolabe = chart.astrolabe;
  const spousePalace = findPalaceByName(astrolabe, "夫妻宮");
  const travelPalace = findPalaceByName(astrolabe, "遷移宮");
  const fortunePalace = findPalaceByName(astrolabe, "福德宮");
  const causePalace = getCausePalace(astrolabe);
  const spouseStars = palaceStarNames(spousePalace);
  const supportStars = uniqueItems([
    ...spouseStars,
    ...palaceStarNames(travelPalace).slice(0, 3),
    ...palaceStarNames(fortunePalace).slice(0, 3),
  ]);
  const careers = inferPartnerCareers(supportStars, spousePalace);
  const appearance = inferPartnerAppearance(supportStars, spousePalace);
  const spouseEvaluation = spousePalace ? evaluatePalace(spousePalace) : null;
  const spouseMain = summarizeStarNames(spousePalace?.majorStars || [], "夫妻宮主星不明顯");
  const meeting = [];

  if (travelPalace) meeting.push(`遷移宮${palaceLabel(travelPalace)}，正緣較可能透過外部場域、跨城市移動、工作曝光或朋友圈延伸出現。`);
  if (causePalace) meeting.push(`來因宮${palaceLabel(causePalace)}，關係課題容易牽動${palaceKey(causePalace.name)}相關場景。`);
  if (fortunePalace) meeting.push(`福德宮${palaceLabel(fortunePalace)}可看相處舒服度，星曜為${summarizeStarNames(allPalaceStars(fortunePalace), "無主星，以神煞與對宮輔看")}。`);

  return {
    spousePalace,
    travelPalace,
    fortunePalace,
    causePalace,
    spouseStars,
    supportStars,
    careers,
    appearance,
    spouseEvaluation,
    spouseMain,
    meeting,
  };
}

function renderPartnerProfile(chart) {
  const profile = buildPartnerProfile(chart);
  chart.partnerProfile = profile;
  const careerText = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中，需以實際互動與工作背景校正";
  const starText = profile.supportStars.slice(0, 8).join("、") || "未見明顯星曜";
  const reasons = [
    `以夫妻宮為主，夫妻宮為${palaceLabel(profile.spousePalace)}，主星為${profile.spouseMain}。`,
    `職業推估取夫妻宮星曜，再輔看遷移宮、福德宮與來因宮；本盤參考星曜包含${starText}。`,
    `外貌身形以夫妻宮地支五行${profile.appearance.element}作底，再用主星與桃花/煞曜修正。`,
    ...profile.meeting,
  ];

  partnerOutput.innerHTML = `
    <div class="partner-main">
      <div class="partner-visual">
        <div>
          <div class="partner-avatar ${escapeHtml(profile.appearance.avatarClass)}"></div>
          <p class="partner-caption">抽象輪廓：${escapeHtml(profile.appearance.build)}；${escapeHtml(profile.appearance.face)}</p>
        </div>
      </div>
      <div class="partner-copy">
        <div>
          <p class="eyebrow">正緣模擬</p>
          <h3>${escapeHtml(profile.appearance.face)}</h3>
        </div>
        <div class="partner-grid">
          <div class="partner-cell"><span>可能職業</span><strong>${escapeHtml(careerText)}</strong></div>
          <div class="partner-cell"><span>身材輪廓</span><strong>${escapeHtml(profile.appearance.build)}</strong></div>
          <div class="partner-cell"><span>氣質辨識</span><strong>${escapeHtml(profile.appearance.notes[0] || "氣質訊號偏中性，需以實際互動校正。")}</strong></div>
        </div>
        <ul class="partner-list">
          ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          ${profile.appearance.notes.slice(1).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function palaceChatSummary(palace) {
  if (!palace) return "目前找不到這個宮位。";
  const stars = [
    summarizeStarNames(palace.majorStars || [], "無主星"),
    summarizeStarNames(palace.minorStars || [], ""),
    summarizeStarNames(palace.adjectiveStars || [], ""),
    palaceAuxiliaryNames(palace).join("、"),
  ].filter(Boolean).join("；");
  return `${palaceLabel(palace)}：${stars || "星曜訊號不集中"}。`;
}

function topicFromQuestion(question) {
  const q = question.replace(/\s+/g, "");
  if (/感情|戀愛|桃花/.test(q)) return "relationship";
  if (/正緣|姻緣|婚|伴侶|另一半|對象/.test(q)) return "marriage";
  if (/事業|工作|職涯|升遷|公司/.test(q)) return "career";
  if (/父母|家人|長輩/.test(q)) return "parents";
  if (/財|錢|收入|資產|房|田宅|投資/.test(q)) return "property";
  if (/健康|身體|疾病|壓力|睡眠/.test(q)) return "health";
  return null;
}

function chatTopicAnswer(topicKey) {
  const topic = TOPIC_CONFIG[topicKey];
  const context = buildPeriodContext(currentChart);
  const causePalace = getCausePalace(currentChart.astrolabe);
  const evaluations = topic.palaces
    .map((palaceName) => findPalaceByName(currentChart.astrolabe, palaceName))
    .filter(Boolean)
    .map((palace) => evaluatePalace(palace, periodStarsAt(context, palace.index)));
  const primary = evaluations[0];
  const supportStars = uniqueItems(evaluations.flatMap((item) => item.helpful)).slice(0, 4);
  const pressureStars = uniqueItems(evaluations.flatMap((item) => item.challenges)).slice(0, 4);
  const element = elementInsight(currentChart.elementCounts, topic);

  return [
    `${topic.label}我會先看${topic.palaces.join("、")}。${primary ? describePalaceEvaluation(primary) : "主宮資料不足，需要輔看其他宮位"}。`,
    `目前選到的運勢層級是${context.periodName}。${context.periodPalace ? `流運落${palaceLabel(context.periodPalace)}。` : "目前以本命原局為主。"}`,
    causePalace ? `來因宮是${palaceLabel(causePalace)}，所以這題也要留意${palaceKey(causePalace.name)}相關情境怎麼牽動事件。` : "",
    supportStars.length ? `助力星：${supportStars.join("、")}。` : "",
    pressureStars.length ? `壓力星：${pressureStars.join("、")}。` : "",
    element.text,
  ].filter(Boolean).join(" ");
}

function chatPartnerAnswer() {
  const profile = currentChart.partnerProfile || buildPartnerProfile(currentChart);
  const careers = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中";
  const appearance = `${profile.appearance.build}，${profile.appearance.face}`;
  const notes = profile.appearance.notes.length ? `外貌修正：${profile.appearance.notes.join(" ")}` : "";

  return [
    `正緣以夫妻宮為主：${palaceLabel(profile.spousePalace)}，主星為${profile.spouseMain}。`,
    `可能職業方向：${careers}。`,
    `身材長相模擬：${appearance}。`,
    profile.causePalace ? `來因宮是${palaceLabel(profile.causePalace)}，關係事件常會從${palaceKey(profile.causePalace.name)}議題切入。` : "",
    notes,
  ].filter(Boolean).join(" ");
}

function chatPalaceAnswer(question) {
  const palaceNames = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "遷移宮", "僕役宮", "官祿宮", "田宅宮", "福德宮", "父母宮"];
  const matched = palaceNames.find((name) => question.includes(name.replace("宮", "")) || question.includes(name));
  if (!matched) return "";
  return palaceChatSummary(findPalaceByName(currentChart.astrolabe, matched));
}

function buildBotAnswer(question) {
  if (!currentChart) return "請先輸入出生資料並排盤，我才能用目前命盤回答。";
  const q = question.trim();
  const causePalace = getCausePalace(currentChart.astrolabe);
  const bodyPalace = getBodyPalace(currentChart.astrolabe);
  const context = buildPeriodContext(currentChart);

  if (/正緣|另一半|伴侶|對象|長相|身材|職業/.test(q)) {
    return chatPartnerAnswer();
  }

  if (/來因/.test(q)) {
    return causePalace
      ? `來因宮是${palaceLabel(causePalace)}。判定方式是用生年天干${currentChart.astrolabe.rawDates?.chineseDate?.yearly?.[0] || ""}對照十二宮宮干；解盤時我會把它當作事件入口與原局動機。${palaceChatSummary(causePalace)}`
      : "目前沒有取得來因宮。";
  }

  if (/身宮/.test(q)) {
    return bodyPalace
      ? `身宮是${palaceLabel(bodyPalace)}，代表行動慣性、身體投入感與人生後段更常用力的位置。${palaceChatSummary(bodyPalace)}`
      : "目前沒有取得身宮。";
  }

  if (/大限|流年|流月|今年|本月/.test(q)) {
    return `${context.periodName}目前${context.periodPalace ? `落在${palaceLabel(context.periodPalace)}，` : ""}我會把這個宮位視為當期事件焦點，再疊加你問的主題宮位。`;
  }

  const palaceAnswer = chatPalaceAnswer(q);
  if (palaceAnswer) return palaceAnswer;

  const topicKey = topicFromQuestion(q);
  if (topicKey) return chatTopicAnswer(topicKey);

  return `我會用目前命盤回答：中州派設定、八字五行、命宮/身宮/來因宮、夫妻宮與你選到的運限都會納入。這題若要精準一點，可以問「我的正緣長相」、「今年事業」、「福德宮代表什麼」或「來因宮怎麼看」。`;
}

function addChatMessage(text, role = "bot") {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function seedChat() {
  if (chatLog.children.length > 0) return;
  addChatMessage("命盤已載入。你可以問正緣、來因宮、大限、流年、感情、事業、財產或健康。");
}

function buildReading(chart) {
  const topicKey = topicSelect.value;
  const topic = TOPIC_CONFIG[topicKey];
  const context = buildPeriodContext(chart);
  const causePalace = getCausePalace(chart.astrolabe);
  const yearStem = chart.astrolabe.rawDates?.chineseDate?.yearly?.[0] || "";
  const topicEvaluations = topic.palaces
    .map((palaceName) => findPalaceByName(chart.astrolabe, palaceName))
    .filter(Boolean)
    .map((palace) => evaluatePalace(palace, periodStarsAt(context, palace.index)));
  const primary = topicEvaluations[0];
  const periodEvaluation = context.periodPalace
    ? evaluatePalace(context.periodPalace, periodStarsAt(context, context.periodPalace.index))
    : null;
  const element = elementInsight(chart.elementCounts, topic);
  const topicScore = topicEvaluations.reduce((sum, item, index) => sum + item.score * (index === 0 ? 1 : 0.55), 0);
  const periodScore = periodEvaluation && !topicEvaluations.some((item) => item.palace.index === periodEvaluation.palace.index)
    ? periodEvaluation.score * 0.45
    : 0;
  const finalScore = topicScore + periodScore + element.score;
  const tone = scoreTone(finalScore);
  const supportStars = uniqueItems(topicEvaluations.flatMap((item) => item.helpful)).slice(0, 6);
  const pressureStars = uniqueItems(topicEvaluations.flatMap((item) => item.challenges)).slice(0, 6);
  const flowerStars = uniqueItems(topicEvaluations.flatMap((item) => item.flowers)).slice(0, 4);
  const periodText = context.periodPalace
    ? `${context.periodName}落在${normalizePalaceName(context.periodPalace.name)}，此宮會把本期注意力帶到${normalizePalaceName(context.periodPalace.name).replace("宮", "")}相關事件。`
    : "本命解讀以原局宮位與八字五行為主，未疊加流運星曜。";
  const causeText = causePalace
    ? `來因宮以生年天干${yearStem}對照宮干定位，本盤落在${palaceLabel(causePalace)}；解盤會把它視為原局動機與事件入口。`
    : "來因宮未能從生年天干與宮干定位取得。";
  const topicPalacesText = topic.palaces.join("、");
  const why = [
    `${ASTRO_SCHOOL_LABEL}：星曜安置與神煞顯示使用 iztro 的 zhongzhou 演算法設定。`,
    `${topic.label}主題取${topicPalacesText}，因為這些宮位分別對應主題本身、內在狀態與外部事件。`,
    primary ? describePalaceEvaluation(primary) : "找不到主宮資料，因此以輔助宮位與八字五行補看。",
    causeText,
    periodText,
    element.text,
  ];
  const tags = [
    context.periodName,
    causePalace ? `來因：${palaceLabel(causePalace)}` : "",
    ...topic.palaces,
    supportStars.length ? `助力：${supportStars.slice(0, 3).join("、")}` : "",
    pressureStars.length ? `壓力：${pressureStars.slice(0, 3).join("、")}` : "",
    flowerStars.length ? `桃花：${flowerStars.join("、")}` : "",
    `五行偏強：${element.dominant}`,
  ].filter(Boolean);

  return `
    <div class="reading-main">
      <div class="reading-copy">
        <div class="reading-status">${escapeHtml(context.periodName)} · ${escapeHtml(topic.label)}</div>
        <h3>${escapeHtml(topic.label)}：${escapeHtml(tone)}</h3>
        <p>${escapeHtml(topic.prompt)}目前盤面顯示，${primary ? escapeHtml(describePalaceEvaluation(primary)) : "主宮資料不足"}。</p>
        <p>${escapeHtml(causeText)}${escapeHtml(periodText)}${supportStars.length ? ` 助力星集中在${escapeHtml(supportStars.slice(0, 4).join("、"))}。` : ""}${pressureStars.length ? ` 需要留意${escapeHtml(pressureStars.slice(0, 4).join("、"))}帶來的延誤、衝突或消耗。` : ""}</p>
        <p>${escapeHtml(element.text)}${escapeHtml(topicAdvice(topicKey))}</p>
        <div class="reading-tags">
          ${tags.map((tag) => `<span class="reading-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <aside class="reading-side">
        <h4>為何如此解盤</h4>
        <ul class="why-list">
          ${why.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </aside>
    </div>
  `;
}

function updateReading() {
  if (!currentChart) return;
  const context = buildPeriodContext(currentChart);
  decadalControl.hidden = scopeSelect.value !== "decadal";
  yearControl.hidden = !["yearly", "monthly"].includes(scopeSelect.value);
  monthControl.hidden = scopeSelect.value !== "monthly";
  readingOutput.innerHTML = buildReading(currentChart);
  renderPartnerProfile(currentChart);
  renderAstrolabe(currentChart.astrolabe, context.periodIndex);
}

function renderSummary(astrolabe, lunar, formValues, timeIndex) {
  const lunarDate = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const lifePalace = getLifePalace(astrolabe);
  const bodyPalace = getBodyPalace(astrolabe);
  const causePalace = getCausePalace(astrolabe);
  const summary = [
    ["公曆", `${formValues.birthDate} ${formValues.birthTime}`],
    ["農曆", toTraditional(lunarDate)],
    ["時辰", `${HOUR_BRANCHES[timeIndex]}時 ${getTimeRange(timeIndex)}`],
    ["命宮 / 身宮", `${palaceLabel(lifePalace)} / ${palaceLabel(bodyPalace)}`],
    ["來因宮", palaceLabel(causePalace)],
    ["五行局", toTraditional(astrolabe.fiveElementsClass)],
  ];

  summaryStrip.innerHTML = summary
    .map(([label, value]) => `
      <div class="summary-item">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join("");
}

function renderPillars(pillars) {
  pillarGrid.innerHTML = pillars
    .map((pillar, index) => {
      const { stem, branch } = splitPillar(pillar);
      const stemElement = GAN_ELEMENT[stem] || "-";
      const branchElement = ZHI_ELEMENT[branch] || "-";
      return `
        <article class="pillar-card">
          <header>
            <span class="pillar-name">${PILLAR_NAMES[index]}</span>
            <span class="pillar-meta">${stemElement}${branchElement}</span>
          </header>
          <div class="pillar-main">
            <div class="pillar-char">${escapeHtml(stem)}</div>
            <div class="pillar-char">${escapeHtml(branch)}</div>
          </div>
          <footer class="pillar-footer">
            <span>天干 ${escapeHtml(stemElement)}</span>
            <span>地支 ${escapeHtml(branchElement)}</span>
          </footer>
        </article>
      `;
    })
    .join("");
}

function renderElementBars(counts) {
  const max = Math.max(...Object.values(counts), 1);
  elementBars.innerHTML = ELEMENTS.map((element) => {
    const value = counts[element] || 0;
    const width = Math.max(8, (value / max) * 100);
    return `
      <div class="element-row" data-element="${element}">
        <strong>${element}</strong>
        <div class="element-track"><div class="element-fill" style="width: ${width}%"></div></div>
        <span>${value}</span>
      </div>
    `;
  }).join("");
}

function renderNaYin(naYin) {
  nayinList.innerHTML = naYin
    .map((item, index) => `
      <div class="nayin-item">
        <span class="nayin-label">${PILLAR_NAMES[index]}</span>
        <strong>${escapeHtml(toTraditional(item))}</strong>
      </div>
    `)
    .join("");
}

function renderCenterPlate(astrolabe) {
  const lifePalace = getLifePalace(astrolabe);
  const bodyPalace = getBodyPalace(astrolabe);
  const causePalace = getCausePalace(astrolabe);
  return `
    <section class="center-plate">
      <div>
        <p class="eyebrow">${escapeHtml(ASTRO_SCHOOL_LABEL)}</p>
        <strong>${escapeHtml(toTraditional(astrolabe.chineseDate))}</strong>
      </div>
      <div class="center-facts">
        <div><span class="muted">命宮</span><br><strong>${escapeHtml(palaceLabel(lifePalace))}</strong></div>
        <div><span class="muted">身宮</span><br><strong>${escapeHtml(palaceLabel(bodyPalace))}</strong></div>
        <div><span class="muted">來因宮</span><br><strong>${escapeHtml(palaceLabel(causePalace))}</strong></div>
        <div><span class="muted">生肖</span><br><strong>${escapeHtml(toTraditional(astrolabe.zodiac))}</strong></div>
        <div><span class="muted">命主 / 身主</span><br><strong>${escapeHtml(toTraditional(astrolabe.soul))} / ${escapeHtml(toTraditional(astrolabe.body))}</strong></div>
        <div><span class="muted">星座</span><br><strong>${escapeHtml(toTraditional(astrolabe.sign))}</strong></div>
      </div>
    </section>
  `;
}

function renderPalace(palace, periodIndex = null, causeIndex = null) {
  const position = BRANCH_GRID[palace.earthlyBranch] || [1, 1];
  const isLifePalace = palaceKey(palace.name) === "命";
  const classes = [
    "palace-card",
    isLifePalace ? "is-life" : "",
    palace.isBodyPalace ? "is-body" : "",
    palace.index === causeIndex ? "is-cause" : "",
    palace.index === periodIndex ? "is-period" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const major = renderStarChips(palace.majorStars, "major", 5);
  const minor = renderStarChips(palace.minorStars, "minor", 5);
  const adjective = renderStarChips(palace.adjectiveStars, "", 4);
  const auxiliary = renderAuxiliaryChips(palace);
  const empty = !major && !minor && !adjective && !auxiliary ? `<span class="muted">空宮</span>` : "";
  const stage = palace.decadal?.range ? `${palace.decadal.range[0]}-${palace.decadal.range[1]}` : "";
  const markers = [
    isLifePalace ? "命宮" : "",
    palace.isBodyPalace ? "身宮" : "",
    palace.index === causeIndex ? "來因" : "",
    palace.index === periodIndex ? "流運" : "",
  ].filter(Boolean);

  return `
    <article class="${classes}" style="grid-row: ${position[0]}; grid-column: ${position[1]};">
      <header class="palace-head">
        <div>
          <div class="palace-title">${escapeHtml(toTraditional(palace.name))}</div>
          <div class="palace-meta">${escapeHtml(toTraditional(palace.heavenlyStem))}${escapeHtml(toTraditional(palace.earthlyBranch))}</div>
        </div>
        <div class="palace-badges">
          ${markers.map((marker) => `<span class="palace-marker">${escapeHtml(marker)}</span>`).join("")}
          <span class="branch-chip">${escapeHtml(toTraditional(palace.earthlyBranch))}</span>
        </div>
      </header>
      <div class="star-groups">
        ${major}
        ${minor}
        ${adjective}
        ${auxiliary}
        ${empty}
      </div>
      <footer class="palace-foot">
        <span>${escapeHtml(toTraditional(palace.changsheng12 || ""))}</span>
        <span>${stage ? `大限 ${stage}` : ""}</span>
      </footer>
    </article>
  `;
}

function renderAstrolabe(astrolabe, periodIndex = null) {
  const causeIndex = getCausePalace(astrolabe)?.index ?? null;
  astrolabeGrid.innerHTML = [
    renderCenterPlate(astrolabe),
    ...astrolabe.palaces.map((palace) => renderPalace(palace, periodIndex, causeIndex)),
  ].join("");
}

function showError(error) {
  errorMessage.hidden = false;
  errorMessage.textContent = error.message || "排盤時發生錯誤。";
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function calculate() {
  clearError();

  if (!window.Solar || !window.iztro?.astro) {
    throw new Error("排盤函式庫尚未載入。");
  }

  const formValues = getFormValues();
  const solar = Solar.fromYmdHms(
    formValues.year,
    formValues.month,
    formValues.day,
    formValues.hour,
    formValues.minute,
    0,
  );
  const lunar = solar.getLunar();
  const timeIndex = getTimeIndex(formValues.hour);
  iztro.astro.config(ASTRO_CONFIG);
  const astrolabe = iztro.astro.bySolar(
    `${formValues.year}-${formValues.month}-${formValues.day}`,
    timeIndex,
    formValues.gender,
    true,
    "zh-TW",
  );
  const pillars = lunar.getBaZi();
  const elementCounts = countElements(pillars);

  currentChart = {
    astrolabe,
    elementCounts,
    formValues,
    lunar,
    pillars,
    timeIndex,
  };

  if (!targetYearInput.value) targetYearInput.value = String(new Date().getFullYear());
  if (!targetMonthInput.value) targetMonthInput.value = String(new Date().getMonth() + 1);

  renderSummary(astrolabe, lunar, formValues, timeIndex);
  renderPillars(pillars);
  renderElementBars(elementCounts);
  renderNaYin(lunar.getBaZiNaYin());
  renderDecadalOptions(astrolabe, formValues);
  updateReading();
}

function setSample() {
  dateInput.value = "2000-08-16";
  timeInput.value = "04:00";
  form.querySelector('input[name="gender"][value="女"]').checked = true;
  calculate();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    calculate();
  } catch (error) {
    showError(error);
  }
});

sampleButton.addEventListener("click", setSample);
[
  scopeSelect,
  decadalSelect,
  targetYearInput,
  targetMonthInput,
  topicSelect,
].forEach((control) => {
  control.addEventListener("change", updateReading);
  control.addEventListener("input", updateReading);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;
  addChatMessage(question, "user");
  chatInput.value = "";
  addChatMessage(buildBotAnswer(question), "bot");
});

setSample();
seedChat();
