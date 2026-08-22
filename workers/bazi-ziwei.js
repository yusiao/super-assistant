const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Price-Watch-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  ...CORS_HEADERS,
};
const PRICE_WATCH_KV_KEY = "price-watch:watches";
const PRICE_WATCH_RATE_PREFIX = "price-watch:rate-limit";
const FLIGHT_YEAR_HISTORY_PREFIX = "price-watch:flight-year-history";
const AIRPORT_PREFIX_CACHE = "price-watch:airport-prefix:v2";
const FLIGHT_CABINS = [
  { code: "1", key: "economy", label: "經濟艙" },
  { code: "2", key: "premium_economy", label: "豪華經濟艙" },
  { code: "3", key: "business", label: "商務艙" },
];
const LOW_COST_AIRLINE_CODES = new Set([
  "3K", "5J", "6E", "7C", "AK", "B6", "BL", "BX", "D7", "D8", "DE", "DY", "EW", "F9", "FD", "FR",
  "FY", "FZ", "G4", "G9", "GK", "HB", "HV", "IT", "IX", "J9", "JQ", "LJ", "LS", "MM", "NK", "OD",
  "PC", "QH", "QZ", "SG", "SL", "TO", "TR", "TW", "U2", "UO", "VJ", "VY", "VZ", "W4", "WN", "XQ", "Z2", "ZE",
]);
const LOW_COST_AIRLINE_NAMES = [
  "airasia", "cebu pacific", "easyjet", "frontier", "jetblue", "jetstar", "peach", "ryanair", "scoot", "southwest",
  "spirit", "vietjet", "wizz", "亞洲航空", "宿霧太平洋", "德威", "捷星", "易斯達", "春秋航空",
  "樂桃", "濟州航空", "獅航", "真航空", "虎航", "酷航", "香港快運", "釜山航空",
];
const AIRLINE_OFFICIAL_SITES = {
  "3K": "https://www.jetstar.com/tw/zh/home",
  "5J": "https://www.cebupacificair.com/",
  "7C": "https://www.jejuair.net/zh-tw/main/base/index.do",
  BR: "https://www.evaair.com/zh-tw/index.html",
  CI: "https://www.china-airlines.com/tw/zh",
  CX: "https://www.cathaypacific.com/cx/zh_TW.html",
  D7: "https://www.airasia.com/",
  FD: "https://www.airasia.com/",
  GK: "https://www.jetstar.com/tw/zh/home",
  IT: "https://www.tigerairtw.com/zh-tw/",
  JL: "https://www.jal.co.jp/tw/zhtw/",
  JQ: "https://www.jetstar.com/tw/zh/home",
  JX: "https://www.starlux-airlines.com/zh-TW",
  KE: "https://www.koreanair.com/",
  LJ: "https://www.jinair.com/",
  MM: "https://www.flypeach.com/tw",
  NH: "https://www.ana.co.jp/zh/tw/",
  OZ: "https://flyasiana.com/C/TW/CH/index",
  QH: "https://www.bambooairways.com/",
  SL: "https://www.lionairthai.com/",
  SQ: "https://www.singaporeair.com/zh_TW/tw/home",
  TG: "https://www.thaiairways.com/zh-tw/",
  TR: "https://www.flyscoot.com/zhtw",
  TW: "https://www.twayair.com/",
  UO: "https://www.hkexpress.com/zh-tw/",
  VJ: "https://www.vietjetair.com/zh-TW",
  VN: "https://www.vietnamairlines.com/tw/zh-tw/home",
  Z2: "https://www.airasia.com/",
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function methodNotAllowed() {
  return json(405, { error: "Method not allowed." });
}

function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function envValue(env, key, fallback = "") {
  const value = env && Object.prototype.hasOwnProperty.call(env, key) ? env[key] : undefined;
  return value === undefined || value === null ? fallback : String(value);
}

function compact(value, fallback = "", maxLength = 220) {
  const text = String(value || fallback)
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLength);
}

function safeErrorMessage(message) {
  return compact(message, "unknown error", 260)
    .replace(/AIza[0-9A-Za-z_-]+/g, "[redacted-google-api-key]")
    .replace(/sk-[0-9A-Za-z_-]+/g, "[redacted-openai-api-key]");
}

