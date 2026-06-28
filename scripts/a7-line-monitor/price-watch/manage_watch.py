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


def add_product(args: argparse.Namespace) -> int:
    path = Path(args.config_path)
    data = read_config(path)
    watch_id = args.id or slugify(args.name)
    require_unique_id(data, watch_id)

    sources: list[dict[str, Any]] = []
    if args.url:
        source: dict[str, Any] = {
            "type": "html",
            "id": args.source_id or "product-page",
            "name": args.source_name or "商品頁",
            "url": args.url,
        }
        if args.price_regex:
            source["price_regex"] = args.price_regex
        sources.append(source)
    if args.shopping_query:
        sources.append(
            {
                "type": "serpapi_google_shopping",
                "id": "google-shopping",
                "name": "Google Shopping",
                "query": args.shopping_query,
                "gl": args.gl,
                "hl": args.hl,
                "currency": args.currency,
                "limit": args.limit,
            }
        )
    if not sources:
        raise RuntimeError("Add at least --url or --shopping-query for a product watch.")

    watch = {
        "enabled": args.enabled,
        "id": watch_id,
        "type": "product",
        "name": args.name,
        "currency": args.currency,
        "target_price": args.target_price,
        "alert_on_new_low": True,
        "alert_cooldown_days": args.cooldown_days,
        "sources": sources,
    }
    data["watches"].append(watch)
    write_config(path, data)
    print(f"Added product watch: {watch_id}")
    return 0


def add_flight(args: argparse.Namespace) -> int:
    path = Path(args.config_path)
    data = read_config(path)
    if args.mode == "date_window" and not args.start_date:
        raise RuntimeError("--start-date is required when --mode=date_window")
    mode_label = "未來一年最低" if args.mode == "annual_low" else f"{args.start_date} 起 {args.lookahead_days} 天"
    default_name = f"{args.departure_id}->{args.arrival_id} {mode_label}"
    name = args.name or default_name
    watch_id = args.id or slugify(name)
    require_unique_id(data, watch_id)

    source: dict[str, Any] = {
        "type": "skyscanner_indicative_flights",
        "id": "skyscanner-indicative",
        "name": "Skyscanner Indicative",
        "mode": args.mode,
        "departure_id": args.departure_id,
        "arrival_id": args.arrival_id,
        "start_date": args.start_date,
        "horizon_days": 365 if args.mode == "annual_low" else args.lookahead_days,
        "lookahead_days": args.lookahead_days,
        "trip_days": args.trip_days,
        "currency": args.currency,
        "market": args.market,
        "locale": args.locale,
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
    watches = [watch for watch in data.get("watches", []) if isinstance(watch, dict)]
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
    watch["enabled"] = enabled
    write_config(path, data)
    print(f"{'Enabled' if enabled else 'Disabled'} watch: {args.id}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-path", default=str(DEFAULT_CONFIG_PATH))
    subparsers = parser.add_subparsers(dest="command", required=True)

    product = subparsers.add_parser("add-product")
    product.add_argument("--id", default="")
    product.add_argument("--name", required=True)
    product.add_argument("--target-price", required=True, type=float)
    product.add_argument("--currency", default="TWD")
    product.add_argument("--url", default="")
    product.add_argument("--source-id", default="")
    product.add_argument("--source-name", default="")
    product.add_argument("--price-regex", default="")
    product.add_argument("--shopping-query", default="")
    product.add_argument("--gl", default="tw")
    product.add_argument("--hl", default="zh-tw")
    product.add_argument("--limit", default=8, type=int)
    product.add_argument("--cooldown-days", default=7, type=int)
    product.add_argument("--enabled", action="store_true")
    product.set_defaults(handler=add_product)

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
    flight.add_argument("--check-interval-hours", default=12, type=int)
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
