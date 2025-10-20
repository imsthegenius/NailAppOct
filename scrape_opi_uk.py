#!/usr/bin/env python3
"""Scrape OPI UK's catalogue and export CSV."""

import csv
import io
import json
import re
import time
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

import numpy as np
import requests
from PIL import Image

BASE_URL = "https://www.opi.com"
GRAPHQL_URL = "https://opi-uki.myshopify.com/api/2025-01/graphql.json"
STORE_TOKEN = "dbff532b0e769c89d13f6b2f626bc8cd"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": STORE_TOKEN,
}
OUT_CSV = "opi_full_uk_catalog.csv"
PRODUCT_TYPES = {
    "Nail Lacquer": 'product_type:"Nail Lacquer"',
    "Infinite Shine": 'product_type:"Infinite Shine"',
    "GelColor": 'product_type:"GelColor"',
}
MEDIA_PREF_KEYWORDS = ["formula_swatch", "brush-swatch", "brush_swatch", "swatch", "colour", "color"]
SLEEP_SECONDS = 0.5  # polite delay between GraphQL pages


@dataclass
class ProductRecord:
    product_type: str
    title: str
    handle: str
    sku: str
    collection: str
    tags: List[str]
    available: bool
    swatch_url: str
    hex_hint: str


class ShopifyClient:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def _post(self, query: str, variables: Dict) -> dict:
        for attempt in range(3):
            resp = self.session.post(GRAPHQL_URL, json={"query": query, "variables": variables}, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                if "errors" in data:
                    raise RuntimeError(f"GraphQL error: {data['errors']}")
                return data["data"]
            time.sleep(1 + attempt)
        resp.raise_for_status()
        raise RuntimeError("GraphQL request failed")

    def fetch_products(self, product_type: str, query_string: str) -> List[ProductRecord]:
        query = """
        query ProductsByType($first:Int!, $after:String, $query:String!) @inContext(country: GB, language: EN) {
          products(first:$first, after:$after, query:$query) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                title
                handle
                productType
                tags
                availableForSale
                sku: metafield(namespace:"opi", key:"sku") { value }
                colorCollection: metafield(namespace:"wmw", key:"color_collection") { value }
                hexCode: metafield(namespace:"opi", key:"hex_code") { value }
                proOnly: metafield(namespace:"wmw", key:"pro_only") { value }
                media(first:10) {
                  edges {
                    node {
                      ... on MediaImage {
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """
        records: List[ProductRecord] = []
        after: Optional[str] = None
        while True:
            data = self._post(query, {"first": 50, "after": after, "query": query_string})
            products = data["products"]
            for edge in products["edges"]:
                node = edge["node"]
                record = self._node_to_record(node, product_type)
                if record:
                    records.append(record)
            page_info = products["pageInfo"]
            if not page_info["hasNextPage"]:
                break
            after = page_info["endCursor"]
            time.sleep(SLEEP_SECONDS)
        return records

    def _node_to_record(self, node: dict, product_type: str) -> Optional[ProductRecord]:
        if node.get("availableForSale") is False:
            return None
        tags = node.get("tags", [])
        pro_only = (node.get("proOnly") or {}).get("value")
        if pro_only and pro_only.strip().lower() == "true":
            return None
        handle = node.get("handle", "")
        sku_value = (node.get("sku") or {}).get("value") or ""
        collection_value = (node.get("colorCollection") or {}).get("value") or ""
        hex_hint = (node.get("hexCode") or {}).get("value") or ""
        swatch_url = select_swatch_url(node.get("media") or {})
        return ProductRecord(
            product_type=product_type,
            title=node.get("title", ""),
            handle=handle,
            sku=sku_value,
            collection=collection_value,
            tags=tags,
            available=True,
            swatch_url=swatch_url,
            hex_hint=hex_hint,
        )


def select_swatch_url(media: dict) -> str:
    edges = media.get("edges", [])
    candidate_urls: List[str] = []
    for edge in edges:
        image = ((edge.get("node") or {}).get("image") or {})
        url = image.get("url")
        if not url:
            continue
        lower = url.lower()
        if any(keyword in lower for keyword in MEDIA_PREF_KEYWORDS):
            return url
        candidate_urls.append(url)
    return candidate_urls[0] if candidate_urls else ""


def average_hex_from_url(url: str, session: requests.Session) -> str:
    if not url:
        return ""
    try:
        resp = session.get(url, timeout=60)
        resp.raise_for_status()
        return average_hex_from_image(resp.content)
    except Exception:
        return ""


def average_hex_from_image(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        width, height = image.size
        for scale in (0.6, 0.8, 1.0):
            crop_w, crop_h = int(width * scale), int(height * scale)
            x0 = (width - crop_w) // 2
            y0 = (height - crop_h) // 2
            crop = image.crop((x0, y0, x0 + crop_w, y0 + crop_h))
            array = np.array(crop)
            r, g, b, a = np.rollaxis(array, axis=-1)
            mask = (a > 0) & ~((r > 248) & (g > 248) & (b > 248))
            if np.any(mask):
                red = int(np.mean(r[mask]))
                green = int(np.mean(g[mask]))
                blue = int(np.mean(b[mask]))
                return f"#{red:02X}{green:02X}{blue:02X}"
        return ""
    except Exception:
        return ""


def clean_shade_name(title: str) -> str:
    name = title.strip()
    patterns = [
        r"\s+Nail Polish$",
        r"\s+Long[- ]Lasting Nail Polish$",
        r"\s+Gel Nail Polish$",
        r"\s+Gel Nail\s+Polish$",
        r"\s+UV Gel Nail Polish$",
    ]
    for pattern in patterns:
        name = re.sub(pattern, "", name, flags=re.IGNORECASE)
    return name.strip()


def build_rows(records: Iterable[ProductRecord]) -> List[Dict[str, str]]:
    session = requests.Session()
    rows: List[Dict[str, str]] = []
    for record in records:
        shade_name = clean_shade_name(record.title)
        shade_code = record.sku or ""
        collection = record.collection or ""
        product_url = f"{BASE_URL}/en-GB/products/{record.handle}" if record.handle else ""
        approx_hex = average_hex_from_url(record.swatch_url, session)
        if not approx_hex and record.hex_hint:
            hex_hint = record.hex_hint.strip().lstrip("#")
            if re.fullmatch(r"[0-9A-Fa-f]{6}", hex_hint):
                approx_hex = f"#{hex_hint.upper()}"
        rows.append(
            {
                "Brand": "OPI",
                "ProductType": record.product_type,
                "ShadeCode": shade_code,
                "ShadeName": shade_name,
                "Collection": collection,
                "ProductURL": product_url,
                "SwatchImageURL": record.swatch_url,
                "ApproxHex": approx_hex,
            }
        )
    return rows


def deduplicate(rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    seen: set[Tuple[str, str, str]] = set()
    unique_rows: List[Dict[str, str]] = []
    for row in rows:
        key = (row["ProductType"], row.get("ShadeCode", ""), row.get("ShadeName", ""))
        if key in seen:
            continue
        seen.add(key)
        unique_rows.append(row)
    return unique_rows


def write_csv(rows: List[Dict[str, str]]) -> None:
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "Brand",
                "ProductType",
                "ShadeCode",
                "ShadeName",
                "Collection",
                "ProductURL",
                "SwatchImageURL",
                "ApproxHex",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    client = ShopifyClient()
    all_records: List[ProductRecord] = []
    for product_type, query_string in PRODUCT_TYPES.items():
        try:
            records = client.fetch_products(product_type, query_string)
        except RuntimeError:
            records = []
        if not records and product_type == "GelColor":
            print("Warning: GelColor products not accessible via API; skipping.")
        all_records.extend(records)
    rows = build_rows(all_records)
    unique_rows = deduplicate(rows)
    write_csv(unique_rows)
    print(f"DONE: {len(unique_rows)} rows → {OUT_CSV}")


if __name__ == "__main__":
    main()
