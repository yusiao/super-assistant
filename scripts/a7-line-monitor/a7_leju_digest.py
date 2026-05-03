from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo


DEFAULT_AREA_CONFIG = [
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


def get_default_area_config_path() -> Path:
    return Path(__file__).with_name("area-config.json")


def load_area_config(path: Path | None) -> list[dict[str, str]]:
    config_path = path or get_default_area_config_path()
    if config_path.exists():
