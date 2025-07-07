import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { 
  X, 
  Search, 
  Navigation, 
  MapPin, 
  Building, 
  Home,
  Coffee,
  ShoppingBag,
  Car,
  Plane
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced responsive scaling for all device sizes and platforms
const scale = (size: number): number => {
  const factor = SCREEN_WIDTH / 375;
  const minFactor = Platform.OS === 'ios' ? 0.85 : 0.8;
  const maxFactor = Platform.OS === 'ios' ? 1.35 : 1.4;
  return Math.round(size * Math.min(Math.max(factor, minFactor), maxFactor));
};

const verticalScale = (size: number): number => {
  const factor = SCREEN_HEIGHT / 812;
  const minFactor = Platform.OS === 'ios' ? 0.85 : 0.8;
  const maxFactor = Platform.OS === 'ios' ? 1.25 : 1.3;
  return Math.round(size * Math.min(Math.max(factor, minFactor), maxFactor));
};

const moderateScale = (size: number, factor: number = 0.3): number => {
  return size + (scale(size) - size) * factor;
};

// Enhanced device detection and responsive spacing
const getDeviceCategory = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  if (SCREEN_WIDTH <= 320) return 'extraSmall'; // iPhone SE 1st gen
  if (SCREEN_WIDTH <= 375) return 'small';      // iPhone 6/7/8, SE 2nd gen
  if (SCREEN_WIDTH <= 414) return 'medium';     // iPhone 6+/7+/8+ Plus, XR, 11
  if (SCREEN_WIDTH <= 428) return 'large';      // iPhone 12/13/14 Pro Max, 15 Plus
  return 'extraLarge'; // iPad and larger devices
};

const deviceCategory = getDeviceCategory();

// Responsive spacing function for consistent padding/margins
const getResponsiveSpacing = (base: number) => {
  const multipliers = {
    extraSmall: 0.75,
    small: 0.85,
    medium: 1.0,
    large: 1.15,
    extraLarge: 1.3
  };
  return Math.round(base * multipliers[deviceCategory]);
};

// Location result interface
interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  types?: string[];
}

// Props interface
interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string, locationName?: string) => void;
  currentLocation?: string;
  currentLocationName?: string;
}

// Loading state type
type LoadingState = 'idle' | 'searching' | 'gettingLocation' | 'error';

// Mock search function (replace with actual API in production)
const searchPlaces = async (query: string): Promise<LocationResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock results based on query
  const mockResults: LocationResult[] = [
    {
      id: '1',
      name: `${query} Convention Center`,
      address: `123 ${query} Street, New York, NY 10001`,
      types: ['establishment', 'point_of_interest']
    },
    {
      id: '2', 
      name: `${query} Park`,
      address: `456 Park Avenue, New York, NY 10002`,
      types: ['park', 'establishment']
    },
    {
      id: '3',
      name: `${query} Hotel`,
      address: `789 Hotel Drive, New York, NY 10003`,
      types: ['lodging', 'establishment']
    },
    {
      id: '4',
      name: `${query} Restaurant`,
      address: `321 Food Street, New York, NY 10004`,
      types: ['restaurant', 'food', 'establishment']
    },
    {
      id: '5',
      name: `${query} Community Center`,
      address: `654 Community Lane, New York, NY 10005`,
      types: ['establishment', 'point_of_interest']
    }
  ];

  return mockResults.filter(result => 
    result.name.toLowerCase().includes(query.toLowerCase()) ||
    result.address.toLowerCase().includes(query.toLowerCase())
  );
};

