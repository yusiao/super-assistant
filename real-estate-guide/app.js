const lessons = [
  {
    title: "貸款不是只看信用",
    tag: "銀行額度、人、房子三件事一起看",
    summary: "從參考講義的「銀行水位」概念出發，建立保守估算：先看銀行當下放款策略，再看收入、年齡、信用與物件條件。",
    points: [
      "先用月收入和月付上限反推可貸金額，不用最高成數倒推人生。",
      "屋齡、坪數、違建、用途、地段與銀行估價都會影響成數。",
      "央行信用管制和銀行自主管理會改變核貸速度與可貸比例。"
    ]
  },
  {
    title: "地段價值要拆成四層",
    tag: "交通、就業、生活、風險",
    summary: "地段不是一句熱區。要分別看公共建設、就業人口、生活機能和嫌惡設施，並檢查它是已反映在房價，還是未來才可能發酵。",
    points: [
      "交通節點要看實際通勤時間，不只看地圖直線距離。",
      "重劃區看人口導入、商業成熟速度與空屋供給。",
      "學區、公園、市場是加分，噪音、淹水、殯葬、工業污染要扣分。"
    ]
  },
  {
    title: "預售、中古、老屋各有價格邏輯",
    tag: "產品沒有絕對好，只有是否適合",
    summary: "參考講義把預售、新成、新古、舊大樓、公寓拆成不同價值段。網站把它轉成選屋問題：你要時間、機能、價格，還是改造空間。",
    points: [
      "預售買的是未來和付款節奏，也要承擔完工與交屋時間不確定。",
      "中古大樓要看管理品質、社區財務、漏水與公設維護。",
      "老公寓總價低，但水電、樓梯、屋頂、外牆和鄰里關係更關鍵。"
    ]
  },
  {
    title: "看屋先看問題，不先看裝潢",
    tag: "漏水、格局、採光、管理",
    summary: "講義提醒舊屋要看真正屋況。網站把現場流程做成勾選清單，讓手機可以直接拿去看屋。",
    points: [
      "陽台、廚房、浴室維修孔、窗框和外牆是漏水優先區。",
      "白天看採光，晚上看噪音、停車和鄰居生活型態。",
      "裝潢漂亮不代表問題少，報價前要估修繕和拆除成本。"
    ]
  },
  {
    title: "簽約前，特約比制式條款更危險",
    tag: "審閱、特約、驗屋權利",
    summary: "參考資料提到預售合約多採標準版本，真正要小心的是手寫或另外加的特別約定。成屋則要看產權、點交和付款節點。",
    points: [
      "預售屋合約審閱期、付款表、交屋期限與驗屋方式要明確。",
      "不要讓特約排除驗屋、修繕、貸款不足或交屋瑕疵的基本保障。",
      "成屋簽約要看謄本、現況說明、產權限制、稅費分攤與點交清單。"
    ]
  },
  {
    title: "稅費和持有成本要先算",
    tag: "房地合一、契稅、地價稅、管理費",
    summary: "房地合一稅和自住條款會影響出場策略。持有期間越短，稅負與交易成本越容易吃掉價差。",
    points: [
      "短期交易先用官方所得稅法查稅率，不要只聽轉述。",
      "買入成本包含契稅、規費、代書、仲介、貸款開辦、裝修和搬家。",
      "持有成本包含房貸、管理費、房屋稅、地價稅、修繕準備金。"
    ]
  },
  {
    title: "市場高低點看變數組合",
    tag: "政策、信用、供給、去化",
    summary: "講義用人、時、地、事、物判斷市場。網站轉成四個可追蹤儀表：政策、信用、供給、地段。",
    points: [
      "政策轉折會先影響貸款和成交量，價格反應常比較慢。",
      "銀行收緊時，買方要多準備自備款與核貸時間。",
      "同一城市不同區的供需差很多，不要用全國新聞決定單一物件。"
    ]
  },
  {
    title: "出場策略在買入前就要想",
    tag: "保值性、流動性、下一位買方",
    summary: "自住也需要流動性。買入時先問：下一位買方會是誰，銀行願不願意貸，五年後同區替代品多不多。",
    points: [
      "高流動性通常來自總價帶、交通、標準格局、社區管理和可貸性。",
      "特殊產品如地上權、凶宅、農地、違建，要先想轉手和銀行承貸。",
      "出價前做最壞情境：收入下降、利率上升、晚一年出售是否撐得住。"
    ]
  }
];

