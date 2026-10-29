# Redevelopment map entries

The catalog in redevelopment-areas.js is independent of live property data.
The catalog now contains 48 entries beyond A7 across 26 districts. A7 adds
one district, with its existing five child areas. Sources are linked on every
entry. Development methods are retained: land readjustment,
zone expropriation, and special planning districts must not all be presented
as new residential projects.

Coordinates are approximate navigation anchors only. They are not surveyed
centroids, boundaries, building coordinates, or evidence of projects for sale.
Qingpu is shared by Zhongli and Dayuan; its label uses the same anchor.
No polygon is generated from these points. Only independently verified
geometry belongs in life-boundaries.geojson.

The catalog is not exhaustive, even within the four northern cities. The UI
lists all 61 northern districts with partial/pending status rather than
claiming that absent records mean no development exists. Adding
an entry does not enable crawling, LINE notifications, or property filtering
for that area. UI details explicitly distinguish this from zero supply.

Validation: node scripts/a7-line-monitor/test_road_map.cjs

## Classification Review

- Shilin: all seven official subdistrict names from the district household
  registration office, separately from the Shilin Residence north-side
  expropriation area and Shezidao development plan.
- Xindian: station life areas and Anmin/Ande from the land department's 2021
  report; use its geographic vocabulary, not its old prices. Dapinglin land
  readjustment is a distinct 2.99 ha historical project around Zhongzheng
  Elementary School, not the Dapinglin station life area. Yangbei and
  Shisizhang B are distinct development records.
- New Taipei: supplemented from land-office development directories for
  Linkou, Danhai, Beida, Fengming, Zhouziyang, Wenzizun, and Tucheng plans.
- Taoyuan: distinguish private Xiaokuixi/Puzi from older public Xiaokuixi;
  include Bade expansion, Dazhu, Caoluo, A10, A20, A21.
- Keelung: use the completed-project directory for phases 1, 2, 4, 5, 7
  and private Wuling. Phase 3 detail retrieval failed and remains pending;
  do not infer its position from the project name.

All positionAccuracy fields remain approximate-navigation. checkedAt is
the name/classification review date, not source publication date, current
construction status, or precision geocoding verification. No polygons or
live property feeds were added. Official subdistricts, commercial life
areas, and development plans overlap and must not be summed as land area.
