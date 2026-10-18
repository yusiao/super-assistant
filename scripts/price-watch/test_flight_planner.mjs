import assert from "node:assert/strict";
import test from "node:test";
import { timingSafeEqual } from "node:crypto";
import worker from "../../workers/bazi-ziwei.js";
import { addDateDays, validateFlightPreferences, providerFlightFilters, matchesFlightPreferences, makeJourneyPlans } from "../../workers/flight-planner.js";
import airportData from "../../output/bazi-ziwei/price-watch/airports-data.json" with { type: "json" };
import { buildAirportDirectory, searchAirports, normalizeAirportCodes } from "../../output/bazi-ziwei/price-watch/airports.js";

crypto.subtle.timingSafeEqual = timingSafeEqual;
const date = addDateDays(new Date().toISOString().slice(0, 10), 20);
const base = { type: "flight", flightMode: "date_window", startDate: date, lookaheadDays: 0, departureId: "TPE", arrivalId: "NRT", tripDays: 0, compareDurations: false };
const multi = { ...base, arrivalId: "LAX", journeyType: "multicity", stopoverId: "NRT", stopoverMinNights: 2, stopoverMaxNights: 2 };

function harness(change = (data) => data, changeBooking = (data) => data) {
  const calls = [];
  const bookings = new Map();
  const records = new Map();
  const env = { PRICE_WATCH_PUBLIC_SEARCH: "true", PRICE_WATCH_ACCESS_TOKEN: "test", SERPAPI_API_KEY: "test",
    PRICE_WATCH_KV: { async get(key) { return records.get(key) || null; }, async put(key, value) { records.set(key, JSON.parse(value)); } } };
  const previous = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const params = Object.fromEntries(new URL(url).searchParams);
    calls.push(params);
    if (params.booking_token) return Response.json(changeBooking(bookings.get(params.booking_token) || {}, params));
    const legs = params.multi_city_json ? JSON.parse(params.multi_city_json) : [
      { departure_id: params.departure_id, arrival_id: params.arrival_id, date: params.outbound_date },
      ...(params.return_date ? [{ departure_id: params.arrival_id, arrival_id: params.departure_id, date: params.return_date }] : []),
    ];
    const index = Number((params.departure_token || "leg-0").split("-")[1]);
    const leg = legs[index];
    assert.ok(leg, "valid token traversal");
    const data = { best_flights: [{ price: Number(params.travel_class) * 9000 + index * 1000, total_duration: 180,
      departure_token: index < legs.length - 1 ? `leg-${index + 1}` : undefined,
      booking_token: index === legs.length - 1 ? "final-booking-token" : undefined,
      flights: [{ airline: "EVA Air", flight_number: "BR 100", airplane: "Boeing 787-9", travel_class: params.travel_class === "1" ? "Economy" : "Business",
        departure_airport: { id: leg.departure_id.split(",")[0], time: `${leg.date} 09:00` }, arrival_airport: { id: leg.arrival_id.split(",")[0], time: `${leg.date} 13:00` }, duration: 180 }],
    }] };
    const changed = change(data, params, index);
    for (const [i, item] of (changed.best_flights || []).entries()) if (item.booking_token) {
      item.booking_token = `booking-${calls.length}-${i}`;
      bookings.set(item.booking_token, { booking_options: [{ together: { price: item.price, book_with: "Fixture Airline" } }] });
    }
    return Response.json(changed);
  };
  return { calls, env, restore() { globalThis.fetch = previous; }, async request(payload, path = "search", authenticated = true) {
    const response = await worker.fetch(new Request(`https://test.example/api/price-watch/${path}`, { method: "POST", headers: {
      "Content-Type": "application/json", ...(authenticated ? { "X-Price-Watch-Token": "test" } : {}),
    }, body: JSON.stringify(payload) }), env);
    return { status: response.status, data: await response.json() };
  } };
}

test("validates dates, airports, ranges and exclusion codes before paid calls", async () => {
  const h = harness();
  try {
    for (const payload of [{ ...base, startDate: "2026-02-30" }, { ...base, departureId: "bad-id" },
      { ...multi, stopoverMaxNights: 1 }, { ...base, excludedAirlines: ["***"] }, { ...base, departureTimeFrom: "25:00" }]) {
      assert.equal((await h.request(payload)).status, 400);
    }
    assert.equal(h.calls.length, 0);
  } finally { h.restore(); }
});

test("airline include/exclude parameters never conflict", () => {
  const p = validateFlightPreferences({ ...base, airlineType: "low_cost", excludedAirlines: ["IT"] });
  assert.deepEqual(providerFlightFilters(p, new Set(["IT", "TR"])), { stops: "0", show_hidden: "true", include_airlines: "TR" });
});

