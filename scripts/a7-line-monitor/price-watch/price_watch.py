from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import sqlite3
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


TIME_ZONE_ALIASES = {"Taipei Standard Time": "Asia/Taipei"}
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
}


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def get_config_value(file_config: dict[str, str], key: str, default: str = "") -> str:
    return os.environ.get(key) or file_config.get(key, default)


def parse_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def resolve_workspace_path(path_text: str) -> Path:
    path = Path(path_text)
    return path if path.is_absolute() else Path.cwd() / path


def read_json_file(path: Path) -> Any:
    raw = path.read_text(encoding="utf-8").strip()
    return json.loads(raw) if raw else None


def stable_id(text: str, length: int = 12) -> str:
    digest = hashlib.sha1(text.encode("utf-8")).hexdigest()
    return digest[:length]


def slugify(text: str, fallback: str = "item") -> str:
    lowered = text.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    if slug:
        return slug[:80]
    return f"{fallback}-{stable_id(text)}"


def strip_tags(text: str) -> str:
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.S | re.I)
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = html.unescape(clean)
    return re.sub(r"\s+", " ", clean).strip()


def extract_title(content: str) -> str:
    og_match = re.search(
        r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
        content,
        re.I,
    )
    if og_match:
        return html.unescape(og_match.group(1)).strip()
    title_match = re.search(r"<title[^>]*>(.*?)</title>", content, re.S | re.I)
    if title_match:
        return strip_tags(title_match.group(1))
    return ""


def parse_price_number(value: Any) -> float | None:
    if value is None:
        return None
    text = html.unescape(str(value))
    text = text.replace(",", "").replace("，", "").replace(" ", "")
    text = re.sub(r"[^\d.]", "", text)
    if not text or text.count(".") > 1:
        return None
    try:
        price = float(text)
    except ValueError:
        return None
    return price if price > 0 else None


def extract_price(content: str, price_regex: str = "") -> float | None:
    if price_regex:
        match = re.search(price_regex, content, re.S | re.I)
        if not match:
            return None
        target = match.group(1) if match.groups() else match.group(0)
        return parse_price_number(target)

    candidates: list[float] = []
    patterns = [
        r'"(?:price|lowPrice|salePrice)"\s*:\s*"?([$A-ZNTD\s]*[\d,]+(?:\.\d+)?)"?',
        r"(?:NT\$|NTD|TWD|新台幣|售價|特價|優惠價|價格|price)[^\d]{0,30}([\d,]+(?:\.\d+)?)",
        r"([\d,]+(?:\.\d+)?)\s*(?:元|TWD|NTD)",
        r"(?:\$|＄)\s*([\d,]+(?:\.\d+)?)",
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, content, re.S | re.I):
            price = parse_price_number(match.group(1))
            if price is not None:
                candidates.append(price)
    plausible = [price for price in candidates if 1 <= price <= 10_000_000]
    return min(plausible) if plausible else None


def format_money(price: float | None, currency: str) -> str:
    if price is None:
        return "無價格"
    rounded = int(price) if abs(price - round(price)) < 0.01 else round(price, 2)
    if currency.upper() in {"TWD", "NTD"}:
        return f"NT${rounded:,}"
    return f"{currency} {rounded:,}"


def fetch_text(url: str, timeout: int = 30) -> str:
    headers = dict(DEFAULT_HEADERS)
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read()
        charset = response.headers.get_content_charset() or "utf-8"
    try:
        return body.decode(charset, errors="replace")
    except LookupError:
        return body.decode("utf-8", errors="replace")


def fetch_json(url: str, timeout: int = 30) -> dict[str, Any]:
    request = urllib.request.Request(url, headers=dict(DEFAULT_HEADERS))
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8", errors="replace")
    return json.loads(body)


def post_json(url: str, payload: dict[str, Any], headers: dict[str, str], timeout: int = 30) -> dict[str, Any]:
    request_headers = {**DEFAULT_HEADERS, **headers, "Content-Type": "application/json"}
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=request_headers,
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8", errors="replace")
    return json.loads(body)


def fetch_remote_watch_config(url: str, access_token: str, timeout: int) -> list[dict[str, Any]]:
    headers = dict(DEFAULT_HEADERS)
    headers["Accept"] = "application/json"
    if access_token:
        headers["X-Price-Watch-Token"] = access_token
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8", errors="replace")
    data = json.loads(body)
    watches = data.get("watches") if isinstance(data, dict) else None
    return watches if isinstance(watches, list) else []


def get_serpapi_key(source: dict[str, Any], file_config: dict[str, str]) -> str:
    key_env = str(source.get("api_key_env") or "SERPAPI_API_KEY")
    return os.environ.get(key_env) or file_config.get(key_env, "")


def get_skyscanner_key(source: dict[str, Any], file_config: dict[str, str]) -> str:
    key_env = str(source.get("api_key_env") or "SKYSCANNER_API_KEY")
    return os.environ.get(key_env) or file_config.get(key_env, "")


