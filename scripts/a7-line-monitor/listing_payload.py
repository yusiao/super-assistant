"""Read JSON-only Nuxt/devalue payloads; never evaluate source JavaScript."""
import json
import re


def payload(html):
    match = re.search(r"<script[^>]+\b__NUXT_DATA__\b[^>]*>(.*?)</script>", html, re.S)
    if not match:
        raise ValueError("Missing structured listing data")
    raw = json.loads(match[1])
    if not isinstance(raw, list) or len(raw) > 100000:
        raise ValueError("Unexpected listing data format")
    memo = {}

    def read(index, depth=0):
        if not isinstance(index, int) or depth > 100:
            raise ValueError("Invalid data reference")
        if index < 0:
            return None
        if index >= len(raw):
            raise ValueError("Out of range data reference")
        if index in memo:
            return memo[index]
        value = raw[index]
        if isinstance(value, dict):
            result = {}
            memo[index] = result
            result.update((k, read(v, depth + 1)) for k, v in value.items())
            return result
        if isinstance(value, list):
            if value and isinstance(value[0], str):
                if value[0] in {"Ref", "ShallowRef", "Reactive", "ShallowReactive", "Readonly"}:
                    return read(value[1], depth + 1)
                if value[0] in {"EmptyRef", "EmptyShallowRef"}:
                    return read(value[1], depth + 1) if len(value) > 1 else None
                if value[0] == "Set":
                    return [read(v, depth + 1) for v in value[1:]]
                raise ValueError("Unsupported payload type")
            result = []
            memo[index] = result
            result.extend(read(v, depth + 1) for v in value)
            return result
        if value is None or isinstance(value, (str, int, float, bool)):
            return value
        raise ValueError("Unexpected payload value")

    return read(0)


def objects(tree):
    seen = set()
    pending = [tree]
    while pending:
        item = pending.pop()
        if not isinstance(item, (dict, list)) or id(item) in seen:
            continue
        seen.add(id(item))
        if isinstance(item, dict):
            yield item
            pending.extend(item.values())
        else:
            pending.extend(item)


if __name__ == "__main__":
    from pathlib import Path
    import sys
    tree = payload(Path(sys.argv[1]).read_text(encoding="utf-8"))
    for item in objects(tree):
        if {"total", "items", "total_page"} <= item.keys():
            print("LIST", item["total"], item.get("online_total"), item["total_page"])
        if {"build_type_name", "deal_time", "sell_time", "map"} <= item.keys():
            print(json.dumps({k: item.get(k) for k in ("hid", "build_name", "build_type_name",
                  "deal_time", "deal_time_v2", "sell_time", "map", "shop_id", "shop_name")}, ensure_ascii=True))