function safeId(text, fallback = "watch") {
  const slug = compact(text, "", 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `${fallback}-${Math.random().toString(36).slice(2, 10)}`;
}

function isPublicPriceWatchSearch(env) {
  return envValue(env, "PRICE_WATCH_PUBLIC_SEARCH").toLowerCase() === "true";
}

async function timingSafeStringEqual(provided, expected) {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

async function hasValidPriceWatchToken(request, env) {
  const expectedTokens = [
    envValue(env, "PRICE_WATCH_ACCESS_TOKEN"),
    envValue(env, "PRICE_WATCH_AUTOMATION_TOKEN"),
  ].filter(Boolean);
  if (!expectedTokens.length) return false;
  const authorization = request.headers.get("Authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  const headerToken = request.headers.get("X-Price-Watch-Token") || "";
  const providedTokens = [bearer, headerToken].filter(Boolean);
  if (!providedTokens.length) return false;
  const matches = await Promise.all(
    expectedTokens.flatMap((expected) => providedTokens.map((provided) => timingSafeStringEqual(provided, expected))),
  );
  return matches.some(Boolean);
}

async function hasPriceWatchAccess(request, env, allowPublicSearch = false) {
  if (await hasValidPriceWatchToken(request, env)) return true;
  return allowPublicSearch && isPublicPriceWatchSearch(env);
}

function priceWatchAuthError(env) {
  if (!envValue(env, "PRICE_WATCH_ACCESS_TOKEN") && !envValue(env, "PRICE_WATCH_AUTOMATION_TOKEN")) {
    return json(503, { error: "Price watch access tokens are not set." });
  }
  return json(401, { error: "Invalid or missing price watch access token." });
}

function rateLimitNumber(env, key, fallback) {
  const value = Number(envValue(env, key, fallback));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

async function incrementRateBucket(env, key, ttlSeconds, limit) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.get !== "function" || typeof env.PRICE_WATCH_KV.put !== "function") {
    return { allowed: true, count: 0, remaining: limit };
  }
  const current = await env.PRICE_WATCH_KV.get(key, "json").catch(() => null);
  const count = Number(current?.count || 0);
  if (count >= limit) return { allowed: false, count, remaining: 0 };
  const nextCount = count + 1;
  await env.PRICE_WATCH_KV.put(key, JSON.stringify({ count: nextCount }), { expirationTtl: ttlSeconds });
  return { allowed: true, count: nextCount, remaining: Math.max(0, limit - nextCount) };
}

async function publicSearchRateLimit(request, env, scope) {
  if (!isPublicPriceWatchSearch(env) || await hasValidPriceWatchToken(request, env)) return null;
  const client = safeId(
    request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0] || "unknown",
    "client",
  );
  const minuteLimit = rateLimitNumber(env, "PRICE_WATCH_PUBLIC_SEARCH_PER_MINUTE", 4);
  const dayLimit = rateLimitNumber(env, "PRICE_WATCH_PUBLIC_SEARCH_PER_DAY", 30);
  const now = new Date();
  const minute = now.toISOString().slice(0, 16);
  const day = now.toISOString().slice(0, 10);
  const minuteBucket = await incrementRateBucket(env, `${PRICE_WATCH_RATE_PREFIX}:${scope}:minute:${minute}:${client}`, 120, minuteLimit);
  if (!minuteBucket.allowed) {
    return json(429, { code: "rate_limited", error: "公開搜尋暫時太頻繁，請稍後再試，或在設定輸入同步金鑰。" });
  }
  const dayBucket = await incrementRateBucket(env, `${PRICE_WATCH_RATE_PREFIX}:${scope}:day:${day}:${client}`, 172800, dayLimit);
  if (!dayBucket.allowed) {
    return json(429, { code: "rate_limited", error: "今日公開搜尋次數已達上限，請明天再試，或在設定輸入同步金鑰。" });
  }
  return null;
}

function normalizeMoney(value) {
  if (value === undefined || value === null) return null;
  const number = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function currencyLabel(currency) {
  const value = compact(currency, "TWD", 10).toUpperCase();
  return value || "TWD";
}

function formatPrice(price, currency = "TWD") {
  if (!Number.isFinite(Number(price))) return "";
  const rounded = Math.round(Number(price));
  if (currencyLabel(currency) === "TWD") return `NT$${rounded.toLocaleString("zh-TW")}`;
  return `${currencyLabel(currency)} ${rounded.toLocaleString("en-US")}`;
}

async function serpApiSearch(params, env) {
  const apiKey = envValue(env, "SERPAPI_API_KEY");
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not set.");
  const url = new URL("https://serpapi.com/search.json");
  Object.entries({ ...params, api_key: apiKey }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `SerpApi request failed with HTTP ${response.status}.`);
  }
  if (data.error) throw new Error(data.error);
  return data;
}

function isoDate(value, fallback = "") {
  const text = compact(value, fallback, 16);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
}

function addDays(value, days) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function dateParts(value, includeDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  const parts = { year, month };
  if (includeDay) parts.day = day;
  return parts;
}

function dateFromParts(parts) {
  if (!parts?.year || !parts?.month || !parts?.day) return "";
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function daysBetween(start, end) {
  return Math.round((new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`)) / 86400000);
}

function quoteValues(data) {
  const quotes = data?.content?.results?.quotes || data?.results?.quotes || data?.quotes || {};
  return Array.isArray(quotes) ? quotes : Object.values(quotes);
}

function quoteLegDate(leg) {
  return dateFromParts(leg?.departureDate || leg?.departure_date || leg?.date);
}

function average(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  if (!numbers.length) return null;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function minimum(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  return numbers.length ? Math.min(...numbers) : null;
}

function maximum(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  return numbers.length ? Math.max(...numbers) : null;
}

function flightYearStats(results) {
  const grouped = new Map();
  results.forEach((result) => {
    const year = Number(String(result.departureDate || "").slice(0, 4));
    if (!Number.isInteger(year)) return;
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year).push(result.price);
  });
  return Object.fromEntries(
    [...grouped.entries()].map(([year, prices]) => [
      String(year),
      {
        average: average(prices),
        minimum: Math.min(...prices),
        maximum: Math.max(...prices),
        sampleCount: prices.length,
      },
    ]),
  );
}

function flightNumberAirlineCode(value) {
  return compact(value, "", 30).toUpperCase().match(/^([A-Z0-9]{2})\s*\d/)?.[1] || "";
}

function isLowCostSegment(segment) {
  const code = flightNumberAirlineCode(segment.flightNumber);
  const airline = compact(segment.airline, "", 100).toLowerCase();
  return LOW_COST_AIRLINE_CODES.has(code) || LOW_COST_AIRLINE_NAMES.some((name) => airline.includes(name));
}

function compactFlightDate(value) {
  return isoDate(value, "").replaceAll("-", "").slice(2);
}

function flightPurchaseLinks(payload, airline, segments) {
  const departureId = compact(payload.departureId, "", 8).toUpperCase();
  const arrivalId = compact(payload.arrivalId, "", 8).toUpperCase();
  const departureDate = isoDate(payload.outboundDate, "");
  const returnDate = isoDate(payload.returnDate, "");
  const airlineCode = flightNumberAirlineCode(segments[0]?.flightNumber);
  const officialUrl = AIRLINE_OFFICIAL_SITES[airlineCode] || "";
  const datePath = [compactFlightDate(departureDate), compactFlightDate(returnDate)].filter(Boolean).join("/");
  const skyscannerUrl = departureId && arrivalId && datePath
    ? `https://www.skyscanner.com.tw/transport/flights/${departureId.toLowerCase()}/${arrivalId.toLowerCase()}/${datePath}/`
    : "https://www.skyscanner.com.tw/transport/flights/";
  const tripUrl = new URL("https://tw.trip.com/flights/list");
  tripUrl.searchParams.set("dcity", departureId);
  tripUrl.searchParams.set("acity", arrivalId);
  tripUrl.searchParams.set("ddate", departureDate);
  if (returnDate) tripUrl.searchParams.set("rdate", returnDate);
  tripUrl.searchParams.set("triptype", returnDate ? "rt" : "ow");
  return [
    officialUrl ? { kind: "official", label: `${airline} 官網`, url: officialUrl } : null,
    { kind: "skyscanner", label: "Skyscanner", url: skyscannerUrl },
    { kind: "trip", label: "Trip.com", url: tripUrl.toString() },
  ].filter(Boolean);
}

function flightYearHistoryKey(departureId, arrivalId, tripDays, currency) {
  return `${FLIGHT_YEAR_HISTORY_PREFIX}:${departureId}:${arrivalId}:${tripDays}:${currency}`;
}

function evenlySpacedDates(startDate, endDate, limit = 4) {
  const totalDays = Math.max(0, daysBetween(startDate, endDate));
  const count = Math.min(limit, totalDays + 1);
  if (count <= 1) return [startDate];
  return [...new Set(Array.from({ length: count }, (_, index) => addDays(startDate, Math.round((totalDays * index) / (count - 1)))))];
}

async function serpApiSampledFlightSearch(payload, env) {
  const departureId = compact(payload.departureId, "", 80).toUpperCase();
  const arrivalId = compact(payload.arrivalId, "", 80).toUpperCase();
  const mode = compact(payload.flightMode, "annual_low", 24);
  const today = new Date().toISOString().slice(0, 10);
  const requestedStartDate = mode === "annual_low" ? addDays(today, 14) : isoDate(payload.startDate, today);
  const startDate = requestedStartDate < today ? today : requestedStartDate;
  const horizonDays = mode === "annual_low" ? 351 : Math.max(0, Math.min(Number(payload.lookaheadDays || 30), 365));
  const endDate = addDays(startDate, horizonDays);
  const tripDays = Math.max(0, Math.min(Number(payload.tripDays || 0), 60));
  const currency = currencyLabel(payload.currency);
  const sampleDates = evenlySpacedDates(startDate, endDate, 4);
  const searches = await Promise.allSettled(
    sampleDates.flatMap((outboundDate) => FLIGHT_CABINS.map(async (cabin) => {
      const returnDate = tripDays > 0 ? addDays(outboundDate, tripDays) : "";
      const data = await serpApiSearch(
        {
          engine: "google_flights",
          departure_id: departureId,
          arrival_id: arrivalId,
          outbound_date: outboundDate,
          return_date: returnDate,
          type: tripDays > 0 ? "1" : "2",
          currency,
          gl: compact(payload.market, "TW", 8).toLowerCase(),
          hl: compact(payload.locale, "zh-TW", 12).toLowerCase(),
          sort_by: "2",
          travel_class: cabin.code,
          stops: payload.routeType === "nonstop" ? "1" : "0",
          show_hidden: payload.airlineType !== "all" || payload.routeType === "connecting" ? "true" : "false",
        },
        env,
      );
      const normalized = normalizeFlightResults(
        data,
        {
          ...payload,
          departureId,
          arrivalId,
          outboundDate,
          returnDate,
          travelClass: cabin.code,
          cabinClass: cabin.key,
          cabinLabel: cabin.label,
        },
        currency,
      );
      const best = normalized.results[0];
      return best ? { ...best, source: "Google Flights 抽樣", sampled: true } : null;
    })),
  );
  const results = searches
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value)
    .sort((left, right) => left.price - right.price);
  if (!results.length) {
    const rejected = searches.filter((result) => result.status === "rejected");
    if (rejected.length === searches.length) {
      const messages = rejected.map((result) => compact(result.reason?.message, "", 260)).filter(Boolean);
      const quotaError = messages.find((message) => /quota|searches|plan|credit|limit/i.test(message));
      const timeoutError = messages.find((message) => /timeout|aborted|signal/i.test(message));
      throw new Error(quotaError || timeoutError || messages[0] || "Flight provider returned no results.");
    }
    const comparisonYear = Number(startDate.slice(0, 4));
    const airlineLabel = payload.airlineType === "low_cost" ? "廉價航空" : payload.airlineType === "full_service" ? "傳統航空" : "全部航空";
    const routeLabel = payload.routeType === "nonstop" ? "直達" : payload.routeType === "connecting" ? "轉乘" : "全部行程";
    return {
      mode,
      startDate,
      endDate,
      tripDays,
      results: [],
      insights: {
        lowestPrice: null,
        rangeStart: startDate,
        rangeEnd: endDate,
        cached: false,
        sampleDates,
        cabinPrices: FLIGHT_CABINS.map((cabin) => ({ ...cabin, available: false, price: null, priceText: "", departureDate: "", returnDate: "", airline: "" })),
        samplingNotice: `目前找不到符合「${airlineLabel}・${routeLabel}」的航班，請放寬篩選或調整日期。`,
        yearStats: {
          year: comparisonYear,
          average: null,
          sampleCount: 0,
          previousYear: comparisonYear - 1,
          previousAverage: null,
          previousSampleCount: 0,
          basis: "no_matching_quotes",
        },
      },
    };
  }
  const lowestPrice = results[0].price;
  const yearlyQuotes = flightYearStats(results.filter((item) => item.cabinClass === "economy"));
  const comparisonYear = Number(startDate.slice(0, 4));
  const previousYear = comparisonYear - 1;
  const historyKey = flightYearHistoryKey(departureId, arrivalId, tripDays, currency);
  const history = await readFlightYearHistory(env, historyKey);
  const currentStats = yearlyQuotes[String(comparisonYear)] || null;
  const previousRecords = history.filter((record) => Number(record.travelYear) === previousYear);
  const yearStats = {
    year: comparisonYear,
    average: currentStats?.average ?? null,
    minimum: currentStats?.minimum ?? null,
    maximum: currentStats?.maximum ?? null,
    sampleCount: currentStats?.sampleCount ?? 0,
    previousYear,
    previousAverage: average(previousRecords.map((record) => record.average)),
    previousMinimum: minimum(previousRecords.map((record) => record.minimum)),
    previousMaximum: maximum(previousRecords.map((record) => record.maximum)),
    previousSampleCount: previousRecords.length,
    basis: "sampled_departure_quotes",
  };
  await recordFlightYearHistory(env, historyKey, history, yearlyQuotes, today);
  const cabinPrices = FLIGHT_CABINS.map((cabin) => {
    const options = results.filter((item) => item.travelClass === cabin.code);
    const best = options[0] || null;
    return {
      ...cabin,
      available: Boolean(best),
      price: best?.price ?? null,
      priceText: best?.priceText || "",
      departureDate: best?.departureDate || "",
      returnDate: best?.returnDate || "",
      airline: best?.airline || "",
    };
  });
  return {
    mode,
    startDate,
    endDate,
    tripDays,
    results: results.map((item) => ({ ...item, isRangeLow: item.price === lowestPrice })),
    insights: {
      lowestPrice,
      rangeStart: startDate,
      rangeEnd: endDate,
      cached: false,
      sampleDates,
      cabinPrices,
      samplingNotice: `本次比較 ${sampleDates.length} 個代表出發日、3 種艙等，共 ${sampleDates.length * FLIGHT_CABINS.length} 次即時查價。`,
      yearStats,
    },
  };
}

async function readFlightYearHistory(env, key) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.get !== "function") return [];
  try {
    const data = await env.PRICE_WATCH_KV.get(key, { type: "json" });
    return Array.isArray(data?.records) ? data.records : [];
  } catch {
    return [];
  }
}

async function recordFlightYearHistory(env, key, records, stats, observedDate) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.put !== "function") return;
  const years = Object.keys(stats);
  const alreadyRecorded = years.every((year) =>
    records.some((record) => record.observedDate === observedDate && String(record.travelYear) === year),
  );
  if (!years.length || alreadyRecorded) return;
  const additions = years
    .filter((year) => !records.some((record) => record.observedDate === observedDate && String(record.travelYear) === year))
    .map((year) => ({
      observedDate,
      travelYear: Number(year),
      average: stats[year].average,
      minimum: stats[year].minimum,
      maximum: stats[year].maximum,
      sampleCount: stats[year].sampleCount,
    }));
  const nextRecords = [...records, ...additions].slice(-800);
  try {
    await env.PRICE_WATCH_KV.put(key, JSON.stringify({ records: nextRecords }));
  } catch {
    // Price search should still succeed if optional history storage is unavailable.
  }
}