def parse_iso_date(value: Any, fallback: datetime | None = None) -> datetime:
    text = str(value or "").strip()
    if text:
        try:
            return datetime.strptime(text, "%Y-%m-%d")
        except ValueError:
            pass
    return fallback or datetime.now()


def skyscanner_date_parts(value: datetime) -> dict[str, int]:
    return {"year": value.year, "month": value.month}


def skyscanner_quote_date(leg: Any) -> str:
    if not isinstance(leg, dict):
        return ""
    value = leg.get("departureDate") or leg.get("departure_date") or leg.get("date") or {}
    if not isinstance(value, dict):
        return ""
    try:
        return f"{int(value['year']):04d}-{int(value['month']):02d}-{int(value['day']):02d}"
    except (KeyError, TypeError, ValueError):
        return ""


def skyscanner_quotes(data: dict[str, Any]) -> list[dict[str, Any]]:
    content = data.get("content") if isinstance(data, dict) else None
    results = content.get("results") if isinstance(content, dict) else None
    quotes = results.get("quotes") if isinstance(results, dict) else None
    if quotes is None and isinstance(data, dict):
        quotes = data.get("quotes")
    if isinstance(quotes, list):
        return [quote for quote in quotes if isinstance(quote, dict)]
    if isinstance(quotes, dict):
        return [quote for quote in quotes.values() if isinstance(quote, dict)]
    return []


def build_skyscanner_link(departure: str, arrival: str, outbound_date: str, return_date: str = "") -> str:
    outbound_path = outbound_date.replace("-", "")[2:]
    date_path = f"{outbound_path}/{return_date.replace('-', '')[2:]}" if return_date else outbound_path
    return f"https://www.skyscanner.com.tw/transport/flights/{departure.lower()}/{arrival.lower()}/{date_path}/"


def build_google_flights_url(source: dict[str, Any]) -> str:
    departure = source.get("departure_id", "")
    arrival = source.get("arrival_id", "")
    outbound = source.get("outbound_date", "")
    return_date = source.get("return_date", "")
    bits = [str(departure), str(arrival), str(outbound)]
    if return_date:
        bits.append(str(return_date))
    return "https://www.google.com/travel/flights?q=" + urllib.parse.quote(" ".join(bits))


def source_display_name(source: dict[str, Any], fallback_url: str = "") -> str:
    if source.get("name"):
        return str(source["name"])
    if fallback_url:
        parsed = urllib.parse.urlparse(fallback_url)
        return parsed.netloc or fallback_url
    return str(source.get("type") or "source")


def get_html_candidates(
    watch: dict[str, Any],
    source: dict[str, Any],
    timeout: int,
) -> list[dict[str, Any]]:
    url = str(source.get("url") or watch.get("url") or "")
    if not url:
        raise RuntimeError("HTML source is missing url")
    content = fetch_text(url, timeout=timeout)
    unavailable_regex = str(source.get("unavailable_regex") or watch.get("unavailable_regex") or "")
    available = not bool(unavailable_regex and re.search(unavailable_regex, content, re.S | re.I))
    price_regex = str(source.get("price_regex") or watch.get("price_regex") or "")
    price = extract_price(content, price_regex)
    source_id = str(source.get("id") or slugify(source_display_name(source, url), "source"))
    return [
        {
            "watch_id": watch["id"],
            "item_type": watch.get("type", "product"),
            "source_id": source_id,
            "source_name": source_display_name(source, url),
            "url": url,
            "title": extract_title(content) or str(watch.get("name") or ""),
            "price": price,
            "currency": str(source.get("currency") or watch.get("currency") or "TWD"),
            "available": available and price is not None,
            "error": "" if price is not None else "price not found",
            "raw": {},
        }
    ]


def get_google_shopping_candidates(
    watch: dict[str, Any],
    source: dict[str, Any],
    file_config: dict[str, str],
    timeout: int,
) -> list[dict[str, Any]]:
    api_key = get_serpapi_key(source, file_config)
    if not api_key:
        raise RuntimeError("SERPAPI_API_KEY is required for serpapi_google_shopping")
    query = str(source.get("query") or watch.get("query") or watch.get("name") or "")
    if not query:
        raise RuntimeError("Google Shopping source is missing query")
    params = {
        "engine": "google_shopping",
        "q": query,
        "api_key": api_key,
        "gl": source.get("gl", "tw"),
        "hl": source.get("hl", "zh-tw"),
        "currency": source.get("currency") or watch.get("currency") or "TWD",
    }
    url = "https://serpapi.com/search.json?" + urllib.parse.urlencode(params)
    data = fetch_json(url, timeout=timeout)
    results = data.get("shopping_results") or []
    limit = int(source.get("limit") or 10)
    candidates: list[dict[str, Any]] = []
    for item in results[:limit]:
        price = parse_price_number(item.get("extracted_price") or item.get("price"))
        if price is None:
            continue
        merchant = item.get("source") or item.get("seller") or "Google Shopping"
        title = item.get("title") or watch.get("name") or query
        link = item.get("link") or item.get("product_link") or ""
        source_key = f"{merchant}|{title}|{link}"
        candidates.append(
            {
                "watch_id": watch["id"],
                "item_type": "product",
                "source_id": f"{source.get('id') or 'google-shopping'}:{stable_id(source_key, 10)}",
                "source_name": str(merchant),
                "url": str(link),
                "title": str(title),
                "price": price,
                "currency": str(source.get("currency") or watch.get("currency") or "TWD"),
                "available": True,
                "error": "",
                "raw": {"provider": "serpapi_google_shopping"},
            }
        )
    if not candidates:
        raise RuntimeError("Google Shopping returned no priced results")
    return candidates


