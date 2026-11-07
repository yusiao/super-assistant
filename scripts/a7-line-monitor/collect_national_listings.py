"""Collect public project pages with bounded, serial, fail-fast requests."""
import argparse
from datetime import date, datetime, timezone, timedelta
import json
from pathlib import Path
import re
import time
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fetch_policy import check_response, FetchBlocked
from listing_payload import payload, objects

BASE = "https://newhouse.591.com.tw"
API = "https://bff-newhouse.591.com.tw/v1/list-search"
COMPARABLE_STYLES = {"住宅大樓", "華廈", "公寓"}


class Reader:
    def __init__(self):
        self.finished = 0
        self.blocked = False

    def __call__(self, url):
        if self.blocked:
            raise FetchBlocked("source stopped for this run")
        time.sleep(max(0, 1 - (time.monotonic() - self.finished)))
        try:
            request = Request(url, headers={"User-Agent": "PropertyObservatory/1.0",
                                           "Accept": "text/html"})
            try:
                with urlopen(request, timeout=10) as response:
                    body = response.read(4_000_001)
                    check_response(response.status, dict(response.headers), body.decode("utf-8", "replace"))
            except HTTPError as error:
                check_response(error.code, dict(error.headers))
                raise
            if len(body) > 4_000_000:
                raise ValueError("Oversized page")
            content = body.decode("utf-8")
            if content.lstrip().startswith("{"):
                result = json.loads(content)
                if result.get("status") != 1 or not isinstance(result.get("data"), dict):
                    raise ValueError("Public source did not return usable data")
                return {"listing": result["data"]}
            return payload(content)
        except FetchBlocked:
            self.blocked = True
            raise
        finally:
            self.finished = time.monotonic()


def index(tree):
    values = [item for item in objects(tree) if {"total", "items", "total_page", "per_page", "page"} <= item.keys()]
    if len(values) != 1 or not isinstance(values[0]["items"], list):
        raise ValueError("Changed listing schema")
    return values[0]


def regions(tree):
    values = tree["pinia"]["housing-list"]["seoFoot"]["other_region"]
    result = {"1": "台北市"}
    for item in values:
        if not isinstance(item, dict) or len(item) != 1:
            raise ValueError("Changed city index")
        key, name = next(iter(item.items()))
        if not str(key).isdigit():
            raise ValueError("Invalid city id")
        result[str(key)] = name
    if len(result) != 22:
        raise ValueError("Incomplete city index")
    return result


def card(item, city):
    if not isinstance(item, dict) or not {"hid", "build_name", "address", "section"} <= item.keys():
        return None
    hid = str(item["hid"])
    if not re.fullmatch(r"\d+", hid) or str(item.get("region", "")).replace("台", "臺") != city.replace("台", "臺"):
        return None
    return {"id": "591-" + hid, "name": item["build_name"], "city": city.replace("台", "臺"),
            "district": item["section"], "address": item["address"], "url": BASE + "/" + hid,
            "source": "591新建案", "source_updated": item.get("updatetime", ""),
            "circle_id": str(item.get("shop_id") or ""), "circle": item.get("shop_name") or "",
            "price": str(item.get("price") or ""), "price_unit": str(item.get("price_unit") or ""),
            "area": str(item.get("area") or ""), "layout": str(item.get("room") or ""),
            "platform_type": item.get("build_type_val"),
            "category": {2: "listed_new_home", 4: "listed_pending"}.get(item.get("build_type_val"), "listed_presale")}


def updated_ordinal(project):
    try:
        return date.fromisoformat(project.get("source_updated", "")).toordinal()
    except (TypeError, ValueError):
        return 0


def recent(project, today):
    return updated_ordinal(project) >= (today - timedelta(days=365)).toordinal()


def likely_price_watch(project, districts, completed, today):
    if project.get("price_unit") != "萬/坪" or updated_ordinal(project) < (today - timedelta(days=60)).toordinal():
        return False
    offer = re.fullmatch(r"(\d{1,3}(?:\.\d{1,3})?)(?:\s*[~～–—-]\s*(\d{1,3}(?:\.\d{1,3})?))?", project.get("price", "").strip())
    if not offer:
        return False
    summary = districts.get(f"{project['city']}/{project['district']}", {}).get("price" if completed else "presale_price") or {}
    mean = summary.get("mean")
    low, high = float(offer[1]), float(offer[2] or offer[1])
    # This only prioritizes source checks; it does not create a public badge.
    return isinstance(mean, (int, float)) and summary.get("count", 0) >= 10 and 0 < low <= high <= mean * .8