test("Taipei group sends one combined query and accepts the cheaper Songshan result", async () => {
  const h = harness((data, params, index) => {
    if (index === 0) {
      const cheaper = structuredClone(data.best_flights[0]);
      cheaper.price -= 1000;
      cheaper.flights[0].departure_airport.id = "TSA";
      data.best_flights.push(cheaper);
    }
    return data;
  });
  try {
    const { status, data } = await h.request({ ...base, departureId: "TSA,TPE" });
    assert.equal(status, 200);
    assert.equal(data.results[0].departureAirport, "TSA");
    assert.equal(data.results[0].price, 8000);
    assert.match(data.results[0].title, /^TSA/);
    assert.equal(h.calls.length, 3);
    assert.ok(h.calls.every((p) => p.departure_id === "TPE,TSA"));
    const link = data.results[0].purchaseLinks.find((link) => link.kind === "skyscanner");
    assert.match(link.url, /\/tsa\/nrt\//);
    const saved = await h.request({ ...base, departureId: "TPE,TSA" }, "watches");
    assert.equal(saved.data.watch.sources[0].planner.departureId, "TPE,TSA");
  } finally { h.restore(); }
});

test("Taipei group supports different return airports without misleading purchase links", async () => {
  const h = harness((data, params, index) => {
    if (index === 0) data.best_flights[0].flights[0].departure_airport.id = "TSA";
    return data;
  });
  try {
    const { data } = await h.request({ ...base, departureId: "TPE,TSA", tripDays: 5 });
    assert.equal(data.results[0].differentReturnAirport, true);
    assert.equal(data.results[0].legs[1].arrivalAirport, "TPE");
    assert.ok(data.results[0].purchaseLinks.every((link) => !link.url.includes("/tsa/nrt/")));
    assert.ok(data.results[0].purchaseLinks.some((link) => link.kind === "google"));
    const multiResult = await h.request({ ...multi, departureId: "TPE,TSA", includeReturn: true, destinationMinNights: 3, destinationMaxNights: 3 });
    assert.equal(multiResult.data.results[0].legs[2].arrivalAirport, "TPE");
    assert.match(multiResult.data.results[0].title, /^TSA → NRT → LAX → TPE$/);
    assert.equal(JSON.parse(h.calls.find((p) => p.type === "3").multi_city_json)[0].departure_id, "TPE,TSA");
  } finally { h.restore(); }
});

test("airport groups reject overlap, malformed codes and wrong-airport results", async () => {
  const h = harness((data) => { data.best_flights[0].flights[0].departure_airport.id = "KHH"; return data; });
  try {
    for (const payload of [{ ...base, departureId: "TPE,TSA", arrivalId: "TSA" },
      { ...multi, departureId: "TPE,TSA", stopoverId: "TPE" }, { ...base, departureId: "TPE,not-an-airport" },
      { ...base, departureId: "JFK,LGA,EWR", arrivalId: "LAX,JFK" }, { ...multi, stopoverId: "NRT,LAX" },
      { ...base, arrivalId: "LHR,LGW,LTN,LCY,STN,SEN,CDG" }]) {
      assert.equal((await h.request(payload)).status, 400);
    }
    assert.equal(h.calls.length, 0);
    assert.equal((await h.request({ ...base, departureId: "TPE,TSA" })).data.results.length, 0);
  } finally { h.restore(); }
});

test("global airport directory supports case, countries, city groups and accents without paid calls", async () => {
  const directory = buildAirportDirectory(airportData.airports);
  assert.ok(airportData.airports.length > 8000);
  for (const code of ["lHr", "cDg", "Nrt", "cPt", "SYD", "sCl", "jFk"]) {
    assert.equal(searchAirports(directory, code)[0].iataCode, code.toUpperCase());
  }
  assert.deepEqual(searchAirports(directory, "t").map((a) => a.iataCode), searchAirports(directory, "T").map((a) => a.iataCode));
  for (const [query, codes] of [["東京", "HND,NRT"], ["LoNDoN", "LCY,LGW,LHR,LTN,SEN,STN"], ["巴黎", "CDG,ORY"], ["New York", "EWR,JFK,LGA"]]) {
    assert.ok(searchAirports(directory, query).some((a) => a.group && a.iataCode === codes), query);
  }
  assert.ok(searchAirports(directory, "巴西").some((a) => a.iataCode === "GRU"));
  assert.ok(searchAirports(directory, "zürich").some((a) => a.iataCode === "ZRH"));
  assert.equal(normalizeAirportCodes(" tsA, tpe,TSA "), "TPE,TSA");
  assert.equal(normalizeAirportCodes("TPE,foo!"), "");
  const h = harness();
  try {
    const result = await h.request({ query: "Paris" }, "places");
    assert.equal(result.status, 200);
    assert.ok(result.data.places.some((a) => a.iataCode === "CDG,ORY"));
    assert.equal(h.calls.length, 0);
  } finally { h.restore(); }
});

test("global catalog preserves Traditional Chinese primary names and English search aliases", async () => {
  const directory = buildAirportDirectory(airportData.airports);
  assert.ok(directory.filter((a) => !a.group && /\p{Script=Han}/u.test(a.name)).length > 4600);
  for (const [code, name] of [["LAX", "洛杉磯國際機場"], ["KHH", "高雄國際機場"], ["SYD", "雪梨金斯福德·史密斯機場"], ["TLL", "塔林機場"]]) {
    const place = searchAirports(directory, code.toLowerCase())[0];
    assert.equal(place.name, name);
    assert.notEqual(place.englishName, place.name);
    assert.ok(place.subtitle.includes(place.englishName));
    assert.ok(searchAirports(directory, place.englishName.toLowerCase()).some((a) => a.iataCode === code));
    assert.ok(searchAirports(directory, name).some((a) => a.iataCode === code));
  }
  assert.equal(buildAirportDirectory([["ZZZ", "Untranslated Airport", "Example City", "US", "US-CA", 0]])[0].name, "Untranslated Airport");
  const h = harness();
  try {
    const { data } = await h.request({ query: "lax" }, "places");
    assert.equal(data.places[0].name, "洛杉磯國際機場");
    assert.equal(h.calls.length, 0);
  } finally { h.restore(); }
});

test("international airport groups work in all three roles and persist without truncation", async () => {
  const h = harness();
  try {
    const payload = { ...multi, departureId: "stn, lhr, LGW,lcY,ltn,sen", stopoverId: "hNd,nRt", arrivalId: "jfk,ewr,lga" };
    const { status, data } = await h.request(payload);
    assert.equal(status, 200);
    assert.ok(data.results.length);
    const legs = JSON.parse(h.calls[0].multi_city_json);
    assert.equal(legs[0].departure_id, "LCY,LGW,LHR,LTN,SEN,STN");
    assert.equal(legs[0].arrival_id, "HND,NRT");
    assert.equal(legs[1].arrival_id, "EWR,JFK,LGA");
    const saved = await h.request(payload, "watches");
    assert.equal(saved.data.watch.sources[0].departure_id, "LCY,LGW,LHR,LTN,SEN,STN");
    assert.equal(saved.data.watch.sources[0].planner.stopoverId, "HND,NRT");
  } finally { h.restore(); }
});

test("fixed departure preserves departure across cabins, duration alternatives and tracking", async () => {
  const h = harness();
  try {
    const payload = { ...base, startDate: "", dateConstraint: "departure", fixedDepartureDate: date, tripDays: 5, compareDurations: true };
    const { status, data } = await h.request(payload);
    assert.equal(status, 200);
    assert.ok(data.results.length);
    assert.equal(data.insights.durationAlternatives.length, 4);
    assert.ok(h.calls.every((p) => p.outbound_date === date));
    assert.ok(new Set(h.calls.map((p) => p.return_date)).size > 1);
    const saved = await h.request(payload, "watches");
    assert.equal(saved.data.watch.sources[0].planner.fixedDepartureDate, date);
    const tracked = await h.request({ ...saved.data.watch.sources[0].planner, trackingSample: true });
    assert.ok(tracked.data.results.every((r) => r.departureDate === date));
  } finally { h.restore(); }
});

test("fixed return varies outbound only and both dates disable duration changes", async () => {
  const h = harness();
  try {
    const returnDate = addDateDays(date, 5);
    const { status, data } = await h.request({ ...base, dateConstraint: "return", fixedReturnDate: returnDate, tripDays: 5, compareDurations: true });
    assert.equal(status, 200);
    assert.equal(data.results[0].departureDate, date);
    assert.equal(data.insights.durationAlternatives.length, 4);
    assert.ok(h.calls.every((p) => p.return_date === returnDate));
    assert.ok(new Set(h.calls.map((p) => p.outbound_date)).size > 1);
    const both = await h.request({ ...base, dateConstraint: "both", fixedDepartureDate: date, fixedReturnDate: returnDate, tripDays: 0, compareDurations: true });
    assert.equal(both.data.tripDays, 5);
    assert.equal(both.data.results[0].returnDate, returnDate);
    assert.deepEqual(both.data.insights.durationAlternatives, []);
  } finally { h.restore(); }
});

test("invalid, expired or one-way return constraints never spend provider quota", async () => {
  const h = harness();
  try {
    for (const payload of [
      { ...base, dateConstraint: "departure", fixedDepartureDate: "2026-02-30" },
      { ...base, dateConstraint: "departure", fixedDepartureDate: "2020-01-01" },
      { ...base, dateConstraint: "both", fixedDepartureDate: date, fixedReturnDate: date },
      { ...base, dateConstraint: "return", fixedReturnDate: date },
      { ...multi, dateConstraint: "return", fixedReturnDate: date },
      { ...base, dateConstraint: "return", fixedReturnDate: addDateDays(new Date().toISOString().slice(0, 10), 1), tripDays: 5 },
    ]) assert.equal((await h.request(payload)).status, 400);
    assert.equal(h.calls.length, 0);
  } finally { h.restore(); }
});

test("multi-city fixed return preserves last takeoff date and moves departure for overnight arrivals", async () => {
  const h = harness((data, params, index) => {
    if (index < 2) {
      const leg = JSON.parse(params.multi_city_json)[index];
      data.best_flights[0].flights[0].arrival_airport.time = `${addDateDays(leg.date, 1)} 06:00`;
    }
    return data;
  });
  try {
    const returnDate = addDateDays(date, 7);
    const payload = { ...multi, dateConstraint: "return", fixedReturnDate: returnDate, includeReturn: true, destinationMinNights: 3, destinationMaxNights: 3 };
    const { status, data } = await h.request(payload);
    assert.equal(status, 200);
    assert.ok(data.results.length);
    assert.equal(data.results[0].returnDate, returnDate);
    assert.equal(data.results[0].departureDate, date);
    assert.equal(data.results[0].stopoverNights, 2);
    assert.equal(data.results[0].destinationNights, 3);
    assert.ok(h.calls.every((p) => JSON.parse(p.multi_city_json).at(-1).date === returnDate));
    const both = await h.request({ ...payload, dateConstraint: "both", fixedDepartureDate: date });
    assert.equal(both.data.results[0].departureDate, date);
    assert.equal(both.data.results[0].returnDate, returnDate);
  } finally { h.restore(); }
});

test("filters every connection's aircraft and carrier; unknown aircraft are opt-in", () => {
  const p = validateFlightPreferences({ ...base, excludedAircraft: ["737 MAX"], excludedAirlines: ["CI"] });
  const segment = { flightNumber: "BR 123", airplane: "Boeing 787-9" };
  assert.equal(matchesFlightPreferences({ segments: [segment, { ...segment, airplane: "Boeing 737 MAX 8" }] }, p), false);
  assert.equal(matchesFlightPreferences({ segments: [segment, { ...segment, flightNumber: "CI 123" }] }, p), false);
  assert.equal(matchesFlightPreferences({ segments: [{ ...segment, airplane: "" }] }, p), false);
  assert.equal(matchesFlightPreferences({ segments: [{ ...segment, airplane: "" }] }, { ...p, allowUnknownAircraft: true }), true);
});

test("China Eastern is searchable by default and excluded by code or localized operating name", async () => {
  const h = harness((data) => {
    data.best_flights[0].flights[0].airline = "China Eastern";
    data.best_flights[0].flights[0].flight_number = "MU 5008";
    return data;
  });
  try {
    for (const airlineType of ["all", "full_service"]) {
      const { data } = await h.request({ ...base, airlineType });
      assert.ok(data.results.length);
      assert.equal(data.results[0].segments[0].flightNumber, "MU 5008");
    }
    const { data } = await h.request({ ...base, excludedAirlines: ["MU"] });
    assert.equal(data.results.length, 0);
    assert.ok(h.calls.some((params) => params.exclude_airlines?.split(",").includes("MU")));
    const preferences = validateFlightPreferences({ ...base, excludedAirlines: ["MU"] });
    for (const name of ["China Eastern Airlines", "中國東方航空", "中国东方航空", "東航", "东航"]) {
      assert.equal(matchesFlightPreferences({ segments: [{ airline: name }] }, preferences), false);
      assert.equal(matchesFlightPreferences({ segments: [{ flightNumber: "BR 123", operatingAirline: name }] }, preferences), false);
    }
    assert.equal(matchesFlightPreferences({ segments: [{ airline: "China Airlines", flightNumber: "CI 123" }] }, preferences), true);
  } finally { h.restore(); }
});

test("per-leg required airlines and ordered flight numbers are validated and applied without guessing codeshares", async () => {
  const p = validateFlightPreferences({ ...base, legTimeWindows: [{ airline: "中國東方航空", flightNumbers: "mu 5616, MU-5005" }] });
  assert.equal(p.legTimeWindows[0].airline, "MU");
  assert.deepEqual(p.legTimeWindows[0].flightNumbers, ["MU5616", "MU5005"]);
  const preferences = { ...p, ...p.legTimeWindows[0] };
  const segments = [{ flightNumber: "MU 5616" }, { flightNumber: "MU 5005" }];
  assert.equal(matchesFlightPreferences({ segments }, preferences), true);
  assert.equal(matchesFlightPreferences({ segments: [...segments].reverse() }, preferences), false);
  assert.equal(matchesFlightPreferences({ segments: [segments[0]] }, preferences), false);
  assert.equal(matchesFlightPreferences({ segments: [{ flightNumber: "CI 5005", operatingAirlineCode: "MU" }] }, preferences), false);
  const h = harness();
  try {
    for (const window of [{ flightNumbers: "BAD" }, { airline: "MU", flightNumbers: "BR123" }, { airline: "unknown carrier" }, { flightNumbers: ["MU5616", ""] }]) {
      assert.equal((await h.request({ ...base, legTimeWindows: [window] })).status, 400);
    }
    assert.equal((await h.request({ ...base, excludedAirlines: ["MU"], legTimeWindows: [{ flightNumbers: "MU5616" }] })).status, 400);
    assert.equal((await h.request({ ...base, airlineType: "low_cost", legTimeWindows: [{ airline: "MU" }] })).status, 400);
    assert.equal(h.calls.length, 0);
  } finally { h.restore(); }
});

test("two departure days preserve Shanghai deadline and ordered Harbin return flights across cabins and tracking", async () => {
  const payload = { ...multi, departureId: "TPE,TSA", stopoverId: "PVG,SHA", arrivalId: "HRB", flightMode: "date_window", startDate: "",
    stopoverMinNights: 3, stopoverMaxNights: 4, includeReturn: true, destinationMinNights: 7, destinationMaxNights: 7,
    legTimeWindows: [
      { departureDate: "2027-01-05", departureDateAlternative: "2027-01-06" },
      { departureDate: "2027-01-09", arrivalDate: "2027-01-09", arrivalTimeTo: "19:30" },
      { departureDate: "2027-01-16", flightNumbers: "MU5616, MU5005" },
    ] };
  const h = harness((data, params, index) => {
    const legs = JSON.parse(params.multi_city_json);
    const flight = data.best_flights[0].flights[0];
    data.best_flights[0].price += legs[0].date === "2027-01-05" ? 1500 : 0;
    if (index === 1) {
      flight.arrival_airport.time = `${legs[index].date} 19:30`;
      const late = structuredClone(data.best_flights[0]);
      late.flights[0].arrival_airport.time = `${legs[index].date} 19:31`;
      late.price = 1;
      data.best_flights.unshift(late);
    }
    if (index === 2) {
      const onward = structuredClone(flight);
      flight.flight_number = "MU 5616";
      flight.airline = "China Eastern";
      flight.arrival_airport = { id: "PVG", time: "2027-01-16 12:00" };
      onward.flight_number = "MU 5005";
      onward.airline = "China Eastern";
      onward.departure_airport = { id: "PVG", time: "2027-01-16 15:00" };
      onward.arrival_airport.time = "2027-01-16 17:00";
      data.best_flights[0].flights.push(onward);
      const wrong = structuredClone(data.best_flights[0]);
      wrong.flights[1].flight_number = "MU 5007";
      wrong.price = 1;
      data.best_flights.unshift(wrong);
    }
    return data;
  });
  try {
    const { status, data } = await h.request(payload);
    assert.equal(status, 200);
    assert.deepEqual(data.results.map((result) => result.departureDate), ["2027-01-06", "2027-01-05"]);
    assert.ok(data.results.every((result) => result.returnDate === "2027-01-16" && result.legs[1].arrival === "2027-01-09 19:30"));
    assert.equal(data.insights.cabinPrices.length, 3);
    assert.ok(data.insights.cabinPrices.every((cabin) => cabin.available && cabin.legs[2].segments[1].flightNumber === "MU 5005"));
    assert.ok(h.calls.length <= 24);
    assert.ok(h.calls.every((params) => !params.include_airlines), "Return-only constraint must not restrict the unconstrained outbound legs");
    const saved = await h.request(payload, "watches");
    const planner = saved.data.watch.sources[0].planner;
    assert.equal(planner.legTimeWindows[0].departureDateAlternative, "2027-01-06");
    assert.deepEqual(planner.legTimeWindows[2].flightNumbers, ["MU5616", "MU5005"]);
    const tracked = await h.request({ ...planner, trackingSample: true });
    assert.equal(tracked.data.results.length, 1);
    assert.equal(tracked.data.results[0].returnDate, "2027-01-16");
  } finally { h.restore(); }
});

test("all-leg carrier filters use a safe union while each leg is checked independently", async () => {
  const h = harness((data, params, index) => {
    data.best_flights[0].flights[0].flight_number = index ? "MU 123" : "BR 123";
    return data;
  });
  try {
    const { data } = await h.request({ ...base, tripDays: 5, legTimeWindows: [{ airline: "br" }, { airline: "mu" }] });
    assert.ok(data.results.length);
    assert.ok(h.calls.every((p) => p.include_airlines === "BR,MU" && !p.exclude_airlines));
  } finally { h.restore(); }
});

test("whole-journey airline applies to all legs, persists, and rejects conflicting constraints", async () => {
  const h = harness((data) => {
    data.best_flights[0].flights[0].flight_number = "MU 100";
    data.best_flights[0].flights[0].airline = "China Eastern";
    return data;
  });
  try {
    const payload = { ...multi, journeyAirline: "中國東方航空", includeReturn: true, destinationMinNights: 3, destinationMaxNights: 3 };
    const { data } = await h.request(payload);
    assert.ok(data.results.length);
    assert.ok(h.calls.every((p) => p.include_airlines === "MU"));
    assert.ok(data.results[0].segments.every((s) => s.flightNumber === "MU 100"));
    assert.ok(data.results[0].purchaseLinks.some((l) => l.kind === "official" && l.url === "https://www.ceair.com/"));
    const saved = await h.request(payload, "watches");
    assert.equal(saved.data.watch.sources[0].planner.journeyAirline, "MU");
    assert.equal(saved.data.watch.sources[0].planner.legTimeWindows.length, 3);
    const before = h.calls.length;
    for (const extra of [{ excludedAirlines: ["MU"] }, { legTimeWindows: [{ airline: "BR" }] },
      { legTimeWindows: [{ flightNumbers: "BR100" }] }, { journeyAirline: "unknown-carrier" }]) {
      assert.equal((await h.request({ ...payload, ...extra })).status, 400);
    }
    assert.equal(h.calls.length, before);
    assert.equal(validateFlightPreferences({ ...base, journeyAirline: "mu" }).legTimeWindows[0].airline, "MU");
  } finally { h.restore(); }
});

test("time windows enforce exact local minutes, including overnight windows", () => {
  const p = validateFlightPreferences({ ...base, departureTimeFrom: "22:30", departureTimeTo: "06:00", arrivalTimeFrom: "08:00", arrivalTimeTo: "10:15" });
  const item = (dep, arr) => ({ segments: [{ departureTime: `${date} ${dep}`, arrivalTime: `${date} ${arr}` }] });
  assert.equal(matchesFlightPreferences(item("23:00", "10:15"), p), true);
  assert.equal(matchesFlightPreferences(item("05:00", "10:16"), p), false);
  assert.equal(matchesFlightPreferences(item("10:00", "09:00"), p), false);
  assert.equal(providerFlightFilters(p, new Set()).outbound_times, "0,23,8,10");
});

test("per-leg dates reject malformed, same-day reversed windows and conflicting fixed dates before paid calls", async () => {
  const h = harness();
  try {
    for (const payload of [
      { ...base, legTimeWindows: [{} , {}] },
      { ...base, legTimeWindows: [{ arrivalDate: "2026-02-30" }] },
      { ...base, legTimeWindows: [{ arrivalDate: date, arrivalTimeFrom: "23:00", arrivalTimeTo: "02:00" }] },
      { ...base, legTimeWindows: [{ departureTimeFrom: "24:00" }] },
      { ...base, dateConstraint: "departure", fixedDepartureDate: date, legTimeWindows: [{ departureDate: addDateDays(date, 1) }] },
    ]) assert.equal((await h.request(payload)).status, 400);
    assert.equal(h.calls.length, 0);
  } finally { h.restore(); }
});

test("one-way arrival day and minute range find an overnight departure without changing arrival", async () => {
  const h = harness((data, params) => {
    data.best_flights[0].flights[0].arrival_airport.time = `${addDateDays(params.outbound_date, 1)} 06:15`;
    return data;
  });
  try {
    const payload = { ...base, flightMode: "annual_low", legTimeWindows: [{ arrivalDate: date, arrivalTimeFrom: "06:15", arrivalTimeTo: "06:15" }] };
    const { status, data } = await h.request(payload);
    assert.equal(status, 200);
    assert.equal(data.results[0].departureDate, addDateDays(date, -1));
    assert.equal(data.results[0].arrival, `${date} 06:15`);
    assert.ok(data.insights.cabinPrices.every((c) => !c.available || c.legs[0].arrival === `${date} 06:15`));
    const saved = await h.request(payload, "watches");
    assert.equal(saved.data.watch.sources[0].planner.legTimeWindows[0].arrivalDate, date);
    const tracked = await h.request({ ...saved.data.watch.sources[0].planner, trackingSample: true });
    assert.equal(tracked.data.results[0].arrival, `${date} 06:15`);
  } finally { h.restore(); }
});

test("a cheaper wrong-day flight is excluded without discarding a matching same-day flight", async () => {
  const h = harness((data) => {
    const wrong = structuredClone(data.best_flights[0]);
    wrong.price = 100;
    wrong.flights[0].arrival_airport.time = `${addDateDays(date, 1)} 13:00`;
    data.best_flights.unshift(wrong);
    return data;
  });
  try {
    const { data } = await h.request({ ...base, legTimeWindows: [{ departureDate: date, arrivalDate: date, arrivalTimeFrom: "12:30", arrivalTimeTo: "14:00" }] });
    assert.equal(data.results[0].price, 9000);
    assert.equal(data.results[0].arrival, `${date} 13:00`);
  } finally { h.restore(); }
});

test("round trip uses independent outbound and return day/time windows", async () => {
  const back = addDateDays(date, 5);
  const h = harness((data, params, index) => {
    if (index === 1) {
      data.best_flights[0].flights[0].departure_airport.time = `${params.return_date} 18:30`;
      data.best_flights[0].flights[0].arrival_airport.time = `${params.return_date} 22:15`;
    }
    return data;
  });
  try {
    const { data } = await h.request({ ...base, tripDays: 5, legTimeWindows: [
      { departureDate: date, departureTimeFrom: "08:30", departureTimeTo: "10:00", arrivalDate: date, arrivalTimeTo: "14:00" },
      { departureDate: back, departureTimeFrom: "18:30", departureTimeTo: "20:00", arrivalDate: back, arrivalTimeFrom: "21:00", arrivalTimeTo: "22:15" },
    ] });
    assert.equal(data.results[0].legs[1].departure, `${back} 18:30`);
    assert.ok(h.calls.every((p) => p.outbound_times === "8,10,0,14" && p.return_times === "18,20,21,22"));
  } finally { h.restore(); }
});

test("return arrival date is not mistaken for the return takeoff date", async () => {
  const h = harness((data, params, index) => {
    if (index === 1) data.best_flights[0].flights[0].arrival_airport.time = `${addDateDays(params.return_date, 1)} 06:00`;
    return data;
  });
  try {
    const { data } = await h.request({ ...base, tripDays: 5, dateConstraint: "departure", fixedDepartureDate: date,
      legTimeWindows: [{}, { arrivalDate: addDateDays(date, 6), arrivalTimeTo: "08:00" }] });
    assert.equal(data.results[0].departureDate, date);
    assert.equal(data.results[0].returnDate, addDateDays(date, 5));
    assert.equal(data.results[0].legs[1].arrival, `${addDateDays(date, 6)} 06:00`);
    assert.deepEqual(data.insights.durationAlternatives, []);
  } finally { h.restore(); }
});

test("multi-city applies distinct windows to all three legs including overnight arrivals", async () => {
  const days = [date, addDateDays(date, 3), addDateDays(date, 7)];
  const h = harness((data, params, index) => {
    const leg = JSON.parse(params.multi_city_json)[index];
    data.best_flights[0].flights[0].departure_airport.time = `${leg.date} ${["09:00", "18:00", "22:00"][index]}`;
    data.best_flights[0].flights[0].arrival_airport.time = `${addDateDays(leg.date, 1)} ${["06:00", "04:00", "08:00"][index]}`;
    return data;
  });
  try {
    const { data } = await h.request({ ...multi, includeReturn: true, destinationMinNights: 3, destinationMaxNights: 3,
      legTimeWindows: days.map((departureDate, i) => ({ departureDate, arrivalDate: addDateDays(departureDate, 1),
        departureTimeFrom: ["09:00", "18:00", "22:00"][i], departureTimeTo: ["10:00", "20:00", "23:00"][i], arrivalTimeTo: ["07:00", "05:00", "09:00"][i] })) });
    assert.equal(data.results[0].legs.length, 3);
    assert.equal(data.results[0].stopoverNights, 2);
    assert.equal(data.results[0].destinationNights, 3);
    assert.deepEqual(JSON.parse(h.calls[0].multi_city_json).map((leg) => leg.times), ["9,10,0,7", "18,20,0,5", "22,23,0,9"]);
    assert.equal(data.results[0].legs[2].arrival, `${addDateDays(date, 8)} 08:00`);
  } finally { h.restore(); }
});

test("fixed middle-leg day anchors a flexible first leg including overnight travel", async () => {
  const h = harness((data, params, index) => {
    if (index === 0) {
      const leg = JSON.parse(params.multi_city_json)[0];
      data.best_flights[0].flights[0].arrival_airport.time = `${addDateDays(leg.date, 1)} 06:00`;
    }
    return data;
  });
  try {
    const { data } = await h.request({ ...multi, flightMode: "annual_low", legTimeWindows: [{}, { departureDate: addDateDays(date, 3), departureTimeFrom: "08:00", departureTimeTo: "10:00" }] });
    assert.equal(data.results[0].departureDate, date);
    assert.equal(data.results[0].legs[1].departureDate, addDateDays(date, 3));
    assert.equal(data.results[0].stopoverNights, 2);
  } finally { h.restore(); }
});

test("incompatible fixed departure and arrival days produce no substitute dates", async () => {
  const h = harness();
  try {
    const { data } = await h.request({ ...base, legTimeWindows: [{ departureDate: date, arrivalDate: addDateDays(date, 1) }] });
    assert.deepEqual(data.results, []);
    assert.equal(h.calls.length, 1);
  } finally { h.restore(); }
});

test("multi-city uses whole-trip final quote, includes all legs and economy default", async () => {
  const h = harness();
  try {
    const { status, data } = await h.request(multi);
    assert.equal(status, 200);
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].price, 10000);
    assert.equal(data.results[0].legs.length, 2);
    assert.equal(data.results[0].stopoverNights, 2);
    assert.equal(data.results[0].travelClass, "1");
    assert.equal(data.results[0].upgradeEligibility.status, "unknown");
    assert.equal(data.insights.cabinPrices.length, 3);
    assert.ok(h.calls.every((p) => p.type === "3" && !p.outbound_date));
    assert.equal(h.calls.length, 9);
    await h.request(multi);
    assert.equal(h.calls.length, 9, "repeat queries use 15-minute cache");
  } finally { h.restore(); }
});

