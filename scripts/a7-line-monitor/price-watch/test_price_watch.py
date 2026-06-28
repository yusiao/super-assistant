from __future__ import annotations

import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def load_module(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


price_watch = load_module("price_watch", "price_watch.py")
manage_watch = load_module("manage_watch", "manage_watch.py")


class PriceWatchTests(unittest.TestCase):
    def test_extract_price_from_twd_text(self) -> None:
        value = price_watch.extract_price("<html><body>售價 NT$18,900</body></html>")
        self.assertEqual(value, 18900.0)

    def test_extract_price_from_json_ld(self) -> None:
        value = price_watch.extract_price('{"offers":{"price":"1299","priceCurrency":"TWD"}}')
        self.assertEqual(value, 1299.0)

    def test_manage_watch_add_product(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            config_path = Path(tmpdir) / "price-watch-config.json"
            args = manage_watch.build_parser().parse_args(
                [
                    "--config-path",
                    str(config_path),
                    "add-product",
                    "--id",
                    "ipad-test",
                    "--name",
                    "iPad Test",
                    "--target-price",
                    "10000",
                    "--shopping-query",
                    "iPad Test",
                    "--enabled",
                ]
            )
            with redirect_stdout(io.StringIO()):
                self.assertEqual(args.handler(args), 0)
            data = json.loads(config_path.read_text(encoding="utf-8"))
            watch = data["watches"][0]
            self.assertEqual(watch["id"], "ipad-test")
            self.assertTrue(watch["enabled"])
            self.assertEqual(watch["sources"][0]["type"], "serpapi_google_shopping")

    def test_manage_watch_add_annual_low_flight(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            config_path = Path(tmpdir) / "price-watch-config.json"
            args = manage_watch.build_parser().parse_args(
                [
                    "--config-path",
                    str(config_path),
                    "add-flight",
                    "--id",
                    "tpe-tyo-test",
                    "--departure-id",
                    "TPE",
                    "--arrival-id",
                    "TYO",
                    "--mode",
                    "annual_low",
                    "--trip-days",
                    "5",
                    "--enabled",
                ]
            )
            with redirect_stdout(io.StringIO()):
                self.assertEqual(args.handler(args), 0)
            data = json.loads(config_path.read_text(encoding="utf-8"))
            watch = data["watches"][0]
            source = watch["sources"][0]
            self.assertEqual(source["type"], "serpapi_google_flights_sampled")
            self.assertEqual(source["departure_id"], "TPE")
            self.assertEqual(source["mode"], "annual_low")
            self.assertEqual(source["trip_days"], 5)
            self.assertTrue(watch["alert_on_first_seen"])

    def test_manage_watch_add_date_window_flight(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            config_path = Path(tmpdir) / "price-watch-config.json"
            args = manage_watch.build_parser().parse_args(
                [
                    "--config-path",
                    str(config_path),
                    "add-flight",
                    "--id",
                    "tpe-tyo-window",
                    "--departure-id",
                    "TPE",
                    "--arrival-id",
                    "TYO",
                    "--mode",
                    "date_window",
                    "--start-date",
                    "2026-09-01",
                    "--trip-days",
                    "5",
                    "--lookahead-days",
                    "30",
                    "--target-price",
                    "8000",
                ]
            )
            with redirect_stdout(io.StringIO()):
                self.assertEqual(args.handler(args), 0)
            data = json.loads(config_path.read_text(encoding="utf-8"))
            source = data["watches"][0]["sources"][0]
            self.assertEqual(source["mode"], "date_window")
            self.assertEqual(source["start_date"], "2026-09-01")
            self.assertEqual(source["lookahead_days"], 30)

    def test_skyscanner_quote_filtering(self) -> None:
        original_post_json = price_watch.post_json
        price_watch.post_json = lambda *args, **kwargs: {
            "content": {
                "results": {
                    "quotes": {
                        "one": {
                            "minPrice": {"amount": "7800"},
                            "outboundLeg": {"departureDate": {"year": 2026, "month": 9, "day": 10}},
                            "inboundLeg": {"departureDate": {"year": 2026, "month": 9, "day": 15}},
                        },
                        "wrong-duration": {
                            "minPrice": {"amount": "7000"},
                            "outboundLeg": {"departureDate": {"year": 2026, "month": 9, "day": 12}},
                            "inboundLeg": {"departureDate": {"year": 2026, "month": 9, "day": 20}},
                        },
                    }
                }
            }
        }
        try:
            watch = {"id": "flight-test", "type": "flight", "currency": "TWD"}
            source = {
                "type": "skyscanner_indicative_flights",
                "mode": "date_window",
                "departure_id": "TPE",
                "arrival_id": "TYO",
                "start_date": "2026-09-01",
                "lookahead_days": 30,
                "trip_days": 5,
            }
            candidates = price_watch.get_skyscanner_indicative_candidates(
                watch,
                source,
                {"SKYSCANNER_API_KEY": "test"},
                10,
            )
        finally:
            price_watch.post_json = original_post_json
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["price"], 7800.0)
        self.assertEqual(candidates[0]["raw"]["departure_date"], "2026-09-10")
        self.assertEqual(candidates[0]["raw"]["return_date"], "2026-09-15")

    def test_flight_year_average_uses_latest_price_per_departure_date(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            db = price_watch.connect_db(Path(tmpdir) / "price-watch.sqlite3")
            base = {
                "watch_id": "flight-average",
                "item_type": "flight",
                "source_name": "Skyscanner Indicative",
                "url": "https://example.com/flight",
                "title": "TPE->TYO",
                "currency": "TWD",
                "available": True,
                "error": "",
            }
            observations = [
                ("2026-07-01", 8000, "2026-06-01T00:00:00+08:00"),
                ("2026-07-01", 7000, "2026-06-02T00:00:00+08:00"),
                ("2026-08-01", 9000, "2026-06-02T00:00:00+08:00"),
                ("2025-08-01", 10000, "2025-06-02T00:00:00+08:00"),
            ]
            for index, (departure_date, price, observed_at) in enumerate(observations):
                price_watch.insert_observation(
                    db,
                    {
                        **base,
                        "source_id": f"quote-{index}",
                        "price": price,
                        "raw": {"departure_date": departure_date},
                    },
                    observed_at,
                )
            db.commit()
            average, sample_count = price_watch.get_flight_year_average(db, "flight-average", 2026)
            previous_average, previous_count = price_watch.get_flight_year_average(db, "flight-average", 2025)
            db.close()
        self.assertEqual(average, 8000)
        self.assertEqual(sample_count, 2)
        self.assertEqual(previous_average, 10000)
        self.assertEqual(previous_count, 1)


if __name__ == "__main__":
    unittest.main()