def get_google_flights_candidates(
    watch: dict[str, Any],
    source: dict[str, Any],
    file_config: dict[str, str],
    timeout: int,
) -> list[dict[str, Any]]:
    api_key = get_serpapi_key(source, file_config)
    if not api_key:
        raise RuntimeError("SERPAPI_API_KEY is required for serpapi_google_flights")
    required = ["departure_id", "arrival_id", "outbound_date"]
    missing = [key for key in required if not source.get(key)]
    if missing:
        raise RuntimeError(f"Flight source is missing {', '.join(missing)}")
    params = {
        "engine": "google_flights",
        "api_key": api_key,
        "departure_id": source["departure_id"],
        "arrival_id": source["arrival_id"],
        "outbound_date": source["outbound_date"],
        "currency": source.get("currency") or watch.get("currency") or "TWD",
        "hl": source.get("hl", "zh-tw"),
        "gl": source.get("gl", "tw"),
        "type": source.get("flight_type", "1"),
        "adults": source.get("adults", "1"),
        "travel_class": source.get("travel_class", "1"),
    }
    if source.get("return_date"):
        params["return_date"] = source["return_date"]
    if source.get("stops") is not None:
        params["stops"] = source["stops"]
    url = "https://serpapi.com/search.json?" + urllib.parse.urlencode(params)
    data = fetch_json(url, timeout=timeout)
    flights = list(data.get("best_flights") or []) + list(data.get("other_flights") or [])
    prices = [parse_price_number(item.get("price")) for item in flights]
    priced = [price for price in prices if price is not None]
    insights = data.get("price_insights") or {}
    insight_lowest = parse_price_number(insights.get("lowest_price"))
    best_price = min(priced) if priced else insight_lowest
    if best_price is None:
        raise RuntimeError("Google Flights returned no priced results")
    route = f"{source['departure_id']}->{source['arrival_id']} {source['outbound_date']}"
    if source.get("return_date"):
        route += f"~{source['return_date']}"
    return [
        {
            "watch_id": watch["id"],
            "item_type": "flight",
            "source_id": str(source.get("id") or "google-flights"),
            "source_name": str(source.get("name") or "Google Flights"),
            "url": str(source.get("url") or build_google_flights_url(source)),
            "title": str(watch.get("name") or route),
            "price": best_price,
            "currency": str(source.get("currency") or watch.get("currency") or "TWD"),
            "available": True,
            "error": "",
            "raw": {
                "provider": "serpapi_google_flights",
                "departure_date": str(source.get("outbound_date") or ""),
                "return_date": str(source.get("return_date") or ""),
                "trip_days": int(source.get("trip_days") or 0),
                "range_start": str(source.get("range_start") or source.get("outbound_date") or ""),
                "range_end": str(source.get("range_end") or source.get("outbound_date") or ""),
                "price_level": insights.get("price_level"),
                "typical_price_range": insights.get("typical_price_range"),
            },
        }
    ]


def get_serpapi_sampled_flight_candidates(
    watch: dict[str, Any],
    source: dict[str, Any],
    file_config: dict[str, str],
    timeout: int,
) -> list[dict[str, Any]]:
    mode = str(source.get("mode") or "annual_low")
    today = datetime.now()
    start = today + timedelta(days=14) if mode == "annual_low" else parse_iso_date(source.get("start_date"), today)
    horizon_days = 351 if mode == "annual_low" else max(0, min(int(source.get("lookahead_days") or 30), 365))
    span = horizon_days + 1
    offset = today.toordinal() % span
    outbound = start + timedelta(days=offset)
    trip_days = max(0, min(int(source.get("trip_days") or 0), 60))
    sampled_source = dict(source)
    sampled_source.update(
        {
            "type": "serpapi_google_flights",
            "outbound_date": outbound.strftime("%Y-%m-%d"),
            "return_date": (outbound + timedelta(days=trip_days)).strftime("%Y-%m-%d") if trip_days else "",
            "flight_type": "1" if trip_days else "2",
            "gl": str(source.get("market") or source.get("gl") or "TW").lower(),
            "hl": str(source.get("locale") or source.get("hl") or "zh-TW").lower(),
            "range_start": start.strftime("%Y-%m-%d"),
            "range_end": (start + timedelta(days=horizon_days)).strftime("%Y-%m-%d"),
        }
    )
    candidates = get_google_flights_candidates(watch, sampled_source, file_config, timeout)
    for candidate in candidates:
        candidate["raw"]["provider"] = "serpapi_google_flights_sampled"
        candidate["raw"]["sampled"] = True
    return candidates