test("optional return completes the third leg without double counting", async () => {
  const h = harness();
  try {
    const { data } = await h.request({ ...multi, includeReturn: true, destinationMinNights: 3, destinationMaxNights: 3 });
    assert.equal(data.results[0].legs.length, 3);
    assert.equal(data.results[0].price, 11000);
    assert.equal(data.results[0].destinationNights, 3);
    assert.equal(data.results[0].returnDate, addDateDays(date, 5));
  } finally { h.restore(); }
});

test("overnight arrival counts stopover nights from actual arrival day", async () => {
  const h = harness((data, params, index) => {
    if (index === 0) data.best_flights[0].flights[0].arrival_airport.time = `${addDateDays(date, 1)} 06:00`;
    return data;
  });
  try {
    const { data } = await h.request(multi);
    assert.equal(data.results[0].stopoverNights, 2);
    assert.equal(data.results[0].legs[1].departureDate, addDateDays(date, 3));
    assert.ok(data.insights.cabinPrices.every((c) => !c.available || c.legs[1].departureDate === addDateDays(date, 3)));
  } finally { h.restore(); }
});

test("return-leg exclusion cannot produce a matching round trip", async () => {
  const h = harness((data, params, index) => {
    if (index === 1) data.best_flights[0].flights[0].airplane = "Boeing 737 MAX 8";
    return data;
  });
  try {
    const { data } = await h.request({ ...base, tripDays: 5, excludedAircraft: ["737 MAX"] });
    assert.equal(data.results.length, 0);
    assert.equal(h.calls.length, 2);
  } finally { h.restore(); }
});

