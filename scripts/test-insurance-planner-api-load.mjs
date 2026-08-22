import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = new URL(process.env.INSURANCE_LOAD_BASE_URL || "http://localhost:8788");
const users = Math.max(1, Math.min(10_000, Number(process.env.INSURANCE_LOAD_USERS || 100)));
const concurrency = Math.max(1, Math.min(250, Number(process.env.INSURANCE_LOAD_CONCURRENCY || 20)));
const timeoutMs = Math.max(2_000, Math.min(60_000, Number(process.env.INSURANCE_LOAD_TIMEOUT_MS || 20_000)));
const reportPath = resolve(root, process.env.INSURANCE_LOAD_REPORT_PATH || "output/insurance-planner/api-load-report.json");
const loadTestToken = String(process.env.INSURANCE_LOAD_TOKEN || "");
const productionHosts = new Set(["jarvis-insurance-planner.pages.dev"]);
const hostLooksLikeTest = baseUrl.hostname === "localhost"
  || baseUrl.hostname === "127.0.0.1"
  || /(?:^|[.-])(staging|preview|load-test)(?:[.-]|$)/i.test(baseUrl.hostname);

if (process.env.INSURANCE_LOAD_CONFIRM_STAGING !== "YES") {
  throw new Error("Set INSURANCE_LOAD_CONFIRM_STAGING=YES to confirm this is an isolated test environment.");
}
if (productionHosts.has(baseUrl.hostname) || !hostLooksLikeTest) {
  throw new Error(`Refusing to create load-test accounts on non-test host: ${baseUrl.hostname}`);
}
if (users > 5 && !loadTestToken) {
  throw new Error("INSURANCE_LOAD_TOKEN is required for more than five test accounts.");
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))] * 10) / 10;
}

async function apiRequest(path, options = {}) {
  const startedAt = performance.now();
  const response = await fetch(new URL(path, baseUrl), {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      origin: baseUrl.origin,
      ...(loadTestToken ? { "x-insurance-load-test-token": loadTestToken } : {}),
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  return {
    ok: response.ok,
    status: response.status,
    payload,
    cookie: response.headers.get("set-cookie")?.split(";")[0] || "",
    durationMs: performance.now() - startedAt,
  };
}

const runId = randomUUID().replace(/-/g, "").slice(0, 12).toLowerCase();
const latencies = { register: [], write: [], update: [], conflict: [], merge: [], read: [], delete: [] };
const failures = [];
let completed = 0;
let nextUser = 0;

async function runUser(index) {
  const username = `load.${runId}.${String(index).padStart(5, "0")}`;
  const password = `Load-${runId}-${index}-A9!`;
  let cookie = "";
  let accountCreated = false;
  try {
    const registration = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        displayName: `負載測試 ${index}`,
        privacyAccepted: true,
      }),
    });
    latencies.register.push(registration.durationMs);
    if (!registration.ok || !registration.cookie) throw new Error(`register:${registration.status}`);
    cookie = registration.cookie;
    accountCreated = true;

    const data = {
      profile: {
        gender: index % 2 ? "female" : "male",
        age: 18 + (index % 68),
        annualIncome: 900000,
        dependents: index % 4,
        debt: 1000000,
        monthlyBudget: 8000,
        horizon: 20,
        priority: "balanced",
      },
      policies: [{
        id: `load-policy-${index}`,
        owner: "self",
        productCode: "DCE",
        name: "負載測試保單",
        insurer: "全球人壽",
        category: "critical",
        coverage: 1_000_000,
        annualPremium: 12_000,
        endAge: 85,
      }],
      insuredPeople: [{ id: "self", name: "自己", gender: index % 2 ? "female" : "male", currentAge: 18 + (index % 68), occupationClass: 1 }],
      lastPolicyOwner: "self",
      cancerCase: { hasHistory: "no" },
      productCatalog: [],
    };

    const firstWrite = await apiRequest("/api/account/data", {
      method: "PUT",
      headers: { cookie },
      body: JSON.stringify({ data, revision: 0 }),
    });
    latencies.write.push(firstWrite.durationMs);
    if (!firstWrite.ok || firstWrite.payload.revision !== 1) throw new Error(`write:${firstWrite.status}`);

    const remoteData = structuredClone(data);
    remoteData.profile.monthlyBudget += 500;
    const update = await apiRequest("/api/account/data", {
      method: "PUT",
      headers: { cookie },
      body: JSON.stringify({ data: remoteData, revision: 1 }),
    });
    latencies.update.push(update.durationMs);
    if (!update.ok || update.payload.revision !== 2) throw new Error(`update:${update.status}`);

    data.profile.dependents += 1;
    const conflict = await apiRequest("/api/account/data", {
      method: "PUT",
      headers: { cookie },
      body: JSON.stringify({ data, revision: 1 }),
    });
    latencies.conflict.push(conflict.durationMs);
    if (conflict.status !== 409
      || conflict.payload.error !== "sync_conflict"
      || conflict.payload.revision !== 2
      || conflict.payload.data?.profile?.monthlyBudget !== remoteData.profile.monthlyBudget) {
      throw new Error(`conflict:${conflict.status}`);
    }

    const mergedData = structuredClone(conflict.payload.data);
    mergedData.profile.dependents = data.profile.dependents;
    const merge = await apiRequest("/api/account/data", {
      method: "PUT",
      headers: { cookie },
      body: JSON.stringify({ data: mergedData, revision: conflict.payload.revision }),
    });
    latencies.merge.push(merge.durationMs);
    if (!merge.ok || merge.payload.revision !== 3) throw new Error(`merge:${merge.status}`);

    const read = await apiRequest("/api/account/data", { headers: { cookie } });
    latencies.read.push(read.durationMs);
    if (!read.ok
      || read.payload.revision !== 3
      || read.payload.data?.policies?.length !== 1
      || read.payload.data?.profile?.monthlyBudget !== remoteData.profile.monthlyBudget
      || read.payload.data?.profile?.dependents !== data.profile.dependents) {
      throw new Error(`read:${read.status}`);
    }

    const deletion = await apiRequest("/api/account", {
      method: "DELETE",
      headers: { cookie },
      body: JSON.stringify({ password }),
    });
    latencies.delete.push(deletion.durationMs);
    if (!deletion.ok || !deletion.payload.deleted) throw new Error(`delete:${deletion.status}`);
    accountCreated = false;
    completed += 1;
  } catch (error) {
    failures.push({ index, error: error.message });
  } finally {
    if (accountCreated && cookie) {
      await apiRequest("/api/account", {
        method: "DELETE",
        headers: { cookie },
        body: JSON.stringify({ password }),
      }).catch(() => {});
    }
  }
}

async function worker() {
  while (true) {
    const index = nextUser;
    nextUser += 1;
    if (index >= users) return;
    await runUser(index + 1);
  }
}

const startedAt = performance.now();
await Promise.all(Array.from({ length: Math.min(concurrency, users) }, () => worker()));
const durationMs = Math.round((performance.now() - startedAt) * 10) / 10;
const stages = Object.fromEntries(Object.entries(latencies).map(([stage, values]) => [stage, {
  requests: values.length,
  p50Ms: percentile(values, 0.5),
  p95Ms: percentile(values, 0.95),
  p99Ms: percentile(values, 0.99),
  maxMs: percentile(values, 1),
}]));
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  target: baseUrl.origin,
  users,
  concurrency,
  completed,
  failed: failures.length,
  durationMs,
  usersPerSecond: Math.round((completed / Math.max(durationMs / 1000, 0.001)) * 10) / 10,
  stages,
  failureExamples: failures.slice(0, 25),
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
