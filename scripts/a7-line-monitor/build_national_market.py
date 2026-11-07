"""Build a public aggregate snapshot from MOI disclosure and filing CSVs."""
import argparse
from collections import defaultdict
import csv
from datetime import date, timedelta
from hashlib import sha256
import io
import json
import math
from pathlib import Path
import re
import unicodedata
from zipfile import ZipFile

SITE = Path(__file__).with_name("site")
COUNTIES = dict(zip("abcdefghijkmnopqtuvwxz", (
    "臺北市 臺中市 基隆市 臺南市 高雄市 新北市 宜蘭縣 桃園市 嘉義市 新竹縣 苗栗縣 "
    "南投縣 彰化縣 新竹市 雲林縣 嘉義縣 屏東縣 花蓮縣 臺東縣 金門縣 澎湖縣 連江縣"
).split(), strict=True))
MIN_SALES = 5
M2_PER_PING = 400 / 121
# Correct only a verified encoding substitution, scoped to the matching filing and address.
PRESALE_NAME_CORRECTIONS = {("桃園市/龜山區", "丰嶺?林", "桃市都建執照字第會龜00076-01號"): "丰嶺彡林"}


def clean(value):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", value or "")).replace("台", "臺")


def roc(value):
    value = clean(value)
    if not re.fullmatch(r"\d{6,7}", value):
        return None
    try:
        return date(int(value[:-4]) + 1911, int(value[-4:-2]), int(value[-2:]))
    except ValueError:
        return None


def years_before(day, years):
    try:
        return day.replace(year=day.year - years)
    except ValueError:
        return day.replace(year=day.year - years, day=28)


def rows(archive, name):
    with archive.open(name) as file, io.TextIOWrapper(file, encoding="utf-8-sig", newline="") as stream:
        yield from csv.reader(stream)


def address_key(value, city, district):
    value = clean(value).removeprefix(city).removeprefix(district)
    value = re.sub(r"^(?:[^鄰]+?[村里])?\d+鄰", "", value)
    digits = {c: i for i, c in enumerate("零一二三四五六七八九")}

    def number(match):
        raw = match[0]
        if "十" in raw:
            left, right = raw.split("十")
            return str(10 * digits.get(left, 1) + digits.get(right, 0))
        return str(int("".join(str(digits.get(c, c)) for c in raw)))

    value = re.sub(r"(?:\d+|[零一二三四五六七八九十]+)(?=段|巷|弄|號)", number, value)
    value = re.sub(r"(\d+)號之(\d+)", r"\1-\2號", value)
    value = re.sub(r"(\d+)之(\d+)號", r"\1-\2號", value)
    found = re.match(r"(.+?\d+(?:-\d+)?號)", value)
    return found[1] if found and not found[1].endswith("地號") else ""


def comparable(record, start, end):
    sold, built = roc(record[7]), roc(record[14])
    if not (sold and built and start <= sold <= end and years_before(sold, 5) <= built <= sold):
        return None
    if record[1] not in ("房地(土地+建物)", "房地(土地+建物)+車位"):
        return None
    if not record[11].startswith(("住宅大樓", "華廈", "公寓")) or record[12] not in ("住家用", "集合住宅"):
        return None
    return net_sale(record, sold)


def comparable_presale(record, start, end):
    sold = roc(record[7])
    if not sold or not start <= sold <= end or not record[28].strip() or record[30].strip():
        return None
    if record[1] not in ("房地(土地+建物)", "房地(土地+建物)+車位"):
        return None
    if not record[11].startswith(("住宅大樓", "華廈", "公寓")) or record[12] not in ("住家用", "集合住宅", "住商用"):
        return None
    if clean(record[9]) in ("一層", "一樓", "1層", "1樓", "1"):
        return None
    return net_sale(record, sold)


def net_sale(record, sold):
    if record[26].strip() or not record[27]:
        return None
    transfer = re.fullmatch(r"土地\d+建物1車位(\d+)", record[8])
    if not transfer:
        return None
    try:
        price, area, parking_area, parking_price = (float(record[i]) for i in (21, 15, 24, 25))
    except ValueError:
        return None
    if not all(math.isfinite(n) for n in (price, area, parking_area, parking_price)):
        return None
    if int(transfer[1]):
        if parking_area <= 0 or parking_price <= 0:
            return None
    elif parking_area != 0 or parking_price != 0:
        return None
    net_price, net_area = price - parking_price, area - parking_area
    if net_price <= 0 or net_area <= 0:
        return None
    return (sold.isoformat(), net_price, net_area)


