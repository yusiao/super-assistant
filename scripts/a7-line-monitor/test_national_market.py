from datetime import date
import json
from pathlib import Path
import unittest

from build_national_market import address_key, comparable, stats


class NationalMarketTest(unittest.TestCase):
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
            for stats_ in (scope.get("price"), scope.get("nearby_price")):
                if stats_ and stats_["count"] < 5:
                    self.assertIsNone(stats_["mean"])
        for station in ("a7", "a8", "a9"):
            self.assertTrue(data["areas"][station]["filings"] or data["areas"][station]["nearby"])


if __name__ == "__main__":
    unittest.main()
