import io
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile
from unittest.mock import patch

import a7_leju_digest as digest
from publish_site import stage_weekly
from public_site import build_public_data, export_public_site


class WeeklyPublicationTests(unittest.TestCase):
    def test_public_bundle_uses_matching_taipei_date_and_allowlist(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            export_public_site([{"name":"A7"}], datetime(2026,10,31,18,tzinfo=timezone.utc), root/"public-site")
            (root/"public-site"/"state.json").write_text("private")
            (root/"a7-market-report-2026-10-31.pdf").write_bytes(b"%PDF-wrong-date")
            with self.assertRaises(FileNotFoundError):
                stage_weekly(root, root/"public")
            (root/"a7-market-report-2026-11-01.pdf").write_bytes(b"%PDF-matching-date")
            stage_weekly(root, root/"public")
            self.assertFalse((root/"public"/"state.json").exists())
            self.assertTrue((root/"public"/"index.html").is_file())
            self.assertTrue(json.loads((root/"public"/"market-data.json").read_text(encoding="utf8"))["pdf_available"])

    def test_only_matching_official_transactions_survive_leju_failure(self):
        buf = io.BytesIO()
        fields = "鄉鎮市區,建案名稱,交易年月日,棟及號,總價元,解約情形\n"
        with ZipFile(buf,"w") as z:
            z.writestr("h_lvr_land_b.csv",fields+"龜山區,甲,1150917,A,12345678,\n龜山區,甲乙,1150920,B,15000000,\n中壢區,甲,1150919,C,20000000,\n龜山區,甲,1150920,D,9999999,已解約\n")
            z.writestr("h_lvr_land_a.csv", fields+"龜山區,甲,1150920,成屋,20000000,\n")
        mapping = [{"name":"甲","url":"https://www.leju.com.tw/community/L1","area_name":"A7"}]
        area = {"name":"A7","stale":True,"pending_launch_projects":[{"name":"舊案","url":"https://www.leju.com.tw/community/L2"}]}
        with patch.object(digest,"fetch_bytes",return_value=buf.getvalue()):
            rows = digest.get_official_presale_registrations("test",mapping)
        digest.attach_official_presale_registrations([area],rows,mapping)
        result = build_public_data([area], datetime.now(timezone.utc))["areas"][0]
        self.assertEqual(result["availability"], "unavailable")
        self.assertEqual(result["projects"], [])
        self.assertEqual([t["unit"] for t in result["transactions"]], ["A"])
        with self.assertRaises(ValueError):
            digest.iter_csv_rows_from_archive(b"<html>Access denied</html>")