const checks = [
  ["陽台與窗框", "看水痕、壁癌、窗邊矽利康老化與外牆滲水。"],
  ["廚房天花板", "檢查樓上排水位置、水漬、異味與管線維修便利性。"],
  ["浴室維修孔", "打開用手機照明，看排水管、天花板和防水狀況。"],
  ["格局與動線", "確認梁柱、採光、通風、家具尺度和未來改裝限制。"],
  ["社區管理", "看公告、垃圾間、機車位、管委會財報與修繕紀錄。"],
  ["周邊風險", "白天晚上各走一次，確認噪音、淹水、嫌惡設施與治安。"],
  ["產權資料", "調謄本，確認所有權、抵押、查封、使用分區與增建。"],
  ["實價比較", "同社區或同路段用屋齡、樓層、坪數、車位分組比較。"],
  ["貸款可行性", "出價前請銀行或房貸專員先估物件可貸成數與年限。"]
];

const marketNotes = {
  policy: {
    title: "政策先影響預期",
    body: "央行選擇性信用管制、平均地權條例、稅制和地方限管，都會改變買方資金和市場信心。",
    bullets: ["看最新央行新聞稿，不只看社群摘要。", "預售轉售、合約讓與與紅單規範要以最新法規為準。", "政策通常先打量，再影響價格。"]
  },
  credit: {
    title: "信用環境決定成交速度",
    body: "銀行水位、利率、審核標準與估價會直接影響你能不能買，以及賣方願不願意等。",
    bullets: ["先問可貸成數和核貸時間。", "收入穩定不等於物件一定好貸。", "保留現金比把成數拉滿更重要。"]
  },
  supply: {
    title: "供給看同質替代品",
    body: "重劃區、新案量、餘屋與交屋潮會影響議價空間。市中心中古屋則看同社區釋出量。",
    bullets: ["同區新案多，預售與中古會互相比價。", "交屋潮可能帶來出租與轉售壓力。", "低總價產品通常流動性較好，但也更競爭。"]
  },
  area: {
    title: "地段要回到生活半徑",
    body: "真正的地段價值是通勤、工作、學校、醫療、採買、休閒和風險的組合。",
    bullets: ["用尖峰通勤時間，不用地圖想像。", "重大建設要區分已定案、施工中、還在想像。", "買自己熟悉的動線，犯錯成本最低。"]
  }
};

