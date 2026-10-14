const DAY = 86400000;
export const addDateDays = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
const dateDifference = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && addDateDays(value, 0) === value;
}

function integer(value, fallback, min, max, label) {
  const n = value === undefined || value === "" ? fallback : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) invalid(`${label}須介於 ${min} 與 ${max}。`);
  return n;
}

export function validateFlightPreferences(input) {
  const payload = { ...input };
  for (const key of ["departureId", "arrivalId", ...(payload.journeyType === "multicity" ? ["stopoverId"] : [])]) {
    payload[key] = String(payload[key] || "").trim().toUpperCase();
    if (key === "departureId" && payload[key] === "TSA,TPE") payload[key] = "TPE,TSA";
    if (!/^[A-Z]{3}$/.test(payload[key]) && !(key === "departureId" && payload[key] === "TPE,TSA")) invalid("請選擇有效機場，或台北全部機場。");
  }
  if (payload.departureId.split(",").includes(payload.arrivalId)) invalid("出發地與目的地不可相同。");
  payload.journeyType = payload.journeyType === "multicity" ? "multicity" : "simple";
  if (payload.flightMode === "date_window" && !validDate(payload.startDate)) invalid("請選擇有效的最早出發日。");
  payload.lookaheadDays = integer(payload.lookaheadDays, 30, 0, 365, "搜尋範圍");
  payload.tripDays = integer(payload.tripDays, 5, 0, 60, "旅行天數");
  payload.travelClass = ["1", "2", "3"].includes(String(payload.travelClass)) ? String(payload.travelClass) : "1";
  payload.airlineType = ["all", "low_cost", "full_service"].includes(payload.airlineType) ? payload.airlineType : "all";
  payload.routeType = ["any", "nonstop", "connecting"].includes(payload.routeType) ? payload.routeType : "any";
  for (const key of ["excludedAirlines", "excludedAircraft"]) {
    if (payload[key] !== undefined && !Array.isArray(payload[key])) invalid("排除條件格式錯誤。");
    payload[key] = [...new Set((payload[key] || []).map((item) => String(item).trim().toUpperCase()).filter(Boolean))];
    if (payload[key].length > 50) invalid("排除條件過多。");
  }
  if (payload.excludedAirlines.some((code) => !/^(?:[A-Z]{2}|[A-Z][0-9]|[0-9][A-Z])$/.test(code))) invalid("航空公司請使用兩碼 IATA 代碼。");
  if (payload.excludedAircraft.some((model) => !/^[A-Z0-9 -]{2,30}$/.test(model))) invalid("機型請使用英文型號。");
  payload.allowUnknownAircraft = payload.allowUnknownAircraft === true;
  for (const key of ["departureTimeFrom", "departureTimeTo", "arrivalTimeFrom", "arrivalTimeTo"]) {
    payload[key] = String(payload[key] || "");
    if (payload[key] && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(payload[key])) invalid("起降時間格式錯誤。");
  }
  if (payload.journeyType === "multicity") {
    if ([...payload.departureId.split(","), payload.arrivalId].includes(payload.stopoverId)) invalid("停留城市須與出發地、目的地不同。");
    payload.stopoverMinNights = integer(payload.stopoverMinNights, 2, 1, 30, "停留夜數");
    payload.stopoverMaxNights = integer(payload.stopoverMaxNights, 5, payload.stopoverMinNights, 30, "停留夜數上限");
    payload.includeReturn = payload.includeReturn === true;
    payload.destinationMinNights = integer(payload.destinationMinNights, 3, 1, 30, "目的地夜數");
    payload.destinationMaxNights = integer(payload.destinationMaxNights, 7, payload.destinationMinNights, 30, "目的地夜數上限");
  }
  if (payload.comparisonPlan) {
    const plan = payload.comparisonPlan;
    if (!validDate(plan.date) || plan.date !== payload.startDate) invalid("艙等比較日期不正確。");
    for (const key of ["secondDate", "thirdDate"]) {
      if (plan[key] && (!validDate(plan[key]) || dateDifference(plan.date, plan[key]) < 1 || dateDifference(plan.date, plan[key]) > 65)) invalid("多城市比較日期不正確。");
    }
    payload.comparisonPlan = { date: plan.date, nights: integer(plan.nights, 0, 0, 30, "停留夜數"),
      destinationNights: integer(plan.destinationNights, 0, 0, 30, "目的地夜數"), secondDate: plan.secondDate, thirdDate: plan.thirdDate };
    payload.lockDates = true;
  }
  return payload;
}

