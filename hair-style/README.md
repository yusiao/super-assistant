# Jarvis Hair Studio

手機優先的髮型與髮色生成工具。使用者上傳正面頭像後，前端會先壓縮照片，再送到 Cloudflare Worker。

## Provider

- `OPENAI_API_KEY`：建議設定。可做頭型分析與照片髮型編輯。
- `GEMINI_API_KEY`：可做頭型分析，也可用支援圖片輸出的 Gemini model 做照片編輯。
- Cloudflare Workers AI：可作靈感圖備援，但不是原照片精修。

照片不寫入 KV 或資料庫，只在單次請求中傳給已設定的 AI provider。

## Local

```powershell
pnpm exec wrangler dev -c wrangler.hair-style.toml
```

## Deploy

```powershell
pnpm exec wrangler secret put OPENAI_API_KEY -c wrangler.hair-style.toml
pnpm exec wrangler deploy -c wrangler.hair-style.toml
```

若只想先測 UI，可直接開啟 `index.html`，會使用本機 demo 結果。
