import assert from "node:assert/strict";
import test from "node:test";
import { timingSafeEqual } from "node:crypto";
import worker from "../../workers/bazi-ziwei.js";
import { addDateDays, validateFlightPreferences, providerFlightFilters, matchesFlightPreferences, makeJourneyPlans } from "../../workers/flight-planner.js";

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
        departure_airport: { id: leg.departure_id, time: `${leg.date} 09:00` }, arrival_airport: { id: leg.arrival_id, time: `${leg.date} 13:00` }, duration: 180 }],
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