test("default and legacy auto never replace missing through fares with independent tickets", async () => {
  const h = harness((data) => { delete data.best_flights[0].departure_token; return data; });
  try {
    for (const ticketMode of [undefined, "auto", "through"]) {
      const { data } = await h.request({ ...multi, ticketMode });
      assert.equal(data.results.length, 0);
      assert.equal(data.insights.ticketMode, "through");
      assert.match(data.insights.samplingNotice, /未提供.*聯程/);
      assert.ok(h.calls.every((p) => p.type === "3"));
    }
    const { data } = await h.request({ ...multi, ticketMode: "separate" });
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].separateTickets, true);
    assert.equal(data.results[0].priceBasis, "separate_ticket_sum");
    assert.equal(data.results[0].price, 18000);
    assert.ok(data.results[0].legs.every((leg) => leg.purchaseLinks.length));
  }
  finally { h.restore(); }
});

test("through fares tolerate unpriced intermediate selections but require a final priced booking option", async () => {
  for (const missingFinal of ["none", "price", "booking_token"]) {
    const h = harness((data, params, index) => {
      if (index === 0) delete data.best_flights[0].price;
      else if (missingFinal !== "none") delete data.best_flights[0][missingFinal];
      return data;
    });
    try {
      const { status, data } = await h.request(multi);
      assert.equal(status, 200);
      if (missingFinal === "none") {
        assert.equal(data.results[0].price, 10000, "Use final whole-journey price, never sum intermediate estimates");
        assert.equal(data.results[0].separateTickets, false);
        assert.equal(data.results[0].priceBasis, "whole_itinerary_quote");
        assert.equal(data.results[0].bookingToken, undefined);
        assert.ok(data.results[0].legs.every((leg) => !leg.bookingToken && !leg.departureToken));
        assert.ok(data.insights.cabinPrices.every((c) => c.available && !c.separateTickets));
      } else assert.deepEqual(data.results, []);
      assert.ok(h.calls.every((p) => p.type === "3"));
    } finally { h.restore(); }
  }
});

