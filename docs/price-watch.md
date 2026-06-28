# Price Watch

Jarvis Price Watch 是通用的商品 / 機票價格追蹤器。它會定時抓價格、寫入 SQLite 歷史資料、計算近一年最低到最高價格，並在到達目標價或創近一年新低時透過 LINE Messaging API 通知。

## 支援來源

- 商品頁 HTML：適合你已經知道商品網址的情境。
- SerpApi Google Shopping：用商品名稱 / 型號搜尋多個賣場，找目前最低價。
- SerpApi Google Flights：私人版以代表日期抽樣搜尋，並每日輪替追蹤日期。
- Skyscanner Indicative Prices：僅在已有商業合作金鑰時啟用，作為完整彈性日期來源。
- SerpApi Google Flights：保留給固定日期即時搜尋與候選日期複查。
- 手機網頁：部署後可從 `/price-watch/` 搜尋商品與機票，並加入追蹤。

## 主要檔案

- `scripts/price-watch/price_watch.py`
- `scripts/price-watch/manage_watch.py`
- `scripts/price-watch/test_price_watch.py`
- `scripts/price-watch/price-watch-config.json`
- `scripts/price-watch/price-watch.env.example`
- `scripts/price-watch/Invoke-PriceWatch.ps1`
- `scripts/price-watch/Register-PriceWatchTask.ps1`
- `output/bazi-ziwei/price-watch/index.html`
- `output/bazi-ziwei/price-watch/app.js`
- `.github/workflows/price-watch.yml`
- `.github/workflows/price-watch-worker.yml`

## 本地設定

建立環境檔：

```powershell
Copy-Item scripts/price-watch/price-watch.env.example scripts/price-watch/price-watch.env
```

填入：

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_MODE=broadcast` 或 `LINE_MODE=push`
- `LINE_TO`：只有 push 模式需要
- `SERPAPI_API_KEY`：只有使用 Google Shopping / Google Flights provider 時需要
- `SKYSCANNER_API_KEY`：選填；有商業合作金鑰時改用完整彈性日期搜尋

編輯追蹤清單：

```powershell
notepad scripts/price-watch/price-watch-config.json
```

把範例 watch 的 `enabled` 改成 `true`，並調整商品網址、商品型號、機票日期、目標價。

也可以用管理工具新增，不必手改 JSON。

新增商品頁追蹤：

```powershell
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py add-product --enabled --id ipad-air-m3 --name "iPad Air M3 11 128GB Wi-Fi" --target-price 16900 --url "https://example.com/item" --price-regex 'NT\$\s*([\d,]+)'
```

新增多賣場商品搜尋：

```powershell
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py add-product --enabled --id ipad-air-m3-shopping --name "iPad Air M3 11 128GB Wi-Fi" --target-price 16900 --shopping-query "iPad Air M3 11 128GB Wi-Fi"
```

新增「未來一年最低」機票追蹤：

```powershell
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py add-flight --enabled --id tpe-tyo-year-low --departure-id TPE --arrival-id TYO --mode annual_low --trip-days 5
```

新增「最早日期後 30 天」機票追蹤：

```powershell
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py add-flight --enabled --id tpe-tyo-window --departure-id TPE --arrival-id TYO --mode date_window --start-date 2026-09-01 --trip-days 5 --lookahead-days 30 --target-price 8000
```

查看、啟用、停用：

```powershell
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py list
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py enable ipad-air-m3
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py disable ipad-air-m3
```

## 手動測試

先不要推 LINE，只測抓價：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/price-watch/Invoke-PriceWatch.ps1 -SkipLine -DryRun
```

正式跑一次：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/price-watch/Invoke-PriceWatch.ps1
```

強制忽略通知冷卻時間：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/price-watch/Invoke-PriceWatch.ps1 -Force
```

跑基本測試：

```powershell
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m unittest scripts/price-watch/test_price_watch.py
```

跑手機版商品 / 機票 / 追蹤流程與 390px 版面檢查：

```powershell
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe scripts/price-watch/validate_mobile.mjs
```

## Windows 排程

