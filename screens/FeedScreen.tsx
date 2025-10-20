import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useColorScheme';
import { supabase } from '../lib/supabase';
import { getUserLooks } from '../lib/supabaseStorage';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 2; // 2 columns with minimal spacing

type SavedLook = {
  id: string;
  originalImage: string;
  transformedImage: string;
  colorName: string;
  colorHex: string;
  shapeName: string;
  createdAt: string;
  colorBrand?: string | null;
  productLine?: string | null;
  shadeCode?: string | null;
  collection?: string | null;
  swatchUrl?: string | null;
  colorFinish?: string | null;
  colorVariantId?: string | null;
};

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const theme = useThemeColors();
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedLooks();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedLooks();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSavedLooks = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const remoteLooks = await getUserLooks(session.user.id);
        if (remoteLooks && remoteLooks.length) {
          const mapped: SavedLook[] = remoteLooks.map((look: any) => ({
            id: look.id,
            originalImage: look.original_image_url,
            transformedImage: look.transformed_image_url,
            colorName: look.color_name,
            colorHex: look.color_hex,
            shapeName: look.shape_name,
            createdAt: look.created_at,
            colorBrand: look.color_brand ?? look.color_variant?.brand ?? null,
            productLine: look.product_line ?? look.color_variant?.product_line ?? null,
            shadeCode: look.shade_code ?? look.color_variant?.shade_code ?? null,
            collection: look.collection ?? look.color_variant?.collection ?? null,
            swatchUrl: look.swatch_url ?? look.color_variant?.swatch_url ?? null,
            colorFinish: look.color_finish ?? look.color_variant?.finish_override ?? null,
            colorVariantId: look.color_variant_id ?? null,
          }));
          setSavedLooks(mapped);
          await AsyncStorage.setItem('savedLooks', JSON.stringify(mapped));
          return;
        }
      }

      const saved = await AsyncStorage.getItem('savedLooks');
      if (saved) {
        setSavedLooks(JSON.parse(saved));
      } else {
        setSavedLooks([]);
      }
    } catch (error) {
      console.error('Error loading saved looks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Profile');
  };

  const handleLookPress = (look: SavedLook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to detail view or perform action
  };

  const renderLookItem = ({ item, index }: { item: SavedLook; index: number }) => {
    const isLeft = index % 2 === 0;
    
    return (
      <TouchableOpacity
        style={[styles.lookItem, isLeft && styles.lookItemLeft]}
        onPress={() => handleLookPress(item)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: item.transformedImage }}
          style={styles.lookImage}
        />
        <View style={styles.lookOverlay}>
          <View style={styles.lookInfo}>
            <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lookText} numberOfLines={1}>
                {item.colorName}
              </Text>
              {item.colorBrand ? (
                <Text style={styles.lookMeta} numberOfLines={1}>
                  {item.colorBrand}
                  {item.productLine ? ` · ${item.productLine}` : ''}
                  {item.shadeCode ? ` · ${item.shadeCode}` : ''}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="camera-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Looks Yet</Text>
      <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
        Start creating your nail looks
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.createButtonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Beautiful gradient background */}
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientMiddle, theme.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Looks</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-circle-outline" size={32} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
          <Text style={[styles.filterTabText, styles.filterTabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Compare</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
        </View>
      ) : savedLooks.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={savedLooks}
          renderItem={renderLookItem}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}
      
      {/* Floating Liquid Glass Tab Bar */}
      <LiquidGlassTabBar
        tabs={[
          { icon: 'color-palette', label: 'Design', route: 'Design' },
          { icon: 'camera', label: 'Camera', route: 'Camera' },
          { icon: 'grid', label: 'Feed', route: 'Feed' },
        ]}
        activeTab="Feed"
        onTabPress={(route) => {
          if (route === 'Camera') {
            setTimeout(() => navigation.navigate('Camera'), 120);
          } else if (route === 'Design') {
            navigation.navigate('Design');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  filterTab: {
    marginRight: 20,
    paddingBottom: 5,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF69B4',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingBottom: 100, // Space for floating nav bar
  },
  lookItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    marginBottom: 2,
    marginRight: 2,
    backgroundColor: '#111',
  },
  lookItemLeft: {
    marginRight: 2,
  },
  lookImage: {
    width: '100%',
    height: '100%',
  },
  lookOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  lookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lookText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },
  lookMeta: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
