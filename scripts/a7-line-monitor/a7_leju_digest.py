from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from typing import Any
from zipfile import ZipFile
from zoneinfo import ZoneInfo


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


DEFAULT_AREA_CONFIG = [
    {
        "name": "A7站重劃區-郵政物流",
        "theme": "郵政特區 / AI走廊",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11175",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11175",
        "new_build_list_url": "https://www.leju.com.tw/community_list?area=H333&city=H&is_new=1&sid=11175",
        "road_focus": ["文桃路南側", "樂善科技園區周邊", "中華郵政物流總部周邊"],
    },
    {
        "name": "A7站重劃區-樂善國小",
        "theme": "學區",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11176",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11176",
        "new_build_list_url": "https://www.leju.com.tw/community_list?area=H333&city=H&is_new=1&sid=11176",
        "road_focus": ["文德路", "文明路", "文康街與樂善一路周邊"],
    },
    {
        "name": "A7站重劃區-中心商業區",
        "theme": "商業核心 / AI走廊",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11173",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11173",
        "new_build_list_url": "https://www.leju.com.tw/community_list?area=H333&city=H&is_new=1&sid=11173",
        "road_focus": ["文化一路近A7站南段", "樂善一路北段", "華亞科技園區銜接帶"],
    },
    {
        "name": "A7站重劃區-文青國小",
        "theme": "學區 / 住宅核心",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11174",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11174",
        "new_build_list_url": "https://www.leju.com.tw/community_list?area=H333&city=H&is_new=1&sid=11174",
        "road_focus": ["文桃路北側", "文化一路西側", "文青路與文青二路周邊"],
    },
    {
        "name": "A7站重劃區-體育大學",
        "theme": "成熟生活圈",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11177",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11177",
        "new_build_list_url": "https://www.leju.com.tw/community_list?area=H333&city=H&is_new=1&sid=11177",
        "road_focus": ["文化一路西側", "文青路商業帶", "體育大學站周邊"],
    },
]

TIME_ZONE_ALIASES = {"Taipei Standard Time": "Asia/Taipei"}


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


def resolve_workspace_path(path_text: str) -> Path:
    path = Path(path_text)
    return path if path.is_absolute() else Path.cwd() / path


def read_json_file(path: Path) -> Any:
    if not path.exists():
        return None
    raw = path.read_text(encoding="utf-8").strip()
    return json.loads(raw) if raw else None


def write_json_file(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def get_default_area_config_path() -> Path:
    return Path(__file__).with_name("area-config.json")


def get_default_bargain_watch_config_path() -> Path:
    return Path(__file__).with_name("bargain-watch-config.json")


def get_default_market_pulse_config_path() -> Path:
    return Path(__file__).with_name("market-pulse-config.json")


def load_area_config(path: Path | None) -> list[dict[str, Any]]:
    config_path = path or get_default_area_config_path()
    if config_path.exists():
        loaded = read_json_file(config_path)
        if isinstance(loaded, list) and loaded:
            return loaded
        raise RuntimeError(f"Area config file is invalid: {config_path}")
    return DEFAULT_AREA_CONFIG


def load_bargain_watch_config(path: Path | None) -> dict[str, Any]:
    config_path = path or get_default_bargain_watch_config_path()
    if not config_path.exists():
        return {"enabled": False, "threshold_percent": 20, "max_items": 8, "areas": [], "housefun_cities": []}
    loaded = read_json_file(config_path)
    if isinstance(loaded, dict):
        loaded.setdefault("enabled", True)
        loaded.setdefault("threshold_percent", 20)
        loaded.setdefault("max_items", 8)
        loaded.setdefault("areas", [])
        loaded.setdefault("housefun_cities", [])
        loaded.setdefault("min_comparables", 3)
        return loaded
    raise RuntimeError(f"Bargain watch config file is invalid: {config_path}")


def load_market_pulse_config(path: Path | None) -> dict[str, Any]:
    config_path = path or get_default_market_pulse_config_path()
    if not config_path.exists():
        return {"enabled": False, "days_back": 7, "source_urls": [], "districts": [], "keywords": []}
    loaded = read_json_file(config_path)
    if isinstance(loaded, dict):
        loaded.setdefault("enabled", True)
        loaded.setdefault("days_back", 7)
        loaded.setdefault("max_districts", 8)
        loaded.setdefault("max_article_fetches", 24)
        loaded.setdefault("min_article_chars", 180)
        loaded.setdefault("source_urls", [])
        loaded.setdefault("districts", [])
        loaded.setdefault("keywords", [])
        loaded.setdefault("infrastructure", {})
        if isinstance(loaded["infrastructure"], dict):
            loaded["infrastructure"].setdefault("enabled", True)
            loaded["infrastructure"].setdefault("max_items", 8)
            loaded["infrastructure"].setdefault("cities", [])
            loaded["infrastructure"].setdefault("keywords", [])
            loaded["infrastructure"].setdefault("source_urls", [])
        return loaded
    raise RuntimeError(f"Market pulse config file is invalid: {config_path}")


def normalize_url(url: str) -> str:
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        return f"https://www.leju.com.tw{url}"
    return f"https://www.leju.com.tw/{url.lstrip('/')}"


def strip_tags(text: str) -> str:
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.S | re.I)
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = (
        clean.replace("&nbsp;", " ")
        .replace("&#160;", " ")
        .replace("&amp;", "&")
        .replace("&quot;", '"')
    )
    return re.sub(r"\s+", " ", clean).strip()


def html_to_text(content: str) -> str:
    return strip_tags(content)


def is_cloudflare_challenge(content: str) -> bool:
    lower = content.lower()
    return (
        ("just a moment" in lower and "challenges.cloudflare.com" in lower)
        or "cf-chl" in lower
        or "cf_clearance" in lower
    )


def fetch_text_with_curl_cffi(url: str) -> str:
    try:
        from curl_cffi import requests as curl_requests
    except Exception as exc:
        raise RuntimeError(f"curl_cffi unavailable: {exc}") from exc

    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://www.leju.com.tw/",
        "Upgrade-Insecure-Requests": "1",
    }
    response = curl_requests.get(
        url,
        headers=headers,
        impersonate="chrome",
        timeout=10,
    )
    text = response.text or ""
    if response.status_code >= 400:
        raise RuntimeError(f"HTTP {response.status_code} for {url}")
    if not text.strip():
        raise RuntimeError(f"empty response for {url}")
    if is_cloudflare_challenge(text):
        raise RuntimeError(f"Cloudflare challenge blocked {url}")
    return text


