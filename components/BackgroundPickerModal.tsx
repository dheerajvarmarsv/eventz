import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { 
  X, 
  Camera, 
  Image as ImageIcon,
  Check
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

// Background types
interface BackgroundOption {
  id: string;
  type: 'emoji' | 'photographic' | 'gradient';
  preview: string;
  name: string;
  backgroundColor?: string;
  gradientColors?: string[];
  imageUrl?: string;
}

// Emoji backgrounds with themed patterns
const EMOJI_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'emoji_gifts',
    type: 'emoji',
    preview: '🎁',
    name: 'Gifts',
    backgroundColor: '#FF6B35',
  },
  {
    id: 'emoji_food',
    type: 'emoji', 
    preview: '🍕',
    name: 'Food',
    backgroundColor: '#4ECDC4',
  },
  {
    id: 'emoji_drinks',
    type: 'emoji',
    preview: '🍷',
    name: 'Drinks',
    backgroundColor: '#45B7D1',
  },
  {
    id: 'emoji_autumn',
    type: 'emoji',
    preview: '🍂',
    name: 'Autumn',
    backgroundColor: '#D2691E',
  },
  {
    id: 'emoji_celebration',
    type: 'emoji',
    preview: '🎉',
    name: 'Party',
    backgroundColor: '#FF1493',
  },
  {
    id: 'emoji_love',
    type: 'emoji',
    preview: '💝',
    name: 'Love',
    backgroundColor: '#FF69B4',
  },
  {
    id: 'emoji_birthday',
    type: 'emoji',
    preview: '🎂',
    name: 'Birthday',
    backgroundColor: '#9932CC',
  },
  {
    id: 'emoji_flowers',
    type: 'emoji',
    preview: '🌸',
    name: 'Flowers',
    backgroundColor: '#FFB6C1',
  },
];

// Photographic backgrounds with high-quality textures
const PHOTOGRAPHIC_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'photo_wood',
    type: 'photographic',
    preview: '🌲',
    name: 'Wood',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: 'photo_marble',
    type: 'photographic',
    preview: '🏛️',
    name: 'Marble',
    imageUrl: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800&q=80',
  },
  {
    id: 'photo_candles',
    type: 'photographic',
    preview: '🕯️',
    name: 'Candles',
    imageUrl: 'https://images.unsplash.com/photo-1477511801984-4ad318ed9846?w=800&q=80',
  },
  {
    id: 'photo_confetti',
    type: 'photographic',
    preview: '🎊',
    name: 'Confetti',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
  },
  {
    id: 'photo_bokeh',
    type: 'photographic',
    preview: '✨',
    name: 'Bokeh',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80',
  },
  {
    id: 'photo_fabric',
    type: 'photographic',
    preview: '🧵',
    name: 'Fabric',
    imageUrl: 'https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=800&q=80',
  },
  {
    id: 'photo_flowers',
    type: 'photographic',
    preview: '🌺',
    name: 'Floral',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: 'photo_geometric',
    type: 'photographic',
    preview: '📐',
    name: 'Geometric',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
  },
];

// Props interface
interface BackgroundPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (backgroundUrl: string | null, backgroundType?: string) => void;
  currentBackground?: string | null;
}

