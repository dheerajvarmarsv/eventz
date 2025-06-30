import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { X, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Import all invitation background images
const backgroundImages = {
  blackGreenWatercolor: require('@/assets/images/invites/_Black and Green Watercolor Phone Wallpaper.png'),
  beigeGoldMinimalist: require('@/assets/images/invites/Beige Gold Aesthetic Minimalist Phone Wallpaper.png'),
  beigePinkFlowers: require('@/assets/images/invites/Beige Pink Illustrated Flowers and Leaves Phone Wallpaper .png'),
  blackGoldBrush: require('@/assets/images/invites/Black and Gold Glitter Brush Stroke Phone Wallpaper.png'),
  blackGoldDrops: require('@/assets/images/invites/Black and Gold Glitter Drops Phone Wallpaper.png'),
  blackGoldGlossy: require('@/assets/images/invites/Black and Gold Glossy Phone Wallpaper.png'),
  blackWhiteStarry: require('@/assets/images/invites/Black And White Illustrated Starry Sky Phone Wallpaper.png'),
  blackBlueGoldLuxury: require('@/assets/images/invites/Black Dark Blue Gold Luxury Phone Wallpaper.png'),
  blackMinimalistQuotes: require('@/assets/images/invites/Black Minimalist Quotes Phone Wallpaper.png'),
  blackPinkBold: require('@/assets/images/invites/Black Pink Bold 3D Phone Wallpaper.png'),
  blueAbstractNight: require('@/assets/images/invites/Blue Abstract Night Star Phone Wallpaper.png'),
  blueSilverY2K: require('@/assets/images/invites/Blue and Silver Aesthetic Y2K Futuristic Love Phone Wallpaper .png'),
  blueGoldMarble: require('@/assets/images/invites/Blue Gold Minimalist Marble Background Phone Wallpaper.png'),
  colorfulGirlyCollage: require('@/assets/images/invites/Colorful Girly Aesthetic Collage Phone Wallpaper.png'),
  colorfulTropicalFlowers: require('@/assets/images/invites/Colorful Illustrative Tropical Flowers Phone Wallpaper.png'),
  colorfulWatercolor: require('@/assets/images/invites/Colorful Watercolor Illustrations Phone Wallpaper.png'),
  creamPinkBows: require('@/assets/images/invites/Cream and Pink Watercolor Gentle Illustrative Bows Background Wallpaper Phone Wallpaper.png'),
  creamGreenIllustrative: require('@/assets/images/invites/Cream Green Illustrative Phone Wallpaper.png'),
  creamVintageStorms: require('@/assets/images/invites/Cream Vintage Art Aesthetic Storms Christian Phone Wallpaper.png'),
  dustyBlueFloral: require('@/assets/images/invites/Dusty Blue Cream Motivational Floral Vintage Phone Wallpaper.png'),
  floralWatercolorGarden: require('@/assets/images/invites/Floral Watercolor Garden Phone Wallpaper.png'),
  iridescentY2K: require('@/assets/images/invites/Iridescent Y2K Metallic Liquid Wavy Letters Positive Quote Phone Wallpaper.png'),
  navyYellowNight: require('@/assets/images/invites/Navy Yellow Cute Night Sky Phone Wallpaper .png'),
  pinkPurpleFlowers: require('@/assets/images/invites/Pink and Purple Realistic Watercolor Flower Blossom Phone Wallpaper.png'),
  pinkRedStrawberries: require('@/assets/images/invites/Pink and Red Watercolor Strawberries Pattern Phone Wallpaper.png'),
  pinkGradientHologram: require('@/assets/images/invites/Pink Gradient Modern Hologram Phone Wallpaper.png'),
  silkyGlowingBubble: require('@/assets/images/invites/Silky Glowing 3d Bubble Xoxo Phone Wallpaper.png'),
  whitePurplePlayful: require('@/assets/images/invites/White and Purple Playful Phone Wallpaper.png'),
  winterSnowyForest: require('@/assets/images/invites/Winter Snowy Forest Magic in the Air Quote Phone Wallpaper.png'),
  yellowGreenNature: require('@/assets/images/invites/Yellow and Green Watercolor Illustration Nature View Phone Wallpaper.png'),
  yellowWhiteGreenFlower: require('@/assets/images/invites/Yellow White and Green Aesthetic Flower Wallpaper Phone .png'),
};

// Enhanced responsive scaling with better device detection
const scale = (size: number): number => {
  const factor = SCREEN_WIDTH / 375;
  const minFactor = Platform.OS === 'ios' ? 0.8 : 0.75;
  const maxFactor = Platform.OS === 'ios' ? 1.4 : 1.45;
  return Math.round(size * Math.min(Math.max(factor, minFactor), maxFactor));
};

const verticalScale = (size: number): number => {
  const factor = SCREEN_HEIGHT / 812;
  const minFactor = Platform.OS === 'ios' ? 0.8 : 0.75;
  const maxFactor = Platform.OS === 'ios' ? 1.3 : 1.35;
  return Math.round(size * Math.min(Math.max(factor, minFactor), maxFactor));
};

const moderateScale = (size: number, factor: number = 0.3): number => {
  return size + (scale(size) - size) * factor;
};

// Enhanced device detection
const getDeviceCategory = () => {
  if (SCREEN_WIDTH >= 1024) return 'tablet';     // iPad Pro
  if (SCREEN_WIDTH >= 768) return 'largePad';    // iPad regular
  if (SCREEN_WIDTH >= 430) return 'largePhone';  // iPhone 14 Pro Max, 15 Plus
  if (SCREEN_WIDTH >= 414) return 'mediumPhone'; // iPhone 11, XR, 12/13/14
  if (SCREEN_WIDTH >= 375) return 'standardPhone'; // iPhone 6/7/8, X/XS, 12 mini
  return 'smallPhone'; // iPhone SE
};

const deviceCategory = getDeviceCategory();

// Optimized responsive spacing
const getResponsiveSpacing = (base: number) => {
  const multipliers = {
    smallPhone: 0.7,
    standardPhone: 0.85,
    mediumPhone: 1.0,
    largePhone: 1.15,
    largePad: 1.4,
    tablet: 1.6
  };
  return Math.round(base * multipliers[deviceCategory]);
};

// Background option interface
interface BackgroundOption {
  id: string;
  name: string;
  imageSource: any;
  category: 'elegant' | 'vibrant' | 'minimal' | 'nature' | 'artistic' | 'none';
  isNoBackground?: boolean;
  isEmpty?: boolean;
}

// Curated background options organized by category
const backgroundOptions: BackgroundOption[] = [
  // Elegant & Luxury
  {
    id: 'blackGoldBrush',
    name: 'Gold Brush Elegance',
    imageSource: backgroundImages.blackGoldBrush,
    category: 'elegant'
  },
  {
    id: 'blackGoldDrops',
    name: 'Gold Drops Luxury',
    imageSource: backgroundImages.blackGoldDrops,
    category: 'elegant'
  },
  {
    id: 'blackGoldGlossy',
    name: 'Glossy Gold',
    imageSource: backgroundImages.blackGoldGlossy,
    category: 'elegant'
  },
  {
    id: 'blackBlueGoldLuxury',
    name: 'Blue Gold Luxury',
    imageSource: backgroundImages.blackBlueGoldLuxury,
    category: 'elegant'
  },
  {
    id: 'beigeGoldMinimalist',
    name: 'Beige Gold Minimal',
    imageSource: backgroundImages.beigeGoldMinimalist,
    category: 'elegant'
  },
  {
    id: 'blueGoldMarble',
    name: 'Blue Gold Marble',
    imageSource: backgroundImages.blueGoldMarble,
    category: 'elegant'
  },

  // Vibrant & Colorful
  {
    id: 'colorfulGirlyCollage',
    name: 'Girly Collage',
    imageSource: backgroundImages.colorfulGirlyCollage,
    category: 'vibrant'
  },
  {
    id: 'colorfulTropicalFlowers',
    name: 'Tropical Flowers',
    imageSource: backgroundImages.colorfulTropicalFlowers,
    category: 'vibrant'
  },
  {
    id: 'colorfulWatercolor',
    name: 'Watercolor Art',
    imageSource: backgroundImages.colorfulWatercolor,
    category: 'vibrant'
  },
  {
    id: 'pinkGradientHologram',
    name: 'Pink Hologram',
    imageSource: backgroundImages.pinkGradientHologram,
    category: 'vibrant'
  },
  {
    id: 'blueSilverY2K',
    name: 'Y2K Futuristic',
    imageSource: backgroundImages.blueSilverY2K,
    category: 'vibrant'
  },
  {
    id: 'iridescentY2K',
    name: 'Iridescent Y2K',
    imageSource: backgroundImages.iridescentY2K,
    category: 'vibrant'
  },
  {
    id: 'silkyGlowingBubble',
    name: 'Glowing Bubble',
    imageSource: backgroundImages.silkyGlowingBubble,
    category: 'vibrant'
  },

  // Minimal & Clean
  {
    id: 'blackMinimalistQuotes',
    name: 'Minimalist Quotes',
    imageSource: backgroundImages.blackMinimalistQuotes,
    category: 'minimal'
  },
  {
    id: 'blackWhiteStarry',
    name: 'Starry Night',
    imageSource: backgroundImages.blackWhiteStarry,
    category: 'minimal'
  },
  {
    id: 'blackPinkBold',
    name: 'Pink Bold 3D',
    imageSource: backgroundImages.blackPinkBold,
    category: 'minimal'
  },
  {
    id: 'whitePurplePlayful',
    name: 'Purple Playful',
    imageSource: backgroundImages.whitePurplePlayful,
    category: 'minimal'
  },
  {
    id: 'blueAbstractNight',
    name: 'Abstract Night',
    imageSource: backgroundImages.blueAbstractNight,
    category: 'minimal'
  },
  {
    id: 'navyYellowNight',
    name: 'Navy Night Sky',
    imageSource: backgroundImages.navyYellowNight,
    category: 'minimal'
  },

  // Nature & Floral
  {
    id: 'floralWatercolorGarden',
    name: 'Watercolor Garden',
    imageSource: backgroundImages.floralWatercolorGarden,
    category: 'nature'
  },
  {
    id: 'beigePinkFlowers',
    name: 'Pink Flowers',
    imageSource: backgroundImages.beigePinkFlowers,
    category: 'nature'
  },
  {
    id: 'pinkPurpleFlowers',
    name: 'Purple Blossoms',
    imageSource: backgroundImages.pinkPurpleFlowers,
    category: 'nature'
  },
  {
    id: 'pinkRedStrawberries',
    name: 'Strawberries',
    imageSource: backgroundImages.pinkRedStrawberries,
    category: 'nature'
  },
  {
    id: 'yellowGreenNature',
    name: 'Nature View',
    imageSource: backgroundImages.yellowGreenNature,
    category: 'nature'
  },
  {
    id: 'yellowWhiteGreenFlower',
    name: 'Green Flowers',
    imageSource: backgroundImages.yellowWhiteGreenFlower,
    category: 'nature'
  },
  {
    id: 'winterSnowyForest',
    name: 'Snowy Forest',
    imageSource: backgroundImages.winterSnowyForest,
    category: 'nature'
  },
  {
    id: 'dustyBlueFloral',
    name: 'Blue Floral',
    imageSource: backgroundImages.dustyBlueFloral,
    category: 'nature'
  },

  // Artistic & Creative
  {
    id: 'blackGreenWatercolor',
    name: 'Green Watercolor',
    imageSource: backgroundImages.blackGreenWatercolor,
    category: 'artistic'
  },
  {
    id: 'creamPinkBows',
    name: 'Pink Bows',
    imageSource: backgroundImages.creamPinkBows,
    category: 'artistic'
  },
  {
    id: 'creamGreenIllustrative',
    name: 'Green Illustrative',
    imageSource: backgroundImages.creamGreenIllustrative,
    category: 'artistic'
  },
  {
    id: 'creamVintageStorms',
    name: 'Vintage Storms',
    imageSource: backgroundImages.creamVintageStorms,
    category: 'artistic'
  },
];

interface BackgroundPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (backgroundUrl: string | null, backgroundType?: string) => void;
  currentBackground?: string | null;
}

