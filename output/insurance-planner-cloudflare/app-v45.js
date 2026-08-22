const STORAGE_KEY = "jarvis.insurancePlanner.v1";
const PROFILE_DRAFT_KEY = `${STORAGE_KEY}.profileDraft`;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const categoryLabels = {
  medical: "醫療 / 實支實付",
  critical: "重大傷病 / 癌症",
  life: "壽險",
  accident: "意外",
  disability: "失能",
  longcare: "長照",
  savings: "儲蓄 / 年金",
};

const ownerLabels = {
  self: "自己",
  father: "爸爸",
  mother: "媽媽",
  spouse: "配偶",
  child: "孩子",
  other: "其他家人",
};

const genderLabels = {
  male: "男性",
  female: "女性",
};

const coveragePriorities = {
  life: 20,
  medical: 18,
  critical: 17,
  accident: 12,
  disability: 20,
  longcare: 13,
};

const categoryColors = {
  life: "#245f86",
  medical: "#3f8c83",
  critical: "#a75864",
  accident: "#c79b42",
  disability: "#6e6aa8",
  longcare: "#627a4d",
  savings: "#7c6a56",
};

const UNKNOWN_BENEFIT_AMOUNT = "待條款解析";
const VAGUE_BENEFIT_AMOUNT_RE = /依方案限額|依條款限額/;

const marketSignals = {
  life: 94,
  medical: 82,
  critical: 76,
  accident: 64,
  disability: 68,
  longcare: 58,
};

const preferredMainPlanCodes = {
  "遠雄人壽": ["LM5"],
  "全球人壽": ["DCE"],
};

const mainPlanPlanningDefaults = {
  LM5: {
    coverage: 100000,
    planLabel: "20 年期 10 萬元主約規劃",
    note: "現售主約；保費已依 Finfo 連結的正式費率表與目前被保險人條件計算。",
  },
};

const defaultProfile = {
  gender: "male",
  age: 35,
  annualIncome: 900000,
  dependents: 1,
  debt: 2000000,
  monthlyBudget: 12000,
  horizon: 20,
  priority: "balanced",
};

const defaultCancerCase = {
  hasHistory: "no",
  cancerType: "",
  diagnosisAge: null,
  stage: "1",
  metastatic: "no",
  treatmentStatus: "remission",
  yearsSinceTreatment: 5,
  latestFollowup: "normal",
};

const OFFICIAL_PRODUCT_QUERY_URL = "https://insprod.tii.org.tw/Query.aspx";

const builtinProductCatalog = [
  {
    code: "XCD",
    aliases: ["FGL-XCD"],
    name: "遠雄人壽一年定期癌症健康保險附約",
    insurer: "遠雄人壽",
    category: "critical",
    coverage: 1000000,
    annualPremium: 0,
    endAge: 85,
    premiumMode: "ageBand",
    premiumChange: "一年期附約，保費通常會隨投保年齡或續保年齡級距調整；實際費率請以遠雄人壽費率表與保單條款為準。",
    premiumBands: [],
    rateStatus: "missing",
    rateUnitCoverage: 1000000,
    rateSource: "待補遠雄人壽正式費率表或條款附件",
    source: "使用者提供商品代號；公開搜尋未取得完整費率表",
    note: "商品代號 XCD。保障年齡、給付項目、續保年齡與保費級距仍需以遠雄人壽正式條款、主約搭配與核保結果確認。",
  },
  {
    code: "DEMO-MED-01",
    aliases: ["MED-DEMO", "HMR-01"],
    name: "住院醫療實支實付計畫（範例）",
    insurer: "範例人壽",
    category: "medical",
    coverage: 300000,
    annualPremium: 12000,
    endAge: 75,
    premiumMode: "ageBand",
    premiumChange: "依年齡級距調整，年齡越高保費越高。",
    premiumBands: [
      { age: "35歲", premium: 12000 },
      { age: "45歲", premium: 16800 },
      { age: "55歲", premium: 29600 },
      { age: "65歲", premium: 46800 },
      { age: "75歲", premium: 76000 },
    ],
    source: "內建格式範例",
    note: "範例資料，正式使用請匯入保險公司或官方查詢後整理的商品代號庫。",
  },
  {
    code: "DEMO-LIFE-20",
    aliases: ["TL-DEMO", "TERM20"],
    name: "20年期定期壽險（範例）",
    insurer: "範例人壽",
    category: "life",
    coverage: 1000000,
    annualPremium: 3600,
    endAge: 70,
    premiumMode: "ageBand",
    premiumChange: "定期險以年齡或續保年齡級距重算，年齡越高保費通常越高。",
    source: "內建格式範例",
    note: "範例資料，正式商品仍須以保單條款、費率表與核保結果為準。",
  },
  {
    code: "DEMO-CI-100",
    aliases: ["CI-DEMO", "CRITICAL100"],
    name: "重大傷病一次金保險（範例）",
    insurer: "範例人壽",
    category: "critical",
    coverage: 1000000,
    annualPremium: 13500,
    endAge: 85,
    premiumMode: "annualGrowth",
    growthRate: 4,
    premiumChange: "以目前保費估算每年約增加 4%。",
    source: "內建格式範例",
    note: "範例資料，正式商品需確認等待期、除外責任與續保規則。",
  },
  {
    code: "DEMO-ACC-300",
    aliases: ["ACC-DEMO", "PA300"],
    name: "意外身故及失能保障（範例）",
    insurer: "範例產險",
    category: "accident",
    coverage: 3000000,
    annualPremium: 2400,
    endAge: 75,
    premiumMode: "level",
    premiumChange: "多數意外險以職業等級與投保額度影響保費，範例先以固定保費估算。",
    source: "內建格式範例",
    note: "範例資料，正式商品需確認職業類別、保額上限與續保條件。",
  },
].filter((product) => !product.code.startsWith("DEMO-"));

const cancerTypeProfiles = {
  breast: { label: "乳癌", risk: 1 },
  colorectal: { label: "大腸直腸癌", risk: 2 },
  thyroid: { label: "甲狀腺癌", risk: 0 },
  cervical: { label: "子宮頸癌", risk: 1 },
  prostate: { label: "攝護腺癌", risk: 1 },
  lung: { label: "肺癌", risk: 4 },
  liver: { label: "肝癌", risk: 4 },
  blood: { label: "血液癌 / 淋巴癌", risk: 4 },
  other: { label: "其他癌症", risk: 2 },
};

const cancerInsuranceCatalog = [
  { id: "accident", title: "意外險 / 意外醫療", sensitivity: 0, reason: "主要看職業、活動風險與身體功能；癌症病史通常不是唯一決定因素。" },
  { id: "travel", title: "旅平險 / 旅行不便險", sensitivity: 1, reason: "短天期商品相對有機會，但既往症、癌症相關事故或海外醫療可能有除外。" },
  { id: "savings", title: "儲蓄險 / 年金險", sensitivity: 1, reason: "若死亡保障或豁免保費設計較低，通常比醫療與重大傷病更容易個案核保。" },
  { id: "life", title: "定期壽險 / 終身壽險", sensitivity: 2, reason: "會看癌別、期數、治療完成時間、復發風險與保額；早期且多年穩定較有機會。" },
  { id: "medical", title: "住院醫療 / 實支實付", sensitivity: 3, reason: "對既往症敏感，常見結果包含延期、癌症或相關器官除外、加費或降低額度。" },
  { id: "critical", title: "癌症險 / 重大傷病險", sensitivity: 4, reason: "最直接碰到既往癌症風險，曾罹癌者通常較困難，常需長期穩定後才有個案空間。" },
  { id: "disability", title: "失能險 / 長照險", sensitivity: 3, reason: "會評估治療後體況、復發與長期照護風險；高期別或轉移病史通常較嚴格。" },
];

const claimScenarioRules = [
  {
    id: "accident",
    label: "意外事故",
    input: /車禍|交通事故|碰撞|跌倒|摔傷|外傷|骨折|燒燙傷|意外/,
    benefit: /意外|傷害|骨折|燒燙傷|事故/,
    categories: ["accident"],
    documents: ["事故證明或警察紀錄", "事故經過說明"],
  },
  {
    id: "emergency",
    label: "急診",
    input: /急診|送醫|救護車/,
    benefit: /急診|意外醫療|傷害醫療/,
    categories: ["accident", "medical"],
    documents: ["急診診斷證明", "急診收據與費用明細"],
  },
  {
    id: "hospital",
    label: "住院",
    input: /住院|入院|病房|住了\s*\d+\s*天/,
    benefit: /住院|病房|日額|醫療雜費|實支實付/,
    categories: ["medical", "accident", "critical"],
    documents: ["診斷證明書（註明住院期間）", "醫療收據正本或副本", "住院費用明細"],
  },
  {
    id: "surgery",
    label: "手術",
    input: /開刀|手術|切除|縫合|內視鏡治療/,
    benefit: /手術|開刀|醫療雜費|處置/,
    categories: ["medical", "accident", "critical"],
    documents: ["手術證明或手術紀錄", "診斷證明書", "醫療收據與費用明細"],
  },
  {
    id: "cancer",
    label: "癌症診斷或治療",
    input: /癌|惡性腫瘤|腫瘤|化療|放療|標靶|免疫治療/,
    benefit: /癌|惡性腫瘤|腫瘤|重大傷病|重大疾病|化療|放療|標靶|免疫治療/,
    categories: ["critical"],
    documents: ["病理報告", "癌症診斷證明與期別資料", "治療計畫或出院摘要", "重大傷病證明（如已取得）"],
  },
  {
    id: "critical",
    label: "重大疾病",
    input: /中風|腦血管|心肌梗塞|重大傷病|重大疾病|洗腎|器官移植/,
    benefit: /重大傷病|重大疾病|中風|心肌梗塞|洗腎|器官移植/,
    categories: ["critical"],
    documents: ["診斷證明書", "相關檢查與病歷摘要", "重大傷病證明（如已取得）"],
  },
  {
    id: "disability",
    label: "失能或不能工作",
    input: /失能|殘廢|不能工作|喪失工作能力|癱瘓/,
    benefit: /失能|殘廢|扶助|工作能力/,
    categories: ["disability", "accident", "life"],
    documents: ["失能診斷書", "功能障礙或工作能力評估資料"],
  },
  {
    id: "longcare",
    label: "長期照顧",
    input: /長照|長期照顧|失智|日常生活能力|巴氏量表/,
    benefit: /長照|長期照顧|失智|照護|扶助/,
    categories: ["longcare"],
    documents: ["長照狀態診斷證明", "日常生活能力或認知功能評估"],
  },
  {
    id: "death",
    label: "身故",
    input: /身故|死亡|過世/,
    benefit: /身故|死亡|壽險/,
    categories: ["life", "accident"],
    documents: ["死亡證明書", "除戶戶籍謄本", "受益人身分與匯款資料"],
  },
];

const claimScenarioNegations = {
  accident: /(?:不是|並非|沒有|無|尚未)[^，。；]{0,8}(?:車禍|交通事故|意外|外傷|骨折)/,
  emergency: /(?:沒有|無|尚未)[^，。；]{0,8}(?:急診|送醫|救護車)/,
  hospital: /(?:沒有|無|尚未|未曾)[^，。；]{0,8}(?:住院|入院|病房)/,
  surgery: /(?:沒有|無|尚未|未曾)[^，。；]{0,10}(?:開刀|手術|切除)/,
  cancer: /(?:不是|並非|沒有|無)[^，。；]{0,8}(?:癌|惡性腫瘤)/,
  critical: /(?:不是|並非|沒有|無)[^，。；]{0,8}(?:中風|心肌梗塞|重大傷病|重大疾病)/,
  disability: /(?:沒有|無|尚未)[^，。；]{0,8}(?:失能|殘廢|喪失工作能力|癱瘓)/,
  longcare: /(?:沒有|無|尚未)[^，。；]{0,8}(?:長照|長期照顧|失智)/,
  death: /(?:沒有|無|尚未)[^，。；]{0,8}(?:身故|死亡|過世)/,
};

const catalog = [
  {
    id: "term-life",
    category: "life",
    title: "高保障定期壽險",
    short: "用較低保費補足家庭責任與房貸風險。",
    unitCoverage: 1000000,
    basePremium: 2600,
    maxUnits: 12,
    popularity: 94,
    tags: ["家庭責任", "高槓桿", "可替代壽險缺口"],
    replaceHint: "若目前高保費保單主要是儲蓄功能，可把死亡保障改用定期壽險補足，再把預算留給醫療或重大傷病。",
  },
  {
    id: "medical-rider",
    category: "medical",
    title: "醫療實支實付補強",
    short: "優先補住院、手術與雜費風險，適合已有基本壽險但醫療額度偏低的人。",
    unitCoverage: 300000,
    basePremium: 9000,
    maxUnits: 2,
    popularity: 82,
    tags: ["住院醫療", "雜費", "剛性需求"],
    replaceHint: "若同時有多張日額型醫療險但缺少實支概念，可評估把預算轉往較能對應醫療自費項目的保障。",
  },
  {
    id: "critical-illness",
    category: "critical",
    title: "重大傷病一次金",
    short: "一次給付可支應治療空窗、收入中斷與自費療程。",
    unitCoverage: 1000000,
    basePremium: 11000,
    maxUnits: 4,
    popularity: 76,
    tags: ["癌症", "重大傷病", "收入中斷"],
    replaceHint: "若防癌險只給住院或療程項目，重大傷病一次金通常更容易拿來支應真正的大額支出。",
  },
  {
    id: "accident-plus",
    category: "accident",
    title: "意外險與意外醫療",
    short: "保費相對低，適合補足交通、工作與日常事故風險。",
    unitCoverage: 3000000,
    basePremium: 2800,
    maxUnits: 2,
    popularity: 64,
    tags: ["低保費", "意外身故", "意外醫療"],
    replaceHint: "如果預算很緊，意外保障通常是保費效率較高的第一層補強。",
  },
  {
    id: "disability-income",
    category: "disability",
    title: "失能扶助 / 失能一次金",
    short: "處理長期無法工作時的收入與照護缺口。",
    unitCoverage: 1000000,
    basePremium: 9000,
    maxUnits: 5,
    popularity: 68,
    tags: ["工作能力", "長期支出", "家庭責任"],
    replaceHint: "若家庭高度依賴你的收入，失能保障通常比單純提高壽險更能處理生存但無法工作的風險。",
  },
  {
    id: "long-care",
    category: "longcare",
    title: "長照保障",
    short: "補長期照護、人力照顧與家庭照顧者的現金流壓力。",
    unitCoverage: 1200000,
    basePremium: 12000,
    maxUnits: 3,
    popularity: 58,
    tags: ["高齡照護", "家庭壓力", "長期現金流"],
    replaceHint: "若家庭已有高齡照護壓力，可把部分儲蓄型保費轉作長照風險準備。",
  },
];

let store = loadStore();
let lastLookupQuery = "";
let policyCodeLookupTimer = 0;
let productCodeSuggestionIndex = -1;
let externalProductCatalog = [];
let externalCatalogMeta = {};
let productCatalogCache = null;
let productCatalogCodeIndex = null;
const liveProductLookups = new Map();
const recommendationMainPlanLookupAttempts = new Set();
let recommendationMainPlanLookupPromise = null;
let activePolicyOwnerId = store.lastPolicyOwner || "self";
const accountState = {
  user: null,
  loading: true,
  syncing: false,
  pending: false,
  syncTimer: 0,
  revision: 0,
  lastSyncAt: 0,
  authEpoch: 0,
  baseStore: null,
};
let accountSyncEnabled = false;

function sanitizePersonName(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 30);
}

function normalizePersonAge(value) {
  if (value === "" || value == null) return null;
  const age = Number(value);
  return Number.isFinite(age) ? clamp(Math.round(age), 0, 100) : null;
}

function normalizeInsuredPeople(items, profile, policies) {
  const profileGender = normalizedGender(profile?.gender || defaultProfile.gender);
  const legacyPeople = [
    { id: "self", name: "自己", gender: profileGender, currentAge: normalizePersonAge(profile?.age), occupationClass: 1 },
    { id: "father", name: "爸爸", gender: "male", currentAge: null, occupationClass: 1 },
    { id: "mother", name: "媽媽", gender: "female", currentAge: null, occupationClass: 1 },
    { id: "spouse", name: "配偶", gender: profileGender === "male" ? "female" : "male", currentAge: null, occupationClass: 1 },
    { id: "child", name: "孩子", gender: "male", currentAge: null, occupationClass: 1 },
    { id: "other", name: "其他家人", gender: profileGender, currentAge: null, occupationClass: 1 },
  ];
  const people = new Map(legacyPeople.map((person) => [person.id, person]));
  const explicitIds = new Set();

  if (Array.isArray(items)) {
    items.forEach((item) => {
      const id = String(item?.id || "").trim().slice(0, 64);
      const name = sanitizePersonName(item?.name);
      if (!id || !name) return;
      const fallback = people.get(id) || {};
      people.set(id, {
        id,
        name,
        gender: normalizedGender(item.gender || fallback.gender || profileGender),
        currentAge: normalizePersonAge(item.currentAge ?? fallback.currentAge),
        occupationClass: clamp(Math.round(toNumber(item.occupationClass ?? fallback.occupationClass, 1)), 1, 6),
      });
      explicitIds.add(id);
    });
  }

  const initializedFromPolicy = new Set();
  (Array.isArray(policies) ? policies : []).forEach((policy) => {
    const id = String(policy?.owner || "self").trim() || "self";
    if (!people.has(id)) {
      people.set(id, {
        id,
        name: sanitizePersonName(policy.ownerName) || ownerLabels[id] || "家庭成員",
        gender: normalizedGender(policy.gender || policy.insuredGender || profileGender),
        currentAge: normalizePersonAge(policy.currentAge ?? policy.insuredCurrentAge),
        occupationClass: clamp(Math.round(toNumber(policy.occupationClass || policy.jobClass, 1)), 1, 6),
      });
      initializedFromPolicy.add(id);
      return;
    }
    if (explicitIds.has(id) || initializedFromPolicy.has(id)) return;
    const person = people.get(id);
    person.gender = normalizedGender(policy.gender || policy.insuredGender || person.gender);
    person.currentAge = normalizePersonAge(policy.currentAge ?? policy.insuredCurrentAge ?? person.currentAge);
    person.occupationClass = clamp(Math.round(toNumber(policy.occupationClass || policy.jobClass, person.occupationClass || 1)), 1, 6);
    initializedFromPolicy.add(id);
  });

  const self = people.get("self");
  if (self) self.currentAge = normalizePersonAge(profile?.age);

  return [...people.values()];
}

function normalizedStoredData(parsed = {}) {
  const profile = { ...defaultProfile, ...(parsed.profile || {}) };
  const policies = Array.isArray(parsed.policies)
    ? parsed.policies.map((policy) => ({ ...policy, id: policy.id || uid(), owner: policy.owner || "self" }))
    : [];
  const insuredPeople = normalizeInsuredPeople(parsed.insuredPeople, profile, policies);
  const requestedOwner = String(parsed.lastPolicyOwner || "self");
  const lastPolicyOwner = insuredPeople.some((person) => person.id === requestedOwner) ? requestedOwner : "self";
  return {
    profile,
    policies,
    insuredPeople,
    lastPolicyOwner,
    cancerCase: { ...defaultCancerCase, ...(parsed.cancerCase || {}) },
    productCatalog: Array.isArray(parsed.productCatalog) ? parsed.productCatalog : [],
  };
}

function cloneStoredData(value) {
  return JSON.parse(JSON.stringify(value));
}

function sameStoredValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeRecord(base = {}, local = {}, remote = {}, stats) {
  const merged = {};
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(local || {}), ...Object.keys(remote || {})]);
  for (const key of keys) {
    const baseValue = base?.[key];
    const localValue = local?.[key];
    const remoteValue = remote?.[key];
    if (sameStoredValue(localValue, remoteValue)) merged[key] = localValue;
    else if (sameStoredValue(localValue, baseValue)) merged[key] = remoteValue;
    else if (sameStoredValue(remoteValue, baseValue)) merged[key] = localValue;
    else {
      merged[key] = localValue;
      stats.conflicts += 1;
    }
  }
  return merged;
}

function mergeStoredCollection(baseItems, localItems, remoteItems, keyFor, stats) {
  const base = new Map((baseItems || []).map((item) => [keyFor(item), item]));
  const local = new Map((localItems || []).map((item) => [keyFor(item), item]));
  const remote = new Map((remoteItems || []).map((item) => [keyFor(item), item]));
  const order = [...new Set([...(localItems || []).map(keyFor), ...(remoteItems || []).map(keyFor)])];
  const merged = [];

  for (const key of order) {
    if (!key) continue;
    const baseItem = base.get(key);
    const localItem = local.get(key);
    const remoteItem = remote.get(key);
    if (!baseItem) {
      if (localItem && remoteItem && !sameStoredValue(localItem, remoteItem)) {
        merged.push(mergeRecord({}, localItem, remoteItem, stats));
      } else if (localItem || remoteItem) {
        merged.push(localItem || remoteItem);
      }
      continue;
    }
    if (!localItem && !remoteItem) continue;
    if (!localItem) {
      if (!sameStoredValue(remoteItem, baseItem)) {
        merged.push(remoteItem);
        stats.conflicts += 1;
      }
      continue;
    }
    if (!remoteItem) {
      if (!sameStoredValue(localItem, baseItem)) {
        merged.push(localItem);
        stats.conflicts += 1;
      }
      continue;
    }
    if (sameStoredValue(localItem, remoteItem)) merged.push(localItem);
    else if (sameStoredValue(localItem, baseItem)) merged.push(remoteItem);
    else if (sameStoredValue(remoteItem, baseItem)) merged.push(localItem);
    else merged.push(mergeRecord(baseItem, localItem, remoteItem, stats));
  }
  return merged;
}

function mergeAccountStores(baseValue, localValue, remoteValue) {
  const base = normalizedStoredData(baseValue || {});
  const local = normalizedStoredData(localValue || {});
  const remote = normalizedStoredData(remoteValue || {});
  const stats = { conflicts: 0 };
  const merged = normalizedStoredData({
    profile: mergeRecord(base.profile, local.profile, remote.profile, stats),
    cancerCase: mergeRecord(base.cancerCase, local.cancerCase, remote.cancerCase, stats),
    policies: mergeStoredCollection(base.policies, local.policies, remote.policies, (item) => item?.id, stats),
    insuredPeople: mergeStoredCollection(base.insuredPeople, local.insuredPeople, remote.insuredPeople, (item) => item?.id, stats),
    productCatalog: mergeStoredCollection(
      base.productCatalog,
      local.productCatalog,
      remote.productCatalog,
      (item) => `${normalizeProductCode(item?.code)}|${item?.insurer || ""}|${item?.sourceUrl || ""}`,
      stats,
    ),
    lastPolicyOwner: sameStoredValue(local.lastPolicyOwner, base.lastPolicyOwner)
      ? remote.lastPolicyOwner
      : local.lastPolicyOwner,
  });
  return { data: merged, conflicts: stats.conflicts };
}