const sourceMaterials = {
  generatedAt: "2026-07-11",
  totals: {
    indexed: 1040,
    teachingCandidates: 612,
    stockExcluded: 54
  },
  channels: [
    { name: "帥過頭講房地產 - 直播", total: 382, teaching: 293, stockExcluded: 16 },
    { name: "帥過頭講房地產 - 影片", total: 158, teaching: 91, stockExcluded: 21 },
    { name: "裝修小武郎 - 影片", total: 500, teaching: 291, stockExcluded: 17 }
  ],
  categories: [
    {
      id: "policy_credit",
      name: "政策與貸款",
      count: 153,
      angle: "轉成出價前的貸款風險表：看央行、銀行水位、新青安、首購換屋與核貸時間。",
      update: "貸款成數、寬限期、青年安心成家與央行信用管制，必須以央行、財政部與銀行最新規定重查。",
      videos: [
        ["新青安 2.0", "帥過頭講房地產", "https://www.youtube.com/watch?v=i3ei443VhWk"],
        ["央行第一波到第七波打房", "帥過頭講房地產", "https://www.youtube.com/watch?v=mReYkD345MQ"],
        ["三分鐘看完央行的決策", "帥過頭講房地產", "https://www.youtube.com/watch?v=-Emf2Lfxgas"],
        ["房市腰斬？央行重手打房見效", "裝修小武郎", "https://www.youtube.com/watch?v=oUCGoOu35Ws"]
      ]
    },
    {
      id: "area_research",
      name: "區域研究",
      count: 61,
      angle: "轉成地段判斷框架：交通節點、重劃供給、人口導入、生活半徑與實價驗證。",
      update: "區域推薦最容易過時，要重查實價登錄、建設進度、待售量、人口移入與實際通勤時間。",
      videos: [
        ["桃園航空城", "帥過頭講房地產", "https://www.youtube.com/watch?v=0Wk4wELbEzQ"],
        ["專家談桃園航空城", "帥過頭講房地產", "https://www.youtube.com/watch?v=bmWf_Rp0CIg"],
        ["全台各區深入研究#3 林口地區", "帥過頭講房地產", "https://www.youtube.com/watch?v=2HO6xDrhzcQ"],
        ["全台各區深入研究#6 板橋地區", "帥過頭講房地產", "https://www.youtube.com/watch?v=Yv6cnJiQhko"]
      ]
    },
    {
      id: "market_supply",
      name: "市場與供給",
      count: 223,
      angle: "轉成房市循環觀察：成交量、餘屋、建商資金、營建成本、代銷去化。",
      update: "市場判斷要同步查最新實價成交、建照使照、待售餘屋、銀行授信與官方統計。",
      videos: [
        ["全台待售餘屋衝新高", "裝修小武郎", "https://www.youtube.com/watch?v=_6yqPzLFjho"],
        ["3年後房市斷頭潮？平均地權條例讓預售屋降溫", "裝修小武郎", "https://www.youtube.com/watch?v=XDUedunBLrc"],
        ["建商土方之亂 事情很大條", "帥過頭講房地產", "https://www.youtube.com/watch?v=54AnGYgwyYE"],
        ["建商不倒台灣不會好", "帥過頭講房地產", "https://www.youtube.com/watch?v=HbLoekSmnH8"]
      ]
    },
    {
      id: "renovation_inspection",
      name: "裝修與看屋",
      count: 218,
      angle: "轉成看屋與裝修檢核：漏水、廚房、浴室、收納、地板材料、工班與報價風險。",
      update: "裝修成本、缺工、材料價格會變；報價前要抓當期行情並確認工班交期。",
      videos: [
        ["桃園最爭議建商：漏水案例", "裝修小武郎", "https://www.youtube.com/watch?v=r7XNmi9qlQs"],
        ["廚房最容易後悔的5個設計", "裝修小武郎", "https://www.youtube.com/watch?v=Q6Ggh97J84A"],
        ["25坪3招神改造", "裝修小武郎", "https://www.youtube.com/watch?v=9eIX9d3ZhS4"],
        ["木地板怎麼挑？SPC、超耐磨", "裝修小武郎", "https://www.youtube.com/watch?v=OQJuHimnxaU"]
      ]
    },
    {
      id: "contract_tax_risk",
      name: "合約稅務與風險",
      count: 83,
      angle: "轉成買房前的法律、稅務、產權和特殊產品風險提醒。",
      update: "稅制、都更容積、預售轉售、租賃與產權法律，要查全國法規資料庫與主管機關最新公告。",
      videos: [
        ["房子繼承錯一步，稅金差10倍", "裝修小武郎", "https://www.youtube.com/watch?v=CBZGCOZj83k"],
        ["都更一坪換一坪是騙人的？", "裝修小武郎", "https://www.youtube.com/watch?v=BTSrRYj6Qp0"],
        ["女友要求房貸82分、產權55分", "帥過頭講房地產", "https://www.youtube.com/watch?v=9qTj_sliWrM"],
        ["都更 VS 危老：如何選擇", "帥過頭講房地產", "https://www.youtube.com/watch?v=yDHvlO3JnNQ"]
      ]
    }
  ]
};

