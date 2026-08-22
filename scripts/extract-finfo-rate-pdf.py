#!/usr/bin/env python3
"""Extract common Finfo rate-table PDFs into structured JSON."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import pdfplumber


def clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def clean_multiline(value):
    return "\n".join(
        item for item in (clean(line) for line in re.split(r"[\r\n]+", str(value or "")))
        if item
    )


def number(value):
    text = clean(value).replace(",", "")
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    return float(match.group(0)) if match else None


def int_number(value):
    value = number(value)
    return int(value) if value is not None and float(value).is_integer() else value


def expand_age(label):
    text = clean(label).replace("～", "~").replace("-", "~")
    range_match = re.search(r"(\d{1,3})\s*~\s*(\d{1,3})", text)
    if range_match:
        start, end = int(range_match.group(1)), int(range_match.group(2))
        return list(range(start, end + 1))
    single = re.search(r"\d{1,3}", text)
    return [int(single.group(0))] if single else []


def cell_lines(value):
    return [clean(item) for item in re.split(r"[\r\n]+", str(value or "")) if clean(item)]


def expanded_ages(value):
    lines = cell_lines(value)
    if len(lines) <= 1:
        return expand_age(value)
    ages = []
    for line in lines:
        ages.extend(expand_age(line))
    return ages


def expanded_numbers(value):
    lines = cell_lines(value)
    if len(lines) <= 1:
        return [int_number(value)]
    return [int_number(line) for line in lines]


def age_premium_pairs(age_cell, premium_cell):
    ages = expanded_ages(age_cell)
    premiums = expanded_numbers(premium_cell)
    if not ages or not premiums:
        return []
    if len(premiums) == 1:
        premiums *= len(ages)
    return [
        (age, premiums[index])
        for index, age in enumerate(ages)
        if index < len(premiums) and premiums[index] is not None
    ]


def parse_age_gender_table(table):
    rows = [[clean_multiline(cell) for cell in row] for row in table if any(clean(cell) for cell in row)]
    header_index = -1
    male_index = -1
    female_index = -1
    for index, row in enumerate(rows):
        for col, cell in enumerate(row):
            if "男性" in cell:
                male_index = col
            if "女性" in cell:
                female_index = col
        if any("年齡" in cell for cell in row) and male_index >= 0 and female_index >= 0:
            header_index = index
            break
    if header_index < 0 or male_index < 0 or female_index < 0:
        return {}

    by_gender = {"male": [], "female": []}
    for row in rows[header_index + 1 :]:
        age_cell = row[0] if row else ""
        for age, premium in age_premium_pairs(age_cell, row[male_index] if male_index < len(row) else ""):
            by_gender["male"].append({"age": age, "premium": premium})
        for age, premium in age_premium_pairs(age_cell, row[female_index] if female_index < len(row) else ""):
            by_gender["female"].append({"age": age, "premium": premium})
    return {gender: rows for gender, rows in by_gender.items() if rows}


def term_years(label):
    match = re.search(r"(\d{1,2})\s*(?:\u5e74\s*\u671f|\u5e74)", clean(label))
    return int(match.group(1)) if match else None


def normalize_term_label(label):
    years = term_years(label)
    return f"{years}\u5e74\u671f" if years else ""


def sort_rate_rows(rows):
    by_age = {}
    for row in rows:
        age = row.get("age")
        premium = row.get("premium")
        if age is None or premium is None:
            continue
        by_age[int(age)] = {"age": int(age), "premium": premium}
    return [by_age[age] for age in sorted(by_age)]


def merge_gender_tables(target, addition):
    for gender, rows in (addition or {}).items():
        if not rows:
            continue
        target[gender] = sort_rate_rows([*(target.get(gender) or []), *rows])


def merge_term_gender_tables(target, addition):
    for term, gender_tables in (addition or {}).items():
        if not gender_tables:
            continue
        if term not in target:
            target[term] = {}
        merge_gender_tables(target[term], gender_tables)


def parse_term_gender_table(table):
    rows = [[clean_multiline(cell) for cell in row] for row in table if any(clean(cell) for cell in row)]
    if len(rows) < 3:
        return {}

    parsed = {}

    def append_columns(data_rows, columns):
        for row in data_rows:
            age_cell = row[0] if row else ""
            if not expanded_ages(age_cell):
                continue
            for term, gender, col in columns:
                premium_cell = row[col] if col < len(row) else ""
                pairs = age_premium_pairs(age_cell, premium_cell)
                if not pairs:
                    continue
                parsed.setdefault(term, {}).setdefault(gender, [])
                parsed[term][gender].extend(
                    {"age": age, "premium": premium}
                    for age, premium in pairs
                )

    # Common Excel export: payment terms on the first header row and
    # male/female columns on the second. Blank term cells inherit the term left.
    for header_index in range(len(rows) - 2):
        term_row = rows[header_index]
        gender_row = rows[header_index + 1]
        current_term = ""
        term_columns = []
        for col in range(1, max(len(term_row), len(gender_row))):
            candidate = normalize_term_label(term_row[col] if col < len(term_row) else "")
            if candidate:
                current_term = candidate
            gender_cell = gender_row[col] if col < len(gender_row) else ""
            gender = "male" if "男性" in gender_cell else "female" if "女性" in gender_cell else ""
            if current_term and gender:
                term_columns.append((current_term, gender, col))
        if term_columns:
            append_columns(rows[header_index + 2 :], term_columns)

    # Alternate layout: male/female groups on one row and payment terms below.
    for header_index in range(len(rows) - 2):
        header = rows[header_index]
        term_row = rows[header_index + 1]
        gender_starts = []
        for col, cell in enumerate(header):
            if "\u7537\u6027" in cell:
                gender_starts.append(("male", col))
            if "\u5973\u6027" in cell:
                gender_starts.append(("female", col))
        if len(gender_starts) < 2:
            continue

        gender_starts.sort(key=lambda item: item[1])
        term_columns = []
        for index, (gender, start_col) in enumerate(gender_starts):
            end_col = gender_starts[index + 1][1] if index + 1 < len(gender_starts) else len(term_row)
            for col in range(start_col, min(end_col, len(term_row))):
                term = normalize_term_label(term_row[col])
                if term:
                    term_columns.append((term, gender, col))
        if not term_columns:
            continue

        append_columns(rows[header_index + 2 :], term_columns)

    return {
        term: {
            gender: sort_rate_rows(rows)
            for gender, rows in gender_tables.items()
            if rows
        }
        for term, gender_tables in parsed.items()
        if any(gender_tables.values())
    }


def occupation_class(cell):
    text = clean(cell)
    chinese = {
        "第一": 1,
        "第二": 2,
        "第三": 3,
        "第四": 4,
        "第五": 5,
        "第六": 6,
        "第六": 6,
    }
    for key, value in chinese.items():
        if key in text:
            return value
    match = re.search(r"\b([1-6])\b", text)
    return int(match.group(1)) if match else None


def parse_coverage_occupation_table(table):
    rows = [[clean(cell) for cell in row] for row in table if any(clean(cell) for cell in row)]
    if len(rows) < 2:
        return None
    header = rows[0]
    class_columns = []
    for index, cell in enumerate(header):
        klass = occupation_class(cell)
        if klass:
            class_columns.append((index, klass))
    if len(class_columns) < 2:
        return None

    parsed_rows = []
    for row in rows[1:]:
        label = row[0] if row else ""
        if "萬" not in label:
            continue
        coverage = number(label)
        if coverage is None:
            continue
        premiums = {}
        for index, klass in class_columns:
            premium = int_number(row[index] if index < len(row) else "")
            if premium is not None:
                premiums[f"class{klass}"] = premium
        if premiums:
            parsed_rows.append({
                "label": label,
                "coverageWan": coverage,
                "premiums": premiums,
            })
    if not parsed_rows:
        return None
    return {
        "kind": "coverageOccupation",
        "unit": "annualPremium",
        "occupationClasses": sorted({int(key.replace("class", "")) for row in parsed_rows for key in row["premiums"]}),
        "rows": parsed_rows,
    }


def image_pdf_fallback(code):
    normalized = (code or "").upper()
    if normalized == "XAN":
        return {
            "kind": "unitOccupation",
            "unit": "perCoverageWanAnnualPremium",
            "unitCoverageWan": 1,
            "occupationClasses": [1, 2, 3, 4, 5, 6],
            "rows": [{
                "label": "每萬元保額",
                "coverageWan": 1,
                "premiums": {
                    "class1": 7.3,
                    "class2": 9.1,
                    "class3": 11.0,
                    "class4": 16.4,
                    "class5": 25.6,
                    "class6": 32.9,
                },
            }],
            "note": "圖片型 PDF，依表格文字人工校準為每年每萬元保額費率。",
        }
    return None


def extract(path, code=""):
    warnings = []
    all_text = []
    tables = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            all_text.append(text)
            tables.extend(page.extract_tables() or [])

    rate_tables_by_gender = {}
    term_rate_tables_by_gender = {}
    structured = None
    for table in tables:
        term_tables = parse_term_gender_table(table)
        if term_tables:
            merge_term_gender_tables(term_rate_tables_by_gender, term_tables)
        else:
            merge_gender_tables(rate_tables_by_gender, parse_age_gender_table(table))
        if structured is None:
            structured = parse_coverage_occupation_table(table)

    text = "\n".join(all_text)
    if "每萬元" in text:
        rate_unit_coverage = 10000
    elif "每千元" in text:
        rate_unit_coverage = 1000
    elif "每百元" in text:
        rate_unit_coverage = 100
    else:
        rate_unit_coverage = None
    if structured is None and not text.strip():
        structured = image_pdf_fallback(code)
        if structured is None:
            warnings.append("PDF contains no extractable text; OCR is required.")

    return {
        "ok": bool(rate_tables_by_gender or term_rate_tables_by_gender or structured),
        "textChars": len(text),
        "tableCount": len(tables),
        "rateTablesByGender": rate_tables_by_gender,
        "termRateTablesByGender": term_rate_tables_by_gender,
        "rateUnitCoverage": rate_unit_coverage,
        "structuredRateTable": structured,
        "warnings": warnings,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--code", default="")
    args = parser.parse_args()

    result = extract(Path(args.pdf), args.code)
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
