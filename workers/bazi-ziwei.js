const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Price-Watch-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  ...CORS_HEADERS,
};
const PRICE_WATCH_KV_KEY = "price-watch:watches";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function methodNotAllowed() {
  return json(405, { error: "Method not allowed." });
}

function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function envValue(env, key, fallback = "") {
  const value = env && Object.prototype.hasOwnProperty.call(env, key) ? env[key] : undefined;
  return value === undefined || value === null ? fallback : String(value);
}

function compact(value, fallback = "", maxLength = 220) {
  const text = String(value || fallback)
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLength);
}

function safeErrorMessage(message) {
  return compact(message, "unknown error", 260)
    .replace(/AIza[0-9A-Za-z_-]+/g, "[redacted-google-api-key]")
    .replace(/sk-[0-9A-Za-z_-]+/g, "[redacted-openai-api-key]");
}

function safeId(text, fallback = "watch") {
  const slug = compact(text, "", 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `${fallback}-${Math.random().toString(36).slice(2, 10)}`;
}

function hasPriceWatchAccess(request, env, allowPublicSearch = false) {
  if (allowPublicSearch && envValue(env, "PRICE_WATCH_PUBLIC_SEARCH").toLowerCase() === "true") {
    return true;
  }
  const expected = envValue(env, "PRICE_WATCH_ACCESS_TOKEN");
  if (!expected) return false;
  const authorization = request.headers.get("Authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  const headerToken = request.headers.get("X-Price-Watch-Token") || "";
  return bearer === expected || headerToken === expected;
}

function priceWatchAuthError(env) {
  if (!envValue(env, "PRICE_WATCH_ACCESS_TOKEN")) {
    return json(503, { error: "PRICE_WATCH_ACCESS_TOKEN is not set." });
  }
  return json(401, { error: "Invalid or missing price watch access token." });
}

function normalizeMoney(value) {
  if (value === undefined || value === null) return null;
  const number = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function currencyLabel(currency) {
  const value = compact(currency, "TWD", 10).toUpperCase();
  return value || "TWD";
}

function formatPrice(price, currency = "TWD") {
  if (!Number.isFinite(Number(price))) return "";
  const rounded = Math.round(Number(price));
  if (currencyLabel(currency) === "TWD") return `NT$${rounded.toLocaleString("zh-TW")}`;
  return `${currencyLabel(currency)} ${rounded.toLocaleString("en-US")}`;
}

async function serpApiSearch(params, env) {
  const apiKey = envValue(env, "SERPAPI_API_KEY");
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not set.");
  const url = new URL("https://serpapi.com/search.json");
  Object.entries({ ...params, api_key: apiKey }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `SerpApi request failed with HTTP ${response.status}.`);
  }
  if (data.error) throw new Error(data.error);
  return data;
}

function normalizeShoppingResults(data, currency) {
  return (data.shopping_results || [])
    .map((item) => {
      const price = normalizeMoney(item.extracted_price || item.price);
      if (!price) return null;
      return {
        id: safeId(`${item.source || item.seller || "shop"}-${item.title || ""}-${item.link || ""}`, "product"),
        type: "product",
        title: compact(item.title, "商品", 180),
        source: compact(item.source || item.seller || "Google Shopping", "Google Shopping", 80),
        price,
        priceText: item.price || formatPrice(price, currency),
        currency: currencyLabel(currency),
        link: item.link || item.product_link || "",
        thumbnail: item.thumbnail || "",
        rating: item.rating || "",
        reviews: item.reviews || "",
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.price - right.price)
    .slice(0, 20);
}

function normalizeFlightResults(data, payload, currency) {
  const flights = [...(data.best_flights || []), ...(data.other_flights || [])];
  const route = `${payload.departureId || ""}-${payload.arrivalId || ""}`;
  const items = flights
    .map((item, index) => {
      const price = normalizeMoney(item.price);
      if (!price) return null;
      const firstFlight = Array.isArray(item.flights) ? item.flights[0] || {} : {};
      const lastFlight = Array.isArray(item.flights) ? item.flights[item.flights.length - 1] || {} : {};
      const airline = compact(firstFlight.airline || item.airline || "Flight", "Flight", 80);
      return {
        id: safeId(`${route}-${airline}-${item.price}-${index}`, "flight"),
        type: "flight",
        title: `${route} ${compact(airline, "航班", 60)}`,
        source: "Google Flights",
        price,
        priceText: formatPrice(price, currency),
        currency: currencyLabel(currency),
        link: `https://www.google.com/travel/flights?q=${encodeURIComponent(
          `${payload.departureId || ""} ${payload.arrivalId || ""} ${payload.outboundDate || ""} ${payload.returnDate || ""}`,
        )}`,
        airline,
        duration: item.total_duration || "",
        stops: item.stops ?? "",
        departure: firstFlight.departure_airport?.time || "",
        arrival: lastFlight.arrival_airport?.time || "",
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.price - right.price)
    .slice(0, 20);

  const insights = data.price_insights || {};
  return {
    results: items,
    insights: {
      lowestPrice: normalizeMoney(insights.lowest_price),
      priceLevel: insights.price_level || "",
      typicalPriceRange: insights.typical_price_range || [],
    },
  };
}

function productWatchFromPayload(payload) {
  const name = compact(payload.name || payload.query || payload.title, "商品追蹤", 120);
  const query = compact(payload.query || name, name, 160);
  const currency = currencyLabel(payload.currency);
  return {
    enabled: true,
    id: safeId(payload.id || name, "product"),
    type: "product",
    name,
    currency,
    target_price: normalizeMoney(payload.targetPrice),
    alert_on_new_low: true,
    alert_cooldown_days: 7,
    sources: [
      {
        type: "serpapi_google_shopping",
        id: "google-shopping",
        name: "Google Shopping",
        query,
        gl: compact(payload.gl, "tw", 8),
        hl: compact(payload.hl, "zh-tw", 12),
        currency,
        limit: 8,
      },
    ],
  };
}

function flightWatchFromPayload(payload) {
  const departureId = compact(payload.departureId, "", 8).toUpperCase();
  const arrivalId = compact(payload.arrivalId, "", 8).toUpperCase();
  const outboundDate = compact(payload.outboundDate, "", 16);
  const returnDate = compact(payload.returnDate, "", 16);
  const name = compact(payload.name, `${departureId} 到 ${arrivalId} ${outboundDate}`, 140);
  const currency = currencyLabel(payload.currency);
  const source = {
    type: "serpapi_google_flights",
    id: "google-flights",
    name: "Google Flights",
    departure_id: departureId,
    arrival_id: arrivalId,
    outbound_date: outboundDate,
    currency,
    hl: compact(payload.hl, "zh-tw", 12),
    gl: compact(payload.gl, "tw", 8),
    adults: compact(payload.adults, "1", 4),
    travel_class: compact(payload.travelClass, "1", 4),
  };
  if (returnDate) source.return_date = returnDate;
  return {
    enabled: true,
    id: safeId(payload.id || `${departureId}-${arrivalId}-${outboundDate}-${returnDate}`, "flight"),
    type: "flight",
    name,
    currency,
    target_price: normalizeMoney(payload.targetPrice),
    alert_on_new_low: true,
    alert_cooldown_days: 3,
    sources: [source],
  };
}

function validateWatch(watch) {
  if (!watch || typeof watch !== "object") throw new Error("watch is required.");
  if (!watch.id || !watch.name || !watch.type) throw new Error("watch id, name and type are required.");
  if (!Array.isArray(watch.sources) || !watch.sources.length) throw new Error("watch sources are required.");
  return watch;
}

async function readPriceWatches(env) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.get !== "function") return [];
  const data = await env.PRICE_WATCH_KV.get(PRICE_WATCH_KV_KEY, { type: "json" });
  return Array.isArray(data?.watches) ? data.watches : [];
}

async function writePriceWatches(env, watches) {
  if (!env.PRICE_WATCH_KV || typeof env.PRICE_WATCH_KV.put !== "function") {
    throw new Error("PRICE_WATCH_KV binding is not set.");
  }
  await env.PRICE_WATCH_KV.put(PRICE_WATCH_KV_KEY, JSON.stringify({ watches }, null, 2));
}

async function handlePriceWatchConfig(request, env) {
  if (request.method !== "GET") return methodNotAllowed();
  return json(200, {
    hasSerpApi: Boolean(envValue(env, "SERPAPI_API_KEY")),
    hasKv: Boolean(env.PRICE_WATCH_KV),
    requiresToken: envValue(env, "PRICE_WATCH_PUBLIC_SEARCH").toLowerCase() !== "true",
    publicSearch: envValue(env, "PRICE_WATCH_PUBLIC_SEARCH").toLowerCase() === "true",
  });
}

async function handlePriceWatchSearch(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") return methodNotAllowed();
  if (!hasPriceWatchAccess(request, env, true)) return priceWatchAuthError(env);

  const payload = await request.json().catch(() => ({}));
  const type = compact(payload.type, "product", 20).toLowerCase();
  const currency = currencyLabel(payload.currency);

  if (type === "product") {
    const query = compact(payload.query, "", 160);
    if (!query) return json(400, { error: "query is required." });
    const data = await serpApiSearch(
      {
        engine: "google_shopping",
        q: query,
        gl: compact(payload.gl, "tw", 8),
        hl: compact(payload.hl, "zh-tw", 12),
        currency,
      },
      env,
    );
    return json(200, {
      type: "product",
      query,
      currency,
      results: normalizeShoppingResults(data, currency),
    });
  }

  if (type === "flight") {
    const departureId = compact(payload.departureId, "", 8).toUpperCase();
    const arrivalId = compact(payload.arrivalId, "", 8).toUpperCase();
    const outboundDate = compact(payload.outboundDate, "", 16);
    if (!departureId || !arrivalId || !outboundDate) {
      return json(400, { error: "departureId, arrivalId and outboundDate are required." });
    }
    const data = await serpApiSearch(
      {
        engine: "google_flights",
        departure_id: departureId,
        arrival_id: arrivalId,
        outbound_date: outboundDate,
        return_date: compact(payload.returnDate, "", 16),
        currency,
        hl: compact(payload.hl, "zh-tw", 12),
        gl: compact(payload.gl, "tw", 8),
        adults: compact(payload.adults, "1", 4),
        travel_class: compact(payload.travelClass, "1", 4),
      },
      env,
    );
    return json(200, {
      type: "flight",
      currency,
      ...normalizeFlightResults(data, { ...payload, departureId, arrivalId, outboundDate }, currency),
    });
  }

  return json(400, { error: "Unsupported search type." });
}

async function handlePriceWatchWatches(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (!hasPriceWatchAccess(request, env, false)) return priceWatchAuthError(env);

  if (request.method === "GET") {
    return json(200, { watches: await readPriceWatches(env) });
  }

  if (request.method !== "POST") return methodNotAllowed();
  const payload = await request.json().catch(() => ({}));
  let watch = payload.watch;
  if (!watch && payload.type === "product") watch = productWatchFromPayload(payload);
  if (!watch && payload.type === "flight") watch = flightWatchFromPayload(payload);
  watch = validateWatch(watch);

  const watches = await readPriceWatches(env);
  const withoutExisting = watches.filter((item) => item.id !== watch.id);
  withoutExisting.push(watch);
  await writePriceWatches(env, withoutExisting);
  return json(200, { ok: true, watch, watches: withoutExisting });
}

function list(values, fallback, maxItems = 6) {
  const items = Array.isArray(values)
    ? values.map((item) => compact(item, "", 120)).filter(Boolean)
    : [];
  return (items.length ? items : [fallback]).slice(0, maxItems).join(", ");
}

function imageOutputFormat(env) {
  const format = compact(envValue(env, "IMAGE_OUTPUT_FORMAT", "jpeg"), "jpeg", 12).toLowerCase();
  return ["png", "webp", "jpeg"].includes(format) ? format : "jpeg";
}

function buildPrompt(payload) {
  const method = compact(payload.method, "Chinese astrology", 80);
  const targetGender = compact(payload.targetGender, "adult person", 40);
  const imageGender = compact(payload.imageGender, targetGender, 90);
  const genderReason = compact(payload.genderReason, "", 180);
  const careers = list(payload.careers, "professional, composed, reliable");
  const stars = list(payload.stars, "balanced and refined symbolic traits", 10);
  const reasons = list(payload.reasons, "warm but composed relationship energy", 4);
  const palaces = payload.palaces || {};
  const appearance = payload.appearance || {};
  const details = appearance.details || {};
  const face = compact(appearance.face, "clean facial features with a memorable expression");
  const build = compact(appearance.build, "balanced body type");
  const element = compact(appearance.element, "balanced");
  const height = compact(details.height, "natural adult height", 32);
  const weight = compact(details.weight, "proportional adult weight", 32);
  const bodyRatio = compact(details.bodyRatio, "balanced body proportions", 140);
  const hairColor = compact(details.hairColor, "natural dark hair", 40);
  const hairStyle = compact(details.hairStyle, "clean natural hairstyle", 80);
  const outfit = compact(details.outfit, "modern tasteful everyday outfit", 180);
  const story = compact(details.story, "", 220);
  const notes = list(appearance.notes, "natural confidence, approachable expression", 6);

  return [
    `Create a high-quality photorealistic portrait of a fictional ${imageGender}.`,
    `Astrology method: ${method}. Relationship-presentation note: ${targetGender}${genderReason ? `, ${genderReason}` : ""}.`,
    "The person must be original and not a celebrity, influencer, public figure, or identifiable private person.",
    "Use a tasteful editorial portrait style, natural lighting, realistic skin texture, modern clothing, calm confident expression, half-body framing, neutral background, no text, no watermark, no horoscope symbols.",
    `Appearance direction: ${face}; body direction: ${build}; five-element mood: ${element}.`,
    `Specific body and styling details: about ${height}, ${weight}; body proportions: ${bodyRatio}; hair color: ${hairColor}; hairstyle: ${hairStyle}; outfit preference: ${outfit}.`,
    story ? `Character silhouette story: ${story}.` : "",
    `Personality and styling cues: ${notes}.`,
    `Possible career aura: ${careers}.`,
    `Symbolic references from ${method}, used only as abstract styling guidance: relationship context ${compact(palaces.spouse)}, supporting structure ${compact(palaces.spouseSquare)}, self context ${compact(palaces.life)}, external context ${compact(palaces.travel)}, inner context ${compact(palaces.fortune)}, career context ${compact(palaces.career)}, wealth context ${compact(palaces.wealth)}, origin context ${compact(palaces.cause)}, stars ${stars}.`,
    `Relationship context cues: ${reasons}.`,
    "Do not include explicit content. Do not include more than one person. Do not add labels or captions.",
  ].filter(Boolean).join(" ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function openAIModels(env) {
  const models = unique([
    compact(envValue(env, "OPENAI_IMAGE_MODEL", "gpt-image-2"), "gpt-image-2", 80),
    compact(envValue(env, "OPENAI_FALLBACK_IMAGE_MODEL", "gpt-image-1.5"), "gpt-image-1.5", 80),
  ]).filter((model) => model.startsWith("gpt-image"));
  return models.length ? models : ["gpt-image-2", "gpt-image-1.5"];
}

function geminiModels(env) {
  const models = unique([
    compact(envValue(env, "GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image"), "gemini-3.1-flash-image", 80),
    compact(envValue(env, "GEMINI_FALLBACK_IMAGE_MODEL", "gemini-2.5-flash-image"), "gemini-2.5-flash-image", 80),
  ]).filter((model) => model.startsWith("gemini-"));
  return models.length ? models : ["gemini-3.1-flash-image", "gemini-2.5-flash-image"];
}

function cloudflareModels(env) {
  const models = unique([
    compact(envValue(env, "CLOUDFLARE_IMAGE_MODEL", "@cf/black-forest-labs/flux-1-schnell"), "@cf/black-forest-labs/flux-1-schnell", 120),
  ]).filter((model) => model.startsWith("@cf/"));
  return models.length ? models : ["@cf/black-forest-labs/flux-1-schnell"];
}

function cloudflareSteps(env) {
  const value = Number.parseInt(envValue(env, "CLOUDFLARE_IMAGE_STEPS", "4"), 10);
  if (!Number.isFinite(value)) return 4;
  return Math.max(1, Math.min(value, 8));
}

async function generateWithOpenAI(prompt, model, env) {
  const apiKey = envValue(env, "OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const body = {
    model,
    prompt,
    n: 1,
    size: envValue(env, "IMAGE_SIZE", "1024x1536"),
    quality: envValue(env, "IMAGE_QUALITY", "medium"),
    output_format: imageOutputFormat(env),
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI image generation failed.");
  }

  const image = data.data?.[0];
  if (image?.b64_json) {
    return {
      imageUrl: `data:image/${body.output_format};base64,${image.b64_json}`,
      provider: `OpenAI ${model}`,
    };
  }
  if (image?.url) {
    return {
      imageUrl: image.url,
      provider: `OpenAI ${model}`,
    };
  }

  throw new Error("OpenAI did not return an image.");
}

async function generateWithGemini(prompt, model, env) {
  const apiKey = envValue(env, "GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini image generation failed.");
  }

  const parts = data.candidates?.flatMap((candidate) => candidate.content?.parts || []) || [];
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const inlineData = imagePart?.inlineData || imagePart?.inline_data;

  if (!inlineData?.data) {
    throw new Error("Gemini did not return an image.");
  }

  return {
    imageUrl: `data:${inlineData.mimeType || inlineData.mime_type || "image/png"};base64,${inlineData.data}`,
    provider: `Gemini ${model}`,
  };
}

async function generateWithCloudflare(prompt, model, env) {
  if (!env.AI || typeof env.AI.run !== "function") {
    throw new Error("Cloudflare Workers AI binding AI is not set.");
  }

  const result = await env.AI.run(model, {
    prompt: compact(prompt, "", 2048),
    steps: cloudflareSteps(env),
    seed: Math.floor(Math.random() * 1_000_000_000),
  });
  const image = result?.image || result?.result?.image;
  if (!image) throw new Error("Cloudflare did not return an image.");

  return {
    imageUrl: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`,
    provider: `Cloudflare ${model}`,
  };
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function availableProviders(env) {
  return [
    env?.AI ? "cloudflare" : "",
    envValue(env, "OPENAI_API_KEY") ? "openai" : "",
    envValue(env, "GEMINI_API_KEY") ? "gemini" : "",
  ].filter(Boolean);
}

function providerOrder(env) {
  const provider = compact(envValue(env, "IMAGE_PROVIDER"), "", 20).toLowerCase();
  const available = availableProviders(env);

  if (provider === "openai" || provider === "gemini" || provider === "cloudflare") {
    return available.includes(provider) ? [provider] : [];
  }
  if (provider === "random" && available.length) {
    return shuffle(available);
  }
  return available.length > 1 ? shuffle(available) : available;
}

function providerModels(provider, env) {
  if (provider === "cloudflare") return cloudflareModels(env);
  if (provider === "openai") return openAIModels(env);
  if (provider === "gemini") return geminiModels(env);
  return [];
}

async function generateWithProvider(prompt, provider, model, env) {
  if (provider === "cloudflare") return generateWithCloudflare(prompt, model, env);
  if (provider === "gemini") return generateWithGemini(prompt, model, env);
  if (provider === "openai") return generateWithOpenAI(prompt, model, env);
  throw new Error(`Unsupported provider: ${provider}`);
}

async function generateWithFallback(prompt, env) {
  const attempts = [];
  const failures = [];
  for (const provider of providerOrder(env)) {
    for (const model of providerModels(provider, env)) {
      attempts.push(`${provider}:${model}`);
      try {
        return await generateWithProvider(prompt, provider, model, env);
      } catch (error) {
        failures.push(`${provider}:${model} => ${safeErrorMessage(error.message)}`);
      }
    }
  }

  throw new Error(
    `所有 AI 圖片模型都生成失敗。已嘗試：${attempts.join("、") || "無可用模型"}。錯誤摘要：${failures.join("；") || "無"}`,
  );
}

async function handleGeneratePartnerImage(request, env) {
  if (request.method === "OPTIONS") {
    return corsPreflight();
  }
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json(400, { error: "Invalid JSON body." });
  }

  if (!availableProviders(env).length) {
    return json(500, {
      error: "尚未設定 AI 圖片服務。請確認 wrangler.toml 有 [ai] binding = \"AI\"，或在 Cloudflare Variables and secrets 加入 OPENAI_API_KEY / GEMINI_API_KEY。",
    });
  }

  try {
    const prompt = buildPrompt(payload || {});
    return json(200, await generateWithFallback(prompt, env));
  } catch (error) {
    return json(502, {
      error: error.message || "AI 圖片生成失敗。",
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      url.pathname === "/.netlify/functions/generate-partner-image" ||
      url.pathname === "/api/generate-partner-image"
    ) {
      return handleGeneratePartnerImage(request, env);
    }
    if (url.pathname === "/api/price-watch/config") {
      return handlePriceWatchConfig(request, env);
    }
    if (url.pathname === "/api/price-watch/search") {
      return handlePriceWatchSearch(request, env);
    }
    if (url.pathname === "/api/price-watch/watches") {
      return handlePriceWatchWatches(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