機票探索價最多可能快取 4 天，建議機票追蹤每天跑 1–2 次，不需要每小時消耗 API 額度。

預設每 60 分鐘執行一次：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/price-watch/Register-PriceWatchTask.ps1 -Force
```

改成每 30 分鐘：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/price-watch/Register-PriceWatchTask.ps1 -IntervalMinutes 30 -Force
```

## GitHub Actions

`.github/workflows/price-watch.yml` 預設每小時執行一次。

需要在 GitHub Actions Secrets 設定：

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_MODE`
- `LINE_TO`
- `SERPAPI_API_KEY`：如果使用 SerpApi provider
- `SKYSCANNER_API_KEY`：選填的商業版機票來源
- `PRICE_WATCH_REMOTE_URL`：如果要讀手機頁新增的雲端追蹤清單，例如 `https://你的網域/api/price-watch/watches`
- `PRICE_WATCH_ACCESS_TOKEN`：和 Worker 使用同一組同步金鑰

## 手機搜尋頁

部署後開：

```text
https://你的網域/price-watch/
```

Worker 需要設定：

- `SERPAPI_API_KEY`
- `SKYSCANNER_API_KEY`
- `PRICE_WATCH_ACCESS_TOKEN`
- `PRICE_WATCH_PUBLIC_SEARCH=false`

GitHub Actions 部署 Worker 需要另外設定：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

`.github/workflows/price-watch-worker.yml` 會在相關檔案推到 `main` 後，自動部署 Worker 與手機頁資產。

手機第一次打開後，右上角進入同步設定，填入 `PRICE_WATCH_ACCESS_TOKEN`。

如果手機頁放在 GitHub Pages，而 API 放在 Cloudflare Worker，請在同一個設定畫面填入 Worker API 位址，例如：

```text
https://super-assistant.你的-workers-subdomain.workers.dev
```

後端尚未連線時，搜尋頁會退回 Google Shopping / Google Flights 外部搜尋連結，因此靜態頁仍可在手機上使用；即時價格整理、歷史價格與 LINE 到價通知則需要 Worker API。

手機是主要使用介面：頁面支援 iPhone / Android 安全區、至少 44px 觸控目標、避免 iOS 表單自動縮放，並提供 Web App Manifest 與離線外殼，可從瀏覽器加入主畫面後以獨立 App 模式開啟。離線時只能開啟既有介面，搜尋即時價格仍需要網路。

### 機票模式

`全年最低`：

- 只需要出發地、目的地與旅行天數；可輸入「台北」「東京」並從建議選單選城市，不必背 IATA 代碼。
- 搜尋從今天起未來 365 天。
- 回傳該範圍目前可取得的最低探索價；首次找到會通知，之後出現更低價再通知。

`日期區間`：

- 輸入最早出發日、旅行天數與往後可接受天數。
- 例如 `2026-09-01`、旅行 `5` 天、往後 `30` 天，會篩選 9/1–9/30 出發且行程為 5 天的報價。
- 有目標價時，到價即通知；沒有目標價時，先建立價格基準，之後創監控新低再通知。

私人版使用 SerpApi 標準 Google Flights。手機每次搜尋最多抽查 4 個代表出發日；加入追蹤後，每個航段每天輪替查 1 個日期，避免快速耗盡免費方案每月 250 次額度。畫面會標示「抽樣價」，購買前仍須開啟 Google Flights 確認。

若日後取得 Skyscanner 商業合作金鑰，Worker 會自動優先使用 Indicative Prices，該探索快取價可能最多落後 4 天。

機票搜尋結果會顯示「該年平均」與「去年平均」：

- 該年平均：本次搜尋中，該曆年所有可取得出發日探索價的平均。
- 去年平均：系統已累積的同航段、相同行程天數之去年每日探索樣本平均。
- 來源不提供完整去年歷史均價；尚未累積到去年資料時，畫面會明確顯示「尚無去年資料」。
- 為節省 Cloudflare KV 額度，同航段與行程天數每天最多寫入一次年度平均樣本。

SerpApi 私人版機票來源預設 `check_interval_hours: 24`；Skyscanner 商業版預設 12 小時。使用 `--force` 可略過此限制手動重查。

