import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve } from "node:path";
import { timingSafeEqual } from "node:crypto";
import worker from "../../workers/bazi-ziwei.js";
import { addDateDays } from "../../workers/flight-planner.js";

crypto.subtle.timingSafeEqual = timingSafeEqual;
const root = resolve(import.meta.dirname, "../..");
const modules = resolve(dirname(process.execPath), "../node_modules");
const pkg = JSON.parse(await readFile(join(modules, "playwright/package.json"), "utf8"));
const require = createRequire(join(modules, `.pnpm/playwright@${pkg.version}/node_modules/playwright/package.json`));
const { chromium } = require("playwright");
const records = new Map();
const env = { PRICE_WATCH_PUBLIC_SEARCH: "true", PRICE_WATCH_ACCESS_TOKEN: "test-ui", SERPAPI_API_KEY: "test", PRICE_WATCH_PUBLIC_SEARCH_PER_MINUTE: "100",
  PRICE_WATCH_KV: { async get(key) { return records.get(key) || null; }, async put(key, value) { records.set(key, JSON.parse(value)); } } };
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  const p = Object.fromEntries(new URL(url).searchParams);
  assert.equal(new URL(url).hostname, "serpapi.com", "No real provider calls in UI tests");
  const legs = p.multi_city_json ? JSON.parse(p.multi_city_json) : [
    { departure_id: p.departure_id, arrival_id: p.arrival_id, date: p.outbound_date },
    ...(p.return_date ? [{ departure_id: p.arrival_id, arrival_id: p.departure_id, date: p.return_date }] : []),
  ];
  const index = Number(p.departure_token || 0);
  const leg = legs[index];
  if (!leg) return Response.json({ suggestions: [] });
  return Response.json({ best_flights: [{ price: 12000 * Number(p.travel_class) + index * 1000, total_duration: 180,
    departure_token: index < legs.length - 1 ? String(index + 1) : undefined,
    flights: [{ airline: "長榮航空", flight_number: "BR 198", airplane: "Boeing 787-9", travel_class: p.travel_class === "1" ? "Economy" : "Business",
      departure_airport: { id: leg.departure_id.split(",").at(-1), time: `${leg.date} 09:00` }, arrival_airport: { id: leg.arrival_id.split(",")[0], time: `${leg.date} 13:00` }, duration: 180 }],
  }] });
};
let lastSearch;
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString();
      if (url.pathname.endsWith("/search")) lastSearch = JSON.parse(body);
      const result = await worker.fetch(new Request(url, { method: req.method, headers: req.headers, ...(body ? { body } : {}) }), env);
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(await result.text());
      return;
    }
    const pathname = decodeURIComponent(url.pathname.endsWith("/") ? `${url.pathname}index.html` : url.pathname);
    const assets = join(root, "output/bazi-ziwei");
    const file = resolve(assets, `.${pathname}`);
    if (!file.startsWith(assets)) { res.writeHead(403); res.end(); return; }
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch { if (!res.headersSent) res.writeHead(500); res.end(); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/price-watch/`);
  await page.evaluate(() => localStorage.setItem("priceWatchAccessToken", "test-ui"));
  assert.equal(await page.locator('[name="departureId"]').inputValue(), "台北全部機場");
  await page.locator('[name="departureId"]').fill("台北");
  await page.locator('#departurePlaceOptions [data-iata="TPE,TSA"]').click();
  assert.equal(await page.locator('[name="departureId"]').getAttribute("data-iata"), "TPE,TSA");
  await page.locator('[name="arrivalId"]').fill("LAX");
  await page.locator('[name="journeyType"][value="multicity"]').check({ force: true });
  await page.locator('[name="stopoverId"]').fill("NRT");
  await page.locator('[name="stopoverId"]').press("Escape");
  assert.equal(await page.locator('[name="tripDays"]').isDisabled(), true);
  await page.locator('[name="includeReturn"]').check();
  await page.locator('[name="destinationMinNights"]').fill("3");
  await page.locator('[name="destinationMaxNights"]').fill("4");
  await page.locator('.advanced-filters summary').click();
  await page.locator('[name="excludedAircraft"][value="737 MAX"]').check();
  await page.locator('[name="excludedAirlines"][value="CI"]').check();
  await page.locator('[name="departureTimeFrom"]').fill("08:30");
  await page.locator('[name="departureTimeTo"]').fill("18:00");
  await page.locator('[data-flight-mode="date_window"]').click();
  await page.locator('[name="startDate"]').fill(addDateDays(new Date().toISOString().slice(0, 10), 20));
  await mkdir(join(root, "tmp"), { recursive: true });
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => [...document.querySelectorAll("input, select, button, summary, fieldset, label")]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .filter((el) => el.getBoundingClientRect().right > innerWidth + 1 || el.getBoundingClientRect().left < -1)
      .map((el) => el.outerHTML.slice(0, 100)));
    assert.deepEqual(overflow, [], `${width}px form overflow`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-planner-form-${width}.png`), fullPage: true });
  }
  await page.locator("#flightForm").evaluate((form) => form.requestSubmit());
  await page.locator(".journey-details").first().waitFor();
  await page.waitForFunction(() => !document.querySelector("#flightSubmitButton").disabled);
  assert.deepEqual(lastSearch.excludedAircraft, ["737 MAX"]);
  assert.equal(lastSearch.stopoverId, "NRT");
  assert.equal(lastSearch.departureId, "TPE,TSA");
  assert.equal(lastSearch.includeReturn, true);
  assert.equal(lastSearch.departureTimeFrom, "08:30");
  assert.equal(await page.locator(".result-card").first().locator(".journey-leg").count(), 3);
  assert.equal(await page.locator(".result-card").first().locator(".inline-cabins dd").count(), 3);
  assert.match(await page.locator(".result-card").first().innerText(), /里程升等：待確認/);
  assert.match(await page.locator(".result-card").first().innerText(), /TSA 出發，TPE 返回/);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator(".result-card").first().scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px results overflow`);
    await page.screenshot({ path: join(root, `tmp/flight-planner-results-${width}.png`) });
  }
  const comparison = page.locator(".compare-button").first();
  await comparison.click();
  await page.waitForFunction(() => document.querySelectorAll(".inline-cabins").length === 2);
  await page.locator(".track-button").first().click();
  await page.locator("#statusText").filter({ hasText: "已加入雲端追蹤" }).waitFor();
  const saved = records.get("price-watch:watches").watches[0].sources[0].planner;
  assert.equal(saved.stopoverId, "NRT");
  assert.equal(saved.departureId, "TPE,TSA");
  assert.deepEqual(saved.excludedAircraft, ["737 MAX"]);
  await page.locator('[name="journeyType"][value="simple"]').check({ force: true });
  assert.equal(await page.locator('[name="stopoverId"]').isDisabled(), true);
  assert.equal(await page.locator('[name="tripDays"]').isDisabled(), false);
  await page.locator('[name="departureId"]').fill("TSA");
  await page.locator('[name="departureId"]').press("Escape");
  await page.locator("#flightForm").evaluate((form) => form.requestSubmit());
  await page.waitForFunction(() => !document.querySelector("#flightSubmitButton").disabled);
  assert.equal(lastSearch.departureId, "TSA", "A single-airport choice remains available");
  // The complete catalog is local: type the same prefix in both cases, then paginate.
  await page.locator('[name="arrivalId"]').fill("t");
  await page.locator('#arrivalPlaceOptions .place-more').waitFor();
  const lowerCodes = await page.locator('#arrivalPlaceOptions .place-option').evaluateAll((buttons) => buttons.map((button) => button.dataset.iata));
  assert.equal(lowerCodes.length, 50);
  await page.locator('[name="arrivalId"]').fill("T");
  await page.locator('#arrivalPlaceOptions .place-more').waitFor();
  assert.deepEqual(await page.locator('#arrivalPlaceOptions .place-option').evaluateAll((buttons) => buttons.map((button) => button.dataset.iata)), lowerCodes);
  await page.locator('#arrivalPlaceOptions .place-more').click();
  assert.equal(await page.locator('#arrivalPlaceOptions .place-option').count(), 100);
  await page.locator('[name="departureId"]').fill("lOnDoN");
  await page.locator('#departurePlaceOptions [data-iata="LCY,LGW,LHR,LTN,SEN,STN"]').click();
  await page.locator('[name="arrivalId"]').fill("巴黎");
  await page.locator('#arrivalPlaceOptions [data-iata="CDG,ORY"]').click();
  const fixedDate = addDateDays(new Date().toISOString().slice(0, 10), 24);
  const fixedReturn = addDateDays(fixedDate, 5);
  for (const mode of ["departure", "return", "both"]) {
    await page.locator('[name="dateConstraint"]').selectOption(mode);
    if (mode !== "return") await page.locator('[name="fixedDepartureDate"]').fill(fixedDate);
    if (mode !== "departure") await page.locator('[name="fixedReturnDate"]').fill(fixedReturn);
    assert.equal(await page.locator('#flexibleModeSwitch').isVisible(), false);
    if (mode === "both") assert.equal(await page.locator('[name="tripDays"]').isDisabled(), true);
    const responsePromise = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
    await page.locator('#flightForm').evaluate((form) => form.requestSubmit());
    const response = await (await responsePromise).json();
    await page.waitForFunction(() => !document.querySelector('#flightSubmitButton').disabled);
    assert.ok(response.results.length, mode);
    assert.equal(lastSearch.departureId, "LCY,LGW,LHR,LTN,SEN,STN");
    assert.equal(lastSearch.arrivalId, "CDG,ORY");
    assert.equal(lastSearch.dateConstraint, mode);
    const results = [...response.results, ...response.insights.durationAlternatives];
    assert.ok(results.every((r) => mode === "return" || r.departureDate === fixedDate));
    assert.ok(results.every((r) => mode === "departure" || r.returnDate === fixedReturn));
    if (mode === "both") assert.equal(response.insights.durationAlternatives.length, 0);
  }
  await page.locator('.track-button').first().click();
  await page.locator('#statusText').filter({ hasText: '已加入雲端追蹤' }).waitFor();
  const fixedWatch = records.get('price-watch:watches').watches.at(-1).sources[0].planner;
  assert.equal(fixedWatch.fixedDepartureDate, fixedDate);
  assert.equal(fixedWatch.fixedReturnDate, fixedReturn);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('[name="dateConstraint"]').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-fixed-dates-${width}.png`) });
  }
  await page.locator('[name="dateConstraint"]').selectOption('flexible');
  await page.locator('[name="departureId"]').fill('tPe');
  await page.locator('[name="arrivalId"]').fill('nrT');
  const mixedCaseResponse = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
  await page.locator('#flightForm').evaluate((form) => form.requestSubmit());
  await mixedCaseResponse;
  await page.waitForFunction(() => !document.querySelector('#flightSubmitButton').disabled);
  assert.equal(lastSearch.departureId, 'TPE');
  assert.equal(lastSearch.arrivalId, 'NRT');
  assert.equal(lastSearch.lookaheadDays, 30);
  await page.locator('[name="lookaheadDays"]').selectOption('0');
  const oneDayResponse = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
  await page.locator('#flightForm').evaluate((form) => form.requestSubmit());
  await oneDayResponse;
  await page.waitForFunction(() => !document.querySelector('#flightSubmitButton').disabled);
  assert.equal(lastSearch.lookaheadDays, 0, 'Only this date must not silently become 30 days');
  assert.deepEqual(errors, []);
  console.log("Mobile/desktop 320/390/1280: global airport groups, case-insensitive input, pagination, fixed departure/return/both, tracking, multi-city, cabins and filters passed; zero real API calls.");
} finally {
  globalThis.fetch = originalFetch;
  if (browser) await browser.close();
  await new Promise((done) => server.close(done));
}
