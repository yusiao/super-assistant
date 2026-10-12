import assert from "node:assert/strict";
import { timingSafeEqual } from "node:crypto";
import worker from "../../workers/bazi-ziwei.js";

// Cloudflare exposes timingSafeEqual on SubtleCrypto; Node exposes it separately.
const originalTimingSafeEqual = crypto.subtle.timingSafeEqual;
crypto.subtle.timingSafeEqual = timingSafeEqual;

const legacy = { id: "legacy", name: "Old item", type: "product", sources: [{ type: "serpapi_google_shopping" }] };
const flight = { id: "flight", name: "TPE-NRT", type: "flight", sources: [{ type: "serpapi_google_flights_sampled" }] };
const records = new Map([["price-watch:watches", { watches: [legacy, flight] }]]);
const env = {
  PRICE_WATCH_PUBLIC_SEARCH: "true",
  PRICE_WATCH_ACCESS_TOKEN: "flight-only-test",
  PRICE_WATCH_KV: {
    async get(key) { return structuredClone(records.get(key) ?? null); },
    async put(key, value) { records.set(key, JSON.parse(value)); },
  },
};
const originalFetch = globalThis.fetch;
let providerCalls = 0;
globalThis.fetch = async () => { providerCalls += 1; throw new Error("Unexpected provider request"); };
async function request(path, body) {
  return worker.fetch(new Request(`https://example.com/api/price-watch/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "X-Price-Watch-Token": "flight-only-test" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }), env);
}
try {
  assert.equal((await request("search", { type: "product", query: "old item" })).status, 410);
  assert.deepEqual((await (await request("config")).json()).supportedTypes, ["flight"]);
  assert.deepEqual((await (await request("watches")).json()).watches, [flight]);
  assert.equal((await request("watches", { type: "product", query: "old item" })).status, 400);
  assert.equal((await request("watches", { watch: legacy })).status, 400);
  assert.equal((await request("watches", { watch: { ...legacy, type: "flight" } })).status, 400);
  const saved = await request("watches", { type: "flight", departureId: "TPE", arrivalId: "NRT", tripDays: 5 });
  assert.equal(saved.status, 200);
  const result = await saved.json();
  assert.equal(result.watches.length, 2);
  assert.deepEqual(result.watch.sources[0].trip_day_options, [3, 4, 5, 6, 7]);
  assert.ok(result.watches.every((watch) => watch.type === "flight"));
  assert.deepEqual(records.get("price-watch:watches").watches.find((watch) => watch.id === "legacy"), legacy);
  assert.equal(providerCalls, 0);
  console.log("Flight-only API: retired searches rejected, legacy records retained and excluded, flight tracking preserved; zero provider requests.");
} finally {
  globalThis.fetch = originalFetch;
  if (originalTimingSafeEqual) crypto.subtle.timingSafeEqual = originalTimingSafeEqual;
  else delete crypto.subtle.timingSafeEqual;
}
