import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets, SafeAreaView, EdgeInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import { NativeLiquidGlass } from '../components/ui/NativeLiquidGlass';
import { useThemeColors } from '../hooks/useColorScheme';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import {
  CANONICAL_FINISHES,
  updateSelectedColor,
  updateSelectedNail,
  useSelectionStore,
} from '../lib/selectedData';

import {
  CategorySummary,
  ColorCatalogEntry,
  fetchCategorySummaries,
  fetchColorCatalog,
} from '../src/services/colorCatalog';

const { width } = Dimensions.get('window');

const GRID_COLUMNS = 3;
const GRID_GAP = 16;
const GRID_SIDE_INSET = 16;
const CARD_WIDTH = (width - GRID_SIDE_INSET * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const BRAND_OPTIONS = ['OPI', 'CND', 'The GelBottle Inc.'] as const;
type PrimaryFilterId = 'all' | 'trending' | typeof BRAND_OPTIONS[number];

const PRODUCT_LINES: Record<string, string[]> = {
  OPI: ['All', 'Nail Lacquer', 'Infinite Shine', 'GelColor'],
  CND: ['All', 'Shellac', 'Vinylux'],
  'The GelBottle Inc.': ['All', 'GelColor', 'BIAB'],
};

const CANONICAL_CATEGORY_ORDER = [
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

const CATEGORY_METADATA: Record<string, { label: string; swatchColor: string }> = {
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

const CATEGORY_ORDER_MAP = CANONICAL_CATEGORY_ORDER.reduce<Record<string, number>>((acc, value, index) => {
  acc[value] = index;
  return acc;
}, {});

const SHAPES = [
  { id: 'keep', name: 'Keep Current' },
  { id: 'round', name: 'Round', icon: '○' },
  { id: 'square', name: 'Square', icon: '□' },
  { id: 'squoval', name: 'Squoval', icon: '◐' },
  { id: 'oval', name: 'Oval', icon: '⬭' },
  { id: 'almond', name: 'Almond', icon: '◉' },
  { id: 'coffin', name: 'Coffin', icon: '▭' },
  { id: 'stiletto', name: 'Stiletto', icon: '▲' },
];

const PAGE_SIZE = 24;


type CategoryListItem =
  | { id: 'All'; label: string; swatchColor: string; kind: 'all' }
  | { id: string; label: string; swatchColor: string; kind: 'category' }
  | { id: '__loader__'; kind: 'loader' };

function buildSelectedColor(entry: ColorCatalogEntry) {
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
function computeLengthForShape(shapeId: string) {
  switch (shapeId) {
    case 'stiletto':
    case 'coffin':
      return { id: 'long', name: 'Long', value: 0.8 };
    case 'almond':
      return { id: 'medium-long', name: 'Medium Long', value: 0.65 };
    case 'square':
    case 'squoval':
      return { id: 'medium', name: 'Medium', value: 0.5 };
    case 'round':
      return { id: 'short', name: 'Short', value: 0.3 };
    default:
      return { id: 'medium', name: 'Medium', value: 0.5 };
  }
}

const DesignScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useThemeColors();
  const { status } = useSubscriptionStatus();
  const insets = useSafeAreaInsets();
  const isPremium = status !== 'free';

  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);

  const [brand, setBrand] = useState<typeof BRAND_OPTIONS[number]>('OPI');
  const [productLine, setProductLine] = useState<string>('All');
  const [finishFilter, setFinishFilter] = useState<'all' | (typeof CANONICAL_FINISHES)[number]>('all');
  const [collection, setCollection] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [hasSwatch, setHasSwatch] = useState(false);
  const [activePrimaryFilter, setActivePrimaryFilter] = useState<PrimaryFilterId>('all');
  const [entries, setEntries] = useState<ColorCatalogEntry[]>([]);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<{ imageUri: string; base64?: string } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const isNavigatingRef = useRef(false);
  const categoryListRef = useRef<FlatList<CategoryListItem> | null>(null);

  const isTrendingActive = activePrimaryFilter === 'trending';

  const effectiveBrand = useMemo(() => {
    if (activePrimaryFilter === 'all' || isTrendingActive) {
      return undefined;
    }
    return activePrimaryFilter as typeof BRAND_OPTIONS[number];
  }, [activePrimaryFilter, isTrendingActive]);

  const effectiveCategory = useMemo(() => {
    if (isTrendingActive) {
      return 'All';
    }
    return category;
  }, [isTrendingActive, category]);

  const filters = useMemo(
    () => ({
      brand: effectiveBrand,
      productLine: effectiveBrand ? productLine : 'All',
      finish: finishFilter,
      collection: effectiveBrand ? collection : 'All',
      category: effectiveCategory,
      hasSwatch,
      isTrending: isTrendingActive,
    }),
    [
      effectiveBrand,
      productLine,
      finishFilter,
      collection,
      effectiveCategory,
      hasSwatch,
      isTrendingActive,
    ]
  );

  const canContinue = useMemo(() => {
    return Boolean(selectedColor && selectedShape && selectedShape.id !== 'keep');
  }, [selectedColor, selectedShape]);

  const loadColors = useCallback(
    async (nextPage: number, replace = false) => {
      setLoading(true);
      setError(null);
      const { data, error: catalogError, count } = await fetchColorCatalog(
        filters,
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
    [filters]
  );

  useEffect(() => {
    if (!effectiveBrand) {
      setProductLine('All');
      setCollection('All');
    }
  }, [effectiveBrand]);

  useEffect(() => {
    let isActive = true;
    setLoadingCategories(true);

    fetchCategorySummaries(effectiveBrand)
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          console.error('Error loading category summaries:', error);
          setCategorySummaries([]);
        } else {
          setCategorySummaries(data);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingCategories(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [effectiveBrand]);

  useEffect(() => {
    if (category === 'All') {
      return;
    }

    if (!categorySummaries.some((summary) => summary.category === category)) {
      setCategory('All');
    }
  }, [categorySummaries, category]);

  useEffect(() => {
    setEntries([]);
    setPage(0);
    loadColors(0, true);
  }, [filters, loadColors]);

  useEffect(() => {
    if (!entries.length) return;
    // Only auto-select on initial page load for a filter set to avoid
    // repeated updates when paginating through additional pages
    if (page === 0 && (!selectedColor || !entries.some((e) => e.colorVariantId === selectedColor.variantId))) {
      updateSelectedColor(buildSelectedColor(entries[0]));
    }
  }, [entries, selectedColor, page]);

  useEffect(() => {
    const loadPendingPhoto = async () => {
      try {
        const stored = await AsyncStorage.getItem('pendingPhoto');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.imageUri) {
            setPendingPhoto({
              imageUri: parsed.imageUri,
            });
          } else {
            setPendingPhoto(null);
          }
        } else {
          setPendingPhoto(null);
        }
      } catch (err) {
        console.error('Error loading pending photo:', err);
      }
    };

    loadPendingPhoto();

    if (route.params?.fromCamera && route.params?.photoData) {
      setPendingPhoto(route.params.photoData);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [route.params, fadeAnim, slideAnim]);

  useEffect(() => {
    if (!isPremium) {
      const almond = SHAPES.find((shape) => shape.id === 'almond');
      if (almond) {
        const length = computeLengthForShape(almond.id);
        updateSelectedNail(almond, length);
      }
    }
  }, [isPremium]);

  const handleBrandSelect = (option: string) => {
    Haptics.selectionAsync();
    setBrand(option as typeof BRAND_OPTIONS[number]);
    setProductLine('All');
  };

  const handleColorSelect = (entry: ColorCatalogEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSelectedColor(buildSelectedColor(entry));
  };

  const handleShapeSelect = (shape: { id: string; name: string; icon?: string }) => {
    if (!isPremium && shape.id !== 'almond' && shape.id !== 'keep') {
      navigation.navigate('Upgrade');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const length = computeLengthForShape(shape.id);
    updateSelectedNail(shape, length);
  };

  const handleContinue = () => {
    if (!selectedColor || !selectedShape || selectedShape.id === 'keep') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (isNavigatingRef.current) {
      return;
    }
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const navigateToProcessing = (imageUri: string, base64?: string) => {
      navigation.navigate('Processing' as never, {
        imageUri,
        base64,
      });
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 250);
    };

    if (pendingPhoto?.imageUri) {
      AsyncStorage.removeItem('pendingPhoto').catch((err) => console.error('Error clearing photo:', err));
      setTimeout(() => {
        navigateToProcessing(pendingPhoto.imageUri, pendingPhoto.base64);
      }, 120);
    } else {
      setTimeout(() => {
        navigation.navigate('Camera');
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 250);
      }, 120);
    }
  };

  const loadMore = () => {
    if (loading || entries.length >= totalCount) {
      return;
    }
    const next = page + 1;
    setPage(next);
    loadColors(next);
  };

  const primaryFilters = useMemo(
    () => {
      const brandFilters = BRAND_OPTIONS.map((option) => ({
        id: option as PrimaryFilterId,
        label: option === 'The GelBottle Inc.' ? 'TGB' : option,
      }));
      return [
        { id: 'all' as PrimaryFilterId, label: 'All' },
        { id: 'trending' as PrimaryFilterId, label: 'Trending' },
        ...brandFilters,
      ];
    },
    []
  );

  const familyOptions = useMemo(() => {
    if (!categorySummaries.length) {
      return [] as Array<{ id: string; label: string; swatchColor: string }>;
    }

    const recognized: Array<{ id: string; label: string; swatchColor: string; order: number }>
      = [];
    const extras: Array<{ id: string; label: string; swatchColor: string }> = [];

    categorySummaries.forEach(({ category: familyId }) => {
      if (!familyId) {
        return;
      }

      const metadata = CATEGORY_METADATA[familyId];
      const option = {
        id: familyId,
        label:
          metadata?.label ?? familyId.charAt(0).toUpperCase() + familyId.slice(1),
        swatchColor: metadata?.swatchColor ?? '#E5E5E5',
      };

      if (CATEGORY_ORDER_MAP[familyId] !== undefined) {
        recognized.push({ ...option, order: CATEGORY_ORDER_MAP[familyId] });
      } else {
        extras.push(option);
      }
    });

    recognized.sort((a, b) => a.order - b.order);
    extras.sort((a, b) => a.label.localeCompare(b.label));

    return [
      ...recognized.map(({ order, ...rest }) => rest),
      ...extras,
    ];
  }, [categorySummaries]);

  const categoryListData = useMemo(() => {
    const baseItems: CategoryListItem[] = familyOptions.map((family) => ({
      id: family.id,
      label: family.label,
      swatchColor: family.swatchColor,
      kind: 'category',
    }));

    const items: CategoryListItem[] = [
      { id: 'All', label: 'All', swatchColor: '#D9DBE1', kind: 'all' },
      ...baseItems,
    ];

    if (loadingCategories && !familyOptions.length) {
      items.push({ id: '__loader__', kind: 'loader' });
    }

    return items;
  }, [familyOptions, loadingCategories]);

  const categoryScrollResetKey = useMemo(
    () => `${effectiveBrand ?? 'all'}|${isTrendingActive ? 1 : 0}|${categoryListData.length}`,
    [effectiveBrand, isTrendingActive, categoryListData.length]
  );

  const handlePrimaryFilterSelect = useCallback(
    (filterId: PrimaryFilterId) => {
      setActivePrimaryFilter(filterId);

      if (filterId === 'all') {
        setProductLine('All');
        setFinishFilter('all');
        setCollection('All');
        setCategory('All');
        setHasSwatch(false);
        return;
      }

      if (filterId === 'trending') {
        setProductLine('All');
        setFinishFilter('all');
        setCollection('All');
        setCategory('All');
        setHasSwatch(false);
        return;
      }

      const nextBrand = filterId as typeof BRAND_OPTIONS[number];
      if (brand !== nextBrand) {
        setBrand(nextBrand);
      }
      setProductLine('All');
      setFinishFilter('all');
      setCollection('All');
      setCategory('All');
    },
    [brand]
  );

  const handleCategorySelect = useCallback(
    (familyId: string) => {
      if (activePrimaryFilter === 'trending') {
        setActivePrimaryFilter('all');
      }
      setCategory((current) => (current === familyId ? 'All' : familyId));
    },
    [activePrimaryFilter]
  );

  const handleCategoryClear = useCallback(() => {
    if (activePrimaryFilter === 'trending') {
      setActivePrimaryFilter('all');
    }
    setCategory('All');
  }, [activePrimaryFilter]);

  const listHeader = useMemo(
    () => (
      <DesignListHeader
        insets={insets}
        primaryFilters={primaryFilters}
        activePrimaryFilter={activePrimaryFilter}
        onPrimaryFilterSelect={handlePrimaryFilterSelect}
        categoryListData={categoryListData}
        effectiveCategory={effectiveCategory}
        onCategorySelect={handleCategorySelect}
        onCategoryClear={handleCategoryClear}
        categoryListRef={categoryListRef}
        scrollResetKey={categoryScrollResetKey}
      />
    ),
    [
      insets,
      primaryFilters,
      activePrimaryFilter,
      handlePrimaryFilterSelect,
      categoryListData,
      effectiveCategory,
      handleCategorySelect,
      handleCategoryClear,
      categoryScrollResetKey,
    ]
  );

  const renderColorItem = ({ item, index }: { item: ColorCatalogEntry; index: number }) => {
    const isSelected = selectedColor?.variantId === item.colorVariantId;
    const columnPosition = index % GRID_COLUMNS;

    return (
      <TouchableOpacity
        style={[
          styles.colorItem,
          columnPosition !== GRID_COLUMNS - 1 && { marginRight: GRID_GAP },
          isSelected && styles.colorItemSelected,
        ]}
        activeOpacity={0.85}
        onPress={() => handleColorSelect(item)}
      >
        <View style={[styles.colorTile, { backgroundColor: item.hexCode || '#E5E5E5' }]} />
        <Text style={[styles.shadeName, isSelected && styles.shadeNameSelected]} numberOfLines={1}>
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

  const renderFooter = () => (
    <View style={styles.listFooter}>
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      {!loading && entries.length >= totalCount && totalCount > 0 ? (
        <Text style={styles.reachedEndText}>You’ve reached the end</Text>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {initialising ? (
        <ActivityIndicator color={theme.accent} />
      ) : (
        <>
          <Ionicons name="color-palette-outline" size={40} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No colours match those filters</Text>
          <Text style={styles.emptySubtitle}>Try adjusting brand, finish, or family.</Text>
        </>
      )}
    </View>
  );

  const shapeDockInsetLeft = Math.max(insets.left, 16);
  const shapeDockInsetRight = Math.max(insets.right, 16);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right', 'bottom']}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientMiddle, theme.gradientEnd]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5, 1]}
      />

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <FlatList
          data={entries}
          keyExtractor={(item) => item.colorVariantId}
          numColumns={3}
          renderItem={renderColorItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.2}
          onEndReached={loadMore}
        />
      </Animated.View>

      <View
        style={[
          styles.shapeSheetWrapper,
          {
            bottom: insets.bottom + 80,
            left: shapeDockInsetLeft,
            right: shapeDockInsetRight,
          },
        ]}
      >
        <NativeLiquidGlass
          style={styles.shapeSheet}
          intensity={92}
          tint="light"
          cornerRadius={34}
          borderWidth={0.8}
        >
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.shapeSheetSheen}
          />

          <View style={styles.shapeContent}>
            <Text style={styles.shapeSheetTitle}>Select Shape</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shapeScroll}
            >
              {SHAPES.map((shape) => {
                const active = selectedShape?.id === shape.id;
                const locked = !isPremium && shape.id !== 'almond' && shape.id !== 'keep';
                const label = shape.id === 'keep' ? 'None' : shape.name;
                return (
                  <TouchableOpacity
                    key={shape.id}
                    onPress={() => handleShapeSelect(shape)}
                    style={[styles.shapeChip, active && styles.shapeChipActive, locked && styles.shapeChipLocked]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.shapeChipText, active && styles.shapeChipTextActive]}>{label}</Text>
                    {locked && (
                      <Ionicons
                        name="lock-closed"
                        size={12}
                        color="rgba(60,60,67,0.6)"
                        style={styles.lockIconSmall}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {canContinue ? (
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.88}>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#111" />
              </TouchableOpacity>
            ) : null}
          </View>
        </NativeLiquidGlass>
      </View>

      <LiquidGlassTabBar
        tabs={[
          { icon: 'color-palette', label: 'Design', route: 'Design' },
          { icon: 'camera', label: 'Camera', route: 'Camera' },
          { icon: 'grid', label: 'Feed', route: 'Feed' },
        ]}
        activeTab="Design"
        onTabPress={(route) => {
          if (route === 'Camera') {
            setTimeout(() => {
              navigation.navigate('Camera');
            }, 120);
          } else if (route === 'Feed') {
            navigation.navigate('Feed');
          }
        }}
      />
    </SafeAreaView>
  );
};

export default DesignScreen;

type DesignListHeaderProps = {
  insets: EdgeInsets;
  primaryFilters: { id: PrimaryFilterId; label: string }[];
  activePrimaryFilter: PrimaryFilterId;
  onPrimaryFilterSelect: (filterId: PrimaryFilterId) => void;
  categoryListData: CategoryListItem[];
  effectiveCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onCategoryClear: () => void;
  categoryListRef: React.RefObject<FlatList<CategoryListItem> | null>;
  scrollResetKey: string;
};

const DesignListHeader = React.memo((props: DesignListHeaderProps) => {
  const {
    insets,
    primaryFilters,
    activePrimaryFilter,
    onPrimaryFilterSelect,
    categoryListData,
    effectiveCategory,
    onCategorySelect,
    onCategoryClear,
    categoryListRef,
    scrollResetKey,
  } = props;

  const primaryContainerWidthRef = useRef(0);
  const categoryContainerWidthRef = useRef(0);
  const primaryContentWidthRef = useRef(0);
  const categoryContentWidthRef = useRef(0);
  const [primaryScrollState, setPrimaryScrollState] = useState({ canScroll: false, atStart: true, atEnd: true });
  const [categoryScrollState, setCategoryScrollState] = useState({ canScroll: false, atStart: true, atEnd: true });

  const updateScrollState = useCallback(
    (
      contentWidth: number,
      containerWidth: number,
      setter: React.Dispatch<React.SetStateAction<{ canScroll: boolean; atStart: boolean; atEnd: boolean }>>
    ) => {
      const canScroll = contentWidth > containerWidth + 2;
      setter((previous) => {
        if (
          previous.canScroll === canScroll &&
          previous.atStart === true &&
          previous.atEnd === !canScroll
        ) {
          return previous;
        }
        return {
          canScroll,
          atStart: true,
          atEnd: !canScroll,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (categoryListRef.current) {
      categoryListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
    setCategoryScrollState((previous) => ({
      ...previous,
      atStart: true,
      atEnd: !previous.canScroll,
    }));
  }, [scrollResetKey, categoryListRef]);

  const horizontalInsetLeft = Math.max(insets.left, 16);
  const horizontalInsetRight = Math.max(insets.right, 16);

  const basePeek = Math.max(horizontalInsetRight - 12, 0);
  const primaryPaddingRight = primaryScrollState.canScroll ? basePeek : horizontalInsetRight;
  const categoryPaddingRight = categoryScrollState.canScroll ? basePeek : horizontalInsetRight;
  const primaryPeekStyle = primaryScrollState.canScroll && basePeek ? { marginRight: -basePeek } : null;
  const categoryPeekStyle = categoryScrollState.canScroll && basePeek ? { marginRight: -basePeek } : null;

  const categoryLeftChevronColor = categoryScrollState.canScroll && !categoryScrollState.atStart
    ? 'rgba(31,31,31,0.6)'
    : 'rgba(31,31,31,0.28)';
  const categoryRightChevronColor = categoryScrollState.canScroll && !categoryScrollState.atEnd
    ? 'rgba(31,31,31,0.6)'
    : 'rgba(31,31,31,0.28)';

  return (
    <View
      style={[
        styles.listHeaderContainer,
        {
          paddingTop: Math.max(insets.top - 6, 12),
          paddingLeft: horizontalInsetLeft,
          paddingRight: horizontalInsetRight,
        },
      ]}
    >
      <View style={[styles.heroHeader, { paddingTop: 0 }]}>
        <Text style={styles.heroTitleText}>Design</Text>

        <View style={[styles.horizontalScrollContainer, primaryPeekStyle]}>
          <ScrollView
            onLayout={(event) => {
              primaryContainerWidthRef.current = event.nativeEvent.layout.width;
              updateScrollState(
                primaryContentWidthRef.current,
                primaryContainerWidthRef.current,
                setPrimaryScrollState
              );
            }}
            onContentSizeChange={(contentWidth: number) => {
              primaryContentWidthRef.current = contentWidth;
              updateScrollState(
                contentWidth,
                primaryContainerWidthRef.current,
                setPrimaryScrollState
              );
            }}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const atStart = contentOffset.x <= 2;
              const maxOffset = Math.max(contentSize.width - layoutMeasurement.width, 0);
              const clampedOffset = Math.max(0, Math.min(contentOffset.x, maxOffset));
              const atEnd = clampedOffset >= maxOffset - 2;
              setPrimaryScrollState((current) => {
                if (current.atStart === atStart && current.atEnd === atEnd) {
                  return current;
                }
                return { ...current, atStart, atEnd };
              });
            }}
            scrollEventThrottle={16}
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled
            contentContainerStyle={[
              styles.primaryFiltersScroller,
              { paddingRight: primaryPaddingRight },
            ]}
          >
            {primaryFilters.map((filter) => {
              const active = activePrimaryFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.primaryFilterChip, active && styles.primaryFilterChipActive]}
                  activeOpacity={0.85}
                  onPress={() => onPrimaryFilterSelect(filter.id)}
                >
                  <Text style={[styles.primaryFilterText, active && styles.primaryFilterTextActive]}>{filter.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesHeaderIndicators}>
            <Ionicons name="chevron-back" size={12} color={categoryLeftChevronColor} />
            <Ionicons
              name="chevron-forward"
              size={12}
              color={categoryRightChevronColor}
              style={styles.categoriesHeaderIndicatorIcon}
            />
          </View>
        </View>
        <View style={[styles.horizontalScrollContainer, categoryPeekStyle]}>
          <FlatList
            ref={categoryListRef}
            data={categoryListData}
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled
            keyExtractor={(item) => item.id}
            extraData={effectiveCategory}
            contentContainerStyle={[
              styles.categoriesScroller,
              { paddingRight: categoryPaddingRight },
            ]}
            onLayout={(event) => {
              categoryContainerWidthRef.current = event.nativeEvent.layout.width;
              updateScrollState(
                categoryContentWidthRef.current,
                categoryContainerWidthRef.current,
                setCategoryScrollState
              );
            }}
            onContentSizeChange={(contentWidth: number) => {
              categoryContentWidthRef.current = contentWidth;
              updateScrollState(
                contentWidth,
                categoryContainerWidthRef.current,
                setCategoryScrollState
              );
            }}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const atStart = contentOffset.x <= 2;
              const atEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 2;
              setCategoryScrollState((current) => {
                if (current.atStart === atStart && current.atEnd === atEnd) {
                  return current;
                }
                return { ...current, atStart, atEnd };
              });
            }}
            scrollEventThrottle={16}
            bounces
            nestedScrollEnabled
            renderItem={({ item }) => {
              if (item.kind === 'loader') {
                return (
                  <View style={styles.categoryLoader}>
                    <ActivityIndicator size="small" color="rgba(99,99,102,0.8)" />
                  </View>
                );
              }

              const active = item.id === 'All' ? effectiveCategory === 'All' : effectiveCategory === item.id;
              const onPress = item.kind === 'all' ? onCategoryClear : () => onCategorySelect(item.id);

              return (
                <TouchableOpacity
                  style={[styles.categoryCard, active && styles.categoryCardActive]}
                  activeOpacity={0.85}
                  delayPressIn={40}
                  onPress={onPress}
                >
                  <View style={[styles.categorySwatch, { backgroundColor: item.swatchColor }]} />
                  <Text style={[styles.categoryCardLabel, active && styles.categoryCardLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Browse colours</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listHeaderContainer: {
    paddingBottom: 16,
  },
  heroHeader: {
    paddingHorizontal: 0,
  },
  heroTitleText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#E65A8F',
    letterSpacing: -0.4,
  },
  primaryFiltersScroller: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingLeft: 0,
  },
  primaryFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(118,118,128,0.12)',
    marginRight: 10,
  },
  primaryFilterChipActive: {
    backgroundColor: 'rgba(231,10,90,0.18)',
  },
  primaryFilterText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f1f1f',
  },
  primaryFilterTextActive: {
    color: '#111111',
    fontWeight: '600',
  },
  categoriesSection: {
    marginTop: 12,
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  categoriesScroller: {
    paddingRight: 0,
  },
  horizontalScrollContainer: {
    position: 'relative',
  },
  categoriesHeaderIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoriesHeaderIndicatorIcon: {
    marginLeft: 6,
  },
  categoryCard: {
    width: 54,
    alignItems: 'center',
    marginRight: 16,
  },
  categoryLoader: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryCardActive: {
    transform: [{ translateY: -2 }],
  },
  categorySwatch: {
    width: 43,
    height: 43,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryCardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f1f1f',
    textAlign: 'center',
  },
  categoryCardLabelActive: {
    color: '#111111',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 260,
    paddingHorizontal: GRID_SIDE_INSET,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  colorItem: {
    width: CARD_WIDTH,
    marginBottom: GRID_GAP,
    alignItems: 'flex-start',
  },
  colorItemSelected: {
    transform: [{ translateY: -2 }],
  },
  colorTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  shadeName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(31,31,31,0.9)',
  },
  shadeNameSelected: {
    color: '#111111',
  },
  brandLine: {
    fontSize: 11,
    color: 'rgba(60,60,67,0.7)',
    marginTop: 4,
  },
  shadeCode: {
    fontSize: 10,
    color: 'rgba(60,60,67,0.6)',
    marginTop: 2,
  },
  listFooter: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  reachedEndText: {
    fontSize: 12,
    color: 'rgba(60,60,67,0.6)',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.8)',
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(60,60,67,0.6)',
    marginTop: 6,
  },
  shapeSheetWrapper: {
    position: 'absolute',
    shadowColor: 'rgba(24,24,28,0.45)',
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  shapeSheet: {
    borderRadius: 34,
    position: 'relative',
  },
  shapeSheetSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.55,
  },
  shapeContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  shapeSheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  shapeScroll: {
    paddingRight: 12,
    paddingLeft: 2,
  },
  shapeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shapeChipActive: {
    backgroundColor: 'rgba(231,10,90,0.24)',
    borderColor: 'rgba(231,10,90,0.45)',
  },
  shapeChipLocked: {
    opacity: 0.5,
  },
  shapeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f1f1f',
  },
  shapeChipTextActive: {
    color: '#111111',
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF9BC5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginRight: 8,
  },
  lockIconSmall: {
    marginLeft: 6,
  },
});
