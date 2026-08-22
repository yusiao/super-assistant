#!/usr/bin/env node

import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const DATA_PATH = new URL("../../car-match/data.js", import.meta.url);
const U_CAR_INDEX_URL = "https://newcar.u-car.com.tw/newcar";
const U_CAR_BASE_URL = "https://newcar.u-car.com.tw";
const REQUEST_DELAY_MS = Number(process.env.CAR_MATCH_FETCH_DELAY_MS || 250);
const MIN_FETCHED_CARS = Number(process.env.CAR_MATCH_MIN_FETCHED_CARS || 120);

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const prune = args.has("--prune") || /^(1|true|yes)$/i.test(process.env.CAR_MATCH_PRUNE || "");

const sourceHeaders = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "zh-TW,zh;q=0.9,en;q=0.6",
  "user-agent": "Mozilla/5.0 (compatible; JarvisDriveBot/1.0; +https://jarvis-drive.pages.dev)"
};

const brandSlugOverrides = {
  "Alfa Romeo": "alfa-romeo",
  "Aston Martin": "astonmartin",
  "Ineos Grenadier": "ineosgrenadier",
  "Land Rover": "landrover",
  "Mercedes-Benz": "mercedes-benz",
  "Rolls-Royce": "rolls-royce",
  "Volkswagen Commercial Vehicles": "volkswagencommercialvehicles"
};

const colors = ["white", "black", "gray", "blue", "red"];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\"",
    eacute: "e",
    Eacute: "E",
    uuml: "u",
    Uuml: "U",
    auml: "a",
    Auml: "A",
    ouml: "o",
    Ouml: "O"
  };

  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => named[name] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return decodeHtml(String(value).replace(/<[^>]*>/g, " "));
}

