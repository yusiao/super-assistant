# A7 Self-Hosted Runner Setup

目的：讓 GitHub Actions 的 A7 週報跑在家裡電腦或 NAS，而不是 GitHub 雲端 IP。這樣樂居請求會從你的家用網路出去，比較不容易被 Cloudflare 擋。

## 1. GitHub 建立 runner

到 repo：

```text
https://github.com/yusiao/super-assistant
```

進入：

```text
Settings > Actions > Runners > New self-hosted runner
```

選你的系統：

```text
Windows x64
```

GitHub 會顯示一組指令，照畫面執行。

## 2. Runner labels

設定 runner 時，請加 label：

```text
a7-runner
```

workflow 目前指定：

```yaml
runs-on: [self-hosted, windows, a7-runner]
```

如果沒有 `a7-runner` 這個 label，workflow 會一直排隊不執行。

## 3. 建議安裝成服務

Windows runner 設定完成後，建議安裝成背景服務，這樣不用每次手動開 runner 視窗。

在 runner 資料夾用系統管理員 PowerShell 執行：

```powershell
.\svc.cmd install
.\svc.cmd start
```

如果 GitHub 畫面提供的指令不同，則以 GitHub 畫面上的指令為準。

## 4. GitHub Secrets

原本 LINE secrets 繼續使用：

```text
LINE_CHANNEL_ACCESS_TOKEN
LINE_MODE
LINE_TO
```

self-hosted runner 不需要 `LEJU_FETCH_PROXY_URL`。

## 5. 測試

到 GitHub：

```text
Actions > A7 LINE Digest > Run workflow
```

成功時，log 應該顯示：

```text
Requested labels: self-hosted, windows, a7-runner
A7 extraction diagnostics:
proxy_configured=no
```

`proxy_configured=no` 是正常的，因為現在靠家裡網路直接抓樂居。

## 6. 注意事項

- 電腦或 NAS 必須開機並連網，排程才會執行。
- runner 服務要保持 Running。
- 如果家裡網路也被樂居擋，再考慮換網路或使用 proxy。
