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

function harness(change = (data) => data) {
  const calls = [];
  const records = new Map();
  const env = { PRICE_WATCH_PUBLIC_SEARCH: "true", PRICE_WATCH_ACCESS_TOKEN: "test", SERPAPI_API_KEY: "test",
    PRICE_WATCH_KV: { async get(key) { return records.get(key) || null; }, async put(key, value) { records.set(key, JSON.parse(value)); } } };
  const previous = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const params = Object.fromEntries(new URL(url).searchParams);
    calls.push(params);
    const index = Number((params.departure_token || "leg-0").split("-")[1]);
    const legs = params.multi_city_json ? JSON.parse(params.multi_city_json) : [
      { departure_id: params.departure_id, arrival_id: params.arrival_id, date: params.outbound_date },
      ...(params.return_date ? [{ departure_id: params.arrival_id, arrival_id: params.departure_id, date: params.return_date }] : []),
    ];
    const leg = legs[index];
    assert.ok(leg, "valid token traversal");
    const data = { best_flights: [{ price: Number(params.travel_class) * 9000 + index * 1000, total_duration: 180,
      departure_token: index < legs.length - 1 ? `leg-${index + 1}` : undefined,
      flights: [{ airline: "EVA Air", flight_number: "BR 100", airplane: "Boeing 787-9", travel_class: params.travel_class === "1" ? "Economy" : "Business",
        departure_airport: { id: leg.departure_id.split(",")[0], time: `${leg.date} 09:00` }, arrival_airport: { id: leg.arrival_id.split(",")[0], time: `${leg.date} 13:00` }, duration: 180 }],
    }] };
    return Response.json(change(data, params, index));
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

test("time windows enforce exact local minutes, including overnight windows", () => {
  const p = validateFlightPreferences({ ...base, departureTimeFrom: "22:30", departureTimeTo: "06:00", arrivalTimeFrom: "08:00", arrivalTimeTo: "10:15" });
  const item = (dep, arr) => ({ segments: [{ departureTime: `${date} ${dep}`, arrivalTime: `${date} ${arr}` }] });
  assert.equal(matchesFlightPreferences(item("23:00", "10:15"), p), true);
  assert.equal(matchesFlightPreferences(item("05:00", "10:16"), p), false);
  assert.equal(matchesFlightPreferences(item("10:00", "09:00"), p), false);
  assert.equal(providerFlightFilters(p, new Set()).outbound_times, "0,23,8,10");
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
    assert.equal(h.calls.length, 6);
    await h.request(multi);
    assert.equal(h.calls.length, 6, "repeat queries use 15-minute cache");
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

test("missing next-leg tokens and incomplete itineraries never appear as complete", async () => {
  const h = harness((data) => { delete data.best_flights[0].departure_token; return data; });
  try { assert.equal((await h.request(multi)).data.results.length, 0); }
  finally { h.restore(); }
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
    assert.equal(h.calls.length, 2);
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