const plannerRooms = {
  entry: {
    name: "玄關",
    summary: "玄關先處理落塵、鞋櫃、掃地機與外出物品，不要讓櫃體吃掉開門迴轉半徑。",
    base: [
      "鞋櫃深度常見 35-40 公分，若要放安全帽或行李，局部要加深或改開放層。",
      "預留穿鞋椅、掛衣、雨傘和包包區，避免所有東西進屋後堆到餐桌。",
      "若要放掃地機，旁邊要有插座，回充座前方保留直線出入空間。"
    ]
  },
  living: {
    name: "客廳",
    summary: "客廳配置先抓電視牆、沙發距離、冷氣風向與掃地機動線。",
    base: [
      "電視牆要先整合插座、網路孔、弱電箱和線槽，避免完工後外露線路。",
      "冷氣不要直吹沙發或餐桌，室內機位置也要確認冷凝水排水坡度。",
      "若有掃地機，家具底部高度、門檻與地毯厚度會直接影響使用體驗。"
    ]
  },
  kitchen: {
    name: "餐廚",
    summary: "餐廚看水、電、排煙和熱源；冰箱、洗碗機、蒸烤箱不要只看尺寸。",
    base: [
      "冰箱旁要保留散熱縫與開門角度，最好靠近廚房入口，不要卡住備餐動線。",
      "洗碗機盡量靠近水槽，確認給水、排水、專用迴路與櫃體高度。",
      "蒸烤箱、微波爐、電鍋與氣炸鍋會疊加用電量，餐廚區要先規劃足夠迴路。"
    ]
  },
  bedroom: {
    name: "臥室",
    summary: "臥室先定床，再定衣櫃、冷氣、插座和窗簾；不要讓風直吹睡眠區。",
    base: [
      "床兩側最好都有插座與開關，手機、閱讀燈、除濕機才不會拉延長線。",
      "衣櫃深度常見 60 公分，櫃前走道建議至少保留 80-90 公分。",
      "冷氣室內機避開床頭直吹，並檢查室外機位置與排水路徑。"
    ]
  },
  bathroom: {
    name: "浴室",
    summary: "浴室是水電風險最高的區域；先確認防水、排水坡、通風與安全用電。",
    base: [
      "乾濕分離要看門片迴轉、地排位置和洩水坡，不是只加一道玻璃。",
      "暖風機、免治馬桶、電熱毛巾架都要確認專用迴路和防水插座。",
      "壁龕、鏡櫃與收納不要破壞防水層；老屋浴室翻修要先評估管線。"
    ]
  },
  balcony: {
    name: "陽台",
    summary: "陽台重點是洗衣、乾衣、排水、日曬和防潮，還要保留維修空間。",
    base: [
      "洗衣機要靠近給水、排水與專用插座，旁邊保留維修和開門空間。",
      "烘衣機若非熱泵式，要確認排熱與通風；疊放時確認承重與固定。",
      "陽台收納要用耐潮材質，避免木作直接吃日曬雨淋。"
    ]
  },
  work: {
    name: "工作區",
    summary: "工作區先看自然光、插座、網路、燈光和冷氣風向，久坐比漂亮更重要。",
    base: [
      "桌面附近預留足夠插座與網路孔，螢幕、筆電、充電器、檯燈不要共用一條延長線。",
      "螢幕避免正對窗或背對強光，減少反光與眼睛疲勞。",
      "若與臥室共用，建議用矮櫃或玻璃隔屏分區，不要犧牲主要走道。"
    ]
  }
};

const plannerGoals = {
  appliance: "優先檢查插座、專用迴路、排水、散熱、維修空間與門片開啟方向。",
  storage: "優先做垂直收納與畸零空間，但櫃體不要遮住開關箱、維修孔與採光。",
  renovation: "先確認不能動的結構牆、梁柱、管道間與消防設備，再決定木作和水電移位。",
  flow: "主要走道建議維持 80-90 公分以上，櫃門、房門、冰箱門不能互相打架。",
  resale: "避免過度客製化，保留標準格局、採光、收納與可被多數買方接受的設備位置。"
};

const plannerConstraints = {
  small: "小坪數要用複合機能：餐桌兼工作桌、電器高櫃、滑門與薄型收納，但保留主要動線。",
  elder: "長輩同住要減少高低差，浴室加止滑、扶手和夜間照明，常用電器放在不用彎腰的位置。",
  pet: "寵物家庭要注意地板耐刮、空氣清淨、掃地機路徑、貓砂或寵物用品的通風位置。",
  old: "老屋翻修先做漏水、水電、配電容量和管線更新，漂亮木作排在基礎工程之後。",
  pre: "預售客變要趁圖面階段確認插座、冷氣排水、網路孔、廚具尺寸與櫃體深度，完工後改更貴。"
};

