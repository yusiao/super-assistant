"""Fresh project discovery from public indexes, not a fixed project watchlist."""
import hashlib
import json
import re
import unicodedata
from html import unescape
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit


BUCKETS = {"active": "active_presale_projects", "pending": "pending_launch_projects",
           "sold_out": "sold_out_presale_projects", "status_unknown": "status_unconfirmed_projects"}


def clean(value):
    value = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", value, flags=re.S | re.I)
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def identity(name):
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]", "", unicodedata.normalize("NFKC", name).lower())


def project_url(value):
    """Only known public project paths; no credentials, queries or arbitrary URLs."""
    try:
        p = urlsplit(str(value or ""))
        if p.scheme != "https" or p.username or p.password or p.port not in (None, 443):
            return ""
        host, path = p.hostname or "", p.path.rstrip("/")
        if host in {"leju.com.tw", "www.leju.com.tw"} and re.fullmatch(r"/community/[A-Za-z0-9]+", path):
            host = "www.leju.com.tw"
        elif host == "newhouse.housefun.com.tw" and re.fullmatch(r"/building/\d+(?:/detail)?", path):
            path = path.removesuffix("/detail")
        elif host == "www.jsl.com.tw" and re.fullmatch(r"/cases/[A-Za-z0-9_-]+(?:/architecture)?", path):
            path = path.removesuffix("/architecture")
        elif re.fullmatch(r"(?!www\.)[a-z0-9-]+\.jsl\.com\.tw", host) and not path:
            path = "/"
        else:
            return ""
        return urlunsplit(("https", host, path, "", ""))
    except ValueError:
        return ""


def fields(content):
    pairs = []
    for pattern in [r"<th\b[^>]*>(.*?)</th>\s*<td\b[^>]*>(.*?)</td>",
                    r"<mark\b[^>]*>(.*?)</mark>\s*<p\b[^>]*>(.*?)</p>",
                    r'<p\b[^>]*class=[\"\'][^\"\']*infoLabel[^\"\']*[\"\'][^>]*>(.*?)</p>\s*<p\b[^>]*>(.*?)</p>']:
        pairs.extend(re.findall(pattern, content, re.S | re.I))
    return {clean(k): clean(v).replace("看地圖", "").strip() for k, v in pairs}


def completion_month(value):
    m = re.search(r"(20\d{2})(?:年)?\s*(?:(上半年|下半年)|第?([一二三四1234])季(?:度)?|(\d{1,2})月)?", value)
    if not m:
        return None
    month = 12
    if m[2]:
        month = 6 if m[2] == "上半年" else 12
    elif m[3]:
        month = {"一": 1, "二": 2, "三": 3, "四": 4}.get(m[3], int(m[3]) if m[3].isdigit() else 4) * 3
    elif m[4]:
        month = int(m[4])
    return (int(m[1]), month) if 1 <= month <= 12 else None


def classify(values, now, agency_listing=False):
    kind = values.get("建案型態") or values.get("建案類型", "")
    sales = values.get("銷售狀態", "")
    permit = values.get("使用執照", "")
    handover = values.get("交屋日期", "")
    if "新成屋" in kind or "中古" in kind or any(x in handover for x in ("隨時交屋", "已交屋")):
        return "completed", "已完工，不列入預售清單"
    if permit and not permit.startswith(("暫無", "尚未", "無", "待", "未取得")):
        return "completed", "已有使用執照，不列入預售清單"
    completion = completion_month(values.get("預期完工", "")) or completion_month(handover)
    if completion and completion < (now.year, now.month):
        return "status_unknown", "預計完工日期已過，須重新確認"
    if "預售" not in kind:
        return "status_unknown", "建案型態未明確標示預售"
    if any(x in sales for x in ("未開賣", "尚未開賣", "即將公開", "尚未公開", "待公開")):
        return "pending", "來源明列未開賣預售"
    if not completion:
        return "status_unknown", "未取得可核對的未來完工日期"
    if any(x in sales for x in ("完銷", "已售完", "售罄")):
        return "sold_out", "來源明列完銷，預計尚未完工"
    if any(x in sales for x in ("熱銷中", "銷售中", "公開銷售")) or (agency_listing and not sales):
        return "active", "來源銷售清單刊登，標示預售及未來完工日期"
    return "status_unknown", "預售階段仍待確認；價格待定或預約不等於未開賣"