// Helper function to get optimal grid configuration
const getOptimalGridConfig = () => {
  const configs = {
    smallPhone: { 
      columns: 2, 
      itemWidth: (SCREEN_WIDTH - getResponsiveSpacing(60)) / 2,
      spacing: getResponsiveSpacing(8),
      aspectRatio: 0.65
    },
    standardPhone: { 
      columns: 3, 
      itemWidth: (SCREEN_WIDTH - getResponsiveSpacing(80)) / 3,
      spacing: getResponsiveSpacing(10),
      aspectRatio: 0.7
    },
    mediumPhone: { 
      columns: 3, 
      itemWidth: (SCREEN_WIDTH - getResponsiveSpacing(80)) / 3,
      spacing: getResponsiveSpacing(12),
      aspectRatio: 0.75
    },
    largePhone: { 
      columns: 3, 
      itemWidth: (SCREEN_WIDTH - getResponsiveSpacing(80)) / 3,
      spacing: getResponsiveSpacing(12),
      aspectRatio: 0.8
    },
    largePad: { 
      columns: 4, 
      itemWidth: (SCREEN_WIDTH - getResponsiveSpacing(100)) / 4,
      spacing: getResponsiveSpacing(16),
      aspectRatio: 0.8
    },
    tablet: { 
      columns: 5, 
      itemWidth: (SCREEN_WIDTH - getResponsiveSpacing(120)) / 5,
      spacing: getResponsiveSpacing(20),
      aspectRatio: 0.85
    }
  };
  
  return configs[deviceCategory];
};

