#!/usr/bin/env python3
"""Scrape CND Shellac and Vinylux shades from UK distributor storefronts."""

import io
import json
import math
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import numpy as np
import pandas as pd
import requests
from PIL import Image
from tenacity import retry, stop_after_attempt, wait_random

BASE_SHELLAC = "https://www.jklondon.com"
BASE_VINYLUX = "https://lovecnd.com"
SHELLAC_COLLECTION = "cnd-shellac"
VINYLUX_COLLECTION = "colours"
OUT_CSV = "cnd_full_uk_catalog.csv"
ERROR_LOG = "errors.log"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
}
REQUEST_SLEEP = 0.4  # 1-2 req/sec politeness


@dataclass
class Shade:
    product_type: str
    title: str
    variant_title: str
    sku: str
    tags: List[str]
    product_url: str
    image_url: str


def log_error(message: str) -> None:
    with open(ERROR_LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{message}\n")


def fetch_shopify_products(collection: str, base_url: str) -> List[dict]:
    products: List[dict] = []
    page = 1
    while True:
        params = {"limit": 250, "page": page}
        url = f"{base_url}/collections/{collection}/products.json"
        try:
            resp = requests.get(url, params=params, headers=HEADERS, timeout=60)
            resp.raise_for_status()
            data = resp.json().get("products", [])
        except Exception as exc:
            log_error(f"FETCH_FAIL\t{url}\tpage={page}\t{exc}")
            break
        if not data:
            break
        products.extend(data)
        page += 1
        time.sleep(REQUEST_SLEEP)
    return products


def clean_shade_name(title: str, variant_title: str = "") -> str:
    name = title
    if variant_title and variant_title.lower() not in {"default title", "default"}:
        name = f"{title} {variant_title}"
    name = re.sub(r"CND[™\u2122]?", "", name, flags=re.I)
    name = re.sub(r"Vinylux[™\u2122]?", "", name, flags=re.I)
    name = re.sub(r"Shellac[™\u2122]?", "", name, flags=re.I)
    name = re.sub(r"SHELLAC", "", name, flags=re.I)
    name = re.sub(r"Nail Polish", "", name, flags=re.I)
    name = re.sub(r"Gel Polish", "", name, flags=re.I)
    name = re.sub(r"Color Coat", "", name, flags=re.I)
    name = re.sub(r"Colour Coat", "", name, flags=re.I)
    name = re.sub(r"Brand", "", name, flags=re.I)
    name = re.sub(r"Long Wear", "", name, flags=re.I)
    name = re.sub(r"Top Coat", "", name, flags=re.I)
    name = re.sub(r"Base Coat", "", name, flags=re.I)
    name = re.sub(r"-", " ", name)
    name = re.sub(r"[™®]", "", name)
    name = re.sub(r"\b\d+(?:\.\d+)?\s*(ml|fl oz)\b", "", name, flags=re.I)
    name = re.sub(r"\b\d+(?:\.\d+)?\s*g\b", "", name, flags=re.I)
    name = re.sub(r"\s+", " ", name).strip()
    return name



def should_skip_shellac(title: str, product_type: str) -> bool:
    t = title.lower()
    p = (product_type or "").lower()
    skip_keywords = ["top coat", "base coat", "bundle", "starter", "kit", "vent brush", "remover", "scrubfresh", "coolblue", "aftercare"]
    if any(keyword in t for keyword in skip_keywords):
        return True
    if any(keyword in p for keyword in ["base", "top", "bundle", "tool", "kit"]):
        return True
    return False


def should_skip_vinylux(title: str, tags: Iterable[str]) -> bool:
    t = title.lower()
    skip_keywords = ["top coat", "care", "bundle", "kit", "remover", "cuticle", "mask", "scrub", "file", "tote", "candle", "foot", "treatment"]
    if any(keyword in t for keyword in skip_keywords):
        return True
    combined_tags = " ".join(tags).lower()
    if any(keyword in combined_tags for keyword in ["top coat", "bundle", "care", "treatment", "prep", "aftercare"]):
        return True
    return False


@retry(stop=stop_after_attempt(3), wait=wait_random(min=1, max=4))
def download_bytes(url: str) -> bytes:
    resp = requests.get(url, headers=HEADERS, timeout=60)
    resp.raise_for_status()
    time.sleep(REQUEST_SLEEP)
    return resp.content


def average_hex(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        w, h = image.size
        for scale in (0.6, 0.8, 1.0):
            cw, ch = int(w * scale), int(h * scale)
            x0, y0 = (w - cw) // 2, (h - ch) // 2
            crop = image.crop((x0, y0, x0 + cw, y0 + ch))
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


def select_image(product: dict, variant: dict) -> str:
    if variant.get("featured_image") and variant["featured_image"].get("src"):
        return variant["featured_image"]["src"]
    images = product.get("images", [])
    if images:
        return images[0]["src"]
    image = product.get("image")
    if image and image.get("src"):
        return image["src"]
    return ""


def build_shades_from_products(products: Iterable[dict], product_type_label: str, skip_fn) -> List[Shade]:
    shades: List[Shade] = []
    base_url = BASE_SHELLAC if product_type_label == "Shellac" else BASE_VINYLUX
    for product in products:
        title = product.get("title", "")
        product_type = product.get("product_type", "")
        tags = product.get("tags", [])
        if skip_fn(title, tags if product_type_label == "Vinylux" else product_type):
            continue
        handle = product.get("handle", "")
        product_url = f"{base_url}/products/{handle}" if handle else ""
        variants = product.get("variants", [])
        if not variants:
            variants = [{}]
        for variant in variants:
            sku = (variant.get("sku") or "").strip()
            variant_title = variant.get("title", "")
            image_url = select_image(product, variant)
            shades.append(
                Shade(
                    product_type=product_type_label,
                    title=title,
                    variant_title=variant_title,
                    sku=sku,
                    tags=tags,
                    product_url=product_url,
                    image_url=image_url,
                )
            )
    return shades


def derive_category(tags: Iterable[str]) -> str:
    for tag in tags:
        if "collection" in tag.lower():
            return tag
    return ""


def collect_rows(shades: Iterable[Shade]) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    cache: Dict[str, str] = {}
    for shade in shades:
        name = clean_shade_name(shade.title, shade.variant_title)
        collection = derive_collection(shade.tags)
        swatch_url = shade.image_url
        approx_hex = cache.get(swatch_url)
        if swatch_url and approx_hex is None:
            try:
                img_bytes = download_bytes(swatch_url)
                approx_hex = average_hex(img_bytes)
            except Exception as exc:
                log_error(f"IMG_FAIL\t{swatch_url}\t{exc}")
                approx_hex = ""
            cache[swatch_url] = approx_hex
        rows.append(
            {
                "Brand": "CND",
                "ProductType": shade.product_type,
                "Collection": collection,
                "ShadeName": name,
                "ShadeCode": shade.sku,
                "ProductURL": shade.product_url,
                "SwatchImageURL": swatch_url,
                "ApproxHex": approx_hex or "",
            }
        )
    return rows


def derive_collection(tags: Iterable[str]) -> str:
    for tag in tags:
        t = tag.strip()
        if not t:
            continue
        if "collection" in t.lower() or t.lower().startswith("all "):
            return t
    return ""


def deduplicate_rows(rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    seen = set()
    unique = []
    for row in rows:
        key = (row["Brand"], row["ProductType"], row["ShadeName"], row["ShadeCode"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(row)
    return unique


def main() -> None:
    shellac_products = fetch_shopify_products(SHELLAC_COLLECTION, BASE_SHELLAC)
    vinylux_products = fetch_shopify_products(VINYLUX_COLLECTION, BASE_VINYLUX)

    shellac_shades = build_shades_from_products(shellac_products, "Shellac", should_skip_shellac)
    vinylux_shades = build_shades_from_products(vinylux_products, "Vinylux", should_skip_vinylux)

    all_shades = shellac_shades + vinylux_shades
    rows = collect_rows(all_shades)
    # periodic save for resilience
    for idx in range(100, len(rows) + 1, 100):
        pd.DataFrame(rows[:idx]).to_csv(OUT_CSV, index=False)

    final_rows = deduplicate_rows(rows)
    df = pd.DataFrame(final_rows)
    if df.empty:
        print("No data collected; please verify sources.")
        sys.exit(1)
    df.to_csv(OUT_CSV, index=False)
    print(f"DONE: {len(df)} rows → {OUT_CSV}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
