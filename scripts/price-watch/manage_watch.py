from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


DEFAULT_CONFIG_PATH = Path(__file__).with_name("price-watch-config.json")


def read_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"watches": []}
    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        return {"watches": []}
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise RuntimeError(f"Config must be a JSON object: {path}")
    watches = data.get("watches")
    if not isinstance(watches, list):
        data["watches"] = []
    return data


def write_config(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return slug[:80] if slug else "watch"


def find_watch(data: dict[str, Any], watch_id: str) -> dict[str, Any] | None:
    for watch in data.get("watches", []):
        if isinstance(watch, dict) and watch.get("id") == watch_id:
            return watch
    return None


def require_unique_id(data: dict[str, Any], watch_id: str) -> None:
    if find_watch(data, watch_id):
        raise RuntimeError(f"Watch id already exists: {watch_id}")


def add_flight(args: argparse.Namespace) -> int:
    path = Path(args.config_path)
    data = read_config(path)
    if args.mode == "date_window" and not args.start_date:
        raise RuntimeError("--start-date is required when --mode=date_window")
    mode_label = "未來一年低價探索" if args.mode == "annual_low" else f"{args.start_date} 起 {args.lookahead_days} 天"
    trip_label = f"{args.trip_days} 天為主" if args.trip_days else "單程"
    default_name = f"{args.departure_id}->{args.arrival_id} {mode_label} · {trip_label}"
    name = args.name or default_name
    watch_id = args.id or slugify(name)
    require_unique_id(data, watch_id)
    trip_day_options = sorted({days for days in range(args.trip_days - 2, args.trip_days + 3) if 1 <= days <= 60}) if args.trip_days else [0]

    source: dict[str, Any] = {
        "type": "serpapi_google_flights_sampled",
        "id": "google-flights-sampled",
        "name": "Google Flights 抽樣",
        "mode": args.mode,
        "departure_id": args.departure_id,
        "arrival_id": args.arrival_id,
        "start_date": args.start_date,
        "horizon_days": 365 if args.mode == "annual_low" else args.lookahead_days,
        "lookahead_days": args.lookahead_days,
        "trip_days": args.trip_days,
        "trip_day_options": trip_day_options,
        "currency": args.currency,
        "market": args.market,
        "locale": args.locale,
        "travel_class": args.travel_class,
        "cabin_class": {"1": "economy", "2": "premium_economy", "3": "business"}[args.travel_class],
        "cabin_label": {"1": "經濟艙", "2": "豪華經濟艙", "3": "商務艙"}[args.travel_class],
        "check_interval_hours": args.check_interval_hours,
    }

    watch = {
        "enabled": args.enabled,
        "id": watch_id,
        "type": "flight",
        "name": name,
        "currency": args.currency,
        "target_price": args.target_price,
        "alert_on_new_low": True,
        "alert_on_first_seen": args.mode == "annual_low",
        "alert_strategy": "annual_floor" if args.mode == "annual_low" else "target_or_new_low",
        "alert_cooldown_days": args.cooldown_days,
        "sources": [source],
    }
    data["watches"].append(watch)
    write_config(path, data)
    print(f"Added flight watch: {watch_id}")
    return 0


def list_watches(args: argparse.Namespace) -> int:
    data = read_config(Path(args.config_path))
    watches = [watch for watch in data.get("watches", []) if isinstance(watch, dict) and watch.get("type") == "flight"]
    if not watches:
        print("No watches configured.")
        return 0
    for watch in watches:
        status = "enabled" if watch.get("enabled", True) else "disabled"
        target = watch.get("target_price", "")
        print(f"{watch.get('id')} | {status} | {watch.get('type')} | {watch.get('name')} | target={target}")
    return 0


def set_enabled(args: argparse.Namespace, enabled: bool) -> int:
    path = Path(args.config_path)
    data = read_config(path)
    watch = find_watch(data, args.id)
    if not watch:
        raise RuntimeError(f"Watch id not found: {args.id}")
    if enabled and watch.get("type") != "flight":
        raise RuntimeError("Only flight watches can be enabled.")
    watch["enabled"] = enabled
    write_config(path, data)
    print(f"{'Enabled' if enabled else 'Disabled'} watch: {args.id}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-path", default=str(DEFAULT_CONFIG_PATH))
    subparsers = parser.add_subparsers(dest="command", required=True)

    flight = subparsers.add_parser("add-flight")
    flight.add_argument("--id", default="")
    flight.add_argument("--name", default="")
    flight.add_argument("--target-price", type=float)
    flight.add_argument("--departure-id", required=True)
    flight.add_argument("--arrival-id", required=True)
    flight.add_argument("--mode", choices=["annual_low", "date_window"], default="annual_low")
    flight.add_argument("--start-date", default="")
    flight.add_argument("--trip-days", default=0, type=int)
    flight.add_argument("--lookahead-days", default=30, type=int)
    flight.add_argument("--currency", default="TWD")
    flight.add_argument("--market", default="TW")
    flight.add_argument("--locale", default="zh-TW")
    flight.add_argument("--travel-class", choices=["1", "2", "3"], default="1")
    flight.add_argument("--check-interval-hours", default=24, type=int)
    flight.add_argument("--cooldown-days", default=3, type=int)
    flight.add_argument("--enabled", action="store_true")
    flight.set_defaults(handler=add_flight)

    listing = subparsers.add_parser("list")
    listing.set_defaults(handler=list_watches)

    enable = subparsers.add_parser("enable")
    enable.add_argument("id")
    enable.set_defaults(handler=lambda args: set_enabled(args, True))

    disable = subparsers.add_parser("disable")
    disable.add_argument("id")
    disable.set_defaults(handler=lambda args: set_enabled(args, False))
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        return int(args.handler(args))
    except Exception as exc:
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
