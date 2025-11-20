import { create } from 'zustand';

export type CanonicalFinish =
  | 'glossy'
  | 'cream'
  | 'matte'
  | 'chrome'
  | 'shimmer'
  | 'glitter'
  | 'metallic'
  | 'sheer'
  | 'pearl'
  | 'magnetic'
  | 'reflective';

export interface SelectedColor {
  colorId: string;
  variantId: string;
  hex: string;
  name: string;
  brand: string;
  productLine: string;
  shadeCode?: string | null;
  collection?: string | null;
  finish: CanonicalFinish;
  swatchUrl?: string | null;
  sourceCatalog?: string | null;
  category?: string | null;
  colorName?: string | null;
}

export interface SelectedShape {
  id: string;
  name: string;
  icon?: string;
}

export interface SelectedLength {
  id: string;
  name: string;
  value: number;
}

interface SelectionState {
  selectedColor: SelectedColor | null;
  selectedShape: SelectedShape | null;
  selectedLength: SelectedLength;
  setSelectedColor: (color: SelectedColor | null) => void;
  setSelectedShape: (shape: SelectedShape | null) => void;
  setSelectedLength: (length: SelectedLength) => void;
  resetSelections: () => void;
}

const defaultShape: SelectedShape = { id: 'keep', name: 'Keep Current' };
const defaultLength: SelectedLength = { id: 'medium', name: 'Medium', value: 0.5 };

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedColor: null,
  selectedShape: defaultShape,
  selectedLength: defaultLength,
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedShape: (shape) => set({ selectedShape: shape ?? defaultShape }),
  setSelectedLength: (length) => set({ selectedLength: length }),
  resetSelections: () => set({ selectedColor: null, selectedShape: defaultShape, selectedLength: defaultLength }),
}));

export const CANONICAL_FINISHES: CanonicalFinish[] = [
  'glossy',
  'cream',
  'matte',
  'chrome',
  'shimmer',
  'glitter',
  'metallic',
  'sheer',
  'pearl',
  'magnetic',
  'reflective',
];
