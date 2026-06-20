const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
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

function imageOutputFormat() {
  const format = compact(process.env.IMAGE_OUTPUT_FORMAT, "jpeg", 12).toLowerCase();
  return ["png", "webp", "jpeg"].includes(format) ? format : "jpeg";
}

function buildPrompt(payload) {
  const targetGender = compact(payload.targetGender, "adult person", 40);
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
    `Create a high-quality photorealistic portrait of a fictional adult ${targetGender}.`,
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

function openAIModels() {
  const models = unique([
    compact(process.env.OPENAI_IMAGE_MODEL, "gpt-image-2", 80),
    compact(process.env.OPENAI_FALLBACK_IMAGE_MODEL, "gpt-image-1.5", 80),
  ]).filter((model) => model.startsWith("gpt-image"));
  return models.length ? models : ["gpt-image-2", "gpt-image-1.5"];
}

function geminiModels() {
  const models = unique([
    compact(process.env.GEMINI_IMAGE_MODEL, "gemini-3.1-flash-image", 80),
    compact(process.env.GEMINI_FALLBACK_IMAGE_MODEL, "gemini-2.5-flash-image", 80),
  ]).filter((model) => model.startsWith("gemini-"));
  return models.length ? models : ["gemini-3.1-flash-image", "gemini-2.5-flash-image"];
}

function cloudflareModels() {
  const models = unique([
    compact(process.env.CLOUDFLARE_IMAGE_MODEL, "@cf/black-forest-labs/flux-1-schnell", 120),
  ]).filter((model) => model.startsWith("@cf/"));
  return models.length ? models : ["@cf/black-forest-labs/flux-1-schnell"];
}

function cloudflareSteps() {
  const value = Number.parseInt(process.env.CLOUDFLARE_IMAGE_STEPS || "4", 10);
  if (!Number.isFinite(value)) return 4;
  return Math.max(1, Math.min(value, 8));
}

async function generateWithOpenAI(prompt, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const body = {
    model,
    prompt,
    n: 1,
    size: process.env.IMAGE_SIZE || "1024x1536",
  };

  if (model.startsWith("gpt-image")) {
    body.quality = process.env.IMAGE_QUALITY || "medium";
    body.output_format = imageOutputFormat();
  } else {
    body.response_format = "b64_json";
  }

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
    const mime = model.startsWith("gpt-image") ? `image/${body.output_format}` : "image/png";
    return {
      imageUrl: `data:${mime};base64,${image.b64_json}`,
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

async function generateWithGemini(prompt, model) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error?.message || "Gemini image generation failed.";
    throw new Error(message);
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

async function generateWithCloudflare(prompt, model) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) throw new Error("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set.");

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: compact(prompt, "", 2048),
      steps: cloudflareSteps(),
    }),
  });
  const contentType = response.headers.get("content-type") || "";

  if (contentType.startsWith("image/")) {
    const buffer = await response.arrayBuffer();
    const image = Buffer.from(buffer).toString("base64");
    return {
      imageUrl: `data:${contentType};base64,${image}`,
      provider: `Cloudflare ${model}`,
    };
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const message = data.errors?.map((error) => error.message).join("; ")
      || data.error?.message
      || "Cloudflare image generation failed.";
    throw new Error(message);
  }

  const image = data.result?.image || data.image || data.result?.data;
  if (!image) throw new Error("Cloudflare did not return an image.");

  return {
    imageUrl: `data:image/jpeg;base64,${image}`,
    provider: `Cloudflare ${model}`,
  };
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function availableProviders() {
  return [
    process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN ? "cloudflare" : "",
    process.env.OPENAI_API_KEY ? "openai" : "",
    process.env.GEMINI_API_KEY ? "gemini" : "",
  ].filter(Boolean);
}

function providerOrder() {
  const provider = compact(process.env.IMAGE_PROVIDER, "", 20).toLowerCase();
  const available = availableProviders();

  if (provider === "openai" || provider === "gemini" || provider === "cloudflare") {
    return available.includes(provider) ? [provider] : [];
  }
  if (provider === "random" && available.length) {
    return shuffle(available);
  }
  return available.length > 1 ? shuffle(available) : available;
}

function providerModels(provider) {
  if (provider === "cloudflare") return cloudflareModels();
  if (provider === "openai") return openAIModels();
  if (provider === "gemini") return geminiModels();
  return [];
}

async function generateWithProvider(prompt, provider, model) {
  if (provider === "cloudflare") return generateWithCloudflare(prompt, model);
  if (provider === "gemini") return generateWithGemini(prompt, model);
  if (provider === "openai") return generateWithOpenAI(prompt, model);
  throw new Error(`Unsupported provider: ${provider}`);
}

async function generateWithFallback(prompt) {
  const attempts = [];
  const failures = [];
  for (const provider of providerOrder()) {
    for (const model of providerModels(provider)) {
      attempts.push(`${provider}:${model}`);
      try {
        return await generateWithProvider(prompt, provider, model);
      } catch (error) {
        const message = safeErrorMessage(error.message);
        failures.push(`${provider}:${model} => ${message}`);
        console.warn(`Image generation failed for ${provider}:${model}`, message);
      }
    }
  }

  throw new Error(
    `所有 AI 圖片模型都生成失敗。已嘗試：${attempts.join("、") || "無可用模型"}。錯誤摘要：${failures.join("；") || "無"}`,
  );
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON body." });
  }

  if (!availableProviders().length) {
    return json(500, {
      error: "尚未設定 AI 圖片 API key。請在 Netlify 環境變數加入 CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN，或 OPENAI_API_KEY / GEMINI_API_KEY。",
    });
  }

  try {
    const prompt = buildPrompt(payload);
    const result = await generateWithFallback(prompt);

    return json(200, result);
  } catch (error) {
    return json(502, {
      error: error.message || "AI 圖片生成失敗。",
    });
  }
};
