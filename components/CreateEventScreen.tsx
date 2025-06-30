import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { 
  X, 
  Calendar, 
  MapPin, 
  ImageIcon,
  Check,
} from 'lucide-react-native';
import { DateTimePickerModal } from './DateTimePickerModal';
import { LocationPickerModal } from './LocationPickerModal';
import { EventDetailsModal } from './EventDetailsModal';
import { BackgroundPickerModal } from './BackgroundPickerModal';
import { ColorPicker } from './ColorPicker';
// Local TextStyle interface without keyboard type
interface TextStyle {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  textAlign: 'left' | 'center' | 'right';
  fontStyle: 'normal' | 'italic';
  textDecorationLine: 'none' | 'underline' | 'line-through' | 'underline line-through';
}
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fixed responsive scaling to match home screen sizing
const scale = (size: number) => {
  const factor = SCREEN_WIDTH / 375;
  return Math.round(size * Math.min(factor, 1.2)); // Cap scaling at 1.2x
};

const verticalScale = (size: number) => {
  const factor = SCREEN_HEIGHT / 812;
  return Math.round(size * Math.min(factor, 1.15)); // Cap scaling at 1.15x
};

// More conservative scaling for better consistency
const moderateScale = (size: number, factor = 0.3) => {
  return size + (scale(size) - size) * factor;
};

// Comprehensive device type detection
const isTablet = SCREEN_WIDTH >= 768;
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 430;
const isExtraLargeDevice = SCREEN_WIDTH >= 430;
const isShortDevice = SCREEN_HEIGHT < 700;
const isTallDevice = SCREEN_HEIGHT > 900;

// Advanced responsive function with device-specific optimizations
const getResponsiveSize = (
  small: number, 
  medium: number, 
  large: number, 
  tablet?: number,
  extraLarge?: number
) => {
  if (isTablet) return tablet || large * 1.3;
  if (isExtraLargeDevice) return extraLarge || large * 1.1;
  if (isLargeDevice) return large;
  if (isMediumDevice) return medium;
  if (isSmallDevice) return small;
  return medium;
};

// Responsive spacing based on screen dimensions
const getResponsiveSpacing = (base: number) => {
  const factor = Math.min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812);
  return Math.round(base * factor);
};

interface CreateEventScreenProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated: (eventData: any) => void;
}

interface EventData {
  title: string;
  date: Date | null;
  time: Date | null;
  location: string;
  locationName: string;
  description: string;
  hostName: string;
  backgroundImage: string | null;
  titleStyle: TextStyle;
}

// Helper function to get display font size (capped for better UI)
const getDisplayFontSize = (fontSize: number) => {
  // Cap the display font size to prevent UI issues
  return Math.min(fontSize, 28);
};

// Helper function to get proper font family for weight and style
const getFontFamily = (baseFamily: string, fontWeight: string, fontStyle: string) => {
  if (fontStyle === 'italic') {
    // For italic, we need to use Inter-Italic variants
    switch (fontWeight) {
      case '400': return 'Inter-Italic';
      case '500': return 'Inter-MediumItalic';
      case '600': return 'Inter-SemiBoldItalic';
      case '700': return 'Inter-BoldItalic';
      case '800': return 'Inter-ExtraBoldItalic';
      default: return 'Inter-Italic';
    }
  }
  return baseFamily;
};

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

// Helper function to get background image source from background ID
const getBackgroundImageSource = (backgroundId: string | null) => {
  if (!backgroundId) return null;
  
  // Handle new background format (background_imageKey)
  if (backgroundId.startsWith('background_')) {
    const imageKey = backgroundId.replace('background_', '');
    return backgroundImages[imageKey as keyof typeof backgroundImages] || null;
  }
  
  // Handle legacy formats for backward compatibility
  if (backgroundId.startsWith('#')) {
    return backgroundId; // Color
  }
  
  if (backgroundId.startsWith('http')) {
    return { uri: backgroundId }; // URL
  }
  
  return null;
};

