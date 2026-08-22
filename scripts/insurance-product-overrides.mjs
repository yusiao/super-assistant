const AGE_BANDS = [
  [0, 14],
  [15, 24],
  [25, 34],
  [35, 44],
  [45, 54],
  [55, 64],
  [65, 74],
  [75, 79],
  [80, 80],
  [81, 81],
  [82, 82],
  [83, 83],
  [84, 84],
  [85, 85],
];

const HNRC_PLANS = [
  { key: "計劃一", label: "計劃一 (雜費9萬)", room: 1000, medical: 90000, surgery: 160000, tumor: 40000, outpatient: 600, supplement: 2000 },
  { key: "計劃二", label: "計劃二 (雜費12萬)", room: 1500, medical: 120000, surgery: 180000, tumor: 60000, outpatient: 900, supplement: 3000 },
  { key: "計劃三", label: "計劃三 (雜費15萬)", room: 2000, medical: 150000, surgery: 200000, tumor: 80000, outpatient: 1200, supplement: 4000 },
  { key: "計劃四", label: "計劃四 (雜費18萬)", room: 2500, medical: 180000, surgery: 220000, tumor: 100000, outpatient: 1500, supplement: 5000 },
  { key: "計劃五", label: "計劃五 (雜費21萬)", room: 3000, medical: 210000, surgery: 240000, tumor: 120000, outpatient: 1800, supplement: 6000 },
];

const HNRC_PREMIUMS = {
  "計劃一": [2139, 2221, 2650, 3212, 4039, 5242, 7995, 11789, 14089, 14854, 15622, 16614, 17609, 18604],
  "計劃二": [2954, 3083, 3667, 4463, 5600, 7220, 11413, 16828, 20111, 21203, 22299, 23715, 25136, 26556],
  "計劃三": [3769, 3895, 4658, 5657, 7083, 9201, 15052, 22194, 26524, 27964, 29410, 31278, 33152, 35025],
  "計劃四": [4547, 4684, 5575, 6791, 8480, 11080, 18173, 26796, 32024, 33763, 35509, 37764, 40026, 42287],
  "計劃五": [5442, 5628, 6705, 8168, 10247, 13258, 21280, 31377, 37499, 39535, 41579, 44219, 46868, 49516],
};

const HNRD_TOTALS = [
  { key: "計劃一", room: 2000, medical: 180000, surgery: 220000, tumor: 70000, outpatient: 800, supplement: 4000 },
  { key: "計劃二", room: 2500, medical: 210000, surgery: 240000, tumor: 90000, outpatient: 1100, supplement: 5000 },
  { key: "計劃三", room: 3000, medical: 240000, surgery: 260000, tumor: 110000, outpatient: 1400, supplement: 6000 },
  { key: "計劃四", room: 3500, medical: 270000, surgery: 280000, tumor: 130000, outpatient: 1700, supplement: 7000 },
  { key: "計劃五", room: 4000, medical: 300000, surgery: 300000, tumor: 150000, outpatient: 2000, supplement: 8000 },
];

const HNRD_PREMIUMS = {
  "計劃一": [1734, 1778, 2150, 2640, 3296, 4371, 7859, 11584, 13844, 14595, 15350, 16325, 17304, 18281],
  "計劃二": [1689, 1703, 2060, 2531, 3168, 4276, 7415, 10923, 13055, 13764, 14476, 15395, 16317, 17239],
  "計劃三": [1776, 1840, 2203, 2721, 3456, 4483, 6910, 10180, 12166, 12827, 13490, 14346, 15205, 16064],
  "計劃四": [1898, 2002, 2428, 2977, 3844, 4804, 6915, 10182, 12169, 12829, 13492, 14347, 15207, 16068],
  "計劃五": [1898, 2002, 2428, 2977, 3844, 4804, 6915, 10182, 12169, 12829, 13492, 14347, 15207, 16068],
};

function formatCurrency(value) {
  return `${Number(value).toLocaleString("zh-TW")} 元`;
}

function expandAgeBands(premiums) {
  return AGE_BANDS.flatMap(([startAge, endAge], index) => {
    const premium = Number(premiums[index]) || 0;
    return Array.from({ length: endAge - startAge + 1 }, (_, offset) => ({
      age: startAge + offset,
      premium,
    }));
  });
}

function genderTables(rows) {
  return { male: rows, female: rows };
}

function planRateTables(plans, premiumsByPlan) {
  return Object.fromEntries(plans.map((plan) => {
    const rows = expandAgeBands(premiumsByPlan[plan.key]);
    return [plan.label || plan.key, genderTables(rows)];
  }));
}

