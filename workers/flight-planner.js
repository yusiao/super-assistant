import { normalizeAirportCodes } from "../output/bazi-ziwei/price-watch/airports.js";

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

export const hasLegDates = (p) => Array.isArray(p.legTimeWindows) && p.legTimeWindows.some((w) => w?.departureDate || w?.arrivalDate);
const legPreferences = (p, index) => ({ ...p, ...Object.fromEntries(Object.entries(p.legTimeWindows?.[index] || {}).filter(([, value]) => value)) });

function normalizedFlightNumber(value) {
  const match = String(value || "").toUpperCase().replace(/[\s-]/g, "").match(/^([A-Z][A-Z0-9]|[0-9][A-Z])(\d{1,4})([A-Z]?)$/);
  return match ? `${match[1]}${Number(match[2])}${match[3]}` : "";
}

function validateLegWindows(p) {
  const count = p.journeyType === "multicity" ? (p.includeReturn ? 3 : 2) : (p.tripDays > 0 ? 2 : 1);
  if (p.legTimeWindows !== undefined && (!Array.isArray(p.legTimeWindows) || p.legTimeWindows.length > count)) invalid("各段日期時段與旅程段數不符。");
  const windows = p.journeyAirline ? Array.from({ length: count }, (_, index) => p.legTimeWindows?.[index] || {}) : (p.legTimeWindows || []);
  p.legTimeWindows = windows.map((window, index) => {
    if (!window || typeof window !== "object" || Array.isArray(window)) invalid("各段日期時段格式錯誤。");
    const result = {};
    if (window.departureDateAlternative) {
      const alternate = String(window.departureDateAlternative);
      if (index !== 0 || !window.departureDate || !validDate(alternate) || alternate < new Date().toISOString().slice(0, 10)) invalid("另一出發日須為首段的有效未來日期，並填入原出發日。");
      if (p.fixedDepartureDate) invalid("比較兩個出發日請將上方日期條件改為彈性日期。");
      if (alternate !== window.departureDate) result.departureDateAlternative = alternate;
    }
    if (window.airline || p.journeyAirline) {
      const raw = String(window.airline || p.journeyAirline).trim();
      const code = /^(?:[A-Z][A-Z0-9]|[0-9][A-Z])$/i.test(raw) ? raw.toUpperCase()
        : Object.keys(airlineNames).find((key) => airlineNames[key].test(raw));
      if (!code) invalid(`第 ${index + 1} 段航空公司無法辨識，請輸入兩碼 IATA 代碼。`);
      if (p.journeyAirline && code !== p.journeyAirline) invalid(`第 ${index + 1} 段與全程指定航空公司不同，請清除全程條件或統一航空公司。`);
      result.airline = code;
    }
    if (window.flightNumbers) {
      const values = Array.isArray(window.flightNumbers) ? window.flightNumbers : String(window.flightNumbers).split(/[,，、;；\n]+/);
      result.flightNumbers = values.map(normalizedFlightNumber);
      if (!result.flightNumbers.length || result.flightNumbers.length > 6 || result.flightNumbers.some((number) => !number)) invalid(`第 ${index + 1} 段航班號碼格式錯誤，最多 6 班並以逗號分隔。`);
      if (result.airline && result.flightNumbers.some((number) => result.airline !== number.slice(0, 2))) invalid(`第 ${index + 1} 段航空公司與航班代碼衝突。`);
    }
    const carriers = [result.airline, ...(result.flightNumbers || []).map((number) => number.slice(0, 2))].filter(Boolean);
    if (carriers.some((carrier) => p.excludedAirlines.includes(carrier))) invalid(`第 ${index + 1} 段指定的航空公司也被勾選為不搭。`);
    for (const event of ["departure", "arrival"]) {
      const date = String(window[`${event}Date`] || "");
      const from = String(window[`${event}TimeFrom`] || "");
      const to = String(window[`${event}TimeTo`] || "");
      if (date && (!validDate(date) || date < new Date().toISOString().slice(0, 10))) invalid(`第 ${index + 1} 段日期無效或已過期。`);
      if ([from, to].some((time) => time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))) invalid(`第 ${index + 1} 段時間格式錯誤。`);
      if (date && from && to && from > to) invalid(`第 ${index + 1} 段已限定同一天，結束時間不可早於開始時間。`);
      for (const [key, value] of [[`${event}Date`, date], [`${event}TimeFrom`, from], [`${event}TimeTo`, to]]) if (value) result[key] = value;
    }
    return result;
  });
  if (!p.legTimeWindows.some((w) => Object.keys(w).length)) p.legTimeWindows = [];
  for (const [index, key] of [[0, "fixedDepartureDate"], ...(count > 1 && (p.journeyType !== "multicity" || p.includeReturn) ? [[count - 1, "fixedReturnDate"]] : [])]) {
    const date = p.legTimeWindows[index]?.departureDate;
    if (date && p[key] && date !== p[key]) invalid("各段出發日期與上方固定日期衝突。");
    if (date && !p.legTimeWindows[index]?.departureDateAlternative) p[key] = date;
  }
  if (p.fixedDepartureDate && p.fixedReturnDate) {
    const days = dateDifference(p.fixedDepartureDate, p.fixedReturnDate);
    if (days < 1 || days > 60) invalid("回程須晚於出發，且行程不超過 60 天。");
    if (p.journeyType !== "multicity") p.tripDays = days;
    p.compareDurations = false;
  }
  if (p.legTimeWindows[0]?.departureDateAlternative && p.fixedReturnDate) {
    if ([p.legTimeWindows[0].departureDate, p.legTimeWindows[0].departureDateAlternative].some((date) => {
      const days = dateDifference(date, p.fixedReturnDate);
      return days < 1 || days > 60;
    })) invalid("兩個出發日皆須早於回程日，且行程不超過 60 天。");
  }
  if (hasLegDates(p)) p.compareDurations = false;
}