export function hasFlightPreferences(p) {
  return p.departureId?.includes(",") || p.journeyType === "multicity" || p.excludedAirlines?.length || p.excludedAircraft?.length
    || p.departureTimeFrom || p.departureTimeTo || p.arrivalTimeFrom || p.arrivalTimeTo
    || p.airlineType !== "all" || p.routeType !== "any";
}

export function providerFlightFilters(p, lowCostCodes) {
  const filters = { stops: p.routeType === "nonstop" ? "1" : "0", show_hidden: "true" };
  const excluded = new Set(p.excludedAirlines || []);
  if (p.airlineType === "low_cost") {
    const allowed = [...lowCostCodes].filter((code) => !excluded.has(code));
    if (!allowed.length) invalid("所有可查詢的廉航都已被排除。");
    filters.include_airlines = allowed.join(",");
  } else {
    if (p.airlineType === "full_service") lowCostCodes.forEach((code) => excluded.add(code));
    if (excluded.size) filters.exclude_airlines = [...excluded].join(",");
  }
  // Provider uses inclusive hours. Exact minute and overnight windows are checked locally.
  const times = [];
  for (const prefix of ["departure", "arrival"]) {
    const from = p[`${prefix}TimeFrom`] || "00:00";
    const to = p[`${prefix}TimeTo`] || "23:59";
    times.push(...(from > to ? [0, 23] : [Number(from.slice(0, 2)), Number(to.slice(0, 2))]));
  }
  if (times.join(",") !== "0,23,0,23") filters.outbound_times = times.join(",");
  return filters;
}

function withinTime(value, from, to) {
  if (!from && !to) return true;
  const time = String(value || "").match(/(?:T|\s)(\d{2}:\d{2})/)?.[1];
  if (!time) return false;
  const start = from || "00:00";
  const end = to || "23:59";
  return start <= end ? time >= start && time <= end : time >= start || time <= end;
}

const aircraftKey = (value) => String(value || "").toUpperCase().replace(/BOEING|AIRBUS|DE HAVILLAND/g, "").replace(/[^A-Z0-9]/g, "");
const airlineNames = {
  BR: /eva air|長榮/i, CI: /china airlines|中華航空|華航/i, JX: /starlux|星宇/i,
  IT: /tigerair taiwan|台灣虎航|臺灣虎航/i, TR: /scoot|酷航/i, MM: /peach|樂桃/i,
  CX: /cathay|國泰/i, UO: /hk express|hong kong express|香港快運/i,
  JL: /japan airlines|日本航空/i, NH: /all nippon|^ana$|全日空/i, KE: /korean air|大韓/i,
  SQ: /singapore airlines|新加坡航空/i, UA: /united airlines|聯合航空/i, BA: /british airways|英國航空/i, LH: /lufthansa|漢莎/i,
};
export function matchesFlightPreferences(item, p) {
  const segments = item.segments || [];
  if (!segments.length) return false;
  const excluded = new Set(p.excludedAirlines || []);
  if (segments.some((s) => {
    const code = String(s.flightNumber || "").match(/^([A-Z0-9]{2})\s*\d/)?.[1];
    return excluded.has(code) || excluded.has(s.operatingAirlineCode)
      || [...excluded].some((excludedCode) => airlineNames[excludedCode]?.test(`${s.airline || ""} ${s.operatingAirline || ""}`));
  })) return false;
  if (p.excludedAircraft?.length && segments.some((s) => {
    const model = aircraftKey(s.airplane);
    if (!model) return !p.allowUnknownAircraft;
    return p.excludedAircraft.some((excludedModel) => model.includes(aircraftKey(excludedModel)));
  })) return false;
  return withinTime(segments[0].departureTime, p.departureTimeFrom, p.departureTimeTo)
    && withinTime(segments.at(-1).arrivalTime, p.arrivalTimeFrom, p.arrivalTimeTo);
}

