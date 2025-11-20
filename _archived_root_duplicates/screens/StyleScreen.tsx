import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useThemeColors } from '../hooks/useColorScheme';
import {
  CANONICAL_FINISHES,
  SelectedColor,
  updateSelectedColor,
  useSelectionStore,
  updateSelectedNail,
} from '../lib/selectedData';
import { NativeLiquidGlass } from '../components/ui/NativeLiquidGlass';
import {
  ColorCatalogEntry,
  fetchCollections,
  fetchColorCatalog,
} from '../src/services/colorCatalog';

const { width } = Dimensions.get('window');

const BRAND_OPTIONS = ['OPI', 'CND', 'The GelBottle Inc.'] as const;

const PRODUCT_LINES: Record<string, string[]> = {
  OPI: ['All', 'Nail Lacquer', 'Infinite Shine', 'GelColor'],
  CND: ['All', 'Shellac', 'Vinylux'],
  'The GelBottle Inc.': ['All', 'GelColor', 'BIAB'],
};

const COLOR_FAMILIES: { id: string; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'nudes', label: 'Nudes' },
  { id: 'reds', label: 'Reds' },
  { id: 'burgundy', label: 'Burgundy' },
  { id: 'pastels', label: 'Pastels' },
  { id: 'french', label: 'French' },
  { id: 'pinks', label: 'Pinks' },
  { id: 'blues', label: 'Blues' },
  { id: 'greens', label: 'Greens' },
  { id: 'purples', label: 'Purples' },
  { id: 'metallics', label: 'Metallics' },
  { id: 'darks', label: 'Darks' },
];

const SHAPES = [
  { id: 'round', name: 'Round', icon: '○' },
  { id: 'square', name: 'Square', icon: '□' },
  { id: 'oval', name: 'Oval', icon: '⬭' },
  { id: 'almond', name: 'Almond', icon: '◉' },
  { id: 'coffin', name: 'Coffin', icon: '▭' },
  { id: 'stiletto', name: 'Stiletto', icon: '▲' },
];

type StyleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Style'>;

type Props = {
  navigation: StyleScreenNavigationProp;
};

const PAGE_SIZE = 24;

const finishLabelMap: Record<string, string> = {
  glossy: 'Glossy',
  cream: 'Cream',
  matte: 'Matte',
  chrome: 'Chrome',
  shimmer: 'Shimmer',
  glitter: 'Glitter',
  metallic: 'Metallic',
  sheer: 'Sheer',
  pearl: 'Pearl',
  magnetic: 'Magnetic',
  reflective: 'Reflective',
};

function buildSelectedColor(entry: ColorCatalogEntry): SelectedColor {
  const baseColorId = entry.colorId || entry.colorVariantId || '';
  const variantId = entry.colorVariantId || entry.colorId || baseColorId;
  const canonicalFinish = CANONICAL_FINISHES.includes(
    entry.finish as typeof CANONICAL_FINISHES[number]
  )
    ? (entry.finish as typeof CANONICAL_FINISHES[number])
    : 'glossy';

  return {
    colorId: baseColorId,
    variantId,
    hex: entry.hexCode || '#E5E5E5',
    name: entry.shadeName || entry.colorName || 'Untitled Shade',
    colorName: entry.colorName ?? null,
    brand: entry.brand || 'Unknown Brand',
    productLine: entry.productLine || '',
    shadeCode: entry.shadeCode ?? null,
    collection: entry.collection ?? null,
    finish: canonicalFinish,
    swatchUrl: entry.swatchUrl ?? null,
    sourceCatalog: entry.sourceCatalog ?? null,
    category: entry.category ?? null,
  };
}

