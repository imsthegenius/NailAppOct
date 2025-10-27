import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getUserLooks } from '../lib/supabaseStorage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type MyLooksScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyLooks'>;

type Props = {
  navigation: MyLooksScreenNavigationProp;
};

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
  originalImageStorageBucket?: string | null;
  originalImageStoragePath?: string | null;
  transformedImageStorageBucket?: string | null;
  transformedImageStoragePath?: string | null;
};

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 40 - 8) / 3; // 3 columns with spacing

export default function MyLooksScreen({ navigation }: Props) {
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLook, setPreviewLook] = useState<SavedLook | null>(null);

  useEffect(() => {
    loadSavedLooks();
  }, []);

  useEffect(() => {
    // Add listener for when screen comes into focus
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
            originalImageStorageBucket: look.original_image_storage_bucket ?? null,
            originalImageStoragePath: look.original_image_storage_path ?? null,
            transformedImageStorageBucket: look.transformed_image_storage_bucket ?? null,
            transformedImageStoragePath: look.transformed_image_storage_path ?? null,
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

  const handleViewLook = (look: SavedLook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewLook(look);
  };

  const handleDeleteLook = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Look',
      'Are you sure you want to delete this look?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user?.id) {
                await supabase.from('saved_looks').delete().eq('id', id).eq('user_id', session.user.id);
              }
              const updatedLooks = savedLooks.filter(l => l.id !== id);
              await AsyncStorage.setItem('savedLooks', JSON.stringify(updatedLooks));
              setSavedLooks(updatedLooks);
              setPreviewLook((current) => (current?.id === id ? null : current));
            } catch (error) {
              console.error('Error deleting look:', error);
              Alert.alert('Error', 'Failed to delete look. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderLookItem = ({ item }: { item: SavedLook }) => {
    return (
      <TouchableOpacity
        style={styles.lookItem}
        onPress={() => handleViewLook(item)}
        onLongPress={() => handleDeleteLook(item.id)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.transformedImage }}
          style={styles.lookImage}
        />
        {/* Look info */}
        <View style={styles.lookInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: item.colorHex }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lookLabel} numberOfLines={1}>
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
        <Text style={styles.shapeLabel} numberOfLines={1}>{item.shapeName}</Text>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No Saved Looks Yet</Text>
      <Text style={styles.emptyStateText}>
        Your saved nail transformations will appear here
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Main', { screen: 'Design' })}
      >
        <Text style={styles.emptyStateButtonText}>Create Your First Look</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2A0B20', '#E70A5A']}
        start={{ x: 0.1, y: 0.9 }}
        end={{ x: 0.9, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Looks</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subheading}>Everything you’ve saved lives here. Tap a look to preview it full screen.</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : savedLooks.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={savedLooks}
            renderItem={renderLookItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.gridSpacer} />}
          />
        )}

        {savedLooks.length > 0 && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>{savedLooks.length} saved looks</Text>
          </View>
        )}
      </View>

      <Modal visible={!!previewLook} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Image source={{ uri: previewLook?.transformedImage }} style={styles.modalImage} />
            <View style={styles.modalInfoRow}>
              <View style={[styles.colorIndicator, { backgroundColor: previewLook?.colorHex || '#fff' }]} />
              <View style={styles.modalTextBlock}>
                <Text style={styles.modalTitle}>{previewLook?.colorName}</Text>
                {previewLook?.colorBrand ? (
                  <Text style={styles.modalSubtitle}>
                    {previewLook.colorBrand}
                    {previewLook.productLine ? ` · ${previewLook.productLine}` : ''}
                    {previewLook.colorFinish ? ` · ${previewLook.colorFinish}` : ''}
                  </Text>
                ) : null}
                {previewLook?.shadeCode ? (
                  <Text style={styles.modalSubtitle}>Shade {previewLook.shadeCode}</Text>
                ) : null}
                {previewLook?.collection ? (
                  <Text style={styles.modalSubtitle}>{previewLook.collection}</Text>
                ) : null}
                <Text style={styles.modalSubtitle}>{previewLook?.shapeName}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteLook(previewLook!.id)} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPreviewLook(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  subheading: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    paddingBottom: 24,
  },
  gridSpacer: {
    height: 12,
  },
  lookItem: {
    width: ITEM_SIZE,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  lookImage: {
    width: '100%',
    height: ITEM_SIZE * 1.3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  lookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  lookLabel: {
    fontSize: 12,
    color: '#fff',
    flex: 1,
  },
  lookMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  shapeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingBottom: 10,
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
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  emptyStateButtonText: {
    color: '#2A0B20',
    fontSize: 16,
    fontWeight: '600',
  },
  statsBar: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statsText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalImage: {
    width: '100%',
    height: width * 1.1,
    borderRadius: 20,
    marginBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTextBlock: {
    flex: 1,
    marginLeft: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 4,
  },
  modalCloseButton: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A0B20',
  },
});