def detail(tree, project, today):
    hid = int(project["id"].split("-")[1])
    matches = [i for i in objects(tree) if i.get("hid") == hid and {"build_type_name", "deal_time_v2", "map", "sell_time"} <= i.keys()]
    if len(matches) != 1:
        raise ValueError("Missing unique project detail")
    item = matches[0]
    if item.get("build_name") != project["name"]:
        raise ValueError("Project identity changed")
    project = dict(project, category="status_unknown", verified_on=today.isoformat())
    kind = item.get("build_type_name", "")
    style = str(item.get("purpose_name") or "").strip()
    project["property_style"] = style if style in COMPARABLE_STYLES else ""
    sale = item.get("sell_time") or {}
    completed = item.get("deal_time_v2") or {}
    project["construction"] = kind
    project["sales_evidence"] = str(sale.get("sell_status_txt") or "")
    project["completion"] = str(completed.get("date") or "")
    project["opening"] = str(sale.get("date") or "")
    price = item.get("price_unit")
    if isinstance(price, dict):
        if not price.get("pending") and price.get("price"):
            project["price"], project["price_unit"] = str(price["price"]), str(price.get("unit") or "")
        else:
            total = item.get("price_total")
            if isinstance(total, dict) and not total.get("pending") and total.get("price") and total.get("unit") == "萬/戶":
                project["price"], project["price_unit"] = str(total["price"]), "萬/戶"
            elif project.get("price_unit") != "萬/戶":
                project["price"], project["price_unit"] = "", ""
    coordinates = item.get("map") or {}
    try:
        lng, lat = float(coordinates["lng"]), float(coordinates["lat"])
        if 118 <= lng <= 123.5 and 21 <= lat <= 27:
            project["coordinates"] = [lng, lat]
    except (KeyError, ValueError, TypeError):
        pass
    project["address"] = item.get("address") or project["address"]
    project["circle_id"] = str(item.get("shop_id") or project["circle_id"])
    project["circle"] = item.get("shop_name") or project["circle"]
    from project_sources import completion_month
    end = completion_month(project["completion"])
    quarter = re.search(r"(20\d{2})年?第([一二三四1234])季", project["completion"])
    if not end and quarter:
        q = "一二三四".find(quarter[2]) + 1 if not quarter[2].isdigit() else int(quarter[2])
        end = int(quarter[1]), q * 3
    sales = project["sales_evidence"].strip()
    unopened = {"即將公開", "尚未公開", "未開賣", "待售"}
    future_or_unknown = not end or end > (today.year, today.month)
    if "新成屋" in kind or "中古" in kind:
        project["category"] = "completed"
        if (kind.strip() == "新成屋" and sales in {"在售", "銷售中"} and completed.get("type") == "handover"
                and completed.get("deal") == 1 and end and (today.year - 5, today.month) < end <= (today.year, today.month)
                and not any(word in str(item.get("purpose_name", "")) for word in ("透天", "店面", "辦公"))):
            project["category"] = "new_home"
    elif "預推" in kind and (not sales or sales in unopened) and future_or_unknown:
        project["category"] = "pending"
    elif "預售" in kind:
        if sales in unopened and future_or_unknown:
            project["category"] = "pending"
        elif end and end > (today.year, today.month):
            if sales in {"完銷", "已完銷"}:
                project["category"] = "sold_out"
            elif sales in {"在售", "銷售中"}:
                project["category"] = "active"
    return project


