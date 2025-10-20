#!/usr/bin/env python3
"""Synchronise salon colour catalogues into Supabase.

This script ingests the OPI, CND, and The GelBottle CSV exports, normalises the
metadata, upserts the canonical `colors` rows plus brand-specific
`color_variants`, and finally triggers the hex categorisation routine so the UI
stays in sync.

Usage:
    python scripts/sync_color_catalog.py \
        --opi ../../opi_full_uk_catalog.csv \
        --cnd ../../cnd_full_uk_catalog.csv \
        --tgb ../../tgb_full_catalog.csv

Environment variables:
    SUPABASE_URL                 (required)
    SUPABASE_SERVICE_ROLE_KEY    (required)
    DATABASE_URL                 (optional, unused but reserved for future)

Requires `supabase-py` (pip install supabase)
"""
from __future__ import annotations

import argparse
import csv
import itertools
import logging
import os
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

try:
    from supabase import Client, create_client
    from postgrest.exceptions import APIError
except ImportError as exc:  # pragma: no cover - import guard
    raise SystemExit(
        "supabase-py is required. Install with `pip install supabase` before running this script."
    ) from exc

CANONICAL_FINISHES = [
    "glossy",
    "cream",
    "matte",
    "chrome",
    "shimmer",
    "glitter",
    "metallic",
    "sheer",
    "pearl",
    "magnetic",
    "reflective",
]

FINISH_PRIORITY = {
    "glitter": 100,
    "reflective": 95,
    "magnetic": 90,
    "chrome": 85,
    "metallic": 80,
    "shimmer": 70,
    "pearl": 60,
    "matte": 50,
    "cream": 40,
    "sheer": 35,
    "glossy": 30,
}

FINISH_SYNONYMS = {
    "standard": "glossy",
    "high shine": "glossy",
    "shine": "glossy",
    "creme": "cream",
    "cream": "cream",
    "mat": "matte",
    "matte": "matte",
    "chrome": "chrome",
    "mirror": "chrome",
    "shimmer": "shimmer",
    "shimmery": "shimmer",
    "glitter": "glitter",
    "glittery": "glitter",
    "reflective": "reflective",
    "cat-eye": "magnetic",
    "magnetic": "magnetic",
    "magnetic, cat-eye": "magnetic",
    "metallic": "metallic",
    "foil": "metallic",
    "sheer": "sheer",
    "milky": "sheer",
    "milky, sheer": "sheer",
    "pearl": "pearl",
}

DEFAULT_FINISH = "glossy"

SOURCE_TO_BRAND = {
    "opi_full_uk_catalog": "OPI",
    "cnd_full_uk_catalog": "CND",
    "tgb_full_catalog": "The GelBottle Inc.",
}

PRODUCT_LINE_NORMALISERS = {
    "OPI": {
        "nail lacquer": "Nail Lacquer",
        "infinite shine": "Infinite Shine",
        "gelcolor": "GelColor",
    },
    "CND": {
        "shellac": "Shellac",
        "vinylux": "Vinylux",
    },
    "The GelBottle Inc.": {
        "gelcolor": "GelColor",
        "biab": "BIAB",
    },
}

CATEGORY_TO_FINISH = {
    "standard": "glossy",
    "standard finish": "glossy",
    "shimmer": "shimmer",
    "shimmery": "shimmer",
    "glitter": "glitter",
    "glitter, shimmery": "glitter",
    "glitter, reflective": "reflective",
    "reflective": "reflective",
    "chrome": "chrome",
    "metallic": "metallic",
    "pearl": "pearl",
    "sheer": "sheer",
    "milky": "sheer",
    "milky, sheer": "sheer",
    "magnetic": "magnetic",
    "magnetic, cat-eye": "magnetic",
    "cat-eye": "magnetic",
    "matte": "matte",
    "cream": "cream",
    "creme": "cream",
}

HEX_PREFIX = "#"