function hasMeaningfulLocalData(value) {
  const data = normalizedStoredData(value || {});
  return data.policies.length > 0
    || data.productCatalog.length > 0
    || data.cancerCase.hasHistory === "yes"
    || !sameStoredValue(data.profile, defaultProfile)
    || data.insuredPeople.some((person) => !ownerLabels[person.id]);
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const draftRaw = localStorage.getItem(PROFILE_DRAFT_KEY);
    let profileDraft = {};
    try {
      profileDraft = draftRaw ? JSON.parse(draftRaw) : {};
    } catch {
      localStorage.removeItem(PROFILE_DRAFT_KEY);
    }
    return normalizedStoredData({
      ...parsed,
      profile: { ...(parsed.profile || {}), ...(profileDraft || {}) },
    });
  } catch {
    return normalizedStoredData();
  }
}

function saveProfileDraft() {
  localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(store.profile));
}

function saveStore(options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  localStorage.removeItem(PROFILE_DRAFT_KEY);
  if (!options.localOnly) queueAccountSync();
}

function uid() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function accountRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["content-type"]) headers["content-type"] = "application/json";
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "帳號服務暫時無法使用");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function setAccountMode(mode) {
  const isRegister = mode === "register";
  $("#accountMode").value = isRegister ? "register" : "login";
  $("#accountLoginTab").setAttribute("aria-selected", String(!isRegister));
  $("#accountRegisterTab").setAttribute("aria-selected", String(isRegister));
  $("#accountDisplayNameField").hidden = !isRegister;
  $("#accountPrivacyField").hidden = !isRegister;
  $("#accountDisplayName").required = isRegister;
  $("#accountPrivacyConsent").required = isRegister;
  $("#accountPassword").autocomplete = isRegister ? "new-password" : "current-password";
  $("#accountDialogTitle").textContent = isRegister ? "建立保單帳號" : "登入保管";
  $("#accountSubmitButton").textContent = isRegister ? "建立帳號" : "登入";
  $("#accountFormStatus").textContent = "";
}

function accountSyncText() {
  if (accountState.syncing) return "同步中";
  if (!accountState.user) return "尚未登入";
  if (!accountState.lastSyncAt) return "等待同步";
  return `已同步 ${new Date(accountState.lastSyncAt).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function renderAccountControls() {
  const button = $("#accountButton");
  if (!button) return;
  button.disabled = accountState.loading;
  button.textContent = accountState.loading
    ? "帳號"
    : accountState.user?.displayName || "登入";
  button.title = accountState.user ? accountSyncText() : "登入或建立帳號";

  const signedIn = Boolean(accountState.user);
  $("#accountSignedOut").hidden = signedIn;
  $("#accountSignedIn").hidden = !signedIn;
  if (!signedIn) return;
  $("#accountUserName").textContent = accountState.user.displayName || accountState.user.username;
  $("#accountUserId").textContent = accountState.user.username;
  $("#accountPolicyCount").textContent = `${store.policies.length} 張`;
  $("#accountSyncStatus").textContent = accountSyncText();
}

function openAccountDialog() {
  renderAccountControls();
  if (accountState.user) setDeleteAccountMode(false);
  const dialog = $("#accountDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  if (!accountState.user) {
    setAccountMode($("#accountMode").value || "login");
    $("#accountUsername").focus();
  }
}

function closeAccountDialog() {
  const dialog = $("#accountDialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function refreshAppFromStore() {
  activePolicyOwnerId = store.lastPolicyOwner || "self";
  syncProfileForm();
  syncCancerForm();
  renderInsuredPersonOptions(activePolicyOwnerId);
  applyInsuredPersonToForm(activePolicyOwnerId);
  clearPolicyForm();
  render();
  renderAccountControls();
}

function queueAccountSync() {
  if (!accountSyncEnabled || !accountState.user) return;
  window.clearTimeout(accountState.syncTimer);
  accountState.syncTimer = window.setTimeout(() => {
    accountState.syncTimer = 0;
    void syncAccountData();
  }, 700);
}

async function syncAccountData(options = {}) {
  if (!accountSyncEnabled || !accountState.user) return;
  if (accountState.syncing) {
    accountState.pending = true;
    return;
  }
  accountState.syncing = true;
  accountState.pending = false;
  renderAccountControls();
  let retryAfterConflict = false;
  try {
    const payload = await accountRequest("/api/account/data", {
      method: "PUT",
      body: JSON.stringify({ data: store, revision: accountState.revision }),
    });
    accountState.revision = Number(payload.revision || accountState.revision);
    accountState.lastSyncAt = Number(payload.updatedAt || Date.now());
    accountState.baseStore = cloneStoredData(store);
  } catch (error) {
    if (error.status === 409 && error.payload?.error === "sync_conflict") {
      const remote = normalizedStoredData(error.payload.data || {});
      const merged = mergeAccountStores(accountState.baseStore || normalizedStoredData(), store, remote);
      store = merged.data;
      accountState.baseStore = cloneStoredData(remote);
      accountState.revision = Number(error.payload.revision || 0);
      accountState.lastSyncAt = Number(error.payload.updatedAt || 0);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      invalidateProductCatalogCache();
      refreshAppFromStore();
      retryAfterConflict = options.allowConflictRetry !== false;
      showToast(merged.conflicts
        ? `已合併另一台裝置的資料，並保留這台裝置的 ${merged.conflicts} 項衝突修改`
        : "已合併另一台裝置的最新資料");
    } else if (error.status === 401) {
      accountState.user = null;
      accountSyncEnabled = false;
      showToast("登入已失效，請重新登入");
    } else {
      showToast("雲端同步失敗，資料仍保留在這台裝置");
    }
  } finally {
    accountState.syncing = false;
    renderAccountControls();
    if (!retryAfterConflict && accountState.pending && accountState.user) {
      accountState.pending = false;
      void syncAccountData();
    }
  }
  if (retryAfterConflict && accountState.user) {
    return syncAccountData({ allowConflictRetry: false });
  }
}

async function completeAccountSignIn(user) {
  accountState.user = user;
  accountState.loading = false;
  accountSyncEnabled = false;
  const remote = await accountRequest("/api/account/data");
  if (remote.data) {
    const remoteStore = normalizedStoredData(remote.data);
    const merged = hasMeaningfulLocalData(store)
      ? mergeAccountStores(normalizedStoredData(), store, remoteStore)
      : { data: remoteStore, conflicts: 0 };
    store = merged.data;
    invalidateProductCatalogCache();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    localStorage.removeItem(PROFILE_DRAFT_KEY);
    accountState.revision = Number(remote.revision || 0);
    accountState.lastSyncAt = Number(remote.updatedAt || 0);
    accountState.baseStore = cloneStoredData(remoteStore);
    accountSyncEnabled = true;
    refreshAppFromStore();
    if (!sameStoredValue(store, remoteStore)) await syncAccountData();
    return;
  }
  accountState.revision = 0;
  accountState.baseStore = normalizedStoredData();
  accountSyncEnabled = true;
  await syncAccountData();
  refreshAppFromStore();
}

async function submitAccountForm(event) {
  event.preventDefault();
  accountState.authEpoch += 1;
  const mode = $("#accountMode").value === "register" ? "register" : "login";
  const submitButton = $("#accountSubmitButton");
  const status = $("#accountFormStatus");
  submitButton.disabled = true;
  status.textContent = mode === "register" ? "正在建立帳號..." : "正在登入...";
  try {
    const payload = await accountRequest(`/api/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify({
        username: $("#accountUsername").value,
        password: $("#accountPassword").value,
        displayName: $("#accountDisplayName").value,
        privacyAccepted: $("#accountPrivacyConsent").checked,
      }),
    });
    await completeAccountSignIn(payload.user);
    $("#accountForm").reset();
    setAccountMode("login");
    closeAccountDialog();
    showToast(mode === "register" ? "帳號已建立，保單已開始同步" : "已登入並載入雲端保單");
  } catch (error) {
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}