export function validateFlightPreferences(input) {
  const payload = { ...input };
  const carrier = String(payload.journeyAirline || "").trim();
  payload.journeyAirline = carrier ? (/^(?:[A-Z][A-Z0-9]|[0-9][A-Z])$/i.test(carrier) ? carrier.toUpperCase()
    : Object.keys(airlineNames).find((key) => airlineNames[key].test(carrier))) : "";
  if (carrier && !payload.journeyAirline) invalid("全程航空公司無法辨識，請輸入兩碼 IATA 代碼。");
  payload.ticketMode = payload.ticketMode === "separate" ? "separate" : "auto";
  for (const key of ["departureId", "arrivalId", ...(payload.journeyType === "multicity" ? ["stopoverId"] : [])]) {
    payload[key] = normalizeAirportCodes(payload[key]);
    if (!payload[key]) invalid("請選擇有效機場或城市機場組合（最多 6 個）。");
  }
  const overlaps = (a, b) => a.split(",").some((code) => b.split(",").includes(code));
  if (overlaps(payload.departureId, payload.arrivalId)) invalid("出發地與目的地不可相同。");
  payload.journeyType = payload.journeyType === "multicity" ? "multicity" : "simple";
  payload.dateConstraint = payload.dateConstraint || "flexible";
  if (!["flexible", "departure", "return", "both"].includes(payload.dateConstraint)) invalid("日期條件不正確。");
  if (payload.dateConstraint === "flexible" && !hasLegDates(payload) && payload.flightMode === "date_window" && !validDate(payload.startDate)) invalid("請選擇有效的最早出發日。");
  payload.lookaheadDays = integer(payload.lookaheadDays, 30, 0, 365, "搜尋範圍");
  payload.tripDays = integer(payload.tripDays, 5, 0, 60, "旅行天數");
  for (const [key, modes] of [["fixedDepartureDate", ["departure", "both"]], ["fixedReturnDate", ["return", "both"]]]) {
    payload[key] = modes.includes(payload.dateConstraint) ? payload[key] : "";
    if (modes.includes(payload.dateConstraint) && !validDate(payload[key])) invalid(key === "fixedDepartureDate" ? "請選擇有效的固定出發日。" : "請選擇有效的固定回程起飛日。");
    if (payload[key] && payload[key] < new Date().toISOString().slice(0, 10)) invalid("固定日期已過期，請更新日期。");
  }
  if (payload.dateConstraint === "both") {
    const days = dateDifference(payload.fixedDepartureDate, payload.fixedReturnDate);
    if (days < 1 || days > 60) invalid("回程起飛日須晚於出發日，且行程不超過 60 天。");
    if (payload.journeyType === "simple") payload.tripDays = days;
    payload.compareDurations = false;
  }
  if (payload.fixedReturnDate && (payload.journeyType === "multicity" ? payload.includeReturn !== true : payload.tripDays === 0)) invalid("固定回程日需要來回行程。");
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
    if (overlaps(payload.departureId, payload.stopoverId) || overlaps(payload.arrivalId, payload.stopoverId)) invalid("停留城市須與出發地、目的地不同。");
    payload.stopoverMinNights = integer(payload.stopoverMinNights, 2, 1, 30, "停留夜數");
    payload.stopoverMaxNights = integer(payload.stopoverMaxNights, 5, payload.stopoverMinNights, 30, "停留夜數上限");
    payload.includeReturn = payload.includeReturn === true;
    payload.destinationMinNights = integer(payload.destinationMinNights, 3, 1, 30, "目的地夜數");
    payload.destinationMaxNights = integer(payload.destinationMaxNights, 7, payload.destinationMinNights, 30, "目的地夜數上限");
  }
  validateLegWindows(payload);
  if (payload.comparisonPlan) {
    const plan = payload.comparisonPlan;
    if (!validDate(plan.date) || plan.date !== payload.startDate || (payload.fixedDepartureDate && plan.date !== payload.fixedDepartureDate)) invalid("艙等比較日期不正確。");
    for (const key of ["secondDate", "thirdDate", "returnDate"]) {
      if (plan[key] && (!validDate(plan[key]) || dateDifference(plan.date, plan[key]) < 1 || dateDifference(plan.date, plan[key]) > 65)) invalid("多城市比較日期不正確。");
    }
    payload.comparisonPlan = { date: plan.date, nights: integer(plan.nights, 0, 0, 30, "停留夜數"),
      destinationNights: integer(plan.destinationNights, 0, 0, 30, "目的地夜數"), secondDate: plan.secondDate, thirdDate: plan.thirdDate, returnDate: plan.returnDate };
    payload.lockDates = true;
  }
  return payload;
}