def fetch_text_with_curl(url: str) -> str:
    attempts = [
        [
            "-A",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
            "-H",
            "Accept-Language: zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "-H",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "-H",
            "Referer: https://www.leju.com.tw/",
            "-H",
            "Cache-Control: no-cache",
        ],
        [
            "-A",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
            "-H",
            "Accept-Language: zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "-H",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "-H",
            "Referer: https://www.leju.com.tw/",
        ],
    ]
    errors: list[str] = []
    curl_bin = shutil.which("curl") or shutil.which("curl.exe") or "curl"
    for extra_args in attempts:
        result = subprocess.run(
            [
                curl_bin,
                "-L",
                "-sS",
                "--compressed",
                "--http1.1",
                "--connect-timeout",
                "5",
                "--max-time",
                "12",
                *extra_args,
                url,
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=15,
            check=False,
        )
        if result.returncode != 0 or not result.stdout.strip():
            errors.append(result.stderr.strip() or str(result.returncode))
            continue
        if is_cloudflare_challenge(result.stdout):
            errors.append("Cloudflare challenge")
            continue
        return result.stdout
    raise RuntimeError(f"curl fetch failed for {url}: {'; '.join(errors[-2:])}")


def fetch_text_with_proxy(url: str) -> str:
    proxy_url = os.environ.get("LEJU_FETCH_PROXY_URL", "").strip()
    if not proxy_url or "leju.com.tw" not in url:
        raise RuntimeError("Leju fetch proxy not configured")

    encoded_target = urllib.parse.quote(url, safe="")
    if "{url}" in proxy_url:
        request_url = proxy_url.replace("{url}", encoded_target)
    else:
        separator = "&" if "?" in proxy_url else "?"
        request_url = f"{proxy_url}{separator}url={encoded_target}"

    headers = {
        "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/136.0.0.0 Safari/537.36"
        ),
    }
    token = os.environ.get("LEJU_FETCH_PROXY_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(request_url, headers=headers)
    with urllib.request.urlopen(request, timeout=12) as response:
        raw = response.read()
        content_type = response.headers.get("Content-Type", "")
    text = raw.decode("utf-8", errors="ignore")
    if "application/json" in content_type:
        data = json.loads(text)
        text = str(data.get("html") or data.get("content") or data.get("body") or "")
    if not text.strip():
        raise RuntimeError(f"empty proxy response for {url}")
    if is_cloudflare_challenge(text):
        raise RuntimeError(f"Cloudflare challenge returned by proxy for {url}")
    return text


def fetch_text_with_playwright(url: str) -> str:
    try:
        from playwright.sync_api import sync_playwright
    except Exception as exc:
        raise RuntimeError(f"playwright unavailable: {exc}") from exc

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-sandbox",
            ],
        )
        try:
            context = browser.new_context(
                locale="zh-TW",
                timezone_id="Asia/Taipei",
                viewport={"width": 1366, "height": 900},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/136.0.0.0 Safari/537.36"
                ),
                extra_http_headers={
                    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Referer": "https://www.leju.com.tw/",
                },
            )
            page = context.new_page()
            response = page.goto(url, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(1500)
            content = page.content()
            status = response.status if response else 0
            if status >= 400 and not content.strip():
                raise RuntimeError(f"HTTP {status} for {url}")
            if not content.strip():
                raise RuntimeError(f"empty browser response for {url}")
            if is_cloudflare_challenge(content):
                page.wait_for_timeout(3000)
                content = page.content()
                if is_cloudflare_challenge(content):
                    raise RuntimeError(f"Cloudflare challenge blocked browser fetch for {url}")
            return content
        finally:
            browser.close()


def fetch_text(url: str) -> str:
    errors: list[str] = []
    for fetcher in (fetch_text_with_proxy, fetch_text_with_curl_cffi, fetch_text_with_curl, fetch_text_with_playwright):
        try:
            return fetcher(url)
        except Exception as exc:
            errors.append(str(exc))
    raise RuntimeError(f"fetch failed for {url}: {'; '.join(errors)}")


def fetch_bytes(url: str) -> bytes:
    curl_bin = shutil.which("curl") or shutil.which("curl.exe") or "curl"
    result = subprocess.run(
        [
            curl_bin,
            "-L",
            "-sS",
            "--connect-timeout",
            "10",
            "--max-time",
            "25",
            "-A",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
            "-H",
            "Accept-Language: zh-TW,zh;q=0.9,en;q=0.8",
            url,
        ],
        capture_output=True,
        timeout=30,
        check=False,
    )
    if result.returncode != 0 or not result.stdout:
        stderr = result.stderr.decode("utf-8", errors="ignore") if result.stderr else ""
        error_text = re.sub(r"\s+", " ", stderr).strip()
        if "Failed to connect" in error_text or result.returncode == 28:
            error_text = "連線逾時或無法連到官方資料站"
        raise RuntimeError(error_text or f"下載失敗，代碼 {result.returncode}")
    return result.stdout


def get_regex_value(content: str, pattern: str, default: str = "") -> str:
    match = re.search(pattern, content, re.S)
    return match.group(1).strip() if match else default


def get_regex_int(content: str, pattern: str) -> int | None:
    value = get_regex_value(content, pattern, "")
    digits = re.sub(r"[^\d]", "", value)
    return int(digits) if digits else None


def parse_percent_value(text: str) -> float | None:
    if not text:
        return None
    match = re.search(r"([+\-]?\d+(?:\.\d+)?)%", text)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def parse_price_range(text: str) -> tuple[float | None, float | None]:
    if not text:
        return None, None
    numbers = re.findall(r"(\d+(?:\.\d+)?)", text)
    if not numbers:
        return None, None
    values = [float(n) for n in numbers]
    if len(values) == 1:
        return values[0], values[0]
    return values[0], values[1]


def get_project_low_price(project: dict[str, str]) -> float | None:
    low, high = parse_price_range(project.get("status", ""))
    if low is None:
        return None
    if high is not None and high < low:
        return high
    return low


def get_project_mid_price(project: dict[str, str]) -> float | None:
    low, high = parse_price_range(project.get("status", ""))
    if low is None:
        return None
    if high is None:
        return low
    return (low + high) / 2


def get_median(values: list[float]) -> float | None:
    if not values:
        return None
    sorted_values = sorted(values)
    midpoint = len(sorted_values) // 2
    if len(sorted_values) % 2:
        return sorted_values[midpoint]
    return (sorted_values[midpoint - 1] + sorted_values[midpoint]) / 2


def parse_anchor_links(content: str, href_keyword: str) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    seen: set[str] = set()
    for href, label in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', content, re.S | re.I):
        url = normalize_url(href)
        if href_keyword not in url:
            continue
        name = strip_tags(label)
        if not name:
            continue
        key = f"{name}|{url}"
        if key in seen:
            continue
        seen.add(key)
        results.append({"name": name, "url": url})
    return results


def extract_html_section(content: str, heading: str) -> str:
    candidates = [
        rf"##\s*{re.escape(heading)}(.*?)(?:##\s*[^#<\n]+|$)",
        rf">\s*{re.escape(heading)}\s*<(.*?)(?:>\s*[^<]+<|$)",
    ]
    for pattern in candidates:
        match = re.search(pattern, content, re.S)
        if match:
            return match.group(1)
    return ""


def get_latest_listing_links(content: str) -> list[dict[str, str]]:
    section = extract_html_section(content, "最新上架")
    source = section if section else content
    return parse_anchor_links(source, "/sales/")


def parse_project_blocks(content: str) -> list[dict[str, str]]:
    links = parse_anchor_links(content, "/community/")
    text = html_to_text(content)
    projects: list[dict[str, str]] = []
    for link in links:
        name = link["name"]
        if name in {"首頁", "前往看更多", "更多", "建案總表"} or "AlfaSafe" in name:
            continue
        tail = text.split(name, 1)[1] if name in text else ""
        snippet = tail[:900]
        price_text = get_regex_value(snippet, r"開價\s*([^\s]+)", "")
        if not price_text:
            price_text = get_regex_value(snippet, r"(待定|未開賣|請電洽)", "")
        schedule_text = get_regex_value(
            snippet,
            r"(預計\d+年\d+月|預計\d+年|預售屋|施工中|未完工|已完銷|完銷|銷售中|已完工|新成屋|成屋|已交屋|交屋)",
            "",
        )
        status_bits = " ".join(bit for bit in [price_text, schedule_text] if bit).strip()
        projects.append({"name": name, "url": link["url"], "status": status_bits})
    deduped: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in projects:
        key = item["url"].split("&is_alfasafe=", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped[:40]


def dedupe_projects(projects: list[dict[str, str]]) -> list[dict[str, str]]:
    deduped: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in projects:
        key = item.get("url", "").split("&is_alfasafe=", 1)[0] or item.get("name", "")
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def get_project_detail_status(project: dict[str, str]) -> str:
    try:
        detail_text = html_to_text(fetch_text(project["url"]))
    except Exception:
        return project.get("status", "")
    price_text = get_regex_value(detail_text, r"開價\s*([^\s]+)", "")
    if not price_text:
        price_text = get_regex_value(detail_text, r"最新價\s*([\d.]+萬/?坪)", "")
    if price_text.endswith("萬坪"):
        price_text = price_text.replace("萬坪", "萬/坪")
    if not price_text:
        price_text = get_regex_value(project.get("status", ""), r"(\d+(?:\.\d+)?~\d+(?:\.\d+)?萬|\d+(?:\.\d+)?萬|待定|未開賣|請電洽)", "")
    schedule_text = get_regex_value(
        detail_text,
        r"(預計\d+年\d+月|預計\d+年|預售屋|施工中|未完工|已完銷|完銷|銷售中|已完工|新成屋|成屋|已交屋|交屋)",
        "",
    )
    return " ".join(bit for bit in [price_text, schedule_text] if bit).strip()


def enrich_project_statuses(projects: list[dict[str, str]]) -> list[dict[str, str]]:
    enriched: list[dict[str, str]] = []
    seen: set[str] = set()
    for project in projects:
        item = dict(project)
        key = f"{item.get('name', '')}|{item.get('url', '')}"
        if key in seen:
            continue
        seen.add(key)
        detail_status = get_project_detail_status(item)
        if detail_status:
            item["status"] = detail_status
        enriched.append(item)
    return enriched


def get_configured_project_links(area: dict[str, Any], key: str) -> list[dict[str, str]]:
    projects: list[dict[str, str]] = []
    for raw_item in area.get(key, []):
        if isinstance(raw_item, str):
            url = normalize_url(raw_item)
            projects.append({"name": url, "url": url, "status": ""})
            continue
        if not isinstance(raw_item, dict):
            continue
        name = str(raw_item.get("name", "")).strip()
        url = normalize_url(str(raw_item.get("url", "")).strip())
        if not name or not url:
            continue
        projects.append({"name": name, "url": url, "status": str(raw_item.get("status", "")).strip()})
    return projects


def get_project_url_mappings(areas: list[dict[str, Any]]) -> list[dict[str, Any]]:
    mappings: list[dict[str, Any]] = []
    for area in areas:
        for item in area.get("project_url_mappings", []):
            if not isinstance(item, dict):
                continue
            name = str(item.get("name", "")).strip()
            url = normalize_url(str(item.get("url", "")).strip())
            if not name or not url:
                continue
            aliases = [str(alias).strip() for alias in item.get("aliases", []) if str(alias).strip()]
            mappings.append({"name": name, "url": url, "aliases": aliases, "area_name": area.get("name", "")})
    return mappings


def decode_csv_bytes(data: bytes) -> str:
    for encoding in ["utf-8-sig", "utf-8", "cp950", "big5"]:
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="ignore")


def iter_csv_rows_from_archive(data: bytes) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    if data[:2] == b"PK":
        with ZipFile(io.BytesIO(data)) as archive:
            for name in archive.namelist():
                if not name.lower().endswith(".csv"):
                    continue
                content = decode_csv_bytes(archive.read(name))
                rows.extend(csv.DictReader(io.StringIO(content)))
        return rows
    content = decode_csv_bytes(data)
    return list(csv.DictReader(io.StringIO(content)))


def get_first_field(row: dict[str, str], names: list[str]) -> str:
    normalized = {re.sub(r"\s+", "", key): value for key, value in row.items() if key is not None}
    for name in names:
        value = normalized.get(re.sub(r"\s+", "", name), "")
        if value:
            return str(value).strip()
    return ""


def get_int_field(row: dict[str, str], names: list[str]) -> int | None:
    value = get_first_field(row, names)
    digits = re.sub(r"[^\d]", "", value)
    return int(digits) if digits else None


def square_meter_to_ping(value: str) -> str:
    try:
        number = float(str(value).replace(",", "").strip())
    except ValueError:
        return ""
    if number <= 0:
        return ""
    return f"{number * 0.3025:.2f}坪"


def money_to_wan(value: int | None) -> str:
    if value is None:
        return ""
    return f"{value / 10000:.0f}萬"


def unit_price_to_wan_per_ping(value: int | None) -> str:
    if value is None:
        return ""
    return f"{value / 10000 / 0.3025:.2f}萬/坪"


def row_text_for_match(row: dict[str, str]) -> str:
    return " ".join(str(value) for value in row.values() if value)


def match_project_mapping(row: dict[str, str], mappings: list[dict[str, Any]]) -> dict[str, Any] | None:
    text = row_text_for_match(row)
    for mapping in mappings:
        candidates = [mapping["name"], *mapping.get("aliases", [])]
        if any(candidate and candidate in text for candidate in candidates):
            return mapping
    return None


def parse_official_presale_row(row: dict[str, str], mapping: dict[str, Any]) -> dict[str, str]:
    unit = get_first_field(row, ["棟及號", "棟戶", "交易標的", "土地位置建物門牌", "建物門牌"])
    floor = get_first_field(row, ["移轉層次", "樓層"])
    building_area = square_meter_to_ping(get_first_field(row, ["建物移轉總面積平方公尺", "建物移轉面積平方公尺", "房屋移轉總面積平方公尺"]))
    parking_price = money_to_wan(get_int_field(row, ["車位總價元", "車位總價"]))
    total_price = money_to_wan(get_int_field(row, ["總價元", "交易總價元", "總價"]))
    unit_price = unit_price_to_wan_per_ping(get_int_field(row, ["單價元平方公尺", "單價元/平方公尺"]))
    if not unit_price:
        unit_price = get_first_field(row, ["單價", "每坪單價"])
    deal_date = get_first_field(row, ["交易年月日", "交易日期"])
    return {
        "project_name": mapping["name"],
        "unit": unit or "戶別未解析",
        "floor": floor or "樓層未解析",
        "area": building_area or "坪數未解析",
        "parking_price": parking_price or "車位價未解析",
        "total_price": total_price or "總價未解析",
        "unit_price": unit_price or "單價未解析",
        "deal_date": deal_date,
        "url": mapping["url"],
        "source": "內政部實價登錄",
    }


def get_official_presale_registrations(source_url: str, mappings: list[dict[str, Any]], limit: int = 50) -> list[dict[str, str]]:
    if not source_url or not mappings:
        return []
    rows = iter_csv_rows_from_archive(fetch_bytes(source_url))
    registrations: list[dict[str, str]] = []
    seen: set[str] = set()
    for row in rows:
        mapping = match_project_mapping(row, mappings)
        if not mapping:
            continue
        item = parse_official_presale_row(row, mapping)
        key = get_registration_key(item)
        if key in seen:
            continue
        seen.add(key)
        registrations.append(item)
        if len(registrations) >= limit:
            break
    return registrations


def get_extra_project_links(area: dict[str, Any]) -> list[dict[str, str]]:
    return get_configured_project_links(area, "extra_project_urls")


def merge_project_lists(*groups: list[dict[str, str]]) -> list[dict[str, str]]:
    merged: list[dict[str, str]] = []
    seen: set[str] = set()
    for group in groups:
        for item in group:
            key = item.get("url", "") or f"{item.get('name', '')}|{item.get('status', '')}"
            if key in seen:
                continue
            seen.add(key)
            merged.append(item)
    return merged


def get_full_community_list_url(area: dict[str, Any]) -> str:
    explicit_url = str(area.get("community_list_url", "")).strip()
    if explicit_url:
        return explicit_url
    new_build_url = str(area.get("new_build_list_url", "")).strip()
    if not new_build_url:
        return ""
    url = re.sub(r"([?&])is_new=1&?", r"\1", new_build_url)
    return url.rstrip("?&")


def get_excluded_project_names(area: dict[str, Any]) -> set[str]:
    return {str(name).strip() for name in area.get("exclude_project_names", []) if str(name).strip()}


def filter_excluded_projects(projects: list[dict[str, str]], excluded_names: set[str]) -> list[dict[str, str]]:
    if not excluded_names:
        return projects
    return [project for project in projects if project.get("name") not in excluded_names and project.get("project_name") not in excluded_names]


def is_pending_launch(project: dict[str, str]) -> bool:
    status = project.get("status", "")
    return any(keyword in status for keyword in ["待定", "未開賣", "潛銷", "即將公開"])


def is_completed_project(project: dict[str, str]) -> bool:
    status = project.get("status", "")
    return any(keyword in status for keyword in ["新成屋", "成屋", "已交屋", "交屋"])


def is_sold_out_presale(project: dict[str, str], active_project_urls: set[str] | None = None) -> bool:
    status = project.get("status", "")
    if is_completed_project(project):
        return False
    if "預售屋" not in status:
        return False
    if any(keyword in status for keyword in ["已完銷", "完銷"]):
        return True
    if active_project_urls is not None:
        return project.get("url", "") not in active_project_urls
    return False


def is_active_presale(project: dict[str, str]) -> bool:
    status = project.get("status", "")
    if is_pending_launch(project) or is_completed_project(project):
        return False
    if "預售屋" in status or "預計" in status:
        return True
    if any(keyword in status for keyword in ["施工中", "未完工"]):
        return True
    return False


def get_project_price_url(project: dict[str, str]) -> str:
    url = project.get("url", "")
    if not url:
        return ""
    if "mode=" in url:
        return re.sub(r"mode=[^&]+", "mode=price", url)
    separator = "&" if "?" in url else "?"
    return f"{url}{separator}mode=price"


def normalize_price_text(value: str) -> str:
    value = value.strip().replace(",", "")
    if not value:
        return ""
    if "萬" in value:
        return value
    return f"{value}萬"


def parse_latest_registration_rows(project: dict[str, str], content: str, limit: int = 3) -> list[dict[str, str]]:
    text = html_to_text(content)
    if "Just a moment..." in text and "Cloudflare" in text:
        return []

    chunks = split_sentences(text)
    if not chunks:
        chunks = [line.strip() for line in text.splitlines() if line.strip()]

    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for chunk in chunks:
        if "成交" not in chunk and "實價" not in chunk:
            continue
        if "萬" not in chunk and "坪" not in chunk:
            continue

        unit = get_regex_value(
            chunk,
            r"([A-ZＡ-Ｚ]\s*棟?\s*[A-ZＡ-Ｚ]?\d{1,3}\s*[-－]\s*\d+\s*(?:F|樓)?)",
            "",
        )
        if not unit:
            unit = get_regex_value(chunk, r"([A-ZＡ-Ｚ]?\d{1,3}\s*[-－]\s*\d+\s*(?:F|樓))", "")
        floor = get_regex_value(chunk, r"(\d{1,2}\s*(?:F|樓))", "")
        area = get_regex_value(chunk, r"(?:房屋|建物|權狀|坪數|面積)\s*([\d.]+\s*坪)", "")
        if not area:
            area = get_regex_value(chunk, r"([\d.]+\s*坪)", "")
        parking_price = get_regex_value(chunk, r"車位(?:價|總價|價格)?\s*([\d,.]+\s*萬)", "")
        total_price = get_regex_value(chunk, r"(?:總價|成交總價)\s*([\d,.]+\s*萬)", "")
        if not total_price:
            total_price = get_regex_value(chunk, r"([\d,.]+\s*萬)(?:\s*成交|\s*總價)", "")
        unit_price = get_regex_value(chunk, r"(?:單價|每坪|成交單價)\s*([\d.]+\s*萬/?坪)", "")
        if not unit_price:
            unit_price = get_regex_value(chunk, r"([\d.]+\s*萬/坪)", "")
        if not any([unit, total_price, unit_price]):
            continue

        key = "|".join([project.get("name", ""), unit, floor, area, total_price, unit_price])
        if key in seen:
            continue
        seen.add(key)
        rows.append(
            {
                "project_name": project.get("name", "未命名建案"),
                "unit": re.sub(r"\s+", "", unit) if unit else "戶別未解析",
                "floor": re.sub(r"\s+", "", floor) if floor else "樓層未解析",
                "area": re.sub(r"\s+", "", area) if area else "坪數未解析",
                "parking_price": normalize_price_text(parking_price) if parking_price else "車位價未解析",
                "total_price": normalize_price_text(total_price) if total_price else "總價未解析",
                "unit_price": unit_price.replace(" ", "") if unit_price else "單價未解析",
                "url": get_project_price_url(project) or project.get("url", ""),
            }
        )
        if len(rows) >= limit:
            break
    return rows


def get_latest_presale_registrations(projects: list[dict[str, str]], limit: int = 5) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for project in projects:
        price_url = get_project_price_url(project)
        if not price_url:
            continue
        try:
            rows.extend(parse_latest_registration_rows(project, fetch_text(price_url), limit=2))
        except Exception:
            continue
        if len(rows) >= limit:
            break
    return rows[:limit]


def get_price_snapshot(content: str) -> dict[str, str]:
    text = html_to_text(content)
    return {
        "one_year_price": get_regex_value(text, r"近一年成交價\s*([\d.]+萬/坪)", ""),
        "yearly_change_text": get_regex_value(text, r"(?:較去年同期|年漲跌)\s*([+\-]?\d+(?:\.\d+)?%)", ""),
        "new_build_price": get_regex_value(text, r"新案成交價\s*([\d.]+萬/坪)", ""),
    }


def try_fetch_text(url: str) -> tuple[str, str]:
    if not url:
        return "", ""
    try:
        return fetch_text(url), ""
    except Exception as exc:
        return "", str(exc)


def get_area_snapshot(area: dict[str, Any]) -> dict[str, Any]:
    full_community_url = get_full_community_list_url(area)
    buy_content, buy_fetch_error = try_fetch_text(area["buy_url"])
    price_content, price_fetch_error = try_fetch_text(area["price_url"])
    new_build_list_content, new_build_list_fetch_error = try_fetch_text(area.get("new_build_list_url", ""))
    full_community_content, comparison_fetch_error = try_fetch_text(full_community_url)

    if not any([buy_content, new_build_list_content, full_community_content]):
        errors = [
            f"buy={buy_fetch_error}" if buy_fetch_error else "",
            f"new={new_build_list_fetch_error}" if new_build_list_fetch_error else "",
            f"community={comparison_fetch_error}" if comparison_fetch_error else "",
        ]
        raise RuntimeError("; ".join(error for error in errors if error) or "all Leju project pages returned empty content")

    buy_text = html_to_text(buy_content)
    summary = {
        "active_projects": get_regex_int(buy_text, r"銷售中新建案共有\s*(\d+)個"),
        "resale_listings": get_regex_int(buy_text, r"待售有\s*(\d+)戶"),
        "latest_count": get_regex_int(buy_text, r"最新上架\s*(\d+)戶"),
        "rezoning_listings": get_regex_int(buy_text, r"重劃區有\s*(\d+)個物件"),
        "five_year_new_completion": get_regex_int(buy_text, r"(\d+)個五年內新成屋"),
        "near_school": get_regex_int(buy_text, r"(\d+)個近學校"),
        "near_mrt": get_regex_int(buy_text, r"(\d+)個近捷運"),
        "all_listings": get_regex_int(buy_text, r"所有物件(?:共有)?\s*(\d+)戶"),
    }
    summary_parse_warning = ""
    if summary["active_projects"] is None or summary["latest_count"] is None:
        summary_parse_warning = "樂居買房摘要格式不同，已略過摘要數字並繼續解析建案卡片。"

    latest_listing_links = get_latest_listing_links(buy_content)[:8]
    excluded_names = get_excluded_project_names(area)
    latest_listing_links = filter_excluded_projects(latest_listing_links, excluded_names)
    project_candidates = dedupe_projects(
        parse_project_blocks(new_build_list_content)
        + parse_project_blocks(buy_content)
        + parse_project_blocks(full_community_content)
    )
    all_projects = filter_excluded_projects(
        enrich_project_statuses(project_candidates),
        excluded_names,
    )
    comparison_candidates = dedupe_projects(
        parse_project_blocks(full_community_content)
        + parse_project_blocks(buy_content)
        + get_extra_project_links(area)
    )
    comparison_projects = enrich_project_statuses(comparison_candidates)
    pending_launch_projects = [item for item in all_projects if is_pending_launch(item)]
    active_presale_projects = [item for item in all_projects if is_active_presale(item)]
    active_project_urls = {item.get("url", "") for item in all_projects}
    sold_out_presale_projects = [
        item for item in comparison_projects if is_sold_out_presale(item, active_project_urls)
    ]
    completed_projects = [item for item in comparison_projects if is_completed_project(item)]
    unclassified_projects = [
        item
        for item in all_projects
        if item not in pending_launch_projects and item not in active_presale_projects and item not in completed_projects
    ]

    return {
        "name": area["name"],
        "theme": area.get("theme", ""),
        "road_focus": area.get("road_focus", []),
        "buy_url": area["buy_url"],
        "price_url": area["price_url"],
        "new_build_list_url": area.get("new_build_list_url", ""),
        "community_list_url": full_community_url,
        "buy_fetch_error": buy_fetch_error,
        "price_fetch_error": price_fetch_error,
        "new_build_list_fetch_error": new_build_list_fetch_error,
        "comparison_fetch_error": comparison_fetch_error,
        "summary_parse_warning": summary_parse_warning,
        "exclude_project_names": sorted(excluded_names),
        **summary,
        "latest_listing_links": latest_listing_links,
        "all_new_build_projects": all_projects,
        "all_comparison_projects": comparison_projects,
        "latest_presale_registrations": [],
        "latest_new_completion_registrations": [],
        "pending_launch_projects": pending_launch_projects,
        "active_presale_projects": active_presale_projects,
        "sold_out_presale_projects": sold_out_presale_projects,
        "completed_projects": completed_projects,
        "unclassified_projects": unclassified_projects,
        "presale_projects": active_presale_projects,
        "pending_presale_projects": pending_launch_projects,
        "price": get_price_snapshot(price_content),
        "stale": False,
    }


def get_state_file(path: Path) -> dict[str, Any]:
    state = read_json_file(path)
    if state is None:
        return {"runs": [], "history": []}
    state.setdefault("runs", [])
    state.setdefault("history", [])
    return state


def save_state_file(
    path: Path,
    existing_state: dict[str, Any],
    area_snapshots: list[dict[str, Any]],
    local_now: datetime,
    bargain_watch: dict[str, Any] | None = None,
) -> None:
    history = list(existing_state.get("history", []))
    today = local_now.strftime("%Y-%m-%d")
    history = [entry for entry in history if entry.get("date") != today]
    history.append({"date": today, "timestamp": local_now.isoformat(), "runs": area_snapshots})
    cutoff = local_now - timedelta(days=120)
    kept_history = []
    for entry in history:
        try:
            if datetime.fromisoformat(entry["timestamp"]) >= cutoff:
                kept_history.append(entry)
        except Exception:
            continue
    write_json_file(
        path,
        {
            "last_run_at": local_now.isoformat(),
            "runs": area_snapshots,
            "history": kept_history,
            "bargain_watch_items": (
                bargain_watch.get("all_items", bargain_watch.get("items", []))
                if bargain_watch is not None
                else existing_state.get("bargain_watch_items", [])
            ),
        },
    )


def get_previous_area(state: dict[str, Any], area_name: str) -> dict[str, Any] | None:
    for item in state.get("runs", []):
        if item.get("name") == area_name:
            return item
    return None


def get_new_pending_launch_projects(snapshots: list[dict[str, Any]], state: dict[str, Any]) -> list[dict[str, str]]:
    new_items: list[dict[str, str]] = []
    for area in snapshots:
        previous = get_previous_area(state, area["name"]) or {}
        previous_keys = {
            f"{item.get('name', '')}|{item.get('url', '')}"
            for item in previous.get("pending_launch_projects", [])
        }
        for project in area.get("pending_launch_projects", []):
            key = f"{project.get('name', '')}|{project.get('url', '')}"
            if key in previous_keys:
                continue
            item = dict(project)
            item["name"] = f"{area['name']} / {item.get('name', '未命名建案')}"
            new_items.append(item)
    return new_items


def get_new_bargain_watch_items(bargain_watch: dict[str, Any], state: dict[str, Any]) -> list[dict[str, Any]]:
    if "bargain_watch_items" not in state:
        return []
    previous_keys = {
        item.get("url", "") or f"{item.get('region_group')}|{item.get('area_name')}|{item.get('name')}"
        for item in state.get("bargain_watch_items", [])
    }
    return [
        item
        for item in bargain_watch.get("all_items", bargain_watch.get("items", []))
        if (item.get("url", "") or f"{item.get('region_group')}|{item.get('area_name')}|{item.get('name')}")
        not in previous_keys
    ][:20]


def is_weekly_report_day(local_now: datetime, weekly_day: int) -> bool:
    return local_now.isoweekday() == weekly_day


def is_weekly_report_due(local_now: datetime, weekly_day: int, weekly_hour: int) -> bool:
    return is_weekly_report_day(local_now, weekly_day) and local_now.hour >= weekly_hour


def format_lifecycle_trend(start_text: str, current_text: str) -> str:
    if not start_text and not current_text:
        return "資料累積中"
    if not start_text:
        return f"{current_text or '未解析'}（資料累積中）"
    if not current_text:
        return f"{start_text} -> 未解析"
    if start_text == current_text:
        return f"{current_text}（持平）"
    return f"{start_text} -> {current_text}"


def get_history_runs(state: dict[str, Any]) -> list[dict[str, Any]]:
    entries = list(state.get("history", []))
    entries.sort(key=lambda item: item.get("timestamp", ""))
    return entries


def find_first_project_status(state: dict[str, Any], area_name: str, project_name: str, bucket_key: str) -> str:
    legacy_bucket = "presale_projects" if bucket_key == "active_presale_projects" else bucket_key
    for entry in get_history_runs(state):
        for area in entry.get("runs", []):
            if area.get("name") != area_name:
                continue
            projects = area.get(bucket_key) or area.get(legacy_bucket) or []
            for project in projects:
                if project.get("name") == project_name:
                    return project.get("status", "")
    return ""


def build_project_trend_summary(state: dict[str, Any], area_name: str, projects: list[dict[str, str]], bucket_key: str, empty_text: str) -> str:
    if not projects:
        return empty_text
    trend_lines: list[str] = []
    for project in projects[:3]:
        start_status = find_first_project_status(state, area_name, project.get("name", ""), bucket_key)
        trend_lines.append(f"{project.get('name', '未命名')} {format_lifecycle_trend(start_status, project.get('status', ''))}")
    return "；".join(trend_lines) if trend_lines else "資料累積中"


def build_stale_snapshot(area: dict[str, Any], previous: dict[str, Any] | None, error: Exception) -> dict[str, Any]:
    # Do not copy previous project data into the current report. Stale cached
    # listings look like fallback data and can be mistaken for live observations.
    base: dict[str, Any] = {}
    excluded_names = get_excluded_project_names(area)
    base.update(
        {
            "name": area["name"],
            "theme": area.get("theme", ""),
            "road_focus": area.get("road_focus", []),
            "buy_url": area["buy_url"],
            "price_url": area["price_url"],
            "new_build_list_url": area.get("new_build_list_url", ""),
            "community_list_url": get_full_community_list_url(area),
            "exclude_project_names": sorted(excluded_names),
            "fetch_error": str(error),
            "stale": True,
            "has_previous_data": False,
        }
    )
    base.setdefault("active_projects", 0)
    base.setdefault("resale_listings", 0)
    base.setdefault("latest_count", 0)
    base.setdefault("rezoning_listings", 0)
    base.setdefault("five_year_new_completion", 0)
    base.setdefault("near_school", None)
    base.setdefault("near_mrt", None)
    base.setdefault("all_listings", None)
    base.setdefault("latest_listing_links", [])
    base.setdefault("all_new_build_projects", [])
    base.setdefault("all_comparison_projects", [])
    base.setdefault("latest_presale_registrations", [])
    base.setdefault("latest_new_completion_registrations", [])
    base.setdefault("pending_launch_projects", [])
    base.setdefault("active_presale_projects", [])
    base.setdefault("sold_out_presale_projects", [])
    base.setdefault("completed_projects", [])
    base.setdefault("unclassified_projects", [])
    base.setdefault("presale_projects", [])
    base.setdefault("pending_presale_projects", [])
    base.setdefault("price", {"one_year_price": "", "yearly_change_text": "", "new_build_price": ""})
    for key in [
        "latest_listing_links",
        "all_new_build_projects",
        "latest_presale_registrations",
        "latest_new_completion_registrations",
        "pending_launch_projects",
        "active_presale_projects",
        "unclassified_projects",
        "presale_projects",
        "pending_presale_projects",
    ]:
        base[key] = filter_excluded_projects(base.get(key, []), excluded_names)
    return base


def get_change_text(current: Any, previous: Any) -> str:
    if current is None:
        return ""
    if previous is None:
        return str(current)
    delta = int(current) - int(previous)
    if delta == 0:
        return str(current)
    return f"{current} ({'+' if delta > 0 else ''}{delta})"


def get_ledger_file(path: Path) -> dict[str, Any]:
    file_data = read_json_file(path)
    if file_data is None:
        return {
            "schema_version": "1.0",
            "description": "Cross-platform scheduler ledger.",
            "last_updated": datetime.now().isoformat(),
            "ledger": [],
        }
    file_data.setdefault("ledger", [])
    return file_data


def test_ledger_already_ran(ledger_file: dict[str, Any], task_id: str, date_string: str) -> bool:
    return any(entry.get("task_id") == task_id and entry.get("date") == date_string for entry in ledger_file.get("ledger", []))


def update_ledger(path: Path, ledger_file: dict[str, Any], task_id: str, output_path: Path, local_now: datetime) -> None:
    entry = {
        "task_id": task_id,
        "platform": "codex-windows",
        "timestamp": local_now.isoformat(),
        "date": local_now.strftime("%Y-%m-%d"),
        "week": f"{local_now.year}-W{local_now.isocalendar().week:02d}",
        "output_path": str(output_path),
    }
    cutoff = local_now - timedelta(days=60)
    kept = []
    for existing in ledger_file.get("ledger", []):
        try:
            if datetime.fromisoformat(existing["timestamp"]) >= cutoff:
                kept.append(existing)
        except Exception:
            kept.append(existing)
    kept.append(entry)
    ledger_file["ledger"] = kept
    ledger_file["last_updated"] = local_now.isoformat()
    write_json_file(path, ledger_file)


def format_project_line(item: dict[str, str]) -> list[str]:
    if item.get("status"):
        return [f"- {item['name']} | {item['status']}", f"  {item['url']}"]
    return [f"- {item['name']}", f"  {item['url']}"]


def format_registration_line(item: dict[str, str]) -> list[str]:
    if item.get("unit") or item.get("area") or item.get("parking_price"):
        line = (
            f"{item.get('project_name', '未命名建案')} "
            f"{item.get('unit', '戶別未解析')}；"
            f"樓層：{item.get('floor', '樓層未解析')}；"
            f"房屋坪數：{item.get('area', '坪數未解析')}；"
            f"車位價：{item.get('parking_price', '車位價未解析')}；"
            f"總價：{item.get('total_price', '總價未解析')}；"
            f"成交單價：{item.get('unit_price', '單價未解析')}"
        )
    else:
        parts = [
            item.get("project_name", "未命名建案"),
            item.get("floor", "樓層未解析"),
            item.get("layout", "戶型未解析"),
            item.get("total_price", "總價未解析"),
            item.get("unit_price", "單價未解析"),
            item.get("parking", "車位未解析"),
        ]
        line = " | ".join(parts)
    if item.get("url"):
        return [f"- {line}", f"  {item['url']}"]
    return [f"- {line}"]


def get_registration_key(item: dict[str, str]) -> str:
    return "|".join(
        [
            item.get("project_name", ""),
            item.get("unit", ""),
            item.get("floor", ""),
            item.get("area", ""),
            item.get("parking_price", ""),
            item.get("total_price", ""),
            item.get("unit_price", ""),
            item.get("url", ""),
        ]
    )


def get_new_registration_rows(current: list[dict[str, str]], previous: dict[str, Any] | None) -> list[dict[str, str]]:
    if not previous:
        return current
    previous_keys = {
        get_registration_key(item)
        for item in previous.get("latest_presale_registrations", [])
        if isinstance(item, dict)
    }
    return [item for item in current if get_registration_key(item) not in previous_keys]


def attach_official_presale_registrations(
    snapshots: list[dict[str, Any]],
    registrations: list[dict[str, str]],
    mappings: list[dict[str, Any]],
) -> None:
    area_by_name = {area.get("name", ""): area for area in snapshots}
    mapping_area_by_project = {mapping["name"]: mapping.get("area_name", "") for mapping in mappings}
    for item in registrations:
        area_name = mapping_area_by_project.get(item.get("project_name", ""))
        if not area_name or area_name not in area_by_name:
            continue
        area = area_by_name[area_name]
        existing = area.setdefault("latest_presale_registrations", [])
        if get_registration_key(item) not in {get_registration_key(row) for row in existing if isinstance(row, dict)}:
            existing.append(item)


def format_price_compare_line(item: dict[str, str], label: str) -> list[str]:
    status = item.get("status", "價格未解析")
    return [f"- [{label}] {item.get('name', '未命名建案')} | {status or '價格未解析'}", f"  {item.get('url', '')}"]


def format_project_count(area: dict[str, Any], key: str) -> str:
    if area.get("stale") and not area.get("has_previous_data", True):
        return "資料不足"
    count_text = f"{len(area.get(key, []))} 個"
    if area.get("stale"):
        return "資料不足"
    return count_text


def format_observable_presale_count(area: dict[str, Any]) -> str:
    if area.get("stale") and not area.get("has_previous_data", True):
        return "資料不足"
    count = (
        len(area.get("active_presale_projects", []))
        + len(area.get("pending_launch_projects", []))
        + len(area.get("sold_out_presale_projects", []))
    )
    count_text = f"{count} 個"
    if area.get("stale"):
        return "資料不足"
    return count_text


def get_price_compare_projects(area: dict[str, Any], limit: int = 8) -> list[dict[str, str]]:
    projects: list[dict[str, str]] = []
    for item in area.get("sold_out_presale_projects", []):
        candidate = dict(item)
        candidate["compare_label"] = "完銷/非銷售中預售"
        projects.append(candidate)
    for item in area.get("completed_projects", []):
        candidate = dict(item)
        candidate["compare_label"] = "新成屋"
        projects.append(candidate)
    return projects[:limit]


def get_discounted_completed_projects(area: dict[str, Any], limit: int = 5) -> list[dict[str, Any]]:
    benchmark = get_project_mid_price({"status": area.get("price", {}).get("one_year_price", "")})
    if benchmark is None:
        return []
    discounted: list[dict[str, Any]] = []
    for item in area.get("completed_projects", []):
        low_price = get_project_low_price(item)
        if low_price is None or low_price >= benchmark:
            continue
        candidate = dict(item)
        candidate["benchmark_price"] = benchmark
        candidate["low_price"] = low_price
        candidate["discount_percent"] = (benchmark - low_price) / benchmark * 100
        discounted.append(candidate)
    discounted.sort(key=lambda row: row.get("discount_percent", 0), reverse=True)
    return discounted[:limit]


def format_discounted_completed_line(item: dict[str, Any]) -> list[str]:
    return [
        (
            f"- {item.get('name', '未命名建案')} | 開價低點 {item.get('low_price', 0):.1f}萬/坪 "
            f"< 近一年均價 {item.get('benchmark_price', 0):.1f}萬/坪 "
            f"({item.get('discount_percent', 0):.1f}% below)"
        ),
        f"  {item.get('url', '')}",
    ]


def get_presale_overview_items(areas: list[dict[str, Any]], limit_per_group: int = 10) -> dict[str, list[dict[str, str]]]:
    pending: list[dict[str, str]] = []
    active: list[dict[str, str]] = []
    sold_out: list[dict[str, str]] = []
    for area in areas:
        if area.get("stale") and not area.get("has_previous_data", True):
            continue
        for project in area.get("pending_launch_projects", []):
            item = dict(project)
            item["name"] = f"{area['name']} / {item.get('name', '未命名建案')}"
            pending.append(item)
        for project in area.get("active_presale_projects", []):
            item = dict(project)
            item["name"] = f"{area['name']} / {item.get('name', '未命名建案')}"
            active.append(item)
        for project in area.get("sold_out_presale_projects", []):
            item = dict(project)
            item["name"] = f"{area['name']} / {item.get('name', '未命名建案')}"
            sold_out.append(item)
    return {
        "pending": pending[:limit_per_group],
        "active": active[:limit_per_group],
        "sold_out": sold_out[:limit_per_group],
    }


def append_presale_overview(lines: list[str], areas: list[dict[str, Any]], markdown: bool = False) -> None:
    overview = get_presale_overview_items(areas)
    if not (overview["pending"] or overview["active"] or overview["sold_out"]):
        return
    heading = "## 預售屋 / 待開案總覽" if markdown else "預售屋 / 待開案總覽"
    lines.append(heading)
    if markdown:
        lines.append("")
    if overview["pending"]:
        lines.append("待開案 / 未開賣預售")
        for item in overview["pending"]:
            lines.extend(format_project_line(item))
    if overview["active"]:
        lines.append("銷售中預售屋")
        for item in overview["active"]:
            lines.extend(format_project_line(item))
    if overview["sold_out"]:
        lines.append("完銷 / 非銷售中預售")
        for item in overview["sold_out"]:
            lines.extend(format_project_line(item))
    lines.append("")


def append_area_presale_projects(
    lines: list[str],
    area: dict[str, Any],
    markdown: bool = False,
    limit_per_group: int | None = None,
) -> None:
    groups = [
        ("待開案 / 未開賣預售", area.get("pending_launch_projects", [])),
        ("銷售中預售屋", area.get("active_presale_projects", [])),
        ("完銷 / 非銷售中預售", area.get("sold_out_presale_projects", [])),
    ]
    wrote_any = False
    for title, projects in groups:
        if not projects:
            continue
        wrote_any = True
        lines.append(f"### {title}" if markdown else title)
        for item in projects:
            lines.extend(format_project_line(item))
        lines.append("")
    if wrote_any and lines and lines[-1] != "":
        lines.append("")


def print_extraction_diagnostics(areas: list[dict[str, Any]]) -> None:
    print("A7 extraction diagnostics:")
    print(f"proxy_configured={'yes' if os.environ.get('LEJU_FETCH_PROXY_URL', '').strip() else 'no'}")
    for area in areas:
        pending = area.get("pending_launch_projects", [])
        active = area.get("active_presale_projects", [])
        sold_out = area.get("sold_out_presale_projects", [])
        stale = "yes" if area.get("stale") else "no"
        print(
            f"- {area.get('name')}: "
            f"stale={stale}, pending={len(pending)}, active={len(active)}, sold_out={len(sold_out)}"
        )
        for key in (
            "fetch_error",
            "buy_fetch_error",
            "new_build_list_fetch_error",
            "comparison_fetch_error",
            "price_fetch_error",
        ):
            error = str(area.get(key, "")).strip()
            if error:
                print(f"  {key}: {error[:600]}")
        for label, projects in (
            ("pending", pending),
            ("active", active),
            ("sold_out", sold_out),
        ):
            names = [str(item.get("name", "")).strip() for item in projects if item.get("name")]
            if names:
                print(f"  {label}: {', '.join(names[:8])}")


def is_bargain_candidate_project(project: dict[str, str]) -> bool:
    if is_completed_project(project):
        return False
    if is_pending_launch(project):
        return True
    return is_active_presale(project)


def get_bargain_benchmark(area: dict[str, Any], price_snapshot: dict[str, str], projects: list[dict[str, str]]) -> tuple[float | None, str]:
    configured = area.get("benchmark_price_per_ping")
    if configured is not None:
        try:
            return float(configured), "手動基準"
        except (TypeError, ValueError):
            pass

    for key, label in [("new_build_price", "樂居新案成交價"), ("one_year_price", "樂居近一年成交價")]:
        low, high = parse_price_range(price_snapshot.get(key, ""))
        if low is not None:
            return low if high is None else (low + high) / 2, label

    mid_prices = [price for price in (get_project_mid_price(project) for project in projects) if price is not None]
    median_price = get_median(mid_prices)
    if median_price is not None:
        return median_price, "同區建案中位數"
    return None, ""


def normalize_housefun_price_text(value: str) -> str:
    value = unescape(value).strip().replace(",", "")
    match = re.fullmatch(r"(\d+(?:\.\d+)?)[~-](\d+(?:\.\d+)?)", value)
    if not match:
        return value
    low = float(match.group(1))
    high = float(match.group(2))
    if high < low and high < 10 <= low:
        high *= 10
    return f"{low:g}-{high:g}"


def normalize_project_identity(value: str) -> str:
    return re.sub(r"[^0-9A-Za-z\u4e00-\u9fff]", "", value).lower()


def parse_housefun_projects(content: str, source_url: str) -> list[dict[str, str]]:
    projects: list[dict[str, str]] = []
    sections = re.findall(r'<section class="building-case[^>]*>(.*?)</section>', content, re.DOTALL | re.IGNORECASE)
    for section in sections:
        id_match = re.search(r'name="buildIds"\s+value="(\d+)"', section)
        name_match = re.search(r'<h3>\s*(.*?)\s*</h3>', section, re.DOTALL | re.IGNORECASE)
        address_match = re.search(r'<address>.*?<a[^>]*>(.*?)</a>.*?</address>', section, re.DOTALL | re.IGNORECASE)
        case_type_match = re.search(r'"caseType"\s*:\s*"([^"]+)"', section)
        purpose_match = re.search(r'"purpose"\s*:\s*"([^"]+)"', section)
        price_match = re.search(
            r'<em class="number">\s*([^<]+?)\s*</em>\s*<em class="postfix">\s*萬/坪\s*</em>',
            section,
            re.DOTALL | re.IGNORECASE,
        )
        if not id_match or not name_match or not address_match:
            continue
        case_type = unescape(case_type_match.group(1)).strip() if case_type_match else ""
        if case_type != "預售屋":
            continue
        purpose = unescape(purpose_match.group(1)).strip() if purpose_match else ""
        if purpose and purpose not in {"住宅用", "住商用"}:
            continue
        price_text = normalize_housefun_price_text(price_match.group(1)) if price_match else ""
        if not parse_price_range(price_text)[0]:
            continue
        address = re.sub(r"<[^>]+>", "", unescape(address_match.group(1))).strip()
        district_match = re.search(r"(?:台北市|臺北市|新北市|桃園市)(.{1,6}?區|.{1,6}?鄉|.{1,6}?鎮|.{1,6}?市)", address)
        district = district_match.group(1) if district_match else ""
        project_id = id_match.group(1)
        projects.append(
            {
                "name": re.sub(r"<[^>]+>", "", unescape(name_match.group(1))).strip(),
                "status": f"{price_text}萬/坪 預售屋",
                "url": f"https://newhouse.housefun.com.tw/building/{project_id}",
                "address": address,
                "district": district,
                "purpose": purpose,
                "source": "好房網",
                "source_url": source_url,
            }
        )
    return projects


def get_housefun_page_count(content: str, page_size: int = 10) -> int:
    match = re.search(r'<pagination-panel[^>]+v-bind:records="(\d+)"', content, re.IGNORECASE)
    if not match:
        return 1
    return max(1, (int(match.group(1)) + page_size - 1) // page_size)


def add_query_parameter(url: str, key: str, value: str) -> str:
    parts = urllib.parse.urlsplit(url)
    query = dict(urllib.parse.parse_qsl(parts.query, keep_blank_values=True))
    query[key] = value
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path, urllib.parse.urlencode(query), parts.fragment))


