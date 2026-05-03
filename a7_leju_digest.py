from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo


AREA_CONFIG = [
    {
        "name": "A7站重劃區-郵政物流",
        "theme": "郵政特區 / AI走廊",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11175",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11175",
    },
    {
        "name": "A7站重劃區-樂善國小",
        "theme": "住宅核心",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11176",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11176",
    },
    {
        "name": "A7站重劃區-中心商業區",
        "theme": "商業核心 / AI走廊",
        "buy_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=buy&sid=11173",
        "price_url": "https://www.leju.com.tw/map/region?area=H333&city=H&mode=price&sid=11173",
    },
]

TIME_ZONE_ALIASES = {
    "Taipei Standard Time": "Asia/Taipei",
}


@dataclass
class Listing:
    raw: str
    price_wan: str = ""
    community: str = ""
    rooms: str = ""
    size_ping: str = ""
    floor: str = ""


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        values[key.strip()] = value
    return values


def get_config_value(file_config: dict[str, str], key: str, default: str = "") -> str:
    return os.environ.get(key) or file_config.get(key, default)


def resolve_workspace_path(path_text: str) -> Path:
    path = Path(path_text)
    if path.is_absolute():
        return path
    return Path.cwd() / path


def read_json_file(path: Path):
    if not path.exists():
        return None
    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        return None
    return json.loads(raw)


