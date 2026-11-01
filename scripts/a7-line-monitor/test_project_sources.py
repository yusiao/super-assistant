import unittest
from datetime import datetime

from project_sources import (attach_projects, classify, collect_projects, completion_month,
                             fields, housefun_cards, merge_observations, observe, project_url)
from public_site import build_public_data

NOW = datetime(2026, 11, 1)
CONFIG = {"scope_address_keywords": ["文桃路"], "max_details_per_source": 5,
          "housefun_regions": [{"name": "test", "url": "https://index.test/", "max_pages": 2}]}


def html(**values):
    return "<title>A7 testing</title>" + "".join(f"<th>{k}</th><td>{v}</td>" for k, v in values.items())


def card(name="測試案", number="123"):
    return (f'<section class="building-case "><input name="buildIds" value="{number}">'
            f'<h3>{name}</h3><address><a>桃園市龜山區文桃路</a></address></section>')


def data(**changes):
    return {"建案型態": "預售屋", "銷售狀態": "熱銷中", "預期完工": "2028年第三季",
            "基地地址": "桃園市龜山區文桃路10號", "單價": "待定", **changes}


class ProjectSourcesTests(unittest.TestCase):
    def test_completion_formats(self):
        for text, expected in [("預計2028第三季", (2028, 9)), ("2031年上半年", (2031, 6)),
                               ("2031下半年", (2031, 12)), ("2028年2月", (2028, 2)), ("暫無", None)]:
            self.assertEqual(completion_month(text), expected)

    def test_price_pending_does_not_mean_pending_sale(self):
        self.assertEqual(classify(data(), NOW)[0], "active")
        self.assertEqual(classify(data(銷售狀態="預約賞屋"), NOW)[0], "status_unknown")

    def test_pending_requires_explicit_type_and_phase(self):
        self.assertEqual(classify(data(銷售狀態="未開賣", 預期完工="暫無"), NOW)[0], "pending")
        self.assertEqual(classify(data(銷售狀態="未開賣", 建案型態="暫無"), NOW)[0], "status_unknown")

    def test_completed_and_expired_are_not_presale(self):
        for change in [{"建案型態": "新成屋"}, {"使用執照": "113桃使123"}, {"交屋日期": "隨時交屋"}]:
            self.assertEqual(classify(data(**change), NOW)[0], "completed")
        self.assertEqual(classify(data(銷售狀態="未開賣", 預期完工="2025年上半年"), NOW)[0], "status_unknown")

    def test_sold_out_is_separate(self):
        self.assertEqual(classify(data(銷售狀態="完銷"), NOW)[0], "sold_out")

    def test_official_index_still_requires_future_completion(self):
        self.assertEqual(classify(data(銷售狀態=""), NOW, True)[0], "active")
        self.assertEqual(classify(data(銷售狀態="", 預期完工=""), NOW, True)[0], "status_unknown")

    def test_parsers_keep_unpriced_projects(self):
        self.assertEqual(housefun_cards(card())[0]["name"], "測試案")
        self.assertEqual(len(housefun_cards(card().replace('</section>', '"caseType":"新成屋"</section>'))), 1)
        self.assertEqual(fields('<mark>銷售狀態</mark><p>熱銷中</p>')["銷售狀態"], "熱銷中")
        self.assertEqual(fields('<p class="infoLabel">建案類型</p><p class="infoValue">預售屋</p>')["建案類型"], "預售屋")

    def test_base_location_not_reception(self):
        c = housefun_cards(card())[0]
        self.assertIsNone(observe(c, html(**data(基地地址="", 接待會館="桃園市龜山區文桃路")), NOW, CONFIG))
        self.assertIsNone(observe(c, html(**data(基地地址="新北市林口區文桃路")), NOW, CONFIG))
        self.assertIsNone(observe(c, html(**data(基地地址="桃園市龜山區忠義路")).replace("A7 testing", "A8 testing"), NOW, CONFIG))

    def test_current_discovery_not_watchlist(self):
        urls = []
        def fetch(url):
            urls.append(url)
            return card("當次新名稱", "999") if url == "https://index.test/" else html(**data())
        result = collect_projects(fetch, NOW, CONFIG)
        self.assertEqual([p["name"] for p in result["projects"]], ["當次新名稱"])
        self.assertIn("https://newhouse.housefun.com.tw/building/999/detail", urls)

    def test_failed_or_empty_source_never_invents_projects(self):
        def failed(url):
            raise RuntimeError("403")
        for fetch in [failed, lambda url: "<html></html>"]:
            result = collect_projects(fetch, NOW, CONFIG)
            self.assertEqual(result["projects"], [])
            self.assertTrue(result["sources"][0]["errors"])

    def test_one_source_failure_preserves_other_source(self):
        cfg = {**CONFIG, "housefun_regions": CONFIG["housefun_regions"] + [{"name": "two", "url": "https://two.test/"}]}
        def fetch(url):
            if url == "https://index.test/":
                raise RuntimeError("blocked")
            return card() if url == "https://two.test/" else html(**data())
        result = collect_projects(fetch, NOW, cfg)
        self.assertEqual(len(result["projects"]), 1)

    def test_duplicate_sources_and_conflicting_stages(self):
        p = observe(housefun_cards(card())[0], html(**data()), NOW, CONFIG)
        official = {**p, "source": "愛山林官方", "url": "https://sample.jsl.com.tw/"}
        merged = merge_observations([p, official])
        self.assertEqual(len(merged), 1)
        self.assertEqual(len(merged[0]["sources"]), 2)
        self.assertEqual(merged[0]["source"], "愛山林官方")
        self.assertEqual(merge_observations([p, {**official, "category": "completed"}])[0]["category"], "completed")
        self.assertEqual(merge_observations([p, {**official, "category": "pending"}])[0]["category"], "status_unknown")

    def test_mapping_only_classifies_fresh_projects(self):
        cfg = [{"name": "postal", "project_url_mappings": [{"name": "測試案", "url": "https://www.leju.com.tw/community/L1"}]}]
        snapshots = [{"name": "postal", "stale": True}]
        attach_projects(snapshots, cfg, {"projects": [], "sources": []})
        self.assertTrue(snapshots[0]["stale"])
        p = merge_observations([observe(housefun_cards(card())[0], html(**data()), NOW, CONFIG)])[0]
        attach_projects(snapshots, cfg, {"projects": [p], "sources": []})
        self.assertEqual(snapshots[0]["active_presale_projects"][0]["name"], "測試案")
        attach_projects(snapshots, cfg, {"projects": [{**p, "name": "子區未知"}], "sources": []})
        self.assertTrue(snapshots[-1]["supplemental_scope"])

    def test_public_urls_sanitized(self):
        self.assertEqual(project_url("https://newhouse.housefun.com.tw/building/123/detail?token=secret"), "https://newhouse.housefun.com.tw/building/123")
        for url in ["https://newhouse.housefun.com.tw/private", "https://www.jsl.com.tw/admin", "https://jsl.com.tw.evil.org/",
                    "https://secret@nbm.jsl.com.tw/", "https://nbm.jsl.com.tw:444/", "javascript:alert(1)"]:
            self.assertEqual(project_url(url), "")

    def test_public_data_contains_alternative_url_and_provenance(self):
        p = merge_observations([observe(housefun_cards(card())[0], html(**data()), NOW, CONFIG)])[0]
        result = build_public_data([{"name": "test", "active_presale_projects": [p], "summary_parse_warning": "partial"}], NOW)
        public = result["areas"][0]["projects"][0]
        self.assertEqual(public["source"], "好房網")
        self.assertEqual(public["url"], p["url"])
        self.assertTrue(public["id"])
        self.assertNotIn("phase_evidence", public)

    def test_partial_data_cannot_claim_densest_subarea(self):
        from a7_leju_digest import build_macro_summary
        summary = " ".join(build_macro_summary([{"name": "A7", "active_presale_projects": [{}], "summary_parse_warning": "partial"}], [], []))
        self.assertNotIn("最密集的區塊", summary)
        self.assertIn("覆蓋不一", summary)

    def test_completion_year_is_not_price_trend(self):
        from a7_leju_digest import get_project_price_rise_watch
        current = {"name": "A7", "active_presale_projects": [{"name": "test", "source": "official", "price_text": "開價未公布", "status": "預計完工2032"}]}
        state = {"runs": [{"name": "A7", "active_presale_projects": [{"name": "test", "source": "official", "price_text": "開價未公布", "status": "預計完工2031"}]}]}
        self.assertEqual(get_project_price_rise_watch([current], state), [])

    def test_new_project_link_does_not_create_fake_new_transaction(self):
        from a7_leju_digest import get_new_registration_rows
        old = {"project_name": "test", "unit": "A1-8F", "total_price": "1500萬", "deal_date": "1150101", "url": "https://www.leju.com.tw/community/L123"}
        fresh = {**old, "url": "https://nbm.jsl.com.tw/"}
        self.assertEqual(get_new_registration_rows([fresh], {"latest_presale_registrations": [old]}), [])
        self.assertEqual(len(get_new_registration_rows([{**fresh, "deal_date": "1150201"}], {"latest_presale_registrations": [old]})), 1)


if __name__ == "__main__":
    unittest.main()
