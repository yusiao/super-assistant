"""Build-time only: extract named corridor ways from a Geofabrik Taiwan PBF."""
import json
import sys

import osmium


def extract(source, destination):
    ways = {}
    for way in osmium.FileProcessor(source).with_locations().with_filter(
        osmium.filter.EntityFilter(osmium.osm.WAY)
    ).with_filter(osmium.filter.KeyFilter("name")):
        if not len(way.nodes) or not way.nodes[0].location.valid():
            continue
        loc = way.nodes[0].location
        if not (121.335 < loc.lon < 121.415 and 25.020 < loc.lat < 25.1):
            continue
        ways[way.id] = [dict(way.tags), [
            [n.lon, n.lat] for n in way.nodes if n.location.valid()
        ]]
    with open(destination, "w", encoding="utf-8") as f:
        json.dump(ways, f, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    extract(*sys.argv[1:])