def get_housefun_city_projects(city: dict[str, Any]) -> tuple[list[dict[str, str]], list[str]]:
    city_name = str(city.get("name", "未命名城市"))
    city_url = str(city.get("url", "")).strip()
    if not city_url:
        return [], [f"{city_name}：缺少好房網城市網址"]

    errors: list[str] = []
    first_content = fetch_text(city_url)
    projects = parse_housefun_projects(first_content, city_url)
    page_count = min(get_housefun_page_count(first_content), int(city.get("max_pages", 40)))
    page_urls = [add_query_parameter(city_url, "page", str(page)) for page in range(2, page_count + 1)]
    worker_count = max(1, min(int(city.get("workers", 6)), 8))
    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        future_urls = {executor.submit(fetch_text, url): url for url in page_urls}
        for future in as_completed(future_urls):
            url = future_urls[future]
            try:
                projects.extend(parse_housefun_projects(future.result(), url))
            except Exception as exc:
                errors.append(f"{city_name}分頁抓取失敗：{url}：{exc}")

    deduped: list[dict[str, str]] = []
    seen: set[str] = set()
    for project in projects:
        key = "|".join(
            [
                city_name,
                project.get("district", ""),
                normalize_project_identity(project.get("name", "")),
            ]
        )
        if not key or key in seen:
            continue
        seen.add(key)
        project["region_group"] = city_name
        deduped.append(project)
    return deduped, errors


