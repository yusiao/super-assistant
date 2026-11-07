from datetime import date
import json
from pathlib import Path
import unittest

from build_national_market import address_key, comparable, comparable_presale, presale_name_corrections, stats
from refresh_national_market import seasons, links


class NationalMarketTest(unittest.TestCase):
    def test_public_resource_discovery(self):
        html = ''.join('<a href="https://plvr.land.moi.gov.tw//DownloadSeason?season='+s+'&amp;type=zip&amp;fileName=lvr_landcsv.zip">CSV</a>' for s in ("115S2","113S4","115S3"))
        self.assertEqual([s for s,_ in seasons(html)], ["115S2","115S3"])
        self.assertEqual(links('<a href="https://evil.com/f.csv">bad</a>',"data.taipei"),[])
        with self.assertRaises(ValueError):
            seasons('<a href="https://evil.com/115S3">bad</a>')
    def record(self):
        row = [""] * 34
        values = {1: "房地(土地+建物)+車位", 7: "1150603", 8: "土地1建物1車位1",
                  11: "住宅大樓(11層含以上有電梯)", 12: "住家用", 14: "1110603",
                  15: "125", 21: "12000000", 24: "25", 25: "2000000", 27: "id"}
        for i, value in values.items():
            row[i] = value
        return row

    def comparable(self, row):
        return comparable(row, date(2026, 1, 1), date(2026, 9, 10))

    def test_net_price_and_area(self):
        sample = self.comparable(self.record())
        self.assertEqual(sample, ("2026-06-03", 10000000, 100))
        self.assertIsNone(stats([sample] * 4)["mean"])
        self.assertEqual(stats([sample] * 5)["mean"], 33.06)
        self.assertEqual(stats([sample] * 4 + [("2026-06-04", 30000000, 200)])["mean"], 38.57)

    def test_exclusions(self):
        for i, value in [(14, "1100602"), (14, "1160603"), (26, "親友交易"),
                         (25, "0"), (11, "透天厝"), (12, "商業用"), (7, "1151001")]:
            row = self.record()
            row[i] = value
            self.assertIsNone(self.comparable(row))

    def test_presale_is_separate_from_completed_and_excludes_cancellations(self):
        start, end = date(2026, 2, 11), date(2026, 8, 10)
        row = self.record()
        row[9], row[12], row[14], row[28] = "十層", "住商用", "", "測試案"
        self.assertEqual(comparable_presale(row, start, end), ("2026-06-03", 10000000, 100))
        self.assertIsNone(self.comparable(row))
        for column, value in [(30, "1150701全部解約"), (9, "一層"), (12, "商業用"), (7, "1150811"),
                              (24, "0"), (26, "特殊交易"), (28, "")]:
            changed = list(row)
            changed[column] = value
            self.assertIsNone(comparable_presale(changed, start, end))

    def test_encoding_correction_requires_matching_official_filing(self):
        town = "桃園市/龜山區"
        filed = {"name":"丰嶺?林", "address":"文化村2鄰文昌一街30號等", "permit":"桃市都建執照字第會龜00076-01號"}
        self.assertEqual(presale_name_corrections({"id":(town, date(2026, 2, 11), filed)}),
                         {(town, "丰嶺?林", "文昌一街30號"): "丰嶺彡林"})
        self.assertEqual(presale_name_corrections({"id":(town, date(2026, 2, 11), {**filed,"permit":"不同建照"})}), {})

    def test_addresses(self):
        self.assertEqual(address_key("桃園市龜山區文化三路一段３８５號十二樓之２", "桃園市", "龜山區"),
                         "文化三路1段385號")
        self.assertEqual(address_key("文化村2鄰文昌一街30號等", "桃園市", "龜山區"), "文昌一街30號")
        self.assertEqual(address_key("善捷段60地號", "桃園市", "龜山區"), "")

    def test_published_snapshot(self):
        path = Path(__file__).with_name("site") / "national-market.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(len(data["districts"]), 368)
        self.assertEqual(len({key.split("/")[0] for key in data["districts"]}), 22)
        for scope in [*data["districts"].values(), *data["areas"].values()]:
            for key in scope["filings"] + scope.get("nearby", []):
                self.assertIn(key, data["filings"])
            for stats_ in (scope.get("price"), scope.get("nearby_price"), scope.get("presale_price"),
                           scope.get("nearby_presale_price"), *scope.get("presale_projects", [])):
                if stats_ and stats_["count"] < 5:
                    self.assertIsNone(stats_["mean"])
            self.assertEqual(sum(p["count"] for p in scope["presale_projects"]), scope["presale_price"]["count"])
            for project in scope["presale_projects"]:
                self.assertLessEqual(project.keys(), {"name", "count", "mean", "first", "last"})
        self.assertEqual(data["national"]["presale_price"]["count"],
                         sum(d["presale_price"]["count"] for d in data["districts"].values()))
        for station in ("a7", "a8", "a9"):
            self.assertTrue(data["areas"][station]["filings"] or data["areas"][station]["nearby"])


if __name__ == "__main__":
    unittest.main()