async function skyscannerIndicativeSearch(payload, env) {
  const apiKey = envValue(env, "SKYSCANNER_API_KEY");
  if (!apiKey) throw new Error("SKYSCANNER_API_KEY is not set.");
  const departureId = compact(payload.departureId, "", 8).toUpperCase();
  const arrivalId = compact(payload.arrivalId, "", 8).toUpperCase();
  const mode = compact(payload.flightMode, "annual_low", 24);
  const today = new Date().toISOString().slice(0, 10);
  const startDate = mode === "annual_low" ? today : isoDate(payload.startDate, today);
  const horizonDays = mode === "annual_low" ? 365 : Math.max(0, Math.min(Number(payload.lookaheadDays || 30), 365));
  const endDate = addDays(startDate, horizonDays);
  const tripDays = Math.max(0, Math.min(Number(payload.tripDays || 0), 60));
  const currency = currencyLabel(payload.currency);
  const queryLegs = [
    {
      originPlace: { queryPlace: { iata: departureId } },
      destinationPlace: { queryPlace: { iata: arrivalId } },
      dateRange: {
        startDate: dateParts(startDate),
        endDate: dateParts(endDate),
      },
    },
  ];
  if (tripDays > 0) {
    queryLegs.push({
      originPlace: { queryPlace: { iata: arrivalId } },
      destinationPlace: { queryPlace: { iata: departureId } },
      dateRange: {
        startDate: dateParts(addDays(startDate, tripDays)),
        endDate: dateParts(addDays(endDate, tripDays)),
      },
    });
  }

  const response = await fetch("https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query: {
        market: compact(payload.market, "TW", 8),
        locale: compact(payload.locale, "zh-TW", 12),
        currency,
        queryLegs,
        dateTimeGroupingType: "DATE_TIME_GROUPING_TYPE_BY_DATE",
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Skyscanner request failed with HTTP ${response.status}.`);
  }

  const results = quoteValues(data)
    .map((quote, index) => {
      const price = normalizeMoney(quote.minPrice?.amount || quote.price?.amount || quote.price);
      const departureDate = quoteLegDate(quote.outboundLeg || quote.outbound_leg);
      const returnDate = quoteLegDate(quote.inboundLeg || quote.inbound_leg);
      if (!price || !departureDate || departureDate < startDate || departureDate > endDate) return null;
      if (tripDays > 0 && (!returnDate || daysBetween(departureDate, returnDate) !== tripDays)) return null;
      const dateText = returnDate ? `${departureDate} - ${returnDate}` : departureDate;
      const path = returnDate
        ? `${departureDate.replaceAll("-", "").slice(2)}/${returnDate.replaceAll("-", "").slice(2)}`
        : departureDate.replaceAll("-", "").slice(2);
      return {
        id: safeId(`${departureId}-${arrivalId}-${dateText}-${price}-${index}`, "flight"),
        type: "flight",
        title: `${departureId}-${arrivalId} ${dateText}`,
        source: "Skyscanner Indicative",
        price,
        priceText: formatPrice(price, currency),
        currency,
        link: `https://www.skyscanner.com.tw/transport/flights/${departureId.toLowerCase()}/${arrivalId.toLowerCase()}/${path}/`,
        departureDate,
        returnDate,
        tripDays,
        cached: true,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.price - right.price);
  const lowestPrice = results.length ? results[0].price : null;
  const yearlyQuotes = flightYearStats(results);
  const comparisonYear = Number(startDate.slice(0, 4));
  const previousYear = comparisonYear - 1;
  const historyKey = flightYearHistoryKey(departureId, arrivalId, tripDays, currency);
  const history = await readFlightYearHistory(env, historyKey);
  const previousRecords = history.filter((record) => Number(record.travelYear) === previousYear);
  const currentQuoteStats = yearlyQuotes[String(comparisonYear)] || null;
  const currentHistoryRecords = history.filter((record) => Number(record.travelYear) === comparisonYear);
  const yearStats = {
    year: comparisonYear,
    average: currentQuoteStats?.average ?? average(currentHistoryRecords.map((record) => record.average)),
    minimum: currentQuoteStats?.minimum ?? minimum(currentHistoryRecords.map((record) => record.minimum)),
    maximum: currentQuoteStats?.maximum ?? maximum(currentHistoryRecords.map((record) => record.maximum)),
    sampleCount: currentQuoteStats?.sampleCount ?? currentHistoryRecords.length,
    previousYear,
    previousAverage: average(previousRecords.map((record) => record.average)),
    previousMinimum: minimum(previousRecords.map((record) => record.minimum)),
    previousMaximum: maximum(previousRecords.map((record) => record.maximum)),
    previousSampleCount: previousRecords.length,
    basis: currentQuoteStats ? "departure_quotes" : "observed_daily_quotes",
  };
  await recordFlightYearHistory(env, historyKey, history, yearlyQuotes, today);
  return {
    mode,
    startDate,
    endDate,
    tripDays,
    results: results.slice(0, 30).map((item) => ({ ...item, isRangeLow: item.price === lowestPrice })),
    insights: {
      lowestPrice,
      rangeStart: startDate,
      rangeEnd: endDate,
      cached: true,
      cacheNotice: "Indicative prices may be up to 4 days old. Confirm live price before booking.",
      yearStats,
    },
  };
}