def parse_expected_completion_month(content: str) -> tuple[int, int] | None:
    text = re.sub(r"\s+", " ", html_to_text(content))
    match = re.search(
        r"(?:預期完工|預計完工|交屋日期|預計交屋)\s*[：:]?\s*(\d{4})年\s*"
        r"(?:(上半年|下半年)|第?([一二三四1234])季(?:度)?|第?([一二三四1234])季度|([01]?\d)月)?",
        text,
    )
    if not match:
        return None
    year = int(match.group(1))
    if match.group(2) == "上半年":
        return year, 6
    if match.group(2) == "下半年":
        return year, 12
    quarter_text = match.group(3) or match.group(4)
    if quarter_text:
        quarter_map = {"一": 1, "二": 2, "三": 3, "四": 4}
        quarter = quarter_map.get(quarter_text, int(quarter_text) if quarter_text.isdigit() else 4)
        return year, quarter * 3
    if match.group(5):
        return year, min(max(int(match.group(5)), 1), 12)
    return year, 12


def has_issued_usage_permit(content: str) -> bool:
    text = re.sub(r"\s+", " ", html_to_text(content))
    match = re.search(r"使用執照\s*(.{0,50})", text)
    if not match:
        return False
    value = match.group(1).strip()
    return bool(value) and not value.startswith(("暫無", "無", "尚未"))


def verify_housefun_presale_project(project: dict[str, Any], local_now: datetime) -> tuple[bool, str]:
    content = fetch_text(str(project.get("url", "")))
    if has_issued_usage_permit(content):
        return False, "已取得使用執照"
    completion = parse_expected_completion_month(content)
    if completion is None:
        return False, "無法確認未來完工日期"
    year, month = completion
    if (year, month) < (local_now.year, local_now.month):
        return False, f"預計完工日期已過（{year}-{month:02d}）"
    project["completion"] = f"{year}-{month:02d}"
    return True, ""


def filter_verified_housefun_presales(
    items: list[dict[str, Any]],
    local_now: datetime,
    workers: int = 6,
) -> tuple[list[dict[str, Any]], list[str]]:
    verified: list[dict[str, Any]] = []
    errors: list[str] = []
    with ThreadPoolExecutor(max_workers=max(1, min(workers, 8))) as executor:
        futures = {executor.submit(verify_housefun_presale_project, item, local_now): item for item in items}
        for future in as_completed(futures):
            item = futures[future]
            try:
                valid, reason = future.result()
                if valid:
                    verified.append(item)
                elif reason:
                    item["excluded_reason"] = reason
            except Exception as exc:
                errors.append(f"{item.get('name', '未命名建案')}詳細頁驗證失敗：{exc}")
    verified.sort(key=lambda item: item.get("discount_percent", 0), reverse=True)
    return verified, errors


def get_housefun_bargain_items(config: dict[str, Any], threshold_percent: float) -> tuple[list[dict[str, Any]], list[str]]:
    all_projects: list[dict[str, str]] = []
    errors: list[str] = []
    for city in config.get("housefun_cities", []):
        try:
            projects, city_errors = get_housefun_city_projects(city)
            all_projects.extend(projects)
            errors.extend(city_errors)
        except Exception as exc:
            errors.append(f"{city.get('name', '未命名城市')}：{exc}")

    grouped: dict[str, list[dict[str, str]]] = {}
    for project in all_projects:
        district = project.get("district", "")
        if district:
            grouped.setdefault(f"{project.get('region_group', '')}|{district}", []).append(project)

    min_comparables = int(config.get("min_comparables", 3))
    items: list[dict[str, Any]] = []
    for project in all_projects:
        group_key = f"{project.get('region_group', '')}|{project.get('district', '')}"
        peers = [item for item in grouped.get(group_key, []) if item.get("url") != project.get("url")]
        peer_prices = [price for price in (get_project_mid_price(item) for item in peers) if price is not None]
        if len(peer_prices) < min_comparables:
            continue
        benchmark = get_median(peer_prices)
        low_price = get_project_low_price(project)
        if benchmark is None or low_price is None or benchmark <= 0:
            continue
        discount_percent = (benchmark - low_price) / benchmark * 100
        if discount_percent < threshold_percent:
            continue
        items.append(
            {
                "region_group": project.get("region_group", ""),
                "area_name": project.get("district", ""),
                "name": project.get("name", "未命名建案"),
                "status": project.get("status", ""),
                "url": project.get("url", ""),
                "address": project.get("address", ""),
                "source": project.get("source", "好房網"),
                "low_price": low_price,
                "benchmark": benchmark,
                "benchmark_source": f"同行政區其他預售案中位數（{len(peer_prices)}案）",
                "discount_percent": discount_percent,
            }
        )
    verified_items, verification_errors = filter_verified_housefun_presales(
        items,
        datetime.now(ZoneInfo("Asia/Taipei")),
        int(config.get("detail_workers", 6)),
    )
    errors.extend(verification_errors)
    return verified_items, errors


def get_bargain_watch_results(config: dict[str, Any]) -> dict[str, Any]:
    if not config.get("enabled", True):
        return {"enabled": False, "items": [], "errors": []}

    threshold_percent = float(config.get("threshold_percent", 20))
    max_items = int(config.get("max_items", 8))
    items: list[dict[str, Any]] = []
    errors: list[str] = []

    housefun_items, housefun_errors = get_housefun_bargain_items(config, threshold_percent)
    items.extend(housefun_items)
    errors.extend(housefun_errors)

    for area in config.get("areas", []):
        area_name = str(area.get("name", "未命名區域"))
        try:
            if not area.get("price_url") and area.get("benchmark_price_per_ping") is None:
                errors.append(f"{area_name}：缺少生活圈/行政區 price_url 或手動基準，已略過城市級比較")
                continue
            list_content = fetch_text(str(area["new_build_list_url"]))
            price_content = fetch_text(str(area["price_url"])) if area.get("price_url") else ""
            max_projects = int(area.get("max_projects", 40))
            raw_projects = parse_project_blocks(list_content)[:max_projects] + get_extra_project_links(area)
            projects = enrich_project_statuses(raw_projects)
            candidates = [project for project in projects if is_bargain_candidate_project(project)]
            price_snapshot = get_price_snapshot(price_content) if price_content else {}
            benchmark, benchmark_source = get_bargain_benchmark(area, price_snapshot, projects)
            if benchmark is None or benchmark <= 0:
                errors.append(f"{area_name}：無法取得周邊基準價")
                continue

            for project in candidates:
                low_price = get_project_low_price(project)
                if low_price is None:
                    continue
                discount_percent = (benchmark - low_price) / benchmark * 100
                if discount_percent < threshold_percent:
                    continue
                items.append(
                    {
                        "region_group": area.get("region_group", ""),
                        "area_name": area_name,
                        "name": project.get("name", "未命名建案"),
                        "status": project.get("status", ""),
                        "url": project.get("url", ""),
                        "low_price": low_price,
                        "benchmark": benchmark,
                        "benchmark_source": benchmark_source,
                        "discount_percent": discount_percent,
                    }
                )
        except Exception as exc:
            errors.append(f"{area_name}：{exc}")

    deduped_items: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    for item in sorted(items, key=lambda row: row["discount_percent"], reverse=True):
        key = item.get("url", "") or f"{item.get('region_group')}|{item.get('area_name')}|{item.get('name')}"
        if key in seen_urls:
            continue
        seen_urls.add(key)
        deduped_items.append(item)
    return {
        "enabled": True,
        "threshold_percent": threshold_percent,
        "items": deduped_items[:max_items],
        "all_items": deduped_items,
        "errors": errors,
    }


def format_bargain_watch_line(item: dict[str, Any]) -> list[str]:
    prefix = f"{item.get('region_group')}/{item.get('area_name')}".strip("/")
    first = (
        f"- [{prefix}] {item.get('name')} | {item.get('status') or '價格未解析'} | "
        f"低於基準 {item.get('discount_percent', 0):.1f}%"
    )
    second = (
        f"  基準：{item.get('benchmark', 0):.1f}萬/坪（{item.get('benchmark_source') or '未標示'}）；"
        f"低價：{item.get('low_price', 0):.1f}萬/坪"
    )
    lines = [first, second]
    if item.get("address"):
        lines.append(f"  位置：{item['address']}")
    if item.get("source"):
        lines.append(f"  來源：{item['source']}")
    if item.get("completion"):
        lines.append(f"  預計完工：{item['completion']}")
    if item.get("url"):
        lines.append(f"  {item['url']}")
    return lines


def split_sentences(text: str) -> list[str]:
    rough_parts = re.split(r"[。！？!?；;\n\r]+", text)
    return [part.strip() for part in rough_parts if len(part.strip()) >= 8]


def encode_iri_url(url: str) -> str:
    parts = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit(
        (
            parts.scheme,
            parts.netloc,
            urllib.parse.quote(parts.path, safe="/%:@"),
            urllib.parse.quote(parts.query, safe="=&+%:@"),
            urllib.parse.quote(parts.fragment, safe="%"),
        )
    )


def get_xml_tag_text(content: str, tag: str) -> str:
    match = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", content, re.DOTALL | re.IGNORECASE)
    if not match:
        return ""
    value = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", match.group(1), flags=re.DOTALL)
    return html_to_text(unescape(value)).strip()


def parse_market_source_entries(
    content: str,
    source_name: str,
    source_url: str,
    cutoff: datetime,
) -> list[dict[str, str]]:
    rss_items = re.findall(r"<item[^>]*>(.*?)</item>", content, re.DOTALL | re.IGNORECASE)
    entries: list[dict[str, str]] = []
    if rss_items:
        for item in rss_items:
            title = get_xml_tag_text(item, "title")
            description = get_xml_tag_text(item, "description")
            link = get_xml_tag_text(item, "link") or source_url
            published = get_xml_tag_text(item, "pubDate")
            if published:
                try:
                    published_at = parsedate_to_datetime(published)
                    comparable_cutoff = cutoff
                    if published_at.tzinfo is not None and comparable_cutoff.tzinfo is None:
                        comparable_cutoff = comparable_cutoff.replace(tzinfo=published_at.tzinfo)
                    if published_at < comparable_cutoff:
                        continue
                except (TypeError, ValueError, OverflowError):
                    pass
            text = " ".join(part for part in [title, description] if part)
            if text:
                entries.append(
                    {
                        "title": title or text[:100],
                        "text": text,
                        "url": link,
                        "source": source_name,
                        "published": published,
                    }
                )
        return entries

    page_text = html_to_text(content)
    for sentence in split_sentences(page_text)[:120]:
        entries.append(
            {
                "title": sentence[:100],
                "text": sentence,
                "url": source_url,
                "source": source_name,
                "published": "",
            }
        )
    return entries