def get_skyscanner_indicative_candidates(
    watch: dict[str, Any],
    source: dict[str, Any],
    file_config: dict[str, str],
    timeout: int,
) -> list[dict[str, Any]]:
    api_key = get_skyscanner_key(source, file_config)
    if not api_key:
        raise RuntimeError("SKYSCANNER_API_KEY is required for skyscanner_indicative_flights")
    departure = str(source.get("departure_id") or "").upper()
    arrival = str(source.get("arrival_id") or "").upper()
    if not departure or not arrival:
        raise RuntimeError("Skyscanner source requires departure_id and arrival_id")
    mode = str(source.get("mode") or "annual_low")
    today = datetime.now()
    start = today if mode == "annual_low" else parse_iso_date(source.get("start_date"), today)
    horizon_days = 365 if mode == "annual_low" else max(1, min(int(source.get("lookahead_days") or 30), 365))
    end = start + timedelta(days=horizon_days)
    trip_days = max(0, min(int(source.get("trip_days") or 0), 60))
    currency = str(source.get("currency") or watch.get("currency") or "TWD")
    query_legs: list[dict[str, Any]] = [
        {
            "originPlace": {"queryPlace": {"iata": departure}},
            "destinationPlace": {"queryPlace": {"iata": arrival}},
            "dateRange": {
                "startDate": skyscanner_date_parts(start),
                "endDate": skyscanner_date_parts(end),
            },
        }
    ]
    if trip_days > 0:
        query_legs.append(
            {
                "originPlace": {"queryPlace": {"iata": arrival}},
                "destinationPlace": {"queryPlace": {"iata": departure}},
                "dateRange": {
                    "startDate": skyscanner_date_parts(start + timedelta(days=trip_days)),
                    "endDate": skyscanner_date_parts(end + timedelta(days=trip_days)),
                },
            }
        )
    data = post_json(
        "https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search",
        {
            "query": {
                "market": source.get("market", "TW"),
                "locale": source.get("locale", "zh-TW"),
                "currency": currency,
                "queryLegs": query_legs,
                "dateTimeGroupingType": "DATE_TIME_GROUPING_TYPE_BY_DATE",
            }
        },
        {"x-api-key": api_key},
        timeout=timeout,
    )
    start_text = start.strftime("%Y-%m-%d")
    end_text = end.strftime("%Y-%m-%d")
    candidates: list[dict[str, Any]] = []
    for index, quote in enumerate(skyscanner_quotes(data)):
        price = parse_price_number((quote.get("minPrice") or {}).get("amount") if isinstance(quote.get("minPrice"), dict) else quote.get("price"))
        outbound_date = skyscanner_quote_date(quote.get("outboundLeg") or quote.get("outbound_leg"))
        return_date = skyscanner_quote_date(quote.get("inboundLeg") or quote.get("inbound_leg"))
        if price is None or not outbound_date or not (start_text <= outbound_date <= end_text):
            continue
        if trip_days > 0:
            if not return_date:
                continue
            duration = (parse_iso_date(return_date) - parse_iso_date(outbound_date)).days
            if duration != trip_days:
                continue
        date_label = f"{outbound_date} - {return_date}" if return_date else outbound_date
        candidates.append(
            {
                "watch_id": watch["id"],
                "item_type": "flight",
                "source_id": f"{source.get('id') or 'skyscanner'}:{stable_id(f'{date_label}|{price}|{index}', 10)}",
                "source_name": str(source.get("name") or "Skyscanner Indicative"),
                "url": build_skyscanner_link(departure, arrival, outbound_date, return_date),
                "title": f"{departure}->{arrival} {date_label}",
                "price": price,
                "currency": currency,
                "available": True,
                "error": "",
                "raw": {
                    "provider": "skyscanner_indicative_flights",
                    "mode": mode,
                    "departure_date": outbound_date,
                    "return_date": return_date,
                    "trip_days": trip_days,
                    "range_start": start_text,
                    "range_end": end_text,
                    "cached": True,
                },
            }
        )
    candidates.sort(key=lambda item: float(item["price"]))
    if not candidates:
        raise RuntimeError("Skyscanner returned no matching indicative quotes")
    range_low = float(candidates[0]["price"])
    for candidate in candidates:
        candidate["raw"]["range_low"] = range_low
    return candidates[:30]


def get_source_candidates(
    watch: dict[str, Any],
    source: dict[str, Any],
    file_config: dict[str, str],
    timeout: int,
) -> list[dict[str, Any]]:
    source_type = str(source.get("type") or "html").strip().lower()
    if source_type in {"html", "url", "product_url"}:
        return get_html_candidates(watch, source, timeout)
    if source_type == "serpapi_google_shopping":
        return get_google_shopping_candidates(watch, source, file_config, timeout)
    if source_type == "serpapi_google_flights":
        return get_google_flights_candidates(watch, source, file_config, timeout)
    if source_type == "serpapi_google_flights_sampled":
        return get_serpapi_sampled_flight_candidates(watch, source, file_config, timeout)
    if source_type == "skyscanner_indicative_flights":
        return get_skyscanner_indicative_candidates(watch, source, file_config, timeout)
    raise RuntimeError(f"Unsupported source type: {source_type}")