test("through-ticket tracking keeps its fare basis and never silently switches to split fares", async () => {
  const h = harness();
  try {
    const saved = await h.request(multi, "watches");
    const planner = saved.data.watch.sources[0].planner;
    assert.equal(planner.ticketMode, "through");
    const tracked = await h.request({ ...planner, trackingSample: true });
    assert.equal(tracked.data.results[0].priceBasis, "whole_itinerary_quote");
    assert.equal(tracked.data.results[0].price, 10000);
    assert.ok(h.calls.every((p) => p.type === "3"));
    assert.ok(h.calls.every((p) => p.deep_search === "true"));
  } finally { h.restore(); }
});

test("all unpriced selections resolve a together booking offer without adding leg fares", async () => {
  const h = harness((data) => { delete data.best_flights[0].price; return data; }, (_, params) => {
    assert.equal(params.departure_token, undefined, "Booking and departure tokens are mutually exclusive");
    return { search_parameters: { currency: "TWD" }, booking_options: [
      { separate_tickets: true, together: { price: 1, book_with: "Split Seller" } },
      { together: { price: 2, book_with: "Wrong flights", marketed_as: ["MU5008", "MU5005"] } },
      { together: { price: 16500 * Number(params.travel_class), book_with: "Airline", airline: true,
        marketed_as: ["BR 100", "BR 100"], baggage_prices: ["1 free checked bag"] } },
    ] };
  });
  try {
    const { data } = await h.request(multi);
    assert.equal(data.results[0].price, 16500);
    assert.equal(data.results[0].bookingQuote.seller, "Airline");
    assert.equal(data.results[0].bookingQuote.basis, "provider_together_offer");
    assert.deepEqual(data.insights.cabinPrices.map((c) => c.price), [16500, 33000, 49500]);
    assert.equal(h.calls.filter((p) => p.booking_token).length, 3);
  } finally { h.restore(); }
});