export function LocationPickerModal({
  visible,
  onClose,
  onSelect,
  currentLocation,
  currentLocationName,
}: LocationPickerModalProps) {
  const { theme } = useTheme();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [popularLocations] = useState<LocationResult[]>([
    {
      id: 'popular1',
      name: 'Central Park',
      address: 'Central Park, New York, NY',
      types: ['park']
    },
    {
      id: 'popular2', 
      name: 'Times Square',
      address: 'Times Square, New York, NY',
      types: ['tourist_attraction']
    },
    {
      id: 'popular3',
      name: 'Brooklyn Bridge Park', 
      address: 'Brooklyn Bridge Park, Brooklyn, NY',
      types: ['park']
    },
    {
      id: 'popular4',
      name: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza, New York, NY',
      types: ['establishment']
    }
  ]);

  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Initialize animations
  useEffect(() => {
    if (visible) {
      headerOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    } else {
      headerOpacity.value = 0;
      contentOpacity.value = 0;
    }
  }, [visible]);

  // Cleanup search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search with debouncing
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoadingState('idle');
      return;
    }

    setLoadingState('searching');

    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
      setLoadingState('idle');
    } catch (error) {
      console.error('Search error:', error);
      setLoadingState('error');
      setSearchResults([]);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoadingState('gettingLocation');

      // Check permissions
      // @ts-ignore - Expo Location API type definitions are inconsistent
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
      Alert.alert(
          'Permission Required',
          'Location permission is required to get your current location. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
              text: 'Settings', 
              onPress: () => {
                // Open device settings for location permissions
              }
            }
          ]
        );
        setLoadingState('idle');
        return;
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const fullAddress = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        onSelect(fullAddress, 'Current Location');
      } else {
        onSelect(`${location.coords.latitude}, ${location.coords.longitude}`, 'Current Location');
      }

      setLoadingState('idle');
    } catch (error) {
      console.error('Location error:', error);
      setLoadingState('error');
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
    }
  }, [onSelect]);

  // Handle location selection
  const handleLocationSelect = useCallback((location: LocationResult) => {
    onSelect(location.address, location.name);
  }, [onSelect]);

  // Get icon for location type
  const getLocationIcon = (types?: string[]) => {
    if (!types || types.length === 0) return MapPin;
    
    const type = types[0];
    switch (type) {
      case 'lodging': return Building;
      case 'restaurant': case 'food': return Coffee;
      case 'shopping_mall': case 'store': return ShoppingBag;
      case 'park': return Home;
      case 'airport': return Plane;
      case 'gas_station': return Car;
      default: return MapPin;
    }
  };

  // Loading indicator component
  const LoadingIndicator = ({ size = scale(16) }: { size?: number }) => (
    <ActivityIndicator 
      size={Platform.OS === 'ios' ? 'small' : size} 
      color={theme.primary} 
    />
  );

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <StatusBar 
        barStyle={theme.isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
        translucent={false}
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.headerButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={scale(20)} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Select Location
              </Text>
            </View>
            
            <View style={styles.headerButton} />
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {/* Search Section */}
            <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
              <View style={[styles.searchInputContainer, { borderColor: theme.border }]}>
                <Search size={scale(18)} color={theme.textSecondary} strokeWidth={2} />
                  <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search for places..."
                  placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  autoCapitalize="words"
                    returnKeyType="search"
                  clearButtonMode="while-editing"
                  onSubmitEditing={() => handleSearch(searchQuery)}
                  />
                {loadingState === 'searching' && (
                  <LoadingIndicator size={scale(16)} />
                )}
              </View>
            </View>

            {/* Current Location Button */}
                <TouchableOpacity 
              style={[styles.currentLocationButton, { backgroundColor: theme.surface }]}
              onPress={getCurrentLocation}
              disabled={loadingState === 'gettingLocation'}
            >
              <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}20` }]}>
                {loadingState === 'gettingLocation' ? (
                  <LoadingIndicator size={scale(18)} />
                ) : (
                  <Navigation size={scale(18)} color={theme.primary} strokeWidth={2} />
                )}
                    </View>
              <View style={styles.locationInfo}>
                <Text style={[styles.locationName, { color: theme.text }]}>
                  Use Current Location
                </Text>
                <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                  {loadingState === 'gettingLocation' ? 'Getting location...' : 'Automatically detect your location'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Results */}
            <ScrollView 
              style={styles.resultsContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Search Results
                  </Text>
                  {searchResults.map((location) => {
                    const IconComponent = getLocationIcon(location.types);
                    return (
                    <TouchableOpacity
                        key={location.id}
                        style={[styles.locationItem, { backgroundColor: theme.surface }]}
                        onPress={() => handleLocationSelect(location)}
                    >
                        <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}20` }]}>
                          <IconComponent size={scale(18)} color={theme.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.locationInfo}>
                          <Text style={[styles.locationName, { color: theme.text }]} numberOfLines={1}>
                            {location.name}
                          </Text>
                          <Text style={[styles.locationAddress, { color: theme.textSecondary }]} numberOfLines={2}>
                            {location.address}
                          </Text>
                      </View>
                    </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Popular Locations */}
              {searchQuery.length === 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Popular Locations
                  </Text>
                  {popularLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.types);
                    return (
                      <TouchableOpacity
                        key={location.id}
                        style={[styles.locationItem, { backgroundColor: theme.surface }]}
                        onPress={() => handleLocationSelect(location)}
                      >
                        <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}20` }]}>
                          <IconComponent size={scale(18)} color={theme.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.locationInfo}>
                          <Text style={[styles.locationName, { color: theme.text }]} numberOfLines={1}>
                            {location.name}
                          </Text>
                          <Text style={[styles.locationAddress, { color: theme.textSecondary }]} numberOfLines={2}>
                            {location.address}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* No Results */}
              {searchQuery.length > 0 && searchResults.length === 0 && loadingState === 'idle' && (
                <View style={styles.noResults}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                    No locations found for "{searchQuery}"
                  </Text>
                  <Text style={[styles.noResultsSubtext, { color: theme.textSecondary }]}>
                    Try a different search term or use your current location
                </Text>
              </View>
              )}

              {/* Error State */}
              {loadingState === 'error' && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    Unable to search locations
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleSearch(searchQuery)}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // Header - Responsive
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    paddingVertical: verticalScale(getResponsiveSpacing(14)),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 48 : 52),
  },
  headerButton: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(8)),
  },
  headerTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '600',
    textAlign: 'center',
  },

  // Content - Responsive
  content: {
    flex: 1,
    paddingTop: verticalScale(getResponsiveSpacing(16)),
  },
  
  // Search Container - Responsive
  searchContainer: {
    marginHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(12),
    padding: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(16)),
    elevation: Platform.OS === 'android' ? 2 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: scale(getResponsiveSpacing(12)),
    paddingVertical: verticalScale(getResponsiveSpacing(10)),
    gap: scale(getResponsiveSpacing(8)),
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 40 : 44),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '400',
    ...Platform.select({
      ios: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },

  // Current Location Button - Responsive
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(getResponsiveSpacing(16)),
    padding: scale(getResponsiveSpacing(16)),
    borderRadius: scale(12),
    marginBottom: verticalScale(getResponsiveSpacing(16)),
    gap: scale(getResponsiveSpacing(12)),
    elevation: Platform.OS === 'android' ? 2 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },

  // Results Container - Responsive
  resultsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: verticalScale(getResponsiveSpacing(24)),
  },
  sectionTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 16 : 18),
    fontWeight: '600',
    marginHorizontal: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(12)),
  },

  // Location Items - Responsive
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(getResponsiveSpacing(16)),
    padding: scale(getResponsiveSpacing(16)),
    borderRadius: scale(12),
    marginBottom: verticalScale(getResponsiveSpacing(8)),
    gap: scale(getResponsiveSpacing(12)),
    elevation: Platform.OS === 'android' ? 1 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  locationIcon: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 8 : 10),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  locationInfo: {
    flex: 1,
    minWidth: 0,
  },
  locationName: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  locationAddress: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 13 : 14),
    fontWeight: '400',
    lineHeight: moderateScale(deviceCategory === 'extraSmall' ? 18 : 20),
  },

  // No Results - Responsive
  noResults: {
    alignItems: 'center',
    paddingVertical: verticalScale(getResponsiveSpacing(40)),
    paddingHorizontal: scale(getResponsiveSpacing(24)),
  },
  noResultsText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  noResultsSubtext: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 13 : 14),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: moderateScale(deviceCategory === 'extraSmall' ? 18 : 20),
  },

  // Error State - Responsive
  errorContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(getResponsiveSpacing(40)),
    paddingHorizontal: scale(getResponsiveSpacing(24)),
  },
  errorText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(16)),
  },
  retryButton: {
    paddingHorizontal: scale(getResponsiveSpacing(20)),
    paddingVertical: verticalScale(getResponsiveSpacing(10)),
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '600',
  },
});