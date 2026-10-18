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
const { chromium, webkit } = require("playwright");
const browserName = process.env.FLIGHT_TEST_BROWSER || "chromium";
const records = new Map();
const env = { PRICE_WATCH_PUBLIC_SEARCH: "true", PRICE_WATCH_ACCESS_TOKEN: "test-ui", SERPAPI_API_KEY: "test", PRICE_WATCH_PUBLIC_SEARCH_PER_MINUTE: "100",
  PRICE_WATCH_KV: { async get(key) { return records.get(key) || null; }, async put(key, value) { records.set(key, JSON.parse(value)); } } };
const originalFetch = globalThis.fetch;
let throughBookingFixture = false;
let bookingUnavailableFixture = false;
globalThis.fetch = async (url) => {
  const p = Object.fromEntries(new URL(url).searchParams);
  assert.equal(new URL(url).hostname, "serpapi.com", "No real provider calls in UI tests");
  const legs = p.multi_city_json ? JSON.parse(p.multi_city_json) : [
    { departure_id: p.departure_id, arrival_id: p.arrival_id, date: p.outbound_date },
    ...(p.return_date ? [{ departure_id: p.arrival_id, arrival_id: p.departure_id, date: p.return_date }] : []),
  ];
  const index = p.booking_token ? legs.length - 1 : Number(p.departure_token || 0);
  const leg = legs[index];
  if (!leg) return Response.json({ suggestions: [] });
  const data = { best_flights: [{ price: 12000 * Number(p.travel_class) + index * 1000, total_duration: 180,
    departure_token: index < legs.length - 1 ? String(index + 1) : undefined,
    booking_token: index === legs.length - 1 ? "final-booking-token" : undefined,
    flights: [{ airline: "長榮航空", flight_number: "BR 198", airplane: "Boeing 787-9", travel_class: p.travel_class === "1" ? "Economy" : "Business",
      departure_airport: { id: leg.departure_id.split(",").at(-1), time: `${leg.date} 09:00` }, arrival_airport: { id: leg.arrival_id.split(",")[0], time: `${leg.date} 13:00` }, duration: 180 }],
  }] };
  if (legs[0].date === "2027-01-05") data.best_flights[0].price += 1500;
  if (p.include_airlines === "MU") {
    data.best_flights[0].flights[0].flight_number = "MU 100";
    data.best_flights[0].flights[0].airline = "中國東方航空";
  }
  if (leg.departure_id === "HRB") {
    const first = data.best_flights[0].flights[0];
    const second = structuredClone(first);
    first.flight_number = "MU 5616";
    first.airline = "中國東方航空";
    first.arrival_airport = { id: "PVG", time: `${leg.date} 12:00` };
    second.flight_number = p.multi_city_json && !throughBookingFixture ? "MU 5007" : "MU 5005";
    second.airline = "中國東方航空";
    second.departure_airport = { id: "PVG", time: `${leg.date} 15:00` };
    second.arrival_airport.time = `${leg.date} 17:00`;
    data.best_flights[0].flights.push(second);
  }
  if (throughBookingFixture && p.multi_city_json && !p.booking_token) delete data.best_flights[0].price;
  if (p.booking_token && bookingUnavailableFixture) return Response.json({});
  return Response.json(p.booking_token
    ? { booking_options: [{ together: { price: data.best_flights[0].price, book_with: "測試航空公司" } }] }
    : data);
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
  browser = browserName === "webkit" ? await webkit.launch({ headless: true }) : await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", isMobile: browserName === "webkit", hasTouch: true });
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
  await page.locator('#arrivalPlaceOptions [data-iata="LAX"]').waitFor();
  assert.equal(await page.locator('#arrivalPlaceOptions [data-iata="LAX"] .place-option-main > span').innerText(), "洛杉磯國際機場");
  await page.locator('#arrivalPlaceOptions [data-iata="LAX"]').click();
  assert.equal(await page.locator('[name="arrivalId"]').inputValue(), "LAX · 洛杉磯國際機場");
  await page.locator('[name="arrivalId"]').fill("tll");
  await page.locator('#arrivalPlaceOptions [data-iata="TLL"]').waitFor();
  assert.equal(await page.locator('#arrivalPlaceOptions [data-iata="TLL"] .place-option-main > span').innerText(), "塔林機場");
  await page.screenshot({ path: join(root, 'tmp/flight-airports-zh-mobile.png') });
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
  await page.getByLabel('中國東方航空 MU', { exact: true }).check();
  await page.locator('.leg-schedules summary').click();
  await page.locator('[data-leg-role="outbound"] [data-window-field="departureTimeFrom"]').fill("08:30");
  await page.locator('[data-leg-role="outbound"] [data-window-field="departureTimeTo"]').fill("18:00");
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
  assert.deepEqual(lastSearch.excludedAirlines, ["CI", "MU"]);
  assert.equal(lastSearch.stopoverId, "NRT");
  assert.equal(lastSearch.departureId, "TPE,TSA");
  assert.equal(lastSearch.includeReturn, true);
  assert.equal(lastSearch.legTimeWindows[0].departureTimeFrom, "08:30");
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
  const comparison = page.locator(".result-card .compare-button:not([data-leg-cabins])").first();
  await comparison.click();
  await page.waitForFunction(() => document.querySelectorAll(".inline-cabins").length === 2);
  await page.locator(".track-button").first().click();
  await page.locator("#statusText").filter({ hasText: "已加入雲端追蹤" }).waitFor();
  const saved = records.get("price-watch:watches").watches[0].sources[0].planner;
  assert.equal(saved.stopoverId, "NRT");
  assert.equal(saved.departureId, "TPE,TSA");
  assert.deepEqual(saved.excludedAircraft, ["737 MAX"]);
  assert.equal(saved.legTimeWindows[0].departureTimeFrom, "08:30");
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
  // Each journey mode exposes only its own legs and preserves exact calendar/time windows.
  await page.locator('[name="journeyType"][value="oneway"]').check({ force: true });
  assert.equal(await page.locator('[data-leg-role]').count(), 1);
  assert.equal(await page.locator('[name="tripDays"]').isDisabled(), true);
  assert.equal(await page.locator('[name="dateConstraint"] option[value="return"]').evaluate((option) => option.disabled), true);
  await page.locator('[data-leg-role="outbound"] [data-window-field="arrivalDate"]').fill(fixedDate);
  await page.locator('[data-leg-role="outbound"] [data-window-field="arrivalTimeFrom"]').fill('12:00');
  await page.locator('[data-leg-role="outbound"] [data-window-field="arrivalTimeTo"]').fill('13:00');
  const submit = async () => {
    const pending = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
    await page.locator('#flightForm').evaluate((form) => form.requestSubmit());
    const response = await (await pending).json();
    await page.waitForFunction(() => !document.querySelector('#flightSubmitButton').disabled);
    return response;
  };
  const oneWay = await submit();
  assert.equal(lastSearch.tripDays, 0);
  assert.equal(lastSearch.legTimeWindows.length, 1);
  assert.equal(oneWay.results[0].legs.length, 1);
  assert.equal(oneWay.results[0].arrival, `${fixedDate} 13:00`);
  await page.locator('[name="journeyType"][value="simple"]').check({ force: true });
  assert.equal(await page.locator('[data-leg-role]').count(), 2);
  await page.locator('[data-leg-role="return"] [data-window-field="arrivalDate"]').fill(fixedReturn);
  await page.locator('[data-leg-role="return"] [data-window-field="arrivalTimeFrom"]').fill('13:00');
  await page.locator('[data-leg-role="return"] [data-window-field="arrivalTimeTo"]').fill('14:30');
  const roundTrip = await submit();
  assert.equal(roundTrip.results[0].legs[1].arrival, `${fixedReturn} 13:00`);
  assert.equal(lastSearch.legTimeWindows[1].arrivalTimeTo, '14:30');
  await page.locator('[name="journeyType"][value="multicity"]').check({ force: true });
  await page.locator('[name="arrivalId"]').fill('LAX');
  await page.locator('[name="arrivalId"]').press('Escape');
  assert.equal(await page.locator('[data-leg-role]').count(), 3);
  await page.locator('[data-leg-role="onward"] [data-window-field="departureDate"]').fill(addDateDays(fixedDate, 2));
  await page.locator('[data-leg-role="onward"] [data-window-field="departureTimeFrom"]').fill('09:00');
  await page.locator('[data-leg-role="onward"] [data-window-field="departureTimeTo"]').fill('10:30');
  const cityTrip = await submit();
  assert.equal(cityTrip.results[0].legs.length, 3);
  assert.equal(cityTrip.results[0].legs[1].departureDate, addDateDays(fixedDate, 2));
  assert.equal(cityTrip.results[0].legs[2].arrival, `${fixedReturn} 13:00`);
  await page.locator('.track-button').first().click();
  await page.locator('#statusText').filter({ hasText: '已加入雲端追蹤' }).waitFor();
  const timedWatch = records.get('price-watch:watches').watches.at(-1).sources[0].planner;
  assert.equal(timedWatch.legTimeWindows[1].departureTimeTo, '10:30');
  assert.equal(timedWatch.legTimeWindows[2].arrivalDate, fixedReturn);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.leg-schedules summary').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (width === 320) {
      const timeWidth = await page.locator('.leg-schedules input[type="time"]').first().evaluate((input) => input.getBoundingClientRect().width);
      assert.ok(timeWidth >= 200, 'Narrow phones must stack time fields to keep the full native time visible');
    }
    await page.screenshot({ path: join(root, `tmp/flight-leg-windows-${width}.png`) });
  }
  const exampleTrip = { journeyType: "multicity", includeReturn: true, dateConstraint: "flexible", departureId: "TPE,TSA", stopoverId: "PVG,SHA", arrivalId: "HRB",
    stopoverMinNights: 3, stopoverMaxNights: 4, destinationMinNights: 7, destinationMaxNights: 7, airlineType: "all", routeType: "any",
    legTimeWindows: [{ departureDate: "2027-01-05", departureDateAlternative: "2027-01-06" },
      { departureDate: "2027-01-09", arrivalDate: "2027-01-09", arrivalTimeTo: "19:30" },
      { departureDate: "2027-01-16", flightNumbers: "MU5616, MU5005" }] };
  await page.goto(`http://127.0.0.1:${server.address().port}/price-watch/#trip=${encodeURIComponent(JSON.stringify(exampleTrip))}`);
  await page.locator('#statusText').filter({ hasText: '行程已帶入' }).waitFor();
  assert.equal(await page.locator('[data-leg-role="return"] [data-window-field="flightNumbers"]').inputValue(), 'MU5616, MU5005');
  const firstDeparture = page.locator('[data-leg-role="outbound"] [data-window-field="departureDate"]');
  const firstArrival = page.locator('[data-leg-role="outbound"] [data-window-field="arrivalDate"]');
  await page.setViewportSize({ width: 390, height: 900 });
  await firstArrival.click();
  assert.equal(await page.locator('.flatpickr-calendar.open .cur-year').inputValue(), '2027');
  assert.equal(await page.locator('.flatpickr-calendar.open .flatpickr-monthDropdown-months').inputValue(), '0');
  assert.equal(await firstArrival.inputValue(), '', 'Opening a month must not impose an arrival day');
  await page.screenshot({ path: join(root, `tmp/flight-calendar-${browserName}-390.png`) });
  await firstArrival.press('Escape');
  await firstDeparture.fill('2027-12-31');
  await firstDeparture.press('Tab');
  await firstArrival.click();
  assert.equal(await page.locator('.flatpickr-calendar.open .flatpickr-monthDropdown-months').inputValue(), '11');
  await page.locator('.flatpickr-calendar.open .flatpickr-next-month').click();
  await page.locator('.flatpickr-calendar.open [aria-label="2028年01月01日"]').click();
  assert.equal(await firstArrival.inputValue(), '2028-01-01');
  await firstArrival.click();
  await page.locator('.flatpickr-calendar.open .date-clear').click();
  assert.equal(await firstArrival.inputValue(), '');
  await firstDeparture.fill('2027-01-05');
  await firstDeparture.press('Tab');
  await firstDeparture.press('Escape');
  await page.locator('[name="journeyAirline"]').click();
  for (const width of [320, 360, 375, 390, 430, 600, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.leg-schedules summary').scrollIntoViewIfNeeded();
    const overflow = await page.locator('.leg-schedules input').evaluateAll((inputs) => inputs.filter((input) => {
      const box = input.getBoundingClientRect();
      const parent = input.closest('label').getBoundingClientRect();
      return box.right > innerWidth + 1 || box.left < 0 || box.width > parent.width + 1;
    }).map((input) => input.outerHTML));
    assert.deepEqual(overflow, [], `${browserName} ${width}px date/time/airline fields overflow`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-trip-${browserName}-${width}.png`) });
  }
  const standaloneResponse = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
  await page.locator('[data-form-leg="2"]').click();
  const standalone = await (await standaloneResponse).json();
  await page.locator('[data-leg-role="return"] .leg-form-quotes .inline-cabins').waitFor();
  assert.ok(standalone.insights.cabinPrices.every((cabin) => cabin.available));
  assert.equal(lastSearch.legTimeWindows[0].flightNumbers, 'MU5616, MU5005');
  assert.equal(lastSearch.departureId, 'HRB');
  assert.equal(await page.locator('[name="ticketMode"]').inputValue(), 'through');
  const unavailableThrough = await submit();
  assert.equal(lastSearch.ticketMode, 'through');
  assert.deepEqual(unavailableThrough.results, []);
  assert.match(await page.locator('#ticketQuoteStatus').innerText(), /未取得聯程報價.*未以分段加總替代/);
  assert.equal(await page.locator('.result-card').count(), 0);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#ticketQuoteStatus').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-through-${browserName}-${width}.png`) });
  }
  const splitResponse = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
  await page.getByRole('button', { name: '改查分開購票價格', exact: true }).click();
  const exampleResult = await (await splitResponse).json();
  await page.locator('.result-card').first().waitFor();
  assert.equal(lastSearch.ticketMode, 'separate');
  assert.equal(exampleResult.results[0].departureDate, '2027-01-06');
  assert.equal(exampleResult.results[1].departureDate, '2027-01-05');
  assert.deepEqual(lastSearch.legTimeWindows, exampleTrip.legTimeWindows);
  assert.ok(exampleResult.results.every((r) => r.separateTickets && r.price === r.legs.reduce((sum, leg) => sum + leg.price, 0)));
  assert.match(await page.locator('.result-card').first().innerText(), /分開購票組合，非一張聯程票/);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.result-card').first().scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-separate-${browserName}-${width}.png`) });
  }
  const legQuote = page.locator('.result-card').first().locator('[data-leg-cabins="2"]');
  const quoteResponse = page.waitForResponse((response) => response.url().endsWith('/api/price-watch/search'));
  await legQuote.click();
  const quoted = await (await quoteResponse).json();
  await legQuote.filter({ hasText: '重新查此段艙等' }).waitFor();
  assert.equal(lastSearch.tripDays, 0);
  assert.equal(lastSearch.departureId, 'HRB');
  assert.equal(lastSearch.legTimeWindows[0].flightNumbers, 'MU5616, MU5005');
  assert.ok(quoted.insights.cabinPrices.every((cabin) => cabin.available));
  assert.match(await page.locator('.leg-cabin-quotes').filter({ hasText: '單段另購報價' }).innerText(), /經濟艙[\s\S]*商務艙/);
  await page.locator('.track-button').first().click();
  await page.locator('#statusText').filter({ hasText: '已加入雲端追蹤' }).waitFor();
  const exampleWatch = records.get('price-watch:watches').watches.at(-1).sources[0].planner;
  assert.equal(exampleWatch.ticketMode, 'separate');
  assert.deepEqual(exampleWatch.legTimeWindows[2].flightNumbers, ['MU5616', 'MU5005']);
  assert.equal(exampleWatch.legTimeWindows[0].departureDateAlternative, '2027-01-06');
  await page.locator('[name="journeyAirline"]').fill('mu');
  const muResult = await submit();
  assert.equal(lastSearch.journeyAirline, 'mu');
  assert.ok(muResult.results.length);
  assert.ok(muResult.results.every((r) => r.segments.every((s) => s.flightNumber.startsWith('MU'))));
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value) => { window.copiedTripLink = value; } } }));
  await page.locator('#copyTripLinkButton').click();
  const copied = await page.evaluate(() => window.copiedTripLink);
  const shared = JSON.parse(decodeURIComponent(new URL(copied).hash.slice(6)));
  assert.equal(shared.legTimeWindows[2].flightNumbers, 'MU5616, MU5005');
  assert.equal(shared.legTimeWindows[0].departureDateAlternative, '2027-01-06');
  assert.equal(shared.journeyAirline, 'mu');
  assert.equal(shared.ticketMode, 'separate');
  assert.equal(copied.includes('test-ui'), false, 'Share links must never include the access token');
  await page.reload();
  await page.waitForFunction(() => document.querySelector('[data-leg-role="return"] [data-window-field="flightNumbers"]')?.value === 'MU5616, MU5005');
  throughBookingFixture = true;
  for (const key of records.keys()) if (key.startsWith('price-watch:flight-query:')) records.delete(key);
  await page.locator('[name="ticketMode"]').selectOption('through');
  const throughResult = await submit();
  assert.equal(throughResult.results.length, 2);
  assert.ok(throughResult.results.every((r) => !r.separateTickets && r.bookingQuote.basis === 'provider_together_offer'));
  assert.equal(throughResult.results[0].price, 14000);
  assert.match(await page.locator('.result-card').first().innerText(), /整趟購票報價.*測試航空公司/);
  assert.doesNotMatch(await page.locator('.result-card').first().innerText(), /分開購票合計/);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.result-card').first().scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-through-priced-${browserName}-${width}.png`) });
  }
  bookingUnavailableFixture = true;
  for (const key of records.keys()) if (key.startsWith('price-watch:flight-query:')) records.delete(key);
  const unpricedResult = await submit();
  assert.deepEqual(unpricedResult.results, []);
  assert.equal(unpricedResult.unpricedResults.length, 2);
  assert.equal(await page.locator('.result-card').count(), 2);
  assert.match(await page.locator('#ticketQuoteStatus').innerText(), /查詢已完成.*沒有提供整趟聯程售價/);
  assert.match(await page.locator('.result-card').first().innerText(), /此來源未提供聯程售價/);
  assert.doesNotMatch(await page.locator('.result-card').first().innerText(), /聯程整趟報價/);
  assert.match(await page.locator('.result-card').first().innerText(), /MU 5616[\s\S]*MU 5005/);
  assert.doesNotMatch(await page.locator('#resultList').innerText(), /NT\$\s*0\b/);
  assert.equal(await page.locator('.result-card .track-button').count(), 0);
  assert.equal(await page.locator('.result-card .compare-button:not([data-leg-cabins])').count(), 0);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.result-card').first().evaluate((el) => el.scrollIntoView({ block: 'start' }));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: join(root, `tmp/flight-through-unpriced-${browserName}-${width}.png`) });
    assert.ok(await page.locator('.unpriced-result .result-description').first().evaluate((el) => el.getBoundingClientRect().width >= 200), 'Unpriced status must not squeeze the route into a narrow column');
  }
  bookingUnavailableFixture = false;
  for (const key of records.keys()) if (key.startsWith('price-watch:flight-query:')) records.delete(key);
  const recovered = await submit();
  assert.equal(recovered.results.length, 2);
  assert.deepEqual(recovered.unpricedResults, []);
  assert.equal(await page.locator('.result-card').count(), 2);
  assert.equal(await page.locator('.result-card .track-button').count(), 2);
  assert.doesNotMatch(await page.locator('#resultList').innerText(), /此來源未提供聯程售價/);
  assert.deepEqual(errors, []);
  console.log(`${browserName}: 320/360/375/390/430/600/1280px, two departure dates, ordered return flights, per-leg cabins, share links, tracking and existing flows passed; zero real API calls.`);
} finally {
  globalThis.fetch = originalFetch;
  if (browser) await browser.close();
  await new Promise((done) => server.close(done));
}