const markerCatalog = {
  ac: { label: "冷氣", short: "冷", tip: "冷氣要避開直吹床或沙發，並確認冷凝水排水坡度、室外機維修空間與管線路徑。" },
  fridge: { label: "冰箱", short: "冰", tip: "冰箱旁保留散熱縫和開門角度，最好靠近廚房入口，並使用穩定插座。" },
  washer: { label: "洗衣/乾衣", short: "洗", tip: "洗衣與乾衣設備要靠近給水、排水、專用插座，疊放時確認承重與固定。" },
  dishwasher: { label: "洗碗機", short: "碗", tip: "洗碗機盡量靠近水槽，先確認排水、給水、櫃體高度與獨立迴路。" },
  tv: { label: "電視牆", short: "視", tip: "電視牆先集中插座、網路、線槽與壁掛補強，避免完工後外露線路。" },
  robot: { label: "掃地機", short: "掃", tip: "掃地機基地前方要保留直線出入空間，旁邊要有插座，並避免厚地毯與高門檻。" },
  cabinet: { label: "櫃體", short: "櫃", tip: "櫃體不要遮住維修孔、配電箱、窗戶與開關，潮濕區域要選耐潮材質。" },
  outlet: { label: "插座/網路", short: "電", tip: "高耗電設備要確認專用迴路；工作區、床側、餐廚小家電區要預留足夠插座。" }
};

const plannerState = {
  markers: [],
  imageUrl: ""
};

const formatWan = (value) => `${Math.round(value).toLocaleString("zh-TW")} 萬`;

function calculateLoan() {
  const income = Number(document.querySelector("#income").value) || 0;
  const debtRatio = Number(document.querySelector("#debtRatio").value) || 0;
  const annualRate = Number(document.querySelector("#rate").value) || 0;
  const years = Number(document.querySelector("#years").value) || 0;
  const ltv = Number(document.querySelector("#ltv").value) || 1;

  const monthlyBudget = income * 10000 * debtRatio / 100;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const loanDollars = monthlyRate === 0
    ? monthlyBudget * months
    : monthlyBudget * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
  const loanWan = loanDollars / 10000;
  const homeWan = loanWan / (ltv / 100);
  const downWan = Math.max(homeWan - loanWan, 0);

  document.querySelector("#loanAmount").textContent = formatWan(loanWan);
  document.querySelector("#monthlyPay").textContent = `月付約 ${(monthlyBudget / 10000).toFixed(1)} 萬`;
  document.querySelector("#homePrice").textContent = formatWan(homeWan);
  document.querySelector("#downPayment").textContent = formatWan(downWan);

  const riskNote = document.querySelector("#riskNote");
  if (debtRatio >= 45) {
    riskNote.textContent = "月付比偏高。建議先壓到收入 35% 以下，再保留裝修、稅費和緊急預備金。";
  } else if (ltv >= 80) {
    riskNote.textContent = "成數抓得偏樂觀。實務上仍會受銀行水位、央行管制、屋齡與估價影響。";
  } else if (years >= 35) {
    riskNote.textContent = "年限拉長可降月付，但總利息上升，也要確認年齡和屋齡是否符合銀行規範。";
  } else {
    riskNote.textContent = "這是保守估算。正式出價前，請用實價區間和銀行預審再校正一次。";
  }
}