export function hasFlightPreferences(p) {
  return p.legTimeWindows?.length || p.departureId?.includes(",") || p.arrivalId?.includes(",") || p.dateConstraint !== "flexible" || p.journeyType === "multicity" || p.excludedAirlines?.length || p.excludedAircraft?.length
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
  MU: /china eastern|中國東方航空|中国东方航空|東航|东航/i,
  JL: /japan airlines|日本航空/i, NH: /all nippon|^ana$|全日空/i, KE: /korean air|大韓/i,
  SQ: /singapore airlines|新加坡航空/i, UA: /united airlines|聯合航空/i, BA: /british airways|英國航空/i, LH: /lufthansa|漢莎/i,
};
export function matchesFlightPreferences(item, p) {
  const segments = item.segments || [];
  if (!segments.length) return false;
  if (p.airline && segments.some((segment) => {
    const code = normalizedFlightNumber(segment.flightNumber).slice(0, 2);
    return code ? code !== p.airline : !airlineNames[p.airline]?.test(segment.airline || "");
  })) return false;
  if (p.flightNumbers?.length) {
    let next = 0;
    for (const segment of segments) if (normalizedFlightNumber(segment.flightNumber) === p.flightNumbers[next]) next += 1;
    if (next !== p.flightNumbers.length) return false;
  }
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
  return (!p.departureDate || [p.departureDate, p.departureDateAlternative].filter(Boolean).includes(segments[0].departureTime?.slice(0, 10)))
    && (!p.arrivalDate || segments.at(-1).arrivalTime?.slice(0, 10) === p.arrivalDate)
    && withinTime(segments[0].departureTime, p.departureTimeFrom, p.departureTimeTo)
    && withinTime(segments.at(-1).arrivalTime, p.arrivalTimeFrom, p.arrivalTimeTo);
}

export function flightPreferenceKey(p) {
  return JSON.stringify([p.airlineType, p.routeType, [...(p.excludedAirlines || [])].sort(),
    [...(p.excludedAircraft || [])].sort(), p.allowUnknownAircraft,
    p.departureTimeFrom, p.departureTimeTo, p.arrivalTimeFrom, p.arrivalTimeTo,
    ...(p.legTimeWindows?.length ? [p.legTimeWindows] : [])]);
}

