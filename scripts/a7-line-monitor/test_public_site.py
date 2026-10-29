import unittest
from datetime import datetime, timezone
from public_site import build_public_data, public_url


class PublicSiteTests(unittest.TestCase):
    def test_allowlist_does_not_leak_credentials_or_logs(self):
        result = build_public_data([{"name": "A7", "stale": True, "LINE_TO": "secret-user", "LINE_CHANNEL_ACCESS_TOKEN": "secret-token", "buy_fetch_error": "secret-stacktrace", "active_presale_projects": [{"name": "舊建案"}]}], datetime.now(timezone.utc))
        self.assertNotIn("secret", str(result))
        self.assertEqual(result["areas"][0]["projects"], [])
        self.assertEqual(result["areas"][0]["availability"], "unavailable")

    def test_completed_and_duplicate_listing_filtered(self):
        project = {"name": "測試案", "url": "https://www.leju.com.tw/community/L123?mode=buy", "status": "預售屋"}
        rows = [project, {**project, "url": "https://www.leju.com.tw/community/L123"}, {**project, "name": "新成屋案", "url": "https://www.leju.com.tw/community/L234", "status": "待定 新成屋"}]
        data = build_public_data([{"name":"A7", "active_presale_projects":rows}],datetime.now(timezone.utc))
        self.assertEqual(len(data["areas"][0]["projects"]), 1)

    def test_external_url_and_query_secrets_not_exported(self):
        self.assertEqual(public_url("https://www.leju.com.tw/community/L1?token=secret"), "https://www.leju.com.tw/community/L1")
        for url in ["javascript:alert(1)", "https://evil.com/community/L1", "https://secret@www.leju.com.tw/community/L1", "https://www.leju.com.tw/api/private"]:
            self.assertEqual(public_url(url), "")

    def test_partial_and_missing_are_distinct(self):
        data = build_public_data([{"name":"A7", "price_fetch_error":"403"}],datetime.now(timezone.utc))
        self.assertEqual(data["areas"][0]["availability"], "partial")


if __name__ == "__main__":
    unittest.main()