如果只要搜尋，不需要雲端儲存追蹤清單，可以不設定 KV；加入追蹤時會先存在手機本機。

如果要手機加入追蹤後，由 GitHub Actions / 本地排程接手 LINE 到價提醒，需要在 Cloudflare Worker 加 KV namespace binding：

```toml
[[kv_namespaces]]
binding = "PRICE_WATCH_KV"
id = "你的 KV namespace id"
```

接著把 GitHub Secret `PRICE_WATCH_REMOTE_URL` 設成：

```text
https://你的網域/api/price-watch/watches
```

## 設定範例

商品頁：

```json
{
  "enabled": true,
  "id": "iphone-example",
  "type": "product",
  "name": "iPhone 16 Pro 256G",
  "currency": "TWD",
  "target_price": 32000,
  "alert_on_new_low": true,
  "sources": [
    {
      "type": "html",
      "id": "store-a",
      "name": "某商城",
      "url": "https://example.com/item",
      "price_regex": "NT\\$\\s*([\\d,]+)"
    }
  ]
}
```

多賣場搜尋：

```json
{
  "enabled": true,
  "id": "ipad-air-m3",
  "type": "product",
  "name": "iPad Air M3 11 128GB Wi-Fi",
  "currency": "TWD",
  "target_price": 16900,
  "sources": [
    {
      "type": "serpapi_google_shopping",
      "id": "google-shopping",
      "query": "iPad Air M3 11 128GB Wi-Fi",
      "gl": "tw",
      "hl": "zh-tw",
      "currency": "TWD",
      "limit": 8
    }
  ]
}
```

機票：未來一年最低

```json
{
  "enabled": true,
  "id": "tpe-tyo-year-low",
  "type": "flight",
  "name": "台北到東京未來一年最低",
  "currency": "TWD",
  "target_price": null,
  "alert_on_first_seen": true,
  "alert_strategy": "annual_floor",
  "sources": [
    {
      "type": "skyscanner_indicative_flights",
      "id": "skyscanner-indicative",
      "mode": "annual_low",
      "departure_id": "TPE",
      "arrival_id": "TYO",
      "horizon_days": 365,
      "trip_days": 5,
      "check_interval_hours": 12,
      "currency": "TWD",
      "market": "TW",
      "locale": "zh-TW"
    }
  ]
}
```

機票：指定日期區間

```json
{
  "enabled": true,
  "id": "tpe-tyo-window",
  "type": "flight",
  "name": "台北到東京 9/1 起 30 天",
  "currency": "TWD",
  "target_price": 8000,
  "alert_strategy": "target_or_new_low",
  "sources": [
    {
      "type": "skyscanner_indicative_flights",
      "id": "skyscanner-indicative",
      "mode": "date_window",
      "departure_id": "TPE",
      "arrival_id": "TYO",
      "start_date": "2026-09-01",
      "lookahead_days": 30,
      "trip_days": 5,
      "check_interval_hours": 12,
      "currency": "TWD",
      "market": "TW",
      "locale": "zh-TW"
    }
  ]
}
```

## 備註

- 「即時」實務上是 near real-time，取決於排程頻率、資料來源快取、API 限流與反爬規則。
- SerpApi 抽樣模式不代表搜尋範圍內每一天的絕對最低價；系統會靠每日輪替逐步擴大日期覆蓋。
- Skyscanner Indicative API 若日後取得，適合找整月與多日期最低價，但仍不是最終可購買報價。
- 官方文件：[Flights Indicative Prices](https://developers.skyscanner.net/docs/flights-indicative-prices/overview)、[Flights Autosuggest](https://developers.skyscanner.net/docs/autosuggest/flights)。
- 商品頁如果自動抓不到價格，優先補 `price_regex`，穩定度會高很多。
- 歷史價格從啟用後開始累積；若來源 API 本身提供歷史價格，之後可以再把 provider 擴充成回填歷史。
- 年度平均是 Jarvis 實際取得的探索價樣本平均，不代表航空公司全部成交票價。
