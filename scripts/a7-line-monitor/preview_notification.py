"""Offline layout preview. Never fetch, send LINE, or modify delivery checkpoints."""
import argparse
import json
from datetime import datetime
from pathlib import Path

import a7_leju_digest as digest


def main():
    root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", type=Path, default=root / "vault/2-actions/scheduled-reports/a7-leju/state.json")
    parser.add_argument("--output", type=Path, default=root / "output/pdf")
    args = parser.parse_args()
    state = json.loads(args.state.read_text(encoding="utf-8-sig"))
    observed = datetime.fromisoformat(state["last_run_at"])
    areas = state.get("runs", [])
    watch = {"enabled": True, "items": state.get("bargain_watch_items", [])}
    notice = f"離線版型預覽：使用 {observed:%Y-%m-%d %H:%M} 快照，並非重新取得的市場資料。"
    content = digest.new_report_content(areas, {}, observed, watch, report_kind="預覽")
    content = content.replace("## 本期先看\n", f"## 本期先看\n\n- {notice}\n", 1)
    message = notice + "\n\n" + digest.new_pdf_line_message(areas, observed, "（預覽不發布連結、不傳送 LINE）", "預覽", watch)
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "a7-line-preview.txt").write_text(message, encoding="utf-8")
    (args.output / "a7-report-preview.md").write_text(content, encoding="utf-8")
    pdf = args.output / "a7-report-preview.pdf"
    digest.generate_pdf_report(content, pdf, observed, "預覽", [area["name"] for area in areas])
    print(message)
    print(f"PDF: {pdf}")


if __name__ == "__main__":
    main()