async function skyscannerPlaceSearch(payload, env) {
  const apiKey = envValue(env, "SKYSCANNER_API_KEY");
  if (!apiKey) throw new Error("SKYSCANNER_API_KEY is not set.");
  const searchTerm = compact(payload.query, "", 80);
  if (!searchTerm) return [];
  const response = await fetch("https://partners.api.skyscanner.net/apiservices/v3/autosuggest/flights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query: {
        market: compact(payload.market, "TW", 8),
        locale: compact(payload.locale, "zh-TW", 12),
        searchTerm,
        includedEntityTypes: ["PLACE_TYPE_CITY", "PLACE_TYPE_AIRPORT"],
      },
      limit: 8,
      isDestination: Boolean(payload.isDestination),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Skyscanner autosuggest failed with HTTP ${response.status}.`);
  }
  const values = data.places || data?.content?.results?.places || [];
  const places = Array.isArray(values) ? values : Object.values(values || {});
  return places
    .map((place) => ({
      name: compact(place.name || place.presentation?.title, "", 100),
      subtitle: compact(place.presentation?.subtitle || place.countryName, "", 120),
      iataCode: compact(place.iataCode || place.iata_code, "", 8).toUpperCase(),
      entityId: compact(place.entityId || place.entity_id, "", 80),
      type: compact(place.type, "", 40),
    }))
    .filter((place) => place.name && place.iataCode)
    .slice(0, 8);
}

async function serpApiPlaceSearch(payload, env) {
  const query = compact(payload.query, "", 80);
  if (!query) return [];
  const data = await serpApiSearch(
    {
      engine: "google_flights_autocomplete",
      q: query,
      gl: compact(payload.market, "TW", 8).toLowerCase(),
      hl: compact(payload.locale, "zh-TW", 12).toLowerCase(),
      exclude_regions: "true",
    },
    env,
  );
  const normalizedQuery = query.toUpperCase();
  const stationPattern = /\b(gare|station|railway|train)\b|車站|火車站|鐵路/i;
  const places = (data.suggestions || [])
    .flatMap((place) =>
      (place.airports || []).map((airport) => {
        const name = compact(airport.name, place.name, 100);
        const city = compact(airport.city || String(place.name || "").split(",")[0], "", 80);
        const country = compact(String(place.name || "").split(",").slice(1).join(","), "", 80);
        return {
          name,
          city,
          country,
          subtitle: compact([city, country, airport.distance].filter(Boolean).join(" · "), "", 150),
          iataCode: compact(airport.id, "", 8).toUpperCase(),
          entityId: compact(place.id, "", 80),
          type: "airport",
        };
      }),
    )
    .filter((place) => place.name && /^[A-Z]{3}$/.test(place.iataCode) && !stationPattern.test(place.name));
  return [...new Map(places.map((place) => [place.iataCode, place])).values()]
    .sort((left, right) => {
      const leftCodeMatch = left.iataCode.startsWith(normalizedQuery) ? 0 : 1;
      const rightCodeMatch = right.iataCode.startsWith(normalizedQuery) ? 0 : 1;
      return leftCodeMatch - rightCodeMatch;
    })
    .slice(0, 10);
}

function wikidataValue(binding, key) {
  return compact(binding?.[key]?.value, "", 180);
}

async function iataPrefixAirportSearch(prefix, env) {
  const normalizedPrefix = compact(prefix, "", 3).toUpperCase().replace(/[^A-Z]/g, "");
  if (!normalizedPrefix) return [];
  const cacheKey = `${AIRPORT_PREFIX_CACHE}:${normalizedPrefix}`;
  if (env.PRICE_WATCH_KV && typeof env.PRICE_WATCH_KV.get === "function") {
    try {
      const cached = await env.PRICE_WATCH_KV.get(cacheKey, { type: "json" });
      if (Array.isArray(cached?.places) && cached.places.length) return cached.places;
    } catch {
      // Continue with the live directory query.
    }
  }

  const sparql = `
SELECT ?iata
  (SAMPLE(?icaoValue) AS ?icao)
  (SAMPLE(?nameZhValue) AS ?nameZh)
  (SAMPLE(?nameEnValue) AS ?nameEn)
  (SAMPLE(?countryZhValue) AS ?countryZh)
  (SAMPLE(?countryEnValue) AS ?countryEn)
WHERE {
  ?airport wdt:P238 ?iata; wdt:P239 ?icaoValue.
  FILTER(STRSTARTS(UCASE(STR(?iata)), "${normalizedPrefix}"))
  OPTIONAL { ?airport rdfs:label ?nameZhValue. FILTER(LANG(?nameZhValue) IN ("zh-tw", "zh-hant", "zh-hk")) }
  OPTIONAL { ?airport rdfs:label ?nameEnValue. FILTER(LANG(?nameEnValue) = "en") }
  OPTIONAL {
    ?airport wdt:P17 ?country.
    OPTIONAL { ?country rdfs:label ?countryZhValue. FILTER(LANG(?countryZhValue) IN ("zh-tw", "zh-hant", "zh-hk")) }
    OPTIONAL { ?country rdfs:label ?countryEnValue. FILTER(LANG(?countryEnValue) = "en") }
  }
}
GROUP BY ?iata
ORDER BY ?iata
LIMIT 600`;
  const url = new URL("https://query.wikidata.org/sparql");
  url.searchParams.set("format", "json");
  url.searchParams.set("query", sparql);
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "JarvisPriceWatch/1.0 (global airport autocomplete)",
    },
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Global airport directory failed with HTTP ${response.status}.`);
  const places = (data?.results?.bindings || [])
    .map((binding) => {
      const iataCode = wikidataValue(binding, "iata").toUpperCase();
      const nameZh = wikidataValue(binding, "nameZh");
      const englishName = wikidataValue(binding, "nameEn");
      const country = wikidataValue(binding, "countryZh") || wikidataValue(binding, "countryEn");
      const name = nameZh || englishName || `${iataCode} 機場`;
      return {
        name,
        englishName: englishName && englishName !== name ? englishName : "",
        city: "",
        country,
        subtitle: [country, englishName && englishName !== name ? englishName : ""].filter(Boolean).join(" · "),
        iataCode,
        entityId: wikidataValue(binding, "icao") || iataCode,
        type: "airport",
      };
    })
    .filter((place) => /^[A-Z]{3}$/.test(place.iataCode) && place.iataCode.startsWith(normalizedPrefix));
  if (env.PRICE_WATCH_KV && typeof env.PRICE_WATCH_KV.put === "function" && places.length) {
    try {
      await env.PRICE_WATCH_KV.put(cacheKey, JSON.stringify({ places }), { expirationTtl: 2592000 });
    } catch {
      // Directory results can still be returned if optional cache storage fails.
    }
  }
  return places;
}