function hnrcBenefits(plan) {
  return [
    { item: "每日病房費", amount: `${formatCurrency(plan.room)}/日`, note: "一般病房；特殊病房最高 3 倍，特殊病房日數依條款" },
    { item: "住院醫療雜費", amount: `${formatCurrency(plan.medical)}/次`, note: "住院 1-30 日；31-60 日 2 倍、61-90 日 3 倍、91-180 日 4 倍、181 日以上 5 倍" },
    { item: "外科／門診手術費", amount: `最高 ${formatCurrency(plan.surgery)}/次`, note: "依手術表比例核付；同一次住院合計上限同本限額" },
    { item: "出院後腫瘤門診治療", amount: `${formatCurrency(plan.tumor)}/年`, note: "放射線或化學治療依附表比例；年度合計上限" },
    { item: "住院前後門診", amount: `${formatCurrency(plan.outpatient)}/次`, note: "住院或門診手術前 7 日、後 14 日內同一事故門診" },
    { item: "補充保險金", amount: `${formatCurrency(plan.supplement)}/次`, note: "實際自付任一項超過該項限額時，依條款補足差額，上限為本限額" },
  ];
}

function hnrdBenefits(total, deductible) {
  const note = (deductibleAmount, totalAmount, unit) => `自負額 ${formatCurrency(deductibleAmount)}${unit}；搭配 HNRC 同計畫後總限額 ${formatCurrency(totalAmount)}${unit}`;
  return [
    { item: "每日病房費", amount: "1,000 元/日", note: note(deductible.room, total.room, "/日") },
    { item: "住院醫療雜費", amount: "90,000 元/次", note: note(deductible.medical, total.medical, "/次") },
    { item: "外科／門診手術費", amount: "最高 60,000 元/次", note: note(deductible.surgery, total.surgery, "/次") },
    { item: "出院後腫瘤門診治療", amount: "30,000 元/年", note: note(deductible.tumor, total.tumor, "/年") },
    { item: "住院前後門診", amount: "200 元/次", note: note(deductible.outpatient, total.outpatient, "/次") },
    { item: "補充保險金", amount: "2,000 元/次", note: note(deductible.supplement, total.supplement, "/次") },
  ];
}

function withDefaultPlanRates(product, planRateTablesByGender, defaultPlan) {
  const defaultTables = planRateTablesByGender[defaultPlan];
  const defaultRows = defaultTables?.male || [];
  return {
    ...product,
    annualPremium: defaultRows.find((row) => row.age === 35)?.premium || product.annualPremium || 0,
    premiumBands: defaultRows.slice(0, 12).map((row) => ({ age: `${row.age}歲`, premium: row.premium })),
    rateTable: defaultRows,
    rateTablesByGender: defaultTables,
    planRateTablesByGender,
  };
}

function overrideHnrc(product) {
  const planOptions = HNRC_PLANS.map((plan) => plan.label);
  const planBenefitTables = Object.fromEntries(HNRC_PLANS.map((plan) => [plan.label, hnrcBenefits(plan)]));
  const planRateTablesByGender = planRateTables(HNRC_PLANS, HNRC_PREMIUMS);
  const defaultPlan = HNRC_PLANS[2].label;
  return withDefaultPlanRates({
    ...product,
    contractType: "rider",
    planName: defaultPlan,
    coverageLabel: defaultPlan,
    planOptions,
    planBenefitTables,
    benefits: planBenefitTables[defaultPlan],
    coverageWan: 15,
    coverage: 150000,
    rateStatus: "ready",
    ratePricingModel: "planTotal",
    termRatePricingModel: "planTotal",
    rateUnitCoverage: 150000,
  }, planRateTablesByGender, defaultPlan);
}

function overrideHnrd(product) {
  const planOptions = HNRD_TOTALS.map((plan) => plan.key);
  const planBenefitTables = Object.fromEntries(HNRD_TOTALS.map((total, index) => [
    total.key,
    hnrdBenefits(total, HNRC_PLANS[index]),
  ]));
  const planRateTablesByGender = planRateTables(HNRD_TOTALS, HNRD_PREMIUMS);
  const defaultPlan = "計劃三";
  return withDefaultPlanRates({
    ...product,
    contractType: "rider",
    planName: defaultPlan,
    coverageLabel: defaultPlan,
    planOptions,
    planBenefitTables,
    benefits: planBenefitTables[defaultPlan],
    rateStatus: "ready",
    ratePricingModel: "planTotal",
    termRatePricingModel: "planTotal",
    rateUnitCoverage: 10000,
    purchaseRequirements: [{
      type: "requiresProduct",
      code: "HNRC",
      name: "台灣人壽新住院醫療保險附約(85)",
      timing: "sameTime",
      note: "HNRD 須搭配 HNRC 同時購買，是用來加強 HNRC 的保障額度。",
    }],
  }, planRateTablesByGender, defaultPlan);
}

export function applyInsuranceProductOverrides(products) {
  return products.map((product) => {
    const code = String(product?.code || "").trim().toUpperCase();
    if (code === "HNRC") return overrideHnrc(product);
    if (code === "HNRD") return overrideHnrd(product);
    return product;
  });
}