def collect(args):
    now = datetime.now(timezone(timedelta(hours=8)))
    reader = Reader()
    previous = json.loads(args.output.read_text(encoding="utf-8")) if args.output.exists() else {}
    old = {p["id"]: p for p in previous.get("projects", [])}
    verify_only = getattr(args, "verify_only", False)
    new_homes = getattr(args, "new_homes_only", False)
    region_index = getattr(args, "region_index", None)
    if verify_only:
        city_index = {k: v["city"] for k, v in previous.get("regions", {}).items()}
    elif region_index:
        known = json.loads(region_index.read_text(encoding="utf-8"))
        city_index = {k: v["city"] for k, v in known["regions"].items()}
        if len(city_index) != 22 or not all(k.isdigit() for k in city_index):
            raise ValueError("Incomplete city index")
    else:
        try:
            city_index = regions(reader(BASE + "/list?regionid=1"))
        except (ValueError, KeyError):
            city_index = {k: v["city"] for k, v in previous.get("regions", {}).items()}
            if len(city_index) != 22 or not all(k.isdigit() for k in city_index):
                raise
    selected = {k: v for k, v in city_index.items() if not args.regions or k in args.regions}
    output = {"schema_version": 1, "observed_at": now.isoformat(), "regions": {}, "projects": []}
    projects = {}
    if verify_only:
        output = previous
        projects = old

    def save():
        output["projects"] = list(projects.values())
        args.output.parent.mkdir(parents=True, exist_ok=True)
        temporary = args.output.with_suffix(".tmp")
        temporary.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        temporary.replace(args.output)

    for key, city in ([] if verify_only else selected.items()):
        report = {"city": city.replace("台", "臺"), "status": "partial", "pages": 0,
                  "expected_pages": None, "discovered": 0, "verified": 0}
        output["regions"][key] = report
        try:
            query = {"regionid": key, "device": "pc", "build_type": "2" if new_homes else "1,4", "no_random_sort": "1"}
            tree = reader(API + "?" + urlencode({**query, "page": 1}))
            meta = index(tree)
            report["expected_pages"] = int(meta["total_page"])
            report["source_total"] = int(meta["total"])
            report["online_total"] = int(meta.get("online_total", 0))
            if args.probe:
                report["status"] = "probe"
                print(key, city.encode("unicode_escape").decode(), meta["total"], meta.get("online_total"), meta["total_page"], flush=True)
                continue
            seen, page_signatures = set(), set()
            pages = min(report["expected_pages"], args.max_pages)
            for page in range(1, pages + 1):
                if page != 1:
                    tree = reader(API + "?" + urlencode({**query, "page": page}))
                    meta = index(tree)
                if int(meta["page"]) != page:
                    raise ValueError("Pagination not applied")
                candidates = [p for i in meta["items"] if isinstance(i, dict) and i.get("build_type_val") in ((2,) if new_homes else (1, 4))
                              and "住" in (i.get("purpose_str") or "") and (p := card(i, city))]
                signature = tuple(sorted(p["id"] for p in candidates))
                if signature and signature in page_signatures:
                    raise ValueError("Repeated listing page")
                page_signatures.add(signature)
                report["pages"] += 1
                for p in candidates:
                    seen.add(p["id"])
                    if p["id"] not in projects:
                        prior = old.get(p["id"], {})
                        if prior.get("last_attempted_on") or prior.get("verified_on"):
                            p["last_attempted_on"] = prior.get("last_attempted_on") or prior["verified_on"]
                        checked = prior.get("verified_on", "")
                        if checked >= (now.date() - timedelta(days=7)).isoformat() and prior.get("source_updated") == p["source_updated"]:
                            p = prior.copy()
                        p["listed_on"] = now.date().isoformat()
                        projects[p["id"]] = p
                print(key, "page", page, "/", report["expected_pages"], "projects", len(seen), flush=True)
            report["discovered"] = len(seen)
            report["status"] = "indexed" if report["pages"] == report["expected_pages"] else "partial"
        except FetchBlocked as error:
            report["status"] = "blocked"
            report["reason"] = error.reason
        except Exception as error:
            report["reason"] = type(error).__name__
        finally:
            save()
        if reader.blocked:
            break
    # Check every district, with station-corridor candidates first. Reuse only
    # unchanged checks <=7 days old; unverified records never become on-sale cases.
    if not args.probe and not args.index_only and not reader.blocked:
        market = getattr(args, "market_index", None)
        benchmarks = json.loads(market.read_text(encoding="utf-8")).get("districts", {}) if market else {}
        cutoff = (now.date() - timedelta(days=7)).isoformat()
        def needs_check(project):
            return project.get("verified_on", "") < cutoff or (
                "property_style" not in project and likely_price_watch(project, benchmarks, new_homes, now.date())
            )
        candidates = sorted((p for p in projects.values() if recent(p, now.date()) or p.get("verified_on")), key=lambda p: (
            not needs_check(p),
            not likely_price_watch(p, benchmarks, new_homes, now.date()),
            p.get("last_attempted_on", ""),
            new_homes and p.get("price_unit") != "萬/坪",
            p["district"] not in {"龜山區", "林口區"},
            p["category"] != "listed_pending", -updated_ordinal(p), p["city"], p["id"]))
        for p in candidates[:args.detail_limit]:
            if not needs_check(p):
                continue
            try:
                projects[p["id"]] = detail(reader(p["url"]), p, now.date())
            except FetchBlocked:
                output["detail_status"] = "blocked"
                save()
                break
            except Exception as error:
                output["detail_errors"] = output.get("detail_errors", 0) + 1
                codes = output.setdefault("detail_error_types", {})
                code = type(error).__name__
                codes[code] = codes.get(code, 0) + 1
            projects[p["id"]]["last_attempted_on"] = now.date().isoformat()
            print("detail", p["id"], projects[p["id"]]["category"], flush=True)
            save()
    output["detail_checked"] = sum(bool(p.get("verified_on")) for p in projects.values())
    for key, city in selected.items():
        output["regions"].setdefault(key, {"city": city.replace("台", "臺"), "status": "not_checked", "pages": 0})
    save()
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--probe", action="store_true")
    parser.add_argument("--index-only", action="store_true")
    parser.add_argument("--regions", nargs="+")
    parser.add_argument("--max-pages", type=int, default=500)
    parser.add_argument("--detail-limit", type=int, default=300)
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--new-homes-only", action="store_true")
    parser.add_argument("--region-index", type=Path)
    parser.add_argument("--market-index", type=Path)
    collect(parser.parse_args())
