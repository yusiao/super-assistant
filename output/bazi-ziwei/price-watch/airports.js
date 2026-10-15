// Metro areas intentionally include their established passenger airports, not every nearby airfield.
const METROS = [
  ["台北", "Taipei", "TPE,TSA"], ["東京", "Tokyo", "HND,NRT"], ["大阪", "Osaka", "ITM,KIX,UKB"],
  ["首爾", "Seoul", "GMP,ICN"], ["曼谷", "Bangkok", "BKK,DMK"], ["上海", "Shanghai", "PVG,SHA"],
  ["北京", "Beijing", "PEK,PKX"], ["成都", "Chengdu", "CTU,TFU"], ["台中", "Taichung", "RMQ"],
  ["高雄", "Kaohsiung", "KHH"], ["台南", "Tainan", "TNN"], ["花蓮", "Hualien", "HUN"],
  ["倫敦", "London", "LCY,LGW,LHR,LTN,SEN,STN"], ["巴黎", "Paris", "CDG,ORY"],
  ["紐約", "New York", "EWR,JFK,LGA"], ["芝加哥", "Chicago", "MDW,ORD"],
  ["洛杉磯", "Los Angeles", "BUR,LAX,LGB,ONT,SNA"], ["舊金山", "San Francisco", "OAK,SFO,SJC"],
  ["華盛頓", "Washington", "BWI,DCA,IAD"], ["達拉斯", "Dallas", "DAL,DFW"],
  ["休士頓", "Houston", "HOU,IAH"], ["多倫多", "Toronto", "YTZ,YYZ"],
  ["羅馬", "Rome", "CIA,FCO"], ["米蘭", "Milan", "BGY,LIN,MXP"],
  ["伊斯坦堡", "Istanbul", "IST,SAW"], ["莫斯科", "Moscow", "DME,SVO,VKO,ZIA"],
  ["墨爾本", "Melbourne", "AVV,MEL"], ["布宜諾斯艾利斯", "Buenos Aires", "AEP,EZE"],
  ["聖保羅", "Sao Paulo", "CGH,GRU,VCP"], ["里約熱內盧", "Rio de Janeiro", "GIG,SDU"],
  ["香港", "Hong Kong", "HKG"], ["新加坡", "Singapore", "SIN"], ["吉隆坡", "Kuala Lumpur", "KUL,SZB"],
  ["札幌", "Sapporo", "CTS,OKD"], ["沖繩 那霸", "Okinawa Naha", "OKA"], ["福岡", "Fukuoka", "FUK"],
  ["名古屋", "Nagoya", "NGO,NKM"], ["仙台", "Sendai", "SDJ"], ["釜山", "Busan", "PUS"],
  ["濟州", "Jeju", "CJU"], ["澳門", "Macau", "MFM"], ["廣州", "Guangzhou", "CAN"],
  ["深圳", "Shenzhen", "SZX"], ["廈門", "Xiamen", "XMN"], ["杭州", "Hangzhou", "HGH"],
  ["河內", "Hanoi", "HAN"], ["胡志明市", "Ho Chi Minh City", "SGN"], ["峴港", "Da Nang", "DAD"],
  ["馬尼拉", "Manila", "MNL"], ["宿霧", "Cebu", "CEB"], ["雅加達", "Jakarta", "CGK,HLP"],
  ["峇里島 巴里島 登巴薩", "Bali Denpasar", "DPS"], ["清邁", "Chiang Mai", "CNX"], ["普吉島", "Phuket", "HKT"],
  ["德里 新德里", "Delhi New Delhi", "DEL"], ["孟買", "Mumbai", "BOM"], ["杜拜", "Dubai", "DWC,DXB"],
  ["阿布達比", "Abu Dhabi", "AUH"], ["多哈", "Doha", "DOH"], ["赫爾辛基", "Helsinki", "HEL"],
  ["阿姆斯特丹", "Amsterdam", "AMS"], ["法蘭克福", "Frankfurt", "FRA"], ["慕尼黑", "Munich", "MUC"],
  ["蘇黎世", "Zurich", "ZRH"], ["日內瓦", "Geneva", "GVA"], ["維也納", "Vienna", "VIE"],
  ["布拉格", "Prague", "PRG"], ["馬德里", "Madrid", "MAD"], ["巴塞隆納 巴塞隆拿", "Barcelona", "BCN"],
  ["里斯本", "Lisbon", "LIS"], ["雅典", "Athens", "ATH"], ["布達佩斯", "Budapest", "BUD"],
  ["華沙", "Warsaw", "WAW,WMI"], ["哥本哈根", "Copenhagen", "CPH"], ["斯德哥爾摩", "Stockholm", "ARN,BMA,NYO,VST"],
  ["奧斯陸", "Oslo", "OSL,TRF"], ["都柏林", "Dublin", "DUB"], ["愛丁堡", "Edinburgh", "EDI"],
  ["布魯塞爾", "Brussels", "BRU,CRL"], ["雪梨 悉尼", "Sydney", "SYD"], ["布里斯本", "Brisbane", "BNE"],
  ["伯斯 珀斯", "Perth", "PER"], ["奧克蘭", "Auckland", "AKL"], ["基督城", "Christchurch", "CHC"],
  ["溫哥華", "Vancouver", "YVR"], ["蒙特婁", "Montreal", "YUL"], ["西雅圖", "Seattle", "SEA"],
  ["波士頓", "Boston", "BOS"], ["拉斯維加斯", "Las Vegas", "LAS"], ["檀香山 夏威夷", "Honolulu Hawaii", "HNL"],
  ["邁阿密", "Miami", "MIA"], ["亞特蘭大", "Atlanta", "ATL"], ["墨西哥城", "Mexico City", "MEX,NLU"],
  ["利馬", "Lima", "LIM"], ["聖地牙哥", "Santiago", "SCL"], ["波哥大", "Bogota", "BOG"],
  ["開羅", "Cairo", "CAI"], ["開普敦", "Cape Town", "CPT"], ["約翰尼斯堡", "Johannesburg", "HLA,JNB"],
  ["奈洛比", "Nairobi", "NBO,WIL"], ["卡薩布蘭卡", "Casablanca", "CMN"], ["馬爾地夫 馬列", "Maldives Male", "MLE"],
];
const AIRPORT_NAMES = {
  TPE: "臺灣桃園國際機場", TSA: "台北松山機場", HND: "東京羽田機場", NRT: "東京成田機場", KIX: "關西國際機場", ITM: "大阪伊丹機場", UKB: "神戶機場",
  ICN: "仁川國際機場", GMP: "金浦國際機場", BKK: "蘇凡納布機場", DMK: "廊曼機場", SIN: "新加坡樟宜機場", HKG: "香港國際機場",
  LHR: "倫敦希斯洛機場", LGW: "倫敦蓋威克機場", LCY: "倫敦城市機場", LTN: "倫敦魯頓機場", STN: "倫敦史坦斯特機場", SEN: "倫敦紹森德機場",
  CDG: "巴黎戴高樂機場", ORY: "巴黎奧利機場", JFK: "紐約甘迺迪機場", LGA: "紐約拉瓜迪亞機場", EWR: "紐華克自由國際機場",
  PEK: "北京首都機場", PKX: "北京大興機場", PVG: "上海浦東機場", SHA: "上海虹橋機場", CTU: "成都雙流機場", TFU: "成都天府機場",
};