def connect_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.row_factory = sqlite3.Row
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            watch_id TEXT NOT NULL,
            source_id TEXT NOT NULL,
            source_name TEXT NOT NULL,
            item_type TEXT NOT NULL,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            price REAL,
            currency TEXT NOT NULL,
            available INTEGER NOT NULL,
            observed_at TEXT NOT NULL,
            error TEXT NOT NULL,
            raw_json TEXT NOT NULL
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            watch_id TEXT NOT NULL,
            source_id TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            price REAL NOT NULL,
            target_price REAL,
            triggered_at TEXT NOT NULL,
            message TEXT NOT NULL
        )
        """
    )
    db.execute("CREATE INDEX IF NOT EXISTS idx_observations_watch_time ON observations(watch_id, observed_at)")
    db.execute("CREATE INDEX IF NOT EXISTS idx_alerts_watch_time ON alerts(watch_id, triggered_at)")
    db.commit()
    return db


def insert_observation(db: sqlite3.Connection, item: dict[str, Any], observed_at: str) -> None:
    db.execute(
        """
        INSERT INTO observations (
            watch_id, source_id, source_name, item_type, url, title, price, currency,
            available, observed_at, error, raw_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item["watch_id"],
            item["source_id"],
            item["source_name"],
            item["item_type"],
            item["url"],
            item["title"],
            item["price"],
            item["currency"],
            1 if item["available"] else 0,
            observed_at,
            item["error"],
            json.dumps(item.get("raw") or {}, ensure_ascii=False),
        ),
    )


def get_year_range(db: sqlite3.Connection, watch_id: str, observed_at: datetime) -> tuple[float | None, float | None]:
    since = (observed_at - timedelta(days=365)).isoformat()
    row = db.execute(
        """
        SELECT MIN(price) AS low, MAX(price) AS high
        FROM observations
        WHERE watch_id = ?
          AND observed_at >= ?
          AND available = 1
          AND price IS NOT NULL
        """,
        (watch_id, since),
    ).fetchone()
    if not row:
        return None, None
    return row["low"], row["high"]


def get_flight_year_average(
    db: sqlite3.Connection,
    watch_id: str,
    year: int,
    current_results: list[dict[str, Any]] | None = None,
) -> tuple[float | None, int]:
    latest_by_date: dict[str, tuple[str, float]] = {}
    rows = db.execute(
        """
        SELECT price, observed_at, raw_json
        FROM observations
        WHERE watch_id = ?
          AND item_type = 'flight'
          AND available = 1
          AND price IS NOT NULL
        ORDER BY observed_at ASC
        """,
        (watch_id,),
    ).fetchall()
    values: list[tuple[float, str, dict[str, Any]]] = []
    for row in rows:
        try:
            raw = json.loads(row["raw_json"] or "{}")
        except (TypeError, json.JSONDecodeError):
            raw = {}
        values.append((float(row["price"]), str(row["observed_at"]), raw))
    for result in current_results or []:
        if result.get("available") and result.get("price") is not None:
            values.append((float(result["price"]), "9999-current", result.get("raw") or {}))
    for price, observed_at, raw in values:
        departure_date = str(raw.get("departure_date") or "")
        if not departure_date.startswith(f"{year:04d}-"):
            continue
        previous = latest_by_date.get(departure_date)
        if previous is None or observed_at > previous[0] or (observed_at == previous[0] and price < previous[1]):
            latest_by_date[departure_date] = (observed_at, price)
    prices = [price for _, price in latest_by_date.values()]
    return (sum(prices) / len(prices), len(prices)) if prices else (None, 0)


def get_recent_alert(
    db: sqlite3.Connection,
    watch_id: str,
    alert_type: str,
    observed_at: datetime,
    cooldown_days: int,
) -> sqlite3.Row | None:
    since = (observed_at - timedelta(days=cooldown_days)).isoformat()
    return db.execute(
        """
        SELECT *
        FROM alerts
        WHERE watch_id = ?
          AND alert_type = ?
          AND triggered_at >= ?
        ORDER BY triggered_at DESC
        LIMIT 1
        """,
        (watch_id, alert_type, since),
    ).fetchone()


def source_checked_recently(
    db: sqlite3.Connection,
    watch_id: str,
    source_id: str,
    observed_at: datetime,
    interval_hours: int,
) -> bool:
    if interval_hours <= 0:
        return False
    since = (observed_at - timedelta(hours=interval_hours)).isoformat()
    row = db.execute(
        """
        SELECT 1
        FROM observations
        WHERE watch_id = ?
          AND observed_at >= ?
          AND (source_id = ? OR source_id LIKE ?)
        LIMIT 1
        """,
        (watch_id, since, source_id, f"{source_id}:%"),
    ).fetchone()
    return row is not None


