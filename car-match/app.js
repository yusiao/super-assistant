const cars = [
  {
    name: "Toyota Yaris Cross", variant: "享樂版起", price: 69.5, priceLabel: "69.5–79.5 萬", body: "suv", power: "gas", seats: 5,
    priorities: ["city", "economy", "value", "space"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "小尺碼休旅，把台灣巷弄變簡單。", note: "車身好掌握、入手門檻親切，適合第一次買車或以市區通勤為主。",
    url: "https://www.toyota.com.tw/showroom/YARIS_CROSS/"
  },
  {
    name: "Hyundai Venue", variant: "GLA 起", price: 73.9, priceLabel: "73.9 萬起", body: "suv", power: "gas", seats: 5,
    priorities: ["city", "value", "design", "tech"], colors: ["white", "black", "gray", "blue", "red", "green"],
    tagline: "帶點玩心的都會小休旅。", note: "視野開闊、造型有個性，在都會尺寸與休旅坐姿之間取得好平衡。",
    url: "https://www.hyundai-motor.com.tw/VENUE"
  },
  {
    name: "Toyota Corolla Altis Hybrid", variant: "豪華版", price: 84.5, priceLabel: "約 84.5–89.5 萬", body: "sedan", power: "hybrid", seats: 5,
    priorities: ["economy", "comfort", "value", "city"], colors: ["white", "black", "gray", "red"],
    tagline: "安靜、省油，日常就是它的主場。", note: "成熟可靠的油電房車，適合通勤里程高、重視油耗與乘坐舒適的人。",
    url: "https://www.toyota.com.tw/showroom/ALTIS/"
  },
  {
    name: "Toyota Corolla Cross Hybrid", variant: "豪華版起", price: 86.5, priceLabel: "約 86.5–98.9 萬", body: "suv", power: "hybrid", seats: 5,
    priorities: ["economy", "space", "value", "comfort"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "什麼都做得好，才是真正的萬用。", note: "油耗、妥善與空間都很均衡，是小家庭最不容易後悔的選擇之一。",
    url: "https://www.toyota.com.tw/showroom/COROLLA_CROSS/"
  },
  {
    name: "Mazda3", variant: "20S Ace Edition 起", price: 88.8, priceLabel: "88.8 萬起", body: "sedan", power: "gas", seats: 5,
    priorities: ["design", "driving", "comfort", "tech"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "每天回頭多看一眼的質感房車。", note: "內裝細膩、行路質感成熟，適合不願在實用和設計之間二選一的人。",
    url: "https://www.mazda.com.tw/cars/mazda3/"
  },
  {
    name: "Mazda CX-30", variant: "20S Ace Edition 起", price: 89.8, priceLabel: "89.8 萬起", body: "suv", power: "gas", seats: 5,
    priorities: ["design", "driving", "city", "comfort"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "休旅的實用，保留 Mazda 的漂亮身段。", note: "車格不笨重、內裝有質感，特別適合兩人生活與都會移動。",
    url: "https://www.mazda.com.tw/cars/mazda-cx-30/"
  },
  {
    name: "Hyundai Inster", variant: "EV400-A 起", price: 94.9, priceLabel: "94.9 萬起", body: "hatch", power: "electric", seats: 4,
    priorities: ["city", "tech", "economy", "design"], colors: ["white", "black", "gray", "blue", "green"],
    tagline: "純電城市生活，縮到剛剛好。", note: "尺碼靈巧、純電安靜，適合有固定充電條件且多在市區活動的車主。",
    url: "https://www.hyundai-motor.com.tw/INSTER"
  },
  {
    name: "Honda CR-V", variant: "VTi-S 起", price: 99.9, priceLabel: "99.9–129.9 萬", body: "suv", power: "gas", seats: 5,
    priorities: ["space", "comfort", "value", "tech"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "一家人的行李和期待，都裝得下。", note: "空間機能與乘坐舒適是強項，適合家庭出遊頻繁、重視後座感受的人。",
    url: "https://www.honda-taiwan.com.tw/Auto/Cars/CR-V"
  },
  {
    name: "Mazda CX-5", variant: "20S 淬鍊版起", price: 104.9, priceLabel: "104.9 萬起", body: "suv", power: "gas", seats: 5,
    priorities: ["driving", "comfort", "design", "space"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "成熟好開，還有一點不肯無聊。", note: "底盤與質感出色，適合需要家庭空間、又仍然在乎駕駛回饋的人。",
    url: "https://www.mazda.com.tw/cars/mazda-cx-5/"
  },
  {
    name: "Hyundai Tucson L Hybrid", variant: "Premium-A 起", price: 111.9, priceLabel: "111.9–125.9 萬", body: "suv", power: "hybrid", seats: 5,
    priorities: ["tech", "space", "economy", "comfort"], colors: ["white", "black", "gray", "blue", "green"],
    tagline: "大空間、強科技，油耗也懂得節制。", note: "配備豐富、空間寬敞，適合科技控與長途移動比例高的小家庭。",
    url: "https://www.hyundai-motor.com.tw/TUCSON10SP"
  },
  {
    name: "Toyota Prius PHEV", variant: "旗艦版起", price: 129.9, priceLabel: "129.9–137.9 萬", body: "hatch", power: "hybrid", seats: 5,
    priorities: ["economy", "tech", "design", "driving"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "把節能車，開成一件有型的事。", note: "可充電、也能加油，適合想體驗電動通勤又不想承受里程焦慮的人。",
    url: "https://www.toyota.com.tw/showroom/PRIUS_PHEV/"
  },
  {
    name: "Hyundai Custin", variant: "GLT-A 起", price: 130.9, priceLabel: "130.9 萬起", body: "mpv", power: "gas", seats: 7,
    priorities: ["space", "comfort", "value", "tech"], colors: ["white", "black", "gray", "blue"],
    tagline: "七個人的舒適，不需要互相妥協。", note: "正七人座與側滑門機能完整，適合常載長輩、孩子或多人出遊的家庭。",
    url: "https://www.hyundai-motor.com.tw/CUSTIN"
  },
  {
    name: "Mazda MX-5 RF", variant: "自排車型", price: 158, priceLabel: "約 158 萬起", body: "sports", power: "gas", seats: 2,
    priorities: ["driving", "design", "city"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "不是為了載更多，是為了感受更多。", note: "輕巧後驅與雙座設定非常純粹，適合把駕駛本身當作目的的人。",
    url: "https://www.mazda.com.tw/cars/mazda-mx-5/"
  },
  {
    name: "Hyundai Santa Fe", variant: "Calligraphy 起", price: 172.9, priceLabel: "172.9 萬起", body: "suv", power: "hybrid", seats: 7,
    priorities: ["space", "comfort", "tech", "design"], colors: ["white", "black", "gray", "blue", "green"],
    tagline: "把全家人的遠方，變成舒服的日常。", note: "三排乘坐、方正大空間與完整科技，適合重視長途舒適的多人家庭。",
    url: "https://www.hyundai-motor.com.tw/SANTAFE"
  },
  {
    name: "Hyundai Staria CEO", variant: "CEO 七人座", price: 198.8, priceLabel: "約 198.8 萬起", body: "mpv", power: "diesel", seats: 7,
    priorities: ["space", "comfort", "tech", "design"], colors: ["white", "black", "gray", "blue"],
    tagline: "把七人移動，做成一間頭等艙。", note: "大七人座、雙側滑門與豪華第二排，適合重視商務接待或全家長途舒適的人。",
    url: "https://www.hyundai-motor.com.tw/car-style-23.html"
  },
  {
    name: "Tesla Model Y", variant: "後輪驅動版", price: 189.99, priceLabel: "約 189.99 萬起", body: "suv", power: "electric", seats: 5,
    priorities: ["tech", "space", "economy", "comfort"], colors: ["white", "black", "gray", "blue", "red"],
    tagline: "軟體、空間與電動效率，一次到位。", note: "適合有家用充電、喜歡科技生態與大置物空間的純電家庭。",
    url: "https://www.tesla.com/zh_tw/modely"
  }
];

const brandProfiles = {
  Toyota: {
    name: "Toyota", monogram: "T", origin: "1937 / JAPAN", chapter: "可靠，不只是個性；而是一套能被複製的能力。",
    story: "Toyota 在 1937 年成立汽車公司，從日本國產車的試製與量產出發，逐步建立大眾車生產體系。面對石油危機、環保與安全需求，它把持續改善的製造文化延伸到油電技術與全球產品布局，讓規模、品質與效率成為同一件事。",
    position: "大眾市場的可靠效率派",
    positioning: "在台灣從小型車、房車、休旅到商用車都有完整布局；核心吸引力不是單一規格最搶眼，而是妥善、油耗、後勤與轉售價值形成的低風險選擇。",
    keywords: ["可靠耐用", "成熟油電", "完整後勤"],
    source: "https://global.toyota/en/company/trajectory-of-toyota/history/"
  },
  Hyundai: {
    name: "Hyundai", monogram: "H", origin: "1967 / KOREA", chapter: "從追趕者到挑戰者，速度本身就是品牌性格。",
    story: "Hyundai Motor 在 1967 年成立，隔年於蔚山展開生產。1976 年推出韓國第一款自主開發量產乘用車 Pony，之後陸續完成自研引擎、全球設廠，並投入氫能與純電。2024 年，它在成立 57 年後達成全球累計生產一億輛。",
    position: "高配備、高設計感的科技挑戰者",
    positioning: "在台灣常用同級較豐富的科技與安全配備，加上鮮明造型、油電與純電產品，挑戰日系主流選擇；適合想買得務實、又不想太保守的人。",
    keywords: ["科技配備", "大膽設計", "新能源"],
    source: "https://www.hyundai.com/worldwide/en/footer/corporate/history/1967-2000"
  },
  Mazda: {
    name: "Mazda", monogram: "M", origin: "1920 / HIROSHIMA", chapter: "規模不必最大，也能把自己的感覺做得最清楚。",
    story: "Mazda 於 1920 年在廣島以東洋軟木工業起家，後轉向機械製造，1931 年推出三輪貨車 Mazda-go。戰後它協助廣島重建，也持續以轉子引擎、輕量跑車與獨特設計走出自己的路，『挑戰常規』成為百年歷史裡反覆出現的線索。",
    position: "把設計與駕駛感受放在前面的精品日系",
    positioning: "產品線不追求包山包海，而是用一致的外型、座艙質感與人車互動建立辨識度。適合在實用之外，仍在意每天握方向盤時有沒有感覺的人。",
    keywords: ["魂動設計", "人馬一體", "質感座艙"],
    source: "https://www.mazda.com/en/about/history/"
  },
  Honda: {
    name: "Honda", monogram: "H", origin: "1948 / JAPAN", chapter: "先問技術能替人做什麼，再決定機器該長什麼樣子。",
    story: "Soichiro Honda 在戰後以自行車輔助引擎起步，1948 年成立 Honda Motor，並與 Takeo Fujisawa 一起把小型機車公司推向全球。從機車跨入汽車、參加 F1 到開發低污染 CVCC 引擎，Honda 的歷史一直帶著工程師不怕做難題的氣質。",
    position: "工程思維濃厚的空間效率派",
    positioning: "Honda 的 M/M『乘員空間最大、機械空間最小』哲學，反映在座艙與機能設計；在台灣的定位兼顧家用實用性、動力效率與一點駕駛樂趣。",
    keywords: ["工程精神", "空間效率", "動力技術"],
    source: "https://global.honda/en/about/history-digest/75years-history/chapter1/section1/"
  },
  Tesla: {
    name: "Tesla", monogram: "T", origin: "2003 / U.S.A.", chapter: "它不是替汽車加上軟體，而是從軟體重新想像汽車。",
    story: "Tesla 以加速世界轉向永續能源為長期使命，從純電跑車切入，再把電動車、快充、家用電池與大型儲能串成能源生態。它證明純電車可以同時具備性能、長途能力與持續更新的數位體驗，也迫使整個產業加速電動化。",
    position: "軟體定義汽車的純電科技品牌",
    positioning: "在台灣的核心優勢是車機、OTA 更新、充電網絡與高電能效率。適合有穩定充電條件，且能接受極簡操作與數位優先服務模式的人。",
    keywords: ["軟體體驗", "充電生態", "純電效率"],
    source: "https://www.tesla.com/about"
  }
};

const supplementalCars = window.JARVIS_MARKET_CARS || [];
supplementalCars.forEach(car => {
  if (!cars.some(existing => existing.name.toLowerCase() === car.name.toLowerCase())) cars.push(car);
});
Object.assign(brandProfiles, window.JARVIS_BRANDS || {});
const dataMeta = window.JARVIS_DATA_META || {};

const budgetBands = {
  under80: { min: 0, max: 80, label: "80 萬內" },
  "80to100": { min: 80, max: 100, label: "80–100 萬" },
  "100to130": { min: 100, max: 130, label: "100–130 萬" },
  "130to180": { min: 130, max: 180, label: "130–180 萬" },
  "180to250": { min: 180, max: 250, label: "180–250 萬" },
  "250to400": { min: 250, max: 400, label: "250–400 萬" },
  "400to800": { min: 400, max: 800, label: "400–800 萬" },
  over800: { min: 800, max: Infinity, label: "800 萬以上" }
};

const labels = {
  body: { suv: "休旅 SUV", sedan: "房車", hatch: "掀背車", mpv: "MPV", sports: "跑車" },
  power: { gas: "汽油", hybrid: "油電 / PHEV", electric: "純電", diesel: "柴油" },
  origin: { any: "不限車系", europe: "歐系", america: "美系", japan: "日系", korea: "韓系", other: "其他車系" },
  seats: { 2: "1–2 人", 5: "3–5 人", 7: "6–7 人" },
  priority: {
    any: "不限",
    city: "市區好停", economy: "節能", space: "空間", comfort: "舒適", driving: "駕駛樂趣", tech: "科技", design: "設計", value: "CP 值",
    safety: "主動安全", family: "家庭友善", cargo: "載物露營", charging: "充電便利", resale: "保值好養", luxury: "豪華質感", offroad: "戶外越野", performance: "加速性能"
  },
  color: { any: "不限", white: "珍珠白", black: "曜石黑", gray: "質感灰", blue: "深海藍", red: "個性紅", green: "戶外綠" }
};

const colorHex = { white: "#e9e6dc", black: "#202323", gray: "#7b807c", blue: "#2d6178", red: "#b94335", green: "#536d5d" };
const accentColors = ["#d5e64d", "#f0a44c", "#91c7c2"];
const officialBrandUrls = {
  Toyota: "https://www.toyota.com.tw/showroom/",
  Lexus: "https://www.lexus.com.tw/",
  Honda: "https://www.honda-taiwan.com.tw/Auto",
  Nissan: "https://www.nissan.com.tw/",
  Mitsubishi: "https://www.mitsubishi-motors.com.tw/",
  Subaru: "https://www.subaru.asia/tw/zh/home/",
  Suzuki: "https://www.suzukimotor.com.tw/",
  Mazda: "https://www.mazda.com.tw/cars/",
  Hyundai: "https://www.hyundai-motor.com.tw/",
  Kia: "https://www.kia.com/tw/",
  Ford: "https://www.ford.com.tw/",
  Tesla: "https://www.tesla.com/zh_tw/",
  Volkswagen: "https://www.volkswagen.com.tw/",
  "Volkswagen Commercial Vehicles": "https://www.volkswagen-commercial.com.tw/",
  Skoda: "https://www.skoda.com.tw/",
  Škoda: "https://www.skoda.com.tw/",
  "?koda": "https://www.skoda.com.tw/",
  Audi: "https://www.audi.com.tw/",
  BMW: "https://www.bmw.com.tw/",
  "Mercedes-Benz": "https://www.mercedes-benz.com.tw/",
  Porsche: "https://www.porsche.com/taiwan/zh/",
  Volvo: "https://www.volvocars.com/tw/",
  Peugeot: "https://www.peugeot.com.tw/",
  Citroën: "https://www.citroen.com.tw/",
  "Citro禱n": "https://www.citroen.com.tw/",
  Opel: "https://www.opel.tw/",
  MG: "https://www.mgmotor.com.tw/",
  CMC: "https://www.china-motor.com.tw/",
  Luxgen: "https://www.luxgen-motor.com.tw/",
  "Alfa Romeo": "https://www.alfaromeo.com.tw/",
  Jaguar: "https://www.jaguar.tw/",
  "Land Rover": "https://www.landrover.tw/",
  Mini: "https://www.mini.com.tw/",
  MINI: "https://www.mini.com.tw/",
  Bentley: "https://www.bentleymotors.com/",
  "Rolls-Royce": "https://www.rolls-roycemotorcars.com/",
  "Aston Martin": "https://www.astonmartin.com/",
  Lotus: "https://www.lotuscars.com/",
  McLaren: "https://cars.mclaren.com/",
  Ferrari: "https://www.ferrari.com/",
  Lamborghini: "https://www.lamborghini.com/",
  Maserati: "https://www.maserati.com/tw/zh",
  Ineos: "https://ineosgrenadier.com/"
};
const brandOrigins = {
  Toyota: "japan", Lexus: "japan", Honda: "japan", Nissan: "japan", Mitsubishi: "japan", Subaru: "japan", Suzuki: "japan", Mazda: "japan",
  Hyundai: "korea", Kia: "korea",
  Ford: "america", Tesla: "america", Jeep: "america",
  Volkswagen: "europe", "Volkswagen Commercial Vehicles": "europe", Skoda: "europe", Škoda: "europe", "?koda": "europe", Audi: "europe",
  BMW: "europe", "Mercedes-Benz": "europe", Porsche: "europe", Volvo: "europe", Peugeot: "europe", Citroën: "europe", "Citro禱n": "europe",
  Opel: "europe", MG: "europe", "Alfa Romeo": "europe", Jaguar: "europe", "Land Rover": "europe", Mini: "europe",
  Bentley: "europe", "Rolls-Royce": "europe", "Aston Martin": "europe", Lotus: "europe", McLaren: "europe", Ferrari: "europe",
  Lamborghini: "europe", Maserati: "europe", Ineos: "europe"
};
const filterOrder = ["budget", "origin", "body", "power", "seats", "priorities"];
const form = document.querySelector("#carForm");
const results = document.querySelector("#results");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const priorityInputs = [...document.querySelectorAll('input[name="priorities"]')];
const mobileMatchButton = document.querySelector("#mobileMatchButton");
const mobileDockProgress = document.querySelector("#mobileDockProgress");
let currentMatches = [];
let autoRefreshTimer;
let shouldScrollResults = true;

function queueAutoRecommendation() {
  if (results.classList.contains("hidden")) return;
  window.clearTimeout(autoRefreshTimer);
  autoRefreshTimer = window.setTimeout(() => {
    shouldScrollResults = false;
    form.requestSubmit();
    shouldScrollResults = true;
  }, 160);
}

function getProfile() {
  const data = new FormData(form);
  const selectedPriorities = data.getAll("priorities");
  const priorityAny = selectedPriorities.includes("any");
  return {
    budget: data.get("budget"), body: data.get("body"), origin: data.get("origin") || "any", power: data.get("power"), seats: data.get("seats"),
    priorities: priorityAny ? [] : selectedPriorities, priorityAny, color: data.get("color")
  };
}

function getBrandName(car) {
  return car.brand || Object.keys(brandProfiles).find(brand => car.name.startsWith(brand)) || car.name.split(" ")[0];
}

function getCarOrigin(car) {
  return brandOrigins[getBrandName(car)] || "other";
}

function getCarOriginLabel(car) {
  return labels.origin[getCarOrigin(car)] || labels.origin.other;
}

function getCarInfoLink(car) {
  const brand = getBrandName(car);
  const originalUrl = car.url || "";
  const brandOfficialUrl = officialBrandUrls[brand];
  const fallbackUrl = brandOfficialUrl || brandProfiles[brand]?.source || originalUrl;
  const url = fallbackUrl || dataMeta.sourceUrl || "#";
  const fromCatalog = /u-car\.com\.tw/i.test(url);
  return {
    url,
    isBrandEntry: Boolean(brandOfficialUrl),
    label: brandOfficialUrl ? `前往 ${brand} 官網確認是否仍販售 ↗` : fromCatalog ? "查看車款資料來源 ↗" : "查看品牌/車款資訊 ↗"
  };
}

function chooseColor(car, preferredColor) {
  if (preferredColor && preferredColor !== "any" && car.colors.includes(preferredColor)) return preferredColor;
  return car.colors[0] || "gray";
}

function displayColorLabel(chosenColor, preferredColor) {
  if (preferredColor === "any") return "車色不限";
  return `${labels.color[chosenColor] || "車色"}示意`;
}

function getCarPrioritySet(car) {
  const brand = getBrandName(car);
  const name = car.name.toLowerCase();
  const set = new Set(car.priorities || []);
  const valueBrands = ["Toyota", "Honda", "Lexus", "Suzuki", "Mazda", "Subaru", "Nissan", "Mitsubishi", "Kia", "Hyundai"];
  const luxuryBrands = ["Lexus", "Audi", "BMW", "Mercedes-Benz", "Porsche", "Volvo", "Jaguar", "Land Rover", "Bentley", "Rolls-Royce", "Aston Martin", "Lotus", "McLaren", "Ferrari", "Lamborghini", "Maserati"];

  if (set.has("tech") || ["Volvo", "Subaru", "Mercedes-Benz", "Lexus", "Toyota", "Honda", "Mazda", "Hyundai", "Kia", "Tesla"].includes(brand)) set.add("safety");
  if (car.seats >= 7 || car.body === "mpv" || (car.body === "suv" && set.has("space"))) set.add("family");
  if (["suv", "mpv", "hatch"].includes(car.body) || /wagon|van|truck|pickup|touring|avant|caddy|delica|veryca|zinger|hilux|ranger|grenadier|defender/i.test(name)) set.add("cargo");
  if (["electric", "hybrid"].includes(car.power)) set.add("charging");
  if (valueBrands.includes(brand) || set.has("value")) set.add("resale");
  if (luxuryBrands.includes(brand) || car.price >= 180) set.add("luxury");
  if (["Land Rover", "Subaru", "Suzuki", "Ineos", "Jeep"].includes(brand) || /jimny|defender|discovery|range rover|outback|forester|crosstrek|grenadier|hilux|ranger|land cruiser/i.test(name)) set.add("offroad");
  if (car.body === "sports" || set.has("driving") || /amg|m sport|type r|gr |rs |m[2345]|gt|911|supra|mustang|brz|wrx|artura|ferrari|lamborghini|mclaren/i.test(name)) set.add("performance");
  return set;
}

function updateProgress() {
  const profile = getProfile();
  const percent = (profile.budget ? 30 : 0) + (profile.seats ? 30 : 0) + (profile.priorityAny || profile.priorities.length ? 40 : 0);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
  mobileDockProgress.textContent = `完成 ${percent}%`;
}

function updatePriorityLimit(changedInput) {
  const anyInput = priorityInputs.find(input => input.value === "any");
  if (changedInput?.value === "any" && changedInput.checked) {
    priorityInputs.forEach(input => {
      if (input.value !== "any") input.checked = false;
    });
  } else if (changedInput?.name === "priorities" && changedInput.checked && changedInput.value !== "any" && anyInput) {
    anyInput.checked = false;
  }

  const checkedSpecific = priorityInputs.filter(input => input.checked && input.value !== "any");
  const anyChecked = Boolean(anyInput?.checked);
  const full = checkedSpecific.length >= 3;
  priorityInputs.forEach(input => {
    input.disabled = !anyChecked && full && !input.checked && input.value !== "any";
    input.closest("label").classList.toggle("disabled", input.disabled);
  });
  document.querySelector("#priorityCounter").textContent = anyChecked ? "不限" : checkedSpecific.length ? `已選 ${checkedSpecific.length} / 3 項` : "可選 3 項，或選不限";
}

function formatDataDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replace(/\//g, ".");
}

function renderDataFreshness() {
  const label = formatDataDate(dataMeta.updatedAt);
  const status = document.querySelector("#dataStatus");
  const disclaimer = document.querySelector("#catalogDisclaimer");
  if (status && label) {
    status.innerHTML = `<span class="status-dot"></span>`;
    status.append(`台灣新車資料・每週更新・${label}`);
  }
  if (disclaimer) {
    const source = dataMeta.sourceName || "台灣新車目錄";
    disclaimer.textContent = `收錄範圍：台灣總代理或原廠授權通路公開販售／接單的新乘用車與輕型商用車車系；不含中古車、平行輸入及僅剩歷史網頁的停售車。車款與價格每週自動比對${source}${label ? `，最後更新 ${label}` : ""}。`;
  }
}

function budgetScore(price, band) {
  if (price >= band.min && price <= band.max) return 38;
  if (price < band.min) {
    const gap = band.min - price;
    return Math.max(12, 32 - gap * .65);
  }
  const gap = price - band.max;
  return Math.max(-28, 24 - gap * 1.9);
}

function scoreCar(car, profile) {
  const band = budgetBands[profile.budget];
  let score = budgetScore(car.price, band);
  const reasons = [];

  if (profile.body === "any") score += 6;
  else if (car.body === profile.body) { score += 18; reasons.push(`符合你偏好的${labels.body[car.body]}`); }
  else score -= 10;

  if (profile.power === "any") score += 5;
  else if (car.power === profile.power) { score += 15; reasons.push(`${labels.power[car.power]}動力符合你的選擇`); }
  else score -= 12;

  const neededSeats = Number(profile.seats);
  if (car.seats >= neededSeats) {
    score += neededSeats === 7 && car.seats === 7 ? 20 : 12;
    if (neededSeats >= 5) reasons.push(`${car.seats} 人座符合乘坐需求`);
  } else score -= 32;

  const carPrioritySet = getCarPrioritySet(car);
  const matchedPriorities = profile.priorities.filter(p => carPrioritySet.has(p));
  score += matchedPriorities.length * 9;
  if (matchedPriorities.length) reasons.push(`強項正好是${matchedPriorities.slice(0, 2).map(p => labels.priority[p]).join("與")}`);

  if (profile.color !== "any" && car.colors.includes(profile.color)) { score += 4; reasons.push(`提供接近${labels.color[profile.color]}的原廠車色`); }
  if (car.price <= band.max || band.max === Infinity) reasons.unshift(`建議售價落在你的預算帶內`);

  return { ...car, rawScore: score, reasons: reasons.slice(0, 3) };
}

function matchesSelectedConditions(car, profile, ignore = "") {
  const ignored = new Set(Array.isArray(ignore) ? ignore : [ignore]);
  const band = budgetBands[profile.budget];
  if (!ignored.has("budget") && band && (car.price < band.min || car.price > band.max)) return false;
  if (!ignored.has("origin") && profile.origin !== "any" && getCarOrigin(car) !== profile.origin) return false;
  if (!ignored.has("body") && profile.body !== "any" && car.body !== profile.body) return false;
  if (!ignored.has("power") && profile.power !== "any" && car.power !== profile.power) return false;
  if (!ignored.has("seats") && car.seats < Number(profile.seats)) return false;
  if (!ignored.has("priorities") && profile.priorities.length) {
    const carPrioritySet = getCarPrioritySet(car);
    if (!profile.priorities.some(priority => carPrioritySet.has(priority))) return false;
  }
  return true;
}

function getMatchingCars(profile, ignore = "") {
  return cars.filter(car => matchesSelectedConditions(car, profile, ignore));
}

function uniqueLabels(values) {
  return [...new Set(values)].filter(Boolean);
}

function summarizeSuggestionValues(key, candidates, profile) {
  if (key === "budget") {
    return Object.entries(budgetBands)
      .filter(([id, band]) => id !== profile.budget && candidates.some(car => car.price >= band.min && car.price <= band.max))
      .map(([, band]) => band.label)
      .slice(0, 3);
  }
  if (key === "origin") return uniqueLabels(candidates.map(getCarOrigin).filter(origin => origin !== profile.origin).map(origin => labels.origin[origin] || labels.origin.other)).slice(0, 4);
  if (key === "body") return uniqueLabels(candidates.map(car => car.body).filter(body => body !== profile.body).map(body => labels.body[body])).slice(0, 3);
  if (key === "power") return uniqueLabels(candidates.map(car => car.power).filter(power => power !== profile.power).map(power => labels.power[power])).slice(0, 3);
  if (key === "seats") {
    const neededSeats = Number(profile.seats);
    return uniqueLabels(candidates
      .map(car => car.seats >= 7 ? "7" : car.seats >= 5 ? "5" : "2")
      .filter(value => Number(value) < neededSeats)
      .map(value => labels.seats[value]))
      .slice(0, 2);
  }
  if (key === "priorities") {
    const selected = new Set(profile.priorities);
    const counts = {};
    candidates.forEach(car => getCarPrioritySet(car).forEach(priority => {
      if (!selected.has(priority)) counts[priority] = (counts[priority] || 0) + 1;
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([priority]) => labels.priority[priority]).filter(Boolean).slice(0, 3);
  }
  return [];
}

function buildNoMatchSuggestions(profile) {
  const fieldLabels = {
    budget: "預算",
    origin: "車系來源",
    body: "車身類型",
    power: "動力",
    seats: "乘坐人數",
    priorities: "最在意的事"
  };
  const tips = filterOrder.map(key => {
    const candidates = getMatchingCars(profile, key);
    if (key === "priorities" && !profile.priorities.length) return null;
    if (!candidates.length) return null;
    const values = summarizeSuggestionValues(key, candidates, profile);
    const valueText = values.length ? `，例如改成 ${values.join("、")}` : "";
    return `可以先調整「${fieldLabels[key]}」${valueText}，目前會出現 ${candidates.length} 台可推薦車款。`;
  }).filter(Boolean);

  if (tips.length) return tips.slice(0, 4);

  for (let i = 0; i < filterOrder.length; i += 1) {
    for (let j = i + 1; j < filterOrder.length; j += 1) {
      const pairCandidates = getMatchingCars(profile, [filterOrder[i], filterOrder[j]]);
      if (pairCandidates.length) {
        return [`單改一項仍然太窄；建議同時放寬「${fieldLabels[filterOrder[i]]}」與「${fieldLabels[filterOrder[j]]}」，會出現 ${pairCandidates.length} 台可推薦車款。`];
      }
    }
  }

  return ["目前條件太精準，建議先把「車系來源」或「車身類型」改成不限，再重新篩選。"];
}

function normalizeScores(scored) {
  const high = scored[0].rawScore;
  const low = scored[Math.min(scored.length - 1, 8)].rawScore;
  return scored.map((car, index) => ({
    ...car,
    match: Math.max(72, Math.min(98, Math.round(86 + ((car.rawScore - low) / Math.max(1, high - low)) * 12 - index * 1.2)))
  }));
}

function carSvg(car, color, className = "", colorLabel = "車色") {
  const isSports = car.body === "sports";
  const isSedan = car.body === "sedan" || car.body === "hatch";
  const roofPath = isSports
    ? "M275 126c19-38 45-57 79-57h102c31 0 52 18 78 71"
    : isSedan
      ? "M220 151l77-75c14-13 32-20 51-20h108c23 0 44 9 61 25l78 75"
      : "M214 153l69-77c13-14 30-22 50-22h151c23 0 45 10 60 28l62 74";
  const bodyPath = isSports
    ? "M90 211c37-25 104-38 178-48l30-48h219l77 54c39 7 72 22 90 43 9 11 14 25 14 42v12H69v-14c0-16 7-30 21-41Z"
    : "M88 211c16-29 50-45 106-52l70-74c14-15 32-23 53-23h159c25 0 48 10 64 29l62 70c38 7 69 17 88 32 16 13 25 32 25 52v14H70v-18c0-18 6-34 18-50Z";
  return `<div class="car-art ${className}" style="--car-color:${color}">
    <svg viewBox="0 0 760 330" role="img" aria-label="${car.name} ${colorLabel}示意圖">
      <path class="car-shadow" d="M92 280c43 25 497 25 562 0-90-19-471-20-562 0Z"/>
      <path class="car-body" d="${bodyPath}"/>
      <path class="car-glass" d="${roofPath} M290 94l-56 64h143V81h-52c-13 0-25 5-35 13Zm115-13v77h171l-59-62c-9-10-22-15-37-15h-75Z"/>
      <path class="car-line" d="M389 82v76M211 171h401M89 217h58M620 202h58"/>
      <path class="car-light" d="M628 179c27 6 45 13 56 23l-57 4c-13 1-21-5-24-16l-2-17 27 6Z"/>
      <path class="car-light rear" d="M100 190c16-13 35-21 57-24l-3 30c-1 10-8 15-20 15H90l10-21Z"/>
      <g class="wheel"><circle cx="199" cy="259" r="55"/><circle cx="199" cy="259" r="25"/></g>
      <g class="wheel"><circle cx="578" cy="259" r="55"/><circle cx="578" cy="259" r="25"/></g>
    </svg>
  </div>`;
}

function renderWinner(car, profile) {
  const chosenColor = chooseColor(car, profile.color);
  const colorLabel = displayColorLabel(chosenColor, profile.color);
  const infoLink = getCarInfoLink(car);
  const reasons = car.reasons.length ? car.reasons : [car.note, "整體條件最接近你的用車輪廓"];
  document.querySelector("#winnerCard").innerHTML = `
    <div class="winner-visual" style="--winner-bg:${accentColors[0]}">
      <div class="match-badge"><b>${car.match}%</b><small>MATCH</small></div>
      ${carSvg(car, colorHex[chosenColor], "winner-car", colorLabel)}
    </div>
    <div class="winner-info">
      <span class="winner-rank">NO. 01 / BEST MATCH</span>
      <h3>${car.name}</h3>
      <span class="variant">${car.variant} · ${car.tagline}</span>
      <div class="winner-price"><b>${car.priceLabel}</b></div>
      <div class="spec-row"><span>${getCarOriginLabel(car)}</span><span>${labels.body[car.body]}</span><span>${labels.power[car.power]}</span><span>${car.seats} 人座</span><span>${colorLabel}</span></div>
      <ul class="reason-list">${reasons.map(reason => `<li>${reason}</li>`).join("")}</ul>
      <a class="official-link" href="${infoLink.url}" target="_blank" rel="noopener">${infoLink.label}</a>
      ${infoLink.isBrandEntry ? `<p class="availability-note">如果官網只回到首頁或找不到此車款，代表原廠單車款頁可能已下架、暫停販售或改版；實際能否購買請以原廠與展間最新公告為準。</p>` : ""}
    </div>`;
}

function getBrandProfile(car) {
  const brandName = car.brand || Object.keys(brandProfiles).find(brand => car.name.startsWith(brand));
  return brandProfiles[brandName] || brandProfiles.Toyota;
}

function renderCatalog(query = "") {
  const needle = query.trim().toLowerCase();
  const grouped = cars.reduce((map, car) => {
    const brand = car.brand || Object.keys(brandProfiles).find(name => car.name.startsWith(name)) || car.name.split(" ")[0];
    if (!map[brand]) map[brand] = [];
    map[brand].push(car);
    return map;
  }, {});
  const visibleGroups = Object.entries(grouped).filter(([brand, models]) => !needle || brand.toLowerCase().includes(needle) || models.some(car => `${car.name} ${labels.body[car.body]} ${labels.power[car.power]} ${car.seats}人座`.toLowerCase().includes(needle)));
  document.querySelector("#catalogGrid").innerHTML = visibleGroups.sort(([a], [b]) => a.localeCompare(b, "en")).map(([brand, models]) => `
    <details class="catalog-brand" ${needle ? "open" : ""}>
      <summary><b>${brand}</b><span>${models.length} 車系 ＋</span></summary>
      <div>${models.sort((a, b) => a.price - b.price).map(car => {
        const infoLink = getCarInfoLink(car);
        return `<a href="${infoLink.url}" target="_blank" rel="noopener"><b>${car.name.replace(`${brand} `, "")}</b><span>${car.priceLabel} · ${labels.power[car.power]} · ${car.seats} 人座</span></a>`;
      }).join("")}</div>
    </details>`).join("") || `<p class="catalog-empty">找不到符合「${query}」的車系。</p>`;
  document.querySelector("#brandCount").textContent = Object.keys(grouped).length;
  document.querySelector("#modelCount").textContent = cars.length;
  document.querySelector("#catalogCount").textContent = cars.length;
}

function renderBrandStory(car) {
  const brand = getBrandProfile(car);
  document.querySelector("#brandStory").innerHTML = `
    <div class="brand-identity">
      <span class="brand-section-label">BRAND PROFILE</span>
      <div class="brand-monogram" aria-hidden="true">${brand.monogram}</div>
      <div><b>${brand.name}</b><small>${brand.origin}</small></div>
    </div>
    <div class="brand-narrative">
      <span class="brand-eyebrow">THE STORY BEHIND THE BADGE</span>
      <h3>${brand.chapter}</h3>
      <p>${brand.story}</p>
      <div class="brand-positioning">
        <span>JARVIS 定位判讀</span>
        <h4>${brand.position}</h4>
        <p>${brand.positioning}</p>
        <div class="brand-keywords">${brand.keywords.map(keyword => `<b># ${keyword}</b>`).join("")}</div>
      </div>
      <a href="${brand.source}" target="_blank" rel="noopener">閱讀 ${brand.name} 官方品牌歷史 ↗</a>
    </div>`;
}

function renderAlternatives(carsToRender, profile) {
  document.querySelector("#alternatives").innerHTML = carsToRender.map((car, index) => {
    const chosenColor = chooseColor(car, profile.color);
    const colorLabel = displayColorLabel(chosenColor, profile.color);
    return `<article class="alternative-card">
      <div class="alt-visual" style="--alt-bg:${accentColors[index + 1]}">
        <span class="alt-score">${car.match}% MATCH</span>
        ${carSvg(car, colorHex[chosenColor], "alt-car", colorLabel)}
      </div>
      <div class="alt-info"><small>NO. 0${index + 2}</small><h4>${car.name}</h4><span>${car.priceLabel} · ${labels.power[car.power]}</span><p>${car.note}</p></div>
    </article>`;
  }).join("");
}

function renderNoRecommendation(profile) {
  currentMatches = [];
  const tips = buildNoMatchSuggestions(profile);
  const originText = labels.origin[profile.origin] || labels.origin.any;
  const bodyText = profile.body === "any" ? "不限車型" : labels.body[profile.body];
  const powerText = profile.power === "any" ? "不限動力" : labels.power[profile.power];
  const priorityText = profile.priorities.length ? profile.priorities.map(priority => labels.priority[priority]).filter(Boolean).join("、") : "不指定特定重點";
  const priorityClause = profile.priorities.length ? `再加上你在意的 ${priorityText}` : priorityText;
  document.querySelector("#resultSummary").textContent = `目前條件是 ${originText}、${budgetBands[profile.budget].label}、${bodyText}、${powerText}、${labels.seats[profile.seats]}，${priorityClause}；台灣新車清單裡暫時沒有同時符合的推薦。`;
  document.querySelector("#winnerCard").innerHTML = `
    <div class="no-match-card">
      <small>NO MATCH FOUND</small>
      <h3>目前沒有推薦的車款。</h3>
      <p>不是你條件錯，而是這組條件在目前台灣可買的新車資料裡太精準了。可以先改下面其中一項，再讓 Jarvis 重新幫你配對。</p>
      <ul class="condition-tips">${tips.map(tip => `<li>${tip.replace(/「(.+?)」/g, "「<b>$1</b>」")}</li>`).join("")}</ul>
    </div>`;
  document.querySelector("#brandStory").classList.add("hidden");
  document.querySelector(".alternatives-wrap").classList.add("hidden");
}

form.addEventListener("change", event => {
  if (event.target.name === "priorities") updatePriorityLimit(event.target);
  updateProgress();
  document.querySelector("#formError").textContent = "";
  queueAutoRecommendation();
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const scrollAfterRender = shouldScrollResults;
  const profile = getProfile();
  const missing = [];
  if (!profile.budget) missing.push("預算");
  if (!profile.seats) missing.push("乘坐人數");
  if (!profile.priorityAny && !profile.priorities.length) missing.push("在意的重點");
  if (missing.length) {
    document.querySelector("#formError").textContent = `再選一下：${missing.join("、")}`;
    form.querySelector(`[data-question="${!profile.budget ? "budget" : !profile.seats ? "seats" : "priorities"}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const eligibleCars = getMatchingCars(profile);
  if (!eligibleCars.length) {
    renderNoRecommendation(profile);
    results.classList.remove("hidden");
    document.body.classList.add("results-ready");
    mobileMatchButton.querySelector("strong").textContent = "回看推薦";
    mobileDockProgress.textContent = scrollAfterRender ? "沒有推薦" : "條件已更新";
    if (scrollAfterRender) {
      requestAnimationFrame(() => results.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    return;
  }
  document.querySelector("#brandStory").classList.remove("hidden");
  document.querySelector(".alternatives-wrap").classList.remove("hidden");
  const scored = eligibleCars.map(car => scoreCar(car, profile)).sort((a, b) => b.rawScore - a.rawScore);
  currentMatches = normalizeScores(scored).slice(0, 3);
  renderWinner(currentMatches[0], profile);
  renderBrandStory(currentMatches[0]);
  renderAlternatives(currentMatches.slice(1), profile);
  const topPriorities = profile.priorities.length ? profile.priorities.slice(0, 2).map(p => labels.priority[p]).join("、") : "整體條件";
  const band = budgetBands[profile.budget];
  const originText = profile.origin === "any" ? "不限車系" : labels.origin[profile.origin];
  document.querySelector("#resultSummary").textContent = `在 ${band.label}、${originText} 的條件內，我們優先考量了${topPriorities}，再比對車型、動力與乘坐需求。`;
  results.classList.remove("hidden");
  document.body.classList.add("results-ready");
  mobileMatchButton.querySelector("strong").textContent = "回看推薦";
  mobileDockProgress.textContent = "推薦已完成";
  if (!scrollAfterRender) mobileDockProgress.textContent = "推薦已更新";
  if (scrollAfterRender) {
    requestAnimationFrame(() => results.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
});

document.querySelector("#restartButton").addEventListener("click", () => {
  results.classList.add("hidden");
  document.body.classList.remove("results-ready");
  mobileMatchButton.querySelector("strong").textContent = "產生推薦";
  form.reset();
  updatePriorityLimit();
  updateProgress();
  document.querySelector("#matcher").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#copyButton").addEventListener("click", async () => {
  if (!currentMatches.length) return;
  const profile = getProfile();
  const alternativesText = currentMatches.slice(1).map(car => car.name).join("、") || "目前沒有其他完全符合條件的備選";
  const text = `我的 Jarvis 選車推薦：${currentMatches[0].name}（${currentMatches[0].priceLabel}，${currentMatches[0].match}% 符合）\n候補：${alternativesText}\n條件：${labels.origin[profile.origin] || "不限車系"}、${labels.color[profile.color] || "不限"}。建議售價、規格與車色請以原廠最新公告為準。`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
  }
  const toast = document.querySelector("#toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
});

document.querySelector("#catalogSearch").addEventListener("input", event => renderCatalog(event.target.value));
mobileMatchButton.addEventListener("click", () => {
  if (!results.classList.contains("hidden")) results.scrollIntoView({ behavior: "smooth", block: "start" });
  else form.requestSubmit();
});
renderCatalog();
updateProgress();
renderDataFreshness();