export function flightPreferenceKey(p) {
  return JSON.stringify([p.airlineType, p.routeType, [...(p.excludedAirlines || [])].sort(),
    [...(p.excludedAircraft || [])].sort(), p.allowUnknownAircraft,
    p.departureTimeFrom, p.departureTimeTo, p.arrivalTimeFrom, p.arrivalTimeTo]);
}

export function makeJourneyPlans(p, startDate, endDate, tracking = false) {
  if (p.comparisonPlan && !tracking) return [p.comparisonPlan];
  const multi = p.journeyType === "multicity";
  const dates = [startDate, endDate].filter((date, index, all) => all.indexOf(date) === index);
  const stays = multi ? [...new Set([p.stopoverMinNights, p.stopoverMaxNights])] : [0];
  const plans = [];
  for (const date of dates) {
    for (const nights of stays) {
      const destinations = multi && p.includeReturn ? [...new Set([p.destinationMinNights, p.destinationMaxNights])] : [0];
      for (const destinationNights of destinations) plans.push({ date, nights, destinationNights });
    }
  }
  if (tracking) {
    const day = Math.floor(Date.now() / DAY);
    const offset = day % (dateDifference(startDate, endDate) + 1);
    return [{ date: addDateDays(startDate, offset), nights: multi ? p.stopoverMinNights + day % (p.stopoverMaxNights - p.stopoverMinNights + 1) : 0,
      destinationNights: multi && p.includeReturn ? p.destinationMinNights + Math.floor(day / (p.stopoverMaxNights - p.stopoverMinNights + 1)) % (p.destinationMaxNights - p.destinationMinNights + 1) : 0 }];
  }
  if (plans.length <= 4) return plans;
  return [0, Math.round((plans.length - 1) / 3), Math.round((plans.length - 1) * 2 / 3), plans.length - 1].map((index) => plans[index]);
}

