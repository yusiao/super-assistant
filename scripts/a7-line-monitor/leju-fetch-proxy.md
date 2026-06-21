# Leju Fetch Proxy

目的：當 GitHub Actions 的 IP 被樂居 / Cloudflare 擋住時，GitHub 仍負責排程與 LINE 推播，但樂居 HTML 改由外部 proxy 抓取。

## Netlify Function

本 repo 已包含：

```text
netlify/functions/leju-fetch.js
```

部署到 Netlify 後，proxy URL 會類似：

```text
https://你的-netlify-site.netlify.app/.netlify/functions/leju-fetch
```

## GitHub Secrets

到 GitHub repo：

```text
Settings > Secrets and variables > Actions > Repository secrets
```

新增：

```text
LEJU_FETCH_PROXY_URL=https://你的-netlify-site.netlify.app/.netlify/functions/leju-fetch
```

可選，若你想保護 proxy：

```text
LEJU_FETCH_PROXY_TOKEN=自己設定一串長密碼
```

如果設定 `LEJU_FETCH_PROXY_TOKEN`，Netlify 也要設定同名環境變數。

## Netlify Environment Variable

如果要啟用 token，Netlify 站台也要設定：

```text
LEJU_FETCH_PROXY_TOKEN=同一串長密碼
```

路徑通常是：

```text
Site configuration > Environment variables
```

## 測試

瀏覽器開：

```text
https://你的-netlify-site.netlify.app/.netlify/functions/leju-fetch?url=https%3A%2F%2Fwww.leju.com.tw%2F
```

若成功，會看到 JSON，裡面有 `html`。

## 目前程式 fallback 順序

```text
1. LEJU_FETCH_PROXY_URL
2. curl-cffi
3. curl
4. Playwright Chromium
5. 全部失敗才 stale=yes
```
