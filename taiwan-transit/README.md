# 速行 PWA

手機優先的台灣大眾運輸路線查詢介面。

## 本機預覽

在 repo 根目錄執行：

```powershell
python -m http.server 4173 --directory output/taiwan-transit
```

然後開啟 `http://127.0.0.1:4173`。

## HTTPS 部署

使用獨立 Cloudflare Workers 設定，不會覆蓋 repo 內其他站點：

```powershell
node node_modules/wrangler/bin/wrangler.js deploy --config wrangler.transit.toml
```

## 目前完成

- 起點、終點與交換功能
- 現在出發、指定出發、指定抵達
- 使用手機定位作為起點
- 三種路線結果與展開步驟
- 最近查詢保存
- PWA manifest、安裝入口與離線 App Shell
- 可替換的路徑服務 API 介面

## TDX 正式路線服務

前端會呼叫同網域的 `/api/journeys`，由 Cloudflare Worker 取得 TDX OAuth Token，再呼叫：

- 地址定位：`/api/advanced/V3/Map/GeoCode/Coordinate/Address/{Address}`
- 地標定位：`/api/advanced/V3/Map/GeoCode/Coordinate/Markname/{Markname}`
- 全台旅運規劃：`/api/maas/routing`

正式部署前將 TDX 金鑰存成 Cloudflare Secret：

```powershell
node node_modules/wrangler/bin/wrangler.js secret put TDX_CLIENT_ID --config wrangler.transit.toml
node node_modules/wrangler/bin/wrangler.js secret put TDX_CLIENT_SECRET --config wrangler.transit.toml
node node_modules/wrangler/bin/wrangler.js deploy --config wrangler.transit.toml
```

也可以直接執行安全設定腳本；輸入內容不會顯示在畫面或寫入檔案，完成後會自動重新部署：

```powershell
.\scripts\configure-tdx-transit.ps1
```

前端 POST 格式：

```json
{
  "origin": "三重國小站",
  "destination": "林口長庚紀念醫院",
  "timeMode": "now",
  "datetime": "2026-06-29T08:00:00.000Z"
}
```

TDX 金鑰不會放在前端，只保存在 Cloudflare Worker Secret。
