import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const workspaceApp = new URL("../output/real-estate-guide/app.js", import.meta.url);
const repositoryApp = new URL("../real-estate-guide/app.js", import.meta.url);
const source = readFileSync(existsSync(workspaceApp) ? workspaceApp : repositoryApp, "utf8");
const start = source.indexOf("const syntheticPersonaTypes =");
const end = source.indexOf("function initSyntheticSimulation()", start);

assert.ok(start >= 0 && end > start, "simulation source block should exist");

const context = {
  console,
  Date,
  Math,
  Set,
  Uint32Array,
  window: { crypto: { getRandomValues: (values) => values.fill(123456789) } },
  document: {
    querySelector(selector) {
      if ([
        ".lesson-progress-summary",
        "#materialSearchInput",
        "[data-digest-page]",
        "#planImage",
        "#plannerNoImage"
      ].includes(selector)) return {};
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "#loanForm input") return { length: 5 };
      if (selector === "#sources a") return { length: 4 };
      return { length: 0 };
    }
  }
};

vm.createContext(context);
vm.runInContext(`
  const coachProfiles = [
    { id: "first-home" },
    { id: "pre-sale" },
    { id: "upgrade-home" },
    { id: "experienced" },
    { id: "renovation" }
  ];
  ${source.slice(start, end)}
  globalThis.runTest = runSyntheticLearningSimulation;
`, context);

const report = context.runTest(1000, 20260822);

assert.equal(report.count, 1000);
assert.equal(report.results.length, 1000);
assert.equal(report.summary.genders["女性"], 500);
assert.equal(report.summary.genders["男性"], 500);
assert.ok(report.results.every((item) => item.age >= 26 && item.age <= 40));
assert.ok(report.results.every((item) => item.completion >= 0 && item.completion <= 100));
assert.ok(Object.keys(report.summary.roleCounts).includes("首購小白"));
assert.ok(Object.keys(report.summary.roleCounts).includes("房地產專家"));
assert.ok(Object.values(report.summary.roleCounts).every((count) => count > 0));

console.log(JSON.stringify({
  status: "passed",
  count: report.count,
  genders: report.summary.genders,
  ages: [report.summary.ageMin, report.summary.ageMax],
  roles: report.summary.roleCounts,
  averageCompletion: report.summary.averageCompletion,
  topFrictions: Object.entries(report.summary.frictionCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
}, null, 2));
