"""Build the public rail reference from NLSC point exports and operator lists."""

import argparse
import io
import json
from pathlib import Path
import re
from zipfile import ZipFile

from pyproj import Transformer
import shapefile


SITE = Path(__file__).parent / "site"
SOURCES = {
    "TRA": "https://data.gov.tw/dataset/73226",
    "MRT": "https://data.gov.tw/dataset/73233",
    "HSR": "https://data.gov.tw/dataset/96938",
    "ANKENG": "https://www.ntmetro.com.tw/basic/?node=10137",
    "DANHAI": "https://www.ntmetro.com.tw/basic/?mode=detail&node=459",
    "KHLRT": "https://www.krtc.com.tw/KLRT/guide_map",
}
SUPPLEMENTS = {
    "HSR": "高鐵南港 高鐵台北 高鐵板橋 高鐵桃園 高鐵新竹 高鐵苗栗 高鐵台中 高鐵彰化 高鐵雲林 高鐵嘉義 高鐵台南 高鐵左營",
    "ANKENG": "雙城 玫瑰中國城 台北小城 耕莘安康院區 景文科大 安康 陽光運動公園 新和國小 十四張",
    "DANHAI": "紅樹林 竿蓁林 淡金鄧公 淡江大學 淡金北新 新市一路 淡水行政中心 濱海義山 濱海沙崙 淡海新市鎮 崁頂 台北海洋大學 沙崙 淡水漁人碼頭",
    "KHLRT": "籬仔內 凱旋瑞田 前鎮之星 凱旋中華 夢時代 經貿園區 軟體園區 高雄展覽館 旅運中心 光榮碼頭 真愛碼頭 駁二大義 駁二蓬萊 哈瑪星 壽山公園 文武聖殿 鼓山區公所 鼓山 馬卡道 台鐵美術館 內惟藝術中心 美術館 聯合醫院 龍華國小 愛河之心 新上國小 大順民族 灣仔內 高雄高工 樹德家商 科工館 聖功醫院 凱旋公園 衛生局 五權國小 凱旋武昌 凱旋二聖 輕軌機廠",
}
OSM_BOUNDS = {"HSR": (21.8, 26.0, 119.8, 122.1), "ANKENG": (24.93, 25.01, 121.48, 121.55),
              "DANHAI": (25.14, 25.23, 121.38, 121.48), "KHLRT": (22.57, 22.69, 120.25, 120.36)}


def station(name, lat, lon, source):
    if not (21 <= lat <= 27 and 118 <= lon <= 124):
        raise ValueError(f"Coordinate outside Taiwan reference: {name}")
    return {"name": name, "lat": round(lat, 6), "lon": round(lon, 6), "source": source}


def government(path, source):
    with ZipFile(path) as z:
        files = {Path(n).suffix.lower(): z.read(n) for n in z.namelist() if Path(n).suffix.lower() in {".shp", ".dbf"}}
    transform = Transformer.from_crs("EPSG:3826", "EPSG:4326", always_xy=True)
    with shapefile.Reader(shp=io.BytesIO(files[".shp"]), dbf=io.BytesIO(files[".dbf"]), encoding="utf-8") as reader:
        for item in reader.iterShapeRecords():
            name = item.record["MARKNAME1"].strip()
            if re.search(r"未通車|規劃|興建|施工|停用|廢站|遺址|林業|林鐵|纜車|機廠", name):
                continue
            if source == "TRA" and not re.match(r"^(?:臺鐵|台鐵|臺灣鐵路|台灣鐵路)", name):
                continue
            if source == "MRT" and not re.match(r"^(?:臺北|台北|臺中|台中|新北|高雄|桃園機場)捷運", name):
                continue
            if item.record["EPSGCode"].upper() != "EPSG:3826" or len(item.shape.points) != 1:
                raise ValueError("Unexpected NLSC point schema")
            lon, lat = transform.transform(*item.shape.points[0])
            name = re.sub(r"_[A-Za-z0-9]+$", "", name).replace("_出入口", "-出入口")
            yield station(name, lat, lon, source)


def name_key(name):
    return re.split(r"[（(]", name)[0].strip().replace("臺", "台").removesuffix("站")


def cross_match(station_row, places):
    raw = station_row["name"].replace("臺", "台")
    raw = re.sub(r"^(?:(?:台北|台中|新北|高雄|桃園機場)捷運|台鐵|台灣鐵路|捷運)", "", raw)
    key = re.split(r"[-－_]出入口", raw)[0].removesuffix("車站").removesuffix("站")
    for p in places:
        if p[6] == "rail" and abs(p[4] - station_row["lat"]) < .006 and abs(p[5] - station_row["lon"]) < .006:
            mapped = re.sub(r"^捷運", "", p[3].replace("臺", "台"))
            if key == re.split(r"[（(]", mapped)[0].strip().removesuffix("車站").removesuffix("站"):
                return True
    return False


def supplemental(places):
    for source, names in SUPPLEMENTS.items():
        south, north, west, east = OSM_BOUNDS[source]
        for name in names.split():
            key = name_key(name)
            points = [p for p in places if p[6] == "rail" and south <= p[4] <= north and west <= p[5] <= east and name_key(p[3]) == key]
            if points:
                anchor = points[0]
                # Refuse matching same-name locations farther than a station complex.
                if all(abs(p[4]-anchor[4]) < .003 and abs(p[5]-anchor[5]) < .003 for p in points):
                    yield station(name + "站", anchor[4], anchor[5], source)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("--checked", required=True)
    args = parser.parse_args()
    poi = json.loads((SITE / "taiwan-context/index.json").read_bytes())
    official = [*government(args.source_dir / "TRA.zip", "TRA"), *government(args.source_dir / "MRT.zip", "MRT")]
    rows = [p for p in official if cross_match(p, poi["places"])] + list(supplemental(poi["places"]))
    if sum(r["source"] == "TRA" for r in rows) < 150 or sum(r["source"] == "MRT" for r in rows) < 250:
        raise ValueError("Incomplete rail reference")
    dedup = {(p["name"], p["lat"], p["lon"]): p for p in rows}
    output = {"schema_version": 1, "checked_on": args.checked, "poi_date": poi["date"], "sources": SOURCES,
              "stations": sorted(dedup.values(), key=lambda r: (r["source"], r["name"], r["lat"], r["lon"]))}
    (SITE / "advantage-rail.json").write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(output['stations'])} source-matched rail station/entrance reference points")


if __name__ == "__main__":
    main()
