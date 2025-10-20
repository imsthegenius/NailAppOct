import type { SelectedColor, SelectedLength, SelectedShape } from '../src/state/useSelectionStore';
import { useSelectionStore, CANONICAL_FINISHES } from '../src/state/useSelectionStore';

export { useSelectionStore, CANONICAL_FINISHES };

export const selectedColorData = {
  get color(): SelectedColor | null {
    return useSelectionStore.getState().selectedColor;
  },
  set color(value: SelectedColor | null) {
    useSelectionStore.getState().setSelectedColor(value ?? null);
  },
};

export const selectedNailData = {
  get shape(): SelectedShape | null {
    return useSelectionStore.getState().selectedShape;
  },
  set shape(value: SelectedShape | null) {
    useSelectionStore.getState().setSelectedShape(value);
  },
  get length(): SelectedLength {
    return useSelectionStore.getState().selectedLength;
  },
  set length(value: SelectedLength) {
    useSelectionStore.getState().setSelectedLength(value);
  },
};

export const updateSelectedColor = (color: SelectedColor | null) => {
  // Guard against no-op updates that can cause unnecessary re-renders
  const state = useSelectionStore.getState();
  const prev = state.selectedColor;
  if (
    prev &&
    color &&
    prev.variantId === color.variantId &&
    prev.hex === color.hex &&
    prev.brand === color.brand &&
    prev.productLine === color.productLine
  ) {
    return;
  }
  state.setSelectedColor(color);
};

export const updateSelectedNail = (shape: SelectedShape | null, length?: SelectedLength) => {
  const state = useSelectionStore.getState();
  const prevShape = state.selectedShape;
  const prevLength = state.selectedLength;

  const shapeChanged = !prevShape || !shape || prevShape.id !== shape.id;
  const lengthChanged = length && (!prevLength || prevLength.id !== length.id || prevLength.value !== length.value);

  if (shapeChanged) {
    state.setSelectedShape(shape);
  }
  if (length && lengthChanged) {
    state.setSelectedLength(length);
  }
};

export const resetSelections = () => {
  useSelectionStore.getState().resetSelections();
};
