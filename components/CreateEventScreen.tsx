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
  ImageBackground,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { 
  X, 
  Calendar, 
  MapPin, 
  ImageIcon,
  Check,
  User,
  FileText,
  Eye,
  ArrowLeft,
} from 'lucide-react-native';
import { DateTimePickerModal } from './DateTimePickerModal';
import { LocationPickerModal } from './LocationPickerModal';
import { EventDetailsModal } from './EventDetailsModal';
import { BackgroundPickerModal } from './BackgroundPickerModal';
import { ColorPicker } from './ColorPicker';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    // Cap the display font size to 32px maximum
    return Math.min(fontSize, 32);
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
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Initialize animations
  useEffect(() => {
    if (visible) {
      headerOpacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
      contentTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 100 }));
    } else {
      headerOpacity.value = 0;
      contentOpacity.value = 0;
      contentTranslateY.value = 30;
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

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Event handlers
  const handleDateTimePress = () => setShowDatePicker(true);
  const handleLocationPress = () => setShowLocationPicker(true);
  const handleEventDetailsPress = () => setShowEventDetails(true);
  const handleBackgroundPress = () => setShowBackgroundPicker(true);
  const handleTitlePress = () => setShowTitleInput(true);
  const handlePreviewPress = () => setShowInvitationPreview(true);

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



  // Helper function to render preview content
  const renderPreviewContent = () => (
    <>
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
        style={styles.previewGradientOverlay}
      />
      <SafeAreaView style={styles.previewContainer}>
        {/* Header */}
        <View style={styles.previewHeader}>
          <TouchableOpacity 
            style={styles.previewBackButton}
            onPress={() => setShowInvitationPreview(false)}
          >
            <ArrowLeft size={getResponsiveSize(18, 20, 22, 24, 26)} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.previewNextButton}>
            <Text style={styles.previewNextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.previewContent}>
          {/* Event Title */}
          <Text style={[
            styles.previewTitle,
            {
              color: eventData.title ? eventData.titleStyle.color : '#FFFFFF',
              fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize * 1.2, 48)),
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

          {/* Date & Time */}
          <Text style={styles.previewSubtitle}>
            {formatDateTime()}
          </Text>

          {/* Location Name */}
          {eventData.locationName && (
            <Text style={styles.previewSubtitle}>
              {eventData.locationName}
            </Text>
          )}

          {/* Location Address */}
          {eventData.location && (
            <Text style={styles.previewLocation}>
              {eventData.location}
            </Text>
          )}

          {/* Host Info */}
          <View style={styles.previewHostInfo}>
            <View style={styles.previewHostAvatar}>
              <Text style={styles.previewHostAvatarText}>
                {eventData.hostName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.previewHostName}>
              Hosted by {eventData.hostName}
            </Text>
          </View>

          {/* Description */}
          {eventData.description && (
            <Text style={styles.previewDescription}>
              {eventData.description}
            </Text>
          )}

          {/* RSVP Container */}
          <View style={styles.previewRsvpContainer}>
            <View style={styles.previewRsvpOptions}>
              <TouchableOpacity style={styles.previewRsvpOption}>
                <Check size={getResponsiveSize(20, 22, 24, 26, 28)} color="white" strokeWidth={2} />
                <Text style={styles.previewRsvpOptionText}>Going</Text>
              </TouchableOpacity>

              <View style={styles.previewRsvpDivider} />

              <TouchableOpacity style={styles.previewRsvpOption}>
                <X size={getResponsiveSize(20, 22, 24, 26, 28)} color="white" strokeWidth={2} />
                <Text style={styles.previewRsvpOptionText}>Not Going</Text>
              </TouchableOpacity>

              <View style={styles.previewRsvpDivider} />

              <TouchableOpacity style={styles.previewRsvpOption}>
                <Text style={[styles.previewRsvpOptionIcon, { fontSize: getResponsiveSize(16, 18, 20, 22, 24) }]}>?</Text>
                <Text style={styles.previewRsvpOptionText}>Maybe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );

  // Check if background exists for styling
  const hasBackground = !!eventData.backgroundImage;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent 
        />
        
        {/* Background */}
        <View style={styles.backgroundContainer}>
          {(() => {
            const backgroundSource = getBackgroundImageSource(eventData.backgroundImage);
            
            if (backgroundSource) {
              if (typeof backgroundSource === 'string' && backgroundSource.startsWith('#')) {
                return (
          <LinearGradient
                    colors={[backgroundSource, backgroundSource + 'E6', backgroundSource + 'CC']}
                    style={styles.gradientBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                );
              } else {
                return (
                  <Image
                    source={backgroundSource}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  />
                );
              }
            } else {
              // Default dark background when no image
              return (
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
              );
            }
          })()}
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Header with Translucent Buttons */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.headerButton}
            >
              <BlurView intensity={80} tint="dark" style={styles.headerButtonBlur} />
              <X 
                size={getResponsiveSize(20, 22, 24, 26, 28)} 
                color="#FFFFFF" 
                strokeWidth={2.5} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={handlePreviewPress}
            >
              <BlurView intensity={60} tint="dark" style={styles.previewButtonBlur} />
              <Eye size={getResponsiveSize(16, 17, 18, 19, 20)} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Background Button */}
          <Animated.View style={[styles.backgroundButtonContainer, headerAnimatedStyle]}>
            <TouchableOpacity 
              style={styles.backgroundButton}
              onPress={handleBackgroundPress}
              activeOpacity={0.8}
            >
              <BlurView intensity={60} tint="dark" style={styles.backgroundButtonBlur} />
              <Text style={styles.backgroundButtonText}>
                {eventData.backgroundImage ? 'Edit Background' : 'Add Background'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Main Content with Connected Translucent Cards */}
          <Animated.View style={[styles.mainContent, contentAnimatedStyle]}>
            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Connected Event Details Card */}
              <View style={styles.connectedCard}>
                {/* Title Section */}
                                  <TouchableOpacity
                    style={styles.titleSection}
                    onPress={handleTitlePress}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={60} tint="dark" style={styles.cardBlur} />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)']}
                      style={styles.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  <Text style={[
                    styles.titleText,
                    {
                      color: eventData.title ? eventData.titleStyle.color : 'rgba(255,255,255,0.7)',
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
                      lineHeight: moderateScale(getDisplayFontSize(eventData.titleStyle.fontSize) * 1.2),
                    }
                  ]} numberOfLines={eventData.titleStyle.fontSize > 26 ? 2 : 3}>
                    {eventData.title || 'Event Title *'}
                  </Text>
                </TouchableOpacity>

                                  {/* Date & Time Section */}
            <TouchableOpacity 
                    style={styles.detailSection}
              onPress={handleDateTimePress}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={50} tint="dark" style={styles.cardBlur} />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)']}
                      style={styles.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  <View style={styles.detailContent}>
                    <View style={styles.detailIconContainer}>
                  <Calendar 
                        size={getResponsiveSize(20, 22, 24, 26, 28)} 
                        color="rgba(255,255,255,0.8)" 
                    strokeWidth={2}
                  />
                </View>
                    <Text style={styles.detailText}>
                  {formatDateTime()}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Location Section */}
            <TouchableOpacity 
                    style={styles.locationSection}
              onPress={handleLocationPress}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={50} tint="dark" style={styles.cardBlur} />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)']}
                      style={styles.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  <View style={styles.detailContent}>
                    <View style={styles.detailIconContainer}>
                  <MapPin 
                        size={getResponsiveSize(20, 22, 24, 26, 28)} 
                        color="rgba(255,255,255,0.8)" 
                    strokeWidth={2}
                  />
                </View>
                    <Text style={styles.detailText}>
                  {eventData.locationName || eventData.location || 'Location'}
                </Text>
              </View>
            </TouchableOpacity>
              </View>

              {/* Host Card */}
            <TouchableOpacity 
              style={styles.hostCard}
              onPress={handleEventDetailsPress}
                activeOpacity={0.8}
              >
                <BlurView intensity={50} tint="dark" style={styles.cardBlur} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              <View style={styles.hostContent}>
                <View style={styles.hostAvatar}>
                    <Text style={styles.hostAvatarText}>
                      {eventData.hostName.split(' ').map(n => n[0]).join('')}
                    </Text>
                </View>
                <View style={styles.hostInfo}>
                    <Text style={styles.hostName}>
                    Hosted by {eventData.hostName}
                  </Text>
                    <Text style={styles.hostDescription}>
                    {eventData.description || 'Add a description.'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

          
            </ScrollView>
          </Animated.View>
        </SafeAreaView>

        {/* Complete Title Input Modal */}
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

        {/* All Original Modals */}
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

        {/* Event Preview Modal - Simple Design */}
        <Modal
          visible={showInvitationPreview}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          {(() => {
            const backgroundSource = getBackgroundImageSource(eventData.backgroundImage);
            
            if (backgroundSource) {
              if (typeof backgroundSource === 'string' && backgroundSource.startsWith('#')) {
                // Solid color background
                return (
                  <LinearGradient
                    colors={[backgroundSource, backgroundSource + 'F0', backgroundSource + 'E6']}
                    style={styles.previewBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {renderPreviewContent()}
                  </LinearGradient>
                );
              } else {
                // Image background
                return (
                  <ImageBackground
                    source={backgroundSource}
                    style={styles.previewBackground}
                    resizeMode="cover"
                  >
                    {renderPreviewContent()}
                  </ImageBackground>
                );
              }
            } else {
              // Default gradient background
              return (
                <LinearGradient
                  colors={isDark 
                    ? ['#1a1a2e', '#16213e', '#0f3460']
                    : ['#667eea', '#764ba2', '#f093fb']
                  }
                  style={styles.previewBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {renderPreviewContent()}
                </LinearGradient>
              );
                        }
          })()}
        </Modal>

        {/* All other modals for functionality */}
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
  
  // Background Styles
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(Platform.OS === 'ios' ? 8 : 16),
    paddingBottom: getResponsiveSpacing(8),
  },
  headerButton: {
    width: getResponsiveSize(44, 48, 52, 56, 60),
    height: getResponsiveSize(44, 48, 52, 56, 60),
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerButtonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
    gap: getResponsiveSpacing(8),
    position: 'relative',
    overflow: 'hidden',
  },
  previewButtonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
  },
  previewButtonText: {
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Background Button
  backgroundButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    marginTop: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(12),
  },
  backgroundButton: {
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: getResponsiveSize(20, 22, 24, 26, 28),
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundButtonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(20, 22, 24, 26, 28),
  },
  backgroundButtonText: {
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(20),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getResponsiveSpacing(30),
    gap: getResponsiveSpacing(16),
  },

  // Translucent Card Styles
  cardBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Connected Card Structure
  connectedCard: {
    borderRadius: getResponsiveSize(20, 22, 24, 26, 28),
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Title Section (Top of connected card)
  titleSection: {
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(28),
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getResponsiveSize(100, 110, 120, 130, 140),
  },
  titleText: {
    fontSize: getResponsiveSize(24, 26, 28, 30, 32),
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: getResponsiveSize(30, 34, 38, 42, 46),
    letterSpacing: 0.3,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },

  // Detail Sections (Middle parts of connected card)
  detailSection: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationSection: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: getResponsiveSpacing(24),
    paddingVertical: getResponsiveSpacing(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(16),
  },
  detailIconContainer: {
    width: getResponsiveSize(24, 26, 28, 30, 32),
    alignItems: 'center',
  },
  detailText: {
    flex: 1,
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Host Card
  hostCard: {
    borderRadius: getResponsiveSize(20, 22, 24, 26, 28),
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(20),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(16),
  },
  hostAvatar: {
    width: getResponsiveSize(48, 52, 56, 60, 64),
    height: getResponsiveSize(48, 52, 56, 60, 64),
    borderRadius: getResponsiveSize(24, 26, 28, 30, 32),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostAvatarText: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: getResponsiveSpacing(4),
    letterSpacing: 0.2,
  },
  hostDescription: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: getResponsiveSize(18, 20, 22, 24, 26),
    letterSpacing: 0.1,
  },



  // Title Input Modal Styles (Complete Implementation)
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

  // Text Styling Components
  stylingContainer: {
    flex: 1,
    marginTop: getResponsiveSpacing(20),
  },
  
  sectionTitle: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(12),
  },

  quickFormatSection: {
    marginBottom: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
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

  alignmentSection: {
    marginBottom: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
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

  fontSizeSection: {
    marginBottom: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
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
  fontSizeHelper: {
    fontSize: getResponsiveSize(11, 12, 13, 14, 15),
    textAlign: 'center',
    marginTop: getResponsiveSpacing(8),
  },

  fontWeightSection: {
    marginBottom: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
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

  colorSection: {
    marginBottom: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
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



  // Preview Modal Styles
  previewBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  previewGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveSpacing(16),
  },
  previewBackButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: getResponsiveSpacing(12),
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewNextButton: {
    backgroundColor: 'white',
    paddingVertical: getResponsiveSpacing(10),
    paddingHorizontal: getResponsiveSpacing(24),
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewNextButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: getResponsiveSize(13, 14, 15, 16, 17),
    fontFamily: 'Inter-SemiBold',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(24),
    paddingTop: getResponsiveSpacing(16),
    paddingBottom: getResponsiveSpacing(8),
  },
  previewTitle: {
    fontSize: getResponsiveSize(36, 40, 44, 48, 52),
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: 'white',
    marginBottom: getResponsiveSpacing(12),
    textAlign: 'center',
    lineHeight: getResponsiveSize(42, 48, 54, 60, 66),
  },
  previewSubtitle: {
    fontSize: getResponsiveSize(16, 17, 18, 19, 20),
    color: 'white',
    marginBottom: getResponsiveSpacing(4),
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  previewLocation: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    color: 'white',
    marginBottom: getResponsiveSpacing(24),
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  previewHostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(8),
  },
  previewHostAvatar: {
    width: getResponsiveSize(36, 38, 40, 42, 44),
    height: getResponsiveSize(36, 38, 40, 42, 44),
    borderRadius: getResponsiveSize(18, 19, 20, 21, 22),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'white',
    marginRight: getResponsiveSpacing(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewHostAvatarText: {
    fontSize: getResponsiveSize(14, 15, 16, 17, 18),
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: 'white',
  },
  previewHostName: {
    fontSize: getResponsiveSize(13, 14, 15, 16, 17),
    fontWeight: '500',
    color: 'white',
    fontFamily: 'Inter-Medium',
  },
  previewDescription: {
    fontSize: getResponsiveSize(13, 14, 15, 16, 17),
    color: '#E5E7EB',
    marginBottom: getResponsiveSpacing(32),
    textAlign: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
    fontFamily: 'Inter-Regular',
    lineHeight: getResponsiveSize(18, 20, 22, 24, 26),
  },
  previewRsvpContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: getResponsiveSize(14, 16, 18, 20, 22),
    padding: getResponsiveSpacing(20),
    width: '100%',
  },
  previewRsvpOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  previewRsvpOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(12),
    paddingHorizontal: getResponsiveSpacing(8),
    borderRadius: getResponsiveSize(10, 12, 14, 16, 18),
  },
  previewRsvpOptionText: {
    fontSize: getResponsiveSize(13, 14, 15, 16, 17),
    fontWeight: '500',
    color: 'white',
    marginTop: getResponsiveSpacing(6),
    fontFamily: 'Inter-Medium',
  },
  previewRsvpOptionIcon: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  previewRsvpDivider: {
    height: getResponsiveSize(44, 46, 48, 50, 52),
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}); 