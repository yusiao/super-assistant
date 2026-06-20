# A7 LINE Monitor

這套流程支援兩種模式：

- 本地版：你的 Windows 電腦定時抓樂居，再推到 LINE
- 雲端版：GitHub Actions 每天自動執行，就算你的電腦沒開也會送

## 追蹤範圍

- A7站重劃區-郵政物流
- A7站重劃區-樂善國小
- A7站重劃區-中心商業區

每次執行會整理：

- 銷售中新建案數
- 最新上架戶數
- 五年內新成屋數
- 重劃區物件數
- 近一年成交價 / 新案成交價 / 年成交量
- 值得注意的案子與原因

## 主要檔案

- `scripts/a7-line-monitor/a7_leju_digest.py`
- `scripts/a7-line-monitor/Invoke-A7LejuDigest.ps1`
- `scripts/a7-line-monitor/Register-A7LejuDigestTask.ps1`
- `scripts/a7-line-monitor/a7-leju-monitor.env.example`
- `scripts/a7-line-monitor/area-config.json`
- `scripts/a7-line-monitor/bargain-watch-config.json`
- `scripts/a7-line-monitor/market-pulse-config.json`
- `.github/workflows/a7-line-digest.yml`

## 本地版

先建立設定檔：

```powershell
Copy-Item scripts/a7-line-monitor/a7-leju-monitor.env.example scripts/a7-line-monitor/a7-leju-monitor.env
```

建議先用：

- `LINE_MODE=broadcast`

這樣如果你的 LINE Official Account 主要只有你自己加好友，就可以直接收到通知，不需要先抓 `LINE_TO`。

本地手動測試：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/a7-line-monitor/Invoke-A7LejuDigest.ps1 -ConfigPath scripts/a7-line-monitor/a7-leju-monitor.env
```

本地每天晚上 8:00 排程：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/a7-line-monitor/Register-A7LejuDigestTask.ps1 -ConfigPath scripts/a7-line-monitor/a7-leju-monitor.env -Force
```

## 雲端版 GitHub Actions

如果你要在不開本地電腦的情況下照樣收到 LINE 通知，請用：

- `.github/workflows/a7-line-digest.yml`

這個 workflow 會在台北時間每天晚上 `8:00` 執行。

目前 LINE 推送節奏是：

- 平常只在 `WEEKLY_REPORT_DAY` 推週報。
- workflow 仍每天執行，用來檢查是否有新的未開案 / 待預售案。
- 如果偵測到新的未開案 / 待預售案，當天會立即推 LINE。

### GitHub Secrets

到 GitHub repo：

- `Settings`
- `Secrets and variables`
- `Actions`

新增以下 secrets：

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_MODE`
- `LINE_TO`（只有 `push` 模式需要）

建議先設：

- `LINE_MODE=broadcast`

如果你的 LINE Official Account 主要只有你自己是好友，這樣 `LINE_TO` 可以先留空。

### 手動測試

到 GitHub 的 `Actions` 頁面：

- 選 `A7 LINE Digest`
- 點 `Run workflow`

### 執行結果

workflow 會：

- 抓樂居 A7 三個子區
- 產生報告到 `vault/2-actions/scheduled-reports/a7-leju/`
- 發送 LINE 訊息
- 上傳報告 artifact

## 輸出位置

- 報告：`vault/2-actions/scheduled-reports/a7-leju/`
- 狀態檔：`vault/2-actions/scheduled-reports/a7-leju/state.json`
- ledger：`system/skills/local-scheduler/config/sync-ledger.json`

## 備註

- LINE Notify 已停用，這套是走 `LINE Official Account + Messaging API`
- 建議雲端版優先使用 `broadcast`
- 如果之後要改成指定單一 userId，再把 `LINE_MODE` 改成 `push` 並補 `LINE_TO`

## 新增其他行政區

現在區域清單已抽到：

- [area-config.json](/C:/Users/Power/Desktop/super-assistant/scripts/a7-line-monitor/area-config.json)

之後要新增追蹤區域，最簡單就是只改這個 JSON，不用改 Python。

每個區域至少補這幾個欄位：

```json
{
  "name": "青埔高鐵特區",
  "theme": "高鐵 / 商業核心",
  "buy_url": "樂居該區 buy 頁",
  "price_url": "樂居該區 price 頁",
  "new_build_list_url": "樂居該區新建案列表頁"
}
```

目前程式實際會用到的是：

- `name`
- `theme`
- `buy_url`
- `price_url`

`new_build_list_url` 先保留給後續擴充新上架建案與預售建案網址整理。

如果你想讓日報穩定附上網址，即使樂居臨時擋掉爬取，也可以在每個區域加這兩組可選欄位：

```json
"manual_latest_listings": [
  { "name": "新上架物件名稱", "url": "https://www.leju.com.tw/sales/..." }
],
"manual_presale_projects": [
  { "name": "有成交的預售屋建案名稱", "url": "https://www.leju.com.tw/community/..." }
]
```

目前程式會優先嘗試自動抓：
- `最新上架` 物件網址
- `有成交的預售屋` 建案網址

抓不到時就退回 `manual_latest_listings` / `manual_presale_projects`。

## 新增雙北 / 桃園低價預售觀察

跨區低價觀察設定在：

- [bargain-watch-config.json](/C:/Users/Power/Desktop/super-assistant/scripts/a7-line-monitor/bargain-watch-config.json)

用途：找出公開價格低於同區基準價 `threshold_percent` 以上的預售屋或待開案預售屋。

每個區域至少補：

```json
{
  "name": "區域名稱",
  "region_group": "雙北或桃園",
  "scope": "district 或 life_circle",
  "new_build_list_url": "樂居該區新建案列表頁",
  "price_url": "樂居該區房價頁"
}
```

判斷邏輯：

- 只看 `預售屋`、`預計完工`、`施工中`、`未完工`、`待定`、`未開賣` 等新案狀態。
- 若建案沒有公開價格，先不列入低價異常，避免誤報。
- 周邊基準必須是行政區或生活圈層級，不使用整個台北市、新北市、桃園市的城市級中位數。
- 周邊基準價優先使用 `benchmark_price_per_ping`，其次使用樂居房價頁的新案成交價、近一年成交價，最後才用同區建案價格中位數。
- 如果沒有 `price_url` 或 `benchmark_price_per_ping`，該區會被略過，避免城市級混比。
- 若 `threshold_percent` 設為 `10`，代表低於基準價 10% 以上才會出現在日報。

## 新增近一週市場脈動

市場脈動設定在：

- [market-pulse-config.json](/C:/Users/Power/Desktop/super-assistant/scripts/a7-line-monitor/market-pulse-config.json)

用途：抓好房網、樂居或其他新聞 / 報告來源頁，統計近一週常被提到的雙北、桃園行政區與共現關鍵詞。

可調整欄位：

```json
{
  "days_back": 7,
  "source_urls": [
    { "name": "來源名稱", "url": "新聞或報告頁網址" }
  ],
  "districts": ["板橋區", "林口區", "桃園區"],
  "keywords": ["預售", "新案", "開案", "房價", "重劃區"]
}
```

限制：

- 如果來源頁被 Cloudflare 或反爬蟲擋住，週報會在 `資料限制` 中明講。
- 目前是來源頁文字統計，不是新聞搜尋 API；要提高準確度，建議把好房網專題頁、樂居報告頁或固定新聞列表頁放進 `source_urls`。