function renderLessons() {
  const list = document.querySelector("#lessonList");
  list.innerHTML = lessons.map((lesson, index) => `
    <article class="lesson-item ${index === 0 ? "is-open" : ""}">
      <button class="lesson-toggle" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
        <span class="lesson-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="lesson-title">
          <strong>${lesson.title}</strong>
          <small>${lesson.tag}</small>
        </span>
        <span class="lesson-icon" aria-hidden="true">+</span>
      </button>
      <div class="lesson-body">
        <p>${lesson.summary}</p>
        <ul class="lesson-points">
          ${lesson.points.map((point) => `<li>${point}</li>`).join("")}
        </ul>
      </div>
    </article>
  `).join("");

  list.addEventListener("click", (event) => {
    const toggle = event.target.closest(".lesson-toggle");
    if (!toggle) return;
    const item = toggle.closest(".lesson-item");
    const isOpen = item.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function renderChecklist() {
  const saved = new Set(JSON.parse(localStorage.getItem("realEstateChecks") || "[]"));
  const grid = document.querySelector("#checklistGrid");
  grid.innerHTML = checks.map(([title, detail], index) => `
    <label class="check-card">
      <input type="checkbox" value="${index}" ${saved.has(String(index)) ? "checked" : ""}>
      <span>
        <strong>${title}</strong>
        <small>${detail}</small>
      </span>
    </label>
  `).join("");

  const update = () => {
    const checked = [...grid.querySelectorAll("input:checked")].map((input) => input.value);
    localStorage.setItem("realEstateChecks", JSON.stringify(checked));
    document.querySelector("#checkProgressText").textContent = `${checked.length} / ${checks.length} 已完成`;
  };

  grid.addEventListener("change", update);
  document.querySelector("#resetChecks").addEventListener("click", () => {
    grid.querySelectorAll("input").forEach((input) => {
      input.checked = false;
    });
    update();
  });
  update();
}

function renderMarket(key = "policy") {
  const note = marketNotes[key];
  document.querySelector("#marketCard").innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.body}</p>
    <ul>${note.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}

function bindMarketTabs() {
  document.querySelector(".market-board").addEventListener("click", (event) => {
    const tab = event.target.closest(".market-tab");
    if (!tab) return;
    document.querySelectorAll(".market-tab").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    renderMarket(tab.dataset.market);
  });
}

function renderSourceMaterials() {
  const stats = document.querySelector("#materialStats");
  const tabs = document.querySelector("#materialTabs");
  const panel = document.querySelector("#materialPanel");
  if (!stats || !tabs || !panel) return;

  stats.innerHTML = `
    <article><span>已索引</span><strong>${sourceMaterials.totals.indexed}</strong><small>公開直播/影片</small></article>
    <article><span>可用素材</span><strong>${sourceMaterials.totals.teachingCandidates}</strong><small>房地產候選</small></article>
    <article><span>已排除</span><strong>${sourceMaterials.totals.stockExcluded}</strong><small>股票相關</small></article>
  `;

  tabs.innerHTML = sourceMaterials.categories.map((category, index) => `
    <button class="material-tab ${index === 0 ? "is-active" : ""}" type="button" data-material="${category.id}">
      ${category.name}
    </button>
  `).join("");

  const renderPanel = (id) => {
    const category = sourceMaterials.categories.find((item) => item.id === id) || sourceMaterials.categories[0];
    panel.innerHTML = `
      <article class="material-card">
        <div class="material-card-head">
          <span>${category.count} 支候選素材</span>
          <h3>${category.name}</h3>
          <p>${category.angle}</p>
        </div>
        <div class="update-note"><b>更新守則</b><span>${category.update}</span></div>
        <div class="video-links">
          ${category.videos.map(([title, channel, url]) => `
            <a href="${url}" target="_blank" rel="noreferrer">
              <span>${channel}</span>
              <strong>${title}</strong>
            </a>
          `).join("")}
        </div>
      </article>
    `;
  };

  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".material-tab");
    if (!tab) return;
    tabs.querySelectorAll(".material-tab").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    renderPanel(tab.dataset.material);
  });

  renderPanel(sourceMaterials.categories[0].id);
}

function getPlannerInputs() {
  const room = document.querySelector("#plannerRoom")?.value || "entry";
  const goal = document.querySelector("#plannerGoal")?.value || "appliance";
  const constraints = [...document.querySelectorAll("#plannerConstraints input:checked")].map((input) => input.value);
  return { room, goal, constraints };
}

function buildPlannerAdvice() {
  const { room, goal, constraints } = getPlannerInputs();
  const roomInfo = plannerRooms[room];
  const markerTips = plannerState.markers.slice(-4).map((marker) => markerCatalog[marker.type].tip);
  const constraintTips = constraints.map((key) => plannerConstraints[key]);
  const markerSummary = plannerState.markers.length
    ? `目前已標記 ${plannerState.markers.length} 個位置。先檢查每個標記是否靠近必要管線、插座或排水點。`
    : "上傳圖面後，在想放電器或做裝潢的位置點一下，建議會更具體。";

  return {
    title: `${roomInfo.name}配置建議`,
    lead: `${roomInfo.summary} ${markerSummary}`,
    items: [
      plannerGoals[goal],
      ...roomInfo.base,
      ...markerTips,
      ...constraintTips
    ].slice(0, 9)
  };
}