@dataclass
class VariantRecord:
    hex_code: str
    brand: str
    product_line: str
    shade_name: str
    shade_code: Optional[str]
    collection: Optional[str]
    finish: str
    product_url: Optional[str]
    swatch_url: Optional[str]
    source_catalog: str

    def key(self) -> Tuple[str, str, str, Optional[str]]:
        return (
            self.brand,
            self.product_line,
            self.shade_name,
            self.shade_code or None,
        )


class CatalogSyncError(RuntimeError):
    pass


def normalise_hex(value: str) -> Optional[str]:
    if not value:
        return None
    candidate = value.strip().upper()
    if not candidate:
        return None
    if not candidate.startswith(HEX_PREFIX):
        candidate = f"{HEX_PREFIX}{candidate}"
    if len(candidate) != 7:
        return None
    try:
        int(candidate[1:], 16)
    except ValueError:
        return None
    return candidate


def normalise_finish(raw: Optional[str]) -> str:
    if not raw:
        return DEFAULT_FINISH
    tokens = [token.strip().lower() for token in raw.replace("/", ",").split(",") if token.strip()]
    if not tokens:
        return DEFAULT_FINISH
    mapped = [FINISH_SYNONYMS.get(token, token) for token in tokens]
    valid = [token for token in mapped if token in CANONICAL_FINISHES]
    if not valid:
        return DEFAULT_FINISH
    # Choose the most visually distinctive finish using priority table
    best = max(valid, key=lambda finish: FINISH_PRIORITY.get(finish, 0))
    return best


def normalise_product_line(raw: Optional[str], brand: str) -> str:
    if not raw:
        return "Unknown"
    cleaned = raw.strip().lower()
    if not cleaned:
        return "Unknown"
    mapping = PRODUCT_LINE_NORMALISERS.get(brand, {})
    return mapping.get(cleaned, raw.strip())


def clean_collection(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    cleaned = raw.strip()
    if not cleaned:
        return None
    # Many collection fields include URL fragments joined by underscores
    if "http" in cleaned and "_" in cleaned:
        parts = [part for part in cleaned.split("_") if not part.startswith("http")]
        if parts:
            return parts[0]
    return cleaned


def chunked(iterable: Iterable, size: int) -> Iterable[List]:
    iterator = iter(iterable)
    while True:
        chunk = list(itertools.islice(iterator, size))
        if not chunk:
            break
        yield chunk


def load_opi_rows(path: Path) -> List[VariantRecord]:
    records: List[VariantRecord] = []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            hex_code = normalise_hex(row.get("ApproxHex"))
            if not hex_code:
                logging.debug("Skipping OPI row with invalid hex: %s", row)
                continue
            finish = normalise_finish(row.get("Finish") or row.get("Texture") or DEFAULT_FINISH)
            records.append(
                VariantRecord(
                    hex_code=hex_code,
                    brand=row.get("Brand", "OPI").strip() or "OPI",
                    product_line=normalise_product_line(row.get("ProductType"), "OPI"),
                    shade_name=(row.get("ShadeName") or "Unnamed").strip(),
                    shade_code=(row.get("ShadeCode") or "").strip() or None,
                    collection=clean_collection(row.get("Collection")),
                    finish=finish,
                    product_url=(row.get("ProductURL") or "").strip() or None,
                    swatch_url=(row.get("SwatchImageURL") or "").strip() or None,
                    source_catalog="opi_full_uk_catalog",
                )
            )
    return records


def load_cnd_rows(path: Path) -> List[VariantRecord]:
    records: List[VariantRecord] = []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            hex_code = normalise_hex(row.get("ApproxHex"))
            if not hex_code:
                logging.debug("Skipping CND row with invalid hex: %s", row)
                continue
            finish = normalise_finish(row.get("Finish") or row.get("Texture") or DEFAULT_FINISH)
            records.append(
                VariantRecord(
                    hex_code=hex_code,
                    brand=row.get("Brand", "CND").strip() or "CND",
                    product_line=normalise_product_line(row.get("ProductType"), "CND"),
                    shade_name=(row.get("ShadeName") or "Unnamed").strip(),
                    shade_code=(row.get("ShadeCode") or "").strip() or None,
                    collection=clean_collection(row.get("Collection")),
                    finish=finish,
                    product_url=(row.get("ProductURL") or "").strip() or None,
                    swatch_url=(row.get("SwatchImageURL") or "").strip() or None,
                    source_catalog="cnd_full_uk_catalog",
                )
            )
    return records


def load_tgb_rows(path: Path) -> List[VariantRecord]:
    records: List[VariantRecord] = []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            hex_code = normalise_hex(row.get("ApproxHex"))
            if not hex_code:
                logging.debug("Skipping TGB row with invalid hex: %s", row)
                continue
            finish = normalise_finish(
                CATEGORY_TO_FINISH.get((row.get("Category") or "").strip().lower(), row.get("Category"))
            )
            records.append(
                VariantRecord(
                    hex_code=hex_code,
                    brand=row.get("Brand", "The GelBottle Inc.").strip() or "The GelBottle Inc.",
                    product_line=normalise_product_line(row.get("Product Type"), "The GelBottle Inc."),
                    shade_name=(row.get("Shade Name") or "Unnamed").strip(),
                    shade_code=(row.get("Shade Code") or "").strip() or None,
                    collection=clean_collection(row.get("Collection")),
                    finish=finish,
                    product_url=(row.get("ProductURL") or "").strip() or None,
                    swatch_url=(row.get("SwatchURL") or "").strip() or None,
                    source_catalog="tgb_full_catalog",
                )
            )
    return records


def load_catalogues(args: argparse.Namespace) -> List[VariantRecord]:
    rows: List[VariantRecord] = []
    if args.opi:
        rows.extend(load_opi_rows(args.opi))
    if args.cnd:
        rows.extend(load_cnd_rows(args.cnd))
    if args.tgb:
        rows.extend(load_tgb_rows(args.tgb))
    logging.info("Loaded %d raw variant rows", len(rows))
    return rows


def deduplicate(records: List[VariantRecord]) -> List[VariantRecord]:
    seen: Dict[Tuple[str, str, str, Optional[str], str], VariantRecord] = {}
    for record in records:
        # incorporate hex into key to avoid collapsing distinct shades that coincidentally share names
        key = (*record.key(), record.hex_code)
        if key in seen:
            continue
        # For blank shade codes, prefer the first unique combination per brand/product_line/shade_name
        seen[key] = record
    deduped = list(seen.values())
    logging.info("Deduplicated to %d variant rows", len(deduped))
    return deduped


def ensure_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise CatalogSyncError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)