const PRODUCT_INSTALLMENT_PATTERN = /(?:每月|月付|月繳|月租|分期|\/\s*月|per\s+month|monthly\s+payment|installment|\/[\s]*mo\b)/i;
const PRODUCT_TRADE_IN_PATTERN = /(?:回收|收購|估價|換購價|折抵後|舊換新|退傭|trade[-\s]?in|buyback|cashback|sell\s+your)/i;
const PRODUCT_USED_PATTERN = /(?:二手|中古|福利品|展示品|整新品|翻新品|拆封品|極新|近全新|九成新|used|pre[-\s]?owned|refurbished|renewed|open[-\s]?box)/i;
const PRODUCT_ACCESSORY_PATTERN = /(?:保護殼|保護套|保護貼|鍵盤|觸控筆|充電器|轉接器|支架|case|cover|keyboard|pencil|stylus|charger|adapter|screen\s*protector)/i;
const PRODUCT_STOP_WORDS = new Set(["apple", "the", "with", "wifi", "wi-fi", "版", "吋", "英吋"]);

function normalizeProductText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/(\d+)\s*(gb|tb)\b/g, "$1$2")
    .replace(/(\d+)\s*g\b/g, "$1gb")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productSearchTokens(query) {
  return normalizeProductText(query)
    .split(" ")
    .filter((token) => token.length >= 2 && !PRODUCT_STOP_WORDS.has(token));
}

function productGenerationTokens(value) {
  return productSearchTokens(value).filter((token) => /^(?:m\d+|a\d{1,3}|s\d{1,3}|gen\d+|mk\d+)$/i.test(token));
}

function productStorageTokens(value) {
  return normalizeProductText(value).match(/\b\d+(?:gb|tb)\b/g) || [];
}

function productSizeTokens(value) {
  return productSearchTokens(value).filter((token) => /^\d{1,2}$/.test(token));
}

function analyzeShoppingResult(item, query) {
  const title = compact(item.title, "商品", 180);
  const context = [title, item.source, item.seller, item.price, item.condition, item.snippet, ...(Array.isArray(item.extensions) ? item.extensions : [])]
    .filter(Boolean)
    .join(" ");
  const normalizedTitle = normalizeProductText(title);
  const queryTokens = productSearchTokens(query);
  const matchedTokens = queryTokens.filter((token) => normalizedTitle.includes(token));
  const tokenCoverage = queryTokens.length ? matchedTokens.length / queryTokens.length : 1;
  const queryGenerations = productGenerationTokens(query);
  const titleGenerations = productGenerationTokens(title);
  const generationConflict = queryGenerations.length && titleGenerations.length
    && !queryGenerations.some((token) => titleGenerations.includes(token));
  const queryStorage = productStorageTokens(query);
  const titleStorage = productStorageTokens(title);
  const storageConflict = queryStorage.length && titleStorage.length
    && !queryStorage.some((token) => titleStorage.includes(token));
  const querySizes = productSizeTokens(query);
  const titleSizes = productSizeTokens(title);
  const sizeConflict = querySizes.length && titleSizes.length
    && !querySizes.some((token) => titleSizes.includes(token));
  const criticalSpecMissing = [queryGenerations, queryStorage, querySizes]
    .some((tokens) => tokens.length && !tokens.some((token) => normalizedTitle.includes(token)));
  const installment = PRODUCT_INSTALLMENT_PATTERN.test(context);
  const tradeIn = PRODUCT_TRADE_IN_PATTERN.test(context);
  const used = PRODUCT_USED_PATTERN.test(context);
  const accessory = PRODUCT_ACCESSORY_PATTERN.test(context) && !PRODUCT_ACCESSORY_PATTERN.test(query);
  const requestedUsed = PRODUCT_USED_PATTERN.test(query);
  const reasons = [];
  if (installment) reasons.push("installment");
  if (tradeIn) reasons.push("trade_in");
  if (used && !requestedUsed) reasons.push("used");
  if (accessory) reasons.push("accessory");
  if (generationConflict || storageConflict || sizeConflict || criticalSpecMissing || (queryTokens.length && tokenCoverage === 0) || (queryTokens.length >= 3 && tokenCoverage <= 0.6)) reasons.push("model_mismatch");
  return {
    comparable: reasons.length === 0,
    reasons,
    matchScore: Math.round(tokenCoverage * 100),
    priceKind: installment ? "installment" : tradeIn ? "trade_in" : "total",
    priceKindLabel: installment ? "月付／分期" : tradeIn ? "回收／折抵價" : "標示總價",
    condition: used ? "used" : "unspecified",
    conditionLabel: used ? "二手／整新品" : "新品狀態未標示",
  };
}

function normalizeShoppingResults(data, currency, query) {
  const rawItems = Array.isArray(data.shopping_results) ? data.shopping_results : [];
  const analyzed = rawItems
    .map((item) => {
      const price = normalizeMoney(item.extracted_price || item.price);
      if (!price) return null;
      const quality = analyzeShoppingResult(item, query);
      return {
        id: safeId(`${item.source || item.seller || "shop"}-${item.title || ""}-${item.link || ""}`, "product"),
        type: "product",
        title: compact(item.title, "商品", 180),
        source: compact(item.source || item.seller || "Google Shopping", "Google Shopping", 80),
        price,
        priceText: formatPrice(price, currency),
        currency: currencyLabel(currency),
        link: item.link || item.product_link || "",
        thumbnail: item.thumbnail || "",
        rating: item.rating || "",
        reviews: item.reviews || "",
        ...quality,
      };
    })
    .filter(Boolean);
  const results = analyzed
    .filter((item) => item.comparable)
    .sort((left, right) => left.price - right.price || right.matchScore - left.matchScore)
    .slice(0, 20);
  const excluded = analyzed.filter((item) => !item.comparable);
  const exclusionCounts = excluded.reduce((counts, item) => {
    item.reasons.forEach((reason) => { counts[reason] = (counts[reason] || 0) + 1; });
    return counts;
  }, {});
  return {
    results,
    insights: {
      rawResultCount: analyzed.length,
      comparableResultCount: results.length,
      excludedCount: excluded.length,
      exclusionCounts,
      notice: excluded.length
        ? `已排除 ${excluded.length} 筆月付價、回收價、二手品、配件或明顯不同型號。`
        : "結果依型號符合度與標示總價排序。",
    },
  };
}