def write_json_file(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def fetch_text(url: str) -> str:
    result = subprocess.run(
        [
            "curl.exe",
            "-L",
            "-A",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
            "-H",
            "Accept-Language: zh-TW,zh;q=0.9,en;q=0.8",
            "-H",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            url,
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore",
        timeout=45,
        check=False,
    )
    if result.returncode != 0 or not result.stdout.strip():
        raise RuntimeError(f"curl fetch failed for {url}: {result.stderr.strip() or result.returncode}")
    return result.stdout


def get_regex_value(content: str, pattern: str, default: str = "") -> str:
    match = re.search(pattern, content, re.S)
    return match.group(1).strip() if match else default


def get_regex_int(content: str, pattern: str):
    value = get_regex_value(content, pattern, "")
    digits = re.sub(r"[^\d]", "", value)
    return int(digits) if digits else None


def parse_listing_text(text: str) -> Listing | None:
    clean = re.sub(r"\s+", " ", text).strip()
    if not clean:
        return None

    community = get_regex_value(clean, r"〖([^〗]+)〗", "")
    return Listing(
        raw=clean,
        price_wan=get_regex_value(clean, r"(\d[\d,]*)萬", ""),
        community=community,
        rooms=get_regex_value(clean, r"(\d房\d廳\d衛|\d房|開放式格局)", ""),
        size_ping=get_regex_value(clean, r"(\d+(?:\.\d+)?)坪", ""),
        floor=get_regex_value(clean, r"(\d+/\d+樓)", ""),
    )


def get_latest_listings(content: str) -> list[Listing]:
    section = get_regex_value(content, r"## 最新上架(.*?)## 新建案", "")
    if not section:
        return []

    listings: list[Listing] = []
    for match in re.finditer(r"】([^【]+)", section):
        parsed = parse_listing_text(match.group(1))
        if parsed:
            listings.append(parsed)
    return listings


def get_price_snapshot(content: str) -> dict[str, str | int | None]:
    return {
        "yearly_change_text": get_regex_value(content, r"近一年房價漲幅\s*([+\-]?\d+%)", ""),
        "five_year_price": get_regex_value(content, r"五年成交價\s*([\d.]+\s*萬/坪)", ""),
        "new_build_price": get_regex_value(content, r"新案成交價\s*([\d.]+\s*萬/坪)", ""),
        "one_year_price": get_regex_value(content, r"一年成交價\s*([\d.]+\s*萬/坪)", ""),
        "one_year_volume": get_regex_value(content, r"一年成交量\s*([\d.]+\s*戶/年)", ""),
        "active_new_builds": get_regex_int(content, r"銷售中新建案.*?(\d+)案"),
    }


def get_area_snapshot(area: dict[str, str]) -> dict:
    buy_content = fetch_text(area["buy_url"])
    price_content = fetch_text(area["price_url"])

    summary_match = re.search(
        r"銷售中新建案共有(\d+)個，待售有(\d+)戶，最新上架(\d+)戶。.*?重劃區有(\d+)個物件。.*?(\d+)個五年內新成屋",
        buy_content,
        re.S,
    )
    if not summary_match:
        raise RuntimeError(f"Cannot parse buy summary for {area['name']}.")

    return {
        "name": area["name"],
        "theme": area["theme"],
        "buy_url": area["buy_url"],
        "price_url": area["price_url"],
        "active_projects": int(summary_match.group(1)),
        "resale_listings": int(summary_match.group(2)),
        "latest_count": int(summary_match.group(3)),
        "rezoning_listings": int(summary_match.group(4)),
        "five_year_new_completion": int(summary_match.group(5)),
        "near_school": get_regex_int(buy_content, r"近學校\s*(\d+)\s*戶"),
        "all_listings": get_regex_int(buy_content, r"所有物件\s*(\d+)\s*戶"),
        "latest_listings": [asdict(item) for item in get_latest_listings(buy_content)],
        "price": get_price_snapshot(price_content),
    }


def get_previous_area(state: dict, area_name: str):
    for item in state.get("runs", []):
        if item.get("name") == area_name:
            return item
    return None


def get_change_text(current, previous) -> str:
    if current is None:
        return ""
    if previous is None:
        return str(current)
    delta = int(current) - int(previous)
    if delta == 0:
        return str(current)
    sign = "+" if delta > 0 else ""
    return f"{current} ({sign}{delta})"


def get_listing_id(listing: dict) -> str:
    return listing.get("raw") or "|".join(
        [
            listing.get("community", ""),
            listing.get("price_wan", ""),
            listing.get("floor", ""),
            listing.get("size_ping", ""),
        ]
    ).strip("|")


def get_new_listing_mentions(current_listings: list[dict], previous_listings: list[dict]) -> list[str]:
    previous_ids = {get_listing_id(item) for item in previous_listings}
    mentions: list[str] = []
    for item in current_listings:
        listing_id = get_listing_id(item)
        if listing_id not in previous_ids:
            summary = item.get("raw", "")
            if len(summary) > 60:
                summary = summary[:60] + "..."
            mentions.append(summary)
    return mentions


def get_notable_areas(areas: list[dict], state: dict) -> list[str]:
    notes: list[str] = []
    for area in areas:
        previous = get_previous_area(state, area["name"])
        previous_latest = previous.get("latest_count") if previous else None
        previous_projects = previous.get("active_projects") if previous else None

        if previous is None or area["latest_count"] >= 8 or (previous_latest is not None and area["latest_count"] - int(previous_latest) >= 3):
            notes.append(f"{area['name']} 上架量偏高，今天 {area['latest_count']} 戶。")

        if previous_projects is not None and area["active_projects"] != int(previous_projects):
            notes.append(f"{area['name']} 銷售中新建案數變動為 {area['active_projects']} 個。")

        yearly_change = area["price"].get("yearly_change_text", "")
        if isinstance(yearly_change, str) and yearly_change.startswith("-"):
            notes.append(f"{area['name']} 近一年價格轉弱，房價漲幅 {yearly_change}。")

        if ("AI" in area["theme"] or "郵政" in area["theme"]) and area["latest_count"] > 0:
            notes.append(f"{area['name']} 具 {area['theme']} 題材，今天仍有新上架。")

        previous_listings = previous.get("latest_listings", []) if previous else []
        for mention in get_new_listing_mentions(area["latest_listings"], previous_listings)[:2]:
            notes.append(f"{area['name']} 新出現物件: {mention}")

    return list(dict.fromkeys(notes))


def new_report_content(areas: list[dict], state: dict, local_now: datetime) -> str:
    lines = [
        f"# A7 Leju Digest | {local_now:%Y-%m-%d}",
        "",
        "- Source: leju.com.tw",
        f"- Generated at: {local_now:%Y-%m-%d %H:%M:%S}",
        "",
        "## Area Summary",
        "",
    ]

    for area in areas:
        previous = get_previous_area(state, area["name"])
        prev_latest = previous.get("latest_count") if previous else None
        prev_projects = previous.get("active_projects") if previous else None

        lines.extend(
            [
                f"### {area['name']}",
                "",
                f"- Active projects: {get_change_text(area['active_projects'], prev_projects)}",
                f"- Latest listings: {get_change_text(area['latest_count'], prev_latest)}",
                f"- Five-year new completions: {area['five_year_new_completion']}",
                f"- Rezoning listings: {area['rezoning_listings']}",
            ]
        )
        if area.get("near_school") is not None:
            lines.append(f"- Near-school listings: {area['near_school']}")
        lines.extend(
            [
                f"- One-year price: {area['price'].get('one_year_price', '')} | New-build price: {area['price'].get('new_build_price', '')}",
                f"- Yearly change: {area['price'].get('yearly_change_text', '')} | Volume: {area['price'].get('one_year_volume', '')}",
                f"- Buy page: {area['buy_url']}",
                f"- Price page: {area['price_url']}",
                "",
            ]
        )

        latest = area.get("latest_listings", [])[:3]
        if latest:
            lines.append("Latest listing samples:")
            for listing in latest:
                lines.append(f"- {listing.get('raw', '')}")
            lines.append("")

    notables = get_notable_areas(areas, state)
    lines.extend(["## Notable Watchlist", ""])
    if not notables:
        lines.append("- No special watch items were detected beyond baseline counts.")
    else:
        for note in notables:
            lines.append(f"- {note}")

    return "\n".join(lines)


def new_line_message(areas: list[dict], state: dict, local_now: datetime) -> str:
    lines = [f"A7 樂居日報", f"日期: {local_now:%Y-%m-%d}", ""]

    for area in areas:
        previous = get_previous_area(state, area["name"])
        latest_text = str(area["latest_count"])
        if previous is not None:
            delta = area["latest_count"] - int(previous.get("latest_count", 0))
            if delta != 0:
                latest_text += f" ({'+' if delta > 0 else ''}{delta})"
        lines.append(
            f"{area['name']}: 上架 {latest_text} | 新案 {area['active_projects']} | 年價 {area['price'].get('one_year_price', '')}"
        )

    notables = get_notable_areas(areas, state)[:4]
    if notables:
        lines.append("")
        lines.append("注意:")
        lines.extend(f"- {note}" for note in notables)

    message = "\n".join(lines).strip()
    return message[:4897] + "..." if len(message) > 4900 else message


def send_line_push(channel_access_token: str, to: str, message: str) -> None:
    body = json.dumps(
        {"to": to, "messages": [{"type": "text", "text": message}]},
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://api.line.me/v2/bot/message/push",
        data=body,
        headers={
            "Authorization": f"Bearer {channel_access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30):
        return


def send_line_broadcast(channel_access_token: str, message: str) -> None:
    body = json.dumps(
        {"messages": [{"type": "text", "text": message}]},
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://api.line.me/v2/bot/message/broadcast",
        data=body,
        headers={
            "Authorization": f"Bearer {channel_access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30):
        return


def get_ledger_file(path: Path) -> dict:
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


def test_ledger_already_ran(ledger_file: dict, task_id: str, date_string: str) -> bool:
    return any(entry.get("task_id") == task_id and entry.get("date") == date_string for entry in ledger_file.get("ledger", []))


def update_ledger(path: Path, ledger_file: dict, task_id: str, output_path: Path, local_now: datetime) -> None:
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


def get_state_file(path: Path) -> dict:
    state = read_json_file(path)
    if state is None:
        return {"runs": []}
    state.setdefault("runs", [])
    return state


def save_state_file(path: Path, area_snapshots: list[dict], local_now: datetime) -> None:
    write_json_file(
        path,
        {
            "last_run_at": local_now.isoformat(),
            "runs": area_snapshots,
        },
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-path", default=str(Path(__file__).with_name("a7-leju-monitor.env")))
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--skip-line", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser


def main() -> int:
    args = build_parser().parse_args()

    file_config = read_env_file(Path(args.config_path))
    task_id = get_config_value(file_config, "TASK_ID", "a7-leju-digest")
    report_root = resolve_workspace_path(get_config_value(file_config, "REPORT_ROOT", "vault/2-actions/scheduled-reports/a7-leju"))
    state_path = resolve_workspace_path(get_config_value(file_config, "STATE_PATH", str(report_root / "state.json")))
    ledger_path = resolve_workspace_path(get_config_value(file_config, "SYNC_LEDGER_PATH", "system/skills/local-scheduler/config/sync-ledger.json"))
    timezone_name = get_config_value(file_config, "TIME_ZONE", "Asia/Taipei")
    timezone_name = TIME_ZONE_ALIASES.get(timezone_name, timezone_name)
    line_token = get_config_value(file_config, "LINE_CHANNEL_ACCESS_TOKEN", "")
    line_mode = get_config_value(file_config, "LINE_MODE", "broadcast").strip().lower()
    line_to = get_config_value(file_config, "LINE_TO", "")

    report_root.mkdir(parents=True, exist_ok=True)
    local_now = datetime.now(ZoneInfo(timezone_name))
    date_string = local_now.strftime("%Y-%m-%d")
    report_path = report_root / f"a7-leju-digest-{date_string}.md"

    ledger_file = get_ledger_file(ledger_path)
    if not args.force and test_ledger_already_ran(ledger_file, task_id, date_string):
        print(f"Task '{task_id}' already ran on {date_string}. Use --force to run again.")
        return 0

    snapshots = [get_area_snapshot(area) for area in AREA_CONFIG]
    state = get_state_file(state_path)
    report_content = new_report_content(snapshots, state, local_now)
    report_path.write_text(report_content + "\n", encoding="utf-8")

    save_state_file(state_path, snapshots, local_now)
    update_ledger(ledger_path, ledger_file, task_id, report_path, local_now)

    line_message = new_line_message(snapshots, state, local_now)
    if args.dry_run:
        print("Dry run complete.")
        print(line_message)
        print(f"Report path: {report_path}")
        return 0

    if not args.skip_line:
        if not line_token:
            print("WARNING: LINE token is missing. Report was generated locally, but no LINE message was sent.")
        else:
            if line_mode == "push":
                if not line_to:
                    print("WARNING: LINE_TO is missing for push mode. Report was generated locally, but no LINE message was sent.")
                else:
                    send_line_push(line_token, line_to, line_message)
                    print("LINE push sent successfully.")
            else:
                send_line_broadcast(line_token, line_message)
                print("LINE broadcast sent successfully.")

    print(f"Report written to {report_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.URLError as exc:
        print(f"Network request failed: {exc}", file=sys.stderr)
        raise
