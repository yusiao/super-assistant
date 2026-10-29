"""Publish only market data, never the scheduler state or delivery credentials."""
from datetime import datetime
from pathlib import Path
import json
import re
import shutil
from urllib.parse import urlsplit, urlunsplit


def public_url(value):
    try:
        parts = urlsplit(str(value or ""))
        if parts.scheme != "https" or parts.hostname not in {"www.leju.com.tw", "leju.com.tw"} or parts.username or parts.password:
            return ""
        if not re.fullmatch(r"/community/[A-Za-z0-9]+/?", parts.path):
            return ""
        return urlunsplit(("https", "www.leju.com.tw", parts.path.rstrip("/"), "", ""))
    except ValueError:
        return ""


def text(value):
    return str(value or "").strip()[:400]


def build_public_data(snapshots, generated_at):
    areas = []
    buckets = [("pending_launch_projects", "pending"), ("active_presale_projects", "active"),
               ("sold_out_presale_projects", "sold_out"), ("completed_projects", "completed")]
    for index, area in enumerate(snapshots):
        stale = bool(area.get("stale"))
        partial = stale or bool(area.get("summary_parse_warning")) or any(v for k, v in area.items() if k.endswith("fetch_error"))
        projects, transactions, seen = [], [], set()
        if not stale:
            for key, category in buckets:
                for item in area.get(key, []):
                    url = public_url(item.get("url"))
                    name, status = text(item.get("name")), text(item.get("status"))
                    if not url or not name or re.search(r"\d+\s*刊登|\d+(?:\.\d+)?\s*坪.*(?:房|樓)", name):
                        continue
                    if category in {"active", "pending"} and any(word in name + status for word in ["新成屋", "已完工", "已交屋", "完銷"]):
                        continue
                    if url in seen:
                        continue
                    seen.add(url)
                    projects.append({"id": url.rsplit("/", 1)[-1], "name": name, "url": url, "category": category, "status": status})
            transaction_keys = set()
            for key in ["latest_presale_registrations", "latest_new_completion_registrations"]:
                for row in area.get(key, []):
                    safe = {field: text(row.get(field)) for field in ["project_name", "unit", "floor", "area", "parking_price", "total_price", "unit_price", "deal_date"]}
                    safe["url"] = public_url(row.get("url"))
                    identity = json.dumps(safe, sort_keys=True)
                    if identity in transaction_keys:
                        continue
                    transaction_keys.add(identity)
                    transactions.append(safe)
        areas.append({"id": f"area-{index}", "name": text(area.get("name")),
                      "city": text(area.get("city_name") or "桃園市"), "district": text(area.get("district_name") or "龜山區"),
                      "theme": text(area.get("theme")), "roads": [text(v) for v in area.get("road_focus", [])],
                      "availability": "unavailable" if stale else "partial" if partial else "observed",
                      "projects": projects, "transactions": transactions})
    return {"schema_version": 1, "generated_at": generated_at.isoformat(), "areas": areas,
            "scope_note": "目前接入 A7 五個子區；建案與成交僅代表本次可取得內容，不是全市場完整清單。"}


def export_public_site(snapshots, generated_at, target):
    target = Path(target)
    target.mkdir(parents=True, exist_ok=True)
    for name in ["index.html", "style.css", "app.js", "robots.txt", "road-map.js", "road-map.css", "redevelopment-areas.js", "districts.geojson", "leaflet.js", "leaflet.css", "leaflet-LICENSE.txt", "life-boundaries.geojson"]:
        shutil.copyfile(Path(__file__).with_name("site") / name, target / name)
    destination = target / "market-data.json"
    temporary = destination.with_suffix(".tmp")
    temporary.write_text(json.dumps(build_public_data(snapshots, generated_at), ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(destination)