def ensure_catalog_paths(namespace: argparse.Namespace) -> None:
    for attr in ("opi", "cnd", "tgb"):
        path: Optional[Path] = getattr(namespace, attr)
        if path and not path.exists():
            raise CatalogSyncError(f"CSV not found: {path}")


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync salon colour catalogues into Supabase")
    repo_root = Path(__file__).resolve().parents[1]
    parser.add_argument("--opi", type=Path, default=(repo_root / ".." / "opi_full_uk_catalog.csv"))
    parser.add_argument("--cnd", type=Path, default=(repo_root / ".." / "cnd_full_uk_catalog.csv"))
    parser.add_argument("--tgb", type=Path, default=(repo_root / ".." / "tgb_full_catalog.csv"))
    parser.add_argument("--batch-size", type=int, default=200, help="Rows per batched upsert")
    parser.add_argument("--dry-run", action="store_true", help="Parse and report without writing to Supabase")
    parser.add_argument(
        "--overwrite-primary",
        action="store_true",
        help="Replace existing colors.primary_variant_id with the first variant encountered",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity",
    )
    args = parser.parse_args(argv)
    args.opi = args.opi.resolve() if args.opi else None
    args.cnd = args.cnd.resolve() if args.cnd else None
    args.tgb = args.tgb.resolve() if args.tgb else None
    return args


def map_hex_to_variants(records: List[VariantRecord]) -> Dict[str, List[VariantRecord]]:
    mapping: Dict[str, List[VariantRecord]] = {}
    for record in records:
        mapping.setdefault(record.hex_code, []).append(record)
    return mapping


