import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configuredPath = (name, fallback) => resolve(root, process.env[name] || fallback);
const feedPath = configuredPath("INSURANCE_MONITOR_FEED_PATH", "data/insurance/products-finfo-feed.json");
const discoveryReportPath = configuredPath("INSURANCE_MONITOR_DISCOVERY_PATH", "data/insurance/finfo-discovery-report.json");
const statePath = configuredPath("INSURANCE_MONITOR_STATE_PATH", "data/insurance/catalog-monitor-state.json");
const reportPath = configuredPath("INSURANCE_MONITOR_REPORT_PATH", "data/insurance/catalog-monitor-report.json");
const summaryPath = configuredPath("INSURANCE_MONITOR_SUMMARY_PATH", "data/insurance/catalog-monitor-summary.md");

const MIN_POPULARITY = Math.max(1, Number(process.env.INSURANCE_POPULARITY_MIN || 10));
const MIN_POPULARITY_INCREASE = Math.max(1, Number(process.env.INSURANCE_POPULARITY_INCREASE || 10));
const POPULARITY_GROWTH_RATIO = Math.max(1, Number(process.env.INSURANCE_POPULARITY_GROWTH_RATIO || 1.5));

function readJson(path, fallback = {}) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[\s\-_/／]+/g, "");
}

function productKey(product) {
  return `${String(product.insurer || "").trim()}|${normalizeCode(product.code)}`;
}

function snapshotProduct(product) {
  return {
    code: normalizeCode(product.code),
    name: String(product.name || "").trim(),
    insurer: String(product.insurer || "").trim(),
    saleStatus: product.saleStatus || "unknown",
    rateStatus: product.rateStatus || "missing",
    popularity: Math.max(0, Number(product.popularity) || 0),
    effectiveDate: product.effectiveDate || "",
    sourceUrl: product.sourceUrl || "",
  };
}

function productLabel(product) {
  return `${product.insurer || "保險公司待確認"} ${product.code} ${product.name || "商品名稱待確認"}`.trim();
}

function markdownProduct(product) {
  const label = productLabel(product).replace(/[\[\]]/g, "");
  return /^https:\/\/finfo\.tw\/products\//i.test(product.sourceUrl || "")
    ? `[${label}](${product.sourceUrl})`
    : label;
}

const feed = readJson(feedPath, { products: [] });
const discovery = readJson(discoveryReportPath, {});
const previousState = readJson(statePath, { products: {} });
const products = Array.isArray(feed.products) ? feed.products : [];
const currentProducts = Object.fromEntries(products.map((product) => {
  const snapshot = snapshotProduct(product);
  return [productKey(snapshot), snapshot];
}));
const previousProducts = previousState.products && typeof previousState.products === "object"
  ? previousState.products
  : {};
const hasBaseline = Boolean(previousState.updatedAt && Object.keys(previousProducts).length);
const alerts = [];

if (hasBaseline) {
  for (const [key, current] of Object.entries(currentProducts)) {
    const previous = previousProducts[key];
    if (!previous) {
      if (current.saleStatus === "active") alerts.push({ type: "new_active_product", current });
      continue;
    }
    if (current.saleStatus !== previous.saleStatus) {
      alerts.push({ type: "sale_status_changed", current, previous });
    }
    const increase = current.popularity - Number(previous.popularity || 0);
    const ratio = current.popularity / Math.max(1, Number(previous.popularity || 0));
    if (current.popularity >= MIN_POPULARITY
      && increase >= MIN_POPULARITY_INCREASE
      && ratio >= POPULARITY_GROWTH_RATIO) {
      alerts.push({ type: "popularity_spike", current, previous, increase, ratio });
    }
    if (previous.rateStatus === "ready" && current.rateStatus !== "ready") {
      alerts.push({ type: "rate_data_regression", current, previous });
    }
  }
  for (const [key, previous] of Object.entries(previousProducts)) {
    if (!currentProducts[key]) alerts.push({ type: "product_missing_from_feed", previous });
  }
}

const requestedCodes = Math.max(0, Number(discovery.requestedCodes) || 0);
const unresolvedCodes = Array.isArray(discovery.unresolvedCodes) ? discovery.unresolvedCodes : [];
const unresolvedRatio = requestedCodes ? unresolvedCodes.length / requestedCodes : 0;
if (hasBaseline && requestedCodes >= 10 && unresolvedRatio >= 0.25) {
  alerts.push({
    type: "discovery_failure_spike",
    requestedCodes,
    unresolvedCount: unresolvedCodes.length,
    unresolvedExamples: unresolvedCodes.slice(0, 10),
  });
}

const now = new Date().toISOString();
const report = {
  schemaVersion: 1,
  generatedAt: now,
  baselineCreated: !hasBaseline,
  thresholds: {
    minPopularity: MIN_POPULARITY,
    minPopularityIncrease: MIN_POPULARITY_INCREASE,
    popularityGrowthRatio: POPULARITY_GROWTH_RATIO,
  },
  monitoredProducts: Object.keys(currentProducts).length,
  requestedCodes,
  unresolvedCount: unresolvedCodes.length,
  alerts,
};

const lines = [
  "# 保管商品資料監測",
  "",
  `更新時間：${now}`,
  `監測完整商品：${report.monitoredProducts} 筆；本次查詢 ${requestedCodes} 個代號，失敗 ${unresolvedCodes.length} 個。`,
  "",
];

if (!hasBaseline) {
  lines.push("首次執行已建立比較基準，本次不發送異動警示。");
} else if (!alerts.length) {
  lines.push("本週沒有達到通知門檻的新增、停售、熱度突增或費率資料退化。");
} else {
  lines.push(`## 警示（${alerts.length}）`, "");
  for (const alert of alerts) {
    if (alert.type === "new_active_product") {
      lines.push(`- 新增現售商品：${markdownProduct(alert.current)}`);
    } else if (alert.type === "sale_status_changed") {
      lines.push(`- 銷售狀態變更：${markdownProduct(alert.current)}，${alert.previous.saleStatus} → ${alert.current.saleStatus}`);
    } else if (alert.type === "popularity_spike") {
      lines.push(`- Finfo 近月採用明顯增加：${markdownProduct(alert.current)}，${alert.previous.popularity} → ${alert.current.popularity}`);
    } else if (alert.type === "rate_data_regression") {
      lines.push(`- 費率資料退化：${markdownProduct(alert.current)}，${alert.previous.rateStatus} → ${alert.current.rateStatus}`);
    } else if (alert.type === "product_missing_from_feed") {
      lines.push(`- 商品從完整資料中消失：${markdownProduct(alert.previous)}`);
    } else if (alert.type === "discovery_failure_spike") {
      lines.push(`- 商品抓取失敗比例偏高：${alert.unresolvedCount}/${alert.requestedCodes}`);
    }
  }
}

const summary = `${lines.join("\n")}\n`;
writeJson(reportPath, report);
writeText(summaryPath, summary);
writeJson(statePath, {
  schemaVersion: 1,
  updatedAt: now,
  products: currentProducts,
});

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `has_alerts=${alerts.length ? "true" : "false"}\nalert_count=${alerts.length}\n`, "utf8");
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary, "utf8");

console.log(summary.trim());
