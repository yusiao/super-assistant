# 航班助手

航班助手專注於航班搜尋、彈性旅行天數比較與低價追蹤。它會定時抓價格、寫入 SQLite 歷史資料、計算近一年最低到最高價格，並在到達目標價或創近一年新低時透過 LINE Messaging API 通知。

舊商品追蹤紀錄保留於儲存空間，但不顯示、不排程查價、不發 LINE 通知。商品搜尋 API 回傳 410；追蹤 API 與背景排程僅接受航班及航班資料來源，CLI 已移除 `add-product`。

## 功能定位

Google Flights 和 Skyscanner 都支援彈性日期與降價提醒。本工具的定位是繁體中文手機介面、鄰近旅行天數的價差整理，以及自訂條件的 LINE 通知。SerpApi Google Flights 是主要票價來源，並非獨立的航空公司完整庫存。

「全年低價探索」是代表日期抽樣；當年均價是取得樣本的均價，去年均價僅來自已累積的歷史紀錄。資料不足時顯示尚無資料，不將抽樣最低價宣稱為全年市場最低價。每日背景排程不代表全天候即時監控。

## 支援來源

- SerpApi Google Flights：私人版以代表日期抽樣搜尋，頁內顯示航班詳情，並比較經濟艙、豪華經濟艙與商務艙。
- Skyscanner Indicative Prices：僅在已有商業合作金鑰、未設定 SerpApi 且沒有進階篩選時，作為探索報價備援。
- SerpApi Google Flights：保留給固定日期即時搜尋與候選日期複查。
- 手機網頁：部署後可從 `/price-watch/` 搜尋航班，並加入追蹤。
- 機場欄位：輸入 `T`、`TP`、`TPE` 這類英文字母時，使用全球 IATA 前綴索引搜尋所有符合機場；輸入繁體中文地名時使用地點搜尋。下拉顯示縮寫、繁體機場名、英文名與國家，結果很多時先顯示前 50 筆並提示繼續輸入縮寫。
- 機票篩選：可選全部、廉價航空或傳統航空，以及全部、直達或轉乘。搜尋期間顯示不定進度條與已等待秒數，不偽造來源端完成百分比。
- 購票連結：航班卡保留完整頁內資訊，另提供航空公司官網、Skyscanner、Trip.com 與追蹤按鈕；第三方網址會帶入出發地、目的地及日期。
- 查詢容錯：篩選後沒有航班時提示調整條件；來源逾時與 SerpApi 額度不足會顯示不同訊息。區間起點可往今天縮減，但不會往後延長原區間；整段區間過期時須更新日期。

## 多城市與條件篩選

- 支援 A → B → C，B 可設定 1–30 晚的範圍；可選 C → A 回程，並設定 C 的停留夜數範圍，不需先填總旅行天數。這版最多三段旅程，不是任意數量城市編輯器。
- 使用 SerpApi `type=3` 多城市與 `departure_token` 逐段選定航班。最後一段回傳的是整趟報價，不能把各段報價相加；不把報價宣稱為保證同一張聯程機票，分開開票與行李規則仍須購票頁確認。
- 停留夜數依當地實際抵達日計算。跨日抵達會重新計算下一段日期，最多兩次調整；沒有完整、符合夜數的行程不顯示為可用票價。
- 預設顯示經濟艙；最低價候選旁並列同日期豪經、商務報價，其他候選可按「比較艙等」。不同艙等可能是不同航班。來源回傳混艙時標示「含其他艙等」，每個航段保留實際艙等。
- 可排除機型、航空公司，並設定每段旅程的起飛與抵達時間。時間依各機場當地時間、含端點，起點晚於終點代表跨午夜。條件套用於每段旅程起訖，不是要求每個途中轉機都在同一時窗。
- 機型排除會檢查所有轉機與回程航段；預設排除機型未提供的候選，可明確勾選接受未知機型。航空公司依來源提供的航班代碼、航空名稱與可用的營運公司欄位篩選，無法保證未提供的共掛航班營運資訊；機型也可能於起飛前異動。
- 里程升等固定顯示「待確認」，因目前來源未提供訂位子艙等、票價規則與各航段升等庫存，不會把可售豪經／商務艙當成可里程升等。
- 一般搜尋比較最多 3 個出發日、最低價日的 2 種其他艙等，以及旅行天數正負 2 天。多城市比較最多 4 個出發日／夜數組合及最低價組合的其他艙等。每次最多 24 次來源查詢（含跨日重試），相同查詢快取 15 分鐘；此為抽樣候選，非全日期或全部航班的全域最低解。
- 全年模式保留回程與停留時間，最晚航程落在約 330 天內，避免超出常見可訂票範圍。歷史均價按行程與完整篩選條件分開累積，新增條件會顯示尚無相符歷史。
- 新追蹤儲存完整 `planner` 條件，Python 排程透過已設定的 Worker URL 與同步金鑰呼叫同一套篩選。每日輪替一個日期與停留組合；一般來回另比較一個輪替的鄰近天數。通知包含各段日期與停留夜數，不查詢額外艙等。
- GitHub 排程仍為台灣時間每日 08:15。推送程式碼只跑離線單元測試，不再為測試消耗查價額度或發 LINE。

驗證（不呼叫真實付費 API）：

```powershell
node --test scripts/price-watch/test_flight_planner.mjs
node scripts/price-watch/test_flight_only.mjs
python -m unittest discover -s scripts/price-watch -p test_price_watch.py
node scripts/price-watch/validate_flight_planner_ui.mjs
```