function normalizeFlightResults(data, payload, currency) {
  const flights = [...(data.best_flights || []), ...(data.other_flights || [])];
  const route = `${payload.departureId || ""}-${payload.arrivalId || ""}`;
  const items = flights
    .map((item, index) => {
      const price = normalizeMoney(item.price);
      if (!price) return null;
      const firstFlight = Array.isArray(item.flights) ? item.flights[0] || {} : {};
      const lastFlight = Array.isArray(item.flights) ? item.flights[item.flights.length - 1] || {} : {};
      const airline = compact(firstFlight.airline || item.airline || "Flight", "Flight", 80);
      const segments = (Array.isArray(item.flights) ? item.flights : []).map((flight) => ({
        airline: compact(flight.airline, "", 80),
        flightNumber: compact(flight.flight_number, "", 30),
        departureAirport: compact(flight.departure_airport?.id, "", 12),
        departureTime: compact(flight.departure_airport?.time, "", 30),
        arrivalAirport: compact(flight.arrival_airport?.id, "", 12),
        arrivalTime: compact(flight.arrival_airport?.time, "", 30),
        duration: Number(flight.duration || 0),
        airplane: compact(flight.airplane, "", 80),
      }));
      const stopCount = Math.max(0, segments.length - 1);
      const allLowCost = Boolean(segments.length) && segments.every(isLowCostSegment);
      const anyLowCost = segments.some(isLowCostSegment);
      const airlineType = allLowCost ? "low_cost" : anyLowCost ? "mixed" : "full_service";
      const purchaseLinks = flightPurchaseLinks(payload, airline, segments);
      return {
        id: safeId(`${route}-${airline}-${item.price}-${index}`, "flight"),
        type: "flight",
        title: `${route} ${compact(airline, "航班", 60)}`,
        source: "Google Flights",
        price,
        priceText: formatPrice(price, currency),
        currency: currencyLabel(currency),
        link: `https://www.google.com/travel/flights?q=${encodeURIComponent(
          `${payload.departureId || ""} ${payload.arrivalId || ""} ${payload.outboundDate || ""} ${payload.returnDate || ""}`,
        )}`,
        airline,
        duration: Number(item.total_duration || 0),
        stops: stopCount,
        departure: firstFlight.departure_airport?.time || "",
        arrival: lastFlight.arrival_airport?.time || "",
        departureAirport: firstFlight.departure_airport?.id || payload.departureId || "",
        arrivalAirport: lastFlight.arrival_airport?.id || payload.arrivalId || "",
        departureDate: payload.outboundDate || "",
        returnDate: payload.returnDate || "",
        tripDays: payload.returnDate ? daysBetween(payload.outboundDate, payload.returnDate) : 0,
        travelClass: compact(payload.travelClass, "1", 4),
        cabinClass: compact(payload.cabinClass, "economy", 30),
        cabinLabel: compact(payload.cabinLabel, "經濟艙", 30),
        segments,
        airlineType,
        airlineTypeLabel: airlineType === "low_cost" ? "廉價航空" : airlineType === "mixed" ? "混合航空" : "傳統航空",
        purchaseLinks,
      };
    })
    .filter(Boolean)
    .filter((item) => {
      const airlineType = compact(payload.airlineType, "all", 24);
      const routeType = compact(payload.routeType, "any", 24);
      if (airlineType === "low_cost" && item.airlineType !== "low_cost") return false;
      if (airlineType === "full_service" && item.airlineType !== "full_service") return false;
      if (routeType === "nonstop" && item.stops !== 0) return false;
      if (routeType === "connecting" && item.stops === 0) return false;
      return true;
    })
    .sort((left, right) => left.price - right.price)
    .slice(0, 20);

  const insights = data.price_insights || {};
  return {
    results: items,
    insights: {
      lowestPrice: normalizeMoney(insights.lowest_price),
      priceLevel: insights.price_level || "",
      typicalPriceRange: insights.typical_price_range || [],
    },
  };
}

function productWatchFromPayload(payload) {
  const name = compact(payload.name || payload.query || payload.title, "商品追蹤", 120);
  const query = compact(payload.query || name, name, 160);
  const currency = currencyLabel(payload.currency);
  return {
    enabled: true,
    id: safeId(payload.id || name, "product"),
    type: "product",
    name,
    currency,
    target_price: normalizeMoney(payload.targetPrice),
    alert_on_new_low: true,
    alert_cooldown_days: 7,
    sources: [
      {
        type: "serpapi_google_shopping",
        id: "google-shopping",
        name: "Google Shopping",
        query,
        gl: compact(payload.gl, "tw", 8),
        hl: compact(payload.hl, "zh-tw", 12),
        currency,
        limit: 8,
      },
    ],
  };
}

function flightWatchFromPayload(payload, env) {
  const departureId = compact(payload.departureId, "", 8).toUpperCase();
  const arrivalId = compact(payload.arrivalId, "", 8).toUpperCase();
  const mode = compact(payload.flightMode, "annual_low", 24);
  const startDate = isoDate(payload.startDate, "");
  const tripDays = Math.max(0, Math.min(Number(payload.tripDays || 0), 60));
  const lookaheadDays = Math.max(1, Math.min(Number(payload.lookaheadDays || 30), 365));
  const modeLabel = mode === "annual_low" ? "未來一年低價探索" : `${startDate} 起 ${lookaheadDays} 天`;
  const name = compact(payload.name, `${departureId} 到 ${arrivalId} ${modeLabel}`, 140);
  const currency = currencyLabel(payload.currency);
  const travelClass = compact(payload.travelClass, "1", 4);
  const cabin = FLIGHT_CABINS.find((item) => item.code === travelClass) || FLIGHT_CABINS[0];
  const airlineType = ["all", "low_cost", "full_service"].includes(payload.airlineType) ? payload.airlineType : "all";
  const routeType = ["any", "nonstop", "connecting"].includes(payload.routeType) ? payload.routeType : "any";
  const useSkyscanner = Boolean(envValue(env, "SKYSCANNER_API_KEY"));
  const source = {
    type: useSkyscanner ? "skyscanner_indicative_flights" : "serpapi_google_flights_sampled",
    id: useSkyscanner ? "skyscanner-indicative" : "google-flights-sampled",
    name: useSkyscanner ? "Skyscanner Indicative" : "Google Flights 抽樣",
    mode,
    departure_id: departureId,
    arrival_id: arrivalId,
    start_date: startDate,
    horizon_days: mode === "annual_low" ? 365 : lookaheadDays,
    lookahead_days: lookaheadDays,
    trip_days: tripDays,
    currency,
    market: compact(payload.market, "TW", 8),
    locale: compact(payload.locale, "zh-TW", 12),
    travel_class: cabin.code,
    cabin_class: cabin.key,
    cabin_label: cabin.label,
    airline_type: airlineType,
    route_type: routeType,
    stops: routeType === "nonstop" ? "1" : "0",
    include_airlines: airlineType === "low_cost" ? [...LOW_COST_AIRLINE_CODES].join(",") : "",
    exclude_airlines: airlineType === "full_service" ? [...LOW_COST_AIRLINE_CODES].join(",") : "",
    check_interval_hours: useSkyscanner ? 12 : 24,
  };
  return {
    enabled: true,
    id: safeId(payload.id || `${departureId}-${arrivalId}-${mode}-${startDate}-${tripDays}-${cabin.key}`, "flight"),
    type: "flight",
    name: name.endsWith(cabin.label) ? name : `${name} ${cabin.label}`,
    currency,
    target_price: normalizeMoney(payload.targetPrice),
    alert_on_new_low: true,
    alert_on_first_seen: mode === "annual_low",
    alert_strategy: mode === "annual_low" ? "annual_floor" : "target_or_new_low",
    alert_cooldown_days: 3,
    sources: [source],
  };
}

function validateWatch(watch) {
  if (!watch || typeof watch !== "object") throw new Error("watch is required.");
  if (!watch.id || !watch.name || !watch.type) throw new Error("watch id, name and type are required.");
  if (!Array.isArray(watch.sources) || !watch.sources.length) throw new Error("watch sources are required.");
  return watch;
}

async function readPriceWatches(env) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.get !== "function") return [];
  const data = await env.PRICE_WATCH_KV.get(PRICE_WATCH_KV_KEY, { type: "json" });
  return Array.isArray(data?.watches) ? data.watches : [];
}

async function writePriceWatches(env, watches) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.put !== "function") {
    throw new Error("PRICE_WATCH_KV binding is not set.");
  }
  await env.PRICE_WATCH_KV.put(PRICE_WATCH_KV_KEY, JSON.stringify({ watches }, null, 2));
}

