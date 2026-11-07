"""Publish only market data, never the scheduler state or delivery credentials."""
from datetime import datetime
from pathlib import Path
import json
import re
import shutil
import hashlib
from project_sources import project_url

SITE_ASSETS = ("index.html", "style.css", "app.js", "robots.txt", "road-map.js", "road-map.css",
               "redevelopment-areas.js", "districts.geojson", "leaflet.js", "leaflet.css",
               "leaflet-LICENSE.txt", "life-boundaries.geojson", "station-atlas.js",
               "station-atlas.geojson", "station-terrain.webp", "ATLAS-SOURCES.md",
               "taiwan-terrain.json", "taiwan-terrain.webp",
               "taiwan-context.js",
               "national-market.js", "national-market.json", "NATIONAL-SOURCES.md",
               "live-projects.js", "national-listings.json", "national-new-homes.json")


def public_url(value):
    return project_url(value)


def text(value):
    return str(value or "").strip()[:400]


def build_public_data(snapshots, generated_at):
    areas = []
    buckets = [("pending_launch_projects", "pending"), ("active_presale_projects", "active"),
               ("sold_out_presale_projects", "sold_out"), ("completed_projects", "completed"),
               ("status_unconfirmed_projects", "status_unknown")]
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
                    stable_id = text(item.get("id")) or url.rstrip('/').rsplit('/', 1)[-1] or hashlib.sha256(url.encode()).hexdigest()[:16]
                    projects.append({"id": stable_id, "name": name, "url": url, "category": category, "status": status,
                                     "source": text(item.get("source") or ("樂居" if "leju.com.tw/" in url else "來源未標示")),
                                     "sources": [{"name": text(s.get("name")), "url": public_url(s.get("url"))} for s in item.get("sources", []) if public_url(s.get("url"))],
                                     "address": text(item.get("address")), "observed_at": text(item.get("observed_at"))})
        transaction_keys = set()
        keys = ["official_rows_this_run"] if stale else ["latest_presale_registrations", "latest_new_completion_registrations"]
        for key in keys:
            for row in area.get(key, []):
                safe = {field: text(row.get(field)) for field in ["project_name", "unit", "floor", "layout", "area", "parking", "parking_price", "total_price", "unit_price", "deal_date", "source"]}
                safe["url"] = public_url(row.get("url"))
                identity = json.dumps(safe, sort_keys=True)
                if not safe["url"] or not safe["project_name"] or identity in transaction_keys:
                    continue
                transaction_keys.add(identity)
                transactions.append(safe)
        transactions.sort(key=lambda t: t["deal_date"], reverse=True)
        traded_urls = {t["url"] for t in transactions if t["source"] == "內政部實價登錄"}
        for project in projects:
            if project["category"] == "pending" and project["url"] in traded_urls:
                project.update(category="status_unknown", status="已有官方預售成交，目前是否仍銷售待確認")
        areas.append({"id": f"area-{index}", "name": text(area.get("name")),
                      "city": text(area.get("city_name") or "桃園市"), "district": text(area.get("district_name") or "龜山區"),
                      "theme": text(area.get("theme")), "roads": [text(v) for v in area.get("road_focus", [])],
                      "availability": "unavailable" if stale else "partial" if partial else "observed",
                      "transaction_source": "unavailable" if area.get("official_presale_fetch_error") else area.get("official_status", "unknown"),
                      "projects": projects, "transactions": transactions})
    return {"schema_version": 1, "generated_at": generated_at.isoformat(), "areas": areas,
            "scope_note": "觀察 A7 五子區；無法確認子區的建案另列周邊待核對。多來源建案與成交僅代表本次可取得內容，不是全市場完整清單；讀取日期不等於資料更新日期。"}


def copy_public_assets(source, target):
    for name in SITE_ASSETS:
        shutil.copyfile(source / name, target / name)
    layers = source / "taiwan-context"
    index = json.loads((layers / "index.json").read_text(encoding="utf-8"))
    keys = index.get("tiles")
    if index.get("version") != 1 or not isinstance(keys, list) or not keys or not all(
        isinstance(key, str) and re.fullmatch(r"[0-9]{3}-[0-9]{2,3}", key) for key in keys
    ):
        raise ValueError("Invalid Taiwan road tile index")
    destination = target / layers.name
    destination.mkdir(exist_ok=True)
    for name in ("index.json", "main.json", "primary.json", "landmark-areas.geojson", *(f"roads-{key}.json" for key in keys)):
        shutil.copyfile(layers / name, destination / name)


def export_public_site(snapshots, generated_at, target):
    target = Path(target)
    target.mkdir(parents=True, exist_ok=True)
    copy_public_assets(Path(__file__).with_name("site"), target)
    destination = target / "market-data.json"
    temporary = destination.with_suffix(".tmp")
    temporary.write_text(json.dumps(build_public_data(snapshots, generated_at), ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(destination)
