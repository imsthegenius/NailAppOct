export const CANONICAL_CATEGORY_ORDER = [
  'nudes',
  'pinks',
  'reds',
  'burgundy',
  'pastels',
  'blues',
  'greens',
  'purples',
  'metallics',
  'darks',
  'french',
] as const;

export type CanonicalCategory = typeof CANONICAL_CATEGORY_ORDER[number];

export const CATEGORY_METADATA: Record<string, { label: string; swatchColor: string }> = {
  nudes: { label: 'Nudes', swatchColor: '#D6BFA8' },
  pinks: { label: 'Pinks', swatchColor: '#F2A7C2' },
  reds: { label: 'Reds', swatchColor: '#B3261E' },
  burgundy: { label: 'Burgundy', swatchColor: '#60203B' },
  pastels: { label: 'Pastels', swatchColor: '#E6D7F2' },
  blues: { label: 'Blues', swatchColor: '#4A68A1' },
  greens: { label: 'Greens', swatchColor: '#3F7F5F' },
  purples: { label: 'Purples', swatchColor: '#6B50A7' },
  metallics: { label: 'Metallics', swatchColor: '#C8B987' },
  darks: { label: 'Darks', swatchColor: '#2B2B33' },
  french: { label: 'French', swatchColor: '#F7F4F0' },
};

export const CATEGORY_ORDER_MAP: Record<string, number> = CANONICAL_CATEGORY_ORDER.reduce(
  (acc, value, index) => {
    acc[value] = index;
    return acc;
  },
  {} as Record<string, number>
);

export const CATEGORY_LIST_WITH_ALL = [
  { id: 'All', label: 'All', swatchColor: '#D9DBE1' },
  ...CANONICAL_CATEGORY_ORDER.map((categoryId) => {
    const metadata = CATEGORY_METADATA[categoryId];
    return {
      id: categoryId,
      label: metadata.label,
      swatchColor: metadata.swatchColor,
    };
  }),
];
