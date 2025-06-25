import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MapPin, Search, Clock, Star } from 'lucide-react-native';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
  theme: any;
}

export function LocationPickerModal({
  visible,
  onClose,
  onSelect,
  theme,
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const popularLocations = [
    {
      name: 'Central Park Pavilion',
      address: '830 5th Ave, New York, NY 10065',
      type: 'Park',
      rating: 4.8,
    },
    {
      name: 'The Grand Ballroom',
      address: '123 Main St, Downtown',
      type: 'Event Hall',
      rating: 4.9,
    },
    {
      name: 'Sunset Beach Club',
      address: '456 Ocean Drive, Miami Beach',
      type: 'Beach Club',
      rating: 4.7,
    },
    {
      name: 'Rooftop Garden Restaurant',
      address: '789 High St, Manhattan',
      type: 'Restaurant',
      rating: 4.6,
    },
    {
      name: 'Community Center Hall',
      address: '321 Community Blvd',
      type: 'Community Center',
      rating: 4.5,
    },
    {
      name: 'Lakeside Park',
      address: '654 Lake View Dr',
      type: 'Park',
      rating: 4.4,
    },
  ];

  const recentLocations = [
    'My Home',
    'Office Conference Room',
    'Local Coffee Shop',
    'City Library',
  ];

  const filteredLocations = popularLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (locationName: string, address?: string) => {
    const fullLocation = address ? `${locationName}, ${address}` : locationName;
    onSelect(fullLocation);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <MapPin size={20} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>
              Choose Location
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search for a location..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!searchQuery && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Recent Locations
                </Text>
                {recentLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.locationItem, { backgroundColor: theme.surface }]}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <View style={[styles.locationIcon, { backgroundColor: `${theme.textSecondary}20` }]}>
                      <Clock size={16} color={theme.textSecondary} />
                    </View>
                    <View style={styles.locationContent}>
                      <Text style={[styles.locationName, { color: theme.text }]}>
                        {location}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Popular Venues
                </Text>
              </View>
            </>
          )}

          <View style={styles.locationsContainer}>
            {filteredLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.locationItem, { backgroundColor: theme.surface }]}
                onPress={() => handleLocationSelect(location.name, location.address)}
              >
                <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <MapPin size={16} color={theme.primary} />
                </View>
                <View style={styles.locationContent}>
                  <Text style={[styles.locationName, { color: theme.text }]}>
                    {location.name}
                  </Text>
                  <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                    {location.address}
                  </Text>
                  <View style={styles.locationMeta}>
                    <Text style={[styles.locationType, { color: theme.textSecondary }]}>
                      {location.type}
                    </Text>
                    <View style={styles.rating}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                        {location.rating}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.customLocationButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {
              if (searchQuery.trim()) {
                handleLocationSelect(searchQuery.trim());
              }
            }}
          >
            <MapPin size={20} color={theme.primary} />
            <Text style={[styles.customLocationText, { color: theme.text }]}>
              {searchQuery.trim() ? `Use "${searchQuery.trim()}"` : 'Enter custom location'}
            </Text>
          </TouchableOpacity>
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  locationsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  customLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  customLocationText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
});