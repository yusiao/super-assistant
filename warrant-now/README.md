# 權證淨值查詢

手機優先的台灣權證查詢 PWA。輸入權證代號後顯示：

- 標的最新成交價與漲跌
- 權證最新成交、最佳買價、最佳賣價
- 依標的現價、履約價、行使比例計算的每單位履約淨值
- 價內外程度、時間價值、損益兩平價、到期日
- 參考推薦度：依流動性、損益兩平距離、價內外程度、剩餘天數計算的條件分數
- 同標的權證排行：輸入 4 碼股票代號，列出認購／認售條件分數較佳的權證

支援網址帶入代號，例如部署後開啟 `https://你的網域/?code=052935`，手機會直接查詢該權證，方便加入主畫面或分享。
股票排行也支援 `https://你的網域/?stock=2317`。

## 本機開發

```powershell
npx wrangler dev --config wrangler.warrant.toml
```

## 部署

```powershell
npx wrangler deploy --config wrangler.warrant.toml
```

若 `wrangler login` 失敗，或要改用另一個 Cloudflare 帳號，請用 API Token 部署：

```powershell
.\scripts\deploy-warrant-cloudflare.ps1
```

腳本會要求輸入 Cloudflare API Token，token 只會暫存在當次 PowerShell 程序環境變數，不會寫進專案檔案。

## 資料口徑

- 上市權證條件：TWSE 各檔權證即時行情及基本資料
- 上櫃權證條件：TPEx 權證即時行情及基本資料
- 行情：TWSE MIS
- 認購履約淨值：`max(標的價 - 履約價, 0) × 行使比例`
- 認售履約淨值：`max(履約價 - 標的價, 0) × 行使比例`
- 推薦度與同標的排行是條件評分，不是獲利保證，也不是個人化投資建議。

這是個人查詢 MVP。若要公開商業營運或再散布即時行情，應另向交易所或授權資訊商確認即時資訊授權。