export function makeJourneyPlans(p, startDate, endDate, tracking = false) {
  if (p.comparisonPlan && !tracking) return [p.comparisonPlan];
  const alternate = p.legTimeWindows?.[0]?.departureDateAlternative;
  if (alternate) {
    const dates = [p.legTimeWindows[0].departureDate, alternate].sort();
    const selected = tracking ? [dates[Math.floor(Date.now() / DAY) % dates.length]] : dates;
    const perDate = selected.map((date) => {
      const first = { ...p.legTimeWindows[0], departureDate: date };
      delete first.departureDateAlternative;
      const exact = { ...p, fixedDepartureDate: date, legTimeWindows: [first, ...p.legTimeWindows.slice(1)] };
      return makeJourneyPlans(exact, date, date, tracking);
    });
    // Round-robin keeps both requested departure dates in the bounded candidate set.
    return Array.from({ length: Math.max(...perDate.map((plans) => plans.length)) }, (_, i) => perDate.map((plans) => plans[i]).filter(Boolean)).flat().slice(0, 4);
  }
  const multi = p.journeyType === "multicity";
  const anchor = (plan) => {
    if (p.fixedReturnDate && multi) plan = { ...plan, date: p.fixedDepartureDate || addDateDays(p.fixedReturnDate, -plan.nights - plan.destinationNights), thirdDate: p.fixedReturnDate };
    if (hasLegDates(p)) {
      const windows = p.legTimeWindows;
      const pivot = windows.findIndex((w) => w.departureDate || w.arrivalDate);
      const offset = pivot === 0 ? 0 : multi ? plan.nights + (pivot === 2 ? plan.destinationNights : 0) : p.tripDays;
      plan.date = p.fixedDepartureDate || addDateDays(windows[pivot].departureDate || windows[pivot].arrivalDate, -offset);
      if (multi) {
        plan.secondDate = windows[1]?.departureDate || windows[1]?.arrivalDate || addDateDays(plan.date, plan.nights);
        if (p.includeReturn) plan.thirdDate = p.fixedReturnDate || windows[2]?.arrivalDate || addDateDays(plan.secondDate, plan.destinationNights);
      } else if (p.tripDays > 0) plan.returnDate = p.fixedReturnDate || windows[1]?.arrivalDate || addDateDays(plan.date, p.tripDays);
    }
    return plan;
  };
  const dates = (hasLegDates(p) ? [startDate] : [startDate, endDate]).filter((date, index, all) => all.indexOf(date) === index);
  const stays = multi ? [...new Set([p.stopoverMinNights, p.stopoverMaxNights])] : [0];
  const plans = [];
  for (const date of dates) {
    for (const nights of stays) {
      const destinations = multi && p.includeReturn ? [...new Set([p.destinationMinNights, p.destinationMaxNights])] : [0];
      for (const destinationNights of destinations) plans.push(anchor({ date, nights, destinationNights }));
    }
  }
  if (tracking) {
    const day = Math.floor(Date.now() / DAY);
    const offset = day % (dateDifference(startDate, endDate) + 1);
    return [anchor({ date: addDateDays(startDate, offset), nights: multi ? p.stopoverMinNights + day % (p.stopoverMaxNights - p.stopoverMinNights + 1) : 0,
      destinationNights: multi && p.includeReturn ? p.destinationMinNights + Math.floor(day / (p.stopoverMaxNights - p.stopoverMinNights + 1)) % (p.destinationMaxNights - p.destinationMinNights + 1) : 0 })];
  }
  const unique = [...new Map(plans.map((plan) => [JSON.stringify([plan.date, plan.secondDate || plan.nights, plan.thirdDate || plan.destinationNights, plan.returnDate]), plan])).values()];
  if (unique.length <= 4) return unique;
  return [0, Math.round((unique.length - 1) / 3), Math.round((unique.length - 1) * 2 / 3), unique.length - 1].map((index) => unique[index]);
}