export function CreateEventScreen({ visible, onClose, onEventCreated }: CreateEventScreenProps) {
  const { theme, isDark } = useTheme();
  
  // Event data state
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    date: null,
    time: null,
    location: '',
    locationName: '',
    description: '',
    hostName: 'Joshua Smith',
    backgroundImage: null,
    titleStyle: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      fontWeight: '700',
      textAlign: 'center',
      fontStyle: 'normal',
      textDecorationLine: 'none',
    },
  });

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [showInvitationPreview, setShowInvitationPreview] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  // Initialize animations
  useEffect(() => {
    if (visible) {
      headerOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
      cardOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
      cardTranslateY.value = withDelay(200, withTiming(0, { 
        duration: 400, 
        easing: Easing.out(Easing.quad) 
      }));
    } else {
      headerOpacity.value = 0;
      cardOpacity.value = 0;
      cardTranslateY.value = 20;
    }
  }, [visible]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setEventData({
        title: '',
        date: null,
        time: null,
        location: '',
        locationName: '',
        description: '',
        hostName: 'Joshua Smith',
        backgroundImage: null,
        titleStyle: {
          color: isDark ? '#FFFFFF' : '#000000',
          fontSize: 20,
          fontFamily: 'Inter-Bold',
          fontWeight: '700',
          textAlign: 'center',
          fontStyle: 'normal',
          textDecorationLine: 'none',
        },
      });
    }
  }, [visible, isDark]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  // Event handlers
  const handleDateTimePress = () => {
    setShowDatePicker(true);
  };

  const handleLocationPress = () => {
    setShowLocationPicker(true);
  };

  const handleEventDetailsPress = () => {
    setShowEventDetails(true);
  };

  const handleBackgroundPress = () => {
    setShowBackgroundPicker(true);
  };

  const handleTitlePress = () => {
    setShowTitleInput(true);
  };

  const handleTitleSave = (title: string) => {
    setEventData(prev => ({ ...prev, title }));
    setShowTitleInput(false);
  };

  const handleDateSelect = (date: Date, time?: Date) => {
    setEventData(prev => ({
      ...prev,
      date,
      time: time || prev.time,
    }));
    setShowDatePicker(false);
  };

  const handleLocationSelect = (location: string, locationName?: string) => {
    setEventData(prev => ({
      ...prev,
      location,
      locationName: locationName || '',
    }));
    setShowLocationPicker(false);
  };

  const handleEventDetailsUpdate = (description: string, hostName: string) => {
    setEventData(prev => ({
      ...prev,
      description,
      hostName,
    }));
    setShowEventDetails(false);
  };

  const handleBackgroundSelect = (backgroundUrl: string | null, backgroundType?: string) => {
    setEventData(prev => ({
      ...prev,
      backgroundImage: backgroundUrl,
    }));
    setShowBackgroundPicker(false);
  };

  const formatDateTime = () => {
    if (!eventData.date) return 'Date and Time';
    
    const dateStr = eventData.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    if (eventData.time) {
      const timeStr = eventData.time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${dateStr} at ${timeStr}`;
    }
    
    return dateStr;
  };

  const isFormValid = () => {
    return eventData.title.trim() && eventData.date && eventData.time && eventData.location;
  };

  const handleCreateEvent = () => {
    if (!isFormValid()) {
      Alert.alert('Missing Information', 'Please fill in all required fields: Event Title, Date, Time, and Location.');
      return;
    }

    const finalEventData = {
      title: eventData.title,
      date: eventData.date!.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: eventData.time!.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      location: eventData.locationName || eventData.location,
      description: eventData.description,
      hostName: eventData.hostName,
      backgroundImage: eventData.backgroundImage,
    };

    onEventCreated(finalEventData);
    
    Alert.alert(
      'Event Created! 🎉',
      `${eventData.title} has been created successfully. You can now share it with your guests.`,
      [{ text: 'Awesome!' }]
    );
  };

  const handlePreviewPress = () => {
    setShowInvitationPreview(true);
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: theme.background,
    },
    surface: {
      backgroundColor: `${theme.surface}CC`, // 80% opacity
      borderColor: `${theme.border}66`, // 40% opacity
    },
    glassSurface: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, dynamicStyles.container]}>
        <StatusBar 
        barStyle={eventData.backgroundImage ? "light-content" : (isDark ? "light-content" : "dark-content")} 
        backgroundColor="transparent" 
        translucent 
      />
        
        {/* Background Pattern/Texture */}
        <View style={styles.backgroundContainer}>
          {(() => {
            const backgroundSource = getBackgroundImageSource(eventData.backgroundImage);
            
            if (backgroundSource) {
              if (typeof backgroundSource === 'string' && backgroundSource.startsWith('#')) {
                // Color background (legacy support)
                return (
                  <>
                    <LinearGradient
                      colors={[
                        backgroundSource, 
                        backgroundSource + 'E6', // 90% opacity
                        backgroundSource + 'CC'  // 80% opacity
                      ]}
                      style={styles.gradientBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={[
                      styles.backgroundOverlay, 
                      { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)' }
                    ]} />
                  </>
                );
              } else {
                // Image background (from invites folder or URL)
                return (
                  <>
                    <Image
                      source={backgroundSource}
                      style={styles.backgroundImage}
                      resizeMode="cover"
                    />
                    <View style={[
                      styles.backgroundOverlay, 
                      { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)' }
                    ]} />
                  </>
                );
              }
            } else {
              // Default gradient when no background is selected
              return (
                <LinearGradient
                  colors={isDark 
                    ? [theme.background, theme.surface, theme.background]
                    : [theme.background, theme.surface, theme.background]
                  }
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              );
            }
          })()}
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity onPress={onClose} style={[styles.headerButton, dynamicStyles.glassSurface]}>
              <X 
                size={getResponsiveSize(20, 22, 24, 26, 28)} 
                color={theme.text} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Create Event
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.demoButton, { backgroundColor: theme.primary }]}
              onPress={handlePreviewPress}
            >
              <Text style={styles.demoButtonText}>Preview</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Background Add Button */}
          <Animated.View style={[styles.backgroundButtonContainer, headerAnimatedStyle]}>
            <TouchableOpacity 
              style={styles.backgroundButton}
              onPress={handleBackgroundPress}
            >
              <View style={[styles.backgroundButtonGlass, dynamicStyles.glassSurface]}>
                <ImageIcon 
                  size={getResponsiveSize(16, 18, 20, 22, 24)} 
                  color={theme.text} 
                  strokeWidth={2}
                />
              </View>
              <Text style={[styles.backgroundButtonText, { color: theme.text }]}>
                {eventData.backgroundImage ? 'Edit Background' : 'Add Background'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Event Form */}
          <Animated.View style={[styles.formContainer, cardAnimatedStyle]}>
            {/* Event Title */}
            <TouchableOpacity
              style={styles.titleContainer}
              onPress={handleTitlePress}
              activeOpacity={0.8}
            >
              <View style={[styles.titleGlassBackground, dynamicStyles.glassSurface]} />
              <View style={styles.titleContent}>
                <Text style={[
                  styles.titleText,
                  {
                    color: eventData.title ? eventData.titleStyle.color : theme.textSecondary,
                    fontSize: moderateScale(getDisplayFontSize(eventData.titleStyle.fontSize)),
                    fontFamily: getFontFamily(
                      eventData.titleStyle.fontFamily, 
                      eventData.titleStyle.fontWeight, 
                      eventData.titleStyle.fontStyle
                    ),
                    fontWeight: eventData.titleStyle.fontWeight,
                    textAlign: eventData.titleStyle.textAlign,
                    fontStyle: eventData.titleStyle.fontStyle,
                    textDecorationLine: eventData.titleStyle.textDecorationLine,
                  }
                ]} numberOfLines={2}>
                  {eventData.title || 'Event Title *'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Date and Time Section */}
            <TouchableOpacity 
              style={styles.sectionCard}
              onPress={handleDateTimePress}
            >
              <View style={[styles.sectionGlassBackground, dynamicStyles.glassSurface]} />
              <View style={styles.sectionContent}>
                <View style={[styles.sectionIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <Calendar 
                    size={getResponsiveSize(18, 20, 22, 24, 26)} 
                    color={theme.primary} 
                    strokeWidth={2}
                  />
                </View>
                <Text style={[styles.sectionText, { color: theme.text }]}>
                  {formatDateTime()}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Location Section */}
            <TouchableOpacity 
              style={styles.sectionCard}
              onPress={handleLocationPress}
            >
              <View style={[styles.sectionGlassBackground, dynamicStyles.glassSurface]} />
              <View style={styles.sectionContent}>
                <View style={[styles.sectionIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <MapPin 
                    size={getResponsiveSize(18, 20, 22, 24, 26)} 
                    color={theme.primary} 
                    strokeWidth={2}
                  />
                </View>
                <Text style={[styles.sectionText, { color: theme.text }]}>
                  {eventData.locationName || eventData.location || 'Location'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Host Section */}
          <Animated.View style={[styles.hostContainer, cardAnimatedStyle]}>
            <TouchableOpacity 
              style={styles.hostCard}
              onPress={handleEventDetailsPress}
            >
              <View style={[styles.hostGlassBackground, dynamicStyles.glassSurface]} />
              <View style={styles.hostContent}>
                <View style={styles.hostAvatar}>
                  <View style={[styles.avatarPlaceholder, { backgroundColor: `${theme.primary}30` }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                      {eventData.hostName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                </View>
                <View style={styles.hostInfo}>
                  <Text style={[styles.hostName, { color: theme.text }]}>
                    Hosted by {eventData.hostName}
                  </Text>
                  <Text style={[styles.hostDescription, { color: theme.textSecondary }]}>
                    {eventData.description || 'Add a description.'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Create Button */}
          <Animated.View style={[styles.createButtonContainer, cardAnimatedStyle]}>
            <TouchableOpacity 
              style={[
                styles.createButton,
                { opacity: isFormValid() ? 1 : 0.6 }
              ]}
              onPress={handleCreateEvent}
              disabled={!isFormValid()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFormValid() ? [theme.success, '#45A049'] : [theme.border, theme.textSecondary]}
                style={styles.createButtonGradient}
              >
                <Check 
                  size={getResponsiveSize(16, 18, 20, 22, 24)} 
                  color="#FFFFFF" 
                  strokeWidth={2}
                />
                <Text style={styles.createButtonText}>
                  {isFormValid() ? 'Create Event' : 'Complete Required Fields'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>

        {/* Title Input Modal */}
        <Modal
          visible={showTitleInput}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTitleInput(false)}
        >
          <StatusBar 
            barStyle={theme.isDark ? "light-content" : "dark-content"} 
            backgroundColor={theme.background} 
            translucent={false}
          />
          <View style={[styles.titleInputModal, { backgroundColor: theme.background }]}>
            <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity 
                  onPress={() => setShowTitleInput(false)}
                  style={styles.modalHeaderButton}
                >
                  <X size={scale(20)} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
                
                <View style={styles.modalHeaderCenter}>
                  <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>
                    Event Title & Style
                  </Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => setShowTitleInput(false)}
                  style={[styles.styleButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.styleButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <View style={styles.titleInputContent}>
                <TextInput
                  style={[
                    styles.titleInputField,
                    {
                      color: eventData.titleStyle.color,
                      fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize, 24)),
                      fontFamily: getFontFamily(
                        eventData.titleStyle.fontFamily, 
                        eventData.titleStyle.fontWeight, 
                        eventData.titleStyle.fontStyle
                      ),
                      fontWeight: eventData.titleStyle.fontWeight,
                      textAlign: eventData.titleStyle.textAlign,
                      fontStyle: eventData.titleStyle.fontStyle,
                      textDecorationLine: eventData.titleStyle.textDecorationLine,
                      borderColor: theme.border,
                    }
                  ]}
                  placeholder="Event Title *"
                  placeholderTextColor={theme.textSecondary}
                  value={eventData.title}
                  onChangeText={(title) => setEventData(prev => ({ ...prev, title }))}
                  maxLength={50}
                  multiline
                  autoFocus
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={() => setShowTitleInput(false)}
                />
                
                {/* Preview */}
                <View style={[styles.titlePreview, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.titlePreviewLabel, { color: theme.textSecondary }]}>
                    Preview
                  </Text>
                  <Text style={[
                    styles.titlePreviewText,
                    {
                      color: eventData.titleStyle.color,
                      fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize, 20)),
                      fontFamily: getFontFamily(
                        eventData.titleStyle.fontFamily, 
                        eventData.titleStyle.fontWeight, 
                        eventData.titleStyle.fontStyle
                      ),
                      fontWeight: eventData.titleStyle.fontWeight,
                      textAlign: eventData.titleStyle.textAlign,
                      fontStyle: eventData.titleStyle.fontStyle,
                      textDecorationLine: eventData.titleStyle.textDecorationLine,
                    }
                  ]} numberOfLines={2}>
                    {eventData.title || 'Event Title Preview'}
                  </Text>
                </View>

                {/* Text Styling Controls */}
                <ScrollView style={styles.stylingContainer} showsVerticalScrollIndicator={false}>
                  
                  {/* Quick Format Toggles */}
                  <View style={[styles.quickFormatSection, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Quick Format
                    </Text>
                    <View style={styles.quickFormatRow}>
                      <TouchableOpacity
                        style={[
                          styles.formatToggle,
                          {
                            backgroundColor: eventData.titleStyle.fontWeight === '700' 
                              ? theme.primary : theme.background,
                            borderColor: theme.border,
                          }
                        ]}
                        onPress={() => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            fontWeight: prev.titleStyle.fontWeight === '700' ? '400' : '700',
                            fontFamily: prev.titleStyle.fontWeight === '700' ? 'Inter-Regular' : 'Inter-Bold'
                          }
                        }))}
                      >
                        <Text style={[
                          styles.formatToggleText,
                          {
                            color: eventData.titleStyle.fontWeight === '700' ? '#FFFFFF' : theme.text,
                            fontWeight: '700'
                          }
                        ]}>B</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.formatToggle,
                          {
                            backgroundColor: eventData.titleStyle.fontStyle === 'italic' 
                              ? theme.primary : theme.background,
                            borderColor: theme.border,
                          }
                        ]}
                        onPress={() => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            fontStyle: prev.titleStyle.fontStyle === 'italic' ? 'normal' : 'italic',
                            fontFamily: prev.titleStyle.fontStyle === 'italic' 
                              ? prev.titleStyle.fontFamily.replace('Italic', '').replace('Italic', '') || 'Inter-Regular'
                              : getFontFamily(prev.titleStyle.fontFamily, prev.titleStyle.fontWeight, 'italic')
                          }
                        }))}
                      >
                        <Text style={[
                          styles.formatToggleText,
                          {
                            color: eventData.titleStyle.fontStyle === 'italic' ? '#FFFFFF' : theme.text,
                            fontStyle: 'italic'
                          }
                        ]}>I</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.formatToggle,
                          {
                            backgroundColor: eventData.titleStyle.textDecorationLine.includes('underline') 
                              ? theme.primary : theme.background,
                            borderColor: theme.border,
                          }
                        ]}
                        onPress={() => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            textDecorationLine: prev.titleStyle.textDecorationLine.includes('underline') ? 'none' : 'underline'
                          }
                        }))}
                      >
                        <Text style={[
                          styles.formatToggleText,
                          {
                            color: eventData.titleStyle.textDecorationLine.includes('underline') ? '#FFFFFF' : theme.text,
                            textDecorationLine: 'underline'
                          }
                        ]}>U</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Text Alignment */}
                  <View style={[styles.alignmentSection, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Text Alignment
                    </Text>
                    <View style={styles.alignmentRow}>
                      {(['left', 'center', 'right'] as const).map((alignment) => (
                        <TouchableOpacity
                          key={alignment}
                          style={[
                            styles.alignmentButton,
                            {
                              backgroundColor: eventData.titleStyle.textAlign === alignment 
                                ? theme.primary : theme.background,
                              borderColor: theme.border,
                            }
                          ]}
                          onPress={() => setEventData(prev => ({
                            ...prev,
                            titleStyle: {
                              ...prev.titleStyle,
                              textAlign: alignment
                            }
                          }))}
                        >
                          <Text style={[
                            styles.alignmentButtonText,
                            {
                              color: eventData.titleStyle.textAlign === alignment ? '#FFFFFF' : theme.text,
                              textAlign: alignment
                            }
                          ]}>
                            {alignment === 'left' ? '⟸' : alignment === 'center' ? '⟷' : '⟹'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Font Size */}
                  <View style={[styles.fontSizeSection, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Font Size
                    </Text>
                    <View style={styles.fontSizeController}>
                      <TouchableOpacity
                        style={[styles.fontSizeArrow, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            fontSize: Math.max(8, prev.titleStyle.fontSize - 1)
                          }
                        }))}
                        disabled={eventData.titleStyle.fontSize <= 8}
                      >
                        <Text style={[styles.fontSizeArrowText, { 
                          color: eventData.titleStyle.fontSize <= 8 ? theme.textSecondary : theme.text 
                        }]}>−</Text>
                      </TouchableOpacity>
                      
                      <View style={[styles.fontSizeDisplay, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={[styles.fontSizeDisplayText, { color: theme.text }]}>
                          {eventData.titleStyle.fontSize}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        style={[styles.fontSizeArrow, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            fontSize: Math.min(25, prev.titleStyle.fontSize + 1)
                          }
                        }))}
                        disabled={eventData.titleStyle.fontSize >= 25}
                      >
                        <Text style={[styles.fontSizeArrowText, { 
                          color: eventData.titleStyle.fontSize >= 25 ? theme.textSecondary : theme.text 
                        }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.fontSizeHelper, { color: theme.textSecondary }]}>
                      Display is optimized for readability
                    </Text>
                  </View>

                  {/* Font Weight */}
                  <View style={[styles.fontWeightSection, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Font Weight
                    </Text>
                    <View style={styles.fontWeightOptions}>
                      {[
                        { weight: '400', label: 'Regular', family: 'Inter-Regular' },
                        { weight: '500', label: 'Medium', family: 'Inter-Medium' },
                        { weight: '600', label: 'SemiBold', family: 'Inter-SemiBold' },
                        { weight: '700', label: 'Bold', family: 'Inter-Bold' },
                        { weight: '800', label: 'ExtraBold', family: 'Inter-ExtraBold' }
                      ].map(({ weight, label, family }) => (
                        <TouchableOpacity
                          key={weight}
                          style={[
                            styles.fontWeightOption,
                            {
                              backgroundColor: eventData.titleStyle.fontWeight === weight 
                                ? theme.primary : theme.background,
                              borderColor: theme.border,
                            }
                          ]}
                          onPress={() => setEventData(prev => ({
                            ...prev,
                            titleStyle: {
                              ...prev.titleStyle,
                              fontWeight: weight as '400' | '500' | '600' | '700' | '800',
                              fontFamily: family
                            }
                          }))}
                        >
                          <Text style={[
                            styles.fontWeightOptionText,
                            {
                              color: eventData.titleStyle.fontWeight === weight ? '#FFFFFF' : theme.text,
                              fontFamily: family
                            }
                          ]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Advanced Color Picker */}
                  <View style={[styles.colorSection, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Text Color
                    </Text>
                    
                    <View style={styles.colorPickerContainer}>
                      <ColorPicker
                        initialColor={eventData.titleStyle.color}
                        onColorChange={(color) => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            color: color
                          }
                        }))}
                        style={styles.colorPickerStyle}
                      />
                    </View>
                  </View>

                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Modals */}
        <DateTimePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={handleDateSelect}
          currentDate={eventData.date}
          currentTime={eventData.time}
        />

        <LocationPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelect}
          currentLocation={eventData.location}
          currentLocationName={eventData.locationName}
        />

        <EventDetailsModal
          visible={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          onSave={handleEventDetailsUpdate}
          currentDescription={eventData.description}
          currentHostName={eventData.hostName}
        />

        <BackgroundPickerModal
          visible={showBackgroundPicker}
          onClose={() => setShowBackgroundPicker(false)}
          onSelect={handleBackgroundSelect}
          currentBackground={eventData.backgroundImage}
        />

        <Modal
          visible={showInvitationPreview}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={[styles.invitationPreviewContainer, dynamicStyles.container]}>
            <StatusBar 
              barStyle={eventData.backgroundImage ? "light-content" : (isDark ? "light-content" : "dark-content")} 
              backgroundColor="transparent" 
              translucent 
            />
            
            {/* Background */}
            <View style={styles.backgroundContainer}>
              {(() => {
                const backgroundSource = getBackgroundImageSource(eventData.backgroundImage);
                
                if (backgroundSource) {
                  if (typeof backgroundSource === 'string' && backgroundSource.startsWith('#')) {
                    // Color background (legacy support)
                    return (
                      <>
                        <LinearGradient
                          colors={[
                            backgroundSource, 
                            backgroundSource + 'F0',
                            backgroundSource + 'E6'
                          ]}
                          style={styles.gradientBackground}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <View style={[
                          styles.backgroundOverlay, 
                          { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.25)' }
                        ]} />
                      </>
                    );
                  } else {
                    // Image background (from invites folder or URL)
                    return (
                      <>
                        <Image
                          source={backgroundSource}
                          style={styles.backgroundImage}
                          resizeMode="cover"
                        />
                        <View style={[
                          styles.backgroundOverlay, 
                          { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)' }
                        ]} />
                      </>
                    );
                  }
                } else {
                  // Default elegant gradient for preview
                  return (
                    <LinearGradient
                      colors={isDark 
                        ? ['#1a1a2e', '#16213e', '#0f3460']
                        : ['#667eea', '#764ba2', '#f093fb']
                      }
                      style={styles.gradientBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  );
                }
              })()}
            </View>

            <SafeAreaView style={styles.invitationSafeArea}>
              {/* Header */}
              <View style={styles.invitationHeader}>
                <TouchableOpacity 
                  onPress={() => setShowInvitationPreview(false)} 
                  style={[styles.invitationCloseButton, dynamicStyles.glassSurface]}
                >
                  <X size={getResponsiveSize(18, 20, 22, 24, 26)} color={theme.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Main Invitation Card */}
              <ScrollView 
                style={styles.invitationScroll} 
                contentContainerStyle={styles.invitationScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
                <View style={styles.invitationCard}>
                  {/* Invitation Header */}
                  <View style={[styles.invitationCardHeader, dynamicStyles.glassSurface]}>
                    <Text style={styles.invitationLabel}>You're Invited!</Text>
                    
                    {/* Event Title */}
                    <Text style={[
                      styles.invitationEventTitle,
                      {
                        color: eventData.title ? eventData.titleStyle.color : theme.text,
                        fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize * 1.3, 36)),
                        fontFamily: getFontFamily(
                          eventData.titleStyle.fontFamily, 
                          eventData.titleStyle.fontWeight, 
                          eventData.titleStyle.fontStyle
                        ),
                        fontWeight: eventData.titleStyle.fontWeight,
                        textAlign: eventData.titleStyle.textAlign,
                        fontStyle: eventData.titleStyle.fontStyle,
                        textDecorationLine: eventData.titleStyle.textDecorationLine,
                      }
                    ]} numberOfLines={3}>
                      {eventData.title || 'Event Title'}
                    </Text>
                  </View>

                  {/* Event Details */}
                  <View style={[styles.invitationDetailsSection, dynamicStyles.glassSurface]}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Calendar size={getResponsiveSize(20, 22, 24, 26, 28)} color={theme.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date & Time</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                          {formatDateTime()}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <MapPin size={getResponsiveSize(20, 22, 24, 26, 28)} color={theme.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={2}>
                          {eventData.locationName || eventData.location || 'Location TBD'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Host Information */}
                  <View style={[styles.invitationHostSection, dynamicStyles.glassSurface]}>
                    <View style={styles.hostRow}>
                      <View style={styles.hostAvatarLarge}>
                        <LinearGradient
                          colors={[theme.primary, theme.primary + 'CC']}
                          style={styles.hostAvatarGradient}
                        >
                          <Text style={styles.hostAvatarLargeText}>
                            {eventData.hostName.split(' ').map(n => n[0]).join('')}
                          </Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.hostDetails}>
                        <Text style={[styles.hostTitle, { color: theme.textSecondary }]}>Hosted by</Text>
                        <Text style={[styles.hostNameLarge, { color: theme.text }]}>
                          {eventData.hostName}
                        </Text>
                        {eventData.description && (
                          <Text style={[styles.hostDescriptionLarge, { color: theme.textSecondary }]} numberOfLines={3}>
                            {eventData.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* RSVP Section */}
                  <View style={[styles.rsvpSectionMain, dynamicStyles.glassSurface]}>
                    <Text style={[styles.rsvpQuestion, { color: theme.text }]}>
                      Will you be attending?
                    </Text>
                    
                    <View style={styles.rsvpButtonsContainer}>
                      {/* Going Button */}
                      <TouchableOpacity 
                        style={[styles.rsvpButtonMain, styles.rsvpButtonGoing]}
                        activeOpacity={0.8}
                        disabled
                      >
                        <LinearGradient
                          colors={['#4CAF50', '#45A049']}
                          style={styles.rsvpButtonGradient}
                        >
                          <Check size={getResponsiveSize(18, 20, 22, 24, 26)} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.rsvpButtonLabel}>Going</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      {/* Not Going Button */}
                      <TouchableOpacity 
                        style={[styles.rsvpButtonMain, styles.rsvpButtonNotGoing]}
                        activeOpacity={0.8}
                        disabled
                      >
                        <LinearGradient
                          colors={['#f44336', '#d32f2f']}
                          style={styles.rsvpButtonGradient}
                        >
                          <X size={getResponsiveSize(18, 20, 22, 24, 26)} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.rsvpButtonLabel}>Not Going</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      {/* Maybe Button */}
                      <TouchableOpacity 
                        style={[styles.rsvpButtonMain, styles.rsvpButtonMaybe]}
                        activeOpacity={0.8}
                        disabled
                      >
                        <LinearGradient
                          colors={['#FF9800', '#F57C00']}
                          style={styles.rsvpButtonGradient}
                        >
                          <Text style={[styles.rsvpButtonIcon, { fontSize: getResponsiveSize(16, 18, 20, 22, 24) }]}>?</Text>
                          <Text style={styles.rsvpButtonLabel}>Maybe</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.rsvpNote, { color: theme.textSecondary }]}>
                      Your response helps the host plan better
                    </Text>
                  </View>

                  {/* Invitation Footer */}
                  <View style={[styles.invitationFooterMain, dynamicStyles.glassSurface]}>
                    <View style={styles.footerRow}>
                      <View style={styles.footerAvatarSmall}>
                        <Text style={[styles.footerAvatarText, { color: theme.primary }]}>
                          {eventData.hostName.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <Text style={[styles.footerHostText, { color: theme.textSecondary }]}>
                        Event created by {eventData.hostName.split(' ')[0]}
                      </Text>
                    </View>
                    
                    <View style={styles.footerDivider} />
                    
                    <View style={styles.footerBrand}>
                      <Text style={[styles.brandText, { color: theme.primary }]}>eventz</Text>
                      <Text style={[styles.brandTagline, { color: theme.textSecondary }]}>
                        Making events memorable
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBackground: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  
  // Header with proper responsive sizing
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(isShortDevice ? 8 : 12),
    paddingBottom: getResponsiveSpacing(8),
  },
  headerButton: {
    width: getResponsiveSize(38, 42, 46, 50, 54),
    height: getResponsiveSize(38, 42, 46, 50, 54),
    borderRadius: getResponsiveSize(19, 21, 23, 25, 27),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
  },
  headerTitle: {
    fontSize: getResponsiveSize(16, 18, 20, 22, 24),
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  demoButton: {
    paddingHorizontal: getResponsiveSize(12, 14, 16, 18, 20),
    paddingVertical: getResponsiveSize(8, 10, 12, 14, 16),
    borderRadius: getResponsiveSize(16, 18, 20, 22, 24),
    minWidth: getResponsiveSize(70, 80, 90, 100, 110),
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },

  // Background Button
  backgroundButtonContainer: {
    alignItems: 'center',
    marginTop: getResponsiveSpacing(isShortDevice ? 30 : isTallDevice ? 60 : 45),
    marginBottom: getResponsiveSpacing(10),
  },
  backgroundButton: {
    alignItems: 'center',
    gap: getResponsiveSpacing(8),
  },
  backgroundButtonGlass: {
    width: getResponsiveSize(48, 52, 56, 60, 64),
    height: getResponsiveSize(48, 52, 56, 60, 64),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backgroundButtonText: {
    fontSize: getResponsiveSize(13, 14, 15, 16, 17),
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },

  // Form Container
  formContainer: {
    marginTop: getResponsiveSpacing(isShortDevice ? 20 : 30),
    paddingHorizontal: getResponsiveSpacing(20),
    gap: getResponsiveSpacing(16),
  },

  // Title Input
  titleContainer: {
    position: 'relative',
    borderRadius: getResponsiveSize(16, 18, 20, 22, 24),
    overflow: 'hidden',
  },
  titleGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(16, 18, 20, 22, 24),
    borderWidth: 1,
  },
  titleInput: {
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(isShortDevice ? 16 : 20),
    fontSize: getResponsiveSize(20, 24, 28, 32, 36),
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  titleContent: {
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(isShortDevice ? 16 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: getResponsiveSize(56, 60, 64, 68, 72),
  },
  titleText: {
    textAlign: 'center',
    lineHeight: getResponsiveSize(24, 28, 32, 36, 40),
  },

  // Section Cards
  sectionCard: {
    position: 'relative',
    borderRadius: getResponsiveSize(14, 16, 18, 20, 22),
    overflow: 'hidden',
  },
  sectionGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(14, 16, 18, 20, 22),
    borderWidth: 1,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(16),
    gap: getResponsiveSpacing(12),
  },
  sectionIcon: {
    width: getResponsiveSize(36, 40, 44, 48, 52),
    height: getResponsiveSize(36, 40, 44, 48, 52),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionText: {
    flex: 1,
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontFamily: 'Inter-Medium',
  },

  // Host Section
  hostContainer: {
    paddingHorizontal: getResponsiveSpacing(20),
    marginTop: getResponsiveSpacing(16),
  },
  hostCard: {
    position: 'relative',
    borderRadius: getResponsiveSize(14, 16, 18, 20, 22),
    overflow: 'hidden',
  },
  hostGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(14, 16, 18, 20, 22),
    borderWidth: 1,
  },
  hostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(16),
    gap: getResponsiveSpacing(12),
  },
  hostAvatar: {
    width: getResponsiveSize(42, 46, 50, 54, 58),
    height: getResponsiveSize(42, 46, 50, 54, 58),
    borderRadius: getResponsiveSize(21, 23, 25, 27, 29),
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontFamily: 'Inter-Bold',
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontFamily: 'Inter-SemiBold',
    marginBottom: getResponsiveSpacing(2),
  },
  hostDescription: {
    fontSize: getResponsiveSize(13, 14, 15, 16, 17),
    fontFamily: 'Inter-Regular',
    lineHeight: getResponsiveSize(18, 20, 22, 24, 26),
  },

  // Create Button
  createButtonContainer: {
    paddingHorizontal: getResponsiveSpacing(20),
    paddingBottom: getResponsiveSpacing(isShortDevice ? 16 : 24),
    marginTop: 'auto',
  },
  createButton: {
    borderRadius: getResponsiveSize(14, 16, 18, 20, 22),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(16),
    gap: getResponsiveSpacing(8),
  },
  createButtonText: {
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },

  // Title Input Modal Styles
  titleInputModal: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalHeaderButton: {
    width: getResponsiveSize(36, 40, 44, 48, 52),
    height: getResponsiveSize(36, 40, 44, 48, 52),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(8),
  },
  modalHeaderTitle: {
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontWeight: '600',
    textAlign: 'center',
  },
  styleButton: {
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(8),
    borderRadius: getResponsiveSize(16, 18, 20, 22, 24),
    minWidth: getResponsiveSize(60, 70, 80, 90, 100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleButtonText: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  titleInputContent: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(20),
  },
  titleInputField: {
    borderWidth: 1,
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(16),
    textAlign: 'center',
    minHeight: getResponsiveSize(80, 90, 100, 110, 120),
    textAlignVertical: 'center',
  },
  titlePreview: {
    marginTop: getResponsiveSpacing(24),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
  },
  titlePreviewLabel: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontWeight: '500',
    marginBottom: getResponsiveSpacing(8),
  },
  titlePreviewText: {
    textAlign: 'center',
    lineHeight: getResponsiveSize(24, 28, 32, 36, 40),
  },

  // Text Styling Components - Responsive
  stylingContainer: {
    flex: 1,
    marginTop: getResponsiveSpacing(20),
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(12),
  },

  // Quick Format Section
  quickFormatSection: {
    marginHorizontal: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
  },
  quickFormatRow: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(12),
    justifyContent: 'center',
  },
  formatToggle: {
    width: getResponsiveSize(40, 44, 48, 52, 56),
    height: getResponsiveSize(40, 44, 48, 52, 56),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatToggleText: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontWeight: '600',
  },

  // Alignment Section
  alignmentSection: {
    marginHorizontal: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
  },
  alignmentRow: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(12),
    justifyContent: 'center',
  },
  alignmentButton: {
    flex: 1,
    height: getResponsiveSize(40, 44, 48, 52, 56),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alignmentButtonText: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontWeight: '600',
  },

  // Font Size Section
  fontSizeSection: {
    marginHorizontal: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
  },
  fontSizeController: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSpacing(12),
  },
  fontSizeArrow: {
    width: getResponsiveSize(36, 40, 44, 48, 52),
    height: getResponsiveSize(36, 40, 44, 48, 52),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeArrowText: {
    fontSize: getResponsiveSize(18, 20, 22, 24, 26),
    fontWeight: '600',
  },
  fontSizeDisplay: {
    minWidth: getResponsiveSize(60, 70, 80, 90, 100),
    height: getResponsiveSize(36, 40, 44, 48, 52),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeDisplayText: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontWeight: '600',
    textAlign: 'center',
  },

  // Font Weight Section
  fontWeightSection: {
    marginHorizontal: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
  },
  fontWeightOptions: {
    gap: getResponsiveSpacing(8),
  },
  fontWeightOption: {
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    borderWidth: 1,
    alignItems: 'center',
  },
  fontWeightOptionText: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
  },

  // Color Section
  colorSection: {
    marginHorizontal: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
  },
  colorPickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(8),
  },
  colorPickerStyle: {
    width: '100%',
    maxWidth: Math.min(SCREEN_WIDTH - getResponsiveSpacing(80), scale(320)),
  },

  // Font Size Helper Text
  fontSizeHelper: {
    fontSize: getResponsiveSize(11, 12, 13, 14, 15),
    textAlign: 'center',
    marginTop: getResponsiveSpacing(8),
  },

  // Invitation Preview Styles
  invitationPreviewContainer: {
    flex: 1,
  },
  invitationSafeArea: {
    flex: 1,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(12),
    paddingBottom: getResponsiveSpacing(8),
  },
  invitationCloseButton: {
    width: getResponsiveSize(38, 42, 46, 50, 54),
    height: getResponsiveSize(38, 42, 46, 50, 54),
    borderRadius: getResponsiveSize(19, 21, 23, 25, 27),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  invitationScroll: {
    flex: 1,
  },
  invitationScrollContent: {
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(20),
    paddingBottom: getResponsiveSpacing(40),
  },
  invitationCard: {
    borderRadius: getResponsiveSize(16, 18, 20, 22, 24),
    padding: getResponsiveSpacing(20),
    marginBottom: getResponsiveSpacing(20),
    borderWidth: 1,
  },
  invitationCardHeader: {
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
    borderWidth: 1,
  },
  invitationLabel: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontWeight: '600',
    textAlign: 'center',
  },
  invitationEventTitle: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(10),
  },
  invitationDetailsSection: {
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(16),
    gap: getResponsiveSpacing(12),
  },
  detailIconContainer: {
    width: getResponsiveSize(36, 40, 44, 48, 52),
    height: getResponsiveSize(36, 40, 44, 48, 52),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(4),
  },
  detailValue: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-Medium',
  },
  invitationHostSection: {
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
    borderWidth: 1,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(12),
  },
  hostAvatarLarge: {
    width: getResponsiveSize(48, 52, 56, 60, 64),
    height: getResponsiveSize(48, 52, 56, 60, 64),
    borderRadius: getResponsiveSize(24, 26, 28, 30, 32),
    overflow: 'hidden',
  },
  hostAvatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostAvatarLargeText: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-Bold',
  },
  hostDetails: {
    flex: 1,
  },
  hostTitle: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(4),
  },
  hostNameLarge: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-SemiBold',
  },
  hostDescriptionLarge: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontFamily: 'Inter-Regular',
    lineHeight: getResponsiveSize(20, 22, 24, 26, 28),
  },
  rsvpSectionMain: {
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
    borderWidth: 1,
  },
  rsvpQuestion: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(16),
  },
  rsvpButtonsContainer: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(12),
    justifyContent: 'center',
  },
  rsvpButtonMain: {
    flex: 1,
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rsvpButtonGoing: {
    // Additional styles for going button
  },
  rsvpButtonNotGoing: {
    // Additional styles for not going button
  },
  rsvpButtonMaybe: {
    // Additional styles for maybe button
  },
  rsvpButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(12),
    gap: getResponsiveSpacing(8),
  },
  rsvpButtonLabel: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  rsvpButtonIcon: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rsvpNote: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: getResponsiveSpacing(12),
  },
  invitationFooterMain: {
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(20),
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(12),
  },
  footerAvatarSmall: {
    width: getResponsiveSize(24, 26, 28, 30, 32),
    height: getResponsiveSize(24, 26, 28, 30, 32),
    borderRadius: getResponsiveSize(12, 13, 14, 15, 16),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerAvatarText: {
    fontSize: getResponsiveSize(10, 11, 12, 13, 14),
    fontFamily: 'Inter-Bold',
  },
  footerHostText: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontFamily: 'Inter-Medium',
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: getResponsiveSpacing(8),
  },
  footerBrand: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontFamily: 'Inter-Bold',
    marginBottom: getResponsiveSpacing(4),
  },
  brandTagline: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontFamily: 'Inter-Regular',
  },
}); 