async function handlePriceWatchConfig(request, env) {
  if (request.method !== "GET") return methodNotAllowed();
  return json(200, {
    hasSerpApi: Boolean(envValue(env, "SERPAPI_API_KEY")),
    hasSkyscanner: Boolean(envValue(env, "SKYSCANNER_API_KEY")),
    hasKv: Boolean(env.PRICE_WATCH_KV),
    requiresToken: !isPublicPriceWatchSearch(env),
    trackingRequiresToken: true,
    publicSearch: isPublicPriceWatchSearch(env),
  });
}

async function handlePriceWatchSearch(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") return methodNotAllowed();
  if (!(await hasPriceWatchAccess(request, env, true))) return priceWatchAuthError(env);
  const rateLimited = await publicSearchRateLimit(request, env, "search");
  if (rateLimited) return rateLimited;

  const payload = await request.json().catch(() => ({}));
  const type = compact(payload.type, "product", 20).toLowerCase();
  const currency = currencyLabel(payload.currency);

  if (type === "product") {
    const query = compact(payload.query, "", 160);
    if (!query) return json(400, { error: "query is required." });
    const data = await serpApiSearch(
      {
        engine: "google_shopping",
        q: query,
        gl: compact(payload.gl, "tw", 8),
        hl: compact(payload.hl, "zh-tw", 12),
        currency,
      },
      env,
    );
    const normalized = normalizeShoppingResults(data, currency, query);
    return json(200, {
      type: "product",
      query,
      currency,
      ...normalized,
    });
  }

  if (type === "flight") {
    const departureId = compact(payload.departureId, "", 8).toUpperCase();
    const arrivalId = compact(payload.arrivalId, "", 8).toUpperCase();
    const flightMode = compact(payload.flightMode, "annual_low", 24);
    const startDate = isoDate(payload.startDate, "");
    if (!departureId || !arrivalId || (flightMode === "date_window" && !startDate)) {
      return json(400, { error: "departureId, arrivalId and a valid startDate for date_window are required." });
    }
    if (flightMode === "annual_low" || flightMode === "date_window") {
      const flexibleSearch = envValue(env, "SKYSCANNER_API_KEY")
        ? skyscannerIndicativeSearch
        : serpApiSampledFlightSearch;
      return json(200, {
        type: "flight",
        currency,
        ...(await flexibleSearch({ ...payload, departureId, arrivalId, startDate, flightMode }, env)),
      });
    }
    const outboundDate = compact(payload.outboundDate, "", 16);
    if (!outboundDate) return json(400, { error: "outboundDate is required for fixed date search." });
    const data = await serpApiSearch(
      {
        engine: "google_flights",
        departure_id: departureId,
        arrival_id: arrivalId,
        outbound_date: outboundDate,
        return_date: compact(payload.returnDate, "", 16),
        currency,
        hl: compact(payload.hl, "zh-tw", 12),
        gl: compact(payload.gl, "tw", 8),
        adults: compact(payload.adults, "1", 4),
        travel_class: compact(payload.travelClass, "1", 4),
      },
      env,
    );
    return json(200, {
      type: "flight",
      currency,
      ...normalizeFlightResults(data, { ...payload, departureId, arrivalId, outboundDate }, currency),
    });
  }

  return json(400, { error: "Unsupported search type." });
}

function priceWatchSearchErrorResponse(error) {
  const message = safeErrorMessage(error?.message || "");
  if (/quota|searches|plan|credit|limit/i.test(message)) {
    return json(429, { code: "provider_quota", error: "SerpApi 查詢額度目前不足，請稍後再試或升級方案。" });
  }
  if (/timeout|aborted|signal/i.test(message)) {
    return json(504, { code: "provider_timeout", error: "資料來源回應逾時，請稍後重試或縮小搜尋條件。" });
  }
  return json(502, { code: "provider_error", error: "資料來源暫時無法回應，請稍後重試。" });
}

async function handlePriceWatchPlaces(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") return methodNotAllowed();
  if (!(await hasPriceWatchAccess(request, env, true))) return priceWatchAuthError(env);
  const payload = await request.json().catch(() => ({}));
  const query = compact(payload.query, "", 80);
  const isIataPrefix = /^[A-Za-z]{1,3}$/.test(query);
  let places;
  let source = "autocomplete";
  if (isIataPrefix) {
    try {
      places = await iataPrefixAirportSearch(query, env);
      source = "global_iata_directory";
    } catch {
      places = envValue(env, "SKYSCANNER_API_KEY")
        ? await skyscannerPlaceSearch(payload, env)
        : await serpApiPlaceSearch(payload, env);
      source = "autocomplete_fallback";
    }
  } else {
    places = envValue(env, "SKYSCANNER_API_KEY")
      ? await skyscannerPlaceSearch(payload, env)
      : await serpApiPlaceSearch(payload, env);
  }
  return json(200, { places, source, count: places.length });
}

async function handlePriceWatchWatches(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (!(await hasPriceWatchAccess(request, env, false))) return priceWatchAuthError(env);

  if (request.method === "GET") {
    return json(200, { watches: await readPriceWatches(env) });
  }

  if (request.method !== "POST") return methodNotAllowed();
  const payload = await request.json().catch(() => ({}));
  let watch = payload.watch;
  if (!watch && payload.type === "product") watch = productWatchFromPayload(payload);
  if (!watch && payload.type === "flight") watch = flightWatchFromPayload(payload, env);
  watch = validateWatch(watch);

  const watches = await readPriceWatches(env);
  const withoutExisting = watches.filter((item) => item.id !== watch.id);
  withoutExisting.push(watch);
  await writePriceWatches(env, withoutExisting);
  return json(200, { ok: true, watch, watches: withoutExisting });
}

function list(values, fallback, maxItems = 6) {
  const items = Array.isArray(values)
    ? values.map((item) => compact(item, "", 120)).filter(Boolean)
    : [];
  return (items.length ? items : [fallback]).slice(0, maxItems).join(", ");
}

function imageOutputFormat(env) {
  const format = compact(envValue(env, "IMAGE_OUTPUT_FORMAT", "jpeg"), "jpeg", 12).toLowerCase();
  return ["png", "webp", "jpeg"].includes(format) ? format : "jpeg";
}