test("through fares reject split-only, no-price, different-flight and wrong-currency booking offers", async () => {
  for (const booking of [
    { booking_options: [{ separate_tickets: true, together: { price: 5000 } }] },
    { booking_options: [{ departing: { price: 3000 }, returning: { price: 2000 } }] },
    { booking_options: [{ together: { book_with: "No price" } }] },
    { booking_options: [{ together: { price: 5000, marketed_as: ["BR101", "BR100"] } }] },
    { search_parameters: { currency: "USD" }, booking_options: [{ together: { price: 5000 } }] },
  ]) {
    const h = harness(undefined, () => booking);
    try {
      const { status, data } = await h.request(multi);
      if (booking.search_parameters) assert.notEqual(status, 200);
      else assert.deepEqual(data.results, []);
      assert.ok(h.calls.every((p) => p.type === "3"));
    } finally { h.restore(); }
  }
});

test("booking source failure is not silently reported as no flights", async () => {
  const h = harness(undefined, () => { throw new Error("Booking provider unavailable"); });
  try {
    const { status } = await h.request(multi);
    assert.equal(status, 502);
    assert.ok(h.calls.every((p) => p.type === "3"));
  } finally { h.restore(); }
});

test("matching flights without a booking quote are display-only, never zero-price samples or alerts", async () => {
  const h = harness((data) => { delete data.best_flights[0].price; return data; }, () => ({}));
  try {
    const { status, data } = await h.request(multi);
    assert.equal(status, 200);
    assert.deepEqual(data.results, []);
    assert.equal(data.unpricedResults.length, 1);
    const itinerary = data.unpricedResults[0];
    assert.equal(itinerary.quoteStatus, "no_booking_offer");
    assert.equal(itinerary.price, null);
    assert.equal(itinerary.priceText, "此來源未提供聯程售價");
    assert.equal(itinerary.trackable, false);
    assert.equal(itinerary.sampled, false);
    assert.equal(itinerary.legs.length, 2);
    assert.ok(itinerary.legs.every((leg) => !leg.bookingToken && !leg.departureToken));
    assert.equal(data.insights.lowestPrice, null);
    assert.equal(data.insights.yearStats.average, null);
    assert.equal(data.insights.yearStats.sampleCount, 0);
    assert.ok(data.insights.cabinPrices.every((cabin) => !cabin.available && cabin.price === null));
    assert.match(data.insights.samplingNotice, /航班.*未提供聯程購票價格/);
    const tracked = await h.request({ ...multi, trackingSample: true });
    assert.deepEqual(tracked.data.results, []);
    assert.deepEqual(tracked.data.unpricedResults, []);
  } finally { h.restore(); }
});