const StyleScreen = ({ navigation }: Props) => {
  const theme = useThemeColors();
  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);

  const [brand, setBrand] = useState<typeof BRAND_OPTIONS[number]>('OPI');
  const [productLine, setProductLine] = useState<string>('All');
  const [finish, setFinish] = useState<string>('all');
  const [collection, setCollection] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [hasSwatch, setHasSwatch] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [entries, setEntries] = useState<ColorCatalogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ brand, productLine, finish, collection, category, hasSwatch }),
    [brand, productLine, finish, collection, category, hasSwatch]
  );

  const loadCollections = useCallback(async () => {
    const { data, error: collectionError } = await fetchCollections(brand, productLine);
    if (!collectionError) {
      setCollections(data);
    }
  }, [brand, productLine]);

  const loadColors = useCallback(
    async (nextPage: number, replace = false) => {
      setLoading(true);
      setError(null);
      const { data, error: catalogError, count } = await fetchColorCatalog(
        {
          brand,
          productLine,
          finish: finish as any,
          collection,
          category,
          hasSwatch,
        },
        nextPage,
        PAGE_SIZE
      );
      if (catalogError) {
        setError(catalogError.message);
      } else {
        setEntries((current) => (replace ? data : [...current, ...data]));
        setTotalCount(count);
      }
      setLoading(false);
      setInitialising(false);
    },
    [brand, productLine, finish, collection, category, hasSwatch]
  );

  useEffect(() => {
    setCollection('All');
    setPage(0);
  }, [brand, productLine]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    setEntries([]);
    setPage(0);
    loadColors(0, true);
  }, [filters, loadColors]);

  useEffect(() => {
    if (!entries.length) {
      return;
    }
    if (!selectedColor || !entries.some((entry) => entry.colorVariantId === selectedColor.variantId)) {
      updateSelectedColor(buildSelectedColor(entries[0]));
    }
  }, [entries, selectedColor]);

  const handleSelectColor = (entry: ColorCatalogEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSelectedColor(buildSelectedColor(entry));
  };

  const handleShapeSelect = (shape: { id: string; name: string; icon: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSelectedNail(shape);
  };

  const handleContinue = () => {
    if (!selectedColor || !selectedShape) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      navigation.navigate('Camera');
    }, 120);
  };

  const loadMore = () => {
    if (loading) return;
    if (entries.length >= totalCount) return;
    const next = page + 1;
    setPage(next);
    loadColors(next);
  };

  const renderColorItem = ({ item }: { item: ColorCatalogEntry }) => {
    const isSelected = selectedColor?.variantId === item.colorVariantId;
    return (
      <TouchableOpacity
        style={[styles.colorCard, isSelected && styles.selectedColorCard]}
        onPress={() => handleSelectColor(item)}
        activeOpacity={0.85}
      >
        <View style={styles.swatchWrapper}>
          {item.swatchUrl ? (
            <Image source={{ uri: item.swatchUrl }} style={styles.swatchImage} />
          ) : (
            <View style={[styles.swatchFallback, { backgroundColor: item.hexCode }]} />
          )}
          <View style={styles.swatchOverlay} />
          {isSelected && (
            <Ionicons name="checkmark-circle" size={22} color="white" style={styles.checkIcon} />
          )}
        </View>
        <Text style={styles.shadeName} numberOfLines={1}>
          {item.shadeName}
        </Text>
        <Text style={styles.brandLine} numberOfLines={1}>
          {item.brand} • {item.productLine}
        </Text>
        {item.shadeCode ? (
          <Text style={styles.shadeCode}>#{item.shadeCode}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const selectedMetadata = useMemo(() => {
    if (!selectedColor) return null;
    return [
      `${selectedColor.brand} (${selectedColor.productLine})`,
      selectedColor.shadeCode ? `Shade ${selectedColor.shadeCode}` : null,
      selectedColor.collection || null,
      finishLabelMap[selectedColor.finish] ?? selectedColor.finish,
    ].filter(Boolean);
  }, [selectedColor]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Choose Your Style</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={entries}
        renderItem={renderColorItem}
        keyExtractor={(item) => item.colorVariantId}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View style={styles.filtersWrapper}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Colour</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandSelector}
            >
              {BRAND_OPTIONS.map((option) => {
                const active = option === brand;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.brandChip, active && styles.brandChipActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setBrand(option);
                    }}
                  >
                    <Text style={[styles.brandChipText, active && styles.brandChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <NativeLiquidGlass intensity={theme.glassIntensity} tint={theme.glassTint} style={styles.glassCard}>
              <Text style={styles.filterHeading}>Product Line</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {PRODUCT_LINES[brand].map((line) => {
                  const active = line === productLine;
                  return (
                    <TouchableOpacity
                      key={line}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setProductLine(line);
                      }}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{line}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.filterHeading}>Finish</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {['all', ...CANONICAL_FINISHES].map((value) => {
                  const active = value === finish;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setFinish(value);
                      }}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {value === 'all' ? 'All' : finishLabelMap[value]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.filterHeading}>Family</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {COLOR_FAMILIES.map(({ id, label }) => {
                  const active = id === category;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setCategory(id);
                      }}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.filterHeading}>Collection</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {['All', ...(collections.length ? collections : ['__with_collection__'])].map((value) => {
                  const label = value === '__with_collection__' ? 'Has Collection' : value;
                  const active = value === collection;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setCollection(value);
                      }}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.toggleChip, hasSwatch && styles.toggleChipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setHasSwatch((flag) => !flag);
                }}
              >
                <Ionicons
                  name={hasSwatch ? 'images' : 'images-outline'}
                  size={18}
                  color={hasSwatch ? '#fff' : '#333'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.toggleChipText, hasSwatch && styles.toggleChipTextActive]}>Only with swatch</Text>
              </TouchableOpacity>
            </NativeLiquidGlass>

            <View style={styles.divider} />
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Tap a swatch to preview it on your look</Text>
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.listFooter}>
            {loading && <ActivityIndicator color={theme.accent} />}
            {!loading && entries.length >= totalCount && totalCount > 0 && (
              <Text style={[styles.reachedEndText, { color: theme.textSecondary }]}>You’ve reached the end</Text>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}
        onEndReachedThreshold={0.2}
        onEndReached={loadMore}
        ListEmptyComponent={
          initialising ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={theme.accent} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>Loading catalogue…</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No colours found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters.</Text>
            </View>
          )
        }
      />

      <View style={styles.bottomSheet}>
        <View style={styles.selectionSummary}>
          <View style={styles.selectionSwatchWrapper}>
            {selectedColor?.swatchUrl ? (
              <Image source={{ uri: selectedColor.swatchUrl }} style={styles.selectionSwatchImage} />
            ) : (
              <View
                style={[
                  styles.selectionSwatchFallback,
                  { backgroundColor: selectedColor?.hex || '#FF69B4' },
                ]}
              />
            )}
          </View>
          <View style={styles.selectionTextWrapper}>
            <Text style={styles.selectionTitle} numberOfLines={1}>
              {selectedColor ? selectedColor.name : 'Select a colour'}
            </Text>
            {selectedMetadata?.length ? (
              <Text style={styles.selectionMeta} numberOfLines={2}>
                {selectedMetadata.join(' • ')}
              </Text>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shapeRow}>
          {SHAPES.map((shape) => {
            const active = selectedShape?.id === shape.id;
            return (
              <TouchableOpacity
                key={shape.id}
                style={[styles.shapeChip, active && styles.shapeChipActive]}
                onPress={() => handleShapeSelect(shape)}
              >
                <Text style={[styles.shapeIcon, active && styles.shapeIconActive]}>{shape.icon}</Text>
                <Text style={[styles.shapeLabel, active && styles.shapeLabelActive]}>{shape.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[styles.continueButton, (!selectedColor || !selectedShape) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedColor || !selectedShape}
        >
          <Text style={styles.continueText}>
            {selectedColor && selectedShape ? 'Continue to Camera' : 'Select colour & shape'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StyleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filtersWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  brandSelector: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  brandChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginRight: 10,
  },
  brandChipActive: {
    backgroundColor: '#e70a5a',
  },
  brandChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  brandChipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  glassCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
  },
  filterHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#777',
  },
  filterRow: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#e70a5a',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  toggleChipActive: {
    backgroundColor: '#e70a5a',
  },
  toggleChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  toggleChipTextActive: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 220,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  colorCard: {
    width: (width - 60) / 2,
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  selectedColorCard: {
    borderWidth: 2,
    borderColor: '#e70a5a',
  },
  swatchWrapper: {
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchImage: {
    width: '100%',
    height: '100%',
  },
  swatchFallback: {
    width: '100%',
    height: '100%',
  },
  swatchOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  shadeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  brandLine: {
    fontSize: 12,
    marginTop: 3,
    color: '#666',
  },
  shadeCode: {
    fontSize: 11,
    marginTop: 2,
    color: '#888',
  },
  listFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reachedEndText: {
    fontSize: 12,
  },
  errorText: {
    color: '#d33',
    fontSize: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionSwatchWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
  },
  selectionSwatchImage: {
    width: '100%',
    height: '100%',
  },
  selectionSwatchFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  selectionTextWrapper: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  selectionMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  shapeRow: {
    paddingVertical: 6,
  },
  shapeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginRight: 8,
  },
  shapeChipActive: {
    backgroundColor: '#e70a5a',
  },
  shapeIcon: {
    fontSize: 13,
    color: '#444',
    marginRight: 6,
  },
  shapeIconActive: {
    color: '#fff',
  },
  shapeLabel: {
    fontSize: 13,
    color: '#444',
  },
  shapeLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 12,
    backgroundColor: '#e70a5a',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
