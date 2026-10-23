# SerpApi 主備金鑰

更新：2026-10-23。已確認正式環境兩組 Secret 存在，並部署版本 `b2487d77-5c95-4088-a115-228679fe5e3f`。57 項測試通過；未使用真實付費查詢驗證第二組金鑰有效性。

- 必填 Secret：`SERPAPI_API_KEY`，沿用原本主帳號。
- 選填 Secret：`SERPAPI_API_KEY_BACKUP`，第二個獲授權使用的帳號。
- 在 Cloudflare 的 `super-assistant` Worker 設定 Secrets，不要放在前端、Git、一般文字變數或聊天中。
- 每次查詢先使用既有共用快取；未命中才呼叫主 Key。
- 主 Key 遇到 HTTP 401、429、5xx 或連線逾時／失敗，最多改試備用一次。
- HTTP 400、403、正常空結果、沒有聯程總價不切換；不繞過帳號停權。
- 重複的 Key 只使用一次；兩組失敗即停止。未配置備用時維持單 Key。
- 每筆邏輯查詢最多兩次實際請求；逾時重試可能造成兩邊都計費。
- 目前沒有跨查詢的失效 Key 冷卻或獨立帳號用量統計；主 Key 額度耗盡時，每筆未快取查詢仍會先嘗試主 Key。
- 備援增加可用性，不會補足上游沒有提供的票價。帳號使用須符合供應商條款。

驗證：`node --test scripts/price-watch/test_flight_planner.mjs`，使用模擬請求，不消耗正式額度。