async function logoutAccount() {
  accountState.authEpoch += 1;
  const button = $("#logoutButton");
  button.disabled = true;
  try {
    window.clearTimeout(accountState.syncTimer);
    accountState.syncTimer = 0;
    await syncAccountData();
    await accountRequest("/api/auth/logout", { method: "POST" });
    accountSyncEnabled = false;
    accountState.user = null;
    accountState.revision = 0;
    accountState.lastSyncAt = 0;
    accountState.baseStore = null;
    store = normalizedStoredData();
    invalidateProductCatalogCache();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    localStorage.removeItem(PROFILE_DRAFT_KEY);
    refreshAppFromStore();
    closeAccountDialog();
    showToast("已登出");
  } catch (error) {
    $("#accountSyncStatus").textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

function setDeleteAccountMode(open) {
  $("#accountDeleteForm").hidden = !open;
  $("#accountSignedInActions").hidden = open;
  $("#accountDeletePassword").required = open;
  $("#accountDeleteConfirm").required = open;
  $("#accountDeleteStatus").textContent = "";
  if (open) $("#accountDeletePassword").focus();
  else $("#accountDeleteForm").reset();
}

async function deleteCurrentAccount(event) {
  event.preventDefault();
  const button = $("#confirmDeleteAccountButton");
  const status = $("#accountDeleteStatus");
  button.disabled = true;
  status.textContent = "正在永久刪除帳號與雲端資料...";
  try {
    await accountRequest("/api/account", {
      method: "DELETE",
      body: JSON.stringify({ password: $("#accountDeletePassword").value }),
    });
    accountSyncEnabled = false;
    accountState.user = null;
    accountState.revision = 0;
    accountState.lastSyncAt = 0;
    accountState.baseStore = null;
    store = normalizedStoredData();
    invalidateProductCatalogCache();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_DRAFT_KEY);
    refreshAppFromStore();
    closeAccountDialog();
    showToast("帳號與雲端保單資料已永久刪除");
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function bootstrapAccount() {
  const authEpoch = accountState.authEpoch;
  try {
    const payload = await accountRequest("/api/auth/session");
    if (authEpoch !== accountState.authEpoch) return;
    if (payload.authenticated && payload.user) {
      await completeAccountSignIn(payload.user);
    } else {
      accountState.user = null;
      accountSyncEnabled = false;
    }
  } catch {
    if (authEpoch !== accountState.authEpoch) return;
    accountState.user = null;
    accountSyncEnabled = false;
  } finally {
    accountState.loading = false;
    renderAccountControls();
  }
}

function insuredPersonById(id) {
  const normalizedId = String(id || "self");
  return (store.insuredPeople || []).find((person) => person.id === normalizedId) || null;
}

function insuredPersonName(id, fallback = "") {
  return insuredPersonById(id)?.name || sanitizePersonName(fallback) || ownerLabels[id] || ownerLabels.self;
}

function renderInsuredPersonOptions(selectedId = "") {
  const select = $("#policyOwner");
  if (!select) return;
  const requestedId = selectedId || select.value || store.lastPolicyOwner || "self";
  select.replaceChildren(...(store.insuredPeople || []).map((person) => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = person.name;
    return option;
  }));
  select.value = insuredPersonById(requestedId) ? requestedId : "self";
  activePolicyOwnerId = select.value || "self";
}

function applyInsuredPersonToForm(personOrId) {
  const person = typeof personOrId === "string" ? insuredPersonById(personOrId) : personOrId;
  if (!person) return;
  $("#insuredGender").value = normalizedGender(person.gender);
  $("#occupationClass").value = String(clamp(Math.round(toNumber(person.occupationClass, 1)), 1, 6));
  $("#insuredCurrentAge").value = person.currentAge == null ? "" : person.currentAge;
}

function syncInsuredPersonFromForm(ownerId = activePolicyOwnerId, persist = true) {
  const person = insuredPersonById(ownerId);
  if (!person || !$("#insuredGender") || !$("#occupationClass") || !$("#insuredCurrentAge")) return person;
  person.gender = normalizedGender($("#insuredGender").value);
  person.occupationClass = policyOccupationClass({ occupationClass: $("#occupationClass").value });
  const currentAge = normalizePersonAge($("#insuredCurrentAge").value);
  person.currentAge = currentAge;
  store.lastPolicyOwner = person.id;
  if (persist) saveStore();
  return person;
}

function rememberPolicyOwnerProfile(policy) {
  const person = insuredPersonById(policy.owner);
  if (!person) return;
  person.gender = normalizedGender(policy.gender);
  person.occupationClass = policyOccupationClass(policy);
  person.currentAge = policyCurrentAge(policy);
  policy.ownerName = person.name;
  store.lastPolicyOwner = person.id;
}

function closeInsuredPersonDialog() {
  const dialog = $("#insuredPersonDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function openInsuredPersonDialog() {
  syncInsuredPersonFromForm(activePolicyOwnerId);
  const dialog = $("#insuredPersonDialog");
  const nameInput = $("#insuredPersonName");
  if (!dialog || !nameInput) return;
  nameInput.value = "";
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  nameInput.focus();
}

function createInsuredPerson(name) {
  const normalizedName = sanitizePersonName(name);
  if (!normalizedName) return null;
  const existing = (store.insuredPeople || []).find((person) => person.name.toLocaleLowerCase("zh-TW") === normalizedName.toLocaleLowerCase("zh-TW"));
  if (existing) return existing;
  const age = normalizePersonAge($("#insuredCurrentAge")?.value);
  const person = {
    id: `person_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: normalizedName,
    gender: normalizedGender($("#insuredGender")?.value || store.profile.gender),
    currentAge: age,
    occupationClass: policyOccupationClass({ occupationClass: $("#occupationClass")?.value || 1 }),
  };
  store.insuredPeople.push(person);
  return person;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value, fallback = 0) {
  if (value == null || (typeof value === "string" && !value.trim())) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizedGender(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (["female", "f", "woman", "women", "女", "女性"].some((token) => text.includes(token))) return "female";
  return "male";
}

function genderLabel(value) {
  return genderLabels[normalizedGender(value)] || genderLabels.male;
}

function currentCalendarYear() {
  return new Date().getFullYear();
}

function normalizedStartYear(value, currentYear = currentCalendarYear()) {
  const year = Math.round(toNumber(value, currentYear));
  return clamp(year, 1900, currentYear);
}

function policyStartAgeFromYear(currentAge, startYear, currentYear = currentCalendarYear()) {
  const yearsInsured = Math.max(0, currentYear - normalizedStartYear(startYear, currentYear));
  return clamp(Math.round(toNumber(currentAge, 0) - yearsInsured), 0, 110);
}

function policyStartYearFromAges(currentAge, startAge, currentYear = currentCalendarYear()) {
  const yearsInsured = Math.max(0, Math.round(toNumber(currentAge, 0) - toNumber(startAge, currentAge)));
  return clamp(currentYear - yearsInsured, 1900, currentYear);
}

function policyGender(policy = {}) {
  const person = insuredPersonById(policy.owner);
  return normalizedGender(policy.gender || policy.insuredGender || person?.gender || store.profile.gender || defaultProfile.gender);
}

function policyOccupationClass(policy = {}) {
  const person = insuredPersonById(policy.owner);
  return clamp(Math.round(toNumber(policy.occupationClass || policy.jobClass || person?.occupationClass || 1, 1)), 1, 6);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  const number = Math.round(toNumber(value));
  if (Math.abs(number) >= 100000000) return `NT$${(number / 100000000).toFixed(1)} 億`;
  if (Math.abs(number) >= 10000) return `NT$${Math.round(number / 10000).toLocaleString("zh-TW")} 萬`;
  return `NT$${number.toLocaleString("zh-TW")}`;
}

function moneyExact(value) {
  return `NT$${Math.round(toNumber(value)).toLocaleString("zh-TW")}`;
}

function wan(value) {
  return `${Math.round(toNumber(value) / 10000).toLocaleString("zh-TW")} 萬`;
}

function plainText(value) {
  return String(value ?? "").trim();
}

function cleanBenefitAmount(value) {
  const amount = plainText(value);
  if (!amount) return "";
  return VAGUE_BENEFIT_AMOUNT_RE.test(amount) ? UNKNOWN_BENEFIT_AMOUNT : amount;
}

function normalizeBenefitItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const label = plainText(item.item || item.name || item.label || item.title);
    const amount = cleanBenefitAmount(item.amount || item.coverage || item.value || item.limit);
    const note = plainText(item.note || item.description || item.memo);
    return { item: label, amount, note };
  }).filter((item) => item.item || item.amount || item.note).slice(0, 8);
}

function normalizePurchaseRequirements(items, sourceItem = {}) {
  const rawItems = Array.isArray(items)
    ? items
    : Array.isArray(sourceItem.requirements)
      ? sourceItem.requirements
      : Array.isArray(sourceItem.requiredProducts)
        ? sourceItem.requiredProducts
        : Array.isArray(sourceItem.requiredProductCodes)
          ? sourceItem.requiredProductCodes
          : [];
  const normalized = rawItems.map((item) => {
    if (typeof item === "string") return { type: "requiresProduct", code: normalizeProductCode(item), name: "", timing: "before", note: "" };
    const code = normalizeProductCode(item.code || item.productCode || item.requiredCode || item.requiredProductCode);
    const name = plainText(item.name || item.productName || item.requiredName || item.requiredProductName || item.label);
    return {
      type: plainText(item.type || item.kind || "requiresProduct") || "requiresProduct",
      code,
      name,
      timing: plainText(item.timing || item.relation || item.when || "before") || "before",
      note: plainText(item.note || item.description || item.reason),
    };
  });

  const inferred = inferPurchaseRequirements(sourceItem);
  const unique = new Map();
  [...normalized, ...inferred].forEach((requirement) => {
    if (!requirement.code && !requirement.name) return;
    const key = `${requirement.type || "requiresProduct"}:${requirement.code || normalizedProductIdentityText(requirement.name)}`;
    if (!unique.has(key)) unique.set(key, requirement);
  });
  return Array.from(unique.values());
}

function inferPurchaseRequirements(item = {}) {
  const text = `${item.name || ""} ${item.note || ""} ${item.description || ""}`;
  const requirements = [];
  const add = (requirement) => {
    if (!requirement.code && !requirement.name) return;
    requirements.push(requirement);
  };
  for (const match of text.matchAll(/須搭配「([^」]+?)\s*[（(]([A-Za-z0-9._/-]+)[）)]」同時購買/g)) {
    add({
      type: "requiresProduct",
      code: normalizeProductCode(match[2]),
      name: plainText(match[1]),
      timing: "sameTime",
      note: "須同時購買，系統會在保單清單中追蹤是否已記錄。",
    });
  }
  if (normalizeProductCode(item.code) === "HNRD" && !requirements.some((requirement) => requirement.code === "HNRC")) {
    add({
      type: "requiresProduct",
      code: "HNRC",
      name: "台灣人壽新住院醫療保險附約(85)",
      timing: "sameTime",
      note: "HNRD 為加強 HNRC 保障額度的自負額附約，需同時搭配 HNRC。",
    });
  }
  return requirements;
}

function normalizePlanOptions(item) {
  const raw = item?.planOptions || item?.plans || item?.availablePlans || item?.options?.plan || [];
  const values = Array.isArray(raw) ? raw : [raw];
  const known = [
    ...values,
    item?.selectedPlan,
    item?.planName,
    item?.plan,
    item?.coverageLabel,
    item?.planLabel,
    item?.coverageDescription,
  ];
  const seen = new Set();
  return known
    .map(plainText)
    .filter(Boolean)
    .filter((plan) => {
      const key = planKey(plan);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizePlanBenefitTables(tables) {
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) return {};
  return Object.fromEntries(
    Object.entries(tables)
      .map(([plan, benefits]) => [plainText(plan), normalizeBenefitItems(benefits)])
      .filter(([plan, benefits]) => plan && benefits.length),
  );
}

function planKey(value) {
  return plainText(value)
    .replace(/\s+/g, "")
    .replace(/[（(].*?[）)]/g, "")
    .toUpperCase();
}

function planLabelMatches(a, b) {
  const left = plainText(a);
  const right = plainText(b);
  if (!left || !right) return false;
  return left === right || planKey(left) === planKey(right);
}

function productPlanOptions(product) {
  return normalizePlanOptions(product);
}

function selectedPlanLabel(product, requested = "") {
  const requestedText = plainText(requested);
  const options = productPlanOptions(product);
  if (requestedText) {
    return options.find((plan) => planLabelMatches(plan, requestedText)) || requestedText;
  }
  const defaultPlan = plainText(product?.selectedPlan || product?.planName || product?.coverageLabel || product?.planLabel);
  if (defaultPlan) return options.find((plan) => planLabelMatches(plan, defaultPlan)) || defaultPlan;
  return options[0] || coverageLabelFor(product);
}

function benefitsForPlan(product, planLabel) {
  const tables = product?.planBenefitTables || {};
  if (!tables || typeof tables !== "object") return [];
  const selected = plainText(planLabel || selectedPlanLabel(product));
  const exact = tables[selected];
  if (exact) return normalizeBenefitItems(exact);
  const selectedKey = planKey(selected);
  const match = Object.entries(tables).find(([plan]) => planKey(plan) === selectedKey);
  return match ? normalizeBenefitItems(match[1]) : [];
}

function coverageWanFromLabel(label) {
  const match = plainText(label).replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*萬/);
  return match ? toNumber(match[1], 0) : 0;
}

function coverageLabelFor(item) {
  const label = plainText(item?.coverageLabel || item?.planName || item?.planLabel);
  if (label) return label;
  const coverage = toNumber(item?.coverage, 0);
  return coverage > 0 ? wan(coverage) : "";
}

function inferBenefitItems(item = {}) {
  const text = `${item.name || ""} ${item.category || ""} ${item.note || ""} ${item.description || ""}`;
  const label = coverageLabelFor(item);
  const coverageAmount = toNumber(item.coverage, 0) > 0 ? wan(item.coverage) : label || UNKNOWN_BENEFIT_AMOUNT;
  const benefits = [];
  const add = (name, amount = UNKNOWN_BENEFIT_AMOUNT, note = "") => {
    if (!name || benefits.some((benefit) => benefit.item === name)) return;
    benefits.push({ item: name, amount: cleanBenefitAmount(amount), note });
  };

  const misc = label.match(/雜費\s*(\d+(?:\.\d+)?)\s*萬/);
  if (misc) add("住院醫療雜費", `${misc[1]} 萬`, label);
  if (/住院|醫療|實支/.test(text)) add("住院醫療", label || UNKNOWN_BENEFIT_AMOUNT);
  if (/門診.*(手術|雜費)|手術費與雜費/.test(text)) add("門診手術費／雜費", UNKNOWN_BENEFIT_AMOUNT);
  if (/手術/.test(text)) add("手術醫療", UNKNOWN_BENEFIT_AMOUNT);
  if (/腫瘤門診/.test(text)) add("出院後腫瘤門診治療", UNKNOWN_BENEFIT_AMOUNT);
  if (/重大傷病|重大疾病/.test(text)) add("重大傷病／疾病保險金", coverageAmount);
  if (/癌症|防癌/.test(text)) add("癌症保障", coverageAmount);
  if (/意外|傷害/.test(text)) add("意外身故／失能或醫療", coverageAmount);
  if (/身故|定期壽險|壽險/.test(text)) add("身故／完全失能保險金", coverageAmount);
  if (/長照|長期照顧/.test(text)) add("長期照顧保險金", coverageAmount);
  if (!benefits.length && coverageAmount) add(categoryLabels[item.category] || "主要保障", coverageAmount);

  return benefits.slice(0, 6);
}

function benefitItemsForPolicy(policy = {}) {
  const product = productForPolicy(policy);
  const planLabel = selectedPlanLabel(
    product,
    plainText(policy.coverageLabel || policy.planName || product?.coverageLabel || product?.planName),
  );
  const plannedBenefits = benefitsForPlan(product, planLabel);
  if (plannedBenefits.length) return plannedBenefits;
  const direct = normalizeBenefitItems(policy.benefits);
  const hasMultiplePlans = productPlanOptions(product).length > 1;
  const directMatchesPlan = plainText(policy.benefitPlan)
    && planLabelMatches(policy.benefitPlan, planLabel);
  if (direct.length && (!hasMultiplePlans || directMatchesPlan)) return direct;
  if (hasMultiplePlans && planLabel) {
    return [{
      item: "方案理賠資料",
      amount: "尚未取得",
      note: `已選 ${planLabel}；系統不會改套其他計畫，待取得該計畫正式條款後顯示。`,
    }];
  }
  const productBenefits = normalizeBenefitItems(product?.benefits);
  if (productBenefits.length) return productBenefits;
  return inferBenefitItems({
    ...product,
    ...policy,
    note: `${product?.note || ""} ${policy.note || ""}`.trim(),
    coverage: toNumber(policy.coverage, 0) || toNumber(product?.coverage, 0),
    coverageLabel: planLabel,
  });
}

function policyCoverageLabel(policy = {}) {
  const product = productForPolicy(policy);
  const label = plainText(policy.coverageLabel || policy.planName || product?.coverageLabel || product?.planName);
  if (label) return label;
  const coverage = toNumber(policy.coverage, 0) || toNumber(product?.coverage, 0);
  return coverage > 0 ? wan(coverage) : "";
}

function renderBenefitSummary(benefits) {
  const rows = normalizeBenefitItems(benefits);
  if (!rows.length) return "";
  return `
    <div class="benefit-summary">
      <h4>理賠項目與金額</h4>
      <dl>
        ${rows.map((benefit) => `
          <div>
            <dt>${escapeHtml(benefit.item || "保障項目")}</dt>
            <dd>
              ${benefit.amount ? `<strong>${escapeHtml(benefit.amount)}</strong>` : ""}
              ${benefit.note ? `<span>${escapeHtml(benefit.note)}</span>` : ""}
            </dd>
          </div>
        `).join("")}
      </dl>
    </div>
  `;
}

function renderClaimOwnerOptions() {
  const select = $("#claimOwner");
  if (!select) return;
  const selected = select.value || store.lastPolicyOwner || "self";
  const people = Array.isArray(store.insuredPeople) ? store.insuredPeople : [];
  select.replaceChildren(...people.map((person) => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = person.name;
    return option;
  }));
  select.value = people.some((person) => person.id === selected) ? selected : people[0]?.id || "self";
}

function detectedClaimScenarios(description) {
  const text = plainText(description);
  return claimScenarioRules.filter((rule) => (
    rule.input.test(text) && !claimScenarioNegations[rule.id]?.test(text)
  ));
}

function claimPolicyStatus(policy, eventDate) {
  const eventYear = eventDate ? new Date(`${eventDate}T12:00:00`).getFullYear() : currentCalendarYear();
  const currentYear = currentCalendarYear();
  const startYear = policyStartYear(policy);
  const eventAge = Math.max(0, policyCurrentAge(policy) - Math.max(0, currentYear - eventYear));
  if (Number.isFinite(eventYear) && eventYear < startYear) return { active: false, reason: "事故發生時尚未投保" };
  if (eventAge > toNumber(policy.endAge, 100)) return { active: false, reason: "事故發生時已超過保障年齡" };
  return { active: true, reason: "依保單紀錄仍在保障期間" };
}

function claimBenefitMatches(policy, benefit, scenario) {
  const benefitText = `${benefit.item || ""} ${benefit.note || ""}`;
  if (scenario.benefit.test(benefitText)) return true;
  const amountUnknown = !benefit.amount || benefit.amount === UNKNOWN_BENEFIT_AMOUNT;
  if (!amountUnknown) return false;
  const policyText = `${policy.name || ""} ${policy.note || ""}`;
  return scenario.benefit.test(policyText) || scenario.categories.includes(policy.category);
}

function claimIndividualBenefitNote(note) {
  return plainText(note)
    .replace(/；?搭配\s*[A-Z0-9._/-]+\s*同計畫後總限額[^；。]*/gi, "")
    .replace(/^；+|；+$/g, "");
}

function claimAggregationRows(candidates, ownerId) {
  const owner = insuredPersonName(ownerId);
  return candidates.flatMap(({ policy, matchedBenefits }) => {
    const productCode = normalizeProductCode(policy.productCode || "");
    const productName = policy.name || productForPolicy(policy)?.name || "保單";
    const requiredCodes = purchaseRequirementsForPolicy(policy)
      .map((requirement) => normalizeProductCode(requirement.code || ""))
      .filter(Boolean);
    return matchedBenefits.map((benefit) => {
      const amount = benefit.amount || UNKNOWN_BENEFIT_AMOUNT;
      return {
        ownerId,
        owner,
        productCode,
        productName,
        requiredCodes,
        item: benefit.item || "理賠項目",
        amount,
        note: benefit.note,
        value: benefitNumericValue(amount),
      };
    });
  });
}

function renderClaimCoverageSummary(candidates, ownerId) {
  const groups = aggregateBenefitRows(claimAggregationRows(candidates, ownerId));
  if (!groups.length) return "";
  return `
    <div class="benefit-summary claim-coverage-summary">
      <h4>本次狀況相關保障合計</h4>
      <dl>
        ${groups.map((group) => `
          <div>
            <dt>${escapeHtml(group.item)}</dt>
            <dd>
              <strong>${escapeHtml(group.amount)}</strong>
              <span>${escapeHtml(group.relationship ? `${group.relationship}，已合併計算，請勿再次相加。` : group.sourceText)}</span>
            </dd>
          </div>
        `).join("")}
      </dl>
    </div>
  `;
}

function claimDocumentsFor(scenarios) {
  return [...new Set([
    "保險公司理賠申請書",
    "被保險人或受益人身分證明與匯款資料",
    ...scenarios.flatMap((scenario) => scenario.documents),
  ])];
}

function analyzeClaim() {
  const result = $("#claimResult");
  if (!result) return;
  const ownerId = $("#claimOwner")?.value || "self";
  const description = $("#claimDescription")?.value || "";
  const eventDate = $("#claimEventDate")?.value || "";
  const scenarios = detectedClaimScenarios(description);

  if (!plainText(description)) {
    result.innerHTML = `<div class="empty-state compact">請輸入事故、診斷、住院或治療狀況。</div>`;
    return;
  }
  if (!scenarios.length) {
    result.innerHTML = `
      <div class="claim-notice is-review">
        <strong>目前無法辨識理賠情境</strong>
        <p>請補充是否為意外、急診、住院、手術、癌症、重大疾病、失能或長照，以及實際診斷名稱。</p>
      </div>
    `;
    return;
  }

  const ownerPolicies = store.policies.filter((policy) => String(policy.owner || "self") === String(ownerId));
  const activePolicies = ownerPolicies.filter((policy) => claimPolicyStatus(policy, eventDate).active);
  const candidates = activePolicies.map((policy) => {
    const benefits = benefitItemsForPolicy(policy);
    const matchedBenefits = benefits.filter((benefit) => (
      scenarios.some((scenario) => claimBenefitMatches(policy, benefit, scenario))
    ));
    const matchedScenarios = scenarios.filter((scenario) => (
      matchedBenefits.some((benefit) => claimBenefitMatches(policy, benefit, scenario))
    ));
    return { policy, matchedBenefits, matchedScenarios };
  }).filter((item) => item.matchedBenefits.length);
  const documents = claimDocumentsFor(scenarios);
  const scenarioLabels = scenarios.map((scenario) => `<span>${escapeHtml(scenario.label)}</span>`).join("");

  result.innerHTML = `
    <div class="claim-result-head">
      <div>
        <span>辨識到的狀況</span>
        <div class="claim-scenario-tags">${scenarioLabels}</div>
      </div>
      <strong>${candidates.length} 張保單可進一步確認</strong>
    </div>
    ${renderClaimCoverageSummary(candidates, ownerId)}
    ${candidates.length ? candidates.map(({ policy, matchedBenefits, matchedScenarios }) => {
      const product = productForPolicy(policy);
      const sourceUrl = policy.sourceUrl || product?.sourceUrl || "";
      return `
        <article class="claim-policy-row">
          <div class="claim-policy-title">
            <div>
              <span>${escapeHtml(policy.insurer || product?.insurer || "保險公司")}</span>
              <h3>${escapeHtml(normalizeProductCode(policy.productCode || ""))} ${escapeHtml(policy.name || product?.name || "保單")}</h3>
            </div>
            <span class="option-status review">可申請初判</span>
          </div>
          <p>對應：${matchedScenarios.map((scenario) => escapeHtml(scenario.label)).join("、")}</p>
          <p>以下為保單個別限額；搭配商品已在上方合併，請勿重複加總。</p>
          <dl class="claim-benefit-list">
            ${matchedBenefits.map((benefit) => `
              <div>
                <dt>${escapeHtml(benefit.item || "理賠項目")}</dt>
                <dd><strong>${escapeHtml(benefit.amount || UNKNOWN_BENEFIT_AMOUNT)}</strong>${claimIndividualBenefitNote(benefit.note) ? `<small>${escapeHtml(claimIndividualBenefitNote(benefit.note))}</small>` : ""}</dd>
              </div>
            `).join("")}
          </dl>
          ${sourceUrl ? `<a class="finfo-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">查看商品與條款來源</a>` : ""}
        </article>
      `;
    }).join("") : `
      <div class="claim-notice is-review">
        <strong>現有保單資料未找到明確對應項目</strong>
        <p>這不代表一定不能理賠；可能是商品理賠資料尚未完整，請再以保單條款或保險公司回覆確認。</p>
      </div>
    `}
    <div class="claim-documents">
      <h3>可能需要的文件</h3>
      <ul>${documents.map((documentName) => `<li>${escapeHtml(documentName)}</li>`).join("")}</ul>
    </div>
    <p class="claim-disclaimer">本結果只依你輸入的狀況、已儲存保單及公開商品資料比對。實際是否理賠仍要看事故原因、保單生效日、等待期、除外責任、醫療必要性、收據與保險公司審核。</p>
  `;
}

function percent(value) {
  return `${Math.round(value)}%`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function normalizeProductCode(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s\-_/．。]+/g, "");
}

function inferCategoryFromText(value) {
  const text = String(value ?? "");
  const rules = [
    { category: "medical", words: ["醫療", "實支", "住院", "手術", "雜費"] },
    { category: "critical", words: ["重大傷病", "重大疾病", "癌", "防癌", "特定傷病"] },
    { category: "life", words: ["壽險", "人壽", "身故", "死亡", "定期壽"] },
    { category: "accident", words: ["意外", "傷害", "失能給付"] },
    { category: "disability", words: ["失能", "殘扶", "扶助", "收入補償"] },
    { category: "longcare", words: ["長照", "長期照顧", "看護"] },
    { category: "savings", words: ["儲蓄", "年金", "利變", "還本"] },
  ];
  return rules.find((rule) => rule.words.some((word) => text.includes(word)))?.category || "medical";
}

function inferPremiumMode(item) {
  const text = `${item.name || item.productName || item.title || ""} ${item.premiumChange || ""} ${item.premiumDescription || ""} ${item.note || ""}`;
  if (Array.isArray(item.premiumBands) || Array.isArray(item.ageBands)) return "ageBand";
  if (Array.isArray(item.rateTable) || Array.isArray(item.rates)) return "ageBand";
  if (toNumber(item.growthRate || item.annualIncreaseRate, 0) > 0) return "annualGrowth";
  if (/年齡|級距|自然費率|隨年齡|定期|一年期|一年定期|[0-9０-９]+年期|歲滿期|續保年齡/.test(text)) return "ageBand";
  if (/年增|每年|調漲|%/.test(text)) return "annualGrowth";
  return "level";
}

function normalizePremiumBands(item) {
  const bands = item.premiumBands || item.ageBands || item.premiumTable || [];
  if (!Array.isArray(bands)) return [];
  return bands
    .map((band) => ({
      age: String(band.age || band.ageBand || band.range || band.label || "").trim(),
      premium: Math.max(0, toNumber(band.premium || band.annualPremium || band.value, 0)),
    }))
    .filter((band) => band.age && band.premium > 0)
    .slice(0, 8);
}

function normalizeRateTable(item) {
  const table = item.rateTable || item.rates || [];
  if (!Array.isArray(table)) return [];
  return table
    .map((row) => ({
      age: clamp(toNumber(row.age ?? row.attainedAge ?? row.renewalAge, NaN), 0, 110),
      premium: Math.max(0, toNumber(row.premium ?? row.annualPremium ?? row.rate, 0)),
    }))
    .filter((row) => Number.isFinite(row.age) && row.premium > 0)
    .sort((a, b) => a.age - b.age);
}

function normalizeRateTablesByGender(item) {
  const tables = item.rateTablesByGender || item.genderRateTables || {};
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) return {};

  return Object.entries(tables).reduce((normalized, [gender, table]) => {
    const rows = normalizeRateTable({ rateTable: table });
    if (rows.length) normalized[normalizedGender(gender)] = rows;
    return normalized;
  }, {});
}

function termYears(value) {
  const match = String(value ?? "").match(/(\d{1,2})\s*(?:\u5e74\s*\u671f|\u5e74|year)/i);
  return match ? toNumber(match[1], 0) : 0;
}

function productPremiumTerms(product) {
  const terms = [
    ...(Array.isArray(product?.availableTerms) ? product.availableTerms : []),
    ...Object.keys(product?.termRateTablesByGender || {}),
  ].map((term) => String(term || "").trim()).filter(Boolean);
  return [...new Set(terms)].sort((a, b) => termYears(a) - termYears(b) || a.localeCompare(b, "zh-Hant"));
}

function matchedPremiumTerm(product, value) {
  const requested = String(value || "").trim();
  const terms = productPremiumTerms(product);
  if (!terms.length) return requested;
  return terms.find((term) => term === requested)
    || terms.find((term) => termYears(term) > 0 && termYears(term) === termYears(requested))
    || "";
}

function rateTableAgeBounds(rows = []) {
  const ages = rows.map((row) => toNumber(row?.age, NaN)).filter(Number.isFinite);
  if (!ages.length) return null;
  return { min: Math.min(...ages), max: Math.max(...ages) };
}

function rateTableSupportsAge(product, age, gender, premiumTerm = "", planLabel = "") {
  const bounds = rateTableAgeBounds(rateTableForGender(product, gender, premiumTerm, planLabel));
  const normalizedAge = toNumber(age, NaN);
  return Boolean(bounds && Number.isFinite(normalizedAge) && normalizedAge >= bounds.min && normalizedAge <= bounds.max);
}

function suitablePremiumTerm(product, age, gender, requestedTerm = "", planLabel = "") {
  const terms = productPremiumTerms(product);
  if (!terms.length) return String(requestedTerm || "").trim();
  const requested = matchedPremiumTerm(product, requestedTerm);
  if (requested && rateTableSupportsAge(product, age, gender, requested, planLabel)) return requested;
  return [...terms]
    .sort((a, b) => termYears(b) - termYears(a) || b.localeCompare(a, "zh-Hant"))
    .find((term) => rateTableSupportsAge(product, age, gender, term, planLabel)) || "";
}

function premiumTermForPolicy(product, policy = {}) {
  const terms = productPremiumTerms(product);
  const requested = matchedPremiumTerm(product, policy.premiumTerm);
  if (requested) return requested;
  const rateAge = product?.rateBasis === "issueAge" ? policyStartAge(policy) : policyCurrentAge(policy);
  const fallback = matchedPremiumTerm(product, product?.premiumTerm) || terms.at(-1) || "";
  return suitablePremiumTerm(product, rateAge, policyGender(policy), fallback, policy.coverageLabel || policy.planName)
    || fallback
    || terms.at(-1)
    || "";
}

function renderPremiumTermOptions(product, requestedTerm = "") {
  const field = $("#premiumTermField");
  const select = $("#premiumTerm");
  if (!field || !select) return "";
  const terms = productPremiumTerms(product);
  const selected = matchedPremiumTerm(product, requestedTerm)
    || matchedPremiumTerm(product, product?.premiumTerm)
    || terms.at(-1)
    || "";
  select.replaceChildren(...terms.map((term) => {
    const option = document.createElement("option");
    option.value = term;
    option.textContent = term;
    return option;
  }));
  select.value = selected;
  field.hidden = terms.length <= 1;
  return selected;
}

function normalizeTermRateTablesByGender(item) {
  const tables = item.termRateTablesByGender || {};
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) return {};

  return Object.entries(tables).reduce((normalized, [term, genderTables]) => {
    const normalizedGenderTables = normalizeRateTablesByGender({ rateTablesByGender: genderTables });
    if (Object.keys(normalizedGenderTables).length) normalized[term] = normalizedGenderTables;
    return normalized;
  }, {});
}

function normalizePlanRateTablesByGender(item) {
  const tables = item.planRateTablesByGender || item.rateTablesByPlan || {};
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) return {};

  return Object.entries(tables).reduce((normalized, [plan, genderTables]) => {
    const label = plainText(plan);
    const normalizedGenderTables = normalizeRateTablesByGender({ rateTablesByGender: genderTables });
    if (label && Object.keys(normalizedGenderTables).length) normalized[label] = normalizedGenderTables;
    return normalized;
  }, {});
}

function normalizeStructuredRateTable(item) {
  const table = item.structuredRateTable || item.driveRateTable || item.planRateTable || null;
  if (!table || typeof table !== "object" || !Array.isArray(table.rows)) return null;

  const rows = table.rows
    .map((row) => {
      const premiums = Object.fromEntries(Object.entries(row.premiums || {})
        .map(([key, value]) => [`class${policyOccupationClass({ occupationClass: String(key).replace(/\D/g, "") || 1 })}`, Math.max(0, toNumber(value, 0))])
        .filter(([, value]) => value > 0));
      return {
        label: String(row.label || "").trim(),
        coverageWan: Math.max(0, toNumber(row.coverageWan, 0)),
        premiums,
      };
    })
    .filter((row) => row.coverageWan > 0 && Object.keys(row.premiums).length);

  if (!rows.length) return null;
  return {
    kind: table.kind === "unitOccupation" ? "unitOccupation" : "coverageOccupation",
    unit: table.unit || "",
    unitCoverageWan: Math.max(1, toNumber(table.unitCoverageWan, 1)),
    occupationClasses: Array.isArray(table.occupationClasses)
      ? table.occupationClasses.map((value) => policyOccupationClass({ occupationClass: value }))
      : [1],
    rows,
    note: String(table.note || "").trim(),
  };
}

function rateRowCount(product) {
  const byGender = Object.values(product?.rateTablesByGender || {})
    .map((rows) => Array.isArray(rows) ? rows.length : 0);
  const byPlan = Object.values(product?.planRateTablesByGender || {})
    .flatMap((tables) => Object.values(tables || {}))
    .map((rows) => Array.isArray(rows) ? rows.length : 0);
  const structuredRows = Array.isArray(product?.structuredRateTable?.rows) ? product.structuredRateTable.rows.length : 0;
  return Math.max(Array.isArray(product?.rateTable) ? product.rateTable.length : 0, structuredRows, 0, ...byGender, ...byPlan);
}

function normalizeCatalogItem(item) {
  const code = String(item.code || item.productCode || item.policyCode || item.id || "").trim();
  const name = String(item.name || item.productName || item.title || "").trim();
  const insurer = String(item.insurer || item.company || item.companyName || item.insurerName || "").trim();
  const rawCategory = String(item.category || item.type || "");
  const category = categoryLabels[rawCategory] ? rawCategory : inferCategoryFromText(`${name} ${rawCategory}`);
  const coverage = item.coverage != null
    ? toNumber(item.coverage, 0)
    : toNumber(item.coverageWan || item.coverageInWan, 0) * 10000;
  const inferredPremiumMode = inferPremiumMode({ ...item, name });
  const premiumMode = inferredPremiumMode === "ageBand"
    ? "ageBand"
    : ["level", "ageBand", "annualGrowth"].includes(item.premiumMode)
      ? item.premiumMode
      : inferredPremiumMode;
  const rateTablesByGender = normalizeRateTablesByGender(item);
  const firstGenderRateTable = Object.values(rateTablesByGender).find((rows) => rows.length) || [];
  const rateTable = rateTablesByGender.male?.length
    ? rateTablesByGender.male
    : firstGenderRateTable.length
      ? firstGenderRateTable
      : normalizeRateTable(item);
  const structuredRateTable = normalizeStructuredRateTable(item);
  const explicitEndAge = toNumber(item.endAge || item.coverageUntil || item.untilAge || item.maxRenewAge, 0);
  const inferredEndAge = [rateTable, ...Object.values(rateTablesByGender)]
    .flat()
    .reduce((maximum, row) => Math.max(maximum, toNumber(row?.age, 0)), 0);
  const endAge = clamp(explicitEndAge || inferredEndAge || 100, 18, 110);
  const endAgeKnown = item.endAgeKnown === true || explicitEndAge > 0 || inferredEndAge > 0;
  const premiumTerm = String(item.premiumTerm || item.paymentTerm || item.term || "").trim();
  const premiumTermYears = Math.max(0, toNumber(item.premiumTermYears || item.paymentTermYears || termYears(premiumTerm), 0));
  const rateBasis = item.rateBasis === "issueAge" || premiumTermYears > 1 ? "issueAge" : "attainedAge";
  const inferredPlanTotal = String(item.premiumChange || "").includes("Finfo 公開 premiums API");
  const ratePricingModel = ["planTotal", "coverageUnit", "structured"].includes(item.ratePricingModel)
    ? item.ratePricingModel
    : inferredPlanTotal
      ? "planTotal"
      : structuredRateTable
        ? "structured"
        : "coverageUnit";

  return {
    code,
    aliases: Array.isArray(item.aliases) ? item.aliases.map((alias) => String(alias).trim()).filter(Boolean) : [],
    name,
    insurer,
    category,
    coverage: Math.max(0, coverage),
    planName: plainText(item.planName || item.plan || item.selectedPlan),
    coverageLabel: plainText(item.coverageLabel || item.planLabel || item.coverageDescription),
    planOptions: normalizePlanOptions(item),
    planBenefitTables: normalizePlanBenefitTables(item.planBenefitTables || item.benefitTablesByPlan || item.claimTablesByPlan),
    annualPremium: Math.max(0, toNumber(item.annualPremium || item.premium || item.currentAnnualPremium, 0)),
    endAge,
    endAgeKnown,
    premiumMode,
    rateBasis,
    premiumTerm,
    premiumTermYears,
    availableTerms: Array.isArray(item.availableTerms) ? item.availableTerms.map((term) => String(term).trim()).filter(Boolean) : [],
    growthRate: Math.max(0, toNumber(item.growthRate || item.annualIncreaseRate, 0)),
    premiumChange: String(item.premiumChange || item.premiumDescription || "").trim(),
    premiumBands: normalizePremiumBands(item),
    rateStatus: item.rateStatus || (rateTable.length || structuredRateTable ? "ready" : "missing"),
    ratePricingModel,
    termRatePricingModel: item.termRatePricingModel || "coverageUnit",
    rateUnitCoverage: Math.max(1, toNumber(item.rateUnitCoverage || item.unitCoverage || 1000000, 1000000)),
    rateSource: String(item.rateSource || item.source || item.dataSource || "").trim(),
    rateTable,
    rateTablesByGender,
    termRateTablesByGender: normalizeTermRateTablesByGender(item),
    planRateTablesByGender: normalizePlanRateTablesByGender(item),
    structuredRateTable,
    source: String(item.source || item.dataSource || "匯入商品代號庫").trim(),
    sourceUrl: String(item.sourceUrl || item.productUrl || "").trim(),
    effectiveDate: String(item.effectiveDate || "").trim(),
    contractType: ["main", "rider"].includes(item.contractType) ? item.contractType : "",
    saleStatus: ["active", "discontinued", "unknown"].includes(item.saleStatus) ? item.saleStatus : "unknown",
    saleStatusCheckedAt: String(item.saleStatusCheckedAt || "").trim(),
    popularity: Math.max(0, toNumber(item.popularity || item.monthlyUsers || 0, 0)),
    documents: item.documents && typeof item.documents === "object" ? item.documents : {},
    benefits: normalizeBenefitItems(item.benefits || item.benefitItems || item.claimItems || item.claims),
    purchaseRequirements: normalizePurchaseRequirements(item.purchaseRequirements, item),
    note: String(item.note || item.description || "").trim().slice(0, 240),
  };
}

function invalidateProductCatalogCache() {
  productCatalogCache = null;
  productCatalogCodeIndex = null;
}

function productCatalogIdentity(product) {
  return `${normalizeProductCode(product?.code)}|${normalizedProductIdentityText(product?.insurer)}`;
}

function getProductCatalog() {
  if (productCatalogCache) return productCatalogCache;
  const custom = Array.isArray(store.productCatalog) ? store.productCatalog : [];
  const merged = new Map();
  [...builtinProductCatalog, ...externalProductCatalog, ...custom].forEach((item) => {
    const product = normalizeCatalogItem(item);
    const key = productCatalogIdentity(product);
    if (key && product.name) merged.set(key, product);
  });
  productCatalogCache = Array.from(merged.values());
  productCatalogCodeIndex = new Map();
  productCatalogCache.forEach((product) => {
    [product.code, ...(product.aliases || [])].forEach((code) => {
      const normalized = normalizeProductCode(code);
      if (!normalized) return;
      const matches = productCatalogCodeIndex.get(normalized) || [];
      matches.push(product);
      productCatalogCodeIndex.set(normalized, matches);
    });
  });
  return productCatalogCache;
}

async function loadExternalProductCatalog() {
  if (location.protocol === "file:") return;
  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    externalCatalogMeta = {
      updatedAt: payload.updatedAt || "",
      sourceStatus: payload.sourceStatus || "",
      sourceNote: payload.sourceNote || payload.coverageNote || "",
      officialQueryUrl: payload.officialQueryUrl || OFFICIAL_PRODUCT_QUERY_URL,
      unresolvedCodeExamples: Array.isArray(payload.unresolvedCodeExamples) ? payload.unresolvedCodeExamples : [],
    };
    externalProductCatalog = extractCatalogRows(payload).map(normalizeCatalogItem).filter((item) => item.code && item.name);
    invalidateProductCatalogCache();
  } catch {
    externalCatalogMeta = {};
    externalProductCatalog = [];
    invalidateProductCatalogCache();
  }
}

function findProductsByCode(code) {
  const normalized = normalizeProductCode(code);
  if (!normalized) return [];
  getProductCatalog();
  return [...new Map((productCatalogCodeIndex.get(normalized) || [])
    .map((product) => [productCatalogIdentity(product), product])).values()]
    .sort((a, b) => Number(b.rateStatus === "ready") - Number(a.rateStatus === "ready")
      || Number(b.saleStatus === "active") - Number(a.saleStatus === "active")
      || String(b.effectiveDate || "").localeCompare(String(a.effectiveDate || "")));
}

function findProductByCode(code, options = {}) {
  const matches = findProductsByCode(code);
  const sourceUrl = plainText(options.sourceUrl);
  const insurer = normalizedProductIdentityText(options.insurer);
  return matches.find((product) => sourceUrl && product.sourceUrl === sourceUrl)
    || matches.find((product) => insurer && normalizedProductIdentityText(product.insurer) === insurer)
    || matches[0]
    || null;
}

function selectedFormProduct() {
  const input = $("#productCode");
  return findProductByCode(input?.value, {
    sourceUrl: input?.dataset.sourceUrl,
    insurer: $("#insurer")?.value,
  });
}

function premiumChangeLabel(product) {
  if (product.premiumChange) return product.premiumChange;
  if (product.premiumMode === "ageBand") return "按年齡級距調整，通常年齡越高保費越高。";
  if (product.premiumMode === "annualGrowth") return `每年約增加 ${product.growthRate || 0}%。`;
  return "固定保費或以商品條款所載費率為準。";
}

function setPremiumModeField(mode = "level", growthRate = 0) {
  const normalizedMode = ["level", "ageBand", "annualGrowth"].includes(mode) ? mode : "level";
  const hidden = $("#premiumMode");
  const display = $("#premiumModeDisplay");
  const growthInput = $("#growthRate");
  const growthField = $("#growthRateField");
  if (hidden) hidden.value = normalizedMode;
  if (display) display.value = premiumModeLabel({ premiumMode: normalizedMode, growthRate });
  if (growthInput) growthInput.value = growthRate || "";
  if (growthField) growthField.hidden = normalizedMode !== "annualGrowth";
}

function catalogStatusText() {
  const imported = Array.isArray(store.productCatalog) ? store.productCatalog.length : 0;
  const total = getProductCatalog().length;
  return `目前可查 ${total} 筆商品代號，其中 ${imported} 筆為匯入資料。`;
}

function catalogSourceText() {
  const parts = [];
  if (externalCatalogMeta.updatedAt) parts.push(`資料庫更新日：${externalCatalogMeta.updatedAt}`);
  if (externalCatalogMeta.sourceStatus === "partial") parts.push("目前為部分資料庫");
  if (externalCatalogMeta.sourceNote) parts.push(externalCatalogMeta.sourceNote);
  return parts.filter(Boolean).join("｜");
}

function productPolicyNote(product) {
  const terms = productPremiumTerms(product);
  let note = terms.length > 1 && product.premiumTerm
    ? String(product.note || "").split(product.premiumTerm).join(`可選繳費年期：${terms.join("、")}`)
    : product.note;
  productPlanOptions(product).forEach((plan) => {
    note = String(note || "").split(plan).join("");
  });
  note = String(note || "")
    .replace(/；\s*；/g, "；")
    .replace(/[；;｜]\s*$/g, "")
    .trim();
  return [
    coverageLabelFor(product) ? `方案／計畫別：${coverageLabelFor(product)}` : "",
    note,
    product.premiumChange ? `保費變化：${product.premiumChange}` : "",
    product.source ? `資料來源：${product.source}` : "",
  ].filter(Boolean).join("｜").slice(0, 240);
}

function setProductCodeStatus(message, type = "idle") {
  const status = $("#productCodeStatus");
  if (!status) return;
  status.textContent = message;
  status.className = `field-hint ${type}`;
}

function productCodeTokens(product) {
  return [product.code, ...(product.aliases || [])]
    .map(normalizeProductCode)
    .filter(Boolean);
}

function productSuggestionStatus(product) {
  const rateRows = rateRowCount(product);
  const status = product.rateStatus === "ready" && rateRows
    ? `${rateRows} 筆費率`
    : product.rateStatus === "index-only"
      ? "選取後查費率"
      : "基本資料";
  return product.saleStatus === "discontinued" ? `停售｜${status}` : status;
}

function saleStatusLabel(product) {
  if (product.saleStatus === "active") return "現售";
  if (product.saleStatus === "discontinued") return "停售";
  return "待確認";
}

function productCodeSuggestions(query) {
  const normalized = normalizeProductCode(query);
  if (!normalized) return [];

  const seen = new Set();
  return getProductCatalog()
    .map((product) => {
      const tokens = productCodeTokens(product);
      const exact = tokens.find((token) => token === normalized);
      const prefix = tokens.find((token) => token.startsWith(normalized));
      const contains = tokens.find((token) => token.includes(normalized));
      const textMatch = `${product.name} ${product.insurer}`.toUpperCase().includes(normalized);
      const matchedCode = exact || prefix || contains || product.code;
      if (!exact && !prefix && !contains && !textMatch) return null;
      const score = (exact ? 0 : prefix ? 1 : contains ? 2 : 3)
        + Math.min(String(matchedCode).length, 12) / 100
        - (product.rateStatus === "ready" ? 0.05 : 0);
      return { product, matchedCode, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.matchedCode.localeCompare(b.matchedCode, "en"))
    .filter(({ product }) => {
      const key = productCatalogIdentity(product);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function hideProductCodeSuggestions() {
  const list = $("#productCodeSuggestions");
  const input = $("#productCode");
  if (list) {
    list.hidden = true;
    list.innerHTML = "";
  }
  if (input) input.setAttribute("aria-expanded", "false");
  productCodeSuggestionIndex = -1;
}

function renderProductCodeSuggestions() {
  const list = $("#productCodeSuggestions");
  const input = $("#productCode");
  if (!list || !input) return [];

  const suggestions = productCodeSuggestions(input.value);
  if (!suggestions.length) {
    hideProductCodeSuggestions();
    return [];
  }

  productCodeSuggestionIndex = clamp(productCodeSuggestionIndex, 0, suggestions.length - 1);
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  list.innerHTML = suggestions.map(({ product, matchedCode }, index) => `
    <button type="button" class="product-suggestion ${index === productCodeSuggestionIndex ? "active" : ""}" role="option" aria-selected="${index === productCodeSuggestionIndex ? "true" : "false"}" data-code="${escapeHtml(product.code)}" data-source-url="${escapeHtml(product.sourceUrl || "")}">
      <span class="suggestion-code">${escapeHtml(matchedCode)}</span>
      <span class="suggestion-main">
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.insurer)}｜${product.endAgeKnown ? `保障到 ${product.endAge} 歲` : "保障年齡待查"}</span>
      </span>
      <span class="suggestion-status">${escapeHtml(productSuggestionStatus(product))}</span>
    </button>
  `).join("");
  return suggestions;
}

function liveLookupKey(code, sourceUrl, age, gender, plan = "") {
  return [normalizeProductCode(code), sourceUrl || "search", age, gender, plainText(plan) || "default"].join("|");
}

async function fetchLiveProductDetails(code, sourceUrl = "", plan = "") {
  if (location.protocol === "file:") return null;
  const normalized = normalizeProductCode(code);
  if (!normalized) return null;
  const age = clamp(toNumber($("#insuredCurrentAge")?.value || store.profile.age, defaultProfile.age), 0, 100);
  const gender = normalizedGender($("#insuredGender")?.value || "male");
  const selectedPlan = plainText(plan);
  const key = liveLookupKey(normalized, sourceUrl, age, gender, selectedPlan);
  if (liveProductLookups.has(key)) return liveProductLookups.get(key);

  const request = (async () => {
    try {
      const params = new URLSearchParams({ code: normalized, age: String(age), gender });
      if (sourceUrl) params.set("source", sourceUrl);
      if (selectedPlan) params.set("plan", selectedPlan);
      const response = await fetch(`/api/product?${params}`, { headers: { accept: "application/json" } });
      if (!response.ok) return null;
      const payload = await response.json();
      const rawProduct = payload.product || payload;
      const product = normalizeCatalogItem(selectedPlan && rawProduct?.rateTablesByGender
        ? {
          ...rawProduct,
          planRateTablesByGender: {
            ...(rawProduct.planRateTablesByGender || {}),
            [selectedPlan]: rawProduct.rateTablesByGender,
          },
        }
        : rawProduct);
      if (!product.code || !product.name) return null;
      externalProductCatalog = mergeProductCatalog(externalProductCatalog, [product]);
      invalidateProductCatalogCache();
      return findProductByCode(product.code, { sourceUrl: product.sourceUrl, insurer: product.insurer }) || product;
    } catch {
      return null;
    } finally {
      liveProductLookups.delete(key);
    }
  })();
  liveProductLookups.set(key, request);
  return request;
}

async function ensureProductDetails(product, plan = "") {
  if (!product) return null;
  const selected = plainText(plan);
  if (selected && productPlanOptions(product).length > 1 && !planLabelMatches(selected, product.planName || product.coverageLabel)) {
    const hasSelectedBenefits = benefitsForPlan(product, selected).length > 0;
    const hasSelectedRates = rateTableForGender(
      product,
      normalizedGender($("#insuredGender")?.value || store.profile.gender),
      "",
      selected,
    ).length > 0;
    if (hasSelectedBenefits && hasSelectedRates) return product;
    return await fetchLiveProductDetails(product.code, product.sourceUrl, selected) || product;
  }
  if (product.rateStatus === "ready" && rateRowCount(product)) return product;
  return await fetchLiveProductDetails(product.code, product.sourceUrl, selected) || product;
}

async function selectProductCodeSuggestion(code, sourceUrl = "") {
  const indexedProduct = findProductByCode(code, { sourceUrl });
  if (!indexedProduct) return false;
  $("#productCode").value = indexedProduct.code;
  $("#productCode").dataset.sourceUrl = indexedProduct.sourceUrl || "";
  setProductCodeStatus(`正在查詢：${indexedProduct.name}｜${indexedProduct.insurer}`, "idle");
  const product = await ensureProductDetails(indexedProduct);
  if (!product || normalizeProductCode($("#productCode").value) !== normalizeProductCode(code)) return false;
  applyProductToForm(product, { scroll: false, toast: true });
  if ($("#lookupCode")) $("#lookupCode").value = product.code;
  lastLookupQuery = product.code;
  hideProductCodeSuggestions();
  renderProductLookup();
  renderRatePreview({ updatePremium: true });
  return true;
}

function renderPlanOptions(product, selected = "") {
  const select = $("#planNameSelect");
  const input = $("#planName");
  const hint = $("#planNameHint");
  if (!select || !input) return plainText(selected);

  const options = productPlanOptions(product);
  const selectedLabel = selectedPlanLabel(product, selected);
  select.replaceChildren();

  if (options.length > 1) {
    options.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan;
      option.textContent = plan;
      select.append(option);
    });
    const value = options.find((plan) => planLabelMatches(plan, selectedLabel)) || options[0] || selectedLabel;
    select.value = value;
    input.value = value;
    select.hidden = false;
    input.hidden = true;
    if (hint) {
      hint.textContent = `可選 ${options.length} 種方案；切換後會重新帶入該方案保費與理賠限額。`;
      hint.className = "field-hint success";
    }
    return value;
  }

  select.hidden = true;
  input.hidden = false;
  input.value = selectedLabel || input.value || "";
  if (hint) {
    hint.textContent = product?.code ? "此商品目前沒有公開方案清單，會以商品頁或條款解析結果為準。" : "有公開方案資料時可直接選擇。";
    hint.className = "field-hint";
  }
  return input.value;
}

function applyProductToForm(product, options = {}) {
  const { scroll = true, toast = true, selectedPlan = "" } = options;
  const currentYear = currentCalendarYear();
  const planLabel = selectedPlanLabel(product, selectedPlan || $("#planName")?.value || coverageLabelFor(product));
  const planCoverageWan = coverageWanFromLabel(planLabel);
  $("#productCode").value = product.code;
  $("#productCode").dataset.sourceUrl = product.sourceUrl || "";
  $("#policyName").value = product.name;
  $("#insurer").value = product.insurer;
  $("#category").value = product.category;
  $("#coverageWan").value = planCoverageWan || (product.coverage ? Math.round(product.coverage / 1000) / 10 : "");
  renderPlanOptions(product, planLabel);
  $("#annualPremium").value = product.annualPremium || "";
  $("#endAge").value = product.endAgeKnown ? (product.endAge || "") : "";
  setPremiumModeField(product.premiumMode, product.growthRate || 0);
  if ($("#insuredGender") && !$("#insuredGender").value) $("#insuredGender").value = policyGender({});
  if ($("#occupationClass") && !$("#occupationClass").value) $("#occupationClass").value = "1";
  if (!$("#insuredCurrentAge").value) $("#insuredCurrentAge").value = store.profile.age || defaultProfile.age;
  if ($("#policyStartYear") && !$("#policyStartYear").value) $("#policyStartYear").value = currentYear;
  const formCurrentAge = toNumber($("#insuredCurrentAge").value, store.profile.age);
  const formStartAge = policyStartAgeFromYear(formCurrentAge, $("#policyStartYear")?.value || currentYear, currentYear);
  const formRateAge = product.rateBasis === "issueAge" ? formStartAge : formCurrentAge;
  const formGender = normalizedGender($("#insuredGender")?.value || store.profile.gender);
  const formPremiumTerm = suitablePremiumTerm(product, formRateAge, formGender, product.premiumTerm, planLabel);
  renderPremiumTermOptions(product, formPremiumTerm || product.premiumTerm);
  $("#policyStartAge").value = formStartAge;
  $("#policyNote").value = productPolicyNote({ ...product, planName: planLabel, coverageLabel: planLabel });
  $("#savePolicyButton").textContent = $("#policyId").value ? "更新保單" : "儲存保單";
  setProductCodeStatus(`已帶入：${product.name}｜${product.insurer}`, "success");
  hideProductCodeSuggestions();
  renderRatePreview({ updatePremium: true });
  if (scroll) $(".policy-editor").scrollIntoView({ behavior: "smooth", block: "start" });
  if (toast) showToast("已帶入商品資料");
}

async function lookupPolicyProductCode(options = {}) {
  const { showMissing = false } = options;
  const code = $("#productCode").value.trim();
  const normalizedCode = normalizeProductCode(code);
  if (!normalizedCode) return false;

  const exactMatches = findProductsByCode(normalizedCode);
  if (exactMatches.length > 1 && !$("#productCode").dataset.sourceUrl) {
    renderProductCodeSuggestions();
    setProductCodeStatus(`代號「${normalizedCode}」有 ${exactMatches.length} 家公司的商品，請從下拉選單選擇公司。`, "warning");
    return false;
  }

  let product = selectedFormProduct();
  if (!product && showMissing) {
    setProductCodeStatus(`正在搜尋「${normalizedCode}」的公開商品資料...`, "idle");
    product = await fetchLiveProductDetails(normalizedCode);
  }
  if (!product) {
    if (showMissing) $("#productCode").value = normalizedCode;
    if (showMissing) {
      setProductCodeStatus(`目前找不到「${normalizedCode}」。系統已查過每週全量索引及即時公開資料。`, "warning");
      showToast(`找不到商品代號：${normalizedCode}`);
    } else {
      setProductCodeStatus(`會以「${normalizedCode}」比對商品資料。`, "idle");
    }
    return false;
  }

  setProductCodeStatus(`正在補齊：${product.name}｜${product.insurer}`, "idle");
  product = await ensureProductDetails(product);
  if (normalizeProductCode($("#productCode").value) !== normalizedCode) return false;
  applyProductToForm(product, { scroll: false, toast: true });
  if ($("#lookupCode")) $("#lookupCode").value = product.code;
  lastLookupQuery = product.code;
  renderProductLookup();
  return true;
}

function ageFactor(age) {
  if (age < 30) return 1;
  if (age < 35) return 1.16;
  if (age < 40) return 1.38;
  if (age < 45) return 1.78;
  if (age < 50) return 2.28;
  if (age < 55) return 2.95;
  if (age < 60) return 3.85;
  if (age < 65) return 5.1;
  if (age < 70) return 6.85;
  return 8.4;
}

function policyCurrentAge(policy) {
  const person = insuredPersonById(policy.owner);
  return clamp(toNumber(policy.currentAge ?? policy.insuredCurrentAge ?? person?.currentAge ?? store.profile.age, defaultProfile.age), 0, 100);
}

function policyStartYear(policy) {
  const currentAge = policyCurrentAge(policy);
  if (policy.startYear || policy.policyStartYear) {
    return normalizedStartYear(policy.startYear || policy.policyStartYear);
  }
  return policyStartYearFromAges(currentAge, policyStartAge(policy));
}

function policyStartAge(policy) {
  const currentAge = policyCurrentAge(policy);
  if (policy.startAge || policy.policyStartAge) {
    return clamp(toNumber(policy.startAge || policy.policyStartAge, currentAge), 0, 100);
  }
  if (policy.startYear || policy.policyStartYear) {
    return policyStartAgeFromYear(currentAge, policy.startYear || policy.policyStartYear);
  }
  return currentAge;
}

function productForPolicy(policy) {
  return policy.productCode ? findProductByCode(policy.productCode, {
    sourceUrl: policy.sourceUrl,
    insurer: policy.insurer,
  }) : null;
}

function planRateTablesFor(product, planLabel = "") {
  const tables = product?.planRateTablesByGender || {};
  const selected = plainText(planLabel);
  if (!selected) return null;
  const exact = tables[selected];
  if (exact && Object.keys(exact).length) return exact;
  const match = Object.entries(tables).find(([plan]) => planLabelMatches(plan, selected));
  return match?.[1] || null;
}

function rateTableForGender(product, gender, premiumTerm = "", planLabel = "") {
  const key = normalizedGender(gender);
  const selectedTerm = matchedPremiumTerm(product, premiumTerm);
  const termTables = selectedTerm ? product?.termRateTablesByGender?.[selectedTerm] : null;
  const planTables = planRateTablesFor(product, planLabel);
  const tables = planTables && Object.keys(planTables).length
    ? planTables
    : termTables && Object.keys(termTables).length
      ? termTables
      : product?.rateTablesByGender || {};
  return tables[key]?.length
    ? tables[key]
    : tables.male?.length
      ? tables.male
      : product?.rateTable || [];
}

function hasRateTable(product, gender, premiumTerm = "", planLabel = "") {
  return rateTableForGender(product, gender, premiumTerm, planLabel).length > 0;
}

function rateRowForAge(product, age, gender, premiumTerm = "", planLabel = "") {
  const rows = rateTableForGender(product, gender, premiumTerm, planLabel);
  if (!rows.length) return null;
  const bounds = rateTableAgeBounds(rows);
  if (!bounds || age < bounds.min || age > bounds.max) return null;
  return rows.find((row) => row.age === age)
    || [...rows].reverse().find((row) => row.age <= age)
    || null;
}

function premiumFromRateTable(product, policy, yearsFromNow = 0) {
  const age = policyCurrentAge(policy) + yearsFromNow;
  const issueAge = policyStartAge(policy);
  const endAge = toNumber(policy.endAge || product.endAge, 100);
  if (age > endAge) return null;
  const premiumTerm = premiumTermForPolicy(product, policy);
  const premiumTermYears = termYears(premiumTerm) || toNumber(product.premiumTermYears, 0);
  if (product.rateBasis === "issueAge" && premiumTermYears > 0) {
    const elapsedPolicyYears = age - issueAge;
    if (elapsedPolicyYears < 0) return null;
    if (elapsedPolicyYears >= premiumTermYears) return 0;
  }
  const rateAge = product.rateBasis === "issueAge" ? issueAge : age;
  const planLabel = plainText(policy.coverageLabel || policy.planName);
  const row = rateRowForAge(product, rateAge, policyGender(policy), premiumTerm, planLabel);
  if (!row) return null;
  const coverage = Math.max(0, toNumber(policy.coverage || product.coverage, 0));
  const matchedTerm = matchedPremiumTerm(product, premiumTerm);
  const hasTermTable = Boolean(matchedTerm && Object.keys(product?.termRateTablesByGender?.[matchedTerm] || {}).length);
  const pricingModel = hasTermTable
    ? product.termRatePricingModel || "coverageUnit"
    : product.ratePricingModel || "coverageUnit";
  const units = pricingModel === "planTotal"
    ? 1
    : coverage > 0
      ? coverage / product.rateUnitCoverage
      : 1;
  return row.premium * units;
}

function hasStructuredRateTable(product) {
  return Boolean(product?.structuredRateTable?.rows?.length);
}

function premiumFromStructuredRateTable(product, policy, yearsFromNow = 0) {
  const table = product?.structuredRateTable;
  if (!table?.rows?.length) return null;
  const age = policyCurrentAge(policy) + yearsFromNow;
  const endAge = toNumber(policy.endAge || product.endAge, 100);
  if (age > endAge) return null;
  const occupationClass = policyOccupationClass(policy);
  const classKey = `class${occupationClass}`;
  const fallbackKey = "class1";
  const coverageWan = Math.max(0, toNumber(policy.coverage || product.coverage, 0) / 10000);

  if (table.kind === "unitOccupation") {
    const row = table.rows[0];
    const premiumPerWan = toNumber(row.premiums?.[classKey] ?? row.premiums?.[fallbackKey], 0);
    return premiumPerWan > 0 ? premiumPerWan * Math.max(1, coverageWan || row.coverageWan || 1) : null;
  }

  const rows = [...table.rows].sort((a, b) => a.coverageWan - b.coverageWan);
  const target = coverageWan || rows[0]?.coverageWan || 0;
  const row = rows.find((item) => item.coverageWan >= target) || rows.at(-1);
  const premium = toNumber(row?.premiums?.[classKey] ?? row?.premiums?.[fallbackKey], 0);
  return premium > 0 ? premium : null;
}

function premiumAt(policy, yearsFromNow) {
  const product = productForPolicy(policy);
  const premiumTerm = premiumTermForPolicy(product, policy);
  const tablePremium = product?.rateStatus === "ready" && hasRateTable(
    product,
    policyGender(policy),
    premiumTerm,
    policy.coverageLabel || policy.planName,
  )
    ? premiumFromRateTable(product, policy, yearsFromNow)
    : null;
  if (tablePremium != null) return tablePremium;

  const structuredPremium = product?.rateStatus === "ready" && hasStructuredRateTable(product)
    ? premiumFromStructuredRateTable(product, policy, yearsFromNow)
    : null;
  if (structuredPremium != null) return structuredPremium;

  const currentAge = policyCurrentAge(policy);
  const futureAge = currentAge + yearsFromNow;
  const endAge = toNumber(policy.endAge, 100);
  if (futureAge > endAge) return 0;

  const base = toNumber(policy.annualPremium, 0);
  if (policy.premiumMode === "ageBand") {
    return base * (ageFactor(futureAge) / ageFactor(currentAge));
  }
  if (policy.premiumMode === "annualGrowth") {
    return base * Math.pow(1 + toNumber(policy.growthRate, 0) / 100, yearsFromNow);
  }
  return base;
}

function forecast(years = toNumber(store.profile.horizon, 20)) {
  return Array.from({ length: years + 1 }, (_, index) => ({
    year: index,
    age: toNumber(store.profile.age, defaultProfile.age) + index,
    premium: store.policies.reduce((sum, policy) => sum + premiumAt(policy, index), 0),
  }));
}

function currentCoverage() {
  const coverage = Object.fromEntries(Object.keys(categoryLabels).map((key) => [key, 0]));
  for (const policy of store.policies) {
    coverage[policy.category] = (coverage[policy.category] || 0) + toNumber(policy.coverage, 0);
  }
  return coverage;
}

function incomeReplacementYears(age, dependents) {
  if (dependents <= 0) return 0;
  if (age < 35) return 10;
  if (age < 45) return 8;
  if (age < 55) return 5;
  if (age < 65) return 3;
  return 1;
}

function targetCoverage() {
  const profile = store.profile;
  const age = toNumber(profile.age, defaultProfile.age);
  const income = toNumber(profile.annualIncome, 0);
  const dependents = toNumber(profile.dependents, 0);
  const debt = toNumber(profile.debt, 0);
  const dependentLoad = dependents > 0 ? 1 + Math.min(3, dependents - 1) * .15 : 0;
  const lifeIncomeNeed = income * incomeReplacementYears(age, dependents) * dependentLoad;
  const workingYears = age < 65 ? Math.min(5, 65 - age) : 0;
  const disabilityIncomeNeed = income * workingYears * (dependents > 0 ? 1 : .6);
  const criticalIncomeNeed = age < 65 ? income * (dependents > 0 ? 2 : 1) : 0;
  const longCareYears = age < 50 ? 3 : age < 70 ? 5 : 6;

  return {
    life: Math.round(debt + 500000 + lifeIncomeNeed),
    medical: age < 40 ? 300000 : age < 65 ? 500000 : 700000,
    critical: Math.round(Math.max(age < 65 ? 800000 : 500000, criticalIncomeNeed + 300000)),
    accident: age >= 70 ? 1000000 : dependents > 0 ? 2000000 : 1000000,
    disability: Math.round(age < 65 ? Math.max(1000000, disabilityIncomeNeed + debt * .35) : 500000),
    longcare: 50000 * 12 * longCareYears,
  };
}

function assess() {
  const coverage = currentCoverage();
  const target = targetCoverage();
  const rows = Object.keys(coveragePriorities).map((category) => {
    const current = coverage[category] || 0;
    const needed = target[category] || 1;
    const ratio = clamp(current / needed, 0, 1.25);
    return {
      category,
      label: categoryLabels[category],
      current,
      target: needed,
      gap: Math.max(0, needed - current),
      ratio,
      priority: coveragePriorities[category],
    };
  });

  const annualBudget = toNumber(store.profile.monthlyBudget, 0) * 12;
  const annualPremium = forecast(0)[0].premium;

  return {
    rows,
    coverage,
    target,
    annualBudget,
    annualPremium,
  };
}

function estimateCatalogPremium(product, units = 1) {
  const age = toNumber(store.profile.age, defaultProfile.age);
  const ageLoad = product.category === "accident" ? 1 : ageFactor(age) / ageFactor(35);
  return product.basePremium * units * ageLoad;
}

function recommendationPremium(product, ownerId = recommendationOwnerId()) {
  const person = insuredPersonById(ownerId);
  const currentAge = clamp(toNumber(person?.currentAge ?? store.profile.age, defaultProfile.age), 0, 100);
  const gender = normalizedGender(person?.gender || store.profile.gender);
  const planName = selectedPlanLabel(product);
  const requestedTerm = matchedPremiumTerm(product, product.premiumTerm) || productPremiumTerms(product).at(-1) || "";
  const premiumTerm = suitablePremiumTerm(product, currentAge, gender, requestedTerm, planName);
  if (productPremiumTerms(product).length && !premiumTerm) return 0;
  const policy = {
    productCode: product.code,
    owner: ownerId,
    gender,
    occupationClass: policyOccupationClass({ occupationClass: person?.occupationClass || 1 }),
    currentAge,
    startAge: currentAge,
    startYear: currentCalendarYear(),
    coverage: product.coverage,
    endAge: product.endAge,
    premiumTerm,
    premiumTermYears: termYears(premiumTerm) || product.premiumTermYears,
    planName,
    coverageLabel: planName,
  };
  if (product.rateStatus === "ready" && hasRateTable(product, policy.gender, policy.premiumTerm, policy.planName)) {
    return premiumFromRateTable(product, policy, 0) || 0;
  }
  if (product.rateStatus === "ready" && hasStructuredRateTable(product)) {
    return premiumFromStructuredRateTable(product, policy, 0) || 0;
  }
  return toNumber(product.annualPremium, 0);
}

function recommendationRelevance(product, category) {
  const text = `${product.name} ${product.note}`;
  if (category === "critical") {
    if (/重大傷病/.test(text)) return 1;
    if (/重大疾病/.test(text)) return .9;
    if (/癌症|防癌/.test(text)) return .72;
  }
  if (category === "medical") {
    if (/實支實付|醫療費用/.test(text) && !/傷害/.test(text)) return 1;
    if (/住院|手術/.test(text) && !/傷害/.test(text)) return .82;
    if (/傷害醫療|意外實支/.test(text)) return 0;
  }
  if (category === "accident" && /傷害|意外/.test(text)) return 1;
  if (category === "life" && /定期壽險/.test(text)) return 1;
  if (category === "disability" && /失能|殘廢/.test(text)) return 1;
  if (category === "longcare" && /長照|長期照顧/.test(text)) return 1;
  return product.category === category ? .65 : 0;
}

function meaningfulRecommendationImpact(gap, coverage) {
  if (!gap?.gap || coverage <= 0) return false;
  const gapRatio = coverage / gap.gap;
  if (["life", "disability", "longcare"].includes(gap.category)) {
    return gapRatio >= .1 || coverage >= 1000000;
  }
  if (gap.category === "critical") return gapRatio >= .05 || coverage >= 500000;
  if (gap.category === "medical") return gapRatio >= .2;
  if (gap.category === "accident") return gapRatio >= .1;
  return gapRatio >= .05;
}

function normalizedProductIdentityText(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLocaleLowerCase("zh-TW");
}

function sameInsurer(left, right) {
  const normalizedLeft = normalizedProductIdentityText(left);
  const normalizedRight = normalizedProductIdentityText(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function productContractType(product) {
  if (product?.contractType === "main" || product?.contractType === "rider") return product.contractType;
  const text = `${product?.name || ""} ${product?.note || ""}`;
  if (/附約|附加條款/.test(text)) return "rider";
  return "main";
}

function isRiderProduct(product) {
  return productContractType(product) === "rider";
}

function recommendationOwnerId() {
  const requested = $("#policyOwner")?.value || store.lastPolicyOwner || "self";
  return insuredPersonById(requested) ? requested : "self";
}

function policyContractType(policy) {
  const catalogProduct = findProductByCode(policy?.productCode);
  if (catalogProduct) return productContractType(catalogProduct);
  return /附約|附加條款/.test(`${policy?.name || ""} ${policy?.note || ""}`) ? "rider" : "main";
}

function purchaseRequirementsForProduct(product) {
  return normalizePurchaseRequirements(product?.purchaseRequirements, product || {});
}

function purchaseRequirementsForPolicy(policy = {}) {
  const product = productForPolicy(policy);
  const policyRequirements = normalizePurchaseRequirements(policy.purchaseRequirements, policy);
  return policyRequirements.length ? policyRequirements : purchaseRequirementsForProduct(product);
}

function requirementProduct(requirement) {
  return requirement?.code ? findProductByCode(requirement.code) : null;
}

function requirementDisplayName(requirement) {
  const product = requirementProduct(requirement);
  const code = normalizeProductCode(requirement?.code || product?.code || "");
  const name = plainText(requirement?.name || product?.name || "");
  return [code, name].filter(Boolean).join(" ");
}

function requirementTimingLabel(requirement) {
  const timing = plainText(requirement?.timing || "");
  if (timing === "sameTime") return "需同時投保";
  if (timing === "before") return "需先投保";
  return "需搭配投保";
}

function policyMatchesRequirement(policy, requirement) {
  const requiredCode = normalizeProductCode(requirement?.code || "");
  const policyCode = normalizeProductCode(policy?.productCode || "");
  if (requiredCode && policyCode === requiredCode) return true;
  const product = productForPolicy(policy);
  const requiredName = normalizedProductIdentityText(requirement?.name || requirementProduct(requirement)?.name);
  if (!requiredName) return false;
  return [
    policy?.name,
    product?.name,
  ].some((name) => normalizedProductIdentityText(name) === requiredName);
}

function ownedPolicyForRequirement(requirement, ownerId, currentPolicyId = "") {
  return store.policies.find((policy) => (
    policy.id !== currentPolicyId
    && String(policy.owner || "self") === String(ownerId || "self")
    && policyMatchesRequirement(policy, requirement)
  )) || null;
}

function renderPurchaseRequirements(policy = {}) {
  const requirements = purchaseRequirementsForPolicy(policy);
  if (!requirements.length) return "";
  const ownerId = policy.owner || "self";
  return `
    <div class="purchase-requirements">
      <strong>投保搭配條件</strong>
      ${requirements.map((requirement) => {
        const owned = ownedPolicyForRequirement(requirement, ownerId, policy.id);
        const product = requirementProduct(requirement);
        const link = product?.sourceUrl
          ? `<a href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noreferrer">查看 ${escapeHtml(product.code)}</a>`
          : "";
        return `
          <div class="purchase-requirement ${owned ? "is-met" : "is-missing"}">
            <span>${owned ? "已記錄" : "尚未記錄"}</span>
            <p>
              <b>${escapeHtml(requirementTimingLabel(requirement))}：${escapeHtml(requirementDisplayName(requirement) || "指定商品")}</b>
              ${requirement.note ? `<small>${escapeHtml(requirement.note)}</small>` : ""}
              ${owned ? `<small>此被保險人已有 ${escapeHtml(owned.productCode || owned.name)}。</small>` : `<small>儲存此商品時，系統會保留這筆搭配條件；請確認同一被保險人的保單清單中也有對應商品。</small>`}
              ${link}
            </p>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function ownedMainPlanForInsurer(insurer, ownerId) {
  return store.policies.find((policy) => (
    String(policy.owner || "self") === String(ownerId || "self")
    && sameInsurer(policy.insurer, insurer)
    && policyContractType(policy) === "main"
  )) || null;
}

function mainPlanPlanningDetails(product, ownerId) {
  const defaults = mainPlanPlanningDefaults[normalizeProductCode(product?.code)] || {};
  const premium = recommendationPremium(product, ownerId);
  return {
    product,
    coverage: Math.max(0, toNumber(product?.coverage, 0), toNumber(defaults.coverage, 0)),
    premium: Math.max(0, premium),
    planLabel: defaults.planLabel || "依商品最低承保額度規劃",
    note: defaults.note || "主約保費已依商品公開費率與目前被保險人條件計算，實際承保仍以保險公司為準。",
  };
}

function sortedMainPlanCandidates(insurer) {
  const preferred = preferredMainPlanCodes[insurer] || [];
  return getProductCatalog()
    .filter((product) => sameInsurer(product.insurer, insurer))
    .filter((product) => !isRiderProduct(product))
    .filter((product) => product.saleStatus !== "discontinued")
    .filter((product) => /^https:\/\/finfo\.tw\/products\//i.test(product.sourceUrl))
    .sort((a, b) => {
      const preferredA = preferred.indexOf(normalizeProductCode(a.code));
      const preferredB = preferred.indexOf(normalizeProductCode(b.code));
      if (preferredA !== preferredB) {
        if (preferredA < 0) return 1;
        if (preferredB < 0) return -1;
        return preferredA - preferredB;
      }
      const activeDifference = Number(b.saleStatus === "active") - Number(a.saleStatus === "active");
      if (activeDifference) return activeDifference;
      const dateDifference = String(b.effectiveDate || "").localeCompare(String(a.effectiveDate || ""));
      if (dateDifference) return dateDifference;
      return b.popularity - a.popularity;
    });
}

function hasPricedMainPlan(product, ownerId) {
  if (!product || product.rateStatus !== "ready") return false;
  const hasRates = rateRowCount(product) > 0 || hasStructuredRateTable(product);
  return hasRates && recommendationPremium(product, ownerId) > 0;
}

function findMainPlanCandidate(insurer, ownerId, options = {}) {
  const { requirePriced = true } = options;
  return sortedMainPlanCandidates(insurer)
    .find((product) => !requirePriced || hasPricedMainPlan(product, ownerId)) || null;
}

function selectedMainPlanForInsurer(selected, insurer) {
  for (const item of selected) {
    if (!isRiderProduct(item.product) && sameInsurer(item.product.insurer, insurer)) return item.product;
    const requirement = item.mainPlanRequirement;
    if (requirement?.product && sameInsurer(requirement.product.insurer, insurer)) return requirement.product;
  }
  return null;
}

function mainPlanRequirementFor(product, selected, ownerId) {
  if (!isRiderProduct(product)) {
    return { mode: "self", product, ownerId };
  }

  const ownedPolicy = ownedMainPlanForInsurer(product.insurer, ownerId);
  if (ownedPolicy) {
    return {
      mode: "owned",
      ownerId,
      policy: ownedPolicy,
      product: findProductByCode(ownedPolicy.productCode),
    };
  }

  const selectedProduct = selectedMainPlanForInsurer(selected, product.insurer);
  if (selectedProduct) {
    if (!hasPricedMainPlan(selectedProduct, ownerId)) return { mode: "missing", ownerId };
    return {
      mode: "planned",
      ownerId,
      ...mainPlanPlanningDetails(selectedProduct, ownerId),
    };
  }

  const mainPlan = findMainPlanCandidate(product.insurer, ownerId);
  if (!mainPlan) return { mode: "missing", ownerId };
  return {
    mode: "recommend",
    ownerId,
    ...mainPlanPlanningDetails(mainPlan, ownerId),
  };
}

function finalizedMainPlanRequirement(item, selected, ownerId) {
  if (!isRiderProduct(item.product)) return { mode: "self", product: item.product, ownerId };
  const ownedPolicy = ownedMainPlanForInsurer(item.product.insurer, ownerId);
  if (ownedPolicy) {
    return {
      mode: "owned",
      ownerId,
      policy: ownedPolicy,
      product: findProductByCode(ownedPolicy.productCode),
    };
  }
  const selectedProduct = selected
    .map((candidate) => candidate.product)
    .find((product) => product !== item.product && !isRiderProduct(product) && sameInsurer(product.insurer, item.product.insurer));
  if (selectedProduct) {
    return {
      mode: "planned",
      ownerId,
      ...mainPlanPlanningDetails(selectedProduct, ownerId),
    };
  }
  return item.mainPlanRequirement;
}

function isOwnedProduct(product) {
  const productCodes = new Set([product.code, ...(product.aliases || [])]
    .map(normalizeProductCode)
    .filter(Boolean));
  const productInsurer = normalizedProductIdentityText(product.insurer);
  const productName = normalizedProductIdentityText(product.name);

  return store.policies.some((policy) => {
    const policyCode = normalizeProductCode(policy.productCode);
    const policyInsurer = normalizedProductIdentityText(policy.insurer);
    const policyName = normalizedProductIdentityText(policy.name);
    const insurerKnown = policyInsurer && policyInsurer !== normalizedProductIdentityText("未填寫");
    const sameCode = policyCode && productCodes.has(policyCode);
    if (sameCode && (!insurerKnown || !productInsurer || policyInsurer === productInsurer)) return true;
    return Boolean(productInsurer && productName && policyInsurer === productInsurer && policyName === productName);
  });
}

function scenarioAddition(product, premium, coverage) {
  return {
    key: `${normalizedProductIdentityText(product?.insurer)}:${normalizeProductCode(product?.code) || normalizedProductIdentityText(product?.name)}`,
    category: product?.category,
    coverage: Math.max(0, toNumber(coverage, 0)),
    premium: Math.max(0, toNumber(premium, 0)),
  };
}

function scenarioAdditionsForItem(item) {
  const additions = [scenarioAddition(item.product, item.premium, item.coverage)];
  const requirement = item.mainPlanRequirement;
  if (isRiderProduct(item.product) && ["recommend", "planned"].includes(requirement?.mode) && requirement.product) {
    additions.unshift(scenarioAddition(
      requirement.product,
      requirement.premium,
      requirement.coverage,
    ));
  }
  return additions;
}

function uniqueScenarioAdditions(additions) {
  const unique = new Map();
  additions.forEach((addition) => {
    if (!addition?.key || unique.has(addition.key)) return;
    unique.set(addition.key, addition);
  });
  return Array.from(unique.values());
}

function projectedAssessment(assessment, additions) {
  const coverage = { ...assessment.coverage };
  let annualPremium = assessment.annualPremium;

  uniqueScenarioAdditions(additions).forEach((addition) => {
    if (coverage[addition.category] != null) {
      coverage[addition.category] += addition.coverage;
    }
    annualPremium += addition.premium;
  });

  const rows = assessment.rows.map((row) => {
    const current = coverage[row.category] || 0;
    const ratio = clamp(current / row.target, 0, 1.25);
    return {
      ...row,
      current,
      gap: Math.max(0, row.target - current),
      ratio,
    };
  });
  return {
    rows,
    coverage,
    annualPremium,
  };
}

function recommendationCandidates(gap, remaining, ownerId = recommendationOwnerId()) {
  const candidates = getProductCatalog()
    .filter((product) => product.category === gap.category)
    .filter((product) => !isOwnedProduct(product))
    .filter((product) => product.saleStatus === "active")
    .filter((product) => product.rateStatus === "ready" && rateRowCount(product) > 0)
    .filter((product) => /^https:\/\/finfo\.tw\/products\//i.test(product.sourceUrl))
    .map((product) => ({
      product,
      premium: recommendationPremium(product, ownerId),
      relevance: recommendationRelevance(product, gap.category),
    }))
    .filter((item) => item.premium > 0 && item.relevance > 0);
  const maxPopularity = Math.max(1, ...candidates.map((item) => item.product.popularity));

  return candidates.map((item) => {
    const coverage = Math.max(0, item.product.coverage);
    const popularityScore = Math.log1p(item.product.popularity) / Math.log1p(maxPopularity);
    const budgetScore = remaining > 0 ? Math.min(1, remaining / item.premium) : 0;
    const coverageScore = gap.gap > 0 ? Math.min(1, coverage / gap.gap) : 1;
    const rankScore = (item.relevance * .35) + (coverageScore * .35) + (budgetScore * .15) + (popularityScore * .15);
    return { ...item, coverage, rankScore };
  }).filter((item) => meaningfulRecommendationImpact(gap, item.coverage))
    .sort((a, b) => b.rankScore - a.rankScore
    || b.product.popularity - a.product.popularity
    || a.premium - b.premium);
}

function recommendationMainPlanLookupKey(product, ownerId) {
  const person = insuredPersonById(ownerId);
  const age = clamp(toNumber(person?.currentAge ?? store.profile.age, defaultProfile.age), 0, 100);
  const gender = normalizedGender(person?.gender || store.profile.gender);
  return `${normalizeProductCode(product.code)}|${age}|${gender}`;
}

async function ensureRecommendationMainPlanRates(assessment, ownerId) {
  if (recommendationMainPlanLookupPromise) return recommendationMainPlanLookupPromise;
  const riderInsurers = [...new Set(assessment.rows.flatMap((gap) => (
    recommendationCandidates(gap, assessment.annualBudget, ownerId)
      .slice(0, 3)
      .filter((item) => isRiderProduct(item.product))
      .map((item) => item.product.insurer)
  )))].filter((insurer) => (
    !ownedMainPlanForInsurer(insurer, ownerId)
    && !findMainPlanCandidate(insurer, ownerId)
  ));
  if (!riderInsurers.length) return null;

  recommendationMainPlanLookupPromise = (async () => {
    let productUpdated = false;
    for (const insurer of riderInsurers) {
      for (const product of sortedMainPlanCandidates(insurer).slice(0, 5)) {
        if (hasPricedMainPlan(product, ownerId)) break;
        const lookupKey = recommendationMainPlanLookupKey(product, ownerId);
        if (recommendationMainPlanLookupAttempts.has(lookupKey)) continue;
        recommendationMainPlanLookupAttempts.add(lookupKey);
        const detailed = await fetchLiveProductDetails(product.code, product.sourceUrl);
        productUpdated ||= Boolean(detailed);
        if (hasPricedMainPlan(detailed, ownerId)) break;
      }
    }
    return productUpdated;
  })().finally(() => {
    recommendationMainPlanLookupPromise = null;
  });

  const productUpdated = await recommendationMainPlanLookupPromise;
  if (productUpdated && recommendationOwnerId() === ownerId) renderRecommendations(assess());
  return productUpdated;
}

function buildRecommendations(assessment) {
  if (assessment.annualBudget <= 0) {
    return {
      remaining: 0,
      used: 0,
      selected: [],
    };
  }

  const priority = store.profile.priority;
  const currentPremium = assessment.annualPremium;
  const remaining = Math.max(0, assessment.annualBudget - currentPremium);
  const softBudget = priority === "lowPremium" ? remaining * .82 : remaining;
  const gaps = assessment.rows
    .filter((row) => row.gap > 0)
    .sort((a, b) => (b.priority * (1 - b.ratio)) - (a.priority * (1 - a.ratio)));

  const selected = [];
  const ownerId = recommendationOwnerId();
  let used = 0;

  for (const gap of gaps) {
    const candidate = recommendationCandidates(gap, Math.max(0, softBudget - used), ownerId)
      .map((item) => ({
        ...item,
        mainPlanRequirement: mainPlanRequirementFor(item.product, selected, ownerId),
      }))
      .find((item) => item.mainPlanRequirement.mode !== "missing");
    if (!candidate) continue;
    const { product, premium, coverage, rankScore, mainPlanRequirement } = candidate;
    const mainPlanPremium = mainPlanRequirement.mode === "recommend" ? mainPlanRequirement.premium : 0;
    const bundlePremium = premium + mainPlanPremium;
    if (bundlePremium + used <= softBudget && bundlePremium + used <= remaining) {
      selected.push({
        product,
        category: gap.category,
        premium,
        coverage,
        rankScore,
        gap,
        ownerId,
        mainPlanRequirement,
      });
      used += bundlePremium;
    }
    if (selected.length >= 4) break;
  }

  const finalizedSelected = selected.map((item) => ({
    ...item,
    mainPlanRequirement: finalizedMainPlanRequirement(item, selected, ownerId),
  }));
  const allAdditions = uniqueScenarioAdditions(finalizedSelected.flatMap(scenarioAdditionsForItem));
  const projected = projectedAssessment(assessment, allAdditions);
  const decoratedSelected = finalizedSelected.map((item) => {
    const itemProjection = projectedAssessment(assessment, scenarioAdditionsForItem(item));
    const projectedRow = itemProjection.rows.find((row) => row.category === item.category);
    return {
      ...item,
      projectedGap: projectedRow?.gap ?? item.gap.gap,
      gapReduction: Math.max(0, item.gap.gap - (projectedRow?.gap ?? item.gap.gap)),
    };
  });

  return {
    remaining,
    used: allAdditions.reduce((sum, addition) => sum + addition.premium, 0),
    selected: decoratedSelected,
    projectedRows: projected.rows,
    ownerId,
  };
}

function expensiveReplacementSignal() {
  const total = forecast(0)[0].premium;
  if (!total) return null;
  const savings = store.policies
    .filter((policy) => policy.category === "savings" && toNumber(policy.annualPremium, 0) > total * .18)
    .sort((a, b) => toNumber(b.annualPremium, 0) - toNumber(a.annualPremium, 0))[0];
  const overBudget = toNumber(store.profile.monthlyBudget, 0) > 0 && total > toNumber(store.profile.monthlyBudget, 0) * 12;

  if (!savings && !overBudget) return null;

  if (savings) {
    return {
      title: "可檢視高保費儲蓄型保單",
      body: `${savings.name} 佔今年保費比重偏高。若你的目標是降低保費並提高保障效率，可和保險專業人士確認是否能降額、減額繳清，或把保障功能改由定期壽險、重大傷病與醫療補強承接。`,
    };
  }

  return {
    title: "目前保費已超出預算",
    body: "建議先保留高風險低保費效率的核心保障，例如定期壽險、醫療、重大傷病、意外與失能，再逐一檢查高保費但保障貢獻較低的保單。",
  };
}

function syncCancerHistoryVisibility(item = store.cancerCase) {
  const hasHistory = item?.hasHistory === "yes";
  const details = $("#cancerHistoryDetails");
  if (details) {
    details.hidden = !hasHistory;
    details.setAttribute("aria-hidden", String(!hasHistory));
  }
  const diagnosisAge = $("#diagnosisAge");
  if (diagnosisAge) diagnosisAge.max = String(toNumber(store.profile.age, defaultProfile.age));
}

function syncCancerForm() {
  const item = { ...defaultCancerCase, ...(store.cancerCase || {}) };
  $("#hasCancerHistory").value = item.hasHistory;
  $("#cancerType").value = item.cancerType;
  $("#diagnosisAge").value = item.diagnosisAge == null ? "" : item.diagnosisAge;
  $("#cancerStage").value = item.stage;
  $("#metastatic").value = item.metastatic;
  $("#treatmentStatus").value = item.treatmentStatus;
  $("#yearsSinceTreatment").value = item.yearsSinceTreatment;
  $("#latestFollowup").value = item.latestFollowup;
  syncCancerHistoryVisibility(item);
}

function collectCancerForm() {
  const diagnosisAge = normalizePersonAge($("#diagnosisAge").value);
  return {
    hasHistory: $("#hasCancerHistory").value,
    cancerType: $("#cancerType").value,
    diagnosisAge: diagnosisAge == null ? null : clamp(diagnosisAge, 0, 90),
    stage: $("#cancerStage").value,
    metastatic: $("#metastatic").value,
    treatmentStatus: $("#treatmentStatus").value,
    yearsSinceTreatment: Math.max(0, toNumber($("#yearsSinceTreatment").value, 0)),
    latestFollowup: $("#latestFollowup").value,
  };
}

function bindCancerForm() {
  syncCancerForm();
  $("#cancerForm").addEventListener("input", (event) => {
    const startingHistory = event.target.id === "hasCancerHistory"
      && event.target.value === "yes"
      && store.cancerCase?.hasHistory !== "yes";
    if (startingHistory) {
      $("#cancerType").value = "";
      $("#diagnosisAge").value = "";
    }
    store.cancerCase = collectCancerForm();
    syncCancerHistoryVisibility(store.cancerCase);
    saveStore();
    renderCancerAssessment();
  });
}

function cancerCaseValidation(item) {
  if (!item || item.hasHistory !== "yes") return [];
  const errors = [];
  const currentAge = toNumber(store.profile.age, defaultProfile.age);
  const diagnosisAge = normalizePersonAge(item.diagnosisAge);
  if (!item.cancerType || !cancerTypeProfiles[item.cancerType]) {
    errors.push("請選擇癌症種類。");
  }
  if (diagnosisAge == null) {
    errors.push("請輸入確診時的年齡。");
  } else if (diagnosisAge > currentAge) {
    errors.push(`診斷年齡不能大於目前年齡 ${currentAge} 歲。`);
  } else if (item.treatmentStatus === "remission" && toNumber(item.yearsSinceTreatment, 0) > currentAge - diagnosisAge) {
    errors.push("治療完成後年數不能超過確診至今的年數。");
  }
  return errors;
}

function cancerRiskScore(item) {
  if (!item || item.hasHistory !== "yes") return 0;
  const type = cancerTypeProfiles[item.cancerType] || cancerTypeProfiles.other;
  let score = type.risk;
  const stageScore = { "0": 0, "1": 1, "2": 3, "3": 6, "4": 10, unknown: 5 };
  const spreadScore = { no: 0, localNode: 3, distant: 9, unknown: 4 };
  const statusScore = { remission: 0, maintenance: 3, active: 10, recurrence: 11 };
  const followScore = { normal: 0, minor: 2, abnormal: 6 };

  score += stageScore[item.stage] ?? 5;
  score += spreadScore[item.metastatic] ?? 4;
  score += statusScore[item.treatmentStatus] ?? 0;
  score += followScore[item.latestFollowup] ?? 0;

  if (item.yearsSinceTreatment < 1) score += 6;
  else if (item.yearsSinceTreatment < 2) score += 4;
  else if (item.yearsSinceTreatment < 5) score += 2;
  else if (item.yearsSinceTreatment >= 10) score -= 2;

  const currentAge = toNumber(store.profile.age, defaultProfile.age);
  if (currentAge >= 70) score += 2;
  if (currentAge >= 80) score += 2;

  return clamp(score, 0, 24);
}

function cancerTier(score, item) {
  if (!item || item.hasHistory !== "yes") {
    return { label: "一般健康告知", className: "good", title: "沒有癌症病史", copy: "仍需依要保書健康告知事項據實填寫；若有其他疾病，保險公司仍可能要求補件或體檢。" };
  }
  if (score <= 4) return { label: "較有機會送件", className: "good", title: "低度核保疑慮", copy: "常見於早期癌症、已完成治療且追蹤多年穩定。壽險、儲蓄年金與部分意外保障較有機會個案評估。" };
  if (score <= 8) return { label: "需個案核保", className: "review", title: "中度核保疑慮", copy: "通常需要病理報告、治療摘要與最新追蹤資料；可能加費、降低保額、除外或延期。" };
  if (score <= 13) return { label: "常見延期或加費", className: "hard", title: "高度核保疑慮", copy: "醫療、重大傷病、癌症與失能長照類通常較難；可先考慮意外、部分儲蓄年金或低保障商品。" };
  return { label: "目前多半不宜送件", className: "blocked", title: "極高度核保疑慮", copy: "若仍在治療、復發、遠端轉移或追蹤異常，常見結果是延期或拒保。建議先完成治療並累積穩定追蹤紀錄。" };
}

function optionStatusForCancer(product, score, item) {
  if (!item || item.hasHistory !== "yes") {
    return { label: "可正常評估", className: "good" };
  }

  const activeCancer = item.treatmentStatus === "active" || item.treatmentStatus === "recurrence" || item.metastatic === "distant" || item.stage === "4";
  if (activeCancer && product.sensitivity >= 2) return { label: "通常延期", className: "blocked" };
  if (activeCancer && product.sensitivity <= 1) return { label: "需確認除外", className: "review" };

  const impact = score + product.sensitivity * 1.6;
  if (impact <= 5) return { label: "較可能可送件", className: "good" };
  if (impact <= 9) return { label: "需個案核保", className: "review" };
  if (impact <= 13) return { label: "常見加費/除外", className: "hard" };
  return { label: "通常延期", className: "blocked" };
}

function cancerRestrictions(item, score) {
  const restrictions = [
    {
      title: "一定要據實告知",
      body: "投保時若要保書有詢問癌症、腫瘤、住院、手術、檢查異常或長期追蹤，應照實填寫並附上病歷。未據實說明可能影響契約效力與理賠。",
    },
  ];

  if (!item || item.hasHistory !== "yes") {
    restrictions.push({
      title: "仍需看其他健康狀況",
      body: "沒有癌症病史不代表一定承保；高血壓、糖尿病、肝腎功能、BMI、職業與既有投保額度也會影響核保。",
    });
    return restrictions;
  }

  if (item.yearsSinceTreatment < 2) {
    restrictions.push({ title: "治療完成未滿 2 年", body: "市面常見做法會偏向延期，尤其是醫療、癌症、重大傷病、失能與長照保障。" });
  } else if (item.yearsSinceTreatment < 5) {
    restrictions.push({ title: "2 至 5 年內仍屬觀察期", body: "部分壽險或儲蓄年金可嘗試個案核保，但健康險常見加費、除外或等待更久。" });
  } else {
    restrictions.push({ title: "已超過 5 年較有討論空間", body: "若期數早、無轉移、追蹤穩定，部分公司可能接受個案評估；仍不等於保證承保。" });
  }

  if (item.stage === "3" || item.stage === "4" || item.metastatic !== "no") {
    restrictions.push({ title: "期數較高或有擴散", body: "第 3 期、第 4 期、淋巴結或遠端轉移通常會讓醫療、重大傷病、癌症、長照與失能核保大幅變嚴。" });
  }
  if (item.treatmentStatus !== "remission" || item.latestFollowup !== "normal") {
    restrictions.push({ title: "治療或追蹤尚未完全穩定", body: "仍在治療、維持治療、復發、追蹤異常或待確認時，多數保障型商品會先延期。" });
  }
  if (toNumber(store.profile.age, defaultProfile.age) >= 70) {
    restrictions.push({ title: "年齡限制", body: "高齡投保會遇到投保年齡上限、保額限制、體檢與保費大幅增加，癌症病史會再提高核保難度。" });
  }
  if (score >= 9) {
    restrictions.push({ title: "可先採取的路線", body: "先準備診斷證明、病理報告、手術與治療摘要、最近追蹤報告，再從意外險、低保障壽險或儲蓄年金類商品開始詢問。" });
  }
  return restrictions;
}

function renderCancerAssessment() {
  const item = { ...defaultCancerCase, ...(store.cancerCase || {}) };
  syncCancerHistoryVisibility(item);
  const validationErrors = cancerCaseValidation(item);
  if (validationErrors.length) {
    $("#cancerRiskBadge").textContent = "請修正資料";
    $("#cancerRiskBadge").className = "budget-badge option-status blocked";
    $("#cancerSummary").innerHTML = `
      <h3>暫不進行可保性判斷</h3>
      <p>${escapeHtml(validationErrors[0])}</p>
      <p>資料修正前不顯示核保傾向，避免產生錯誤建議。</p>
    `;
    $("#insurableList").innerHTML = "";
    $("#restrictionList").innerHTML = validationErrors.map((message) => `
      <article class="restriction-item">
        <h4>資料需要確認</h4>
        <p>${escapeHtml(message)}</p>
      </article>
    `).join("");
    return;
  }
  const score = cancerRiskScore(item);
  const tier = cancerTier(score, item);
  const type = cancerTypeProfiles[item.cancerType] || cancerTypeProfiles.other;

  $("#cancerRiskBadge").textContent = tier.label;
  $("#cancerRiskBadge").className = `budget-badge option-status ${tier.className}`;
  $("#cancerSummary").innerHTML = `
    <h3>${tier.title}</h3>
    <p>${item.hasHistory === "yes" ? `${type.label}，${item.stage === "unknown" ? "期數不確定" : `${item.stage} 期`}，治療完成約 ${item.yearsSinceTreatment} 年。` : "目前未填寫癌症病史。"}</p>
    <p>${tier.copy}</p>
  `;

  $("#insurableList").innerHTML = cancerInsuranceCatalog.map((product) => {
    const status = optionStatusForCancer(product, score, item);
    return `
      <article class="insurance-option">
        <span class="option-status ${status.className}">${status.label}</span>
        <div>
          <h4>${product.title}</h4>
          <p>${product.reason}</p>
        </div>
      </article>
    `;
  }).join("");

  $("#restrictionList").innerHTML = cancerRestrictions(item, score).map((restriction) => `
    <article class="restriction-item">
      <h4>${restriction.title}</h4>
      <p>${restriction.body}</p>
    </article>
  `).join("");
}

function renderRatePreview(options = {}) {
  const { updatePremium = false } = options;
  const box = $("#rateResult");
  if (!box) return;

  const code = $("#productCode").value.trim();
  if (!code) {
    box.innerHTML = "";
    renderBenefitOverview();
    return;
  }

  const normalizedCode = normalizeProductCode(code);
  const exactMatches = findProductsByCode(normalizedCode);
  if (exactMatches.length > 1 && !$("#productCode").dataset.sourceUrl) {
    box.innerHTML = `
      <div class="rate-card warning">
        <strong>代號「${escapeHtml(normalizedCode)}」有 ${exactMatches.length} 家公司的商品</strong>
        <p>請從代號欄位的下拉選單選擇保險公司，系統才會帶入正確商品與費率。</p>
      </div>
    `;
    renderBenefitOverview();
    return;
  }
  const product = selectedFormProduct();
  if (!product) {
    const unresolved = externalCatalogMeta.unresolvedCodeExamples?.length
      ? ` 近期待補範例：${externalCatalogMeta.unresolvedCodeExamples.map(escapeHtml).join("、")}。`
      : "";
    const sourceText = catalogSourceText();
    box.innerHTML = `
      <div class="rate-card warning">
        <strong>尚未找到「${escapeHtml(normalizedCode)}」的商品資料</strong>
        <p>代號已用大小寫不敏感方式比對；目前資料庫還沒有這個商品的中文名稱、公司、保障年齡與費率表。可先手動輸入保單資料，但保費變化與年增率必須等正式費率資料匯入後才會自動計算。${unresolved}</p>
        ${sourceText ? `<small>${escapeHtml(sourceText)}</small>` : ""}
      </div>
    `;
    renderBenefitOverview();
    return;
  }

  const currentYear = currentCalendarYear();
  const gender = normalizedGender($("#insuredGender")?.value || store.profile.gender);
  const currentAge = clamp(toNumber($("#insuredCurrentAge").value, store.profile.age), 0, 100);
  const startYear = normalizedStartYear($("#policyStartYear")?.value || currentYear, currentYear);
  const startAge = policyStartAgeFromYear(currentAge, startYear, currentYear);
  const coverage = Math.max(0, toNumber($("#coverageWan").value, Math.round(product.coverage / 10000)) * 10000);
  const selectedPlanControl = $("#planNameSelect") && !$("#planNameSelect").hidden ? $("#planNameSelect").value : $("#planName")?.value;
  const planLabel = selectedPlanLabel(product, selectedPlanControl || coverageLabelFor(product));
  const endAge = clamp(toNumber($("#endAge").value, product.endAge), 18, 110);
  const premiumMode = product.premiumMode || $("#premiumMode")?.value || inferPremiumMode(product);
  const growthRate = Math.max(0, toNumber($("#growthRate")?.value, product.growthRate || 0));
  const occupationClass = policyOccupationClass({ occupationClass: $("#occupationClass")?.value || 1 });
  const requestedPremiumTerm = $("#premiumTerm")?.value || product.premiumTerm || productPremiumTerms(product).at(-1) || "";
  const rateAge = product.rateBasis === "issueAge" ? startAge : currentAge;
  const suitableTerm = suitablePremiumTerm(product, rateAge, gender, requestedPremiumTerm, planLabel);
  const premiumTerm = suitableTerm || matchedPremiumTerm(product, requestedPremiumTerm) || requestedPremiumTerm;
  if (suitableTerm && $("#premiumTerm")?.value !== suitableTerm) renderPremiumTermOptions(product, suitableTerm);
  const basePremium = Math.max(0, toNumber($("#annualPremium")?.value, product.annualPremium || 0));
  if ($("#policyStartYear") && !$("#policyStartYear").value) $("#policyStartYear").value = startYear;
  if ($("#policyStartAge")) $("#policyStartAge").value = startAge;
  if (productPlanOptions(product).length > 1) renderPlanOptions(product, planLabel);
  else if ($("#planName") && !$("#planName").value && planLabel) $("#planName").value = planLabel;
  setPremiumModeField(premiumMode, growthRate);
  const draft = {
    id: $("#policyId")?.value || "draft",
    productCode: product.code,
    owner: $("#policyOwner")?.value || "self",
    ownerName: insuredPersonName($("#policyOwner")?.value || "self"),
    name: $("#policyName")?.value || product.name,
    insurer: $("#insurer")?.value || product.insurer,
    category: $("#category")?.value || product.category,
    gender,
    occupationClass,
    currentAge,
    startYear,
    startAge,
    coverage,
    planName: planLabel,
    coverageLabel: planLabel,
    endAge,
    annualPremium: basePremium,
    premiumMode,
    growthRate,
    premiumTerm,
    premiumTermYears: termYears(premiumTerm),
  };
  renderBenefitOverview(draft);
  const hasFormalRate = product.rateStatus === "ready" && hasRateTable(product, gender, premiumTerm, planLabel);
  const hasStructuredRate = product.rateStatus === "ready" && hasStructuredRateTable(product);
  const formalCurrentPremium = hasFormalRate ? premiumFromRateTable(product, draft, 0) : null;
  const structuredCurrentPremium = hasStructuredRate ? premiumFromStructuredRateTable(product, draft, 0) : null;
  const hasUsableFormalRate = hasFormalRate && formalCurrentPremium != null;
  const hasUsableStructuredRate = hasStructuredRate && structuredCurrentPremium != null;
  const hasAnyAutoRate = hasUsableFormalRate || hasUsableStructuredRate;
  const discontinuedNotice = product.saleStatus === "discontinued"
    ? "此商品已停售，費率僅用於記錄既有保單，不會列入新投保推薦。"
    : "";

  if ((hasFormalRate || hasStructuredRate) && !hasAnyAutoRate) {
    const selectedRows = hasFormalRate ? rateTableForGender(product, gender, premiumTerm, planLabel) : [];
    const bounds = rateTableAgeBounds(selectedRows);
    if (updatePremium) $("#annualPremium").value = "";
    box.innerHTML = `
      <div class="rate-card warning">
        <strong>${escapeHtml(product.name)}：目前條件沒有適用費率</strong>
        <p>${bounds ? `所選${premiumTerm ? ` ${escapeHtml(premiumTerm)}` : "年期"}公開費率適用 ${bounds.min}–${bounds.max} 歲；` : ""}目前投保年齡為 ${rateAge} 歲。系統不會沿用最後一筆費率，請改選可用年期或其他商品。</p>
      </div>
    `;
    return;
  }

  if (!hasAnyAutoRate && !basePremium) {
    box.innerHTML = `
      <div class="rate-card warning">
        <strong>${escapeHtml(product.name)}：需要目前年繳保費</strong>
        <p>定期險會依目前年齡或續保年齡調整保費。此商品目前缺正式費率表，請先填入目前年繳保費，系統會用年齡級距估算未來保費與平均年增率。</p>
        <small>${escapeHtml(product.rateSource || product.source || "尚未提供費率來源")}</small>
      </div>
    `;
    return;
  }

  const premiumForYear = (year) => {
    if (hasFormalRate) return premiumFromRateTable(product, draft, year);
    if (hasStructuredRate) return premiumFromStructuredRateTable(product, draft, year);
    return premiumAt(draft, year);
  };
  const currentPremium = hasUsableFormalRate ? formalCurrentPremium
    : hasUsableStructuredRate ? structuredCurrentPremium
      : premiumForYear(0);
  const nextPremium = premiumForYear(1);
  const maxYears = Math.max(0, Math.min(toNumber(store.profile.horizon, 20), endAge - currentAge));
  const terminalPremium = premiumForYear(maxYears);
  const avgGrowth = currentPremium && terminalPremium && maxYears > 0
    ? (Math.pow(terminalPremium / currentPremium, 1 / maxYears) - 1) * 100
    : 0;
  const checkpoints = [...new Set([0, 1, 5, 10, maxYears].filter((year) => year >= 0 && year <= maxYears))];
  const selectedTermTables = planRateTablesFor(product, planLabel)
    || product.termRateTablesByGender?.[matchedPremiumTerm(product, premiumTerm)]
    || product.rateTablesByGender
    || {};
  const hasSelectedGenderRate = Boolean(selectedTermTables?.[gender]?.length);
  const hasAnyGenderRate = Boolean(Object.keys(selectedTermTables || {}).length);

  if (updatePremium && currentPremium != null && (hasAnyAutoRate || !$("#annualPremium").value)) {
    $("#annualPremium").value = Math.round(currentPremium);
  }
  const structuredLabel = hasStructuredRate
    ? (product.structuredRateTable.kind === "unitOccupation" ? "每萬元保額職業費率" : "限額職業費率")
    : "";
  const rateSource = hasFormalRate || hasStructuredRate
    ? (product.rateSource || product.source || "費率表")
    : "依目前保費與年齡估算";
  const rateSourceMarkup = /^https?:\/\//i.test(rateSource)
    ? `<a href="${escapeHtml(rateSource)}" target="_blank" rel="noreferrer">查看公開費率表</a>`
    : escapeHtml(rateSource);
  const formalRateLabel = product.ratePricingModel === "planTotal"
    ? "所選方案年齡總保費"
    : "年齡費率表";

  box.innerHTML = `
      <div class="rate-card ${hasAnyAutoRate ? "success" : "warning"}">
      <div class="rate-head">
        <strong>${escapeHtml(product.name)}</strong>
        <span>${rateSourceMarkup}</span>
      </div>
      ${discontinuedNotice ? `<p class="rate-warning">${escapeHtml(discontinuedNotice)}</p>` : ""}
      ${renderPurchaseRequirements(draft)}
      <dl class="rate-metrics">
        <div><dt>性別</dt><dd>${genderLabel(gender)}</dd></div>
        ${hasStructuredRate ? `<div><dt>職業類別</dt><dd>第 ${occupationClass} 類</dd></div>` : ""}
        <div><dt>目前年齡</dt><dd>${currentAge} 歲</dd></div>
        <div><dt>投保年份</dt><dd>${startYear} 年</dd></div>
        <div><dt>投保時間</dt><dd>${Math.max(0, currentYear - startYear)} 年前投保</dd></div>
        ${premiumTerm ? `<div><dt>繳費年期</dt><dd>${escapeHtml(premiumTerm)}</dd></div>` : ""}
        ${planLabel ? `<div><dt>方案／計畫別</dt><dd>${escapeHtml(planLabel)}</dd></div>` : ""}
        <div><dt>試算方式</dt><dd>${hasFormalRate ? formalRateLabel : hasStructuredRate ? structuredLabel : premiumModeLabel(draft)}</dd></div>
        <div><dt>今年保費</dt><dd>${moneyExact(currentPremium || 0)}</dd></div>
        <div><dt>平均年增率</dt><dd>${avgGrowth ? `${avgGrowth.toFixed(1)}%` : "0%"}</dd></div>
      </dl>
      <ul class="rate-steps">
        ${checkpoints.map((year) => {
          const premium = premiumForYear(year) || 0;
          return `<li><span>${year === 0 ? "今年" : `第 ${year} 年`}</span><strong>${moneyExact(premium)}</strong></li>`;
        }).join("")}
      </ul>
      <p>${nextPremium != null ? `明年約 ${moneyExact(nextPremium)}。` : "下一年度已超過保障年齡或費率表範圍。"}</p>
      ${hasAnyGenderRate && !hasSelectedGenderRate ? `<p>此商品暫無${genderLabel(gender)}專屬公開費率，先用可取得的費率表估算。</p>` : ""}
      ${hasStructuredRate ? `<p>已使用 Finfo 連結的 Google Drive 費率表；職業類別或保額不同時，保費會跟著變動。</p>` : ""}
      ${!hasAnyAutoRate ? "<p>此為估算值：定期險會隨年齡變化調整保費，正式金額仍需以保險公司費率表為準。</p>" : ""}
    </div>
  `;
}

function renderProductLookup() {
  const result = $("#lookupResult");
  if (!result) return;
  const query = lastLookupQuery.trim();
  const product = query ? findProductByCode(query) : null;

  if (!query) {
    result.innerHTML = `
      <div class="lookup-empty">
        <p>${catalogStatusText()} 請在下方「新增或編輯保單資料」的保險代號欄位輸入商品代號。</p>
      </div>
    `;
    return;
  }

  if (!product) {
    result.innerHTML = `
      <div class="lookup-warning">
        <p>找不到「${escapeHtml(query)}」。系統已查過每週全量索引與即時公開資料；請確認代號是否完整。</p>
        <p><a href="${OFFICIAL_PRODUCT_QUERY_URL}" target="_blank" rel="noreferrer">開啟官方商品資料庫</a></p>
      </div>
    `;
    return;
  }

  const bands = product.premiumBands.length ? `
    <ul class="premium-band-list">
      ${product.premiumBands.map((band) => `
        <li>
          <span>${escapeHtml(band.age)}</span>
          <strong>${money(band.premium)}</strong>
        </li>
      `).join("")}
    </ul>
  ` : "";

  result.innerHTML = `
    <article class="lookup-card">
      <div class="lookup-title">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <small>${escapeHtml(product.insurer)} · ${escapeHtml(product.source)}</small>
        </div>
        <span class="lookup-code">${escapeHtml(product.code)}</span>
      </div>
      <dl class="lookup-facts">
        <div><dt>公司</dt><dd>${escapeHtml(product.insurer || "未提供")}</dd></div>
        <div><dt>銷售狀態</dt><dd>${saleStatusLabel(product)}</dd></div>
        <div><dt>保障類型</dt><dd>${categoryLabels[product.category]}</dd></div>
        <div><dt>保障到</dt><dd>${product.endAgeKnown ? `${product.endAge} 歲` : "待查"}</dd></div>
        ${coverageLabelFor(product) ? `<div><dt>方案／計畫別</dt><dd>${escapeHtml(coverageLabelFor(product))}</dd></div>` : ""}
        <div><dt>目前年繳</dt><dd>${product.annualPremium ? money(product.annualPremium) : "未提供"}</dd></div>
      </dl>
      ${renderBenefitSummary(product.benefits.length ? product.benefits : inferBenefitItems(product))}
      ${renderPurchaseRequirements({ productCode: product.code, name: product.name, owner: $("#policyOwner")?.value || "self", purchaseRequirements: product.purchaseRequirements })}
      <p><strong>保費變化：</strong>${escapeHtml(premiumChangeLabel(product))}</p>
      ${bands}
      <div class="form-actions">
        <button class="primary-button" type="button" data-action="apply-product" data-code="${escapeHtml(product.code)}">帶入保單表單</button>
      </div>
    </article>
  `;
}

function mergeProductCatalog(existing, incoming) {
  const merged = new Map();
  [...existing, ...incoming].forEach((item) => {
    const product = normalizeCatalogItem(item);
    const key = productCatalogIdentity(product);
    if (!key || !product.name) return;
    const previous = merged.get(key);
    if (!previous) {
      merged.set(key, product);
      return;
    }
    merged.set(key, normalizeCatalogItem({
      ...previous,
      ...product,
      aliases: [...new Set([...(previous.aliases || []), ...(product.aliases || [])])],
      planOptions: [...new Set([...(previous.planOptions || []), ...(product.planOptions || [])])],
      planBenefitTables: { ...(previous.planBenefitTables || {}), ...(product.planBenefitTables || {}) },
      planRateTablesByGender: { ...(previous.planRateTablesByGender || {}), ...(product.planRateTablesByGender || {}) },
      termRateTablesByGender: { ...(previous.termRateTablesByGender || {}), ...(product.termRateTablesByGender || {}) },
      benefits: product.benefits?.length ? product.benefits : previous.benefits,
      purchaseRequirements: product.purchaseRequirements?.length ? product.purchaseRequirements : previous.purchaseRequirements,
      documents: { ...(previous.documents || {}), ...(product.documents || {}) },
    }));
  });
  return Array.from(merged.values());
}

function expandAlternateCatalogProducts(rows) {
  return rows.flatMap((item) => {
    const alternates = Array.isArray(item?.alternateProducts) ? item.alternateProducts : [];
    return [
      item,
      ...alternates.map((alternate) => ({
        ...item,
        ...alternate,
        code: item.code,
        aliases: [],
        category: "",
        annualPremium: 0,
        endAgeKnown: false,
        premiumBands: [],
        rateTable: [],
        rateTablesByGender: {},
        planRateTablesByGender: {},
        termRateTablesByGender: {},
        structuredRateTable: null,
        rateStatus: "index-only",
        source: "finfo-index",
        alternateProducts: [],
      })),
    ];
  });
}

function extractCatalogRows(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.productCatalog)
      ? payload.productCatalog
      : Array.isArray(payload.products)
        ? payload.products
        : Array.isArray(payload.items)
          ? payload.items
          : [];
  return expandAlternateCatalogProducts(rows);
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCatalogTemplate() {
  downloadJson("jarvis-product-catalog-template.json", [
    {
      code: "ABC123",
      aliases: ["ABC-123"],
      name: "商品中文名稱",
      insurer: "某某人壽保險股份有限公司",
      category: "medical",
      coverageWan: 30,
      annualPremium: 12000,
      endAge: 75,
      premiumMode: "ageBand",
      premiumChange: "按年齡級距調整，年齡越高保費越高。",
      premiumBands: [
        { age: "35歲", premium: 12000 },
        { age: "45歲", premium: 16800 }
      ],
      source: "保險公司費率表或保發中心查詢後整理",
      note: "等待期、續保、除外責任等重點",
    }
  ]);
}

function importProductCatalog(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const rows = extractCatalogRows(payload).map(normalizeCatalogItem).filter((item) => item.code && item.name);
      if (!rows.length) throw new Error("商品代號庫格式不正確");
      store.productCatalog = mergeProductCatalog(store.productCatalog || [], rows);
      invalidateProductCatalogCache();
      saveStore();
      renderProductLookup();
      showToast(`已匯入 ${rows.length} 筆商品代號`);
    } catch {
      showToast("商品代號庫匯入失敗，請確認 JSON 格式");
    }
  };
  reader.readAsText(file);
}

function syncProfileForm() {
  const profile = store.profile;
  $("#age").value = profile.age;
  $("#annualIncome").value = profile.annualIncome;
  $("#dependents").value = profile.dependents;
  $("#debt").value = profile.debt;
  $("#monthlyBudget").value = profile.monthlyBudget;
  $("#horizon").value = profile.horizon;
  const priority = $(`input[name="priority"][value="${profile.priority}"]`) || $('input[name="priority"][value="balanced"]');
  priority.checked = true;
}

function profileFromForm() {
  return {
    age: clamp(toNumber($("#age").value, defaultProfile.age), 18, 85),
    annualIncome: Math.max(0, toNumber($("#annualIncome").value, 0)),
    dependents: clamp(toNumber($("#dependents").value, 0), 0, 8),
    debt: Math.max(0, toNumber($("#debt").value, 0)),
    monthlyBudget: Math.max(0, toNumber($("#monthlyBudget").value, 0)),
    horizon: toNumber($("#horizon").value, 20),
    priority: $('input[name="priority"]:checked')?.value || "balanced",
  };
}

function syncSelfAgeFromProfile() {
  const self = insuredPersonById("self");
  const age = normalizePersonAge(store.profile.age);
  if (!self || age == null) return;
  self.currentAge = age;
  if (activePolicyOwnerId === "self" && $("#insuredCurrentAge")) {
    $("#insuredCurrentAge").value = age;
  }
}

function updateProfileDraft() {
  store.profile = profileFromForm();
  syncSelfAgeFromProfile();
  saveProfileDraft();
}

function renderProfileResults() {
  const assessment = assess();
  const rows = forecast(toNumber(store.profile.horizon, 20));
  renderMetrics(assessment, rows);
  renderForecast(rows, assessment);
  renderRecommendations(assessment);
  renderCatalog();
  renderCancerAssessment();
}

function finalizeProfileForm() {
  store.profile = profileFromForm();
  syncSelfAgeFromProfile();
  saveStore();
  renderProfileResults();
  if ($("#productCode")?.value.trim()) renderRatePreview({ updatePremium: true });
}

function bindProfile() {
  syncProfileForm();
  const form = $("#profileForm");
  form.addEventListener("input", updateProfileDraft);
  form.addEventListener("change", (event) => {
    if (event.target.matches('input[type="number"]')) return;
    finalizeProfileForm();
  });
  form.addEventListener("focusout", (event) => {
    if (event.target.matches('input[type="number"]')) finalizeProfileForm();
  });
}

function collectPolicyForm() {
  const category = $("#category").value;
  const currentYear = currentCalendarYear();
  const currentAge = clamp(toNumber($("#insuredCurrentAge").value, store.profile.age), 0, 100);
  const startYear = normalizedStartYear($("#policyStartYear")?.value || currentYear, currentYear);
  const startAge = policyStartAgeFromYear(currentAge, startYear, currentYear);
  const owner = $("#policyOwner").value || "self";
  const product = selectedFormProduct();
  const selectedPlanControl = $("#planNameSelect") && !$("#planNameSelect").hidden ? $("#planNameSelect").value : $("#planName")?.value;
  const planName = selectedPlanLabel(product, selectedPlanControl || coverageLabelFor(product));
  const autoPremiumMode = product?.premiumMode || inferPremiumMode({
    name: $("#policyName").value,
    category,
    note: $("#policyNote").value,
    premiumBands: product?.premiumBands,
    rateTable: product?.rateTable,
  });
  const policy = {
    id: $("#policyId").value || uid(),
    productCode: normalizeProductCode($("#productCode").value),
    owner,
    ownerName: insuredPersonName(owner),
    gender: normalizedGender($("#insuredGender")?.value || store.profile.gender),
    occupationClass: policyOccupationClass({ occupationClass: $("#occupationClass")?.value || 1 }),
    currentAge,
    startYear,
    startAge,
    name: $("#policyName").value.trim() || categoryLabels[category],
    insurer: $("#insurer").value.trim() || "未填寫",
    category,
    coverage: Math.max(0, toNumber($("#coverageWan").value, 0) * 10000),
    planName,
    coverageLabel: planName,
    benefitPlan: planName,
    annualPremium: Math.max(0, toNumber($("#annualPremium").value, 0)),
    endAge: clamp(toNumber($("#endAge").value, product?.endAge || 100), 18, 110),
    premiumMode: autoPremiumMode,
    growthRate: Math.max(0, toNumber(product?.growthRate || $("#growthRate").value, 0)),
    premiumTerm: $("#premiumTerm")?.value || "",
    premiumTermYears: termYears($("#premiumTerm")?.value || ""),
    contractType: product ? productContractType(product) : "",
    sourceUrl: product?.sourceUrl || "",
    purchaseRequirements: normalizePurchaseRequirements(product?.purchaseRequirements, product || {}),
    note: $("#policyNote").value.trim().slice(0, 240),
  };
  const benefits = benefitItemsForPolicy(policy);
  if (benefits.length) policy.benefits = benefits;
  return policy;
}

function clearPolicyForm(options = {}) {
  const { preserveBatch = false, batch = null } = options;
  const ownerId = batch?.owner || $("#policyOwner")?.value || store.lastPolicyOwner || "self";
  $("#policyId").value = "";
  $("#productCode").value = "";
  delete $("#productCode").dataset.sourceUrl;
  renderInsuredPersonOptions(ownerId);
  activePolicyOwnerId = $("#policyOwner").value || "self";
  applyInsuredPersonToForm(activePolicyOwnerId);
  if (preserveBatch && batch) {
    $("#insuredGender").value = policyGender(batch);
    $("#occupationClass").value = String(policyOccupationClass(batch));
    $("#insuredCurrentAge").value = policyCurrentAge(batch);
    if ($("#policyStartYear")) $("#policyStartYear").value = policyStartYear(batch);
  } else if ($("#policyStartYear")) {
    $("#policyStartYear").value = "";
  }
  $("#policyStartAge").value = "";
  $("#policyName").value = "";
  $("#insurer").value = "";
  $("#category").value = "medical";
  $("#coverageWan").value = "";
  $("#planName").value = "";
  renderPlanOptions(null, "");
  $("#annualPremium").value = "";
  $("#endAge").value = "";
  setPremiumModeField("level", 0);
  $("#premiumTerm").replaceChildren();
  $("#premiumTermField").hidden = true;
  $("#policyNote").value = "";
  $("#rateResult").innerHTML = "";
  renderBenefitOverview();
  $("#savePolicyButton").textContent = "儲存保單";
  $("#saveAndAddPolicyButton").textContent = "儲存並新增同批保單";
  hideProductCodeSuggestions();
  setProductCodeStatus("大小寫皆可；輸入代號後會自動帶入已知商品資料，查不到也可以手動填寫。");
}

function editPolicy(id) {
  const policy = store.policies.find((item) => item.id === id);
  if (!policy) return;
  $("#policyId").value = policy.id;
  $("#productCode").value = normalizeProductCode(policy.productCode || "");
  $("#productCode").dataset.sourceUrl = policy.sourceUrl || "";
  renderInsuredPersonOptions(policy.owner || "self");
  activePolicyOwnerId = $("#policyOwner").value || "self";
  if ($("#insuredGender")) $("#insuredGender").value = policyGender(policy);
  if ($("#occupationClass")) $("#occupationClass").value = String(policyOccupationClass(policy));
  $("#insuredCurrentAge").value = policyCurrentAge(policy);
  if ($("#policyStartYear")) $("#policyStartYear").value = policyStartYear(policy);
  $("#policyStartAge").value = policyStartAge(policy);
  $("#policyName").value = policy.name;
  $("#insurer").value = policy.insurer;
  $("#category").value = policy.category;
  $("#coverageWan").value = Math.round(toNumber(policy.coverage, 0) / 1000) / 10;
  const product = productForPolicy(policy);
  renderPlanOptions(product, policyCoverageLabel(policy));
  $("#annualPremium").value = policy.annualPremium;
  $("#endAge").value = policy.endAge;
  setPremiumModeField(policy.premiumMode, policy.growthRate || 0);
  renderPremiumTermOptions(product, policy.premiumTerm);
  $("#policyNote").value = policy.note || "";
  $("#savePolicyButton").textContent = "更新保單";
  $("#saveAndAddPolicyButton").textContent = "更新並新增同批保單";
  renderRatePreview({ updatePremium: false });
  $(".policy-editor").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deletePolicy(id) {
  store.policies = store.policies.filter((policy) => policy.id !== id);
  saveStore();
  render();
  showToast("已刪除保單");
}

function renderMetrics(assessment, rows) {
  const horizon = toNumber(store.profile.horizon, 20);
  const current = rows[0]?.premium || 0;
  const future = rows[horizon]?.premium || current;
  const annualBudget = assessment.annualBudget;
  const budgetSpace = annualBudget - current;
  const trend = current > 0 ? ((future / current) - 1) * 100 : 0;
  const lifeTarget = assessment.target.life || 0;
  const dependents = toNumber(store.profile.dependents, 0);
  const debt = toNumber(store.profile.debt, 0);

  $("#lifeNeedMetric").textContent = money(lifeTarget);
  $("#lifeNeedCopy").textContent = dependents > 0 && debt > 0
    ? `扶養 ${dependents} 人，含貸款 ${money(debt)}`
    : dependents > 0
      ? `扶養 ${dependents} 人，額度會隨年齡遞減`
      : debt > 0
        ? `主要依貸款 ${money(debt)} 加基本費用`
        : "目前無扶養與貸款，僅保留基本費用";
  $("#premiumMetric").textContent = moneyExact(current);
  $("#budgetCopy").textContent = annualBudget ? `年度上限 ${moneyExact(annualBudget)}` : "尚未設定預算";
  $("#futurePremiumMetric").textContent = moneyExact(future);
  $("#premiumTrendCopy").textContent = current ? `${horizon} 年後約 ${trend >= 0 ? "增加" : "降低"} ${Math.abs(Math.round(trend))}%` : "尚無保單";
  $("#budgetMetric").textContent = annualBudget ? moneyExact(budgetSpace) : "--";
  $("#budgetHealthCopy").textContent = annualBudget ? (budgetSpace >= 0 ? "仍在預算內" : "已超出預算") : "未設定保費上限";
}

function benefitNumericValue(amount) {
  const text = plainText(amount);
  if (!text || text === UNKNOWN_BENEFIT_AMOUNT) return 0;
  const normalized = text.replace(/,/g, "");
  const wanMatch = normalized.match(/(\d+(?:\.\d+)?)\s*萬/);
  if (wanMatch) return toNumber(wanMatch[1], 0) * 10000;
  const yuanMatch = normalized.match(/(\d+(?:\.\d+)?)\s*元/);
  if (yuanMatch) return toNumber(yuanMatch[1], 0);
  return 0;
}

function benefitAmountUnit(amount) {
  const text = plainText(amount);
  const unitMatch = text.match(/(?:元)?\s*(\/[日年月次]|每[日年月次])/);
  return unitMatch ? unitMatch[1].replace(/^每/, "/") : "";
}

function canonicalBenefitItem(item) {
  const text = plainText(item);
  const aliases = [
    { match: /(?:每日病房費|一般住院(?:病房)?|住院病房費|病房費用)/, key: "daily-room", label: "每日病房費" },
    { match: /(?:住院醫療雜費|住院雜費|住院醫療費用|醫療雜費)/, key: "hospital-misc", label: "住院醫療雜費" },
    { match: /(?:加護病房|加護病房費)/, key: "intensive-care", label: "加護病房" },
    { match: /(?:外科[／/]?門診手術費|門診手術費[／/]?雜費|門診手術醫療)/, key: "outpatient-surgery", label: "門診手術費／雜費" },
  ];
  const alias = aliases.find((candidate) => candidate.match.test(text));
  return alias || {
    key: normalizedProductIdentityText(text) || text,
    label: text || "理賠項目",
  };
}

function additiveBenefitRelationship(rows) {
  const ownedCodes = new Set(rows.map((row) => row.productCode).filter(Boolean));
  const relationships = [];
  rows.forEach((row) => {
    row.requiredCodes.forEach((requiredCode) => {
      if (!row.productCode || !ownedCodes.has(requiredCode)) return;
      relationships.push(`${row.productCode} 補足 ${requiredCode}`);
    });
  });
  return [...new Set(relationships)].join("、");
}

function formatAggregatedBenefitAmount(group) {
  if (group.value <= 0) return UNKNOWN_BENEFIT_AMOUNT;
  const prefix = group.rows.some((row) => /^最高/.test(plainText(row.amount))) ? "最高 " : "";
  const unit = group.units.size === 1 ? Array.from(group.units)[0] : "";
  return `${prefix}${Math.round(group.value).toLocaleString("zh-TW")} 元${unit}`;
}

function aggregateBenefitRows(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const benefitItem = canonicalBenefitItem(row.item);
    const unit = benefitAmountUnit(row.amount);
    const key = `${row.ownerId}|${benefitItem.key}|${unit || "no-unit"}`;
    if (!benefitItem.key) return;
    if (!groups.has(key)) {
      groups.set(key, {
        owner: row.owner,
        item: benefitItem.label,
        value: 0,
        units: new Set(),
        rows: [],
      });
    }
    const group = groups.get(key);
    group.value += row.value;
    if (unit) group.units.add(unit);
    group.rows.push(row);
  });
  return Array.from(groups.values()).map((group) => {
    const sources = group.rows.map((row) => `${row.owner} ${row.productCode || row.productName}: ${row.amount}`);
    const extraSourceCount = Math.max(0, sources.length - 3);
    const visibleSources = sources.slice(0, 3).join("；");
    const relationship = additiveBenefitRelationship(group.rows);
    const benefitNotes = [...new Set(group.rows.map((row) => plainText(row.note)).filter(Boolean))].slice(0, 2);
    const notes = [
      relationship ? `${relationship}，上列額度已納入合計；實際仍依自負額與條款核付。` : "",
      ...benefitNotes,
    ].filter(Boolean).join("；");
    return {
      ...group,
      amount: formatAggregatedBenefitAmount(group),
      sourceText: `${visibleSources}${extraSourceCount ? `；另 ${extraSourceCount} 項` : ""}`,
      note: notes,
      relationship,
      count: group.rows.length,
    };
  }).sort((a, b) => b.value - a.value || a.item.localeCompare(b.item, "zh-Hant"));
}

function benefitOverviewPolicies(draftPolicy = null) {
  const draftId = draftPolicy?.id && draftPolicy.id !== "draft" ? draftPolicy.id : "";
  const saved = draftId
    ? store.policies.filter((policy) => policy.id !== draftId)
    : store.policies;
  return draftPolicy?.productCode ? [draftPolicy, ...saved] : saved;
}

function renderBenefitOverview(draftPolicy = null) {
  const chart = $("#benefitChart");
  if (!chart) return;

  const rows = benefitOverviewPolicies(draftPolicy).flatMap((policy) => {
    const ownerId = String(policy.owner || "self");
    const owner = insuredPersonName(policy.owner || "self", policy.ownerName);
    const productCode = normalizeProductCode(policy.productCode || "");
    const productName = policy.name || productForPolicy(policy)?.name || "保單";
    const requiredCodes = purchaseRequirementsForPolicy(policy)
      .map((requirement) => normalizeProductCode(requirement.code || ""))
      .filter(Boolean);
    return benefitItemsForPolicy(policy).map((benefit) => {
      const amount = benefit.amount || UNKNOWN_BENEFIT_AMOUNT;
      return {
        ownerId,
        owner,
        productCode,
        productName,
        requiredCodes,
        item: benefit.item || "理賠項目",
        amount,
        note: benefit.note,
        value: benefitNumericValue(amount),
      };
    });
  });

  if (!rows.length) {
    chart.innerHTML = `
      <div class="empty-state compact">
        輸入或儲存保單後，這裡會列出各保單的理賠項目、限額與比較圖。
      </div>
    `;
    return;
  }

  const groupedRows = aggregateBenefitRows(rows);
  const maxValue = Math.max(1, ...groupedRows.map((row) => row.value));
  chart.innerHTML = groupedRows.map((row) => {
    const width = row.value > 0 ? `${Math.max(6, (row.value / maxValue) * 100)}%` : "22%";
    const unknown = row.value <= 0;
    const meta = `${row.relationship ? `${row.relationship}｜` : ""}${row.count} 項合計｜${row.sourceText}`;
    return `
      <div class="benefit-bar-row" title="${escapeHtml(`${row.item}｜${row.sourceText}`)}">
        <div class="benefit-bar-label">
          <strong>${escapeHtml(`${row.owner}｜${row.item}`)}</strong>
          <span>${escapeHtml(meta)}</span>
        </div>
        <div class="benefit-bar-track">
          <div class="benefit-bar-fill ${unknown ? "unknown" : ""}" style="--width:${width}"></div>
        </div>
        <div class="benefit-bar-amount">
          <strong>${escapeHtml(row.amount)}</strong>
          ${row.note ? `<span>${escapeHtml(row.note)}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function renderForecast(rows, assessment) {
  const chart = $("#forecastChart");
  const table = $("#forecastTable");
  const maxPremium = Math.max(1, ...rows.map((row) => row.premium), assessment.annualBudget);
  const visibleRows = rows.filter((row) => row.year === 0 || row.year % 5 === 0 || row.year === rows.length - 1);

  if (chart) chart.innerHTML = "";

  table.innerHTML = visibleRows.map((row) => {
    const width = `${Math.max(3, (row.premium / maxPremium) * 100)}%`;
    const over = assessment.annualBudget > 0 && row.premium > assessment.annualBudget;
    return `
      <div class="forecast-row">
        <strong>${row.year === 0 ? "今年" : `第 ${row.year} 年`}</strong>
        <div class="forecast-track"><div class="forecast-fill ${over ? "over-budget" : ""}" style="--width:${width}"></div></div>
        <span>${moneyExact(row.premium)}</span>
      </div>
    `;
  }).join("");
}

function policyUserNote(policy) {
  const parts = plainText(policy.note)
    .split("｜")
    .flatMap((part) => part.split("；"))
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^(?:方案[／/]計畫別|Finfo|保費變化|資料來源)/i.test(part))
    .filter((part) => !/^(?:實支實付|一年期|最高保障至\s*\d+\s*歲)$/.test(part))
    .filter((part) => !/(?:premiums API|公開 premiums|搜尋精準命中)/i.test(part))
    .filter((part) => !/須搭配.+同時購買/.test(part));
  return [...new Set(parts)].join("；");
}

function renderPolicyList() {
  const list = $("#policyList");
  if (!store.policies.length) {
    list.innerHTML = `
      <div class="empty-state">
        還沒有保單。請先在上方輸入商品代號，新增自己或家人的保單。
      </div>
    `;
    return;
  }

  list.innerHTML = store.policies.map((policy) => `
    <article class="policy-card">
      <header>
        <div>
          <h3>${escapeHtml(policy.name)}</h3>
          <small>${escapeHtml(policy.insurer)}${policy.productCode ? ` · ${escapeHtml(policy.productCode)}` : ""}</small>
        </div>
        <div class="card-tags">
          <span class="owner-pill">${escapeHtml(insuredPersonName(policy.owner || "self", policy.ownerName))}</span>
          <span class="tag ${policy.category}">${categoryLabels[policy.category]}</span>
        </div>
      </header>
      <dl>
        <div><dt>保障／方案</dt><dd>${escapeHtml(policyCoverageLabel(policy) || wan(policy.coverage))}</dd></div>
        <div><dt>年繳保費</dt><dd>${moneyExact(policy.annualPremium)}</dd></div>
        <div><dt>到期年齡</dt><dd>${policy.endAge} 歲</dd></div>
        <div><dt>保費模式</dt><dd>${premiumModeLabel(policy)}</dd></div>
        <div><dt>性別</dt><dd>${genderLabel(policyGender(policy))}</dd></div>
        <div><dt>職業類別</dt><dd>第 ${policyOccupationClass(policy)} 類</dd></div>
        <div><dt>目前年齡</dt><dd>${policyCurrentAge(policy)} 歲</dd></div>
        <div><dt>投保年份</dt><dd>${policyStartYear(policy)} 年</dd></div>
        ${policy.premiumTerm ? `<div><dt>繳費年期</dt><dd>${escapeHtml(policy.premiumTerm)}</dd></div>` : ""}
      </dl>
      ${renderPurchaseRequirements(policy)}
      ${policyUserNote(policy) ? `<p class="policy-note">${escapeHtml(policyUserNote(policy))}</p>` : ""}
      <div class="card-actions">
        <button type="button" data-action="edit" data-id="${policy.id}">編輯</button>
        <button type="button" data-action="delete" data-id="${policy.id}">刪除</button>
      </div>
    </article>
  `).join("");
}

function premiumModeLabel(policy) {
  if (policy.premiumMode === "ageBand") return "年齡級距";
  if (policy.premiumMode === "annualGrowth") return `年增 ${policy.growthRate || 0}%`;
  return "固定";
}

function mainPlanDisplayName(requirement) {
  if (requirement?.policy) {
    return `${requirement.policy.productCode ? `${normalizeProductCode(requirement.policy.productCode)} ` : ""}${requirement.policy.name || "既有主約"}`.trim();
  }
  if (requirement?.product) return `${requirement.product.code} ${requirement.product.name}`.trim();
  return "主約";
}

function renderMainPlanRequirement(item) {
  const requirement = item.mainPlanRequirement;
  const ownerName = escapeHtml(insuredPersonName(item.ownerId));
  const insurer = escapeHtml(item.product.insurer);

  if (requirement.mode === "self") {
    return `
      <div class="contract-path is-main">
        <strong>本商品可作主約</strong>
        <p>${ownerName}可先以此商品建立${insurer}主約；後續同公司的附約仍需依核保與搭配規則確認。</p>
      </div>
    `;
  }

  if (requirement.mode === "owned") {
    return `
      <div class="contract-path is-owned">
        <strong>已有同公司主約</strong>
        <p>${ownerName}已持有${insurer}的「${escapeHtml(mainPlanDisplayName(requirement))}」，可再確認這張主約是否接受附加本商品。</p>
      </div>
    `;
  }

  const mainPlanLink = requirement.product?.sourceUrl
    ? `<a href="${escapeHtml(requirement.product.sourceUrl)}" target="_blank" rel="noreferrer">在 Finfo 查看 ${escapeHtml(requirement.product.code)}</a>`
    : "";
  const premiumText = `主約依 Finfo 費率表計算，目前年繳 ${moneyExact(requirement.premium)}，已納入方案預算。`;
  const modeCopy = requirement.mode === "planned"
    ? "這張主約也在本次建議中，不會重複計算保費。"
    : "目前沒有同公司的主約，因此不能只投保下面的附約。";

  return `
    <div class="contract-path needs-main">
      <strong>投保順序：先主約，再附約</strong>
      <div class="contract-step">
        <span>1</span>
        <div>
          <b>${escapeHtml(mainPlanDisplayName(requirement))}</b>
          <small>${escapeHtml(requirement.planLabel || "依公司規則規劃主約")} · ${premiumText}</small>
          ${mainPlanLink}
        </div>
      </div>
      <div class="contract-step">
        <span>2</span>
        <div>
          <b>${escapeHtml(item.product.code)} ${escapeHtml(item.product.name)}</b>
          <small>主約核保成立後，再申請附加此附約。</small>
        </div>
      </div>
      <p>${modeCopy} ${escapeHtml(requirement.note || "實際可搭配商品仍以保險公司規則為準。")}</p>
    </div>
  `;
}

function renderRecommendations(assessment) {
  const ownerId = recommendationOwnerId();
  void ensureRecommendationMainPlanRates(assessment, ownerId);
  const plan = buildRecommendations(assessment);
  const annualBudget = assessment.annualBudget;
  const profileAge = toNumber(store.profile.age, defaultProfile.age);
  const dependents = toNumber(store.profile.dependents, 0);
  const debt = toNumber(store.profile.debt, 0);
  const box = $("#replacementBox");
  const replacement = expensiveReplacementSignal();

  $("#recommendationBudget").textContent = annualBudget
    ? `可用空間 ${moneyExact(plan.remaining)} · 方案年繳 ${moneyExact(plan.used)}`
    : "請先設定保費上限";

  box.innerHTML = replacement ? `
    <h3>${replacement.title}</h3>
    <p>${escapeHtml(replacement.body)}</p>
  ` : "";

  if (!plan.selected.length) {
    $("#recommendationPlan").innerHTML = `
      <div class="empty-state">
        ${store.policies.length ? "目前沒有同時符合保障性質、費率完整、能明顯改善缺口且不超過保費上限的現售商品，因此不硬塞不合適的商品代號。" : "新增保單後會依缺口產生補強方案。"}
      </div>
    `;
    return;
  }

  $("#recommendationPlan").innerHTML = `
    <div class="recommendation-basis-summary">
      <span>本次保障需求基準</span>
      <strong>${profileAge} 歲 · 扶養 ${dependents} 人</strong>
      <small>貸款 ${money(debt)}；年齡、扶養或貸款變動時，建議額度會重新計算</small>
    </div>
  ` + plan.selected.map((item) => `
    <article class="recommend-card">
      <div class="recommend-head">
        <span class="tag ${item.category}">${categoryLabels[item.category]}</span>
        <span class="recommend-code">${escapeHtml(item.product.code)}</span>
      </div>
      <h3>${escapeHtml(item.product.name)}</h3>
      <p class="recommend-insurer">${escapeHtml(item.product.insurer)}｜現售商品</p>
      <div class="coverage-impact">
        <span>投保後的${categoryLabels[item.category]}缺口</span>
        <strong>${wan(item.gap.gap)} → ${item.projectedGap > 0 ? wan(item.projectedGap) : "已補足"}</strong>
        <small>本方案預計補強 ${wan(item.gapReduction)}；主約提供的同類保障也會一併計入</small>
      </div>
      <div class="recommend-meta">
        <span class="pill">目前年繳 ${moneyExact(item.premium)}</span>
        <span class="pill">方案保障 ${escapeHtml(coverageLabelFor(item.product) || wan(item.coverage))}</span>
        <span class="pill">對應缺口 ${wan(item.gap.gap)}</span>
        <span class="pill">Finfo 近月採用 ${Math.round(item.product.popularity).toLocaleString("zh-TW")}</span>
      </div>
      ${renderBenefitSummary(item.product.benefits.length ? item.product.benefits : inferBenefitItems(item.product))}
      ${renderMainPlanRequirement(item)}
      <p>${escapeHtml(productPolicyNote(item.product) || "請比較給付範圍、上限、除外責任與主附約搭配後再決定。")}</p>
      <a class="finfo-link" href="${escapeHtml(item.product.sourceUrl)}" target="_blank" rel="noreferrer">在 Finfo 查看 ${escapeHtml(item.product.code)}</a>
    </article>
  `).join("");
}

function renderCatalog() {
  $("#catalogGrid").innerHTML = catalog.map((item) => {
    const premium = estimateCatalogPremium(item, 1);
    return `
      <article class="catalog-card">
        <span class="tag ${item.category}">${categoryLabels[item.category]}</span>
        <h4>${item.title}</h4>
        <p>${item.short}</p>
        <div class="heat">
          <div class="catalog-meta">
            <span class="pill">熱度 ${item.popularity}</span>
            <span class="pill">起估 ${money(premium)}</span>
          </div>
          <div class="heat-track"><div class="heat-fill" style="--width:${item.popularity}%"></div></div>
        </div>
      </article>
    `;
  }).join("");
}

function render() {
  const assessment = assess();
  const rows = forecast(toNumber(store.profile.horizon, 20));
  renderProductLookup();
  renderClaimOwnerOptions();
  renderMetrics(assessment, rows);
  renderBenefitOverview();
  renderForecast(rows, assessment);
  renderPolicyList();
  renderRecommendations(assessment);
  renderCatalog();
  renderCancerAssessment();
}

function exportData() {
  downloadJson(`jarvis-insurance-planner-${new Date().toISOString().slice(0, 10)}.json`, store);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const next = JSON.parse(reader.result);
      if (!next || !Array.isArray(next.policies)) throw new Error("格式不正確");
      store = normalizedStoredData({
        ...next,
        productCatalog: Array.isArray(next.productCatalog)
          ? next.productCatalog.map(normalizeCatalogItem).filter((item) => item.code && item.name)
          : (store.productCatalog || []),
      });
      invalidateProductCatalogCache();
      activePolicyOwnerId = store.lastPolicyOwner || "self";
      saveStore();
      syncProfileForm();
      syncCancerForm();
      renderInsuredPersonOptions(activePolicyOwnerId);
      applyInsuredPersonToForm(activePolicyOwnerId);
      render();
      showToast("已匯入資料");
    } catch (error) {
      showToast("匯入失敗，請確認 JSON 檔案");
    }
  };
  reader.readAsText(file);
}

async function refreshSelectedPlanDetails() {
  const select = $("#planNameSelect");
  const selectedPlan = plainText(select?.value || $("#planName")?.value);
  if ($("#planName")) $("#planName").value = selectedPlan;
  const code = normalizeProductCode($("#productCode")?.value);
  if (!code) {
    renderRatePreview({ updatePremium: true });
    return;
  }

  const indexed = selectedFormProduct();
  if (!indexed) {
    renderRatePreview({ updatePremium: true });
    return;
  }

  setProductCodeStatus(`正在查詢 ${code} ${selectedPlan} 的保費與理賠限額...`, "idle");
  const product = await ensureProductDetails(indexed, selectedPlan);
  if (normalizeProductCode($("#productCode")?.value) !== code) return;
  if (product) applyProductToForm(product, { scroll: false, toast: false, selectedPlan });
  renderRatePreview({ updatePremium: true });
}

function bindEvents() {
  renderInsuredPersonOptions(store.lastPolicyOwner || "self");
  applyInsuredPersonToForm(activePolicyOwnerId);

  $("#claimForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    analyzeClaim();
  });

  $("#accountButton").addEventListener("click", openAccountDialog);
  $("#cancelAccountButton").addEventListener("click", closeAccountDialog);
  $("#closeAccountButton").addEventListener("click", closeAccountDialog);
  $("#accountLoginTab").addEventListener("click", () => setAccountMode("login"));
  $("#accountRegisterTab").addEventListener("click", () => setAccountMode("register"));
  $("#accountForm").addEventListener("submit", submitAccountForm);
  $("#logoutButton").addEventListener("click", logoutAccount);
  $("#deleteAccountButton").addEventListener("click", () => setDeleteAccountMode(true));
  $("#cancelDeleteAccountButton").addEventListener("click", () => setDeleteAccountMode(false));
  $("#accountDeleteForm").addEventListener("submit", deleteCurrentAccount);
  $("#accountDialog").addEventListener("cancel", (event) => {
    event.preventDefault();
    closeAccountDialog();
  });

  $("#addInsuredPersonButton").addEventListener("click", openInsuredPersonDialog);
  $("#cancelInsuredPersonButton").addEventListener("click", closeInsuredPersonDialog);
  $("#insuredPersonDialog").addEventListener("cancel", (event) => {
    event.preventDefault();
    closeInsuredPersonDialog();
  });
  $("#insuredPersonForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const previousCount = store.insuredPeople.length;
    const person = createInsuredPerson($("#insuredPersonName").value);
    if (!person) return;
    renderInsuredPersonOptions(person.id);
    activePolicyOwnerId = person.id;
    store.lastPolicyOwner = person.id;
    applyInsuredPersonToForm(person);
    saveStore();
    closeInsuredPersonDialog();
    renderRatePreview({ updatePremium: true });
    showToast(previousCount === store.insuredPeople.length ? `已切換至${person.name}` : `已新增${person.name}`);
  });

  $("#policyOwner").addEventListener("change", () => {
    syncInsuredPersonFromForm(activePolicyOwnerId, false);
    activePolicyOwnerId = $("#policyOwner").value || "self";
    store.lastPolicyOwner = activePolicyOwnerId;
    applyInsuredPersonToForm(activePolicyOwnerId);
    $("#policyStartYear").value = "";
    $("#policyStartAge").value = "";
    saveStore();
    renderRatePreview({ updatePremium: true });
    renderRecommendations(assess());
  });

  if ($("#lookupForm")) {
    $("#lookupForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      lastLookupQuery = normalizeProductCode($("#lookupCode").value);
      const indexedProduct = findProductByCode(lastLookupQuery);
      if (indexedProduct) await ensureProductDetails(indexedProduct);
      else await fetchLiveProductDetails(lastLookupQuery);
      renderProductLookup();
    });
  }

  if ($("#lookupResult")) {
    $("#lookupResult").addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action='apply-product']");
      if (!button) return;
      const indexedProduct = findProductByCode(button.dataset.code);
      const product = await ensureProductDetails(indexedProduct);
      if (product) applyProductToForm(product);
    });
  }

  if ($("#catalogTemplateButton")) $("#catalogTemplateButton").addEventListener("click", downloadCatalogTemplate);
  if ($("#catalogImportButton")) $("#catalogImportButton").addEventListener("click", () => $("#catalogFile").click());
  if ($("#catalogFile")) {
    $("#catalogFile").addEventListener("change", () => {
      const file = $("#catalogFile").files?.[0];
      if (file) importProductCatalog(file);
      $("#catalogFile").value = "";
    });
  }

  $("#productCode").addEventListener("input", () => {
    const hadSelectedProduct = Boolean($("#productCode").dataset.sourceUrl);
    delete $("#productCode").dataset.sourceUrl;
    if (hadSelectedProduct) $("#insurer").value = "";
    productCodeSuggestionIndex = -1;
    renderProductCodeSuggestions();
    window.clearTimeout(policyCodeLookupTimer);
    policyCodeLookupTimer = window.setTimeout(() => {
      void lookupPolicyProductCode({ showMissing: false });
      renderRatePreview({ updatePremium: true });
    }, 450);
  });

  $("#productCode").addEventListener("focus", () => {
    renderProductCodeSuggestions();
  });

  $("#productCode").addEventListener("change", () => {
    void lookupPolicyProductCode({ showMissing: true });
    renderRatePreview({ updatePremium: true });
  });

  $("#productCode").addEventListener("keydown", (event) => {
    const suggestions = productCodeSuggestions($("#productCode").value);
    const list = $("#productCodeSuggestions");
    const suggestionsVisible = suggestions.length && list && !list.hidden;

    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.length) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      productCodeSuggestionIndex = (productCodeSuggestionIndex + step + suggestions.length) % suggestions.length;
      renderProductCodeSuggestions();
      return;
    }

    if (event.key === "Escape") {
      hideProductCodeSuggestions();
      return;
    }

    if (event.key !== "Enter") return;
    event.preventDefault();
    if (suggestionsVisible && suggestions[productCodeSuggestionIndex]?.product) {
      const selected = suggestions[productCodeSuggestionIndex].product;
      void selectProductCodeSuggestion(selected.code, selected.sourceUrl);
      return;
    }
    void lookupPolicyProductCode({ showMissing: true });
    renderRatePreview({ updatePremium: true });
  });

  $("#productCodeSuggestions").addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button[data-code]");
    if (!button) return;
    event.preventDefault();
    void selectProductCodeSuggestion(button.dataset.code, button.dataset.sourceUrl);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".code-combobox")) hideProductCodeSuggestions();
  });

  ["#insuredGender", "#occupationClass"].forEach((selector) => {
    $(selector).addEventListener("change", () => {
      syncInsuredPersonFromForm(activePolicyOwnerId);
      renderRatePreview({ updatePremium: true });
      renderRecommendations(assess());
    });
  });

  $("#insuredCurrentAge").addEventListener("input", () => {
    syncInsuredPersonFromForm(activePolicyOwnerId, false);
  });
  $("#insuredCurrentAge").addEventListener("focusout", () => {
    syncInsuredPersonFromForm(activePolicyOwnerId);
    renderRatePreview({ updatePremium: true });
    renderRecommendations(assess());
  });

  if ($("#planNameSelect")) {
    $("#planNameSelect").addEventListener("change", () => {
      void refreshSelectedPlanDetails();
    });
  }

  ["#policyStartYear", "#coverageWan", "#endAge"].forEach((selector) => {
    $(selector).addEventListener("focusout", () => renderRatePreview({ updatePremium: true }));
  });
  $("#planName").addEventListener("focusout", () => renderRatePreview({ updatePremium: true }));
  $("#premiumTerm").addEventListener("change", () => renderRatePreview({ updatePremium: true }));

  $("#policyForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const preserveBatch = event.submitter?.id === "saveAndAddPolicyButton";
    const policy = collectPolicyForm();
    rememberPolicyOwnerProfile(policy);
    const index = store.policies.findIndex((item) => item.id === policy.id);
    if (index >= 0) store.policies[index] = policy;
    else store.policies.unshift(policy);
    saveStore();
    clearPolicyForm({ preserveBatch, batch: policy });
    render();
    showToast(preserveBatch ? "保單已儲存，可繼續輸入同批商品" : "保單已儲存");
  });

  $("#clearPolicyButton").addEventListener("click", () => clearPolicyForm());

  $("#resetButton").addEventListener("click", () => {
    if (!window.confirm("確定要清除所有保單資料嗎？")) return;
    store.policies = [];
    saveStore();
    clearPolicyForm();
    render();
    showToast("已清除保單資料");
  });

  $("#policyList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "edit") editPolicy(id);
    if (button.dataset.action === "delete") deletePolicy(id);
  });
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

bindProfile();
bindCancerForm();
bindEvents();
renderAccountControls();
void bootstrapAccount();
loadExternalProductCatalog().finally(render);