test("unpriced premium cabins do not become available when economy has a quote", async () => {
  const h = harness(undefined, (data, params) => params.travel_class === "1" ? data : {});
  try {
    const { data } = await h.request(multi);
    assert.equal(data.results.length, 1);
    assert.equal(data.insights.cabinPrices[0].available, true);
    assert.ok(data.insights.cabinPrices.slice(1).every((cabin) => !cabin.available && cabin.price === null));
  } finally { h.restore(); }
});

test("unpriced selections prefer the requested cabin over an earlier mixed-cabin result", async () => {
  const h = harness((data, params) => {
    for (const item of data.best_flights) delete item.price;
    const mismatch = structuredClone(data.best_flights[0]);
    mismatch.flights[0].flight_number = "BR 999";
    mismatch.flights[0].travel_class = params.travel_class === "1" ? "Business Class" : "Economy";
    data.best_flights.unshift(mismatch);
    return data;
  }, () => ({}));
  try {
    const { data } = await h.request(multi);
    assert.equal(data.unpricedResults.length, 1);
    assert.ok(data.unpricedResults[0].segments.every((segment) => segment.flightNumber === "BR 100"));
    assert.equal(data.unpricedResults[0].mixedCabin, false);
  } finally { h.restore(); }
});

test("through search never hides provider failure or substitutes incomplete split tickets", async () => {
  for (const fail of [false, true]) {
    const h = harness((data, params) => {
      if (fail) throw new Error("Provider unavailable");
      if (params.type === "3" || params.departure_id === "NRT") return { best_flights: [] };
      return data;
    });
    try {
      const { status, data } = await h.request(multi);
      if (fail) {
        assert.notEqual(status, 200);
        assert.ok(h.calls.every((p) => p.type === "3"));
      } else {
        assert.equal(status, 200);
        assert.deepEqual(data.results, []);
      }
    } finally { h.restore(); }
  }
});