def fetch_existing_colors(client: Client, hexes: Iterable[str]) -> Dict[str, Dict]:
    existing: Dict[str, Dict] = {}
    for chunk in chunked(sorted(set(hexes)), 200):
        response = client.table("colors").select(
            "id, hex_code, name, brand, finish, primary_variant_id, source_priority"
        ).in_("hex_code", chunk).execute()
        for row in response.data:
            existing[row["hex_code"]] = row
    return existing


def insert_new_colors(
    client: Client,
    missing_hexes: Iterable[str],
    variants_by_hex: Dict[str, List[VariantRecord]],
    dry_run: bool,
    batch_size: int,
) -> Dict[str, Dict]:
    if dry_run:
        logging.info("Dry-run: skipping insertion of %d new colors", len(list(missing_hexes)))
        return {}
    payloads = []
    for hex_code in missing_hexes:
        variants = variants_by_hex[hex_code]
        primary = variants[0]
        payloads.append(
            {
                "id": str(uuid.uuid4()),
                "hex_code": hex_code,
                "name": primary.shade_name,
                "brand": primary.brand,
                "category": "trending",  # recategorised by refresh_hex_categorization later
                "finish": primary.finish,
                "trending_score": 0,
                "season": [],
                "mood_tags": [],
                "source_priority": primary.source_catalog,
            }
        )
    inserted: Dict[str, Dict] = {}
    for chunk in chunked(payloads, batch_size):
        response = client.table("colors").insert(chunk, count="exact").execute()
        for row in response.data or chunk:
            inserted[row["hex_code"]] = row
    logging.info("Inserted %d new color rows", len(inserted))
    return inserted


def update_existing_colors(
    client: Client,
    existing: Dict[str, Dict],
    variants_by_hex: Dict[str, List[VariantRecord]],
    dry_run: bool,
    overwrite_primary: bool,
) -> None:
    for hex_code, color in existing.items():
        variants = variants_by_hex.get(hex_code)
        if not variants:
            continue
        primary = variants[0]
        updates: Dict[str, object] = {}
        if not color.get("brand"):
            updates["brand"] = primary.brand
        if not color.get("finish"):
            updates["finish"] = primary.finish
        if not color.get("source_priority"):
            updates["source_priority"] = primary.source_catalog
        if overwrite_primary and variants:
            # primary_variant_id handled after variant upsert when IDs are known
            pass
        if updates and not dry_run:
            response = client.table("colors").update(updates).eq("id", color["id"]).execute()


def fetch_existing_variants(client: Client, color_ids: Iterable[str]) -> Dict[str, Dict[str, Dict]]:
    by_color: Dict[str, Dict[str, Dict]] = {}
    color_id_list = list(set(color_ids))
    for chunk in chunked(color_id_list, 200):
        response = client.table("color_variants").select(
            "id, color_id, brand, product_line, shade_name, shade_code"
        ).in_("color_id", chunk).execute()
        for row in response.data:
            key = (row["brand"], row["product_line"], row["shade_name"], row.get("shade_code") or None)
            by_color.setdefault(row["color_id"], {})[str(key)] = row
    return by_color


