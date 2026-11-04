"""Offline atlas compiler; requires numpy, Pillow and shapely (not needed in CI).

Inputs: extracted Geofabrik OSM ways and AWS Terrarium tile 11/1714/876.
All outlined regions are observations, NOT cadastral/legal boundaries.
"""
import argparse
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image
from shapely.geometry import LineString, Point, Polygon, box, mapping
from shapely.ops import polygonize, unary_union

SITE = Path(__file__).parent / "site"
PLAN = "https://urplanning.tycg.gov.tw/tycgfiles/Plans/Final/PF000002000901.pdf"
SHOP = "https://edb.tycg.gov.tw/News_Content.aspx?Create=1&n=3787&s=546251"
MALL = "https://www.mitsui-shopping-park.com.tw/mop/linkou/tw/index.html"

# Hand-traced outline of page 7 at 743 x 1050 px; explicitly approximate.
# Three independent landmarks convert the published plan to geographic space.
CONTROLS = [
    ([394, 344], [121.3896166, 25.0478866]),
    ([431, 198], [121.3912219, 25.0533112]),
    ([404, 393], [121.3901361, 25.0459299]),
    ([451, 359], [121.3920854, 25.0472873]),
]
OUTLINE = [
    [219,95],[244,115],[277,149],[316,147],[324,160],[309,164],
    [312,179],[297,197],[291,205],[266,217],[251,222],[258,230],
    [299,237],[327,230],[338,225],[358,218],[382,207],[387,217],
    [411,215],[428,198],[446,188],[459,191],[471,189],[494,208],
    [497,226],[481,232],[484,242],[508,246],[516,243],[523,248],
    [532,267],[538,287],[557,300],[555,307],[529,303],[518,297],
    [508,283],[494,283],[493,294],[498,307],[495,319],[505,332],
    [498,348],[484,359],[498,363],[521,355],[532,357],[532,368],
    [560,373],[558,388],[569,401],[586,392],[598,394],[609,404],
    [623,409],[640,423],[627,430],[608,435],[591,431],[580,434],
    [577,443],[552,434],[528,419],[541,402],[526,389],[484,374],
    [484,417],[478,428],[451,433],[447,446],[419,455],[410,450],
    [407,426],[399,410],[390,410],[387,428],[372,436],[340,455],
    [333,451],[331,434],[323,410],[313,400],[304,400],[302,432],
    [300,457],[307,476],[315,486],[303,491],[302,499],[320,515],
    [339,524],[347,507],[354,491],[367,491],[385,502],[406,520],
    [397,534],[405,548],[423,554],[439,541],[460,532],[471,526],
    [493,529],[510,533],[511,546],[503,562],[501,580],[503,601],
    [484,607],[474,607],[462,596],[461,584],[444,582],[434,579],
    [430,584],[435,593],[417,600],[400,594],[384,596],[366,599],
    [358,597],[351,601],[341,588],[333,586],[333,579],[320,576],
    [310,591],[299,605],[295,625],[290,630],[284,628],[284,591],
    [269,590],[260,567],[249,536],[249,383],[227,374],[210,362],
    [198,353],[188,358],[175,374],[157,394],[142,408],[131,404],
    [115,391],[143,364],[168,341],[195,317],[217,290],[226,275],
    [219,263],[210,255],[206,236],[224,242],[240,233],[247,224],
    [232,205],[221,189],[230,173],[225,154],[219,95],
]