test("explicit separate tickets preserve both departure dates, deadline, fixed flights and cabin sums", async () => {
  const payload = { ...multi, ticketMode: "separate", departureId: "TPE,TSA", stopoverId: "PVG,SHA", arrivalId: "HRB", includeReturn: true,
    stopoverMinNights: 3, stopoverMaxNights: 4, destinationMinNights: 7, destinationMaxNights: 7,
    legTimeWindows: [
      { departureDate: "2027-01-05", departureDateAlternative: "2027-01-06" },
      { departureDate: "2027-01-09", arrivalDate: "2027-01-09", arrivalTimeTo: "19:30" },
      { departureDate: "2027-01-16", flightNumbers: "MU5616, MU5005" },
    ] };
  const h = harness((data, params, index) => {
    if (params.type === "3" && index === 2) return { best_flights: [] };
    const item = data.best_flights[0];
    const flight = item.flights[0];
    const departure = flight.departure_airport.id;
    if (departure === "TPE" && flight.departure_airport.time.startsWith("2027-01-05")) item.price += 1500;
    if (departure === "TPE" && flight.departure_airport.time.startsWith("2027-01-06")) {
      const overnight = structuredClone(item);
      overnight.price = 1;
      overnight.flights[0].arrival_airport.time = "2027-01-07 06:00";
      data.best_flights.unshift(overnight);
    }
    if (departure === "PVG") {
      flight.arrival_airport.time = "2027-01-09 19:30";
      const late = structuredClone(item);
      late.price = 1;
      late.flights[0].arrival_airport.time = "2027-01-09 19:31";
      data.best_flights.unshift(late);
    }
    if (departure === "HRB") {
      const onward = structuredClone(flight);
      flight.flight_number = "MU 5616";
      flight.airline = "China Eastern";
      flight.arrival_airport = { id: "PVG", time: "2027-01-16 12:00" };
      onward.flight_number = "MU 5005";
      onward.airline = "China Eastern";
      onward.departure_airport = { id: "PVG", time: "2027-01-16 15:00" };
      onward.arrival_airport.time = "2027-01-16 17:00";
      item.flights.push(onward);
      const wrong = structuredClone(item);
      wrong.price = 1;
      wrong.flights[1].flight_number = "MU 5007";
      data.best_flights.unshift(wrong);
    }
    return data;
  });
  try {
    const { status, data } = await h.request(payload);
    assert.equal(status, 200);
    assert.deepEqual(data.results.map((r) => r.departureDate), ["2027-01-06", "2027-01-05"]);
    for (const result of data.results) {
      assert.equal(result.separateTickets, true);
      assert.equal(result.itineraryComplete, true);
      assert.equal(result.legs.length, 3);
      assert.equal(result.price, result.legs.reduce((sum, leg) => sum + leg.price, 0));
      assert.equal(result.legs[1].arrival, "2027-01-09 19:30");
      assert.deepEqual(result.legs[2].segments.map((s) => s.flightNumber), ["MU 5616", "MU 5005"]);
    }
    assert.equal(data.results[0].price, 27000);
    assert.ok(data.insights.cabinPrices.every((c) => c.available && c.separateTickets && c.price === c.legs.reduce((sum, leg) => sum + leg.price, 0)));
    assert.ok(h.calls.length <= 24);
    assert.equal(h.calls.filter((p) => p.type === "2" && p.departure_id === "HRB" && p.travel_class === "1").length, 1);
    const saved = await h.request({ ...payload, ticketMode: "separate" }, "watches");
    const planner = saved.data.watch.sources[0].planner;
    assert.equal(planner.ticketMode, "separate");
    const before = h.calls.length;
    const tracked = await h.request({ ...planner, trackingSample: true });
    assert.equal(tracked.data.results[0].separateTickets, true);
    assert.ok(h.calls.slice(before).every((p) => p.type === "2"));
  } finally { h.restore(); }
});

test("saved tracking preserves every preference and only authenticates tracking samples", async () => {
  const h = harness();
  try {
    const payload = { ...multi, excludedAircraft: ["737"], excludedAirlines: ["CI"], departureTimeFrom: "08:30" };
    const saved = await h.request(payload, "watches");
    assert.equal(saved.status, 200);
    const p = saved.data.watch.sources[0].planner;
    assert.deepEqual(p.excludedAircraft, ["737"]);
    assert.equal(p.stopoverId, "NRT");
    assert.equal(p.departureTimeFrom, "08:30");
    assert.equal((await h.request({ ...payload, trackingSample: true }, "search", false)).status, 401);
    assert.equal(h.calls.length, 0);
    const tracked = await h.request({ ...payload, trackingSample: true });
    assert.equal(tracked.data.results[0].itineraryComplete, true);
    assert.equal(h.calls.length, 3);
  } finally { h.restore(); }
});

test("flexible combinations remain bounded and date windows do not drift after expiry", async () => {
  const p = validateFlightPreferences({ ...multi, includeReturn: true, stopoverMaxNights: 10 });
  assert.equal(makeJourneyPlans(p, date, addDateDays(date, 30)).length, 4);
  const h = harness();
  try { assert.equal((await h.request({ ...base, startDate: "2020-01-01" })).status, 400); assert.equal(h.calls.length, 0); }
  finally { h.restore(); }
});

test("tracking still checks nearby duration when the requested duration has no flights", async () => {
  const h = harness((data, params) => {
    const days = (Date.parse(params.return_date) - Date.parse(params.outbound_date)) / 86400000;
    return days === 5 ? { best_flights: [] } : data;
  });
  try {
    const { data } = await h.request({ ...base, tripDays: 5, compareDurations: true, trackingSample: true });
    assert.equal(data.results.length, 1);
    assert.notEqual(data.results[0].tripDays, 5);
    assert.equal(data.results[0].isAlternativeDuration, true);
    assert.equal(data.results[0].savings, null);
    assert.equal(data.results[0].itineraryComplete, true);
  } finally { h.restore(); }
});
