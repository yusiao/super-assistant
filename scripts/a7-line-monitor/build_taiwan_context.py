"""Build bundled ODbL road and landmark layers from a Geofabrik Taiwan extract."""

import argparse
from collections import defaultdict
import json
import math
from pathlib import Path
import re

import osmium
from shapely import set_precision
from shapely.geometry import LineString, Polygon, mapping
from shapely.wkb import loads


WEST, SOUTH, EAST, NORTH = 118.0, 21.8, 122.3, 26.5
GRID = 4
ROAD = {"motorway": 0, "trunk": 1, "primary": 2, "secondary": 3,
        "tertiary": 4, "residential": 5, "unclassified": 5, "living_street": 5}
VERIFIED_MALLS = {"w364304008": "林口三井 OUTLET 一館", "w829516898": "林口三井 OUTLET 二館"}


def eligible(lat, lon):
    return SOUTH <= lat <= NORTH and WEST <= lon <= EAST


def title(tags):
    return (tags.get("name:zh-Hant") or tags.get("name:zh") or tags.get("name") or "").strip()[:90]


def landmark(tags, name, area):
    if not name or any(key.startswith(("disused:", "abandoned:", "proposed:", "construction:")) for key in tags):
        return None
    if any(tags.get(key) == "yes" for key in ("disused", "abandoned", "demolished")) or any(
        tags.get(key) not in (None, "no") for key in ("construction", "proposed")
    ):
        return None
    rail, amenity, shop = tags.get("railway"), tags.get("amenity"), tags.get("shop")
    if tags.get("aeroway") == "aerodrome" and tags.get("iata"):
        return "transport", 0, "airport"
    station_building = tags.get("building") == "train_station" and re.search(r"站$|Station$", name, re.I)
    if rail in {"station", "halt"} or station_building or (tags.get("public_transport") == "station" and
            any(tags.get(key) == "yes" for key in ("train", "subway", "light_rail"))):
        operator = tags.get("operator", "") + tags.get("network", "")
        fast = "高鐵" in operator or "高鐵" in name or "THSR" in operator
        return "transport", 0 if fast else 1, "rail"
    if amenity == "hospital":
        if area >= 5000 or re.search(r"醫學中心|醫院|分院|醫療中心|Hospital", name, re.I):
            return "medical", 1, "hospital"
    if (amenity in {"university", "college"} or tags.get("landuse") == "education" and area >= 8500) and re.search(r"大學|專科學校|University", name, re.I) and "幼兒園" not in name:
        return "education", 1, "campus"
    if amenity == "school" and area >= 8500 and re.search(r"國小|國中|高中|高工|高商|中學|小學|實驗學校", name):
        return "education", 3, "school"
    branded = re.search(r"好市多|Costco|IKEA|宜家家居", name, re.I)
    mall_name = re.search(r"購物中心|購物廣場|OUTLET|百貨公司|SOGO|遠百|新光三越|大葉高島屋|漢神|誠品生活|夢時代|Shopping Center", name, re.I)
    if ((shop in {"mall", "department_store"} or tags.get("landuse") == "retail") and
            (area >= 5000 or mall_name) and not re.search(r"小北百貨|寶雅|POYA|公有市場|文具", name, re.I)) or (
            branded and (shop in {"wholesale", "supermarket", "furniture"} or tags.get("landuse") == "retail")):
        return "retail", 1, "mall"
    if (tags.get("landuse") in {"industrial", "commercial"} or tags.get("office") in {"company", "government"}) and re.search(
            r"科學園區|科技園區|產業園區|科技產業園區|工業區|物流園區|軟體園區", name):
        if area >= 15000 or name.endswith(("園區", "工業區")):
            return "jobs", 0 if "科學園區" in name else 1, "park"
    if tags.get("leisure") == "park" and area >= 30000:
        return "leisure", 2, "green"
    if tags.get("leisure") == "stadium" or (tags.get("tourism") in {"museum", "zoo", "theme_park"} and area >= 12000):
        return "leisure", 2, "civic"
    if tags.get("tourism") in {"attraction", "museum"} and re.search(r"台北101|臺北101|故宮博物院|自由廣場|高雄85大樓", name.replace(" ", "")):
        return "leisure", 0, "civic"
    return None


def road_name(tags):
    return title(tags) or tags.get("ref", "")[:30]


def compact_points(line, tolerance):
    return [[round(y, 5), round(x, 5)] for x, y in line.simplify(tolerance).coords]


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def rounded_coordinates(value):
    return [rounded_coordinates(v) for v in value] if isinstance(value, (list, tuple)) else round(value, 6)


