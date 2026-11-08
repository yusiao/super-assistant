import argparse
from datetime import date
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from collect_national_listings import card, detail, collect, index, investment_companies
from listing_payload import payload, objects


class ListingTests(unittest.TestCase):
    def test_payload_references_cycles_and_no_eval(self):
        value = payload('<script id="__NUXT_DATA__">[{"x":1,"self":0},["Ref",2],"hello"]</script>')
        self.assertIs(value["self"], value)
        self.assertEqual(value["x"], "hello")
        self.assertEqual(len(list(objects(value))), 1)
        for raw in ('[{"x":99}]', '[{"x":100}]', 'process.exit()', '[{"x":1},["Unknown",2],0]'):
            with self.assertRaises((ValueError, IndexError)):
                payload('<script id="__NUXT_DATA__">'+raw+'</script>')

    def project(self):
        return card({"hid":123,"build_name":"測試","region":"台北市","section":"大同區",
                     "address":"臺北市大同區某路","build_type_val":1,"TW591_TOKEN":"secret"}, "台北市")

    def item(self, **kwargs):
        return {"hid":123,"build_name":"測試","build_type_name":"預售屋",
                "deal_time_v2":{"date":"預計2031年第二季度"}, "map":{"lng":121.5,"lat":25.1},
                "sell_time":{"sell_status_txt":"在售"}, **kwargs}

    def test_allowlist_and_strict_stages(self):
        p = self.project()
        self.assertNotIn("secret", json.dumps(p))
        self.assertEqual(p["category"], "listed_presale")
        self.assertEqual(detail({"housing":self.item()},p,date(2026,11,7))["category"], "active")
        self.assertEqual(detail({"housing":self.item(build_type_name="新成屋")},p,date(2026,11,7))["category"], "completed")
        self.assertEqual(detail({"housing":self.item(deal_time_v2={"date":"2025年12月"})},p,date(2026,11,7))["category"], "status_unknown")
        self.assertEqual(detail({"housing":self.item(build_type_name="預推案",sell_time={})},p,date(2026,11,7))["category"], "pending")
        self.assertEqual(detail({"housing":self.item(sell_time={"sell_status_txt":"完銷"})},p,date(2026,11,7))["category"], "sold_out")
        with self.assertRaises(ValueError):
            detail({"housing":self.item(build_name="不同案")},p,date(2026,11,7))

    def test_index_schema(self):
        with self.assertRaises(ValueError):
            index({"data":{"items":[]}})

    def test_investment_company_and_permit_are_independent_of_other_roles(self):
        names = "示例營建機構－甲乙建設有限公司及丙丁開發股份有限公司、甲乙建設有限公司、王小明"
        expected = ["甲乙建設有限公司", "丙丁開發股份有限公司"]
        self.assertEqual(investment_companies(names), expected)
        permit = "(115)府建字第00009號"
        raw = self.item(company=names, build_company="營造公司有限公司", sell_company="行銷有限公司", license=permit)
        p = detail({"housing":raw}, self.project(), date(2026,11,8))
        self.assertEqual(p["development_companies"], expected)
        self.assertEqual(p["building_permit"], permit)
        updated = detail({"housing":self.item(company="尚未公開", license="待定")}, p, date(2026,11,8))
        self.assertNotIn("development_companies", updated)
        self.assertNotIn("building_permit", updated)

    def test_new_home_needs_actual_recent_handover_and_current_sale(self):
        completed = {"type": "handover", "deal": 1, "date": "2025年第三季度"}
        price = {"price": "48~52", "unit": "萬/坪", "pending": 0}
        item = self.item(build_type_name="新成屋", deal_time_v2=completed, price_unit=price, purpose_name="住宅大樓")
        today = date(2026, 11, 7)
        verified = detail({"housing": item}, self.project(), today)
        self.assertEqual((verified["category"], verified["price"], verified["price_unit"]), ("new_home", "48~52", "萬/坪"))
        self.assertEqual(verified["property_style"], "住宅大樓")
        for change in ({"build_type_name": "中古屋"}, {"deal_time_v2": {**completed, "date": "2020年03月"}},
                       {"deal_time_v2": {**completed, "deal": 0}}, {"sell_time": {"sell_status_txt": "完銷"}}):
            self.assertEqual(detail({"housing": {**item, **change}}, self.project(), today)["category"], "completed")
        self.assertEqual(detail({"housing": {**item, "price_unit": {**price, "pending": 1}}}, self.project(), today)["price"], "")
        self.assertEqual(card({"hid":123,"build_name":"測試","region":"台北市","section":"大同區",
                               "address":"某路","build_type_val":2}, "臺北市")["category"], "listed_new_home")

    def test_public_file_has_only_curated_fields(self):
        file=Path(__file__).with_name("site")/"national-listings.json"
        if not file.exists():
            self.skipTest("No generated public snapshot")
        allowed={"id","name","city","district","address","url","source","source_updated","circle_id","circle","price","price_unit","area","layout","platform_type","category","listed_on","verified_on","last_attempted_on","coordinates","construction","sales_evidence","completion","opening","property_style","development_companies","building_permit"}
        for source in (file,file.with_name("national-new-homes.json")):
            output=json.loads(source.read_text(encoding="utf-8"))
            for p in output["projects"]:
                self.assertLessEqual(p.keys(),allowed)
                self.assertRegex(p["url"],r"^https://newhouse\.591\.com\.tw/\d+$")
                self.assertIn(p["category"],{"active","pending","sold_out","completed","status_unknown","listed_presale","listed_pending","listed_new_home","new_home"})

    def test_unapplied_pagination_is_not_success(self):
        meta={"total":2,"total_page":2,"page":1,"per_page":1,"items":[
            {"hid":123,"build_name":"測試","region":"台北市","section":"大同區","address":"某路","purpose_str":"住家用","build_type_val":1}]}
        with tempfile.TemporaryDirectory() as tmp:
            args=argparse.Namespace(output=Path(tmp)/"safe.json",regions=["1"],probe=False,index_only=True,max_pages=5,detail_limit=0)
            class FakeReader:
                blocked=False
                def __call__(self,url):
                    return {"listing":meta}
            with patch("collect_national_listings.Reader",FakeReader),patch("collect_national_listings.regions",return_value={"1":"台北市"}):
                result=collect(args)
            self.assertEqual(result["regions"]["1"]["status"],"partial")
            self.assertEqual(result["regions"]["1"]["pages"],1)
            self.assertNotIn("TW591_TOKEN",args.output.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
