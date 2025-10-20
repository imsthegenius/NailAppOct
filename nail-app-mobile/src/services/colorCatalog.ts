import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { CanonicalFinish } from '../state/useSelectionStore';

export interface ColorCatalogEntry {
  colorId: string;
  colorVariantId: string;
  hexCode: string;
  colorName: string | null;
  shadeName: string;
  brand: string;
  productLine: string;
  shadeCode?: string | null;
  collection?: string | null;
  finish: CanonicalFinish;
  baseFinish?: CanonicalFinish | null;
  swatchUrl?: string | null;
  productUrl?: string | null;
  sourceCatalog?: string | null;
  category?: string | null;
  canonicalCategory?: string | null;
  isTrending?: boolean;
}

export interface CatalogFilters {
  brand?: string;
  productLine?: string;
  finish?: CanonicalFinish | 'all';
  collection?: string;
  category?: string;
  hasSwatch?: boolean;
  search?: string;
  isTrending?: boolean;
}

export interface CatalogResult<T> {
  data: T[];
  count: number;
  error: PostgrestError | null;
}

export interface CategorySummary {
  category: string;
  shadeCount: number;
}

const DEFAULT_PAGE_SIZE = 24;

function mapEntry(row: any): ColorCatalogEntry {
  return {
    colorId: row.color_id,
    colorVariantId: row.color_variant_id,
    hexCode: row.hex_code,
    colorName: row.color_name,
    shadeName: row.shade_name,
    brand: row.brand ?? row.fallback_brand,
    productLine: row.product_line,
    shadeCode: row.shade_code,
    collection: row.collection,
    finish: row.resolved_finish,
    baseFinish: row.base_finish,
    swatchUrl: row.swatch_url,
    productUrl: row.product_url,
    sourceCatalog: row.source_catalog,
    category: row.category,
    canonicalCategory: row.canonical_category,
    isTrending: row.is_trending,
  };
}

export async function fetchColorCatalog(
  filters: CatalogFilters,
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<CatalogResult<ColorCatalogEntry>> {
  let query = supabase
    .from('color_catalog_entries')
    .select(
      `color_id, color_variant_id, hex_code, color_name, shade_name, brand, fallback_brand, product_line,
       shade_code, collection, resolved_finish, base_finish, swatch_url, product_url, source_catalog,
       category, canonical_category, is_trending`
    , { count: 'exact' })
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsLast: true })
    .order('variant_created_at', { ascending: true });

  if (filters.brand) {
    query = query.eq('brand', filters.brand);
  }

  if (filters.productLine && filters.productLine !== 'All') {
    query = query.eq('product_line', filters.productLine);
  }

  if (filters.finish && filters.finish !== 'all') {
    query = query.eq('resolved_finish', filters.finish);
  }

  if (filters.collection === '__with_collection__') {
    query = query.not('collection', 'is', null);
  } else if (filters.collection && filters.collection !== 'All') {
    query = query.eq('collection', filters.collection);
  }

  if (filters.isTrending) {
    query = query.eq('is_trending', true);
  }

  if (filters.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters.hasSwatch) {
    query = query.not('swatch_url', 'is', null);
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`shade_name.ilike.${term},color_name.ilike.${term}`);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  return {
    data: (data ?? []).map(mapEntry),
    count: count ?? 0,
    error,
  };
}

export async function fetchCategorySummaries(
  brand?: string
): Promise<{ data: CategorySummary[]; error: PostgrestError | null }> {
  let query = supabase
    .from('color_category_distribution')
    .select('brand, canonical_category, shade_count');

  if (brand) {
    query = query.eq('brand', brand);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error };
  }

  if (brand) {
    return {
      data: (data ?? []).map((row: any) => ({
        category: row.canonical_category,
        shadeCount: row.shade_count ?? 0,
      })),
      error: null,
    };
  }

  const totals = new Map<string, number>();
  (data ?? []).forEach((row: any) => {
    const category = row.canonical_category as string;
    const count = row.shade_count ?? 0;
    if (!category) {
      return;
    }
    totals.set(category, (totals.get(category) ?? 0) + count);
  });

  return {
    data: Array.from(totals.entries()).map(([category, shadeCount]) => ({ category, shadeCount })),
    error: null,
  };
}

export async function fetchCollections(
  brand: string,
  productLine?: string
): Promise<{ data: string[]; error: PostgrestError | null }> {
  if (!brand) {
    return { data: [], error: null };
  }

  let query = supabase
    .from('color_catalog_entries')
    .select('collection', { distinct: true })
    .eq('is_active', true)
    .eq('brand', brand)
    .not('collection', 'is', null)
    .order('collection', { ascending: true });

  if (productLine && productLine !== 'All') {
    query = query.eq('product_line', productLine);
  }

  const { data, error } = await query;
  return {
    data: (data ?? []).map((row) => row.collection).filter(Boolean),
    error,
  };
}

export async function fetchVariantsForColor(colorId: string): Promise<CatalogResult<ColorCatalogEntry>> {
  if (!colorId) {
    return { data: [], count: 0, error: null };
  }
  const { data, error } = await supabase
    .from('color_catalog_entries')
    .select(
      `color_id, color_variant_id, hex_code, color_name, shade_name, brand, fallback_brand, product_line,
       shade_code, collection, resolved_finish, base_finish, swatch_url, product_url, source_catalog,
       category, canonical_category, is_trending`
    )
    .eq('is_active', true)
    .eq('color_id', colorId)
    .order('shade_name', { ascending: true });

  return {
    data: (data ?? []).map(mapEntry),
    count: (data ?? []).length,
    error,
  };
}