def get_meta_content(content: str, key: str) -> str:
    patterns = [
        rf'<meta[^>]+property=["\']{re.escape(key)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+name=["\']{re.escape(key)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(key)}["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{re.escape(key)}["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, content, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return html_to_text(unescape(match.group(1))).strip()
    return ""


def clean_article_text(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"(延伸閱讀|相關新聞|看更多|更多新聞|熱門新聞|加入.*LINE|下載.*APP).*$", "", text)
    return text.strip()


def extract_article_body(content: str) -> str:
    if is_google_news_landing_page(content):
        return ""

    stripped = re.sub(r"<script\b[^>]*>.*?</script>", " ", content, flags=re.S | re.I)
    stripped = re.sub(r"<style\b[^>]*>.*?</style>", " ", stripped, flags=re.S | re.I)
    stripped = re.sub(r"<noscript\b[^>]*>.*?</noscript>", " ", stripped, flags=re.S | re.I)
    stripped = re.sub(r"<(nav|footer|header|aside)\b[^>]*>.*?</\1>", " ", stripped, flags=re.S | re.I)

    candidates: list[str] = []
    for tag in ("article", "main"):
        for match in re.findall(rf"<{tag}\b[^>]*>(.*?)</{tag}>", stripped, flags=re.S | re.I):
            text = clean_article_text(html_to_text(match))
            if len(text) >= 40:
                candidates.append(text)

    paragraphs = [
        clean_article_text(html_to_text(match))
        for match in re.findall(r"<p\b[^>]*>(.*?)</p>", stripped, flags=re.S | re.I)
    ]
    paragraph_text = " ".join(part for part in paragraphs if len(part) >= 18)
    if len(paragraph_text) >= 40:
        candidates.append(paragraph_text)

    meta_parts = [
        get_meta_content(content, "og:description"),
        get_meta_content(content, "description"),
        get_meta_content(content, "twitter:description"),
    ]
    meta_text = " ".join(part for part in meta_parts if part)
    if meta_text:
        candidates.append(clean_article_text(meta_text))

    if not candidates:
        candidates.append(clean_article_text(html_to_text(stripped)))

    return max(candidates, key=len, default="")[:5000]


def is_google_news_landing_page(content: str) -> bool:
    text = html_to_text(content)
    return (
        "Google 新聞" in text
        and "匯集了世界各地的新聞來源" in text
        and len(text) < 1000
    )


def is_google_news_article_url(url: str) -> bool:
    parsed = urllib.parse.urlsplit(url)
    path_parts = [part for part in parsed.path.split("/") if part]
    return parsed.netloc == "news.google.com" and len(path_parts) >= 2 and path_parts[-2] in {"articles", "read"}


def get_google_news_article_id(url: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    path_parts = [part for part in parsed.path.split("/") if part]
    if len(path_parts) >= 2 and path_parts[-2] in {"articles", "read"}:
        return path_parts[-1]
    return ""


def extract_google_news_decode_params(content: str) -> tuple[str, str]:
    signature_match = re.search(r'data-n-a-sg=["\']([^"\']+)["\']', content)
    timestamp_match = re.search(r'data-n-a-ts=["\']([^"\']+)["\']', content)
    if not signature_match or not timestamp_match:
        return "", ""
    return unescape(signature_match.group(1)), unescape(timestamp_match.group(1))


def post_form_text(url: str, data: dict[str, str], timeout: int = 12) -> str:
    body = urllib.parse.urlencode(data).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
    return raw.decode("utf-8", errors="ignore")


def decode_google_news_article_url(url: str) -> str:
    article_id = get_google_news_article_id(url)
    if not article_id:
        return url

    signature = ""
    timestamp = ""
    for candidate_url in (
        f"https://news.google.com/articles/{article_id}",
        f"https://news.google.com/rss/articles/{article_id}",
    ):
        try:
            content = fetch_text(candidate_url)
            signature, timestamp = extract_google_news_decode_params(content)
            if signature and timestamp:
                break
        except Exception:
            continue
    if not signature or not timestamp:
        return url

    payload = [
        "Fbv4je",
        (
            '["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],'
            f'"X","X",1,[1,1,1],1,1,null,0,0,null,0],"{article_id}",{timestamp},"{signature}"]'
        ),
    ]
    response_text = post_form_text(
        "https://news.google.com/_/DotsSplashUi/data/batchexecute",
        {"f.req": json.dumps([[payload]])},
    )
    json_text = response_text.split("\n\n", 1)[1] if "\n\n" in response_text else response_text
    parsed = json.loads(json_text)[:-2]
    decoded_url = json.loads(parsed[0][2])[1]
    return decoded_url if isinstance(decoded_url, str) and decoded_url.startswith(("http://", "https://")) else url


def resolve_news_article_url(url: str) -> str:
    if is_google_news_article_url(url):
        try:
            return decode_google_news_article_url(url)
        except Exception:
            return url
    return url


def normalize_market_fingerprint(text: str) -> str:
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\d+", "0", text)
    text = re.sub(r"\s+", "", text)
    return text[:260]


def enrich_market_entries_with_article_body(
    entries: list[dict[str, str]],
    max_fetches: int,
    min_article_chars: int,
) -> tuple[list[dict[str, str]], list[str]]:
    enriched: list[dict[str, str]] = []
    errors: list[str] = []
    seen: set[str] = set()
    fetch_candidates = [entry for entry in entries if entry.get("url", "").startswith(("http://", "https://"))]
    fetch_candidates = fetch_candidates[:max_fetches]
    by_url = {entry.get("url", ""): entry for entry in fetch_candidates}

    def fetch_article(entry: dict[str, str]) -> tuple[str, str, str]:
        url = entry.get("url", "")
        resolved_url = resolve_news_article_url(url)
        content = fetch_text(encode_iri_url(resolved_url))
        if is_cloudflare_challenge(content):
            raise RuntimeError("Cloudflare challenge")
        article_text = extract_article_body(content)
        return url, article_text, resolved_url

    article_text_by_url: dict[str, str] = {}
    resolved_url_by_url: dict[str, str] = {}
    if fetch_candidates:
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {executor.submit(fetch_article, entry): entry for entry in fetch_candidates}
            for future in as_completed(futures):
                entry = futures[future]
                try:
                    url, article_text, resolved_url = future.result()
                    article_text_by_url[url] = article_text
                    resolved_url_by_url[url] = resolved_url
                except Exception as exc:
                    title = entry.get("title", "")[:40] or entry.get("url", "")[:60]
                    errors.append(f"{title}: {exc}")

    for entry in entries:
        article_text = article_text_by_url.get(entry.get("url", ""), "")
        text_source = "article" if len(article_text) >= min_article_chars else "rss"
        merged_text = article_text if text_source == "article" else entry.get("text", "")
        if not merged_text.strip():
            continue
        fingerprint = normalize_market_fingerprint(merged_text)
        if fingerprint and fingerprint in seen:
            continue
        seen.add(fingerprint)
        row = dict(entry)
        row["text"] = merged_text
        row["summary_text"] = summarize_article_text(merged_text)
        row["text_source"] = text_source
        row["article_chars"] = str(len(article_text))
        if resolved_url_by_url.get(entry.get("url", "")):
            row["resolved_url"] = resolved_url_by_url[entry.get("url", "")]
        enriched.append(row)
    return enriched, errors


def summarize_article_text(text: str, max_sentences: int = 2) -> str:
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    sentences = split_sentences(text)
    signal_groups = [
        ("供給", ("預售", "預售屋", "新案", "開案", "待開案", "推案", "餘屋", "庫存", "交屋")),
        ("價格", ("房價", "實價", "單價", "總價", "讓利", "低價", "議價", "漲", "跌")),
        ("買氣", ("交易", "成交", "買氣", "來人", "看屋", "去化", "銷售率", "完銷")),
        ("資金", ("房貸", "限貸", "信用管制", "核貸", "利率", "自備款")),
        ("區域", ("重劃區", "青埔", "A7", "桃園", "雙北", "台北", "新北", "捷運", "建設")),
        ("業者", ("建商", "代銷", "房仲", "永慶", "住展", "好房", "專家")),
    ]
    picked: list[str] = []
    used_fingerprints: set[str] = set()
    for label, keywords in signal_groups:
        best_sentence = ""
        best_score = 0
        for sentence in sentences:
            score = sum(sentence.count(keyword) for keyword in keywords)
            if score > best_score:
                best_score = score
                best_sentence = sentence
        if best_sentence and best_score > 0:
            compact = re.sub(r"https?://\S+", "", best_sentence[:86]).strip()
            fingerprint = normalize_market_fingerprint(compact)
            if fingerprint and fingerprint not in used_fingerprints:
                used_fingerprints.add(fingerprint)
                picked.append(f"{label}: {compact}")
        if len(picked) >= max_sentences:
            break
    if not picked:
        picked = [sentence[:90] for sentence in sentences[:max_sentences]]
    return "；".join(picked)


def fetch_market_entries_from_sources(
    sources: list[dict[str, Any]],
    cutoff: datetime,
) -> tuple[list[dict[str, str]], list[str]]:
    raw_entries: list[dict[str, str]] = []
    errors: list[str] = []
    for source in sources:
        source_name = str(source.get("name", "未命名來源"))
        source_url = str(source.get("url", "")).strip()
        if not source_url:
            continue
        try:
            request_url = encode_iri_url(source_url)
            content = fetch_text(request_url)
            if "Just a moment..." in content and "Cloudflare" in content:
                raise RuntimeError("Cloudflare challenge")
            entries = parse_market_source_entries(content, source_name, source_url, cutoff)
            raw_entries.extend(entries)
        except Exception as exc:
            if not source.get("report_errors", True):
                continue
            errors.append(f"{source_name}：{exc}")
    return raw_entries, errors


def extract_infrastructure_name(sentence: str, city: str, keywords: list[str]) -> str:
    clean = re.sub(r"\s+", "", sentence)
    patterns = [
        r"([\u4e00-\u9fffA-Za-z0-9（）()「」《》．·、]{2,32}(?:捷運|輕軌|高鐵|鐵路|車站|交流道|快速道路|園區|醫院|大學|商場|百貨|轉運站|社會住宅|都市更新|重劃區|開發案|建設))",
        r"((?:捷運|輕軌|高鐵|鐵路|快速道路|產業園區|科學園區|科技園區|物流園區)[\u4e00-\u9fffA-Za-z0-9（）()「」《》．·、]{1,24})",
    ]
    for pattern in patterns:
        for match in re.findall(pattern, clean):
            if city in match or any(keyword in match for keyword in keywords):
                return match[:36]
    for keyword in keywords:
        if keyword in clean:
            start = max(0, clean.find(keyword) - 14)
            end = min(len(clean), clean.find(keyword) + len(keyword) + 18)
            return clean[start:end]
    return clean[:32]


def summarize_infrastructure_sentence(text: str, city: str, keywords: list[str]) -> str:
    for sentence in split_sentences(text):
        if city in sentence and any(keyword in sentence for keyword in keywords):
            return sentence[:120]
    return summarize_article_text(text, max_sentences=1)[:120]


def classify_infrastructure_action(text: str) -> tuple[str, int]:
    action_groups = [
        ("動工/開工", 100, ("動工", "開工", "施工", "開挖", "興建")),
        ("通車/啟用", 95, ("通車", "啟用", "完工", "試營運", "營運")),
        ("招商/設廠", 90, ("招商", "設廠", "進駐", "擴建", "投資", "簽約")),
        ("核定/通過", 85, ("核定", "通過", "審議通過", "拍板", "定案", "定讞", "決議")),
        ("宣布/發布", 80, ("宣布", "發布", "提出", "啟動", "爭取")),
        ("規劃/送審", 60, ("規劃", "評估", "送審", "可行性", "研議", "納入")),
    ]
    for label, priority, words in action_groups:
        if any(word in text for word in words):
            return label, priority
    return "新聞提及", 40


def classify_infrastructure_category(text: str) -> str:
    categories = [
        ("交通", ("捷運", "輕軌", "鐵路", "高鐵", "車站", "交流道", "快速道路", "道路", "橋", "轉運站")),
        ("產業/就業", ("產業園區", "科學園區", "科技園區", "AI園區", "物流園區", "設廠", "招商", "擴建", "投資")),
        ("公共服務", ("醫院", "大學", "學校", "社會住宅", "公共建設", "行政中心")),
        ("商業/人流", ("商場", "百貨", "購物中心", "影城", "商辦", "旅館")),
        ("都市開發", ("都市更新", "重劃區", "開發案", "區段徵收", "市地重劃")),
    ]
    for category, words in categories:
        if any(word in text for word in words):
            return category
    return "重大建設"


def explain_infrastructure_property_signal(category: str, action: str) -> str:
    if category == "交通":
        base = "交通題材會先反映在站點與通勤圈想像"
    elif category == "產業/就業":
        base = "產業題材重點是就業人口、租屋需求與商圈消費"
    elif category == "公共服務":
        base = "公共服務會提高生活機能，但房價支撐通常較慢"
    elif category == "商業/人流":
        base = "商業設施帶人流與消費題材，但要看實際招商與開幕"
    elif category == "都市開發":
        base = "都市開發會拉高土地與預售想像，但也要防開價先行"
    else:
        base = "重大建設會先影響區域想像，後續要驗證執行進度"

    if action in ("動工/開工", "通車/啟用", "招商/設廠"):
        return f"{base}；這類進度比單純規劃更實質。"
    if action in ("核定/通過", "宣布/發布"):
        return f"{base}；目前屬題材啟動期，適合追蹤周邊開價是否先反應。"
    return f"{base}；目前仍偏早期，先列入觀察，不宜直接當成房價支撐。"


def get_infrastructure_watch(
    infra_config: dict[str, Any],
    cutoff: datetime,
    max_fetches: int,
    min_article_chars: int,
) -> tuple[list[dict[str, Any]], list[str]]:
    if not infra_config.get("enabled", True):
        return [], []

    cities = [str(item).strip() for item in infra_config.get("cities", []) if str(item).strip()]
    keywords = [str(item).strip() for item in infra_config.get("keywords", []) if str(item).strip()]
    sources = [source for source in infra_config.get("source_urls", []) if source.get("url")]
    max_items = int(infra_config.get("max_items", 8))
    raw_entries, errors = fetch_market_entries_from_sources(sources, cutoff)
    enriched_entries, article_errors = enrich_market_entries_with_article_body(
        raw_entries,
        max_fetches=max_fetches,
        min_article_chars=min_article_chars,
    )
    if article_errors:
        errors.extend([f"重大建設內文抓取失敗：{error}" for error in article_errors[:3]])

    items: list[dict[str, str]] = []
    seen: set[str] = set()
    for entry in enriched_entries:
        text = entry.get("text", "")
        matched_cities = [city for city in cities if city in text]
        matched_keywords = [keyword for keyword in keywords if keyword in text]
        if not matched_cities or not matched_keywords:
            continue
        for city in matched_cities[:2]:
            summary = summarize_infrastructure_sentence(text, city, matched_keywords)
            project_name = extract_infrastructure_name(summary or text, city, matched_keywords)
            action, priority = classify_infrastructure_action(summary or text)
            category = classify_infrastructure_category(f"{project_name} {summary}")
            property_signal = explain_infrastructure_property_signal(category, action)
            key = f"{city}:{project_name}"
            if key in seen:
                continue
            seen.add(key)
            items.append(
                {
                    "city": city,
                    "project": project_name,
                    "summary": summary,
                    "keywords": "、".join(matched_keywords[:4]),
                    "source_quality": "已讀內文" if entry.get("text_source") == "article" else "RSS摘要",
                    "action": action,
                    "category": category,
                    "property_signal": property_signal,
                    "priority": priority,
                }
            )
            items.sort(key=lambda item: int(item.get("priority", 0)), reverse=True)
            if len(items) >= max_items:
                return items, errors
    return items, errors


def get_market_pulse(config: dict[str, Any], local_now: datetime) -> dict[str, Any]:
    if not config.get("enabled", True):
        return {"enabled": False, "items": [], "errors": []}

    districts = [str(item).strip() for item in config.get("districts", []) if str(item).strip()]
    keywords = [str(item).strip() for item in config.get("keywords", []) if str(item).strip()]
    max_districts = int(config.get("max_districts", 8))
    max_article_fetches = int(config.get("max_article_fetches", 24))
    min_article_chars = int(config.get("min_article_chars", 180))
    source_hits: list[dict[str, Any]] = []
    raw_entries: list[dict[str, str]] = []
    errors: list[str] = []
    cutoff = local_now - timedelta(days=int(config.get("days_back", 7)))

    for source in config.get("source_urls", []):
        source_name = str(source.get("name", "未命名來源"))
        source_url = str(source.get("url", "")).strip()
        if not source_url:
            continue
        try:
            request_url = encode_iri_url(source_url)
            content = fetch_text(request_url)
            if "Just a moment..." in content and "Cloudflare" in content:
                raise RuntimeError("Cloudflare challenge")
            entries = parse_market_source_entries(content, source_name, source_url, cutoff)
            if entries:
                raw_entries.extend(entries)
        except Exception as exc:
            if not source.get("report_errors", True):
                continue
            errors.append(f"{source_name}：{exc}")

    enriched_entries, article_errors = enrich_market_entries_with_article_body(
        raw_entries,
        max_fetches=max_article_fetches,
        min_article_chars=min_article_chars,
    )
    if article_errors:
        errors.extend([f"新聞內文抓取失敗：{error}" for error in article_errors[:3]])

    entries_by_source: dict[str, list[dict[str, str]]] = {}
    for entry in enriched_entries:
        entries_by_source.setdefault(entry.get("source", ""), []).append(entry)
    source_hits = [
        {"name": source_name, "url": "", "entries": entries}
        for source_name, entries in entries_by_source.items()
        if entries
    ]

    if not enriched_entries and not errors:
        errors.append("所有房市新聞/報告來源都抓取失敗或沒有可解析內容")

    infrastructure_items: list[dict[str, str]] = []
    infrastructure_errors: list[str] = []
    infra_config = config.get("infrastructure", {})
    if isinstance(infra_config, dict) and infra_config.get("enabled", True):
        infrastructure_items, infrastructure_errors = get_infrastructure_watch(
            infra_config,
            cutoff,
            max_fetches=max(6, max_article_fetches // 2),
            min_article_chars=min_article_chars,
        )
        errors.extend(infrastructure_errors[:3])

    district_items: list[dict[str, Any]] = []
    for district in districts:
        mention_count = 0
        keyword_counts: dict[str, int] = {}
        examples: list[str] = []
        example_entries: list[dict[str, str]] = []
        candidate_entries: list[dict[str, str]] = []
        sources: set[str] = set()
        for source in source_hits:
            for entry in source.get("entries", []):
                text = entry.get("text", "")
                count = text.count(district)
                if count <= 0:
                    continue
                mention_count += count
                sources.add(source["name"])
                for keyword in keywords:
                    key_count = text.count(keyword)
                    if key_count:
                        keyword_counts[keyword] = keyword_counts.get(keyword, 0) + key_count
                candidate_entries.append(entry)

        for entry in sorted(candidate_entries, key=lambda row: 0 if row.get("text_source") == "article" else 1):
            if len(example_entries) >= 3:
                break
            key = entry.get("resolved_url", "") or entry.get("url", "") or entry.get("title", "")
            if key and all((row.get("resolved_url", "") or row.get("url", "") or row.get("title", "")) != key for row in example_entries):
                example_entries.append(entry)
                examples.append((entry.get("summary_text") or entry.get("title", entry.get("text", "")[:90]))[:100])

        if mention_count:
            district_items.append(
                {
                    "district": district,
                    "mention_count": mention_count,
                    "keywords": sorted(keyword_counts, key=keyword_counts.get, reverse=True)[:4],
                    "keyword_counts": keyword_counts,
                    "examples": examples[:2],
                    "example_entries": example_entries[:2],
                    "sources": sorted(sources),
                }
            )

    district_items.sort(key=lambda item: item["mention_count"], reverse=True)
    return {
        "enabled": True,
        "days_back": int(config.get("days_back", 7)),
        "items": district_items[:max_districts],
        "errors": errors,
        "source_count": len(source_hits),
        "article_count": len(enriched_entries),
        "article_body_count": sum(1 for entry in enriched_entries if entry.get("text_source") == "article"),
        "infrastructure_items": infrastructure_items,
        "generated_at": local_now.isoformat(),
    }


def format_market_pulse_line(item: dict[str, Any]) -> list[str]:
    keyword_text = f"；關鍵詞：{'、'.join(item.get('keywords', []))}" if item.get("keywords") else ""
    source_text = f"；來源：{'、'.join(item.get('sources', []))}" if item.get("sources") else ""
    lines = [f"- {item.get('district')}：近週提及 {item.get('mention_count', 0)} 次{keyword_text}{source_text}"]
    for example in item.get("examples", [])[:1]:
        lines.append(f"  例：{example}")
    return lines


def explain_market_topic(topic: str) -> tuple[str, str]:
    if topic in {"房貸", "限貸"}:
        return "資金面偏緊", "核貸成數與交屋資金壓力可能壓低成交速度，需注意建商是否增加付款優惠。"
    if topic in {"讓利", "低價"}:
        return "價格競爭升高", "公開價或付款方案開始轉弱，應比較同區實價與實際可談折數，避免只看廣告價。"
    if topic in {"去化", "餘屋", "完銷"}:
        return "供需與庫存變化", "去化速度能反映真實買氣；餘屋增加通常比新聞熱度更值得警戒。"
    if topic in {"開案", "待開案", "新案", "預售"}:
        return "新增供給", "新案密集公開會測試區域價格上限，也可能分散既有建案買氣。"
    if topic in {"房價", "實價", "交易"}:
        return "量價訊號", "需同時看成交件數與單價；只有價格、沒有量，可能只是少數高價個案。"
    if topic in {"捷運", "重劃區"}:
        return "建設題材", "題材能支撐預期，但要核對工程進度、通勤時間與實際生活機能，不能只看遠期想像。"
    if topic in {"交屋"}:
        return "交屋壓力", "集中交屋會增加貸款、轉售與出租供給，可能讓短期議價空間擴大。"
    if topic in {"建商", "代銷"}:
        return "推案策略變化", "可觀察延後公開、縮小案量或付款方案調整，這些通常比口頭開價更早反映市場溫度。"
    return "市場關注", "需回到成交量、實價與供給量驗證，新聞提及次數本身不等於買氣。"


def build_market_pulse_insights(market_pulse: dict[str, Any], line_mode: bool = False) -> list[str]:
    items = market_pulse.get("items", []) if market_pulse else []
    if not items:
        return ["- 近一週來源未形成明確行政區熱點；本週不宜只依新聞熱度判斷區域強弱。"]

    top_items = items[:3]
    top_names = [str(item.get("district", "")).strip() for item in top_items if item.get("district")]
    aggregate_keyword_counts: dict[str, int] = {}
    for item in top_items:
        for keyword, count in item.get("keyword_counts", {}).items():
            aggregate_keyword_counts[keyword] = aggregate_keyword_counts.get(keyword, 0) + int(count)
    key_topics = sorted(aggregate_keyword_counts, key=aggregate_keyword_counts.get, reverse=True)[:3]
    source_count = market_pulse.get("source_count", 0)

    lines: list[str] = []
    if top_names:
        focus_parts = [
            f"{item.get('district')}（{item.get('mention_count', 0)}次）"
            for item in top_items
            if item.get("district")
        ]
        lines.append(f"- 本週焦點區域：{'、'.join(focus_parts)}。")
    if key_topics:
        grouped_signals: dict[str, dict[str, Any]] = {}
        for topic in key_topics:
            signal, explanation = explain_market_topic(topic)
            group = grouped_signals.setdefault(
                signal,
                {"topics": [], "count": 0, "explanation": explanation},
            )
            group["topics"].append(topic)
            group["count"] += aggregate_keyword_counts[topic]
        for signal, group in sorted(
            grouped_signals.items(),
            key=lambda row: row[1]["count"],
            reverse=True,
        )[:2]:
            topic_text = "、".join(group["topics"])
            lines.append(f"- 市場訊號｜{topic_text}（{group['count']}次）：{signal}。{group['explanation']}")
    else:
        lines.append("- 市場訊號：目前沒有單一題材形成明顯共識，應以實價成交量與新增供給判斷。")

    districts = set(top_names)
    if {"A7", "青埔", "龜山區", "林口區", "桃園區", "中壢區"} & districts:
        lines.append("- 對A7/桃園的意義：優先追蹤新案開價、待開案數與同區去化；題材曝光若沒有成交量配合，不視為價格轉強。")
    elif {"中和區", "板橋區", "新莊區", "三重區", "土城區", "新店區", "淡水區"} & districts:
        lines.append("- 對雙北外圍的意義：市場仍在比較捷運、重劃區與低總價產品，應特別留意供給增加後的議價空間。")
    elif {"大安區", "信義區", "松山區", "中山區", "內湖區"} & districts:
        lines.append("- 對市場的意義：台北核心區較像資金與價格指標，不能直接套用到A7，但可作為高資產買氣溫度計。")

    lines.append("- 下週觀察：新增預售案數、實價登錄件數、公開價是否下修，以及低首付/工程款優惠是否增加。")

    evidence: list[dict[str, str]] = []
    seen_evidence: set[str] = set()
    for item in top_items:
        for entry in item.get("example_entries", []):
            key = entry.get("url", "") or entry.get("title", "")
            if not key or key in seen_evidence:
                continue
            seen_evidence.add(key)
            evidence.append(entry)
    evidence_limit = 1 if line_mode else 2
    for entry in evidence[:evidence_limit]:
        source = f"（{entry.get('source')}）" if entry.get("source") else ""
        lines.append(f"- 代表資訊：{entry.get('title', '')[:100]}{source}")
        if entry.get("url"):
            lines.append(f"  {entry['url']}")
    if source_count:
        lines.append(f"- 判讀範圍：{source_count} 個可讀來源；新聞熱度僅作線索，仍以實價與供給驗證。")
    return lines


def format_market_pulse_line(item: dict[str, Any]) -> list[str]:
    keywords = item.get("keywords", [])[:5]
    sources = item.get("sources", [])[:3]
    keyword_text = f"；關鍵詞：{'、'.join(keywords)}" if keywords else ""
    source_text = f"；來源：{'、'.join(sources)}" if sources else ""
    return [
        f"- {item.get('district')}：近一週被提到 {item.get('mention_count', 0)} 次{keyword_text}{source_text}"
    ]


def explain_market_topic(topic: str) -> tuple[str, str]:
    if topic in {"房貸", "限貸"}:
        return "資金面偏緊", "貸款條件與核貸速度會影響買方出手，投資型產品要更重視自備款與轉手流動性。"
    if topic in {"讓利", "低價", "議價"}:
        return "價格競爭升高", "若讓利或議價反覆出現，代表部分建案可能開始用價格換成交，適合回頭比同區新案開價。"
    if topic in {"去化", "餘屋", "庫存", "完銷"}:
        return "供需與庫存變化", "去化慢或餘屋增加時，要留意區域供給壓力；完銷頻繁則表示需求仍能承接。"
    if topic in {"開案", "待開案", "新案", "預售", "預售屋", "供給"}:
        return "新增供給變多", "新案與待開案增加會影響附近預售行情，尤其要觀察開價是否高於既有案或用低價搶客。"
    if topic in {"房價", "實價", "交易", "買氣"}:
        return "量價訊號", "房價與交易新聞變多，代表市場正在重新定價；要搭配實登看是有量上漲還是開價喊高。"
    if topic in {"捷運", "重劃區"}:
        return "建設題材發酵", "交通與重劃區題材會拉高關注度，但投資上要分辨是長線建設價值還是短線話題溢價。"
    if topic in {"交屋"}:
        return "交屋壓力", "交屋潮可能帶來轉售或出租供給，若同區新成屋大量釋出，預售開價會受比較壓力。"
    if topic in {"建商", "代銷"}:
        return "推案策略變化", "建商與代銷動作變多時，通常代表推案節奏或銷售策略正在調整，可留意是否出現低首付、讓利或封盤。"
    return "市場關注升溫", "相關題材近期被反覆提及，代表市場注意力集中，後續要看是否轉化成成交與開價變化。"


def summarize_market_titles(entries: list[dict[str, str]], limit: int = 3) -> list[str]:
    titles: list[str] = []
    seen: set[str] = set()
    for entry in entries:
        title = str(entry.get("title", "")).strip()
        if not title or title in seen:
            continue
        seen.add(title)
        titles.append(title[:58])
        if len(titles) >= limit:
            break
    return titles


def build_market_pulse_insights(market_pulse: dict[str, Any], line_mode: bool = False) -> list[str]:
    items = market_pulse.get("items", []) if market_pulse else []
    if not items:
        return ["- 本週沒有抓到足夠可判讀的雙北、桃園房市訊號；先不要把零星新聞當成趨勢。"]

    top_items = items[:3]
    aggregate_keyword_counts: dict[str, int] = {}
    evidence_entries: list[dict[str, str]] = []
    for item in top_items:
        for keyword, count in item.get("keyword_counts", {}).items():
            aggregate_keyword_counts[keyword] = aggregate_keyword_counts.get(keyword, 0) + int(count)
        evidence_entries.extend(item.get("example_entries", []))

    focus_parts = [
        f"{item.get('district')}（{item.get('mention_count', 0)}次）"
        for item in top_items
        if item.get("district")
    ]
    key_topics = sorted(
        aggregate_keyword_counts,
        key=aggregate_keyword_counts.get,
        reverse=True,
    )[:5]

    signal_groups: dict[str, dict[str, Any]] = {}
    for topic in key_topics:
        signal, explanation = explain_market_topic(topic)
        group = signal_groups.setdefault(
            signal,
            {"topics": [], "count": 0, "explanation": explanation},
        )
        group["topics"].append(topic)
        group["count"] += aggregate_keyword_counts.get(topic, 0)

    lines: list[str] = []
    if focus_parts:
        lines.append(f"- 本週焦點：{'、'.join(focus_parts)}。")

    for signal, group in sorted(
        signal_groups.items(),
        key=lambda row: row[1]["count"],
        reverse=True,
    )[:3]:
        topics = "、".join(group["topics"])
        lines.append(
            f"- 有用訊號：{signal}。反覆出現的題材是「{topics}」，{group['explanation']}"
        )

    top_districts = {str(item.get("district", "")).strip() for item in top_items}
    if {"A7", "青埔", "龜山區", "桃園區", "中壢區", "大園區", "小檜溪", "藝文特區"} & top_districts:
        lines.append("- 對你有用的判讀：桃園與A7相關題材若同時升溫，代表資金仍在看外溢與重劃區，但更要盯預售供給量與開價是否越墊越高。")
    if {"板橋區", "新莊區", "新店區", "中和區", "三重區", "林口區", "淡水區"} & top_districts:
        lines.append("- 對你有用的判讀：新北熱門區若新聞量增加，會影響桃園買盤比較基準；桃園若要有吸引力，價差必須足夠明顯。")
    if {"中山區", "大安區", "信義區", "松山區", "內湖區", "南港區", "士林區", "北投區"} & top_districts:
        lines.append("- 對你有用的判讀：台北市題材偏向高總價與稀缺性，可作為景氣溫度計，但不宜直接拿來類比A7預售價。")

    title_summaries = summarize_market_titles(evidence_entries, limit=2 if line_mode else 3)
    if title_summaries:
        lines.append("- 資訊整理：")
        for title in title_summaries:
            lines.append(f"  - {title}")

    source_count = market_pulse.get("source_count", 0)
    if source_count:
        lines.append(f"- 判讀基礎：彙整近{market_pulse.get('days_back', 7)}天、{source_count}筆可讀資訊；重點看方向，不把單篇新聞當結論。")
    return lines


def summarize_market_article_points(entries: list[dict[str, str]], limit: int = 3) -> list[str]:
    points: list[str] = []
    seen: set[str] = set()
    sorted_entries = sorted(entries, key=lambda entry: 0 if entry.get("text_source") == "article" else 1)
    for entry in sorted_entries:
        point = str(entry.get("summary_text") or "").strip()
        if not point:
            point = summarize_article_text(str(entry.get("text", "")))
        point = re.sub(r"https?://\S+", "", point)
        point = re.sub(r"\s+", " ", point).strip()
        if not point:
            continue
        fingerprint = normalize_market_fingerprint(point)
        if fingerprint in seen:
            continue
        seen.add(fingerprint)
        source_note = "（已讀內文）" if entry.get("text_source") == "article" else "（RSS摘要）"
        points.append(f"{point[:110]}{source_note}")
        if len(points) >= limit:
            break
    return points


def collect_teaching_signal_counts(
    keyword_counts: dict[str, int],
    evidence_entries: list[dict[str, str]],
) -> dict[str, int]:
    framework_keywords = {
        "政令/資金": ("房貸", "限貸", "央行", "政策", "利率", "貸款", "信用管制", "選舉", "稅"),
        "空地/重劃區/供給": ("重劃區", "供給", "庫存", "餘屋", "新案", "待開案", "開案", "預售", "預售屋"),
        "重大工程": ("重大建設", "公共建設", "交通建設", "捷運", "高鐵", "科學園區", "產業園區", "商場", "百貨", "醫院", "大學"),
        "預售銷售週期": ("潛銷", "公開", "強銷", "完銷", "早鳥", "訂金", "賞屋", "案場", "來客", "封盤"),
        "代銷去化/高低點": ("代銷", "去化", "買氣", "交易", "實價", "成交", "讓利", "議價", "低價"),
        "流動性/持有成本": ("租金", "出租", "投報", "轉手", "流動性", "總價", "自備款", "首付", "管理費", "持有成本"),
    }
    combined_text = " ".join(
        str(entry.get("text", "")) + " " + str(entry.get("summary_text", "")) + " " + str(entry.get("title", ""))
        for entry in evidence_entries
    )
    counts: dict[str, int] = {}
    for framework, words in framework_keywords.items():
        count = 0
        for word in words:
            count += int(keyword_counts.get(word, 0))
            count += combined_text.count(word)
        if count:
            counts[framework] = count
    return counts


def build_teaching_framework_insights(
    framework_counts: dict[str, int],
    top_districts: set[str],
    line_mode: bool = False,
) -> list[str]:
    if not framework_counts:
        return []

    explanations = {
        "政令/資金": "講義把政令列為地段上漲三大主因之一；若新聞焦點在限貸、房貸或政策，代表買方槓桿與成交速度會先被影響，預售投資要優先檢查自備款與交屋貸款風險。",
        "空地/重劃區/供給": "講義把空地與重劃區視為漲幅來源，但供給太多也會壓去化；所以看到新案、待開案或餘屋增加時，要同時判斷是成長題材還是供給壓力。",
        "重大工程": "講義把重大工程列為地段上漲核心，且政府大型交通建設通常優先於民間商業題材；但宣布、核定、動工、通車的含金量不同，不能混在一起看。",
        "預售銷售週期": "講義的預售週期重點是潛銷期、公開期、強銷期、完銷期；若出現早鳥、潛銷或案場試水溫，代表價格還在抓抗性，比單純看公開牌價更有用。",
        "代銷去化/高低點": "講義判斷高低點看供需與代銷去化速度；若新聞反覆提到買氣、去化、讓利或成交，重點不是聲量，而是案場是否需要用價格換速度。",
        "流動性/持有成本": "講義提醒投資要看保值性、流動性與持有成本；若總價、租金或轉手訊號出現，要回到能不能出租、能不能轉手、每月要倒貼多少來判斷。",
    }
    sorted_frameworks = sorted(framework_counts, key=framework_counts.get, reverse=True)
    limit = 2 if line_mode else 3
    lines = ["- 教學框架判讀：本段不是看標題熱度，而是用講義的「政令、空地、重大工程、去化、流動性」去篩真正有用訊號。"]
    for framework in sorted_frameworks[:limit]:
        lines.append(f"  - {framework}：{explanations[framework]}")

    if {"A7", "青埔", "龜山區", "桃園區", "中壢區", "大園區", "小檜溪", "藝文特區"} & top_districts:
        lines.append("  - 對A7的用法：A7要特別把重大工程題材、待開案供給、預售去化速度放在同一張表看；如果題材很熱但去化變慢或讓利增加，就是風險訊號。")
    return lines


def build_market_pulse_insights(market_pulse: dict[str, Any], line_mode: bool = False) -> list[str]:
    items = market_pulse.get("items", []) if market_pulse else []
    if not items:
        return ["- 本週沒有抓到足夠可判讀的雙北、桃園房市正文訊號；先不要把零星標題當成趨勢。"]

    top_items = items[:3]
    aggregate_keyword_counts: dict[str, int] = {}
    evidence_entries: list[dict[str, str]] = []
    for item in top_items:
        for keyword, count in item.get("keyword_counts", {}).items():
            aggregate_keyword_counts[keyword] = aggregate_keyword_counts.get(keyword, 0) + int(count)
        evidence_entries.extend(item.get("example_entries", []))

    focus_parts = [
        f"{item.get('district')}（{item.get('mention_count', 0)}次）"
        for item in top_items
        if item.get("district")
    ]
    key_topics = sorted(aggregate_keyword_counts, key=aggregate_keyword_counts.get, reverse=True)[:5]

    signal_groups: dict[str, dict[str, Any]] = {}
    for topic in key_topics:
        signal, explanation = explain_market_topic(topic)
        group = signal_groups.setdefault(signal, {"topics": [], "count": 0, "explanation": explanation})
        group["topics"].append(topic)
        group["count"] += aggregate_keyword_counts.get(topic, 0)

    lines: list[str] = []
    if focus_parts:
        lines.append(f"- 本週正文焦點：{'、'.join(focus_parts)}。")

    for signal, group in sorted(signal_groups.items(), key=lambda row: row[1]["count"], reverse=True)[:3]:
        topics = "、".join(group["topics"])
        lines.append(f"- 有用訊號：{signal}。正文反覆提到「{topics}」，{group['explanation']}")

    top_districts = {str(item.get("district", "")).strip() for item in top_items}
    framework_counts = collect_teaching_signal_counts(aggregate_keyword_counts, evidence_entries)
    lines.extend(build_teaching_framework_insights(framework_counts, top_districts, line_mode=line_mode))

    if {"A7", "青埔", "龜山區", "桃園區", "中壢區", "大園區", "小檜溪", "藝文特區"} & top_districts:
        lines.append("- 對你有用的判讀：桃園與A7相關正文訊號若升溫，要同步看預售供給、待開案開價與建商是否用低價或讓利搶客。")
    if {"板橋區", "新莊區", "新店區", "中和區", "三重區", "林口區", "淡水區"} & top_districts:
        lines.append("- 對你有用的判讀：新北熱門區若正文提到買氣或價格，會影響桃園買盤的比價基準；桃園價差不夠大時吸引力會下降。")
    if {"中山區", "大安區", "信義區", "松山區", "內湖區", "南港區", "士林區", "北投區"} & top_districts:
        lines.append("- 對你有用的判讀：台北市訊號可當景氣溫度計，但不適合直接類比A7；要看它是否造成外溢買盤往桃園移動。")

    article_points = summarize_market_article_points(evidence_entries, limit=2 if line_mode else 3)
    if article_points:
        lines.append("- 內文整理重點：")
        for point in article_points:
            lines.append(f"  - {point}")

    source_count = market_pulse.get("source_count", 0)
    article_count = market_pulse.get("article_count", 0)
    article_body_count = market_pulse.get("article_body_count", 0)
    if article_count:
        if article_body_count:
            lines.append(
                f"- 判讀基礎：近{market_pulse.get('days_back', 7)}天共整理{article_count}則資訊，其中{article_body_count}則成功讀到新聞內文；其餘才用RSS摘要補足。"
            )
        else:
            lines.append(
                f"- 判讀基礎：近{market_pulse.get('days_back', 7)}天共整理{article_count}則資訊；本次新聞來源多為 Google News 中轉頁，未能直接讀到原文，先以RSS摘要判讀。"
            )
    elif source_count:
        lines.append(f"- 判讀基礎：近{market_pulse.get('days_back', 7)}天、{source_count}個來源；本次主要依可讀摘要判斷。")
    return lines


def get_rising_price_watch(areas: list[dict[str, Any]]) -> list[dict[str, Any]]:
    watch: list[dict[str, Any]] = []
    for area in areas:
        percent_text = area.get("price", {}).get("yearly_change_text", "")
        percent_value = parse_percent_value(percent_text)
        if percent_value is None or percent_value <= 0:
            continue
        watch.append(
            {
                "name": area["name"],
                "yearly_change_text": percent_text,
                "one_year_price": area.get("price", {}).get("one_year_price", ""),
                "new_build_price": area.get("price", {}).get("new_build_price", ""),
                "road_focus": area.get("road_focus", []),
                "price_url": area.get("price_url", ""),
            }
        )
    watch.sort(key=lambda item: parse_percent_value(item["yearly_change_text"]) or 0, reverse=True)
    return watch


def get_falling_price_watch(areas: list[dict[str, Any]]) -> list[dict[str, Any]]:
    watch: list[dict[str, Any]] = []
    for area in areas:
        percent_text = area.get("price", {}).get("yearly_change_text", "")
        percent_value = parse_percent_value(percent_text)
        if percent_value is None or percent_value >= 0:
            continue
        watch.append(
            {
                "name": area["name"],
                "yearly_change_text": percent_text,
                "one_year_price": area.get("price", {}).get("one_year_price", ""),
                "new_build_price": area.get("price", {}).get("new_build_price", ""),
                "road_focus": area.get("road_focus", []),
                "price_url": area.get("price_url", ""),
            }
        )
    watch.sort(key=lambda item: parse_percent_value(item["yearly_change_text"]) or 0)
    return watch


def get_project_price_rise_watch(areas: list[dict[str, Any]], state: dict[str, Any]) -> list[dict[str, Any]]:
    watch: list[dict[str, Any]] = []
    for area in areas:
        previous = get_previous_area(state, area["name"])
        if not previous:
            continue
        previous_presales = previous.get("active_presale_projects") or previous.get("presale_projects", [])
        previous_projects = {item.get("name"): item for item in previous_presales if item.get("name")}
        rising_projects: list[dict[str, str]] = []
        for current in area.get("active_presale_projects", []):
            name = current.get("name", "")
            if not name or name not in previous_projects:
                continue
            prev = previous_projects[name]
            prev_low, prev_high = parse_price_range(prev.get("status", ""))
            cur_low, cur_high = parse_price_range(current.get("status", ""))
            if prev_high is None or cur_high is None:
                continue
            if cur_high > prev_high or (cur_low is not None and prev_low is not None and cur_low > prev_low):
                rising_projects.append(
                    {
                        "name": name,
                        "previous_status": prev.get("status", ""),
                        "current_status": current.get("status", ""),
                        "url": current.get("url", ""),
                    }
                )
        if rising_projects:
            watch.append({"name": area["name"], "road_focus": area.get("road_focus", []), "projects": rising_projects})
    return watch


def format_price_rise_text(previous_status: str, current_status: str) -> str:
    return f"{previous_status or '未標示'} -> {current_status or '未標示'}"


def format_infrastructure_watch_line(item: dict[str, Any]) -> str:
    city = item.get("city", "未標示縣市")
    action = item.get("action", "新聞提及")
    category = item.get("category", "重大建設")
    project = item.get("project", "未擷取到建設名稱")
    summary = str(item.get("summary", ""))[:72]
    source_quality = item.get("source_quality", "資料摘要")
    property_signal = item.get("property_signal", "")
    return f"  - {city}｜{action}｜{category}｜{project}｜重點：{summary}｜房市判讀：{property_signal}（{source_quality}）"


def build_macro_summary(
    areas: list[dict[str, Any]],
    rising_watch: list[dict[str, Any]],
    falling_watch: list[dict[str, Any]],
    market_pulse: dict[str, Any] | None = None,
) -> list[str]:
    lines: list[str] = []
    valid_areas = [area for area in areas if not area.get("stale")]
    analysis_areas = valid_areas or areas

    if not analysis_areas:
        lines.append("- 目前可用 A7 區域資料不足，今天先不下 A7 區域結論。")
        infrastructure_items = market_pulse.get("infrastructure_items", []) if market_pulse else []
        if infrastructure_items:
            lines.append("- 全台重大設施/重大建設宣布：")
            for item in infrastructure_items[:8]:
                lines.append(format_infrastructure_watch_line(item))
        return lines

    presale_focus_area = max(analysis_areas, key=lambda area: len(area.get("active_presale_projects", [])))
    pending_focus_area = max(analysis_areas, key=lambda area: len(area.get("pending_launch_projects", [])))

    presale_count = len(presale_focus_area.get("active_presale_projects", []))
    pending_count = len(pending_focus_area.get("pending_launch_projects", []))
    pending_total = sum(len(area.get("pending_launch_projects", [])) for area in analysis_areas)
    stale_count = sum(1 for area in areas if area.get("stale"))

    strongest = rising_watch[0] if rising_watch else None
    weakest = falling_watch[0] if falling_watch else None

    if strongest:
        road_text = f"；路段集中在 {'、'.join(strongest['road_focus'][:3])}" if strongest.get("road_focus") else ""
        lines.append(
            f"- 價格結構目前最偏強的是 {strongest['name']}，年變化 {strongest['yearly_change_text']}，"
            f"近一年成交約 {strongest['one_year_price'] or '未解析'}{road_text}。"
        )

    if weakest:
        road_text = f"；路段集中在 {'、'.join(weakest['road_focus'][:3])}" if weakest.get("road_focus") else ""
        lines.append(
            f"- 目前相對偏弱的是 {weakest['name']}，年變化 {weakest['yearly_change_text']}，"
            "如果新增待售物件繼續增加，後續更可能看到價格修正。"
            f"{road_text}"
        )

    if presale_count > 0:
        lines.append(
            f"- 預售案最密集的區塊是 {presale_focus_area['name']}，目前可觀察到 {presale_count} 個預售案，"
            "最適合拿來連續盯價格帶是否有集體墊高。"
        )

    if pending_total > 0 and pending_count > 0:
        lines.append(
            f"- 目前全 A7 可看到待預售 / 未開賣新建案共 {pending_total} 案，"
            f"其中 {pending_focus_area['name']} 最需要先盯，因為這區目前有 {pending_count} 案仍在待定階段，"
            "後續一旦公開價格，通常最能反映市場對該區的信心。"
        )

    if presale_count == 0 and pending_total == 0:
        lines.append("- 今天沒有抓到明確仍屬預售或未開賣預售的新案，先不把新成屋或已交屋案納入判斷。")

    if market_pulse and market_pulse.get("items"):
        pulse_topics: dict[str, int] = {}
        pulse_districts: list[str] = []
        for item in market_pulse.get("items", [])[:5]:
            district = str(item.get("district", "")).strip()
            if district:
                pulse_districts.append(district)
            for keyword, count in item.get("keyword_counts", {}).items():
                pulse_topics[keyword] = pulse_topics.get(keyword, 0) + int(count)
        top_topics = sorted(pulse_topics, key=pulse_topics.get, reverse=True)[:4]
        if top_topics:
            district_text = "、".join(dict.fromkeys(pulse_districts[:4])) or "雙北桃園"
            lines.append(
                f"- 結合近一週市場脈動：正文焦點落在 {district_text}，反覆題材是 {'、'.join(top_topics)}；"
                "因此 A7 不能只看單一建案開價，要同步看待開案供給、預售去化、房貸條件與周邊是否開始讓利。"
            )
        if any(topic in pulse_topics for topic in ("房貸", "限貸")):
            lines.append(
                "- 市場正文若持續提到房貸/限貸，代表買方槓桿受壓；A7 投資判斷要優先檢查總價帶、首付壓力與未來轉售流動性。"
            )
        if any(topic in pulse_topics for topic in ("讓利", "低價", "議價")):
            lines.append(
                "- 若讓利/低價/議價題材增加，代表市場開始用價格換成交；A7 新案若仍持續墊高開價，就要更嚴格比對同區實登與待開案開價。"
            )
        if any(topic in pulse_topics for topic in ("待開案", "新案", "預售", "預售屋", "供給")) and pending_total > 0:
            lines.append(
                f"- A7 目前仍有 {pending_total} 個待開或可觀察預售訊號；若市場同時討論新案供給，後續重點是新案是否低開搶客，或高開拉抬同區預期。"
            )

    infrastructure_items = market_pulse.get("infrastructure_items", []) if market_pulse else []
    if infrastructure_items:
        lines.append("- 全台重大設施/重大建設宣布：")
        for item in infrastructure_items[:8]:
            lines.append(format_infrastructure_watch_line(item))
        lines.append(
            "- 建設題材判讀：宣布、核定、動工、招商、通車要分開看；宣布/核定是題材啟動，動工/招商/通車才比較接近實質支撐。若周邊預售開價已先漲，反而要檢查是否題材超前反映。"
        )

    if stale_count > 0:
        lines.append(
            f"- 今天有 {stale_count} 個區塊因網站擋爬或資料不穩而抓取失敗，"
            "本日結論只採用成功抓到的即時資料，不使用舊資料或設定清單補足。"
        )

    return lines


def new_report_content(
    areas: list[dict[str, Any]],
    state: dict[str, Any],
    local_now: datetime,
    bargain_watch: dict[str, Any] | None = None,
    market_pulse: dict[str, Any] | None = None,
    report_kind: str = "週報",
    urgent_pending_projects: list[dict[str, str]] | None = None,
    area_config: list[dict[str, Any]] | None = None,
) -> str:
    lines = [
        f"# A7 Leju {report_kind} | {local_now:%Y-%m-%d}",
        "",
        "- Source: leju.com.tw",
        f"- Generated at: {local_now:%Y-%m-%d %H:%M:%S}",
        "",
    ]
    rising_watch = get_rising_price_watch(areas)
    falling_watch = get_falling_price_watch(areas)
    project_rise_watch = get_project_price_rise_watch(areas, state)

    if market_pulse and market_pulse.get("enabled", False):
        lines.append("## 近一週市場脈動")
        lines.append("")
        items = market_pulse.get("items", [])
        if items:
            lines.extend(build_market_pulse_insights(market_pulse))
            lines.append("")
            lines.append("### 資料依據")
            for item in items[:5]:
                lines.extend(format_market_pulse_line(item))
        else:
            lines.append("- 近一週來源中未解析到明確的雙北、桃園行政區熱點。")
        if market_pulse.get("errors"):
            lines.append("")
            lines.append("資料限制：")
            for error in market_pulse["errors"][:5]:
                lines.append(f"- {error}")
        lines.append("")

    if bargain_watch and bargain_watch.get("enabled", False):
        lines.append("## 雙北桃園低價預售觀察")
        lines.append("")
        items = bargain_watch.get("items", [])
        if items:
            for item in items:
                lines.extend(format_bargain_watch_line(item))
        else:
            threshold = bargain_watch.get("threshold_percent", 20)
            lines.append(f"- 今天未發現公開價格低於周邊基準 {threshold:g}% 以上的預售 / 待開案。")
        errors = bargain_watch.get("errors", [])
        if errors:
            lines.append("")
            lines.append("資料限制：")
            for error in errors[:5]:
                lines.append(f"- {error}")
        lines.append("")

    if rising_watch:
        lines.append("## 價格抬升觀察")
        lines.append("")
        for item in rising_watch:
            lines.append(
                f"- {item['name']} | 年變化 {item['yearly_change_text']} | 近一年 {item['one_year_price'] or '未解析'} | 新案 {item['new_build_price'] or '未解析'}"
            )
            if item["road_focus"]:
                lines.append(f"  路段：{'、'.join(item['road_focus'])}")
            if item["price_url"]:
                lines.append(f"  {item['price_url']}")
        lines.append("")

    if falling_watch:
        lines.append("## 價格下降觀察")
        lines.append("")
        for item in falling_watch:
            lines.append(
                f"- {item['name']} | 年變化 {item['yearly_change_text']} | 近一年 {item['one_year_price'] or '未解析'} | 新案 {item['new_build_price'] or '未解析'}"
            )
            if item["road_focus"]:
                lines.append(f"  路段：{'、'.join(item['road_focus'])}")
            if item["price_url"]:
                lines.append(f"  {item['price_url']}")
        lines.append("")

    if project_rise_watch:
        lines.append("## 預售案逐步抬價觀察")
        lines.append("")
        for item in project_rise_watch:
            lines.append(f"- {item['name']}")
            if item["road_focus"]:
                lines.append(f"  路段：{'、'.join(item['road_focus'])}")
            for project in item["projects"][:4]:
                lines.append(f"  - {project['name']} | {format_price_rise_text(project['previous_status'], project['current_status'])}")
                lines.append(f"    {project['url']}")
        lines.append("")

    for area in areas:
        previous = get_previous_area(state, area["name"])
        if area.get("stale"):
            lines.extend(
                [
                    f"## {area['name']}",
                    "",
                    f"- 本次抓取失敗，不顯示舊資料。原因：{area.get('fetch_error', '')}",
                    "",
                ]
            )
            continue
        lines.extend(
            [
                f"## {area['name']}",
                "",
                f"- 可觀察預售案合計：{format_observable_presale_count(area)}",
                f"- 銷售中預售屋：{format_project_count(area, 'active_presale_projects')}",
                f"- 未開賣預售：{format_project_count(area, 'pending_launch_projects')}",
                f"- 完銷 / 非銷售中預售：{format_project_count(area, 'sold_out_presale_projects')}",
                f"- 買房頁：{area['buy_url']}",
                f"- 房價頁：{area['price_url']}",
                "",
            ]
        )
        append_area_presale_projects(lines, area, markdown=True)
        latest_presale_regs = get_new_registration_rows(
            area.get("latest_presale_registrations", []),
            previous,
        )[:5]
        if latest_presale_regs:
            lines.append("### 新增登錄的預售屋成交")
            for item in latest_presale_regs:
                lines.extend(format_registration_line(item))
            lines.append("")
        discounted_completed = get_discounted_completed_projects(area)
        if discounted_completed:
            lines.append("### 新成屋低於近一年均價觀察")
            for item in discounted_completed:
                lines.extend(format_discounted_completed_line(item))
            lines.append("")

    lines.append("## 大數據觀察")
    lines.append("")
    lines.extend(build_macro_summary(areas, rising_watch, falling_watch, market_pulse))
    return "\n".join(lines).strip()


def new_line_message(
    areas: list[dict[str, Any]],
    state: dict[str, Any],
    local_now: datetime,
    bargain_watch: dict[str, Any] | None = None,
    market_pulse: dict[str, Any] | None = None,
    report_kind: str = "週報",
    urgent_pending_projects: list[dict[str, str]] | None = None,
    area_config: list[dict[str, Any]] | None = None,
) -> str:
    lines = [f"A7 {report_kind}", f"日期：{local_now:%Y-%m-%d}", ""]
    rising_watch = get_rising_price_watch(areas)
    falling_watch = get_falling_price_watch(areas)
    project_rise_watch = get_project_price_rise_watch(areas, state)

    if market_pulse and market_pulse.get("enabled", False):
        lines.append("近一週市場脈動")
        items = market_pulse.get("items", [])
        if items:
            lines.extend(build_market_pulse_insights(market_pulse, line_mode=True))
        else:
            lines.append("- 未解析到明確雙北、桃園行政區熱點。")
        if market_pulse.get("errors"):
            lines.append("- 部分新聞/報告來源抓取失敗：")
            for error in market_pulse["errors"][:3]:
                lines.append(f"  - {error}")
        lines.append("")

    if bargain_watch and bargain_watch.get("enabled", False):
        lines.append("雙北桃園低價預售觀察")
        items = bargain_watch.get("items", [])
        if items:
            for item in items[:4]:
                lines.extend(format_bargain_watch_line(item))
        else:
            threshold = bargain_watch.get("threshold_percent", 20)
            lines.append(f"- 未發現低於周邊基準 {threshold:g}% 以上的預售 / 待開案。")
        if bargain_watch.get("errors"):
            errors = [str(error) for error in bargain_watch["errors"] if str(error).strip()]
            lines.append(f"- 低價新案監控有 {len(errors)} 筆來源/區域抓取異常；這代表該來源本次沒有納入低價判斷，不代表沒有低價案。")
            for error in errors[:4]:
                lines.append(f"  - {error}")
        lines.append("")

    if rising_watch:
        lines.append("價格抬升觀察")
        for item in rising_watch[:4]:
            road_text = f" | {'、'.join(item['road_focus'])}" if item["road_focus"] else ""
            lines.append(f"- {item['name']} | {item['yearly_change_text']} | {item['one_year_price'] or '未解析'}{road_text}")
        lines.append("")

    if falling_watch:
        lines.append("價格下降觀察")
        for item in falling_watch[:4]:
            road_text = f" | {'、'.join(item['road_focus'])}" if item["road_focus"] else ""
            lines.append(f"- {item['name']} | {item['yearly_change_text']} | {item['one_year_price'] or '未解析'}{road_text}")
        lines.append("")

    if project_rise_watch:
        lines.append("預售案逐步抬價觀察")
        for item in project_rise_watch[:3]:
            road_text = f" | {'、'.join(item['road_focus'])}" if item["road_focus"] else ""
            lines.append(f"- {item['name']}{road_text}")
            for project in item["projects"][:2]:
                lines.append(f"  - {project['name']} | {format_price_rise_text(project['previous_status'], project['current_status'])}")
        lines.append("")

    for area in areas:
        previous = get_previous_area(state, area["name"])
        if area.get("stale"):
            lines.extend(
                [
                    area["name"],
                    "本次抓取失敗，不顯示舊資料。",
                    "",
                ]
            )
            continue
        lines.extend(
            [
                area["name"],
                f"- 可觀察預售案合計：{format_observable_presale_count(area)}",
                f"- 銷售中預售屋：{format_project_count(area, 'active_presale_projects')}",
                f"- 未開賣預售：{format_project_count(area, 'pending_launch_projects')}",
                f"- 完銷 / 非銷售中預售：{format_project_count(area, 'sold_out_presale_projects')}",
                "",
            ]
        )
        append_area_presale_projects(lines, area)
        latest_presale_regs = get_new_registration_rows(
            area.get("latest_presale_registrations", []),
            previous,
        )[:2]
        if latest_presale_regs:
            lines.append("新增登錄的預售屋成交")
            for item in latest_presale_regs:
                lines.extend(format_registration_line(item))
            lines.append("")
        discounted_completed = get_discounted_completed_projects(area, limit=3)
        if discounted_completed:
            lines.append("新成屋低於近一年均價觀察")
            for item in discounted_completed:
                lines.extend(format_discounted_completed_line(item))
            lines.append("")

    lines.append("大數據觀察")
    lines.extend(build_macro_summary(areas, rising_watch, falling_watch, market_pulse))
    message = "\n".join(lines).strip()
    return message[:4897] + "..." if len(message) > 4900 else message


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


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-path", default=str(Path(__file__).with_name("a7-leju-monitor.env")))
    parser.add_argument("--area-config-path", default="")
    parser.add_argument("--bargain-watch-config-path", default="")
    parser.add_argument("--market-pulse-config-path", default="")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--skip-line", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    file_config = read_env_file(Path(args.config_path))
    for env_key in ("LEJU_FETCH_PROXY_URL", "LEJU_FETCH_PROXY_TOKEN"):
        if env_key not in os.environ and file_config.get(env_key):
            os.environ[env_key] = file_config[env_key]
    task_id = get_config_value(file_config, "TASK_ID", "a7-leju-digest")
    report_root = resolve_workspace_path(get_config_value(file_config, "REPORT_ROOT", "vault/2-actions/scheduled-reports/a7-leju"))
    state_path = resolve_workspace_path(get_config_value(file_config, "STATE_PATH", str(report_root / "state.json")))
    ledger_path = resolve_workspace_path(get_config_value(file_config, "SYNC_LEDGER_PATH", "system/skills/local-scheduler/config/sync-ledger.json"))
    timezone_raw = get_config_value(file_config, "TIME_ZONE", "Asia/Taipei")
    timezone_name = TIME_ZONE_ALIASES.get(timezone_raw, timezone_raw)
    line_token = get_config_value(file_config, "LINE_CHANNEL_ACCESS_TOKEN", "")
    line_mode = get_config_value(file_config, "LINE_MODE", "broadcast").strip().lower()
    line_to = get_config_value(file_config, "LINE_TO", "")
    area_config_path_text = args.area_config_path or get_config_value(file_config, "AREA_CONFIG_PATH", str(get_default_area_config_path()))
    area_config_path = resolve_workspace_path(area_config_path_text)
    bargain_config_path_text = args.bargain_watch_config_path or get_config_value(
        file_config,
        "BARGAIN_WATCH_CONFIG_PATH",
        str(get_default_bargain_watch_config_path()),
    )
    bargain_config_path = resolve_workspace_path(bargain_config_path_text)
    market_pulse_config_path_text = args.market_pulse_config_path or get_config_value(
        file_config,
        "MARKET_PULSE_CONFIG_PATH",
        str(get_default_market_pulse_config_path()),
    )
    market_pulse_config_path = resolve_workspace_path(market_pulse_config_path_text)
    line_schedule = get_config_value(file_config, "LINE_SCHEDULE", "weekly").strip().lower()
    weekly_report_day = int(get_config_value(file_config, "WEEKLY_REPORT_DAY", "6"))
    weekly_report_hour = int(get_config_value(file_config, "WEEKLY_REPORT_HOUR", "20"))
    intraday_alerts = get_config_value(file_config, "INTRADAY_ALERTS", "false").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    official_presale_url = get_config_value(
        file_config,
        "OFFICIAL_PRESALE_URL",
        "https://data.moi.gov.tw/MoiOD/System/DownloadFile.aspx?DATA=402BE9A1-6B0B-470B-806A-F9BFB15A8749",
    )
    official_presale_enabled = get_config_value(file_config, "OFFICIAL_PRESALE_ENABLED", "true").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    urgent_pending_enabled = get_config_value(file_config, "URGENT_PENDING_PRESALE_ALERT", "true").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }

    report_root.mkdir(parents=True, exist_ok=True)
    local_now = datetime.now(ZoneInfo(timezone_name))
    date_string = local_now.strftime("%Y-%m-%d")
    report_path = report_root / f"a7-leju-digest-{date_string}.md"

    ledger_file = get_ledger_file(ledger_path)
    if not args.force and not intraday_alerts and test_ledger_already_ran(ledger_file, task_id, date_string):
        print(f"Task '{task_id}' already ran on {date_string}. Use --force to run again.")
        return 0

    state = get_state_file(state_path)
    area_config = load_area_config(area_config_path)
    snapshots: list[dict[str, Any]] = []
    for area in area_config:
        previous = get_previous_area(state, area["name"])
        try:
            snapshots.append(get_area_snapshot(area))
        except Exception as exc:
            snapshots.append(build_stale_snapshot(area, previous, exc))

    if official_presale_enabled:
        try:
            project_mappings = get_project_url_mappings(area_config)
            official_regs = get_official_presale_registrations(official_presale_url, project_mappings)
            attach_official_presale_registrations(snapshots, official_regs, project_mappings)
        except Exception as exc:
            if snapshots:
                snapshots[0]["official_presale_fetch_error"] = str(exc)

    print_extraction_diagnostics(snapshots)

    bargain_watch = get_bargain_watch_results(load_bargain_watch_config(bargain_config_path))
    urgent_pending_projects = get_new_pending_launch_projects(snapshots, state) if urgent_pending_enabled else []
    urgent_bargain_items = get_new_bargain_watch_items(bargain_watch, state)
    weekly_due = is_weekly_report_due(local_now, weekly_report_day, weekly_report_hour)
    should_send_line = (
        args.force
        or line_schedule == "daily"
        or weekly_due
        or bool(urgent_pending_projects)
        or bool(urgent_bargain_items)
    )
    if weekly_due:
        report_kind = "週報"
    elif urgent_bargain_items:
        report_kind = "低價新案提醒"
    else:
        report_kind = "即時提醒"

    market_pulse = (
        get_market_pulse(load_market_pulse_config(market_pulse_config_path), local_now)
        if weekly_due or args.force
        else {"enabled": False, "items": [], "errors": []}
    )
    report_content = new_report_content(
        snapshots,
        state,
        local_now,
        bargain_watch,
        market_pulse,
        report_kind,
        urgent_pending_projects,
        area_config,
    )
    line_bargain_watch = bargain_watch
    if urgent_bargain_items and not weekly_due:
        line_bargain_watch = dict(bargain_watch)
        line_bargain_watch["items"] = urgent_bargain_items
    line_message = new_line_message(
        snapshots,
        state,
        local_now,
        line_bargain_watch,
        market_pulse,
        report_kind,
        urgent_pending_projects,
        area_config,
    )
    report_path.write_text(report_content + "\n", encoding="utf-8")
    save_state_file(state_path, state, snapshots, local_now, bargain_watch)
    update_ledger(ledger_path, ledger_file, task_id, report_path, local_now)

    if args.dry_run:
        print("Dry run complete.")
        print(line_message)
        print(f"Report path: {report_path}")
        return 0

    if not args.skip_line and should_send_line:
        if not line_token:
            print("WARNING: LINE token is missing. Report was generated locally, but no LINE message was sent.")
        elif line_mode == "push":
            if not line_to:
                print("WARNING: LINE_TO is missing for push mode. Report was generated locally, but no LINE message was sent.")
            else:
                send_line_push(line_token, line_to, line_message)
                print("LINE push sent successfully.")
        else:
            send_line_broadcast(line_token, line_message)
            print("LINE broadcast sent successfully.")
    elif not args.skip_line:
        print("LINE send skipped: no weekly report, new pending presale, or new 20%-below-market project was detected.")

    print(f"Report written to {report_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.URLError as exc:
        print(f"Network request failed: {exc}", file=sys.stderr)
        raise