def housefun_cards(content):
    result = []
    for section in re.findall(r'<section\b[^>]*class="building-case[^>]*>(.*?)</section>', content, re.S | re.I):
        bid = re.search(r'name="buildIds"\s+value="(\d+)"', section)
        title = re.search(r"<h3\b[^>]*>(.*?)</h3>", section, re.S)
        addr = re.search(r"<address>.*?<a[^>]*>(.*?)</a>", section, re.S)
        purpose = re.search(r'"purpose"\s*:\s*"([^"]*)"', section)
        # Read completed candidates too: their evidence can contradict another index.
        if bid and title and addr and not (purpose and "住" not in purpose[1]):
            result.append({"name": clean(title[1]), "url": f"https://newhouse.housefun.com.tw/building/{bid[1]}",
                           "address": clean(addr[1]), "source": "好房網"})
    return result


def agency_cards(content):
    result = []
    for href, block in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', content, re.S | re.I):
        title = re.search(r'<div\b[^>]*class="title[^>]*>(.*?)</div>', block, re.S)
        url = project_url(href)
        if title and url and "龜山區" in clean(block):
            result.append({"name": clean(title[1]), "url": url, "source": "愛山林官方"})
    return result


def in_scope(project, content, config):
    # Reception offices are not the project location. Never use them as boundaries.
    address = project.get("address", "")
    if "龜山區" not in address:
        return False
    if any(road in address for road in config.get("scope_address_keywords", [])):
        return True
    titles = " ".join(re.findall(r"<(?:title|h1)[^>]*>(.*?)</(?:title|h1)>", content, re.S | re.I))
    return bool(re.search(r"(?<![A-Za-z0-9])A7(?!\d)", unicodedata.normalize("NFKC", clean(titles)), re.I))


def observe(card, content, now, config, agency_listing=False):
    data = fields(content)
    if data.get("建案名稱") and identity(data["建案名稱"]) != identity(card["name"]):
        return None
    project = dict(card)
    # Missing structured address must not silently become reception-center address.
    project["address"] = data.get("基地地址") or data.get("基地位置", "")
    if not in_scope(project, content, config):
        return None
    category, reason = classify(data, now, agency_listing)
    completion = completion_month(data.get("預期完工", "")) or completion_month(data.get("交屋日期", ""))
    price = data.get("單價", "")
    if not re.search(r"\d", price):
        price = "此來源未提供開價"
    project.update(category=category, reason=reason, price_text=price, completion=f"{completion[0]}-{completion[1]:02}" if completion else "",
                   observed_at=now.isoformat(), source_url=card["url"], phase_evidence=data.get("銷售狀態", "官方代銷清單刊登" if agency_listing else ""),
                   construction_evidence=data.get("建案型態") or data.get("建案類型", ""))
    return project


def merge_observations(observations):
    groups = {}
    for p in observations:
        groups.setdefault(identity(p["name"]), []).append(p)
    result = []
    for group in groups.values():
        group.sort(key=lambda p: 0 if p["source"] == "愛山林官方" else 1)
        item = dict(group[0])
        phases = {p["category"] for p in group}
        if "completed" in phases:
            item.update(category="completed", reason="來源含完工或使照訊號，保守排除預售")
        elif len(phases - {"status_unknown"}) > 1:
            item.update(category="status_unknown", reason="不同來源銷售階段矛盾，待核對")
        else:
            item = dict(next((p for p in group if p["category"] != "status_unknown"), item))
        item["sources"] = [{"name": p["source"], "url": p["url"]} for p in group]
        if len({p["completion"] for p in group if p.get("completion")}) > 1:
            item["completion_note"] = "來源預計完工時程有差異，須向建商核對"
        item["id"] = "project-" + hashlib.sha256(identity(item["name"]).encode()).hexdigest()[:16]
        phase = {"active": "銷售中預售", "pending": "未開賣預售", "sold_out": "完銷預售"}.get(item["category"], "階段待確認")
        item["status"] = f"{phase}；{item['price_text']}" + (f"；預計完工 {item['completion']}" if item.get("completion") else "")
        if item.get("completion_note"):
            item["status"] += "；" + item["completion_note"]
        result.append(item)
    return sorted(result, key=lambda p: p["name"])


