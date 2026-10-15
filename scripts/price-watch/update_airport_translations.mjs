import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

// Input: Wikidata SPARQL JSON with ?iata and ?name (language-tagged labels).
// Install/download OpenCC separately; conversion tooling is not shipped to the browser.
const root = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const OpenCC = require(resolve(root, process.argv[3] || "tmp/opencc-full.cjs"));
const convert = OpenCC.Converter({ from: "cn", to: "tw" });
const input = process.argv[2];
const query = 'SELECT ?iata ?name WHERE { ?airport wdt:P238 ?iata; rdfs:label ?name. FILTER(LANG(?name) IN ("zh-tw", "zh-hant", "zh-hk", "zh")) }';
const response = input ? null : await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, {
  headers: { Accept: "application/sparql-results+json", "User-Agent": "FlightWatchAirportLocalization/1.0" }, signal: AbortSignal.timeout(90000),
});
if (response && !response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
const data = input ? JSON.parse(await readFile(resolve(root, input), "utf8")) : await response.json();
const catalog = JSON.parse(await readFile(resolve(root, "output/bazi-ziwei/price-watch/airports-data.json"), "utf8"));
const codes = new Set(catalog.airports.map(([code]) => code));
const languages = ["zh-tw", "zh-hant", "zh-hk", "zh"];
const labels = new Map();
for (const row of data.results.bindings) {
  const code = row.iata?.value;
  const rank = languages.indexOf(row.name?.["xml:lang"]);
  const name = convert(row.name?.value || "");
  if (!codes.has(code) || rank < 0 || !/\p{Script=Han}/u.test(name) || name.includes("?")) continue;
  const previous = labels.get(code);
  if (!previous || rank < previous.rank) labels.set(code, { rank, names: new Set([name]) });
  else if (rank === previous.rank) previous.names.add(name);
}
const names = Object.fromEntries([...labels].filter(([, item]) => item.names.size === 1).sort(([a], [b]) => a.localeCompare(b)).map(([code, item]) => [code, [...item.names][0]]));
if (Object.keys(names).length < 2000) throw new Error("Incomplete localization data; existing file was not changed.");
const header = "// Generated from Wikidata Chinese labels (CC0), converted to zh-TW with OpenCC.\n// Refresh with scripts/price-watch/update_airport_translations.mjs.\n";
await writeFile(resolve(root, "output/bazi-ziwei/price-watch/airports-zh.js"), `${header}export default ${JSON.stringify(names, null, 2)};\n`, "utf8");
console.log(`Generated ${Object.keys(names).length} Traditional Chinese airport names.`);