export function normalizeAirportCodes(value) {
  const codes = String(value || "").trim().toUpperCase().split(/[,，]/).map((code) => code.trim());
  if (!codes.length || codes.length > 6 || codes.some((code) => !/^[A-Z]{3}$/.test(code))) return "";
  return [...new Set(codes)].sort().join(",");
}

const normalized = (value) => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").replaceAll("臺", "台").toLowerCase().trim();

export function buildAirportDirectory(rows) {
  const regions = new Intl.DisplayNames(["zh-Hant"], { type: "region" });
  const englishRegions = new Intl.DisplayNames(["en"], { type: "region" });
  const countries = new Map();
  const airports = rows.map(([iataCode, englishName, englishCity, countryCode, region, scheduled]) => {
    if (!countries.has(countryCode)) countries.set(countryCode, regions.of(countryCode) || countryCode);
    return { iataCode, name: englishName, englishName, city: englishCity, englishCity, country: countries.get(countryCode), englishCountry: englishRegions.of(countryCode), countryCode, region, scheduled };
  });
  const byCode = new Map(airports.map((a) => [a.iataCode, a]));
  const groups = [];
  const assigned = new Set();
  for (const [aliases, englishCity, codes] of METROS) {
    const members = codes.split(",").map((code) => byCode.get(code)).filter(Boolean);
    const city = aliases.split(" ")[0];
    members.forEach((a) => {
      a.city = city;
      a.aliases = `${aliases} ${englishCity}`;
      a.name = AIRPORT_NAMES[a.iataCode] || `${city} · ${a.englishName}`;
      assigned.add(a.iataCode);
    });
    if (members.length > 1) groups.push({ iataCode: normalizeAirportCodes(members.map((a) => a.iataCode).join(",")), name: `${city}全部機場`, city, englishName: englishCity,
      country: members[0].country, countryCode: members[0].countryCode, aliases, group: true, subtitle: members.map((a) => a.iataCode).join(" · ") });
  }
  // Region prevents cities with the same name in different provinces from being merged.
  const municipal = new Map();
  airports.filter((a) => a.scheduled && a.city && !assigned.has(a.iataCode)).forEach((a) => {
    const key = `${a.region}:${normalized(a.city)}`;
    municipal.set(key, [...(municipal.get(key) || []), a]);
  });
  for (const members of municipal.values()) {
    if (members.length < 2 || members.length > 6) continue;
    const a = members[0];
    groups.push({ iataCode: normalizeAirportCodes(members.map((m) => m.iataCode).join(",")), name: `${a.city}全部機場`, city: a.city,
      country: a.country, countryCode: a.countryCode, englishName: a.city, group: true, subtitle: members.map((m) => m.iataCode).join(" · ") });
  }
  return [...groups, ...airports].map((a) => ({ ...a, subtitle: a.subtitle || [a.city, a.country, a.englishName !== a.name ? a.englishName : ""].filter(Boolean).join(" · "),
    prefixText: normalized([a.englishName, a.englishCity, a.aliases].join(" ")),
    searchText: normalized([a.iataCode, a.name, a.englishName, a.city, a.englishCity, a.country, englishRegions.of(a.countryCode), a.countryCode, a.aliases].join(" ")) }));
}

export function searchAirports(directory, query) {
  const needle = normalized(query);
  if (!needle) return [];
  const prefix = /^[a-z]{1,3}$/.test(needle);
  const score = (a) => a.iataCode.toLowerCase() === needle ? 0 : prefix && !a.group && a.iataCode.toLowerCase().startsWith(needle) ? 1 : a.group ? 2 : a.scheduled ? 3 : 4;
  return directory.filter((a) => prefix
    ? a.iataCode.toLowerCase().startsWith(needle) || a.prefixText.startsWith(needle) || a.prefixText.includes(` ${needle}`)
    : a.searchText.includes(needle)).sort((a, b) => score(a) - score(b) || a.iataCode.localeCompare(b.iataCode));
}