def compile_atlas(ways_path, dem_path, checked):
    ways = json.loads(Path(ways_path).read_text(encoding="utf-8"))
    features = []
    lines = {k: LineString(c) for k, (p, c) in ways.items()
             if p.get("highway") in ("primary", "secondary", "tertiary",
                                     "residential", "unclassified") and len(c) > 1}
    blocks = list(polygonize(unary_union(list(lines.values()))))

    def osm_polygon(key):
        return Polygon(ways[str(key)][1])

    def at(lon, lat):
        return min((p for p in blocks if p.covers(Point(lon, lat))), key=lambda p: p.area)

    def roads_polygon(names):
        ls = [g for k, g in lines.items() if ways[k][0]["name"] in names]
        return max(polygonize(unary_union(ls)), key=lambda p: p.area)

    def feature(id_, name, geometry, parent, kind, note, url, osm_ids=()):
        if not geometry.is_valid or geometry.is_empty:
            raise ValueError(f"Invalid polygon: {id_}")
        center = geometry.representative_point()
        road_names = sorted({ways[k][0]["name"] for k, line in lines.items()
                             if geometry.boundary.intersection(line).length > .0002})
        features.append({
            "type": "Feature",
            "properties": {
                "id": id_, "name": name, "parent": parent, "kind": kind,
                "note": note, "source_url": url, "checked_at": checked,
                "verification": "estimated", "roads": road_names,
                "label": [center.y, center.x], "osm_ids": list(osm_ids),
            },
            "geometry": mapping(geometry),
        })
        return geometry

    controls = np.array([[*p, 1] for p, _ in CONTROLS])
    transform = np.linalg.lstsq(controls, np.array([q for _, q in CONTROLS]), rcond=None)[0]
    a7 = Polygon(np.c_[OUTLINE, np.ones(len(OUTLINE))] @ transform)
    feature("a7", "A7 開發區", a7, "", "計畫圖轉繪・近似範圍",
            "依 2021 年市府計畫書第 7 頁轉繪與地標對位，非測量成果或最新法定界址；地籍與個別土地請查市府。", PLAN)
    feature("a7-post", "郵政物流園區", osm_polygon(442135827), "a7", "園區範圍",
            "為物流園區本體，不等於房仲所稱整個郵政特區或商圈。", PLAN, [442135827])
    ids = [442137903,442137904,442137905,442137906,442137907,442137909,442137910,442137911]
    feature("a7-centre", "中心商業區街廓", unary_union([osm_polygon(k) for k in ids]),
            "a7", "商業街廓", "依 OSM 中心商業區街廓製圖，分散的街廓會分別描邊，不以凸包填滿中間土地。", PLAN, ids)
    feature("a7-school", "文青國中小", osm_polygon(1310794583), "a7", "學校範圍",
            "僅為校地範圍，不能解讀為學區或整個文青生活圈。", PLAN, [1310794583])
    # The city's four named roads do not close topologically in OSM.
    # Use existing enclosed blocks, rather than inventing a closing segment.
    a8_blocks = [at(*p) for p in [
        (121.3671397,25.0614623),(121.3700457,25.0571758),
        (121.3684119,25.0564567),(121.3699894,25.0598647),
        (121.3678204,25.0589513),(121.368747,25.0585911),
    ]]
    feature("a8", "A8 長庚生活圈", unary_union(a8_blocks), "", "道路街廓觀察範圍",
            "涵蓋長庚及文昌周邊已閉合街廓；市府商圈四至與現況路網不完全閉合，因此不是官方商圈完整界線，也不是法定重劃區。", SHOP)
    feature("a8-fuxing", "復興一路商業街廓", unary_union(a8_blocks[3:]), "a8", "商業街廓",
            "復興一路南側沿街街廓，範圍沿實際道路，不代表全部 A8 商圈。", SHOP)
    feature("a8-wenchang", "文昌街廓", unary_union(a8_blocks[1:3]), "a8", "生活街廓",
            "文昌一街、三街、五街附近街廓，非官方學區或行政區。", SHOP)
    a9 = roads_polygon(["八德路","文化北路一段","文化一路一段","仁愛路二段"])
    feature("a9", "A9 林口站生活圈", a9, "", "道路街廓觀察範圍",
            "本站依八德路、文化北路一段、仁愛路二段、文化一路一段圈選的觀察區，不是整個林口新市鎮或法定重劃區。", MALL)
    feature("a9-mitsui", "三井周邊商業街廓",
            roads_polygon(["文化三路一段","文化二路一段","八德路","忠孝路"]),
            "a9", "商業街廓", "三井一、二館周邊道路圍合區，供比較位置；不是官方商圈界線。", MALL)
    for key, name, oid in [("a9-mall1","三井 OUTLET 一館",364304008),
                           ("a9-mall2","三井 OUTLET 二館",829516898)]:
        feature(key, name, osm_polygon(oid), "a9-mitsui", "商場基地",
                "商場基地範圍，不等於周邊商圈，也不是新建案。", MALL, [oid])
    roads = []
    clip = box(121.35,25.033,121.405,25.083)
    for key, line in lines.items():
        p = ways[key][0]
        g = line.intersection(clip).simplify(.000007)
        if g.is_empty or g.geom_type not in ("LineString","MultiLineString"):
            continue
        roads.append({"type":"Feature","properties":{"name":p["name"],"class":p["highway"],"osm_id":key},"geometry":mapping(g)})
    result = {"type":"FeatureCollection","features":features,
              "roads":{"type":"FeatureCollection","features":roads},
              "terrain_bounds":[[math.degrees(math.atan(math.sinh(math.pi*(1-2*877/2048)))),121.2890625],
                                [math.degrees(math.atan(math.sinh(math.pi*(1-2*876/2048)))),121.46484375]],
              "checked_at":checked,"license":"OSM derived geometry: ODbL 1.0",
              "terrain_source":"https://registry.opendata.aws/terrain-tiles/"}
    (SITE/"station-atlas.geojson").write_text(json.dumps(result,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    rgb=np.asarray(Image.open(dem_path).convert("RGB"),dtype=float)
    elevation=rgb[:,:,0]*256+rgb[:,:,1]+rgb[:,:,2]/256-32768
    dy,dx=np.gradient(elevation,70)
    shade=np.clip((.7-dx*.8+dy*.65),.3,1.1)
    low=np.array([235,238,215]);high=np.array([145,169,129])
    t=np.clip(elevation/550,0,1)[...,None]
    colors=(low*(1-t)+high*t)*(.77+.30*shade[...,None])
    Image.fromarray(np.uint8(np.clip(colors,0,255))).resize((1024,1024),Image.Resampling.BICUBIC).save(SITE/"station-terrain.webp")
    print(f"Compiled {len(features)} outlined areas, {len(roads)} road segments.")


if __name__ == "__main__":
    p=argparse.ArgumentParser()
    p.add_argument("ways")
    p.add_argument("dem")
    p.add_argument("--checked",required=True)
    a=p.parse_args()
    compile_atlas(a.ways,a.dem,a.checked)
