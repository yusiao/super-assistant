const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
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
    `Chinese astrology gender-expression note: ${targetGender}${genderReason ? `, ${genderReason}` : ""}.`,
    "The person must be original and not a celebrity, influencer, public figure, or identifiable private person.",
    "Use a tasteful editorial portrait style, natural lighting, realistic skin texture, modern clothing, calm confident expression, half-body framing, neutral background, no text, no watermark, no horoscope symbols.",
    `Appearance direction: ${face}; body direction: ${build}; five-element mood: ${element}.`,
    `Specific body and styling details: about ${height}, ${weight}; body proportions: ${bodyRatio}; hair color: ${hairColor}; hairstyle: ${hairStyle}; outfit preference: ${outfit}.`,
    story ? `Character silhouette story: ${story}.` : "",
    `Personality and styling cues: ${notes}.`,
    `Possible career aura: ${careers}.`,
    `Zi Wei symbolic references, used only as abstract styling guidance: spouse palace ${compact(palaces.spouse)}, spouse three-directions/four-correct ${compact(palaces.spouseSquare)}, life palace ${compact(palaces.life)}, travel palace ${compact(palaces.travel)}, fortune palace ${compact(palaces.fortune)}, career palace ${compact(palaces.career)}, wealth palace ${compact(palaces.wealth)}, cause palace ${compact(palaces.cause)}, stars ${stars}.`,
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
    return new Response(null, { status: 204 });
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
    return env.ASSETS.fetch(request);
  },
};
