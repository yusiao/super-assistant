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
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


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
