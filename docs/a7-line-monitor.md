A7 LINE Monitor
這套流程支援兩種模式：


本地版：你的 Windows 電腦定時抓樂居，再推到 LINE

雲端版：GitHub Actions 每天自動執行，就算你的電腦沒開也會送


追蹤範圍

A7站重劃區-郵政物流

A7站重劃區-樂善國小

A7站重劃區-中心商業區


每次執行會整理：


銷售中新建案數

最新上架戶數

五年內新成屋數

重劃區物件數

近一年成交價 / 新案成交價 / 年成交量

值得注意的案子與原因


主要檔案

scripts/a7-line-monitor/a7_leju_digest.py

scripts/a7-line-monitor/Invoke-A7LejuDigest.ps1

scripts/a7-line-monitor/Register-A7LejuDigestTask.ps1

scripts/a7-line-monitor/a7-leju-monitor.env.example

.github/workflows/a7-line-digest.yml


本地版
先建立設定檔：

powershell



Copy-Item scripts/a7-line-monitor/a7-leju-monitor.env.example scripts/a7-line-monitor/a7-leju-monitor.env



建議先用：


LINE_MODE=broadcast


這樣如果你的 LINE Official Account 主要只有你自己加好友，就可以直接收到通知，不需要先抓 LINE_TO。

本地手動測試：

powershell



powershell -NoProfile -ExecutionPolicy Bypass -File scripts/a7-line-monitor/Invoke-A7LejuDigest.ps1 -ConfigPath scripts/a7-line-monitor/a7-leju-monitor.env



本地每天晚上 8:00 排程：

powershell



powershell -NoProfile -ExecutionPolicy Bypass -File scripts/a7-line-monitor/Register-A7LejuDigestTask.ps1 -ConfigPath scripts/a7-line-monitor/a7-leju-monitor.env -Force



雲端版 GitHub Actions
如果你要在不開本地電腦的情況下照樣收到 LINE 通知，請用：


.github/workflows/a7-line-digest.yml


這個 workflow 會在台北時間每天晚上 8:00 執行。

GitHub Secrets
到 GitHub repo：


Settings

Secrets and variables

Actions


新增以下 secrets：


LINE_CHANNEL_ACCESS_TOKEN

LINE_MODE

LINE_TO（只有 push 模式需要）


建議先設：


LINE_MODE=broadcast


如果你的 LINE Official Account 主要只有你自己是好友，這樣 LINE_TO 可以先留空。

手動測試
到 GitHub 的 Actions 頁面：


選 A7 LINE Digest

點 Run workflow


執行結果
workflow 會：


抓樂居 A7 三個子區

產生報告到 vault/2-actions/scheduled-reports/a7-leju/

發送 LINE 訊息

上傳報告 artifact


輸出位置

報告：vault/2-actions/scheduled-reports/a7-leju/

狀態檔：vault/2-actions/scheduled-reports/a7-leju/state.json

ledger：system/skills/local-scheduler/config/sync-ledger.json


備註

LINE Notify 已停用，這套是走 LINE Official Account + Messaging API

建議雲端版優先使用 broadcast

如果之後要改成指定單一 userId，再把 LINE_MODE 改成 push 並補 LINE_TO


新增其他行政區
現在區域清單已抽到：


area-config.json


之後要新增追蹤區域，最簡單就是只改這個 JSON，不用改 Python。

每個區域至少補這幾個欄位：

json



{
  "name": "青埔高鐵特區",
  "theme": "高鐵 / 商業核心",
  "buy_url": "樂居該區 buy 頁",
  "price_url": "樂居該區 price 頁",
  "new_build_list_url": "樂居該區新建案列表頁"
}



目前程式實際會用到的是：


name

theme

buy_url

price_url


new_build_list_url 先保留給後續擴充新上架建案與預售建案網址整理。
