import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";


const workspace = resolve(import.meta.dirname, "..", "..");
const assetRoot = join(workspace, "output", "bazi-ziwei");
const screenshotPath = join(workspace, "tmp", "price-watch-mobile-cdp.png");
const flightScreenshotPath = join(workspace, "tmp", "price-watch-flight-mobile-cdp.png");
const domPath = join(workspace, "tmp", "price-watch-mobile-cdp.html");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const webPort = Number(process.env.PRICE_WATCH_TEST_PORT || 8766);
const runtimeNodeModules = resolve(dirname(process.execPath), "..", "node_modules");
const playwrightPackage = JSON.parse(await readFile(join(runtimeNodeModules, "playwright", "package.json"), "utf8"));
const runtimeRequire = createRequire(
  join(runtimeNodeModules, ".pnpm", `playwright@${playwrightPackage.version}`, "node_modules", "playwright", "package.json"),
);
const { chromium } = runtimeRequire("playwright");
const savedWatches = [];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function requestJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${webPort}`);
  if (url.pathname === "/api/price-watch/config") {
    return sendJson(response, 200, { hasSerpApi: true, hasSkyscanner: true, hasKv: true, requiresToken: false });
  }
  if (url.pathname === "/api/price-watch/search" && request.method === "POST") {
    const payload = await requestJson(request);
    if (payload.type === "flight") {
      return sendJson(response, 200, {
        type: "flight",
        currency: "TWD",
        results: [
          {
            id: "mock-flight",
            type: "flight",
            title: "TPE-TYO 2026-09-10 - 2026-09-15",
            source: "Skyscanner Indicative",
            price: 7280,
            priceText: "NT$7,280",
            currency: "TWD",
            departureDate: "2026-09-10",
            returnDate: "2026-09-15",
            tripDays: 5,
            cached: true,
            link: "https://www.skyscanner.com.tw/transport/flights/tpe/tyo/260910/260915/",
          },
        ],
        insights: {
          yearStats: {
            year: 2026,
            average: 9140,
            sampleCount: 24,
            previousYear: 2025,
            previousAverage: 9860,
            previousSampleCount: 31,
          },
        },
      });
    }
    return sendJson(response, 200, {
      type: "product",
      currency: "TWD",
      results: [
        {
          id: "mock-product",
          type: "product",
          title: "iPad Air M3 11 128GB Wi-Fi",
          source: "測試商城",
          price: 16888,
          priceText: "NT$16,888",
          currency: "TWD",
          link: "https://example.com/ipad",
        },
      ],
    });
  }
  if (url.pathname === "/api/price-watch/places" && request.method === "POST") {
    const payload = await requestJson(request);
    const isTokyo = String(payload.query || "").includes("東京");
    return sendJson(response, 200, {
      places: [
        isTokyo
          ? { name: "東京", subtitle: "日本", iataCode: "TYO", entityId: "tokyo" }
          : { name: "台北", subtitle: "台灣", iataCode: "TPE", entityId: "taipei" },
      ],
    });
  }
  if (url.pathname === "/api/price-watch/watches") {
    if (request.method === "POST") {
      const payload = await requestJson(request);
      const watch = { ...payload, id: payload.id || "mock-watch", enabled: true };
      savedWatches.splice(0, savedWatches.length, watch);
      return sendJson(response, 200, { ok: true, watch, watches: savedWatches });
    }
    return sendJson(response, 200, { watches: savedWatches });
  }

  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(requestPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  let filePath = join(assetRoot, safePath);
  if (requestPath.endsWith("/")) filePath = join(filePath, "index.html");
  if (!filePath.startsWith(assetRoot)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolveReady) => server.listen(webPort, "127.0.0.1", resolveReady));
let browser;
try {
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${webPort}/price-watch/`, { waitUntil: "load" });
  await page.evaluate(() => localStorage.setItem("priceWatchAccessToken", "mobile-test-token"));

  await page.locator('input[name="query"]').fill("iPad Air M3 11 128GB");
  await page.locator("#productForm").evaluate((form) => form.requestSubmit());
  await page.locator(".result-card").waitFor();
  await page.screenshot({ path: screenshotPath });
  await page.locator(".result-card .track-button").click();
  await page.locator("#statusText").filter({ hasText: "已加入追蹤" }).waitFor();

  await page.locator('[data-panel="flightPanel"]').click();
  await page.locator('input[name="departureId"]').fill("台北");
  await page.locator('input[name="arrivalId"]').fill("東京");
  await page.locator('input[name="tripDays"]').fill("5");
  await page.locator("#departurePlaces option").waitFor({ state: "attached" });
  await page.locator("#arrivalPlaces option").waitFor({ state: "attached" });
  await page.locator('input[name="departureId"]').fill("TPE");
  await page.locator('input[name="arrivalId"]').fill("TYO");
  await page.locator("#flightForm").evaluate((form) => form.requestSubmit());
  await page.locator(".result-card h3").filter({ hasText: "TPE-TYO" }).waitFor();

  await page.locator('[data-flight-mode="date_window"]').click();
  await page.locator('input[name="startDate"]').fill("2026-09-01");
  await page.locator('select[name="lookaheadDays"]').selectOption("30");
  await page.locator("#flightForm").evaluate((form) => form.requestSubmit());
  await page.locator(".result-card h3").filter({ hasText: "2026-09-10" }).waitFor();
  await page.locator("#currentYearAverage").filter({ hasText: "9,140" }).waitFor();
  await page.locator("#previousYearAverage").filter({ hasText: "9,860" }).waitFor();
  await page.screenshot({ path: flightScreenshotPath });

  await page.locator('[data-panel="savedPanel"]').click();
  await page.locator(".saved-item").waitFor();
  const layout = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const visible = [...document.querySelectorAll("button, input, select, .tabs, .search-form, .result-card, .flight-year-stats")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
    const overflow = visible
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName.toLowerCase(), text: (element.textContent || "").trim().slice(0, 40), left: Math.round(rect.left), right: Math.round(rect.right) };
      })
      .filter((item) => item.left < -1 || item.right > viewportWidth + 1);
    return {
      viewportWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      overflow,
      savedItems: document.querySelectorAll(".saved-item").length,
      flightResult: document.querySelector(".result-card h3")?.textContent || "",
      yearComparison: `${document.querySelector("#currentYearAverage")?.textContent || ""} / ${document.querySelector("#previousYearAverage")?.textContent || ""}`,
      navigationPosition: getComputedStyle(document.querySelector(".tabs")).position,
      inputFontSize: parseFloat(getComputedStyle(document.querySelector("input")).fontSize),
      hasManifest: Boolean(document.querySelector('link[rel="manifest"]')),
    };
  });
  const dom = await page.content();
  await writeFile(domPath, dom, "utf8");
  const output = {
    ok:
      !layout.overflow.length &&
      layout.documentWidth <= layout.viewportWidth &&
      layout.savedItems === 1 &&
      layout.navigationPosition === "static" &&
      layout.inputFontSize >= 16 &&
      layout.hasManifest &&
      layout.yearComparison.includes("9,140") &&
      layout.yearComparison.includes("9,860"),
    layout,
    screenshotPath,
    flightScreenshotPath,
    domPath,
  };
  console.log(JSON.stringify(output, null, 2));
  if (!output.ok) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