def stats(samples):
    count = len(samples)
    if count < MIN_SALES:
        return {"count": count, "mean": None}
    return {"count": count,
            "mean": round(sum(x[1] for x in samples) / sum(x[2] for x in samples) * M2_PER_PING / 10000, 2),
            "first": min(x[0] for x in samples), "last": max(x[0] for x in samples)}


def registration_span(archive):
    return batch_span(archive, r"登記日期", "registration")


def presale_span(archive):
    return batch_span(archive, r"交易日期", "presale", r"\s*之預售屋案件")


def batch_span(archive, prefix, label, suffix=""):
    content = archive.read("build_time.xml").decode("utf-8-sig")
    match = re.search(prefix + r"\s*(\d+)年(\d+)月(\d+)日至\s*(\d+)年(\d+)月(\d+)日" + suffix, content)
    if not match:
        raise ValueError(f"Missing {label} period")
    a, b, c, d, e, f = map(int, match.groups())
    return date(a + 1911, b, c), date(d + 1911, e, f)


def presale_positions(path, as_of):
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    candidates = defaultdict(list)
    for project in data["projects"]:
        key = (clean(project["city"]) + "/" + clean(project["district"]), clean(project["name"]))
        point = project.get("coordinates")
        if project.get("verified_on", "") >= (as_of - timedelta(days=7)).isoformat() and point:
            candidates[key].append(tuple(point))
        else:
            candidates[key].append(None)
    return {key: points[0] for key, points in candidates.items() if len(points) == 1 and points[0]}


def presale_summary(records):
    projects = defaultdict(list)
    for name, sample in records:
        projects[name].append(sample)
    return {
        "presale_price": stats([sample for _, sample in records]),
        "presale_projects": [{"name": name, **stats(samples)}
                             for name, samples in sorted(projects.items(), key=lambda p: (-len(p[1]), p[0]))],
    }


def presale_name_corrections(filings):
    corrections = {}
    for town, _, item in filings.values():
        name = clean(item["name"])
        corrected = PRESALE_NAME_CORRECTIONS.get((town, name, clean(item["permit"])))
        if corrected and (address := address_key(item["address"], *town.split("/"))):
            corrections[town, name, address] = corrected
    return corrections


def address_positions(address_files, features, wanted):
    from pyproj import Transformer

    convert = Transformer.from_crs(3826, 4326, always_xy=True).transform
    by_code = {}
    for p in features:
        code = p["code"]
        by_code[code] = p
        if code.startswith("68000"):
            by_code[f"680{int(code[-3:]) // 10:02d}00"] = p
    points = {}
    for path in address_files:
        with Path(path).open(encoding="utf-8-sig", newline="") as stream:
            reader = csv.reader(stream)
            headers = next(reader)
            if len(headers) != 11 or headers[-2].strip() not in ("x_3826", "橫座標"):
                raise ValueError("Unexpected address CSV schema")
            for row in reader:
                if len(row) != 11 or not (p := by_code.get(row[1].strip())):
                    continue
                district = f'{p["city"]}/{p["district"]}'
                if district not in wanted:
                    continue
                address = address_key("".join(row[4:9]), p["city"], p["district"])
                if address not in wanted[district]:
                    continue
                key = district, address
                try:
                    point = convert(float(row[9]), float(row[10]))
                except ValueError:
                    continue
                if not (118 <= point[0] <= 123 and 21 <= point[1] <= 27):
                    continue
                if key not in points:
                    points[key] = point
                elif points[key] and math.dist(points[key], point) > 0.0002:
                    points[key] = None
    return points


