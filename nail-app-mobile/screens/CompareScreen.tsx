import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList, CompareLookParam } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLORS } from '../src/theme/colors';

type CompareScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CompareScreen'>;

type SavedLook = CompareLookParam;

type Props = {
  navigation: CompareScreenNavigationProp;
  route: {
    params: {
      look1: SavedLook;
      look2: SavedLook;
    };
  };
};

const { width, height } = Dimensions.get('window');

export default function CompareScreen({ navigation, route }: Props) {
  const { look1, look2 } = route.params;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comparison</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Split Screen Comparison */}
      <View style={styles.comparisonContainer}>
        <View style={styles.lookContainer}>
          <Image 
            source={{ uri: look1.transformedImage }}
            style={styles.lookImage}
            resizeMode="cover"
          />
          <View style={styles.lookOverlay}>
            <Text style={styles.lookNumber}>1</Text>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
        </View>

        <View style={styles.lookContainer}>
          <Image 
            source={{ uri: look2.transformedImage }}
            style={styles.lookImage}
            resizeMode="cover"
          />
          <View style={styles.lookOverlay}>
            <Text style={styles.lookNumber}>2</Text>
          </View>
        </View>
      </View>

      {/* Look Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.lookDetails}>
          <View style={styles.detailHeader}>
            <View style={[styles.colorDot, { backgroundColor: look1.colorHex }]} />
            <Text style={styles.detailTitle}>Look 1</Text>
          </View>
          <Text style={styles.detailText}>{look1.colorName}</Text>
          <Text style={styles.detailSubtext}>{look1.shapeName}</Text>
        </View>

        <View style={styles.detailsDivider} />

        <View style={styles.lookDetails}>
          <View style={styles.detailHeader}>
            <View style={[styles.colorDot, { backgroundColor: look2.colorHex }]} />
            <Text style={styles.detailTitle}>Look 2</Text>
          </View>
          <Text style={styles.detailText}>{look2.colorName}</Text>
          <Text style={styles.detailSubtext}>{look2.shapeName}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#666" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.actionButtonText}>Vote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color="#666" />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  comparisonContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  lookContainer: {
    flex: 1,
    position: 'relative',
  },
  lookImage: {
    width: '100%',
    height: '100%',
  },
  lookOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    position: 'absolute',
    left: width / 2 - 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFF',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BRAND_COLORS.accent,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND_COLORS.accent,
  },
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  lookDetails: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    marginLeft: 24,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 24,
  },
  detailsDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
