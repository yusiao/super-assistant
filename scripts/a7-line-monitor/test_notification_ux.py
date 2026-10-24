import copy
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("digest", Path(__file__).with_name("a7_leju_digest.py"))
digest = importlib.util.module_from_spec(spec)
spec.loader.exec_module(digest)

NOW = datetime(2026, 10, 23, 12, tzinfo=timezone.utc)
ITEM = {
    "region_group": "桃園市", "area_name": "龜山區", "name": "測試建案",
    "url": "https://example.com/project/1", "status": "40-45萬/坪 預售屋",
    "low_price": 40.0, "benchmark": 60.0, "discount_percent": 33.3,
    "benchmark_source": "同行政區其他預售案中位數（3案）",
}


class NotificationTests(unittest.TestCase):
    def test_community_identity_ignores_query_and_fragment(self):
        base = {"name": "英倫花都", "url": "https://www.leju.com.tw/community/L47315223426b05", "status": "預售屋"}
        variants = [base, {**base, "url": base["url"] + "?mode=buy"}, {**base, "url": base["url"] + "?mode=price#detail"}]
        self.assertEqual(len(digest.dedupe_projects(variants)), 1)
        self.assertEqual(len(digest.merge_project_lists(variants[:1], variants[1:])), 1)

    def test_completed_and_sold_out_never_enter_sales_buckets(self):
        for status in ["待定 新成屋", "待定 已完工", "未開賣 已交屋", "完銷 預售屋"]:
            item = {"name": "測試建案", "status": status}
            self.assertFalse(digest.is_pending_launch(item), status)
            self.assertFalse(digest.is_active_presale(item), status)
        self.assertFalse(digest.is_pending_launch({"status": "價格待定"}))
        self.assertTrue(digest.is_pending_launch({"status": "待定 預售屋"}))
        self.assertTrue(digest.is_active_presale({"status": "預售屋 預計交屋"}))

    def test_partial_list_does_not_prove_sold_out(self):
        self.assertFalse(digest.is_sold_out_presale({"status": "預售屋", "url": "https://example.com/a"}, set()))

    def test_listing_cards_are_not_project_cards(self):
        html = '<a href="/community/L123?mode=buy">英倫花都</a> 開價 55~58萬 預售屋 <a href="/community/L123">931萬 1刊登 大樓 英倫花都 19.00坪 2房 15樓</a> 新成屋'
        items = digest.parse_project_blocks(html)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["name"], "英倫花都")
        self.assertNotIn("新成屋", items[0]["status"])

    def test_status_does_not_bleed_from_next_card(self):
        html = '<a href="/community/L1">甲案</a> <a href="/community/L2">乙案</a> 開價 待定 預售屋'
        items = digest.parse_project_blocks(html)
        self.assertEqual(items[0]["status"], "")

    def test_coverage_is_not_completeness_claim(self):
        notice = digest.coverage_notice([{"stale": False, "price_fetch_error": "blocked"}])
        self.assertIn("取得部分資料 1/1", notice)
        self.assertIn("不代表", notice)

    def checkpoint(self):
        ledger = {}
        digest.record_bargain_delivery(ledger, "test", [ITEM], NOW)
        return ledger["delivery_state"]["test"]

    def changes(self, items, state=None):
        return digest.get_new_bargain_watch_items({"all_items": items}, state or self.checkpoint())

    def test_first_seen_is_not_silently_baselined(self):
        self.assertEqual(len(digest.get_new_bargain_watch_items({"items": [ITEM]}, {})), 1)

    def test_unchanged_is_silent(self):
        self.assertEqual(self.changes([ITEM]), [])

    def test_tracking_url_does_not_repeat(self):
        self.assertEqual(self.changes([{**ITEM, "url": ITEM["url"] + "?utm_source=other"}]), [])

    def test_price_must_drop_three_percent(self):
        self.assertEqual(self.changes([{**ITEM, "low_price": 39}]), [])
        self.assertEqual(len(self.changes([{**ITEM, "low_price": 38.8}])), 1)
        self.assertEqual(self.changes([{**ITEM, "low_price": 41}]), [])

    def test_price_text_is_not_a_lifecycle_change(self):
        self.assertEqual(self.changes([{**ITEM, "status": "39-44萬/坪 預售屋", "low_price": 39}]), [])

    def test_status_change(self):
        self.assertEqual(self.changes([{**ITEM, "status": "完銷 預售屋"}])[0]["alert_reason"], "銷售階段改變")

    def test_outage_does_not_clear_checkpoint(self):
        state = self.checkpoint()
        before = copy.deepcopy(state)
        self.assertEqual(self.changes([], state), [])
        self.assertEqual(state, before)
        self.assertEqual(self.changes([ITEM], state), [])

    def test_cumulative_drop_uses_last_notification(self):
        state = self.checkpoint()
        self.changes([{**ITEM, "low_price": 39.5}], state)
        self.assertEqual(len(self.changes([{**ITEM, "low_price": 38.5}], state)), 1)

    def test_duplicate_source_is_only_one_candidate(self):
        self.assertEqual(len(digest.get_new_bargain_watch_items({"items": [ITEM, ITEM]}, {})), 1)

    def test_different_district_is_a_different_project(self):
        self.assertEqual(len(self.changes([{**ITEM, "area_name": "中壢區"}])), 1)

    def test_broad_comparison_is_low_confidence(self):
        self.assertTrue(digest.comparison_confidence(ITEM).startswith("低"))
        self.assertTrue(digest.comparison_confidence({}).startswith("低"))

    def test_stale_macro_must_not_say_zero_presales(self):
        result = digest.build_macro_summary([{"name": "A7", "stale": True}], [], [])
        self.assertIn("資料不足", "".join(result))
        self.assertNotIn("沒有預售", "".join(result))

    def test_missing_pdf_metrics_are_not_zero(self):
        rows = digest.extract_area_pdf_metrics([("A7", ["來源網站限制自動讀取；本期不提供該區數量或價格結論。\n"])], ["A7"])
        self.assertTrue(rows[0]["stale"])
        self.assertIsNone(rows[0]["active"])
        self.assertIsNone(digest.make_pdf_supply_chart(rows, "Helvetica"))

    def test_short_line_contains_prices_url_confidence_coverage(self):
        items = [{**ITEM, "name": f"測試{i}"} for i in range(5)]
        msg = digest.new_pdf_line_message([{"name": "A7", "stale": True}], NOW, "https://example.com/report.pdf", "週報", {"items": items})
        self.assertEqual(msg.count("開價低點"), 3)
        self.assertIn("比較可信度低", msg)
        self.assertIn(ITEM["url"], msg)
        self.assertIn("0/1 區", msg)
        self.assertLess(len(msg), 1800)

    def test_readable_errors_do_not_leak_technical_urls(self):
        error = "Cloudflare challenge https://example.com/private?token=secret"
        report = digest.new_report_content([{"name": "A7", "stale": True, "fetch_error": error}], {}, NOW, {"enabled": True, "items": [], "errors": [error]})
        self.assertNotIn("secret", report)
        self.assertNotIn("Cloudflare", report)
        self.assertIn("限制自動讀取", report)

    def test_unsent_ledger_does_not_block_retry(self):
        ledger = {"ledger": [{"task_id": "test", "date": "2026-10-23", "weekly_report_key": "week", "line_sent": False}]}
        self.assertFalse(digest.test_ledger_already_ran(ledger, "test", "2026-10-23"))
        self.assertFalse(digest.test_weekly_report_already_sent(ledger, "test", "week"))

    def test_prepared_delivery_persists_only_after_success_and_deduplicates(self):
        # Use a workspace temp root on Windows restricted hosts.
        temp_root = Path(__file__).resolve().parents[2] / "tmp"
        temp_root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=temp_root) as folder:
            manifest = Path(folder) / "manifest.json"
            ledger = Path(folder) / "ledger.json"
            manifest.write_text(json.dumps({"message": "test", "local_now": NOW.isoformat(), "task_id": "test", "report_path": "preview.pdf", "bargain_items": [ITEM]}), encoding="utf-8")
            config = {"LINE_CHANNEL_ACCESS_TOKEN": "test-token", "LINE_MODE": "push", "LINE_TO": "test-recipient", "SYNC_LEDGER_PATH": str(ledger)}
            with patch.dict("os.environ", {}, clear=True), patch.object(digest, "send_line_push", side_effect=RuntimeError("failed")):
                with self.assertRaises(RuntimeError):
                    digest.send_prepared_line_notification(config, manifest)
                self.assertFalse(ledger.exists())
            with patch.dict("os.environ", {}, clear=True), patch.object(digest, "send_line_push") as send:
                digest.send_prepared_line_notification(config, manifest)
                digest.send_prepared_line_notification(config, manifest)
                self.assertEqual(send.call_count, 1)
            saved = json.loads(ledger.read_text(encoding="utf-8"))
            self.assertEqual(self.changes([ITEM], saved["delivery_state"]["test"]), [])


if __name__ == "__main__":
    unittest.main()
