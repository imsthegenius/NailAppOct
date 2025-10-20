#!/usr/bin/env python3
"""Scrape The GelBottle Inc. gel colours and BIAB shades."""

import csv
import html
import io
import math
from collections import Counter
from dataclasses import dataclass
from typing import Dict, Iterable, Iterator, List, Optional

import numpy as np
import requests
from PIL import Image

BASE_URL = "https://thegelbottle.com"
API_URL = "https://core.dxpapi.com/api/v1/core/"
ACCOUNT_PARAMS = {
    "account_id": "7378",
    "domain_key": "thegelbottle",
    "request_type": "search",
    "search_type": "category",
    "url": "www.bloomreach.com",
    "ref_url": "www.bloomreach.com",
    "request_id": "cli",
    "_br_uid_2": "uid%3D123%3Av%3D1%3Ats%3D0%3Ahc%3D1",
    "user_id": "",
}
FIELDS = "pid,title,url,price,thumb_image,pro_only,sku,texture"
OUT_CSV = "tgb_full_catalog.csv"

CATEGORY_QUERIES = {
    "GelColor": "217",
    "BIAB": "212",
}
MAX_PRICE = 40


@dataclass
class Shade:
    product_type: str
    title: str
    handle: str
    url_path: str
    sku: str
    price: float
    image_url: str
    collection: str
    textures: List[str]


def fetch_docs(session: requests.Session, category_q: str) -> Iterator[dict]:
    start = 0
    rows = 200
    while True:
        params = {
            **ACCOUNT_PARAMS,
            "rows": rows,
            "start": start,
            "q": category_q,
            "fl": FIELDS,
        }
        response = session.get(API_URL, params=params, timeout=60)
        response.raise_for_status()
        data = response.json()["response"]
        docs = data["docs"]
        for doc in docs:
            yield doc
        start += rows
        if start >= data["numFound"]:
            break


def should_keep(doc: dict, product_type: str) -> bool:
    price = doc.get("price")
    if price is None or price > MAX_PRICE or price <= 0:
        return False
    url_path = doc.get("url") or ""
    if product_type == "GelColor":
        return any(segment in url_path for segment in ("/gel-colour/", "/autumn-", "/spring-", "/summer-", "/winter-", "/chromepots/", "/neon-", "/ombre-", "/cat-eye-")) or url_path.startswith("/gel-colour/")
    return "biab" in url_path.lower() or "biab" in (doc.get("title") or "").lower() or url_path.startswith("/colours/")


def derive_collection(url_path: str, product_type: str) -> str:
    segments = [seg for seg in url_path.strip("/").split("/") if seg]
    if not segments:
        return ""
    first = segments[0]
    ignored_gel = {"gel-colour", "gel-colour-shop-all", "shop-all", "shop", "more", "outlet"}
    ignored_biab = {"biab", "colours", "biabtm", "biabtm-20ml", "shop-all", "shop", "more", "outlet"}
    if product_type == "GelColor":
        if first in ignored_gel or first.startswith("gel-colour"):
            return ""
    else:
        if first in ignored_biab:
            return ""
    return first.replace("-", " ").title()


def clean_title(title: str) -> str:
    if not title:
        return ""
    name = title.replace("™", "").replace("®", "").strip()
    # Remove trailing descriptors commonly appended
    for suffix in [" Biab", " Biab 20Ml", " Biab 30Ml", " Biab 50Ml", " Biab+"]:
        if name.lower().endswith(suffix.lower()):
            name = name[: -len(suffix)].strip()
    return name


def select_image_url(raw_url: str) -> str:
    if not raw_url:
        return ""
    decoded = html.unescape(raw_url)
    return decoded


def average_hex_from_image_url(url: str, session: requests.Session) -> str:
    if not url:
        return ""
    try:
        resp = session.get(url, timeout=60)
        resp.raise_for_status()
        return average_hex(resp.content)
    except Exception:
        return ""


def average_hex(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        width, height = image.size
        for scale in (0.6, 0.8, 1.0):
            crop_w, crop_h = int(width * scale), int(height * scale)
            x0 = (width - crop_w) // 2
            y0 = (height - crop_h) // 2
            crop = image.crop((x0, y0, x0 + crop_w, y0 + crop_h))
            arr = np.array(crop)
            r, g, b, a = np.rollaxis(arr, axis=-1)
            mask = (a > 0) & ~((r > 248) & (g > 248) & (b > 248))
            if np.any(mask):
                red = int(np.mean(r[mask]))
                green = int(np.mean(g[mask]))
                blue = int(np.mean(b[mask]))
                return f"#{red:02X}{green:02X}{blue:02X}"
        return ""
    except Exception:
        return ""


def collect_shades(product_type: str, category_q: str, session: requests.Session) -> List[Shade]:
    shades: List[Shade] = []
    for doc in fetch_docs(session, category_q):
        if not should_keep(doc, product_type):
            continue
        url_path = doc.get("url") or ""
        sku = (doc.get("sku") or "").strip()
        if not sku or not url_path:
            continue
        image_url = select_image_url(doc.get("thumb_image") or "")
        if not image_url:
            continue
        collection = derive_collection(url_path, product_type)
        textures = [t for t in (doc.get("texture") or []) if t]
        shade = Shade(
            product_type=product_type,
            title=clean_title(doc.get("title") or ""),
            handle=url_path.strip("/"),
            url_path=url_path,
            sku=sku,
            price=float(doc.get("price") or 0.0),
            image_url=image_url,
            collection=collection,
            textures=textures,
        )
        shades.append(shade)
    return shades


def build_rows(shades: Iterable[Shade], session: requests.Session) -> List[Dict[str, str]]:
    cache: Dict[str, str] = {}
    rows: List[Dict[str, str]] = []
    for shade in shades:
        swatch_url = shade.image_url
        approx_hex = cache.get(swatch_url)
        if approx_hex is None:
            approx_hex = average_hex_from_image_url(swatch_url, session)
            cache[swatch_url] = approx_hex
        categories = [t for t in shade.textures if t.lower() not in {"gelbottle", "colour", "color"}]
        if not categories:
            categories = ["Standard"]
        rows.append(
            {
                "Brand": "The GelBottle Inc.",
                "Product Type": shade.product_type,
                "Collection": shade.collection,
                "Category": ", ".join(categories),
                "Shade Name": shade.title,
                "ApproxHex": approx_hex,
                "ProductURL": f"{BASE_URL}{shade.url_path}",
                "SwatchURL": swatch_url,
            }
        )
    return rows


def deduplicate(rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    seen = set()
    unique: List[Dict[str, str]] = []
    for row in rows:
        key = (row["Product Type"], row["Shade Name"], row["ProductURL"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(row)
    return unique


def main() -> None:
    session = requests.Session()
    gel_shades = collect_shades("GelColor", CATEGORY_QUERIES["GelColor"], session)
    biab_shades = collect_shades("BIAB", CATEGORY_QUERIES["BIAB"], session)
    all_shades = gel_shades + biab_shades
    rows = build_rows(all_shades, session)
    unique_rows = deduplicate(rows)
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "Brand",
                "Product Type",
                "Collection",
                "Category",
                "Shade Name",
                "ApproxHex",
                "ProductURL",
                "SwatchURL",
            ],
        )
        writer.writeheader()
        writer.writerows(unique_rows)
    print(f"DONE: {len(unique_rows)} rows → {OUT_CSV}")


if __name__ == "__main__":
    main()