function renderPlannerAdvice() {
  const advice = buildPlannerAdvice();
  const card = document.querySelector("#plannerAdvice");
  if (!card) return;
  card.innerHTML = `
    <h3>${advice.title}</h3>
    <p>${advice.lead}</p>
    <ul>${advice.items.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}

function renderMarkers() {
  const layer = document.querySelector("#markerLayer");
  const list = document.querySelector("#markerList");
  if (!layer || !list) return;

  layer.innerHTML = plannerState.markers.map((marker, index) => `
    <button class="plan-marker" type="button" style="left:${marker.x}%;top:${marker.y}%;" data-marker-index="${index}" aria-label="${markerCatalog[marker.type].label}">
      ${markerCatalog[marker.type].short}
    </button>
  `).join("");

  list.innerHTML = plannerState.markers.length
    ? plannerState.markers.map((marker, index) => `
      <div class="marker-item">
        <div><strong>${index + 1}. ${markerCatalog[marker.type].label}</strong><span>${marker.x.toFixed(0)}% / ${marker.y.toFixed(0)}%</span></div>
        <button type="button" data-remove-marker="${index}">刪除</button>
      </div>
    `).join("")
    : `<div class="marker-item"><div><strong>還沒有標記</strong><span>上傳圖面後點圖加入位置。</span></div></div>`;
}

function bindLayoutPlanner() {
  const fileInput = document.querySelector("#planImage");
  const preview = document.querySelector("#planPreview");
  const empty = document.querySelector("#planEmpty");
  const canvas = document.querySelector("#planCanvas");
  const markerType = document.querySelector("#markerType");
  const copyButton = document.querySelector("#copyPlannerAdvice");
  const clearButton = document.querySelector("#clearMarkers");
  const markerList = document.querySelector("#markerList");

  if (!fileInput || !preview || !empty || !canvas || !markerType) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (plannerState.imageUrl) URL.revokeObjectURL(plannerState.imageUrl);
    plannerState.imageUrl = URL.createObjectURL(file);
    preview.src = plannerState.imageUrl;
    preview.hidden = false;
    empty.hidden = true;
    canvas.classList.add("has-image");
    plannerState.markers = [];
    renderMarkers();
    renderPlannerAdvice();
  });

  canvas.addEventListener("click", (event) => {
    if (preview.hidden || event.target.closest(".plan-marker")) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    plannerState.markers.push({ x, y, type: markerType.value });
    renderMarkers();
    renderPlannerAdvice();
  });

  markerList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-marker]");
    if (!button) return;
    plannerState.markers.splice(Number(button.dataset.removeMarker), 1);
    renderMarkers();
    renderPlannerAdvice();
  });

  clearButton?.addEventListener("click", () => {
    plannerState.markers = [];
    renderMarkers();
    renderPlannerAdvice();
  });

  copyButton?.addEventListener("click", async () => {
    const advice = buildPlannerAdvice();
    const text = `${advice.title}\n${advice.lead}\n\n${advice.items.map((item, index) => `${index + 1}. ${item}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "已複製";
      setTimeout(() => {
        copyButton.textContent = "複製建議";
      }, 1200);
    } catch {
      copyButton.textContent = "可手動截圖";
      setTimeout(() => {
        copyButton.textContent = "複製建議";
      }, 1200);
    }
  });

  ["#plannerRoom", "#plannerGoal", "#markerType"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("change", renderPlannerAdvice);
  });
  document.querySelector("#plannerConstraints")?.addEventListener("change", renderPlannerAdvice);

  renderMarkers();
  renderPlannerAdvice();
}

function bindTheme() {
  const savedTheme = localStorage.getItem("realEstateTheme");
  if (savedTheme) {
    document.body.dataset.theme = savedTheme;
  }

  document.querySelector("#themeToggle").addEventListener("click", () => {
    const next = document.body.dataset.theme === "night" ? "" : "night";
    document.body.dataset.theme = next;
    if (next) {
      localStorage.setItem("realEstateTheme", next);
    } else {
      localStorage.removeItem("realEstateTheme");
    }
  });
}

document.querySelectorAll("#loanForm input").forEach((input) => {
  input.addEventListener("input", calculateLoan);
});

renderLessons();
renderSourceMaterials();
bindLayoutPlanner();
renderChecklist();
renderMarket();
bindMarketTabs();
bindTheme();
calculateLoan();