def upsert_variants(
    client: Client,
    colors_by_hex: Dict[str, Dict],
    variants_by_hex: Dict[str, List[VariantRecord]],
    dry_run: bool,
    batch_size: int,
) -> Tuple[Dict[str, str], int]:
    color_ids = [color["id"] for color in colors_by_hex.values()]
    existing_variants = fetch_existing_variants(client, color_ids) if not dry_run else {}
    rows_to_upsert = []
    primary_variants: Dict[str, str] = {}
    total_new = 0

    for hex_code, color in colors_by_hex.items():
        color_id = color["id"]
        variants = variants_by_hex.get(hex_code, [])
        if not variants:
            continue
        existing_map = existing_variants.get(color_id, {})
        for index, variant in enumerate(variants):
            key = str((variant.brand, variant.product_line, variant.shade_name, variant.shade_code))
            existing = existing_map.get(key)
            variant_id = existing["id"] if existing else str(uuid.uuid4())
            if not existing:
                total_new += 1
            if index == 0:
                primary_variants[color_id] = variant_id
            rows_to_upsert.append(
                {
                    "id": variant_id,
                    "color_id": color_id,
                    "brand": variant.brand,
                    "product_line": variant.product_line,
                    "shade_name": variant.shade_name,
                    "shade_code": variant.shade_code,
                    "collection": variant.collection,
                    "finish_override": variant.finish if variant.finish != color.get("finish") else None,
                    "product_url": variant.product_url,
                    "swatch_url": variant.swatch_url,
                    "source_catalog": variant.source_catalog,
                    "is_active": True,
                }
            )
    if dry_run:
        logging.info("Dry-run: would upsert %d color_variants (including %d new)", len(rows_to_upsert), total_new)
        return primary_variants, total_new

    for chunk in chunked(rows_to_upsert, batch_size):
        response = client.table("color_variants").upsert(
            chunk,
            on_conflict=("color_id,brand,product_line,shade_name,shade_code"),
            returning="minimal",
        ).execute()
    logging.info("Upserted %d color_variants (new: %d)", len(rows_to_upsert), total_new)
    return primary_variants, total_new


def update_primary_variants(
    client: Client,
    colors_by_hex: Dict[str, Dict],
    primary_map: Dict[str, str],
    overwrite_primary: bool,
    dry_run: bool,
) -> None:
    updates = []
    for color in colors_by_hex.values():
        color_id = color["id"]
        new_primary = primary_map.get(color_id)
        if not new_primary:
            continue
        if color.get("primary_variant_id") and not overwrite_primary:
            continue
        updates.append({"id": color_id, "primary_variant_id": new_primary})
    if not updates:
        return
    if dry_run:
        logging.info("Dry-run: would update %d colors with primary_variant_id", len(updates))
        return
    for entry in updates:
        response = client.table("colors").update({"primary_variant_id": entry["primary_variant_id"]}).eq(
            "id", entry["id"]
        ).execute()


def trigger_hex_refresh(client: Client, dry_run: bool) -> None:
    if dry_run:
        logging.info("Dry-run: skipping refresh_hex_categorization() call")
        return
    try:
        response = client.rpc("refresh_hex_categorization").execute()
    except APIError as exc:
        logging.warning(
            "refresh_hex_categorization() failed (run manually via SQL editor): %s",
            exc,
        )
        return
    logging.info("Hex categorisation refreshed successfully")


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(level=getattr(logging, args.log_level.upper()), format="[%(levelname)s] %(message)s")
    ensure_catalog_paths(args)

    try:
        client = ensure_client()
    except CatalogSyncError as exc:
        logging.error(exc)
        return 1

    records = load_catalogues(args)
    if not records:
        logging.warning("No records found – nothing to do")
        return 0

    records = deduplicate(records)
    variants_by_hex = map_hex_to_variants(records)
    all_hexes = list(variants_by_hex.keys())

    existing_colors = fetch_existing_colors(client, all_hexes)
    missing_hexes = [hex_code for hex_code in all_hexes if hex_code not in existing_colors]
    logging.info("Existing colors: %d | New colors: %d", len(existing_colors), len(missing_hexes))

    created_colors = insert_new_colors(client, missing_hexes, variants_by_hex, args.dry_run, args.batch_size)

    colors_by_hex = {**existing_colors, **created_colors}

    update_existing_colors(client, existing_colors, variants_by_hex, args.dry_run, args.overwrite_primary)

    primary_map, inserted_count = upsert_variants(
        client,
        colors_by_hex,
        variants_by_hex,
        args.dry_run,
        args.batch_size,
    )

    update_primary_variants(client, colors_by_hex, primary_map, args.overwrite_primary, args.dry_run)

    logging.info(
        "Variant ingest summary: %d total variants processed (%d unique colours)",
        sum(len(v) for v in variants_by_hex.values()),
        len(variants_by_hex),
    )
    logging.info("New variants inserted: %d", inserted_count)

    trigger_hex_refresh(client, args.dry_run)

    logging.info("Catalog sync complete")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except CatalogSyncError as exc:
        logging.error(exc)
        sys.exit(1)
