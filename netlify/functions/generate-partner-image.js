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
  const face = compact(appearance.face, "clean facial features with a memorable expression");
  const build = compact(appearance.build, "balanced body type");
  const element = compact(appearance.element, "balanced");
  const notes = list(appearance.notes, "natural confidence, approachable expression", 6);

  return [
    `Create a high-quality photorealistic portrait of a fictional adult ${targetGender}.`,
    "The person must be original and not a celebrity, influencer, public figure, or identifiable private person.",
    "Use a tasteful editorial portrait style, natural lighting, realistic skin texture, modern clothing, calm confident expression, half-body framing, neutral background, no text, no watermark, no horoscope symbols.",
    `Appearance direction: ${face}; body direction: ${build}; five-element mood: ${element}.`,
    `Personality and styling cues: ${notes}.`,
    `Possible career aura: ${careers}.`,
    `Zi Wei symbolic references, used only as abstract styling guidance: spouse palace ${compact(palaces.spouse)}, spouse three-directions/four-correct ${compact(palaces.spouseSquare)}, life palace ${compact(palaces.life)}, travel palace ${compact(palaces.travel)}, fortune palace ${compact(palaces.fortune)}, career palace ${compact(palaces.career)}, wealth palace ${compact(palaces.wealth)}, cause palace ${compact(palaces.cause)}, stars ${stars}.`,
    `Relationship context cues: ${reasons}.`,
    "Do not include explicit content. Do not include more than one person. Do not add labels or captions.",
  ].join(" ");
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