export function BackgroundPickerModal({
  visible,
  onClose,
  onSelect,
  currentBackground,
}: BackgroundPickerModalProps) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const gridConfig = getOptimalGridConfig();

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All', count: backgroundOptions.length },
    { id: 'elegant', name: 'Elegant', count: backgroundOptions.filter(bg => bg.category === 'elegant').length },
    { id: 'vibrant', name: 'Vibrant', count: backgroundOptions.filter(bg => bg.category === 'vibrant').length },
    { id: 'minimal', name: 'Minimal', count: backgroundOptions.filter(bg => bg.category === 'minimal').length },
    { id: 'nature', name: 'Nature', count: backgroundOptions.filter(bg => bg.category === 'nature').length },
    { id: 'artistic', name: 'Artistic', count: backgroundOptions.filter(bg => bg.category === 'artistic').length },
  ];

  // Get filtered backgrounds based on selected category
  const getFilteredBackgrounds = () => {
    if (selectedCategory === 'all') {
      return backgroundOptions;
    }
    return backgroundOptions.filter(bg => bg.category === selectedCategory);
  };

  // Create grid data including "No Background" option
  const createGridData = () => {
    const filteredBackgrounds = getFilteredBackgrounds();
    
    // Add "No Background" option as first item
    const gridData = [
      {
        id: 'no-background',
        name: 'No Background',
        imageSource: null,
        category: 'none' as const,
        isNoBackground: true
      },
      ...filteredBackgrounds
    ];

    // Fill remaining spots to complete rows
    const itemsPerRow = gridConfig.columns;
    const remainder = gridData.length % itemsPerRow;
    if (remainder !== 0) {
      const fillCount = itemsPerRow - remainder;
      for (let i = 0; i < fillCount; i++) {
        gridData.push({
          id: `fill-${i}`,
          name: '',
          imageSource: null,
          category: 'none' as const,
          isEmpty: true
        });
      }
    }

    return gridData;
  };

  const handleBackgroundSelect = (backgroundId: string, imageSource: any) => {
    if (backgroundId === 'no-background') {
      onSelect(null);
    } else {
      onSelect(`background_${backgroundId}`, 'image');
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      all: 'All Backgrounds',
      elegant: 'Elegant',
      vibrant: 'Vibrant',
      minimal: 'Minimal',
      nature: 'Nature',
      artistic: 'Artistic'
    };
    return categoryMap[category] || category;
  };

  const isSelected = (backgroundId: string) => {
    if (backgroundId === 'no-background') {
      return !currentBackground;
    }
    return currentBackground === `background_${backgroundId}`;
  };

  const gridData = createGridData();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar 
        barStyle={theme.isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={scale(20)} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Choose Background
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={onClose}
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={[styles.categoriesContent, { paddingHorizontal: getResponsiveSpacing(20) }]}
          bounces={false}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category.id ? theme.primary : theme.surface,
                  borderColor: theme.border,
                  marginRight: getResponsiveSpacing(12),
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryButtonText,
                { 
                  color: selectedCategory === category.id ? '#FFFFFF' : theme.text,
                  fontSize: moderateScale(deviceCategory === 'smallPhone' ? 12 : 13)
                }
              ]}>
                {category.name}
              </Text>
              {category.count > 0 && (
                <View style={[
                  styles.categoryCount,
                  { 
                    backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : theme.border,
                    marginLeft: getResponsiveSpacing(6)
                  }
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    { 
                      color: selectedCategory === category.id ? '#FFFFFF' : theme.textSecondary,
                      fontSize: moderateScale(deviceCategory === 'smallPhone' ? 10 : 11)
                    }
                  ]}>
                    {category.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Optimized Grid */}
        <ScrollView 
          style={styles.gridContainer}
          contentContainerStyle={[
            styles.gridContent,
            { 
              paddingHorizontal: getResponsiveSpacing(20),
              paddingBottom: getResponsiveSpacing(30)
            }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={[
            styles.optimizedGrid,
            { 
              gap: gridConfig.spacing,
            }
          ]}>
            {gridData.map((item, index) => {
              // Skip empty fill items
              if (item.isEmpty) {
                return <View key={item.id} style={{ width: gridConfig.itemWidth }} />;
              }

              const itemHeight = gridConfig.itemWidth * gridConfig.aspectRatio;
              const selected = isSelected(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.gridItem,
                    {
                      width: gridConfig.itemWidth,
                      height: itemHeight,
                      borderColor: selected ? theme.primary : theme.border,
                      borderWidth: selected ? scale(2) : StyleSheet.hairlineWidth,
                    }
                  ]}
                  onPress={() => handleBackgroundSelect(item.id, item.imageSource)}
                  activeOpacity={0.8}
                >
                  {item.isNoBackground ? (
                    // No Background Option
                    <View style={[styles.noBackgroundContainer, { backgroundColor: theme.surface }]}>
                      <View style={[styles.noBackgroundIcon, { backgroundColor: theme.border }]}>
                        <X 
                          size={scale(deviceCategory === 'smallPhone' ? 16 : 20)} 
                          color={theme.textSecondary} 
                          strokeWidth={2} 
                        />
                      </View>
                      <Text style={[
                        styles.noBackgroundText,
                        { 
                          color: theme.textSecondary,
                          fontSize: moderateScale(deviceCategory === 'smallPhone' ? 10 : 12)
                        }
                      ]} numberOfLines={2}>
                        No Background
                      </Text>
                    </View>
                  ) : (
                    // Background Image
                    <>
                      <Image
                        source={item.imageSource}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                      />
                      <View style={[
                        styles.imageOverlay,
                        { backgroundColor: 'rgba(0,0,0,0.2)' }
                      ]} />
                      <View style={styles.imageInfo}>
                        <Text style={[
                          styles.imageName,
                          { 
                            fontSize: moderateScale(deviceCategory === 'smallPhone' ? 10 : 11)
                          }
                        ]} numberOfLines={2}>
                          {item.name}
                        </Text>
                      </View>
                    </>
                  )}

                  {/* Selection Indicator */}
                  {selected && (
                    <View style={[styles.selectionIndicator, { backgroundColor: theme.primary }]}>
                      <Check size={scale(deviceCategory === 'smallPhone' ? 12 : 16)} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
  
  // Header - Responsive
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: verticalScale(deviceCategory === 'smallPhone' ? 56 : 60),
  },
  headerButton: {
    width: scale(deviceCategory === 'smallPhone' ? 36 : 40),
    height: scale(deviceCategory === 'smallPhone' ? 36 : 40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(8),
  },
  headerTitle: {
    fontSize: moderateScale(deviceCategory === 'smallPhone' ? 16 : 18),
    fontWeight: '600',
    textAlign: 'center',
  },
  doneButton: {
    paddingHorizontal: getResponsiveSpacing(deviceCategory === 'smallPhone' ? 12 : 16),
    paddingVertical: getResponsiveSpacing(8),
    borderRadius: scale(deviceCategory === 'smallPhone' ? 16 : 18),
    minWidth: scale(deviceCategory === 'smallPhone' ? 60 : 70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: moderateScale(deviceCategory === 'smallPhone' ? 13 : 14),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Categories - Responsive
  categoriesContainer: {
    maxHeight: verticalScale(deviceCategory === 'smallPhone' ? 50 : 60),
    marginTop: getResponsiveSpacing(12),
    marginBottom: getResponsiveSpacing(8),
  },
  categoriesContent: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(8),
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(deviceCategory === 'smallPhone' ? 10 : 12),
    paddingVertical: getResponsiveSpacing(6),
    borderRadius: scale(deviceCategory === 'smallPhone' ? 14 : 16),
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: verticalScale(deviceCategory === 'smallPhone' ? 28 : 32),
  },
  categoryButtonText: {
    fontWeight: '500',
  },
  categoryCount: {
    paddingHorizontal: getResponsiveSpacing(6),
    paddingVertical: getResponsiveSpacing(2),
    borderRadius: scale(8),
    minWidth: scale(deviceCategory === 'smallPhone' ? 18 : 20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCountText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Optimized Grid
  gridContainer: {
    flex: 1,
    marginTop: getResponsiveSpacing(8),
  },
  gridContent: {
    paddingTop: getResponsiveSpacing(12),
  },
  optimizedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    borderRadius: scale(deviceCategory === 'smallPhone' ? 8 : 12),
    overflow: 'hidden',
    position: 'relative',
    marginBottom: getResponsiveSpacing(deviceCategory === 'smallPhone' ? 8 : deviceCategory === 'tablet' ? 20 : 12),
    elevation: Platform.OS === 'android' ? 3 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },

  // No Background Option
  noBackgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing(8),
  },
  noBackgroundIcon: {
    width: scale(deviceCategory === 'smallPhone' ? 28 : 36),
    height: scale(deviceCategory === 'smallPhone' ? 28 : 36),
    borderRadius: scale(deviceCategory === 'smallPhone' ? 14 : 18),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(6),
  },
  noBackgroundText: {
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: moderateScale(deviceCategory === 'smallPhone' ? 14 : 16),
  },

  // Background Images
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: getResponsiveSpacing(deviceCategory === 'smallPhone' ? 6 : 8),
    justifyContent: 'flex-end',
  },
  imageName: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: moderateScale(deviceCategory === 'smallPhone' ? 13 : 15),
  },

  // Selection Indicator
  selectionIndicator: {
    position: 'absolute',
    top: getResponsiveSpacing(6),
    right: getResponsiveSpacing(6),
    width: scale(deviceCategory === 'smallPhone' ? 20 : 24),
    height: scale(deviceCategory === 'smallPhone' ? 20 : 24),
    borderRadius: scale(deviceCategory === 'smallPhone' ? 10 : 12),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 4 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
    }),
  },
}); 