def insert_alert(
    db: sqlite3.Connection,
    watch_id: str,
    source_id: str,
    alert_type: str,
    price: float,
    target_price: float | None,
    triggered_at: str,
    message: str,
) -> None:
    db.execute(
        """
        INSERT INTO alerts (watch_id, source_id, alert_type, price, target_price, triggered_at, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (watch_id, source_id, alert_type, price, target_price, triggered_at, message),
    )


def build_sources(watch: dict[str, Any]) -> list[dict[str, Any]]:
    sources = watch.get("sources")
    if isinstance(sources, list) and sources:
        return [source for source in sources if isinstance(source, dict)]
    if watch.get("url"):
        return [{"type": "html", "url": watch["url"], "name": watch.get("source_name", "")}]
    return []


def normalize_watch(raw_watch: dict[str, Any]) -> dict[str, Any]:
    watch = dict(raw_watch)
    watch["id"] = str(watch.get("id") or slugify(str(watch.get("name") or watch.get("query") or "watch"), "watch"))
    watch.setdefault("name", watch["id"])
    watch.setdefault("type", "product")
    watch.setdefault("currency", "TWD")
    watch.setdefault("alert_on_new_low", True)
    watch.setdefault("alert_on_first_seen", False)
    watch.setdefault("alert_cooldown_days", 7)
    return watch


def merge_watches(local_watches: list[dict[str, Any]], remote_watches: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for watch in [*local_watches, *remote_watches]:
        normalized = normalize_watch(watch)
        merged[normalized["id"]] = normalized
    return list(merged.values())


def build_alert_message(
    watch: dict[str, Any],
    best: dict[str, Any],
    alert_type: str,
    target_price: float | None,
    year_low: float | None,
    year_high: float | None,
    comparison_year: int | None = None,
    current_year_average: float | None = None,
    previous_year_average: float | None = None,
) -> str:
    currency = best["currency"]
    strategy = str(watch.get("alert_strategy") or "")
    if alert_type == "target":
        label = "到價提醒"
    elif strategy == "annual_floor":
        label = "未來一年最低機票"
    else:
        label = "一年新低提醒"
    lines = [
        f"Jarvis {label}",
        f"項目：{watch.get('name')}",
        f"目前最低：{format_money(best['price'], currency)}（{best['source_name']}）",
    ]
    raw = best.get("raw") if isinstance(best.get("raw"), dict) else {}
    if raw.get("departure_date"):
        date_text = str(raw["departure_date"])
        if raw.get("return_date"):
            date_text += f" 至 {raw['return_date']}"
        lines.append(f"日期：{date_text}")
    if target_price is not None:
        lines.append(f"目標價：{format_money(target_price, currency)}")
    if year_low is not None and year_high is not None:
        lines.append(f"近一年：{format_money(year_low, currency)} - {format_money(year_high, currency)}")
    if comparison_year is not None:
        current_text = format_money(current_year_average, currency) if current_year_average is not None else "尚無資料"
        previous_text = format_money(previous_year_average, currency) if previous_year_average is not None else "尚無資料"
        lines.append(f"{comparison_year} 平均：{current_text}")
        lines.append(f"{comparison_year - 1} 平均：{previous_text}")
    if raw.get("cached"):
        lines.append("提醒：這是探索快取價，購買前請開啟連結確認即時票價。")
    if best.get("url"):
        lines.append(f"連結：{best['url']}")
    return "\n".join(lines)


def process_watch(
    db: sqlite3.Connection,
    watch: dict[str, Any],
    file_config: dict[str, str],
    observed_at: datetime,
    timeout: int,
    force_alert: bool,
    dry_run: bool,
) -> dict[str, Any]:
    before_low, _ = get_year_range(db, watch["id"], observed_at)
    observed_at_text = observed_at.isoformat()
    results: list[dict[str, Any]] = []
    errors: list[str] = []

    for source in build_sources(watch):
        source_id = str(source.get("id") or slugify(source_display_name(source, str(source.get("url") or "")), "source"))
        check_interval_hours = int(source.get("check_interval_hours") or 0)
        if not force_alert and source_checked_recently(db, watch["id"], source_id, observed_at, check_interval_hours):
            continue
        try:
            results.extend(get_source_candidates(watch, source, file_config, timeout))
        except Exception as exc:
            source_name = source_display_name(source, str(source.get("url") or ""))
            errors.append(f"{source_name}: {exc}")
            results.append(
                {
                    "watch_id": watch["id"],
                    "item_type": watch.get("type", "product"),
                    "source_id": str(source.get("id") or slugify(source_name, "source")),
                    "source_name": source_name,
                    "url": str(source.get("url") or ""),
                    "title": str(watch.get("name") or ""),
                    "price": None,
                    "currency": str(source.get("currency") or watch.get("currency") or "TWD"),
                    "available": False,
                    "error": str(exc),
                    "raw": {},
                }
            )

    if not dry_run:
        for item in results:
            insert_observation(db, item, observed_at_text)
        db.commit()

    available = [item for item in results if item.get("available") and item.get("price") is not None]
    best = min(available, key=lambda item: float(item["price"])) if available else None
    year_low, year_high = get_year_range(db, watch["id"], observed_at)
    if dry_run:
        current_prices = [float(item["price"]) for item in available]
        if current_prices:
            year_low = min([price for price in [year_low, *current_prices] if price is not None])
            year_high = max([price for price in [year_high, *current_prices] if price is not None])

    comparison_year: int | None = None
    current_year_average: float | None = None
    previous_year_average: float | None = None
    current_year_sample_count = 0
    previous_year_sample_count = 0
    if watch.get("type") == "flight":
        range_start = next(
            (
                str((item.get("raw") or {}).get("range_start") or "")
                for item in available
                if (item.get("raw") or {}).get("range_start")
            ),
            "",
        )
        comparison_year = int(range_start[:4]) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", range_start) else observed_at.year
        current_year_average, current_year_sample_count = get_flight_year_average(
            db,
            watch["id"],
            comparison_year,
            available if dry_run else None,
        )
        previous_year_average, previous_year_sample_count = get_flight_year_average(
            db,
            watch["id"],
            comparison_year - 1,
        )

    alerts: list[str] = []
    target_price = parse_price_number(watch.get("target_price"))
    cooldown_days = int(watch.get("alert_cooldown_days") or 7)
    if best:
        best_price = float(best["price"])
        if target_price is not None and best_price <= target_price:
            recent = get_recent_alert(db, watch["id"], "target", observed_at, cooldown_days)
            if force_alert or recent is None:
                message = build_alert_message(
                    watch,
                    best,
                    "target",
                    target_price,
                    year_low,
                    year_high,
                    comparison_year,
                    current_year_average,
                    previous_year_average,
                )
                alerts.append(message)
                if not dry_run:
                    insert_alert(db, watch["id"], best["source_id"], "target", best_price, target_price, observed_at_text, message)
        alert_on_new_low = parse_bool(watch.get("alert_on_new_low"), True)
        alert_on_first_seen = parse_bool(watch.get("alert_on_first_seen"), False)
        is_first_seen_alert = before_low is None and alert_on_first_seen
        is_new_low_alert = before_low is not None and best_price < float(before_low)
        if alert_on_new_low and (is_first_seen_alert or is_new_low_alert):
            recent = get_recent_alert(db, watch["id"], "new_low", observed_at, cooldown_days)
            if force_alert or recent is None:
                message = build_alert_message(
                    watch,
                    best,
                    "new_low",
                    target_price,
                    year_low,
                    year_high,
                    comparison_year,
                    current_year_average,
                    previous_year_average,
                )
                alerts.append(message)
                if not dry_run:
                    insert_alert(db, watch["id"], best["source_id"], "new_low", best_price, target_price, observed_at_text, message)
    if alerts and not dry_run:
        db.commit()

    return {
        "watch": watch,
        "results": results,
        "best": best,
        "year_low": year_low,
        "year_high": year_high,
        "comparison_year": comparison_year,
        "current_year_average": current_year_average,
        "current_year_sample_count": current_year_sample_count,
        "previous_year_average": previous_year_average,
        "previous_year_sample_count": previous_year_sample_count,
        "alerts": alerts,
        "errors": errors,
    }


def build_report(processed: list[dict[str, Any]], observed_at: datetime, dry_run: bool) -> str:
    lines = [
        f"# Price Watch Report - {observed_at.strftime('%Y-%m-%d %H:%M')}",
        "",
        f"- Mode: {'dry-run' if dry_run else 'normal'}",
        f"- Watches: {len(processed)}",
        "",
    ]
    for item in processed:
        watch = item["watch"]
        best = item["best"]
        currency = str(watch.get("currency") or "TWD")
        lines.append(f"## {watch.get('name')}")
        if best:
            currency = best["currency"]
            lines.append(f"- Current best: {format_money(best['price'], currency)} at {best['source_name']}")
            if best.get("url"):
                lines.append(f"- Link: {best['url']}")
        else:
            lines.append("- Current best: no available price")
        if item["year_low"] is not None and item["year_high"] is not None:
            lines.append(f"- 365-day range: {format_money(item['year_low'], currency)} - {format_money(item['year_high'], currency)}")
        if item.get("comparison_year") is not None:
            year = int(item["comparison_year"])
            current_average = item.get("current_year_average")
            previous_average = item.get("previous_year_average")
            current_text = format_money(current_average, currency) if current_average is not None else "no data"
            previous_text = format_money(previous_average, currency) if previous_average is not None else "no data"
            lines.append(f"- {year} average: {current_text} ({item.get('current_year_sample_count', 0)} departure dates)")
            lines.append(f"- {year - 1} average: {previous_text} ({item.get('previous_year_sample_count', 0)} departure dates)")
        if item["alerts"]:
            lines.append(f"- Alerts: {len(item['alerts'])}")
        if item["errors"]:
            lines.append("- Errors:")
            for error in item["errors"]:
                lines.append(f"  - {error}")
        if item["results"]:
            lines.append("")
            lines.append("| Source | Price | Available | URL |")
            lines.append("|---|---:|---|---|")
            for result in sorted(item["results"], key=lambda row: float(row["price"]) if row.get("price") is not None else float("inf")):
                price_text = format_money(result.get("price"), result.get("currency") or currency)
                available = "yes" if result.get("available") else "no"
                url = result.get("url") or ""
                lines.append(f"| {result['source_name']} | {price_text} | {available} | {url} |")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def send_line_push(channel_access_token: str, to: str, message: str) -> None:
    body = json.dumps({"to": to, "messages": [{"type": "text", "text": message}]}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        "https://api.line.me/v2/bot/message/push",
        data=body,
        headers={
            "Authorization": f"Bearer {channel_access_token}",
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30):
        return


def send_line_broadcast(channel_access_token: str, message: str) -> None:
    body = json.dumps({"messages": [{"type": "text", "text": message}]}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        "https://api.line.me/v2/bot/message/broadcast",
        data=body,
        headers={
            "Authorization": f"Bearer {channel_access_token}",
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30):
        return


def send_line_message(file_config: dict[str, str], message: str) -> None:
    token = get_config_value(file_config, "LINE_CHANNEL_ACCESS_TOKEN", "")
    mode = get_config_value(file_config, "LINE_MODE", "broadcast").strip().lower()
    line_to = get_config_value(file_config, "LINE_TO", "")
    if not token:
        print("WARNING: LINE_CHANNEL_ACCESS_TOKEN is missing. Alert was generated but not sent.")
        return
    if mode == "push":
        if not line_to:
            print("WARNING: LINE_TO is missing for push mode. Alert was generated but not sent.")
            return
        send_line_push(token, line_to, message)
        print("LINE push sent successfully.")
        return
    send_line_broadcast(token, message)
    print("LINE broadcast sent successfully.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-path", default=str(Path(__file__).with_name("price-watch.env")))
    parser.add_argument("--watch-config-path", default="")
    parser.add_argument("--force", action="store_true", help="Ignore alert cooldown and send due alerts again.")
    parser.add_argument("--skip-line", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    file_config = read_env_file(Path(args.config_path))
    timezone_raw = get_config_value(file_config, "TIME_ZONE", "Asia/Taipei")
    timezone_name = TIME_ZONE_ALIASES.get(timezone_raw, timezone_raw)
    observed_at = datetime.now(ZoneInfo(timezone_name))
    timeout = int(get_config_value(file_config, "FETCH_TIMEOUT_SECONDS", "30"))
    watch_config_path_text = args.watch_config_path or get_config_value(
        file_config,
        "PRICE_WATCH_CONFIG_PATH",
        str(Path(__file__).with_name("price-watch-config.json")),
    )
    watch_config_path = resolve_workspace_path(watch_config_path_text)
    db_path = resolve_workspace_path(
        get_config_value(
            file_config,
            "PRICE_WATCH_DB_PATH",
            "vault/2-actions/scheduled-reports/price-watch/price-history.sqlite",
        )
    )
    report_root = resolve_workspace_path(
        get_config_value(file_config, "REPORT_ROOT", "vault/2-actions/scheduled-reports/price-watch")
    )
    report_root.mkdir(parents=True, exist_ok=True)

    config = read_json_file(watch_config_path)
    raw_watches = config.get("watches", []) if isinstance(config, dict) else []
    local_watches = [item for item in raw_watches if isinstance(item, dict) and parse_bool(item.get("enabled"), True)]
    remote_watches: list[dict[str, Any]] = []
    remote_url = get_config_value(file_config, "PRICE_WATCH_REMOTE_URL", "")
    if remote_url:
        try:
            remote_watches = [
                item
                for item in fetch_remote_watch_config(
                    remote_url,
                    get_config_value(file_config, "PRICE_WATCH_ACCESS_TOKEN", ""),
                    timeout,
                )
                if isinstance(item, dict) and parse_bool(item.get("enabled"), True)
            ]
            print(f"Loaded {len(remote_watches)} remote watch(es).")
        except Exception as exc:
            print(f"WARNING: remote watch config unavailable: {exc}")
    watches = merge_watches(local_watches, remote_watches)
    if not watches:
        print(f"No enabled watches in {watch_config_path}.")
        processed: list[dict[str, Any]] = []
    else:
        db = connect_db(db_path)
        processed = [
            process_watch(
                db=db,
                watch=watch,
                file_config=file_config,
                observed_at=observed_at,
                timeout=timeout,
                force_alert=args.force,
                dry_run=args.dry_run,
            )
            for watch in watches
        ]
    report = build_report(processed, observed_at, args.dry_run)
    report_path = report_root / f"price-watch-{observed_at.strftime('%Y-%m-%d-%H%M')}.md"
    if not args.dry_run:
        report_path.write_text(report, encoding="utf-8")
        print(f"Report written to {report_path}")
    else:
        print(report)

    alert_messages: list[str] = []
    for item in processed:
        alert_messages.extend(item["alerts"])
    if alert_messages and not args.skip_line:
        send_line_message(file_config, "\n\n".join(alert_messages[:5]))
    elif alert_messages:
        print(f"{len(alert_messages)} alert(s) generated; LINE skipped.")
    else:
        print("No alerts generated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