// Follow selection tokens: each quote is a whole itinerary total, never a sum of leg totals.
export async function searchCompleteJourney(p, plan, cabin, search, normalize, lowCostCodes, retry = false) {
  const multi = p.journeyType === "multicity";
  const legs = multi
    ? [{ departure_id: p.departureId, arrival_id: p.stopoverId, date: plan.date },
      { departure_id: p.stopoverId, arrival_id: p.arrivalId, date: plan.secondDate || addDateDays(plan.date, plan.nights) }]
    : [{ departure_id: p.departureId, arrival_id: p.arrivalId, date: plan.date }];
  if (multi && p.includeReturn) legs.push({ departure_id: p.arrivalId, arrival_id: p.departureId, date: plan.thirdDate || addDateDays(legs[1].date, plan.destinationNights) });
  if (!multi && p.tripDays > 0) legs.push({ departure_id: p.arrivalId, arrival_id: p.departureId, date: addDateDays(plan.date, p.tripDays) });
  const filters = providerFlightFilters(p, lowCostCodes);
  const params = { engine: "google_flights", currency: p.currency || "TWD", hl: (p.locale || "zh-TW").toLowerCase(),
    gl: (p.market || "TW").toLowerCase(), travel_class: cabin.code, sort_by: "2", ...filters,
    type: multi ? "3" : legs.length === 2 ? "1" : "2" };
  if (multi) {
    params.multi_city_json = JSON.stringify(legs.map((leg) => ({ ...leg, ...(filters.outbound_times ? { times: filters.outbound_times } : {}) })));
    delete params.outbound_times;
  } else {
    params.departure_id = p.departureId;
    params.arrival_id = p.arrivalId;
    params.outbound_date = plan.date;
    if (legs[1]) {
      params.return_date = legs[1].date;
      if (filters.outbound_times) params.return_times = filters.outbound_times;
    }
  }
  const selected = [];
  let best;
  for (let i = 0; i < legs.length; i += 1) {
    const data = await search(params);
    const candidates = normalize(data, { ...p, departureId: legs[i].departure_id, arrivalId: legs[i].arrival_id,
      outboundDate: legs[i].date, returnDate: "", travelClass: cabin.code, cabinClass: cabin.key, cabinLabel: cabin.label }, p.currency || "TWD").results;
    best = candidates.find((item) => {
      if (!legs[i].departure_id.split(",").includes(item.departureAirport) || !legs[i].arrival_id.split(",").includes(item.arrivalAirport)) return false;
      if (item.departure.slice(0, 10) !== legs[i].date || !validDate(item.arrival.slice(0, 10))) return false;
      if (i < legs.length - 1 && !item.departureToken) return false;
      if (!selected.length) return true;
      const previous = selected.at(-1);
      const nights = dateDifference(previous.arrival.slice(0, 10), item.departure.slice(0, 10));
      const min = multi ? (i === 1 ? p.stopoverMinNights : p.destinationMinNights) : 0;
      const max = multi ? (i === 1 ? p.stopoverMaxNights : p.destinationMaxNights) : 60;
      return nights >= min && nights <= max && previous.arrival < item.departure;
    });
    if (!best) return null;
    if (multi && !p.lockDates && i < legs.length - 1) {
      const nextDate = addDateDays(best.arrival.slice(0, 10), i === 0 ? plan.nights : plan.destinationNights);
      if (nextDate !== legs[i + 1].date) {
        if (retry >= 2) return null;
        return searchCompleteJourney(p, { ...plan, [i === 0 ? "secondDate" : "thirdDate"]: nextDate }, cabin, search, normalize, lowCostCodes, Number(retry) + 1);
      }
    }
    selected.push(best);
    params.departure_token = best.departureToken;
  }
  const first = selected[0];
  const allSegments = selected.flatMap((item, legIndex) => item.segments.map((segment) => ({ ...segment, legIndex })));
  const requestedCabin = { "1": /^(economy|經濟艙)$/i, "2": /premium economy|豪華經濟|豪經/i, "3": /business|商務|商務艙/i }[cabin.code];
  const mixedCabin = allSegments.some((segment) => segment.travelClass && segment.travelClass !== "未提供" && !requestedCabin.test(segment.travelClass));
  const returnDate = legs.length > 1 && (!multi || p.includeReturn) ? legs.at(-1).date : "";
  const route = multi ? [first.departureAirport, ...selected.map((leg) => leg.arrivalAirport)].join(" → ") : `${first.departureAirport} → ${first.arrivalAirport}`;
  const differentReturnAirport = Boolean(returnDate) && selected.at(-1).arrivalAirport !== first.departureAirport;
  const duration = selected.reduce((total, item) => total + item.duration, 0);
  return { ...first, id: `${first.id}-${cabin.code}-${plan.date}-${plan.nights}-${plan.destinationNights}`,
    title: route, price: best.price, priceText: best.priceText, departureToken: undefined, differentReturnAirport,
    departureDate: plan.date, returnDate, tripDays: returnDate ? dateDifference(plan.date, returnDate) : 0,
    journeyType: multi ? "multicity" : "simple", itineraryComplete: true, legs: selected.map(({ departureToken, ...leg }) => leg),
    segments: allSegments, duration, stops: selected.reduce((total, item) => total + item.stops, 0),
    travelClass: cabin.code, cabinClass: cabin.key, cabinLabel: mixedCabin ? `${cabin.label}（含其他艙等）` : cabin.label, mixedCabin,
    airline: [...new Set(allSegments.map((s) => s.airline))].join(" / "),
    plan, sampled: true, source: "Google Flights 完整行程抽樣",
    stopoverNights: multi ? dateDifference(selected[0].arrival.slice(0, 10), selected[1].departure.slice(0, 10)) : null,
    destinationNights: multi && p.includeReturn ? dateDifference(selected[1].arrival.slice(0, 10), selected[2].departure.slice(0, 10)) : null,
    purchaseLinks: multi
      ? [...new Map(selected.flatMap((leg) => leg.purchaseLinks.filter((link) => link.kind === "official")).map((link) => [link.url, link])).values()]
      : first.purchaseLinks.filter((link) => link.kind === "official"),
    link: `https://www.google.com/travel/flights?q=${encodeURIComponent(selected.map((leg) => `${leg.departureAirport} ${leg.arrivalAirport} ${leg.departureDate}`).join(" "))}`,
    upgradeEligibility: { status: "unknown", label: "里程升等待確認", reason: "未取得訂位艙等、票價規則與各航段升等名額。" },
  };
}
