"""Offline build: python build_development_boundaries.py ZEPN.zip YYYY-MM-DD

Build dependencies only: pyshp, pyproj, shapely. The weekly runner uses the
checked-in GeoJSON, not these packages or the government's download service.
"""
import argparse
from datetime import date
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile

import shapefile
from pyproj import CRS, Transformer
from shapely.geometry import mapping, shape
from shapely.ops import transform

SITE = Path(__file__).with_name("site")
SOURCE = "https://data.taipei/dataset/detail?id=1ab43adf-5f81-4601-84af-47a39f267b93"


def build(archive, checked_at):
    districts = json.loads((SITE / "districts.geojson").read_text(encoding="utf-8"))
    local = [(f["properties"]["district"], shape(f["geometry"])) for f in districts["features"]
             if f["properties"]["city"] == "臺北市"]
    features = []
    with ZipFile(archive) as z:
        read = lambda ext: z.read("ZEPN/ZEPN." + ext)
        project = Transformer.from_crs(CRS.from_wkt(read("prj").decode()), "EPSG:4326", always_xy=True)
        reader = shapefile.Reader(shp=BytesIO(read("shp")), shx=BytesIO(read("shx")),
                                  dbf=BytesIO(read("dbf")), encoding="utf8")
        for record in reader.iterShapeRecords():
            geom = transform(project.transform, shape(record.shape.__geo_interface__))
            if geom.is_empty or not geom.is_valid:
                raise ValueError(f"Invalid government geometry: {record.record[0]}")
            # Districts are navigation filters, not cuts to the official geometry.
            overlaps = sorted(((geom.intersection(d).area / geom.area, name) for name, d in local), reverse=True)
            ds = [name for ratio, name in overlaps if ratio >= .01]
            if not ds:
                raise ValueError("No matching Taipei district")
            name = record.record["開發案"]
            props = dict(name=name, city="臺北市", district=ds[0], districts=ds,
                         boundary_kind="區段徵收範圍", checked_at=checked_at, verification="verified",
                         source_url=SOURCE, source_agency="臺北市政府地政局")
            if name == "北投士林科技園區":
                props.update(catalog_id="beitou-shilin", navigation_districts=["北投區", "士林區"])
            features.append(dict(type="Feature", properties=props, geometry=mapping(geom)))
    return dict(type="FeatureCollection", features=features)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip")
    parser.add_argument("checked_at", type=date.fromisoformat)
    args = parser.parse_args()
    result = build(args.zip, args.checked_at.isoformat())
    (SITE / "life-boundaries.geojson").write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Exported {len(result['features'])} official project boundaries")
