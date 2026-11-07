"""Render a same-origin relief image from public Mapzen Terrarium tiles."""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from io import BytesIO
import json
import math
from pathlib import Path
from urllib.request import Request, urlopen

import numpy as np
from PIL import Image


TILE_SIZE = 256
ZOOM = 10
WORLD = TILE_SIZE * 2**ZOOM
BOUNDS = ((21.8, 118.0), (26.5, 122.3))
URL = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png"


def pixel(lat, lon):
    return (
        (lon + 180) / 360 * WORLD,
        (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * WORLD,
    )


def latlon(x, y):
    return [math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / WORLD)))),
            x / WORLD * 360 - 180]


def read_tile(x, y, cache):
    path = cache / f"{ZOOM}-{x}-{y}.png"
    if path.exists():
        raw = path.read_bytes()
    else:
        request = Request(URL.format(z=ZOOM, x=x, y=y), headers={"User-Agent": "JarvisTerrainBuilder/1.0"})
        with urlopen(request, timeout=25) as response:
            raw = response.read(512 * 1024)
    with Image.open(BytesIO(raw)) as tile:
        if tile.format != "PNG" or tile.size != (TILE_SIZE, TILE_SIZE):
            raise ValueError(f"Unexpected Terrarium tile: {ZOOM}/{x}/{y}")
        rgb = np.asarray(tile.convert("RGB"), dtype=np.float32)
    if not path.exists():
        path.write_bytes(raw)
    return rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768


def relief(elevation, row):
    latitudes = np.radians([latlon(0, row + y + .5)[0] for y in range(elevation.shape[0])])
    sample_m = (2 * math.pi * 6378137 / WORLD * np.cos(latitudes))[:, None]
    south, east = np.gradient(elevation)
    south /= sample_m
    east /= sample_m
    light = (.7071 + .5 * east + .5 * south) / np.sqrt(1 + east**2 + south**2)
    shade = np.clip(.65 + .5 * light, .65, 1.13)
    stops = [0, 120, 450, 1000, 2000, 3000, 3952]
    palette = np.array([[239, 241, 221], [223, 233, 198], [196, 215, 174],
                        [163, 190, 147], [138, 166, 133], [177, 174, 143], [226, 218, 195]])
    colors = np.empty((*elevation.shape, 3), dtype=np.uint8)
    for channel in range(3):
        colors[..., channel] = np.clip(np.interp(elevation, stops, palette[:, channel]) * shade, 0, 255)
    colors[elevation < 0] = [226, 237, 237]
    return Image.fromarray(colors)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).parent / "site")
    parser.add_argument("--checked", type=date.fromisoformat, required=True)
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    args.output.mkdir(parents=True, exist_ok=True)
    (south, west), (north, east) = BOUNDS
    left, top = map(math.floor, pixel(north, west))
    right, bottom = map(math.ceil, pixel(south, east))
    # The one-pixel margin keeps gradients correct at the cropped edges.
    tx0, ty0 = (left - 1) // TILE_SIZE, (top - 1) // TILE_SIZE
    tx1, ty1 = right // TILE_SIZE, bottom // TILE_SIZE
    mosaic = np.empty(((ty1 - ty0 + 1) * TILE_SIZE, (tx1 - tx0 + 1) * TILE_SIZE), dtype=np.float32)
    coordinates = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
    print(f"Reading {len(coordinates)} tiles at zoom {ZOOM}", flush=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(read_tile, x, y, args.cache) for x, y in coordinates]
        for index, ((x, y), future) in enumerate(zip(coordinates, futures), start=1):
            col, row = (x - tx0) * TILE_SIZE, (y - ty0) * TILE_SIZE
            mosaic[row:row + TILE_SIZE, col:col + TILE_SIZE] = future.result()
            if index % 40 == 0 or index == len(coordinates):
                print(f"{index}/{len(coordinates)} tiles ready", flush=True)
    x0, y0 = tx0 * TILE_SIZE, ty0 * TILE_SIZE
    cropped = mosaic[top - y0 - 1:bottom - y0 + 1, left - x0 - 1:right - x0 + 1]
    width, height = right - left, bottom - top
    relief(cropped, top - 1).crop((1, 1, width + 1, height + 1)).save(
        args.output / "taiwan-terrain.webp", quality=84, method=6,
    )
    metadata = {
        "version": 1,
        "projection": "EPSG:3857",
        "bounds": [latlon(left, bottom), latlon(right, top)],
        "pixel_size": [width, height],
        "source_zoom": ZOOM,
        "checked_at": args.checked.isoformat(),
    }
    (args.output / "taiwan-terrain.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote Taiwan relief: {width} x {height}")


if __name__ == "__main__":
    main()
