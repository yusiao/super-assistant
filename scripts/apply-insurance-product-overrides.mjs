import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyInsuranceProductOverrides } from "./insurance-product-overrides.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = [
  resolve(root, "output/insurance-planner/products.json"),
  resolve(root, "output/insurance-planner-cloudflare/products.json"),
];

for (const path of paths) {
  const payload = JSON.parse(readFileSync(path, "utf8"));
  payload.products = applyInsuranceProductOverrides(payload.products || []);
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Applied insurance product overrides to ${path}`);
}