def collect_projects(fetch, now, config=None):
    if config is None:
        config = json.loads(Path(__file__).with_name("project-sources.json").read_text(encoding="utf-8"))
    if not config.get("enabled", True):
        return {"projects": [], "sources": [], "excluded": []}
    observations, sources = [], []
    limit = max(1, min(int(config.get("max_details_per_source", 30)), 100))
    for source in config.get("housefun_regions", []) + config.get("agency_indexes", []):
        agency = source in config.get("agency_indexes", [])
        status = {"name": source["name"], "discovered": 0, "verified": 0, "errors": [], "partial": True}
        sources.append(status)
        try:
            body = fetch(source["url"])
            cards = agency_cards(body) if agency else housefun_cards(body)
            if not agency:
                count = re.search(r'<pagination-panel[^>]+v-bind:records="(\d+)"', body)
                pages = (int(count[1]) + 9) // 10 if count else 1
                cap = min(pages, int(source.get("max_pages", 5)))
                if pages > cap:
                    status["errors"].append("分頁超過本次上限，並非完整清單")
                for page in range(2, cap + 1):
                    p = urlsplit(source["url"])
                    query = dict(parse_qsl(p.query)); query["page"] = str(page)
                    try:
                        cards += housefun_cards(fetch(urlunsplit(p._replace(query=urlencode(query)))))
                    except Exception as exc:
                        status["errors"].append(type(exc).__name__)
            cards = list({p["url"]: p for p in cards}.values())
            status["discovered"] = len(cards)
            if not cards:
                status["errors"].append("清單未辨識到建案，不推定為零供給")
            if len(cards) > limit:
                status["errors"].append("詳細頁超過本次上限")
            for card in cards[:limit]:
                try:
                    body = fetch(card["url"] if agency else card["url"] + "/detail")
                    if agency and not fields(body).get("建案類型"):
                        # Follow an explicitly published detail link, never guess a hidden endpoint.
                        for href in re.findall(r'href=[\"\']([^\"\']+/architecture)[\"\']', body):
                            target = urljoin(card["url"], href)
                            if project_url(target):
                                body += fetch(target)
                                break
                    item = observe(card, body, now, config, agency)
                    if item:
                        observations.append(item)
                        status["verified"] += int(item["category"] in {"active", "pending", "sold_out"})
                except Exception as exc:
                    status["errors"].append(f"{card['name']}：{type(exc).__name__}")
        except Exception as exc:
            status["errors"].append(type(exc).__name__)
    merged = merge_observations(observations)
    return {"projects": [p for p in merged if p["category"] in {"active", "pending", "sold_out"}],
            "excluded": [{"name": p["name"], "reason": p["reason"]} for p in merged if p["category"] not in {"active", "pending", "sold_out"}],
            "sources": sources}


def attach_projects(snapshots, config_areas, collection):
    lookup = {}
    for area in config_areas:
        for mapping in area.get("project_url_mappings", []):
            for name in [mapping["name"], *mapping.get("aliases", [])]:
                lookup.setdefault(identity(name), set()).add(area["name"])
    excluded = {identity(n) for a in config_areas for n in a.get("exclude_project_names", [])}
    by_name = {a["name"]: a for a in snapshots}
    for p in collection["projects"]:
        if identity(p["name"]) in excluded:
            continue
        matches = lookup.get(identity(p["name"]), set())
        name = next(iter(matches)) if len(matches) == 1 else "A7周邊-子區待核對"
        if name not in by_name:
            extra = {"name": name, "theme": "本次來源確認 A7 周邊，未判定五大子區", "supplemental_scope": True,
                     "buy_url": "", "price_url": "", "road_focus": [], "price": {}, "stale": True}
            by_name[name] = extra
            snapshots.append(extra)
        area = by_name[name]
        area["stale"] = False
        area["summary_parse_warning"] = "多來源部分觀察，非完整供給數量"
        area["project_sources"] = collection["sources"]
        bucket = area.setdefault(BUCKETS[p["category"]], [])
        bucket[:] = [old for old in bucket if identity(old["name"]) != identity(p["name"])]
        bucket.append(p)
    for area in snapshots:
        area["project_sources"] = collection["sources"]