class Extract(osmium.SimpleHandler):
    def __init__(self, footprints_only=False):
        super().__init__()
        self.footprints_only = footprints_only
        self.main = []
        self.tiles = defaultdict(list)
        self.places = []
        self.footprints = {}
        self.factory = osmium.geom.WKBFactory()

    def point(self, osm_id, tags, lat, lon, area=0):
        verified = VERIFIED_MALLS.get(osm_id)
        name = verified or title(tags)
        result = ("retail", 1, "mall") if verified else landmark(tags, name, area)
        if result and eligible(lat, lon):
            category, priority, kind = result
            row = [osm_id, category, priority, name, round(lat, 5), round(lon, 5), kind, round(area)]
            self.places.append(row)
            return row

    def node(self, node):
        if not self.footprints_only and node.tags.get("name") and node.location.valid():
            self.point(f"n{node.id}", dict(node.tags), node.location.lat, node.location.lon)

    def shape(self, osm_id, tags, shape):
        if shape.is_empty or shape.area <= 0:
            return
        point = shape.representative_point()
        area = shape.area * 111320**2 * math.cos(math.radians(point.y))
        row = self.point(osm_id, tags, point.y, point.x, area)
        if row and area >= 100 and shape.is_valid:
            compact = set_precision(shape.simplify(.000012, preserve_topology=True), .000001)
            if not compact.is_empty and compact.geom_type in ("Polygon", "MultiPolygon"):
                self.footprints[osm_id] = row, compact

    def area(self, area):
        if area.from_way() or not area.tags.get("name"):
            return
        tags = dict(area.tags)
        if not any(k in tags for k in ("amenity", "shop", "landuse", "leisure", "aeroway", "tourism", "railway", "building", "public_transport")):
            return
        try:
            geometry = loads(self.factory.create_multipolygon(area), hex=True)
        except (RuntimeError, ValueError):
            return
        self.shape(f"r{area.orig_id()}", tags, geometry)

    def way(self, way):
        tags = dict(way.tags)
        highway = tags.get("highway", "")
        tier = ROAD.get(highway.removesuffix("_link"))
        if tier is None and tags.get("waterway") == "river":
            tier = 6
        name = road_name(tags)
        polygon = title(tags) and (len(way.nodes) > 3 and way.nodes[0].ref == way.nodes[-1].ref)
        candidate = polygon and any(k in tags for k in ("amenity", "shop", "landuse", "leisure", "aeroway", "tourism", "railway", "office", "building", "public_transport"))
        if self.footprints_only and not candidate:
            return
        if not candidate and (tier is None or tier == 5 and not name):
            return
        coords = [(n.lon, n.lat) for n in way.nodes if n.location.valid()]
        if len(coords) < 2 or not any(eligible(y, x) for x, y in coords):
            return
        if candidate and len(coords) >= 4:
            self.shape(f"w{way.id}", tags, Polygon(coords))
        if self.footprints_only or tier is None or tier == 5 and not name:
            return
        line = LineString(coords)
        if line.length == 0:
            return
        if tier <= 2:
            self.main.append([tier, name, compact_points(line, .00018)])
            return
        x0, y0, x1, y1 = line.bounds
        row = [way.id, tier, name, compact_points(line, .000045 if tier != 5 else .000025)]
        for x in range(math.floor(max(x0, WEST) * GRID), math.floor(min(x1, EAST) * GRID) + 1):
            for y in range(math.floor(max(y0, SOUTH) * GRID), math.floor(min(y1, NORTH) * GRID) + 1):
                self.tiles[f"{x}-{y}"].append(row)

    def distinct_places(self):
        known = defaultdict(list)
        for row in sorted(self.places, key=lambda r: (r[2], -r[7], r[0])):
            identity = (row[1], re.sub(r"\s+", "", row[3]).replace("台", "臺").removesuffix("站"))
            if any(abs(row[4] - p[4]) < .003 and abs(row[5] - p[5]) < .003 for p in known[identity]):
                continue
            known[identity].append(row)
            yield row[:7]

    def outline_features(self):
        known = defaultdict(list)
        for row, geometry in sorted(self.footprints.values(), key=lambda item: (-item[0][7], item[0][0])):
            osm_id, category, priority, name, lat, lon, kind, square_m = row
            key = (category, re.sub(r"\s+", "", name).replace("台", "臺").removesuffix("站"))
            if any(g.intersects(geometry) and g.intersection(geometry).area >= .9 * geometry.area for g in known[key]):
                continue
            known[key].append(geometry)
            geojson = mapping(geometry)
            geojson["coordinates"] = rounded_coordinates(geojson["coordinates"])
            yield {"type": "Feature", "id": osm_id,
                   "properties": {"category": category, "priority": priority, "name": name,
                                  "kind": kind, "area_m2": square_m, "point": [lat, lon]},
                   "bbox": [round(v, 6) for v in geometry.bounds], "geometry": geojson}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).parent / "site" / "taiwan-context")
    parser.add_argument("--footprints-only", action="store_true")
    args = parser.parse_args()
    with osmium.io.Reader(str(args.source)) as reader:
        stamp = reader.header().get("osmosis_replication_timestamp")
    if not stamp:
        raise ValueError("OSM extract needs a replication timestamp")
    extract = Extract(args.footprints_only)
    print(f"Extracting roads and landmarks from OSM {stamp}", flush=True)
    keys = ("name",) if args.footprints_only else ("highway", "waterway", "name")
    extract.apply_file(str(args.source), locations=True, idx="flex_mem", filters=[osmium.filter.KeyFilter(*keys)])
    features = list(extract.outline_features())
    if not features:
        raise ValueError("Landmark footprints missing")
    args.output.mkdir(parents=True, exist_ok=True)
    write_json(args.output / "landmark-areas.geojson", {"type": "FeatureCollection", "date": stamp[:10], "features": features})
    print(f"{len(features)} polygon landmark footprints", flush=True)
    if args.footprints_only:
        return
    places = list(extract.distinct_places())
    if not extract.main or not extract.tiles or not places:
        raise ValueError("Road or landmark data missing")
    write_json(args.output / "index.json", {"version": 1, "date": stamp[:10], "grid": GRID,
                                           "tiles": sorted(extract.tiles), "places": places})
    write_json(args.output / "main.json", [r for r in extract.main if r[0] < 2])
    write_json(args.output / "primary.json", [r for r in extract.main if r[0] == 2])
    for key, roads in sorted(extract.tiles.items()):
        write_json(args.output / f"roads-{key}.json", roads)
    print(f"OSM {stamp}: {len(extract.main)} major ways, {len(extract.tiles)} road tiles, {len(places)} landmarks")


if __name__ == "__main__":
    main()
