const ALLOWED_HOSTS = new Set(["www.leju.com.tw", "leju.com.tw"]);

function getBearerToken(event) {
  const auth = event.headers.authorization || event.headers.Authorization || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return event.headers["x-proxy-token"] || event.headers["X-Proxy-Token"] || "";
}

function isCloudflareChallenge(html) {
  const lower = String(html || "").toLowerCase();
  return (
    (lower.includes("just a moment") && lower.includes("challenges.cloudflare.com")) ||
    lower.includes("cf-chl") ||
    lower.includes("cf_clearance")
  );
}

exports.handler = async function handler(event) {
  const expectedToken = process.env.LEJU_FETCH_PROXY_TOKEN || "";
  if (expectedToken && getBearerToken(event) !== expectedToken) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const target = event.queryStringParameters && event.queryStringParameters.url;
  if (!target) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Missing url query parameter" }),
    };
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Invalid url" }),
    };
  }

  if (targetUrl.protocol !== "https:" || !ALLOWED_HOSTS.has(targetUrl.hostname)) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Only Leju HTTPS URLs are allowed" }),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(targetUrl.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Referer: "https://www.leju.com.tw/",
      },
    });
    const html = await response.text();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          error: `Leju returned HTTP ${response.status}`,
          status: response.status,
          finalUrl: response.url,
        }),
      };
    }

    if (isCloudflareChallenge(html)) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          error: "Leju returned Cloudflare challenge",
          status: response.status,
          finalUrl: response.url,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        html,
        status: response.status,
        finalUrl: response.url,
      }),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: String(error && error.message ? error.message : error) }),
    };
  } finally {
    clearTimeout(timeout);
  }
};
