# Fresh multi-source project collection

The weekly report and public website discover projects from current public
Housefun district lists and the Isanlin sales index. `project-sources.json`
contains source indexes and geographic filters, not a project watchlist.
Official transaction downloads remain independent of listing sources.

## Classification

- Require an explicit presale type. A price marked pending is not a pending launch.
- Pending launches require an explicit not-yet-selling statement.
- Active or sold-out presales require a future estimated completion date.
- Completion, an occupancy permit, conflicting stages, or an expired completion
  estimate prevents automatic inclusion as an active/pending presale.
- Use the project base address, never the reception office, to check geography.
- Existing identity mappings only assign newly discovered projects to subareas.
  They never supply fallback listings. Unmapped A7 projects appear separately.
- Index publication is not proof of remaining stock. Read time is not source
  update time. All coverage is partial, even when all configured sources work.

## Access and delivery

Leju automation is disabled by default. Enable `LEJU_SOURCE_ENABLED=true` only
after obtaining applicable source permission. The existing rate-limit and
challenge circuit breaker still applies. No proxy/challenge bypass is added.
Other sources also use bounded fetching and stop on access restrictions.

The public JSON exports allowlisted project fields and sanitized project URLs,
never credentials, request headers, delivery state or error traces.
LINE timing and delivery ledger are unchanged. Verification runs should use
`--force-generate --weekly-preview --dry-run --skip-line`.

## Tests

Run `python -m unittest discover -s scripts/a7-line-monitor -p "test_*.py"`,
`node scripts/a7-line-monitor/test_site_ui.cjs`, and
`node scripts/a7-line-monitor/test_road_map.cjs`.