function normalizeForKey(value = "") {
  return decodeHtml(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function carKey(brand, model) {
  return `${normalizeForKey(brand)}::${normalizeForKey(model)}`;
}

function brandSlug(brand) {
  if (brandSlugOverrides[brand]) return brandSlugOverrides[brand];
  return decodeHtml(brand)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

function brandHome(brand) {
  return `${U_CAR_BASE_URL}/list/${brandSlug(brand)}`;
}

function priceFromText(value = "") {
  const cleaned = decodeHtml(value).replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)(?:\s*[-~\u2013\u2014]\s*(\d+(?:\.\d+)?))?/);
  if (!match) return null;

  return {
    min: Number(match[1]),
    max: match[2] ? Number(match[2]) : Number(match[1]),
    label: match[2] ? `${Number(match[1])}-${Number(match[2])} TWD 10k` : `${Number(match[1])} TWD 10k`
  };
}

function bodyFromSource(model, segment) {
  const text = `${model} ${segment}`.toLowerCase();

  if (/suv|crossover|range rover|defender|wrangler|grenadier|urus|dbx|purosangue|sportage|rav4|x-trail|xforce|forester|outback|vitara|jimny|cx-|tucson|santa fe|kuga|territory|macan|cayenne|gls|xc|ex|ec|2008|3008|5008|mokka|grandland|stelvio|f-pace|evoque|velar|countryman|bentayga|cullinan|eletre|grecale/i.test(text)) return "suv";
  if (/mpv|\bvan\b|mini-?van|cargo|truck|商用車|廂型|caravelle|carnival|staria|alphard|sienna|granvia|hiace|v-class|berlingo|rifter|caddy|tourneo|town ace|j space|veryca|delica|multivan|california|crafter|zinger/i.test(text)) return "mpv";
  if (/wagon|variant|avant|touring|shooting brake|combi|sportback|hatch|swift|ignis|mazda3 5d|fit|picanto|ceed|focus|polo|golf|fabia|scala|v60|corsa|astra|mg4|cooper|aceman/i.test(text)) return "hatch";
  if (/coupe|coup|cabrio|convertible|spider|roadster|targa|gt|artura|vantage|mc20|emira|roma|revuelto|temerario|supra|gr86|brz|mx-5|mustang|911|taycan|panamera|lc|z4|m2|m4|vantage|db12|vanquish|750s|12cilindri/i.test(text)) return "sports";
  if (/sedan|saloon|class|series|altis|camry|crown|civic|sentra|lancer|wrx|mazda3|model 3|octavia|superb|a3|a5|a6|a8|3 series|5 series|7 series|cla|is|es|ls|giulia|ghost|phantom|flying spur|emeya/i.test(text)) return "sedan";

  return "suv";
}

function powerFromSource(model, segment, labels, cc) {
  const text = `${model} ${segment} ${labels} ${cc}`.toLowerCase();
  const electricPattern = /\belectric\b|\bev\b|\be-tron\b|\beq[a-z0-9-]*\b|\bioniq\b|\bmodel [s3xy]\b|\btaycan\b|\bbz4x\b|\burban cruiser\b|\bid\.\d+\b|\bix\d?\b|\bi[457]\b|\bex\d{1,2}\b|\bec40\b|\brz\b|\bsolterra\b|\bleaf\b|\bariya\b|\bmg4\b|\bfolgore\b|\belettrica\b|\bspectre\b|\bmacan electric\b|\baceman\b/;
  const hybridPattern = /hybrid|phev|e:hev|p350|ibrida|mhev|plug-in|temerario|revuelto|urus se|296|prius|eq boost|油電|油電混合|混合動力|插電式|插電混合/;
  const hybridAvailabilityPattern = /corolla cross|corolla altis|rav4|camry|crown|prius|yaris cross|sienta|alphard|sienna|tucson l|santa fe|sportage|sorento|carnival|cr-v|hr-v|zrv|outlander|forester|crosstrek|nx|rx|ux|es|lbx/i;
  const dieselPattern = /diesel|tdi|bluehdi|d4|d5/;

  if (hybridPattern.test(text) || hybridAvailabilityPattern.test(`${model} ${segment}`.toLowerCase())) return "hybrid";
  if (electricPattern.test(text)) return "electric";
  if (dieselPattern.test(text)) return "diesel";
  return "gas";
}

function seatsFromSource(model, body, segment) {
  const text = `${model} ${segment}`.toLowerCase();
  if (/a380 winmax|商用車|cargo|truck|veryca|crafter/.test(text)) return 2;
  if (/maybach gls/.test(text)) return 5;
  if (/7-seater|allspace|alphard|sienna|granvia|hiace|v-class|carnival|sorento|ev9|glb|gls|x7|lx|gx|kodiaq|defender 110|defender 130|discovery|land cruiser|ex90|xc90|5008|rifter|berlingo|staria|caravelle|multivan|tourneo|caddy|delica/i.test(text)) return 7;
  if (body === "mpv") return 7;
  if (/roadster|spider|mx-5|z4|mc20|emira|vantage|artura|750s|gts|vanquish|12cilindri/i.test(text)) return 2;
  if (body === "sports") return 4;
  return 5;
}

function prioritiesFor(body, power) {
  if (body === "sports") return ["driving", "design", "tech"];
  if (body === "mpv") return ["space", "comfort", "value"];
  if (power === "electric") return ["tech", "economy", "comfort"];
  if (power === "hybrid") return ["economy", "comfort", "tech"];
  if (body === "hatch") return ["city", "design", "value"];
  if (body === "sedan") return ["comfort", "driving", "design"];
  return ["space", "comfort", "tech"];
}

function normalizeCarShape(car) {
  const body = car.body || "suv";
  const power = car.power || "gas";
  const brand = car.brand || String(car.name || "").split(" ")[0];
  const model = car.name?.startsWith(`${brand} `) ? car.name.slice(brand.length + 1) : car.name;

  return {
    brand,
    name: car.name || `${brand} ${model}`,
    variant: car.variant || "Taiwan new-car catalog",
    price: Number(car.price),
    priceLabel: car.priceLabel || `from ${Number(car.price)} TWD 10k`,
    body,
    power,
    seats: Number(car.seats || 5),
    priorities: Array.isArray(car.priorities) && car.priorities.length ? car.priorities : prioritiesFor(body, power),
    colors: Array.isArray(car.colors) && car.colors.length ? car.colors : [...colors],
    tagline: car.tagline || `${brand} ${model}: tracked in Taiwan new-car catalog.`,
    note: car.note || "Added by the monthly catalog updater. Final availability, equipment, and prices should be checked with the Taiwan distributor.",
    imageUrl: car.imageUrl || "",
    url: car.url || brandHome(brand),
    sourceUrl: car.sourceUrl || "",
    source: car.source || "manual"
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      headers: sourceHeaders,
      signal: controller.signal,
      redirect: "follow"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function loadCurrentData() {
  const code = await fs.readFile(DATA_PATH, "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: "output/car-match/data.js" });

  return {
    cars: Array.isArray(context.window.JARVIS_MARKET_CARS) ? context.window.JARVIS_MARKET_CARS.map(normalizeCarShape) : [],
    brands: context.window.JARVIS_BRANDS || {},
    meta: context.window.JARVIS_DATA_META || {}
  };
}

function extractBrands(html) {
  const makeSelect = html.match(/<select[^>]+id="makeselect"[\s\S]*?<\/select>/i)?.[0] || html;
  const optionRegex = /<option\s+value="(\d+)"(?![^>]*data-make)[^>]*>([\s\S]*?)<\/option>/gi;
  const brands = [];
  const seen = new Set();

  for (const match of makeSelect.matchAll(optionRegex)) {
    const id = match[1];
    const name = stripTags(match[2]);
    if (!name || id === "0" || /^\d+$/.test(name)) continue;
    const key = normalizeForKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    brands.push({ id, name, slug: brandSlug(name) });
  }

  return brands;
}

function extractCarsFromBrandPage(html, expectedBrand) {
  const cars = [];
  const blockRegex = /<div class="cell_topic_new">([\s\S]*?)<!--end cell_topic_new-->/gi;

  for (const blockMatch of html.matchAll(blockRegex)) {
    const block = blockMatch[1];
    const identity = block.match(/data-make="([^"]+)"\s+data-model="([^"]+)"\s+data-id="([^"]+)"/i);
    if (!identity) continue;

    const brand = decodeHtml(identity[1]) || expectedBrand;
    const model = decodeHtml(identity[2]);
    const href = decodeHtml(block.match(/<a\s+href="([^"]+\/overall)"/i)?.[1] || "");
    const sourceUrl = href ? new URL(href, U_CAR_BASE_URL).toString() : brandHome(brand);
    const imagePath = decodeHtml(block.match(/<img[^>]+(?:data-src|data-original|src)="([^"]+)"/i)?.[1] || "");
    const imageUrl = imagePath ? new URL(imagePath, U_CAR_BASE_URL).toString() : "";
    const segment = stripTags(block.match(/<p class="tag_blue_new">([\s\S]*?)<\/p>/i)?.[1] || "");
    const cc = stripTags(block.match(/<p class="cc">\s*([\s\S]*?)\s*<\/p>/i)?.[1] || "");
    const labelTexts = [...block.matchAll(/<p class="label">([\s\S]*?)<\/p>/gi)].map(match => stripTags(match[1])).join(" ");
    const priceText = stripTags(block.match(/<p class="price_number">\s*<strong>([\s\S]*?)<\/strong>/i)?.[1] || "");
    const price = priceFromText(priceText);
    if (!price || !Number.isFinite(price.min) || price.min <= 0) continue;

    const body = bodyFromSource(model, segment);
    const power = powerFromSource(model, segment, labelTexts, cc);
    const seats = seatsFromSource(model, body, segment);

    cars.push(normalizeCarShape({
      brand,
      name: `${brand} ${model}`,
      variant: "U-CAR new-car catalog",
      price: price.min,
      priceLabel: price.label,
      body,
      power,
      seats,
      priorities: prioritiesFor(body, power),
      colors,
      tagline: `${model}: synced from Taiwan new-car catalog.`,
      note: `${segment || "Taiwan new-car listing"}; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.`,
      imageUrl,
      url: sourceUrl,
      sourceUrl,
      source: "ucar"
    }));
  }

  return cars;
}

function mergeCars(currentCars, fetchedCars, { pruneMissing }) {
  const currentByKey = new Map(currentCars.map(car => {
    const model = car.name?.startsWith(`${car.brand} `) ? car.name.slice(car.brand.length + 1) : car.name;
    return [carKey(car.brand, model), car];
  }));
  const merged = [];
  const seen = new Set();

  for (const fetched of fetchedCars) {
    const model = fetched.name.slice(fetched.brand.length + 1);
    const key = carKey(fetched.brand, model);
    const existing = currentByKey.get(key);
    merged.push(normalizeCarShape({
      ...(existing || {}),
      ...fetched,
      tagline: fetched.tagline,
      note: fetched.note,
      colors: existing?.colors || fetched.colors,
      priorities: fetched.priorities,
      source: "ucar"
    }));
    seen.add(key);
  }

  if (!pruneMissing) {
    for (const current of currentCars) {
      const model = current.name?.startsWith(`${current.brand} `) ? current.name.slice(current.brand.length + 1) : current.name;
      const key = carKey(current.brand, model);
      if (!seen.has(key)) merged.push(normalizeCarShape({ ...current, source: current.source || "manual-carry" }));
    }
  }

  return merged.sort((a, b) => a.brand.localeCompare(b.brand, "en") || a.price - b.price || a.name.localeCompare(b.name, "en"));
}

function mergeBrandProfiles(existingProfiles, cars) {
  const profiles = { ...existingProfiles };
  const brands = [...new Set(cars.map(car => car.brand))].sort((a, b) => a.localeCompare(b, "en"));

  for (const brand of brands) {
    if (profiles[brand]) {
      profiles[brand] = { ...profiles[brand], source: profiles[brand].source || brandHome(brand) };
      continue;
    }

    profiles[brand] = {
      name: brand,
      monogram: brand.split(/\s|-/).filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || brand[0],
      origin: "Taiwan new-car catalog",
      chapter: `${brand} is currently listed in Taiwan's new-car market.`,
      story: `${brand} appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.`,
      position: "Taiwan-market listed brand",
      positioning: "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
      keywords: ["Taiwan market", "monthly update", "new cars"],
      source: brandHome(brand)
    };
  }

  return profiles;
}

function createDataFile({ cars, brands, meta }) {
  const serializableCars = cars.map(car => {
    const clean = { ...normalizeCarShape(car) };
    if (!clean.imageUrl) delete clean.imageUrl;
    if (!clean.sourceUrl) delete clean.sourceUrl;
    if (!clean.source) delete clean.source;
    return clean;
  });

  return `(function () {
  const colors = ${JSON.stringify(colors)};
  const prioritiesFor = (body, power) => {
    if (body === "sports") return ["driving", "design", "tech"];
    if (body === "mpv") return ["space", "comfort", "value"];
    if (power === "electric") return ["tech", "economy", "comfort"];
    if (power === "hybrid") return ["economy", "comfort", "tech"];
    if (body === "hatch") return ["city", "design", "value"];
    if (body === "sedan") return ["comfort", "driving", "design"];
    return ["space", "comfort", "tech"];
  };
  const C = car => ({
    ...car,
    priorities: car.priorities || prioritiesFor(car.body, car.power),
    colors: car.colors || [...colors]
  });

  window.JARVIS_MARKET_CARS = ${JSON.stringify(serializableCars, null, 2)}.map(C);

  window.JARVIS_BRANDS = ${JSON.stringify(brands, null, 2)};

  window.JARVIS_DATA_META = ${JSON.stringify(meta, null, 2)};
})();
`;
}

async function main() {
  const current = await loadCurrentData();
  console.log(`Current catalog: ${current.cars.length} cars`);

  const indexHtml = await fetchText(U_CAR_INDEX_URL);
  const brands = extractBrands(indexHtml);
  if (!brands.length) throw new Error("Could not extract U-CAR brand list.");
  console.log(`U-CAR brands: ${brands.length}`);

  const fetchedCars = [];
  const failedBrands = [];

  for (const [index, brand] of brands.entries()) {
    const url = `${U_CAR_BASE_URL}/list/${brand.slug}`;
    try {
      const html = await fetchText(url);
      const cars = extractCarsFromBrandPage(html, brand.name);
      fetchedCars.push(...cars);
      console.log(`[${index + 1}/${brands.length}] ${brand.name}: ${cars.length}`);
    } catch (error) {
      failedBrands.push({ brand: brand.name, message: error.message });
      console.warn(`[${index + 1}/${brands.length}] ${brand.name}: failed - ${error.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const uniqueFetched = [...new Map(fetchedCars.map(car => {
    const model = car.name.slice(car.brand.length + 1);
    return [carKey(car.brand, model), car];
  })).values()];

  if (uniqueFetched.length < MIN_FETCHED_CARS) {
    throw new Error(`Fetched only ${uniqueFetched.length} cars. Refusing to update because minimum is ${MIN_FETCHED_CARS}.`);
  }

  const mergedCars = mergeCars(current.cars, uniqueFetched, { pruneMissing: prune });
  const added = mergedCars.filter(car => {
    const model = car.name.slice(car.brand.length + 1);
    return !current.cars.some(existing => {
      const existingModel = existing.name?.startsWith(`${existing.brand} `) ? existing.name.slice(existing.brand.length + 1) : existing.name;
      return carKey(existing.brand, existingModel) === carKey(car.brand, model);
    });
  });
  const removed = prune ? current.cars.filter(existing => {
    const existingModel = existing.name?.startsWith(`${existing.brand} `) ? existing.name.slice(existing.brand.length + 1) : existing.name;
    return !uniqueFetched.some(car => {
      const model = car.name.slice(car.brand.length + 1);
      return carKey(car.brand, model) === carKey(existing.brand, existingModel);
    });
  }) : [];

  const brandProfiles = mergeBrandProfiles(current.brands, mergedCars);
  const meta = {
    sourceName: "U-CAR new-car catalog",
    sourceUrl: U_CAR_INDEX_URL,
    updatedAt: new Date().toISOString(),
    updateCadence: "monthly",
    fetchedBrands: brands.length,
    fetchedCars: uniqueFetched.length,
    publishedCars: mergedCars.length,
    pruneMissing: prune,
    failedBrands
  };

  const output = createDataFile({ cars: mergedCars, brands: brandProfiles, meta });

  console.log(`Fetched unique cars: ${uniqueFetched.length}`);
  console.log(`Published cars: ${mergedCars.length}`);
  console.log(`Added: ${added.length}`);
  console.log(`Removed: ${removed.length}`);
  if (failedBrands.length) console.warn(`Failed brands: ${failedBrands.map(item => item.brand).join(", ")}`);

  if (dryRun) {
    console.log("Dry run enabled; data.js was not changed.");
    return;
  }

  await fs.writeFile(DATA_PATH, output, "utf8");
  console.log(`Updated ${DATA_PATH.pathname}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

export {
  bodyFromSource,
  brandSlug,
  extractBrands,
  extractCarsFromBrandPage,
  mergeBrandProfiles,
  mergeCars,
  normalizeForKey,
  powerFromSource,
  priceFromText,
  seatsFromSource
};