export function flightDateRange(p, today) {
  if (p.legTimeWindows?.[0]?.departureDateAlternative) {
    const dates = [p.legTimeWindows[0].departureDate, p.legTimeWindows[0].departureDateAlternative].sort();
    return { startDate: dates[0], endDate: dates[1] };
  }
  if (p.fixedDepartureDate) return { startDate: p.fixedDepartureDate, endDate: p.fixedDepartureDate };
  if (p.fixedReturnDate) {
    const days = p.journeyType === "multicity" ? p.stopoverMinNights + p.destinationMinNights : p.tripDays;
    const date = addDateDays(p.fixedReturnDate, -days);
    if (date < today) invalid("固定回程日與旅行天數會使出發日落在過去，請縮短天數。");
    return { startDate: date, endDate: date };
  }
  if (hasLegDates(p)) {
    const date = p.legTimeWindows.find((w) => w.departureDate || w.arrivalDate);
    return { startDate: date.departureDate || date.arrivalDate, endDate: date.departureDate || date.arrivalDate };
  }
  const annual = p.flightMode !== "date_window";
  const requestedStart = annual ? addDateDays(today, 14) : p.startDate;
  const allowance = p.journeyType === "multicity" ? p.stopoverMaxNights + (p.includeReturn ? p.destinationMaxNights : 0) + 2 : p.tripDays;
  const endDate = annual ? addDateDays(today, 330 - allowance) : addDateDays(requestedStart, p.lookaheadDays);
  if (endDate < today) invalid("搜尋日期區間已過期，請更新日期。");
  return { startDate: requestedStart < today ? today : requestedStart, endDate };
}