function buildPrompt(payload) {
  const method = compact(payload.method, "Chinese astrology", 80);
  const targetGender = compact(payload.targetGender, "adult person", 40);
  const imageGender = compact(payload.imageGender, targetGender, 90);
  const genderReason = compact(payload.genderReason, "", 180);
  const careers = list(payload.careers, "professional, composed, reliable");
  const stars = list(payload.stars, "balanced and refined symbolic traits", 10);
  const reasons = list(payload.reasons, "warm but composed relationship energy", 4);
  const palaces = payload.palaces || {};
  const appearance = payload.appearance || {};
  const details = appearance.details || {};
  const face = compact(appearance.face, "clean facial features with a memorable expression");
  const build = compact(appearance.build, "balanced body type");
  const element = compact(appearance.element, "balanced");
  const height = compact(details.height, "natural adult height", 32);
  const weight = compact(details.weight, "proportional adult weight", 32);
  const bodyRatio = compact(details.bodyRatio, "balanced body proportions", 140);
  const hairColor = compact(details.hairColor, "natural dark hair", 40);
  const hairStyle = compact(details.hairStyle, "clean natural hairstyle", 80);
  const outfit = compact(details.outfit, "modern tasteful everyday outfit", 180);
  const story = compact(details.story, "", 220);
  const notes = list(appearance.notes, "natural confidence, approachable expression", 6);

  return [
    `Create a high-quality photorealistic portrait of a fictional ${imageGender}.`,
    `Astrology method: ${method}. Relationship-presentation note: ${targetGender}${genderReason ? `, ${genderReason}` : ""}.`,
    "The person must be original and not a celebrity, influencer, public figure, or identifiable private person.",
    "Use a tasteful editorial portrait style, natural lighting, realistic skin texture, modern clothing, calm confident expression, half-body framing, neutral background, no text, no watermark, no horoscope symbols.",
    `Appearance direction: ${face}; body direction: ${build}; five-element mood: ${element}.`,
    `Specific body and styling details: about ${height}, ${weight}; body proportions: ${bodyRatio}; hair color: ${hairColor}; hairstyle: ${hairStyle}; outfit preference: ${outfit}.`,
    story ? `Character silhouette story: ${story}.` : "",
    `Personality and styling cues: ${notes}.`,
    `Possible career aura: ${careers}.`,
    `Symbolic references from ${method}, used only as abstract styling guidance: relationship context ${compact(palaces.spouse)}, supporting structure ${compact(palaces.spouseSquare)}, self context ${compact(palaces.life)}, external context ${compact(palaces.travel)}, inner context ${compact(palaces.fortune)}, career context ${compact(palaces.career)}, wealth context ${compact(palaces.wealth)}, origin context ${compact(palaces.cause)}, stars ${stars}.`,
    `Relationship context cues: ${reasons}.`,
    "Do not include explicit content. Do not include more than one person. Do not add labels or captions.",
  ].filter(Boolean).join(" ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function openAIModels(env) {
  const models = unique([
    compact(envValue(env, "OPENAI_IMAGE_MODEL", "gpt-image-2"), "gpt-image-2", 80),
    compact(envValue(env, "OPENAI_FALLBACK_IMAGE_MODEL", "gpt-image-1.5"), "gpt-image-1.5", 80),
  ]).filter((model) => model.startsWith("gpt-image"));
  return models.length ? models : ["gpt-image-2", "gpt-image-1.5"];
}

function geminiModels(env) {
  const models = unique([
    compact(envValue(env, "GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image"), "gemini-3.1-flash-image", 80),
    compact(envValue(env, "GEMINI_FALLBACK_IMAGE_MODEL", "gemini-2.5-flash-image"), "gemini-2.5-flash-image", 80),
  ]).filter((model) => model.startsWith("gemini-"));
  return models.length ? models : ["gemini-3.1-flash-image", "gemini-2.5-flash-image"];
}

function cloudflareModels(env) {
  const models = unique([
    compact(envValue(env, "CLOUDFLARE_IMAGE_MODEL", "@cf/black-forest-labs/flux-1-schnell"), "@cf/black-forest-labs/flux-1-schnell", 120),
  ]).filter((model) => model.startsWith("@cf/"));
  return models.length ? models : ["@cf/black-forest-labs/flux-1-schnell"];
}

function cloudflareSteps(env) {
  const value = Number.parseInt(envValue(env, "CLOUDFLARE_IMAGE_STEPS", "4"), 10);
  if (!Number.isFinite(value)) return 4;
  return Math.max(1, Math.min(value, 8));
}

async function generateWithOpenAI(prompt, model, env) {
  const apiKey = envValue(env, "OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const body = {
    model,
    prompt,
    n: 1,
    size: envValue(env, "IMAGE_SIZE", "1024x1536"),
    quality: envValue(env, "IMAGE_QUALITY", "medium"),
    output_format: imageOutputFormat(env),
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI image generation failed.");
  }

  const image = data.data?.[0];
  if (image?.b64_json) {
    return {
      imageUrl: `data:image/${body.output_format};base64,${image.b64_json}`,
      provider: `OpenAI ${model}`,
    };
  }
  if (image?.url) {
    return {
      imageUrl: image.url,
      provider: `OpenAI ${model}`,
    };
  }

  throw new Error("OpenAI did not return an image.");
}

async function generateWithGemini(prompt, model, env) {
  const apiKey = envValue(env, "GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini image generation failed.");
  }

  const parts = data.candidates?.flatMap((candidate) => candidate.content?.parts || []) || [];
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const inlineData = imagePart?.inlineData || imagePart?.inline_data;

  if (!inlineData?.data) {
    throw new Error("Gemini did not return an image.");
  }

  return {
    imageUrl: `data:${inlineData.mimeType || inlineData.mime_type || "image/png"};base64,${inlineData.data}`,
    provider: `Gemini ${model}`,
  };
}

async function generateWithCloudflare(prompt, model, env) {
  if (!env.AI || typeof env.AI.run !== "function") {
    throw new Error("Cloudflare Workers AI binding AI is not set.");
  }

  const result = await env.AI.run(model, {
    prompt: compact(prompt, "", 2048),
    steps: cloudflareSteps(env),
    seed: Math.floor(Math.random() * 1_000_000_000),
  });
  const image = result?.image || result?.result?.image;
  if (!image) throw new Error("Cloudflare did not return an image.");

  return {
    imageUrl: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`,
    provider: `Cloudflare ${model}`,
  };
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function availableProviders(env) {
  return [
    env?.AI ? "cloudflare" : "",
    envValue(env, "OPENAI_API_KEY") ? "openai" : "",
    envValue(env, "GEMINI_API_KEY") ? "gemini" : "",
  ].filter(Boolean);
}

function providerOrder(env) {
  const provider = compact(envValue(env, "IMAGE_PROVIDER"), "", 20).toLowerCase();
  const available = availableProviders(env);

  if (provider === "openai" || provider === "gemini" || provider === "cloudflare") {
    return available.includes(provider) ? [provider] : [];
  }
  if (provider === "random" && available.length) {
    return shuffle(available);
  }
  return available.length > 1 ? shuffle(available) : available;
}

function providerModels(provider, env) {
  if (provider === "cloudflare") return cloudflareModels(env);
  if (provider === "openai") return openAIModels(env);
  if (provider === "gemini") return geminiModels(env);
  return [];
}

async function generateWithProvider(prompt, provider, model, env) {
  if (provider === "cloudflare") return generateWithCloudflare(prompt, model, env);
  if (provider === "gemini") return generateWithGemini(prompt, model, env);
  if (provider === "openai") return generateWithOpenAI(prompt, model, env);
  throw new Error(`Unsupported provider: ${provider}`);
}

async function generateWithFallback(prompt, env) {
  const attempts = [];
  const failures = [];
  for (const provider of providerOrder(env)) {
    for (const model of providerModels(provider, env)) {
      attempts.push(`${provider}:${model}`);
      try {
        return await generateWithProvider(prompt, provider, model, env);
      } catch (error) {
        failures.push(`${provider}:${model} => ${safeErrorMessage(error.message)}`);
      }
    }
  }

  throw new Error(
    `所有 AI 圖片模型都生成失敗。已嘗試：${attempts.join("、") || "無可用模型"}。錯誤摘要：${failures.join("；") || "無"}`,
  );
}

async function handleGeneratePartnerImage(request, env) {
  if (request.method === "OPTIONS") {
    return corsPreflight();
  }
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json(400, { error: "Invalid JSON body." });
  }

  if (!availableProviders(env).length) {
    return json(500, {
      error: "尚未設定 AI 圖片服務。請確認 wrangler.toml 有 [ai] binding = \"AI\"，或在 Cloudflare Variables and secrets 加入 OPENAI_API_KEY / GEMINI_API_KEY。",
    });
  }

  try {
    const prompt = buildPrompt(payload || {});
    return json(200, await generateWithFallback(prompt, env));
  } catch (error) {
    return json(502, {
      error: error.message || "AI 圖片生成失敗。",
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      url.pathname === "/.netlify/functions/generate-partner-image" ||
      url.pathname === "/api/generate-partner-image"
    ) {
      return handleGeneratePartnerImage(request, env);
    }
    if (url.pathname === "/api/price-watch/config") {
      return handlePriceWatchConfig(request, env);
    }
    if (url.pathname === "/api/price-watch/search") {
      try {
        return await handlePriceWatchSearch(request, env);
      } catch (error) {
        return priceWatchSearchErrorResponse(error);
      }
    }
    if (url.pathname === "/api/price-watch/places") {
      return handlePriceWatchPlaces(request, env);
    }
    if (url.pathname === "/api/price-watch/watches") {
      return handlePriceWatchWatches(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
