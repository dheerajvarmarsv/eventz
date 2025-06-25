import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Palette } from 'lucide-react-native';

interface CameraFiltersProps {
  visible: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  theme: any;
}

export function CameraFilters({
  visible,
  onClose,
  selectedFilter,
  onSelectFilter,
  theme,
}: CameraFiltersProps) {
  const filters = [
    { id: 'none', name: 'Original', preview: '#FFFFFF' },
    { id: 'vintage', name: 'Vintage', preview: '#F4A460' },
    { id: 'sepia', name: 'Sepia', preview: '#DEB887' },
    { id: 'noir', name: 'Noir', preview: '#696969' },
    { id: 'vivid', name: 'Vivid', preview: '#FF6347' },
    { id: 'cool', name: 'Cool', preview: '#87CEEB' },
    { id: 'warm', name: 'Warm', preview: '#FFB347' },
    { id: 'dramatic', name: 'Dramatic', preview: '#8B0000' },
    { id: 'soft', name: 'Soft', preview: '#F5F5DC' },
    { id: 'bright', name: 'Bright', preview: '#FFFF99' },
    { id: 'natural', name: 'Natural', preview: '#90EE90' },
    { id: 'sunset', name: 'Sunset', preview: '#FF8C69' },
    { id: 'ocean', name: 'Ocean', preview: '#20B2AA' },
    { id: 'forest', name: 'Forest', preview: '#228B22' },
    { id: 'golden', name: 'Golden', preview: '#FFD700' },
    { id: 'purple', name: 'Purple', preview: '#9370DB' },
    { id: 'pink', name: 'Pink', preview: '#FF69B4' },
    { id: 'mint', name: 'Mint', preview: '#98FB98' },
    { id: 'coral', name: 'Coral', preview: '#FF7F50' },
    { id: 'arctic', name: 'Arctic', preview: '#B0E0E6' },
  ];

  const handleSelectFilter = (filterId: string) => {
    onSelectFilter(filterId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Camera Filters
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.filtersGrid}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterItem,
                  {
                    backgroundColor: theme.surface,
                    borderColor: selectedFilter === filter.id ? theme.primary : theme.border,
                    borderWidth: selectedFilter === filter.id ? 2 : 1,
                  },
                ]}
                onPress={() => handleSelectFilter(filter.id)}
              >
                <View
                  style={[
                    styles.filterPreview,
                    { backgroundColor: filter.preview },
                  ]}
                >
                  <Palette size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.filterName,
                    {
                      color: selectedFilter === filter.id ? theme.primary : theme.text,
                      fontFamily: selectedFilter === filter.id ? 'Inter-SemiBold' : 'Inter-Medium',
                    },
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.premiumSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.premiumTitle, { color: theme.text }]}>
              Premium Filters
            </Text>
            <Text style={[styles.premiumText, { color: theme.textSecondary }]}>
              Unlock 50+ professional filters with EventSnap Premium
            </Text>
            <TouchableOpacity
              style={[styles.premiumButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 20,
    gap: 12,
  },
  filterItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterName: {
    fontSize: 12,
    textAlign: 'center',
  },
  premiumSection: {
    marginTop: 32,
    marginBottom: 32,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});