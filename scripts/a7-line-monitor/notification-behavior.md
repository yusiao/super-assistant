# 房市通知與預覽

## 閱讀方式

- LINE 最多列出 3 項優先查證的開價線索，包含建案網址、每坪開價低點、比較基準及限制。完整候選留在 PDF。
- 同行政區其他預售案的開價中位數只是初篩。尚未核對路段、樓層、坪數、車位及時點，因此比較可信度標為低，不等於確認低於成交行情。
- 抓取失敗不算零建案，不拿舊資料補數字。PDF 將缺資料的區域集中呈現，保留大數據觀察。

## 即時提醒與週報

- 週報仍依既有排程發送，不因去重而移除完整候選。
- 即時低價候選以成功送出紀錄比較：首次通知、較上次通知開價累計下調至少 3%，或已辨識的銷售階段改變，才再次提醒。
- 階段變化只限本次仍可取得、且符合低價候選條件的建案；不是全市場完銷或交屋通知。
- 網站暫時失敗不清空已通知紀錄。LINE 發送失敗不寫成功紀錄；同一份已送出通知再次執行會略過。
- 舊版沒有逐案送達紀錄，升級後首次可能重新列出既有候選。通知紀錄依賴本機檔案及 Actions cache；刪除或遺失紀錄會重新建立基準，並非永久去重資料庫。
- GitHub 的 send-line 使用與 build-report 相同的 Windows runner，以保存跨次送達紀錄。機器仍需開機連網；Pages 部署後若 runner 離線，發送工作會等待 runner。
- GitHub 手動執行只有勾選 force_send 才強制推送。此選項不代表重新取得的資料一定完整。

## 本機環境與測試

在專案根目錄執行一次 `powershell -ExecutionPolicy Bypass -File scripts/a7-line-monitor/Initialize-A7Runtime.ps1`。
它建立專用 `.venv` 並安裝共用 requirements 與無介面 Chromium，不修改共用 Python 套件。
既有 Invoke-A7LejuDigest.ps1 會優先使用此環境；明確設定 JARVIS_PYTHON_PATH 時尊重該設定。

測試：`scripts/a7-line-monitor/.venv/Scripts/python.exe scripts/a7-line-monitor/test_notification_ux.py`

離線預覽：`scripts/a7-line-monitor/.venv/Scripts/python.exe scripts/a7-line-monitor/preview_notification.py`
預覽使用既有 state 快照，明確標示資料時間，輸出於 output/pdf，不抓網頁、不傳 LINE、不改通知紀錄。

補齊套件不代表網站永遠允許自動讀取。原始錯誤仍可從執行紀錄與快照診斷，使用者通知只顯示簡短原因。
