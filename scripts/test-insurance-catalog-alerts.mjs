import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tempRoot = mkdtempSync(resolve(tmpdir(), "insurance-catalog-monitor-"));
const feedPath = resolve(tempRoot, "feed.json");
const discoveryPath = resolve(tempRoot, "discovery.json");
const statePath = resolve(tempRoot, "state.json");
const reportPath = resolve(tempRoot, "report.json");
const summaryPath = resolve(tempRoot, "summary.md");
const monitorPath = resolve(root, "scripts/check-insurance-catalog-alerts.mjs");

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runMonitor() {
  execFileSync(process.execPath, [monitorPath], {
    cwd: root,
    stdio: "pipe",
    env: {
      ...process.env,
      INSURANCE_MONITOR_FEED_PATH: feedPath,
      INSURANCE_MONITOR_DISCOVERY_PATH: discoveryPath,
      INSURANCE_MONITOR_STATE_PATH: statePath,
      INSURANCE_MONITOR_REPORT_PATH: reportPath,
      INSURANCE_MONITOR_SUMMARY_PATH: summaryPath,
      INSURANCE_POPULARITY_MIN: "10",
      INSURANCE_POPULARITY_INCREASE: "10",
      INSURANCE_POPULARITY_GROWTH_RATIO: "1.5",
    },
  });
  return JSON.parse(readFileSync(reportPath, "utf8"));
}

const product = {
  code: "TEST1",
  name: "監測測試商品",
  insurer: "測試人壽",
  saleStatus: "active",
  rateStatus: "ready",
  popularity: 10,
  sourceUrl: "https://finfo.tw/products/TEST1-test-2026-01-01",
};

try {
  writeJson(feedPath, { products: [product] });
  writeJson(discoveryPath, { requestedCodes: 20, unresolvedCodes: [] });
  const baseline = runMonitor();
  assert.equal(baseline.baselineCreated, true);
  assert.equal(baseline.alerts.length, 0);

  writeJson(feedPath, { products: [{ ...product, popularity: 30, saleStatus: "discontinued" }] });
  const changed = runMonitor();
  assert.equal(changed.baselineCreated, false);
  assert.ok(changed.alerts.some((alert) => alert.type === "popularity_spike"));
  assert.ok(changed.alerts.some((alert) => alert.type === "sale_status_changed"));
  assert.match(readFileSync(summaryPath, "utf8"), /Finfo 近月採用明顯增加/);
  console.log("insurance catalog alert checks passed");
} finally {
  if (tempRoot.startsWith(resolve(tmpdir()))) rmSync(tempRoot, { recursive: true, force: true });
}