export function BackgroundPickerModal({
  visible,
  onClose,
  onSelect,
  currentBackground,
}: BackgroundPickerModalProps) {
  const { theme } = useTheme();

  // State management
  const [selectedBackground, setSelectedBackground] = useState<string | null>(currentBackground || null);
  const [loadingImage, setLoadingImage] = useState<string | null>(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const photoButtonScale = useSharedValue(1);
  const cameraButtonScale = useSharedValue(1);

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

  // Request camera/photo permissions
  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed to select custom backgrounds.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  // Handle photo selection from library
  const handlePhotoLibrary = useCallback(async () => {
    photoButtonScale.value = withSpring(0.95, { duration: 100 });
    setTimeout(() => {
      photoButtonScale.value = withSpring(1, { duration: 200 });
    }, 100);

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedBackground(imageUri);
        onSelect(imageUri, 'custom');
      }
    } catch (error) {
      console.error('Photo library error:', error);
      Alert.alert('Error', 'Failed to select photo from library');
    }
  }, [onSelect, requestPermissions, photoButtonScale]);

  // Handle camera capture
  const handleCamera = useCallback(async () => {
    cameraButtonScale.value = withSpring(0.95, { duration: 100 });
    setTimeout(() => {
      cameraButtonScale.value = withSpring(1, { duration: 200 });
    }, 100);

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedBackground(imageUri);
        onSelect(imageUri, 'custom');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  }, [onSelect, requestPermissions, cameraButtonScale]);

  // Handle background selection
  const handleBackgroundSelect = useCallback((background: BackgroundOption) => {
    setSelectedBackground(background.id);
    
    if (background.type === 'emoji') {
      // Create emoji pattern background
      onSelect(background.backgroundColor || '#FF6B35', 'emoji');
    } else if (background.type === 'photographic' && background.imageUrl) {
      onSelect(background.imageUrl, 'photographic');
    }
  }, [onSelect]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const photoButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoButtonScale.value }],
  }));

  const cameraButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraButtonScale.value }],
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
                Add Background
              </Text>
            </View>
            
            <View style={styles.headerButton} />
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Photo and Camera Options */}
              <View style={styles.topOptionsContainer}>
                <Animated.View style={photoButtonAnimatedStyle}>
                  <TouchableOpacity
                    style={[styles.topOption, { backgroundColor: theme.surface }]}
                    onPress={handlePhotoLibrary}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.topOptionIcon, { backgroundColor: '#007AFF' }]}>
                      <ImageIcon size={scale(24)} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <Text style={[styles.topOptionText, { color: theme.text }]}>
                      Photos
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={cameraButtonAnimatedStyle}>
                  <TouchableOpacity
                    style={[styles.topOption, { backgroundColor: theme.surface }]}
                    onPress={handleCamera}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.topOptionIcon, { backgroundColor: '#34C759' }]}>
                      <Camera size={scale(24)} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <Text style={[styles.topOptionText, { color: theme.text }]}>
                      Camera
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Emoji Backgrounds */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Emoji
                </Text>
                <View style={styles.backgroundGrid}>
                  {EMOJI_BACKGROUNDS.map((background, index) => (
                    <TouchableOpacity
                      key={background.id}
                      style={[
                        styles.backgroundItem,
                        {
                          backgroundColor: background.backgroundColor,
                          borderColor: selectedBackground === background.id ? theme.primary : 'transparent',
                          borderWidth: selectedBackground === background.id ? 3 : 0,
                        }
                      ]}
                      onPress={() => handleBackgroundSelect(background)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          background.backgroundColor + '20',
                          background.backgroundColor + '40',
                          background.backgroundColor + '60',
                        ]}
                        style={styles.emojiPattern}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {/* Emoji pattern overlay */}
                        <View style={styles.emojiOverlay}>
                          <Text style={styles.emojiText}>{background.preview}</Text>
                          <Text style={styles.emojiText}>{background.preview}</Text>
                          <Text style={styles.emojiText}>{background.preview}</Text>
                        </View>
                      </LinearGradient>
                      
                      {selectedBackground === background.id && (
                        <View style={[styles.selectedOverlay, { backgroundColor: theme.primary + '20' }]}>
                          <View style={[styles.selectedIcon, { backgroundColor: theme.primary }]}>
                            <Check size={scale(14)} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Photographic Backgrounds */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Photographic
                </Text>
                <View style={styles.backgroundGrid}>
                  {PHOTOGRAPHIC_BACKGROUNDS.map((background, index) => (
                    <TouchableOpacity
                      key={background.id}
                      style={[
                        styles.backgroundItem,
                        {
                          borderColor: selectedBackground === background.id ? theme.primary : 'transparent',
                          borderWidth: selectedBackground === background.id ? 3 : 0,
                        }
                      ]}
                      onPress={() => handleBackgroundSelect(background)}
                      activeOpacity={0.8}
                    >
                      {background.imageUrl ? (
                        <Image
                          source={{ uri: background.imageUrl }}
                          style={styles.backgroundImage}
                          resizeMode="cover"
                          onLoadStart={() => setLoadingImage(background.id)}
                          onLoadEnd={() => setLoadingImage(null)}
                          onError={() => setLoadingImage(null)}
                        />
                      ) : (
                        <View style={[styles.placeholderBackground, { backgroundColor: theme.border }]}>
                          <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                            {background.preview}
                          </Text>
                        </View>
                      )}
                      
                      {selectedBackground === background.id && (
                        <View style={[styles.selectedOverlay, { backgroundColor: theme.primary + '20' }]}>
                          <View style={[styles.selectedIcon, { backgroundColor: theme.primary }]}>
                            <Check size={scale(14)} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        </View>
                      )}
                      
                      {loadingImage === background.id && (
                        <View style={styles.loadingOverlay}>
                          <View style={[styles.loadingSpinner, { borderTopColor: theme.primary }]} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
  },
  scrollContent: {
    paddingTop: verticalScale(getResponsiveSpacing(20)),
    paddingBottom: verticalScale(getResponsiveSpacing(20)),
  },

  // Top Options (Photos & Camera) - Responsive
  topOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(getResponsiveSpacing(24)),
    marginHorizontal: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(32)),
  },
  topOption: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(getResponsiveSpacing(8)),
    paddingVertical: verticalScale(getResponsiveSpacing(16)),
    paddingHorizontal: scale(getResponsiveSpacing(20)),
    borderRadius: scale(16),
    minWidth: scale(deviceCategory === 'extraSmall' ? 80 : 90),
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
  topOptionIcon: {
    width: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    height: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 24 : 28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOptionText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '500',
    textAlign: 'center',
  },

  // Sections - Responsive
  section: {
    marginBottom: verticalScale(getResponsiveSpacing(32)),
  },
  sectionTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 20 : 22),
    fontWeight: '700',
    marginHorizontal: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(16)),
  },

  // Background Grid - Responsive
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    gap: scale(getResponsiveSpacing(12)),
  },
  backgroundItem: {
    width: (SCREEN_WIDTH - scale(getResponsiveSpacing(16)) * 2 - scale(getResponsiveSpacing(12))) / 2,
    aspectRatio: 1.5,
    borderRadius: scale(16),
    overflow: 'hidden',
    position: 'relative',
    elevation: Platform.OS === 'android' ? 2 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },

  // Emoji Pattern - Responsive
  emojiPattern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emojiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(8)),
    paddingVertical: verticalScale(getResponsiveSpacing(8)),
  },
  emojiText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 18 : 20),
    opacity: 0.8,
  },

  // Background Image - Responsive
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 24 : 28),
  },

  // Selection Overlay - Responsive
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    width: scale(deviceCategory === 'extraSmall' ? 28 : 32),
    height: scale(deviceCategory === 'extraSmall' ? 28 : 32),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 14 : 16),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 4 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },

  // Loading State - Responsive
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingSpinner: {
    width: scale(deviceCategory === 'extraSmall' ? 20 : 24),
    height: scale(deviceCategory === 'extraSmall' ? 20 : 24),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: scale(deviceCategory === 'extraSmall' ? 10 : 12),
  },
}); 