資料規格：[SerpApi Google Flights API](https://serpapi.com/google-flights-api)。升等限制參考 [長榮獎勵常見問答](https://www.evaair.com/zh-tw/customer-services/faq/detail.html?FaqCategories=Award-Program) 與 [華航座艙升等](https://www.china-airlines.com/au/zh/member/miles/redeem/cabin-upgrade.html)。

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
- `SERPAPI_API_KEY`：只有使用 Google Flights provider 時需要
- `SKYSCANNER_API_KEY`：選填；有商業合作金鑰時改用完整彈性日期搜尋

編輯追蹤清單：

```powershell
notepad scripts/price-watch/price-watch-config.json
```

把範例 watch 的 `enabled` 改成 `true`，並調整出發地、目的地、機票日期與目標價。

也可以用管理工具新增，不必手改 JSON。

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
& C:\Users\Power\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/price-watch/manage_watch.py enable tpe-tyo-year-low
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

跑手機版航班搜尋 / 追蹤流程與 390px、320px 版面檢查：

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

`.github/workflows/price-watch.yml` 預設每天台灣時間 08:15 執行一次，並且同時間只保留最新的一次執行。

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
- `PRICE_WATCH_PUBLIC_SEARCH=true`：航班搜尋可直接在手機使用；追蹤清單仍需 `PRICE_WATCH_ACCESS_TOKEN`
- `PRICE_WATCH_PUBLIC_SEARCH_PER_MINUTE=4`
- `PRICE_WATCH_PUBLIC_SEARCH_PER_DAY=30`

GitHub Actions 部署 Worker 需要另外設定：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

`.github/workflows/price-watch-worker.yml` 會在相關檔案推到 `main` 後，自動部署 Worker 與手機頁資產。

手機第一次打開後，右上角進入同步設定，填入 `PRICE_WATCH_ACCESS_TOKEN`。

如果手機頁放在 GitHub Pages，而 API 放在 Cloudflare Worker，請在同一個設定畫面填入 Worker API 位址，例如：

```text
https://super-assistant.你的-workers-subdomain.workers.dev
```

航班搜尋：Worker 成功回傳時直接在頁內顯示票價與航班詳情；查價失敗時提示稍後重試。歷史價格與 LINE 到價通知需要 Worker API。

手機是主要使用介面：頁面支援 iPhone / Android 安全區、至少 44px 觸控目標、避免 iOS 表單自動縮放，並提供 Web App Manifest 與離線外殼，可從瀏覽器加入主畫面後以獨立 App 模式開啟。離線時只能開啟既有介面，搜尋即時價格仍需要網路。

### 機票模式

`全年低價探索`：

- 只需要出發地、目的地與旅行天數；可輸入「台北」「東京」並從建議選單選城市，不必背 IATA 代碼。
- 搜尋從今天起未來 365 天。
- 私人版先比較 4 個代表出發日的經濟艙，再於最低價日期比較 3 種艙等與主要旅行天數前後各 2 天；首次找到會通知，之後每日輪替抽樣出現更低價再通知。

`日期區間`：

- 輸入最早出發日、旅行天數與往後可接受天數。
- 例如 `2026-09-01`、主要旅行 `5` 天、往後 `30` 天，會搜尋 9/1–9/30 出發的 5 天報價，並比較 3、4、6、7 天是否更便宜。
- 有目標價時，到價即通知；沒有目標價時，先建立價格基準，之後創監控新低再通知。

私人版使用 SerpApi 標準 Google Flights。手機每次搜尋先查 4 個經濟艙代表出發日，再於最低價日期查豪華經濟艙、商務艙與 4 種鄰近旅行天數，最多使用 10 次 SerpApi 查詢。頁面直接顯示最低價、航空公司、日期、起降時間、機場、飛行時間、轉機次數，以及其他天數可節省的金額。加入追蹤後，每個航段每天查主要天數與 1 個輪替的鄰近天數，4 天完成 3、4、6、7 天一輪比較，避免快速耗盡免費方案每月 250 次額度。

全球 IATA 前綴索引使用 Wikidata 的 IATA 代碼 `P238`，並要求同時具有 ICAO 代碼 `P239` 以排除鐵路站點。每個英文字母前綴在 Cloudflare KV 快取 30 天；第一次查詢可能需要數秒，後續直接讀快取且不消耗 SerpApi 額度。

若日後取得 Skyscanner 商業合作金鑰，Worker 會自動優先使用 Indicative Prices，該探索快取價可能最多落後 4 天。

機票搜尋結果會顯示「該年抽樣均價」與「去年累積觀測均價」：

- 該年抽樣均價：本次搜尋中，該曆年已抽到的經濟艙代表出發日平均，並顯示抽樣最低到最高價。
- 去年累積觀測均價：系統啟用後已累積的同航段、相同行程天數之去年每日探索樣本平均；並非航空公司完整年度成交資料。
- 來源不提供完整去年歷史均價；尚未累積到去年資料時，畫面會明確顯示「尚無去年資料」。
- 為節省 Cloudflare KV 額度，同航段與行程天數每天最多寫入一次年度平均樣本。

SerpApi 私人版機票來源預設 `check_interval_hours: 24`；Skyscanner 商業版預設 12 小時。GitHub Actions 預設每天台灣時間 08:15 執行一次，使用 `--force` 可略過來源間隔限制手動重查。

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
- 年度均價是系統實際取得的探索價樣本平均，不代表航空公司全部成交票價。
