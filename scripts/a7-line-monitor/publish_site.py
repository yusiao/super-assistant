"""Refresh website assets without a scrape or LINE side effects."""
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
import json
import urllib.error
import urllib.request

from public_site import export_public_site


def main():
    root = Path("site/a7-reports")
    config = json.loads(Path(__file__).with_name("area-config.json").read_text(encoding="utf-8"))
    export_public_site([{**area, "stale": True} for area in config], datetime.now(ZoneInfo("Asia/Taipei")), root)
    path = root / "market-data.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["scope_note"] = "網站已上線，等待第一次新版排程資料匯出。尚未展示建案，不代表沒有建案。"
    data["initializing"] = True
    # Preserve already-public resources, never read private scheduler state here.
    base = "https://yusiao.github.io/super-assistant/a7-reports/"
    for name in ["market-data.json", "a7-market-report-latest.pdf"]:
        try:
            with urllib.request.urlopen(base + name, timeout=20) as response:
                content = response.read(30_000_001)
            if len(content) > 30_000_000:
                raise ValueError("Public resource exceeds size limit")
            if name.endswith(".json"):
                candidate = json.loads(content)
                if candidate.get("schema_version") != 1 or not isinstance(candidate.get("areas"), list):
                    raise ValueError("Invalid public data schema")
                data = candidate
            else:
                if not content.startswith(b"%PDF-"):
                    raise ValueError("Invalid PDF")
                (root / name).write_bytes(content)
                data["pdf_available"] = True
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
            print(f"No existing public {name}; initializing without it.")
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    # robots.txt applies at the host root; also retain the page-level noindex meta.
    (root.parent / "robots.txt").write_text("User-agent: *\nDisallow: /super-assistant/a7-reports/\n", encoding="utf-8")


if __name__ == "__main__":
    main()
