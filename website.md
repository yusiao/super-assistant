# 房市觀測室

## Scope and privacy

- Public read-only site at the existing GitHub Pages `a7-reports/` path.
- First version connects A7's five configured subareas. Taipei/New Taipei selectors show an explicit not-connected state, not zero supply.
- Region preferences and favorites live only in browser localStorage. No public LINE management endpoint, tokens, recipient IDs or scheduler state.
- `public_site.py` exports an allowlist. It omits stale projects, raw errors, logs, config and credentials, and strips community URL query strings.
- `noindex` is a search indexing request, not access control. Anyone with the URL can read public data.
- Completed projects are separate; without a verified completion date they are not described as properties completed within five years.

## Updates

`a7_leju_digest.py` exports `public-site/` alongside each generated report. The existing A7 workflow copies the four static assets and market-data.json to the published PDF directory. Its normal Saturday schedule and LINE policy are unchanged. The self-hosted runner must be online for fresh collection.

`a7-observatory.yml` publishes website asset changes on a GitHub-hosted runner, without scraping or sending LINE. It preserves the already-public JSON and PDF if available; otherwise it initializes an explicitly empty awaiting-first-update website. HTTP errors other than 404 abort rather than silently replacing a valid site.

The first website publication does not claim a fresh market scan. A failed data load clears the view instead of silently presenting cached data as current. Old data timestamps remain visible, with an extra warning after eight days.

## Files to synchronize

- `scripts/a7-line-monitor/site/`: index.html, style.css, app.js, robots.txt, road-map.js, road-map.css, redevelopment-areas.js, districts.geojson, life-boundaries.geojson, leaflet.js, leaflet.css, leaflet-LICENSE.txt, REDEVELOPMENT.md
- `scripts/a7-line-monitor/`: public_site.py, publish_site.py, test_public_site.py, test_site_ui.cjs, website.md, a7_leju_digest.py
- `.github/workflows/`: a7-line-digest.yml, a7-observatory.yml

Upload the website assets and Python modules before the workflow files. Do not upload `.env`, state.json, delivery ledgers, local previews, tests' temporary output, or `.venv`.

## Verification

Run from repository root:

```powershell
scripts/a7-line-monitor/.venv/Scripts/python.exe -m unittest discover -s scripts/a7-line-monitor -p "test_*.py"
node scripts/a7-line-monitor/test_site_ui.cjs
node scripts/a7-line-monitor/test_road_map.cjs
node --check scripts/a7-line-monitor/site/app.js
```

2026-10-25: Desktop browser preview and no-data/unsupported-region views checked. Full mobile visual verification and GitHub publication were interrupted by browser access review/usage limits. Do not report this website as deployed until the workflow and public URL are verified.

## Nationwide map

The bundled map contains 22 cities/counties and 368 districts/townships, independently of market data coverage. Selecting a shape or district button updates the filters, and filters update the map. All-Taiwan overview and city fitting are provided; keyboard Enter/Space activate shapes. A7 subareas remain separate from administrative boundaries.

Source: https://maps.nlsc.gov.tw/pro/download.jsp, official archive https://maps.nlsc.gov.tw/download/鄉鎮市區界線(TWD97經緯度).zip, retrieved 2026-10-25. Archive layer TOWN_MOI_1120317, government open data license version 1. Not represented as a new 2026 boundary survey. Simplified geometries are for selection, not legal/cadastral use. Remote Dongsha/Nansha polygon parts are excluded from the fitted overview; their parent district is still selectable.

To regenerate, install pyshp in a development environment only, then run `python scripts/a7-line-monitor/build_boundary_map.py path/to/official.zip --all`. Runtime and GitHub publication do not need pyshp or live map services. The third-party mirror inspected during development had corrupted names and was not used.
# Road map update (2026-10-26)

Active map assets are `road-map.js`, `road-map.css`, bundled `leaflet.js`,
`leaflet.css`, `leaflet-LICENSE.txt`, `districts.geojson`, and
`life-boundaries.geojson`. Upload these with index.html and public_site.py.
Legacy map.js/map.css are no longer referenced by the active page.
Include redevelopment-areas.js when uploading: it supplies the selectable
redevelopment and established-area catalog, including the shared Xinzhuang /
Taishan Wenzizun record and the related Shilin science-park entry.

2026-10-26 update: map, UI and public export regression tests pass locally.
The latest preview could not be visually rechecked because the local preview
server was unreachable. GitHub access review remains unresolved; a local update
archive is not evidence of upload or deployment. The map update archive excludes
workflow and scheduler changes and requires the existing website publishing setup.

Road tiles load only after the visitor clicks the OSM opt-in button. No bulk
prefetch or offline tile download. Keep visible OSM attribution and browser
cache behavior. Global CSP remains strict and global referrer policy remains
no-referrer; only OSM tile images send origin via their explicit policy.

The life-area GeoJSON is intentionally empty until boundaries are verified.
Each feature must have city, district, name, verification=verified, checked_at,
source_url (HTTPS), and a closed Polygon/MultiPolygon geometry. Verification
requires human/source review; the schema flag alone is not evidence of accuracy.
Administrative boundaries must never be relabeled as life-area boundaries.
Run `node scripts/a7-line-monitor/test_road_map.cjs` for current map tests.