// Selection-token quotes use the final whole-trip price; independent tickets explicitly sum leg quotes.
export async function searchCompleteJourney(p, plan, cabin, search, normalize, lowCostCodes, retry = false) {
  const multi = p.journeyType === "multicity";
  const separate = multi && p.ticketMode === "separate";
  if (plan.date < new Date().toISOString().slice(0, 10) || (p.fixedDepartureDate && plan.date !== p.fixedDepartureDate)) return null;
  const legs = multi
    ? [{ departure_id: p.departureId, arrival_id: p.stopoverId, date: plan.date },
      { departure_id: p.stopoverId, arrival_id: p.arrivalId, date: plan.secondDate || addDateDays(plan.date, plan.nights) }]
    : [{ departure_id: p.departureId, arrival_id: p.arrivalId, date: plan.date }];
  if (multi && p.includeReturn) legs.push({ departure_id: p.arrivalId, arrival_id: p.departureId, date: p.fixedReturnDate || plan.thirdDate || addDateDays(legs[1].date, plan.destinationNights) });
  if (!multi && p.tripDays > 0) legs.push({ departure_id: p.arrivalId, arrival_id: p.departureId, date: p.fixedReturnDate || plan.returnDate || addDateDays(plan.date, p.tripDays) });
  if (legs.some((leg, i) => i > 0 && leg.date <= legs[i - 1].date)) return null;
  const legFilters = legs.map((_, index) => providerFlightFilters(legPreferences(p, index), lowCostCodes));
  const filters = { ...legFilters[0] };
  const carriers = legs.map((_, index) => {
    const window = p.legTimeWindows?.[index];
    return window?.airline;
  });
  const requiredCarriers = [...carriers, ...(p.legTimeWindows || []).flatMap((window) => (window.flightNumbers || []).map((number) => number.slice(0, 2)))];
  for (const carrier of requiredCarriers.filter(Boolean)) {
    if ((p.airlineType === "low_cost" && !lowCostCodes.has(carrier)) || (p.airlineType === "full_service" && lowCostCodes.has(carrier))) invalid("指定航空公司與航空類型條件衝突，請改選全部或調整指定航空公司。");
  }
  // The provider's carrier filter is journey-wide. A union is safe only when every leg is constrained.
  if (carriers.every(Boolean)) {
    delete filters.exclude_airlines;
    filters.include_airlines = [...new Set(carriers)].join(",");
  }
  const params = { engine: "google_flights", currency: p.currency || "TWD", hl: (p.locale || "zh-TW").toLowerCase(),
    gl: (p.market || "TW").toLowerCase(), travel_class: cabin.code, sort_by: "2", ...filters,
    type: multi ? "3" : legs.length === 2 ? "1" : "2" };
  if (multi) {
    params.multi_city_json = JSON.stringify(legs.map((leg, index) => ({ ...leg, ...(legFilters[index].outbound_times ? { times: legFilters[index].outbound_times } : {}) })));
    delete params.outbound_times;
  } else {
    params.departure_id = p.departureId;
    params.arrival_id = p.arrivalId;
    params.outbound_date = plan.date;
    if (legs[1]) {
      params.return_date = legs[1].date;
      if (legFilters[1].outbound_times) params.return_times = legFilters[1].outbound_times;
    }
  }
  const selected = [];
  const retryLimit = hasLegDates(p) ? 3 : 2;
  const pinnedDeparture = (index) => p.legTimeWindows?.[index]?.departureDate || (index === 0 && p.fixedDepartureDate)
    || (index === legs.length - 1 && legs.length > 1 && (!multi || p.includeReturn) && p.fixedReturnDate);
  const shiftDeparture = (index, offset) => {
    if (p.lockDates || pinnedDeparture(index) || retry >= retryLimit) return null;
    const dates = legs.map((leg) => leg.date);
    for (let j = index; j >= 0; j -= 1) {
      if (pinnedDeparture(j) || (j < index && p.legTimeWindows?.[j]?.arrivalDate)) break;
      dates[j] = addDateDays(dates[j], offset);
    }
    return searchCompleteJourney(p, { ...plan, date: dates[0], ...(multi ? { secondDate: dates[1], thirdDate: dates[2] } : { returnDate: dates[1] }) }, cabin, search, normalize, lowCostCodes, Number(retry) + 1);
  };
  let best;
  for (let i = 0; i < legs.length; i += 1) {
    let query = params;
    if (separate) {
      const singleFilters = { ...legFilters[i] };
      if (carriers[i]) { delete singleFilters.exclude_airlines; singleFilters.include_airlines = carriers[i]; }
      query = { engine: params.engine, currency: params.currency, hl: params.hl, gl: params.gl,
        travel_class: cabin.code, sort_by: "2", ...singleFilters, type: "2",
        departure_id: legs[i].departure_id, arrival_id: legs[i].arrival_id, outbound_date: legs[i].date };
    }
    const data = await search(query);
    const preferences = legPreferences(p, i);
    const candidates = normalize(data, { ...preferences, arrivalDate: "", departureId: legs[i].departure_id, arrivalId: legs[i].arrival_id,
      outboundDate: legs[i].date, returnDate: "", travelClass: cabin.code, cabinClass: cabin.key, cabinLabel: cabin.label }, p.currency || "TWD").results;
    const airportCandidates = candidates.filter((item) => {
      if (!legs[i].departure_id.split(",").includes(item.departureAirport) || !legs[i].arrival_id.split(",").includes(item.arrivalAirport)) return false;
      if (item.departure.slice(0, 10) !== legs[i].date || !validDate(item.arrival.slice(0, 10))) return false;
      if (!separate && i < legs.length - 1 && !item.departureToken) return false;
      return true;
    });
    const datedCandidates = airportCandidates.filter((item) => !preferences.arrivalDate || item.arrival.slice(0, 10) === preferences.arrivalDate);
    if (!datedCandidates.length && airportCandidates.length && preferences.arrivalDate) {
      return shiftDeparture(i, dateDifference(airportCandidates[0].arrival.slice(0, 10), preferences.arrivalDate));
    }
    // Prefer candidates compatible with the next pinned day before selecting a cheap overnight flight.
    const nextPinned = multi && i < legs.length - 1 && (p.lockDates || pinnedDeparture(i + 1));
    const forwardCandidates = nextPinned ? datedCandidates.filter((item) => {
      const nights = dateDifference(item.arrival.slice(0, 10), legs[i + 1].date);
      return nights >= (i === 0 ? p.stopoverMinNights : p.destinationMinNights)
        && nights <= (i === 0 ? p.stopoverMaxNights : p.destinationMaxNights);
    }) : datedCandidates;
    best = (forwardCandidates.length ? forwardCandidates : datedCandidates).find((item) => {
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
      const nextWindow = p.legTimeWindows?.[i + 1];
      if (nextWindow?.departureDate || nextWindow?.arrivalDate) {
        const nights = dateDifference(best.arrival.slice(0, 10), legs[i + 1].date);
        const min = i === 0 ? p.stopoverMinNights : p.destinationMinNights;
        const max = i === 0 ? p.stopoverMaxNights : p.destinationMaxNights;
        if ((nights < min || nights > max) && !preferences.arrivalDate) return shiftDeparture(i, dateDifference(nextDate, legs[i + 1].date));
      } else if (nextDate !== legs[i + 1].date && !(i === 1 && (p.fixedDepartureDate || p.legTimeWindows?.[0]?.arrivalDate) && p.fixedReturnDate)) {
        if (retry >= retryLimit) return null;
        if (i === 1 && p.fixedReturnDate) {
          const offset = dateDifference(nextDate, p.fixedReturnDate);
          const date = addDateDays(plan.date, offset);
          return searchCompleteJourney(p, { ...plan, date, secondDate: addDateDays(legs[1].date, offset), thirdDate: p.fixedReturnDate }, cabin, search, normalize, lowCostCodes, Number(retry) + 1);
        }
        return searchCompleteJourney(p, { ...plan, [i === 0 ? "secondDate" : "thirdDate"]: nextDate }, cabin, search, normalize, lowCostCodes, Number(retry) + 1);
      }
    }
    selected.push(best);
    if (!separate) params.departure_token = best.departureToken;
  }
  const first = selected[0];
  const allSegments = selected.flatMap((item, legIndex) => item.segments.map((segment) => ({ ...segment, legIndex })));
  const requestedCabin = { "1": /^(economy|經濟艙)$/i, "2": /premium economy|豪華經濟|豪經/i, "3": /business|商務|商務艙/i }[cabin.code];
  const mixedCabin = allSegments.some((segment) => segment.travelClass && segment.travelClass !== "未提供" && !requestedCabin.test(segment.travelClass));
  const returnDate = legs.length > 1 && (!multi || p.includeReturn) ? legs.at(-1).date : "";
  const route = multi ? [first.departureAirport, ...selected.map((leg) => leg.arrivalAirport)].join(" → ") : `${first.departureAirport} → ${first.arrivalAirport}`;
  const differentReturnAirport = Boolean(returnDate) && selected.at(-1).arrivalAirport !== first.departureAirport;
  const airportChanges = selected.slice(1).flatMap((leg, index) => selected[index].arrivalAirport === leg.departureAirport ? []
    : [{ arrivalAirport: selected[index].arrivalAirport, departureAirport: leg.departureAirport }]);
  const duration = selected.reduce((total, item) => total + item.duration, 0);
  const price = separate ? selected.reduce((total, item) => total + item.price, 0) : best.price;
  const priceText = separate ? `${(p.currency || "TWD") === "TWD" ? "NT$" : `${p.currency} `}${Math.round(price).toLocaleString("zh-TW")}` : best.priceText;
  return { ...first, id: `${first.id}-${cabin.code}-${plan.date}-${plan.nights}-${plan.destinationNights}`,
    title: route, price, priceText, departureToken: undefined, differentReturnAirport, airportChanges,
    separateTickets: separate, priceBasis: separate ? "separate_ticket_sum" : "whole_itinerary_quote",
    departureDate: plan.date, returnDate, tripDays: returnDate ? dateDifference(plan.date, returnDate) : 0,
    journeyType: multi ? "multicity" : "simple", itineraryComplete: true, legs: selected.map(({ departureToken, ...leg }) => leg),
    segments: allSegments, duration, stops: selected.reduce((total, item) => total + item.stops, 0),
    travelClass: cabin.code, cabinClass: cabin.key, cabinLabel: mixedCabin ? `${cabin.label}（含其他艙等）` : cabin.label, mixedCabin,
    airline: [...new Set(allSegments.map((s) => s.airline))].join(" / "),
    plan, sampled: true, source: separate ? "Google Flights 分開購票組合" : "Google Flights 完整行程抽樣",
    stopoverNights: multi ? dateDifference(selected[0].arrival.slice(0, 10), selected[1].departure.slice(0, 10)) : null,
    destinationNights: multi && p.includeReturn ? dateDifference(selected[1].arrival.slice(0, 10), selected[2].departure.slice(0, 10)) : null,
    purchaseLinks: multi
      ? [...new Map(selected.flatMap((leg) => leg.purchaseLinks.filter((link) => link.kind === "official")).map((link) => [link.url, link])).values()]
      : first.purchaseLinks.filter((link) => link.kind === "official"),
    link: `https://www.google.com/travel/flights?q=${encodeURIComponent(selected.map((leg) => `${leg.departureAirport} ${leg.arrivalAirport} ${leg.departureDate}`).join(" "))}`,
    upgradeEligibility: { status: "unknown", label: "里程升等待確認", reason: "未取得訂位艙等、票價規則與各航段升等名額。" },
  };
}
