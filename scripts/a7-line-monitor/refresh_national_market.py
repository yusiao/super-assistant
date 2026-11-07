"""Refresh free official aggregates; raw residential records remain runner-local."""
import argparse
from datetime import datetime
from html import unescape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, parse_qs
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from build_national_market import build, SITE
from fetch_policy import check_response

HOSTS = {"data.gov.tw", "plvr.land.moi.gov.tw", "data.taipei", "data.ntpc.gov.tw", "opendata.tycg.gov.tw"}


def download(url, target=None):
    if urlsplit(url).scheme != "https" or urlsplit(url).hostname not in HOSTS:
        raise ValueError("Non-government source")
    request = Request(url, headers={"User-Agent": "PropertyObservatory/1.0"})
    with urlopen(request, timeout=45) as response:
        if urlsplit(response.url).hostname not in HOSTS:
            raise ValueError("Unexpected source redirect")
        check_response(response.status, dict(response.headers))
        content = response.read(300_000_001)
        if len(content) > 300_000_000:
            raise ValueError("Source exceeds size limit")
    if target:
        target.write_bytes(content)
        return target
    return content.decode("utf-8")


def links(html, host):
    found = []
    for raw in re.findall(r'href=[\"\']([^\"\']+)', html):
        value = unescape(raw)
        if urlsplit(value).hostname == host and value not in found:
            found.append(value)
    return found


def seasons(html):
    choices = {}
    for url in links(html, "plvr.land.moi.gov.tw"):
        q = parse_qs(urlsplit(url).query)
        value = q.get("season", [""])[0]
        if (urlsplit(url).path.rstrip("/").endswith("DownloadSeason") and re.fullmatch(r"\d{3}S[1-4]", value)
                and q.get("fileName") == ["lvr_landcsv.zip"] and q.get("type") == ["zip"]):
            choices[value] = url
    if len(choices) < 2:
        raise ValueError("Two published sale batches not found")
    return [(key, choices[key]) for key in sorted(choices)[-2:]]


def refresh(workdir):
    workdir.mkdir(parents=True, exist_ok=True)
    sales = [download(url, workdir/(key+".zip")) for key, url in seasons(download("https://data.gov.tw/dataset/18703"))]
    filings = download("https://plvr.land.moi.gov.tw/opendata/lvr_buildcasecsv.zip", workdir/"filings.zip")
    addresses = []
    for code, dataset, host in [("a",155472,"data.taipei"),("f",168887,"data.ntpc.gov.tw"),("h",157689,"opendata.tycg.gov.tw")]:
        urls = links(download(f"https://data.gov.tw/dataset/{dataset}"), host)
        urls = [u for u in urls if "/download" in u or "/csv/file" in u]
        if not urls:
            raise ValueError("No published address CSV")
        addresses.append(download(urls[-1], workdir/(code+".csv")))
    output = SITE/"national-market.tmp.json"
    build(argparse.Namespace(filings=filings,sales=sales,addresses=addresses,
                             as_of=datetime.now(ZoneInfo("Asia/Taipei")).date(),output=output))
    # Existing dated aggregates survive any download, schema or build failure.
    result = json.loads(output.read_text(encoding="utf-8"))
    if len(result["districts"]) != 368:
        raise ValueError("Incomplete district index")
    output.replace(SITE/"national-market.json")


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workdir",type=Path,required=True)
    refresh(parser.parse_args().workdir)