def build(args):
    from pyproj import Transformer
    from shapely.geometry import Point, shape
    from shapely.ops import transform

    divisions = [f["properties"] for f in json.loads((SITE / "districts.geojson").read_text(encoding="utf-8"))["features"]]
    districts = {f'{p["city"]}/{p["district"]}': {"filings": [], "registry": False} for p in divisions}
    atlas = json.loads((SITE / "station-atlas.geojson").read_text(encoding="utf-8"))
    shapes = {f["properties"]["id"]: shape(f["geometry"]) for f in atlas["features"]}
    official = json.loads((SITE / "life-boundaries.geojson").read_text(encoding="utf-8"))
    for f in official["features"]:
        p = f["properties"]
        if p.get("catalog_id"):
            key = "official:" + p["catalog_id"]
            geom = shape(f["geometry"])
            shapes[key] = shapes[key].union(geom) if key in shapes else geom
    sales, spans, seen = defaultdict(list), [], set()
    presales, presale_spans, presale_seen = defaultdict(list), [], set()
    transactions = defaultdict(list)
    shapes_by_district = {
        "桃園市/龜山區": [k for k in shapes if k.startswith(("a7", "a8"))],
        "新北市/林口區": [k for k in shapes if k.startswith("a9")],
    }
    for f in official["features"]:
        p = f["properties"]
        if p.get("catalog_id"):
            for d in p.get("districts", [p["district"]]):
                key = f'{p["city"]}/{d}'
                ids = shapes_by_district.setdefault(key, [])
                value = "official:" + p["catalog_id"]
                if value not in ids:
                    ids.append(value)
    for file in args.sales:
        with ZipFile(file) as archive:
            spans.append(registration_span(archive))
            presale_spans.append(presale_span(archive))
    spans.sort()
    presale_spans.sort()
    if any(a[1] + timedelta(days=1) != b[0] for periods in (spans, presale_spans)
           for a, b in zip(periods, periods[1:])):
        raise ValueError("Use contiguous, non-overlapping MOI sale batches")
    end = spans[-1][1]
    start = end - timedelta(days=182)
    presale_start, presale_end = presale_spans[0][0], presale_spans[-1][1]
    presale_file_count = 0
    for file in args.sales:
        with ZipFile(file) as archive:
            for code, city in COUNTIES.items():
                name = f"{code}_lvr_land_b.csv"
                if name in archive.namelist():
                    presale_file_count += 1
                    records = rows(archive, name)
                    header = next(records)
                    next(records)
                    if header[27:31] != ["編號", "建案名稱", "棟及號", "解約情形"]:
                        raise ValueError(f"Changed presale fields: {name}")
                    for row in records:
                        if len(row) < 31:
                            continue
                        town = f"{city}/{clean(row[0])}"
                        key = code, row[27]
                        if town not in districts or key in presale_seen or not (sample := comparable_presale(row, presale_start, presale_end)):
                            continue
                        presale_seen.add(key)
                        name_key = clean(row[28])
                        presales[town].append((name_key, address_key(row[2], city, clean(row[0])), sample))
                name = f"{code}_lvr_land_a.csv"
                if name not in archive.namelist():
                    continue
                records = rows(archive, name)
                header = next(records)
                next(records)
                if header[14] != "建築完成年月" or header[27] != "編號":
                    raise ValueError(f"Changed sale fields: {name}")
                for row in records:
                    if len(row) < 28:
                        continue
                    town = f"{city}/{clean(row[0])}"
                    key = code, row[27]
                    if town not in districts or key in seen or not (sample := comparable(row, start, end)):
                        continue
                    seen.add(key)
                    sales[town].append(sample)
                    if town in shapes_by_district:
                        address = address_key(row[2], city, clean(row[0]))
                        if address:
                            transactions[town].append((address, sample))
    if not presale_file_count:
        raise ValueError("Missing MOI presale batch files")
    filings, located = {}, defaultdict(list)
    cutoff = years_before(args.as_of, 1)
    with ZipFile(args.filings) as archive:
        for code, city in COUNTIES.items():
            name = f"{code}_lvr_buildcase.csv"
            if name not in archive.namelist():
                continue
            for town in districts:
                if town.startswith(city + "/"):
                    districts[town]["registry"] = True
            records = rows(archive, name)
            next(records)
            if next(records)[8:14] != ["DECLAREDATE", "SELLINGPERIOD", "BUILDINGLANDS",
                                       "BUILDINGPERMITDATE", "BUILDINGPERMITNO", "FIRST REGISTRATION DATE"]:
                raise ValueError(f"Changed project fields: {name}")
            for row in records:
                if len(row) < 14 or not row[1].strip() or "住宅" not in row[6] and "住家" not in row[6]:
                    continue
                town = f"{city}/{clean(row[0])}"
                filed, registered = roc(row[8]), roc(row[13])
                recent = max(filter(None, (filed, registered)), default=date.min)
                if town not in districts or not cutoff <= recent <= args.as_of:
                    continue
                key = sha256(f"{town}|{clean(row[1])}|{clean(row[12] or row[10] or row[2])}".encode()).hexdigest()[:16]
                item = {"name": row[1].strip(), "address": row[2].strip(), "land": row[10].strip(),
                        "builder": row[3].strip(), "permit": row[12].strip(),
                        "selling_period": row[9].strip(),
                        "filed": filed.isoformat() if filed else None,
                        "registered": registered.isoformat() if registered else None}
                if key in filings and filings[key][1] >= recent:
                    continue
                filings[key] = town, recent, item
    for key, (town, _, item) in filings.items():
        districts[town]["filings"].append(key)
        if town in shapes_by_district:
            address = address_key(item["address"], *town.split("/"))
            if address:
                located[town].append((key, address))
    corrections = presale_name_corrections(filings)
    for town, records in presales.items():
        presales[town] = [(corrections.get((town, name, address), name), address, sample)
                          for name, address, sample in records]
    wanted = {town: {a for a, _ in transactions[town]} | {a for _, a in located[town]}
              | {a for _, a, _ in presales[town] if a}
              for town in shapes_by_district}
    points = address_positions(args.addresses, divisions, wanted)
    bases = presale_positions(SITE / "national-listings.json", args.as_of)
    areas = {key: {"filings": [], "price": None} for key in shapes}
    project_m = Transformer.from_crs(4326, 3826, always_xy=True).transform
    vicinity = {key: transform(project_m, shapes[key]).buffer(500) for key in ("a7", "a8", "a9")}
    area_sales, vicinity_sales = defaultdict(list), defaultdict(list)
    area_presales, vicinity_presales = defaultdict(list), defaultdict(list)
    for key in vicinity:
        areas[key]["nearby"] = []
    for town, ids in shapes_by_district.items():
        for name, address, sample in presales[town]:
            coordinates = bases.get((town, name)) or points.get((town, address))
            if coordinates:
                point = Point(*coordinates)
                for key in ids:
                    if shapes[key].covers(point):
                        area_presales[key].append((name, sample))
                    if key in vicinity and vicinity[key].covers(Point(*project_m(*coordinates))):
                        vicinity_presales[key].append((name, sample))
        for address, sample in transactions[town]:
            if coordinates := points.get((town, address)):
                point = Point(*coordinates)
                for key in ids:
                    if shapes[key].covers(point):
                        area_sales[key].append(sample)
                    if key in vicinity and vicinity[key].covers(Point(*project_m(*coordinates))):
                        vicinity_sales[key].append(sample)
        for project, address in located[town]:
            if coordinates := points.get((town, address)):
                point = Point(*coordinates)
                for key in ids:
                    if shapes[key].covers(point):
                        areas[key]["filings"].append(project)
                    elif key in vicinity and vicinity[key].covers(Point(*project_m(*coordinates))):
                        areas[key]["nearby"].append(project)
    for key in areas:
        areas[key]["price"] = stats(area_sales[key]) if area_sales[key] else None
        areas[key].update(presale_summary(area_presales[key]))
    for key in vicinity:
        areas[key]["nearby_price"] = stats(vicinity_sales[key])
        areas[key]["nearby_presale_price"] = stats([sample for _, sample in vicinity_presales[key]])
    for town, item in districts.items():
        item["filings"].sort(key=lambda key: filings[key][1], reverse=True)
        item["price"] = stats(sales[town])
        item.update(presale_summary([(name, sample) for name, _, sample in presales[town]]))
    for item in areas.values():
        item["filings"].sort(key=lambda key: filings[key][1], reverse=True)
    cities = {city: {
        "price": stats([sample for town, values in sales.items() if town.startswith(city + "/") for sample in values]),
        "presale_price": stats([sample for town, values in presales.items() if town.startswith(city + "/") for _, _, sample in values]),
    } for city in COUNTIES.values()}
    output = {
        "schema_version": 1, "checked_on": args.as_of.isoformat(), "filing_since": cutoff.isoformat(),
        "sale_period": {"from": start.isoformat(), "to": end.isoformat(),
                        "registration_from": spans[0][0].isoformat(), "registration_to": end.isoformat()},
        "presale_period": {"from": presale_start.isoformat(), "to": presale_end.isoformat()},
        "cities": cities,
        "national": {"price": stats([sample for values in sales.values() for sample in values]),
                     "presale_price": stats([sample for values in presales.values() for _, _, sample in values])},
        "districts": districts, "areas": areas, "filings": {k: row[2] for k, row in filings.items()},
    }
    args.output.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(districts)} districts, {len(filings)} filings, {len(seen)} comparable sales, "
          f"{len(presale_seen)} comparable presales, {len(points)} address matches")
    print({key: areas[key]["presale_price"] for key in vicinity})
    print({k: (len(v["filings"]), v["price"], len(v.get("nearby", [])), v.get("nearby_price"))
           for k, v in areas.items() if k in vicinity})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--filings", type=Path, required=True)
    parser.add_argument("--sales", type=Path, nargs="+", required=True)
    parser.add_argument("--addresses", type=Path, nargs="+", required=True)
    parser.add_argument("--as-of", type=date.fromisoformat, required=True)
    parser.add_argument("--output", type=Path, default=SITE / "national-market.json")
    build(parser.parse_args())
