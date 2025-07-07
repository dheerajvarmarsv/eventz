import React, { useState, useEffect } from 'react';
import type { TextStyle as RNTextStyle } from 'react-native';
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
} from 'lucide-react-native';
import { DateTimePickerModal } from './DateTimePickerModal';
import { LocationPickerModal } from './LocationPickerModal';
import { EventDetailsModal } from './EventDetailsModal';
import { BackgroundPickerModal } from './BackgroundPickerModal';
import { ColorPicker } from './ColorPicker';
import { TextStylePickerModal } from './TextStylePickerModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Local TextStyle interface without keyboard type
interface TextStyle {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: RNTextStyle['fontWeight'];
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

// Font weight support mapping for each font family
const getFontWeightOptions = (fontFamily: string) => {
  const weightMap: { [key: string]: Array<{ weight: string; label: string; available: boolean }> } = {
    // Sans-serif fonts - good weight support
    'System': [
      { weight: '300', label: 'Light', available: true },
      { weight: '400', label: 'Regular', available: true },
      { weight: '500', label: 'Medium', available: true },
      { weight: '600', label: 'SemiBold', available: true },
      { weight: '700', label: 'Bold', available: true },
      { weight: '800', label: 'ExtraBold', available: true }
    ],
    'Arial': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '500', label: 'Medium', available: true },
      { weight: '600', label: 'SemiBold', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Helvetica': [
      { weight: '300', label: 'Light', available: true },
      { weight: '400', label: 'Regular', available: true },
      { weight: '500', label: 'Medium', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Verdana': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Trebuchet MS': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'sans-serif': [
      { weight: '300', label: 'Light', available: true },
      { weight: '400', label: 'Regular', available: true },
      { weight: '500', label: 'Medium', available: true },
      { weight: '600', label: 'SemiBold', available: true },
      { weight: '700', label: 'Bold', available: true },
      { weight: '800', label: 'ExtraBold', available: true }
    ],
    
    // Serif fonts - varied support
    'Times New Roman': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Georgia': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Palatino': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '500', label: 'Medium', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'serif': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    
    // Monospace fonts - limited support
    'Courier': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Courier New': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Menlo': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'monospace': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    
    // Display fonts - unique characteristics
    'Impact': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true },
      { weight: '900', label: 'Black', available: true }
    ],
    'American Typewriter': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '600', label: 'SemiBold', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'Copperplate': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    'fantasy': [
      { weight: '400', label: 'Regular', available: true },
      { weight: '700', label: 'Bold', available: true }
    ],
    
    // Handwriting fonts - usually single weight
    'Snell Roundhand': [
      { weight: '400', label: 'Regular', available: true }
    ],
    'Marker Felt': [
      { weight: '400', label: 'Regular', available: true }
    ],
    'cursive': [
      { weight: '400', label: 'Regular', available: true }
    ]
  };
  
  return weightMap[fontFamily] || [
    { weight: '400', label: 'Regular', available: true },
    { weight: '700', label: 'Bold', available: true }
  ];
};

// Helper function to get proper font family display name
const getFontDisplayName = (fontFamily: string) => {
  const fontMap: { [key: string]: string } = {
    // Sans-serif fonts
    'System': 'System',
    'Arial': 'Arial',
    'Helvetica': 'Helvetica', 
    'Verdana': 'Verdana',
    'Trebuchet MS': 'Trebuchet MS',
    'sans-serif': 'System', // Android fallback
    
    // Serif fonts
    'Times New Roman': 'Times New Roman',
    'Georgia': 'Georgia',
    'Palatino': 'Palatino',
    'serif': 'Times New Roman', // Android fallback
    
    // Monospace fonts
    'Courier': 'Courier',
    'Courier New': 'Courier New',
    'Menlo': 'Menlo',
    'monospace': 'Courier', // Android fallback
    
    // Display fonts
    'Impact': 'Impact',
    'American Typewriter': 'American Typewriter',
    'Copperplate': 'Copperplate',
    'fantasy': 'Impact', // Android fallback
    
    // Handwriting fonts
    'Snell Roundhand': 'Snell Roundhand',
    'Marker Felt': 'Marker Felt',
    'cursive': 'Snell Roundhand', // Android fallback
  };
  
  return fontMap[fontFamily] || fontFamily || 'System';
};

// Helper to get the current weight label
const getWeightLabel = (fontFamily: string, weight: string) => {
  const options = getFontWeightOptions(fontFamily);
  const option = options.find(opt => opt.weight === weight);
  return option?.label || 'Regular';
};

const getFontFamily = (baseFamily: string, fontWeight: string, fontStyle: string) => {
  // All fonts now support all weights, italic, and underline through CSS properties
  // No special font family variants needed - React Native handles this automatically
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
  tealIndianElephant: require('@/assets/images/invites/Teal Colorful Illustrative Indian Elephant Phone Wallpaper.png'),
  blueArtsyBaby: require('@/assets/images/invites/Blue Artsy Baby Announcement Phone Wallpaper.png'),
  pinkArtsyBaby: require('@/assets/images/invites/Pink Artsy Baby Announcement Phone Wallpaper.png'),
  purpleFloralDiwali: require('@/assets/images/invites/Purple Illustrated Floral Diwali Phone Wallpaper.png'),
  loveHeartBalloons: require('@/assets/images/invites/Love Heart Balloons  watercolor phone wallpaper.png'),
  fondoAzulCumple: require('@/assets/images/invites/FondoDePantallaMovilInvitacionCumpleanosSimpleAzul.png'),
  greenYellowBlueRetro: require('@/assets/images/invites/Green Yellow and Blue Retro Cartoon Party Phone Wallpaper.png'),
  blueOrangeGreenCelebration: require('@/assets/images/invites/Blue Orange and Green Playful Celebration Phone Wallpaper.png'),
  birthdayInvitation1: require('@/assets/images/invites/Birthday Invitation (Phone Wallpaper).png'),
  birthdayInvitation2: require('@/assets/images/invites/Birthday Invitation (Phone Wallpaper another.png'),
  happyBirthday: require('@/assets/images/invites/Happy Birthday (Phone Wallpaper).png'),
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
  const router = useRouter();
  
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
  const [showTextStylePicker, setShowTextStylePicker] = useState(false);
  const [showFontWeightDropdown, setShowFontWeightDropdown] = useState(false);
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);

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
  const handleFinalizeEvent = () => {
    console.log('🚀 handleFinalizeEvent called');
    
    if (!eventData.title.trim()) {
      Alert.alert('Missing Information', 'Please add an event name before proceeding.', [{ text: 'OK' }]);
      return;
    }
    
    if (!eventData.hostName.trim()) {
      Alert.alert('Missing Information', 'Please add a host name before proceeding.', [{ text: 'OK' }]);
      return;
    }
    
    console.log('✅ Validation passed, navigating to loading screen.');
    
    // Navigate to the loading screen without closing the current modal
    router.push({
      pathname: '/creating-event',
      params: {
        eventData: JSON.stringify(eventData),
      },
    });
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

  const handleTextStyleApply = (textStyle: any) => {
    setEventData(prev => ({
      ...prev,
      titleStyle: {
        ...prev.titleStyle,
        color: textStyle.color,
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        fontWeight: textStyle.fontWeight,
        textAlign: textStyle.textAlign,
        fontStyle: textStyle.fontStyle,
        textDecorationLine: textStyle.textDecorationLine,
      }
    }));
    setShowTextStylePicker(false);
  };

  // Helper to close all dropdowns
  const closeAllDropdowns = () => {
    setShowFontFamilyDropdown(false);
    setShowFontWeightDropdown(false);
  };

  // Helper to change font family while preserving other styling
  const handleFontFamilyChange = (newFontFamily: string) => {
    setEventData(prev => {
      const availableWeights = getFontWeightOptions(newFontFamily);
      const currentWeight = prev.titleStyle.fontWeight;
      
      // Check if current weight is available for new font family
      const isCurrentWeightAvailable = availableWeights.some(opt => opt.weight === currentWeight);
      
      // If current weight isn't available, use the first available weight
      const newWeight = isCurrentWeightAvailable ? currentWeight : availableWeights[0].weight;
      
      return {
        ...prev,
        titleStyle: {
          ...prev.titleStyle,
          fontFamily: newFontFamily,
          fontWeight: newWeight
        }
      } as EventData;
    });
    setShowFontFamilyDropdown(false);
  };

  // Helper to change font weight while preserving font family and other styling
  const handleFontWeightChange = (newFontWeight: RNTextStyle['fontWeight']) => {
    setEventData(prev => ({
      ...prev,
      titleStyle: {
        ...prev.titleStyle,
        fontWeight: newFontWeight
      }
    }) as EventData);
    setShowFontWeightDropdown(false);
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
            <BlurView intensity={80} tint="dark" style={styles.previewButtonBlur} />
            <ArrowLeft size={getResponsiveSize(18, 20, 22, 24, 26)} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.previewNextButton}
            onPress={handleFinalizeEvent}
          >
            <BlurView intensity={60} tint="dark" style={styles.previewNextButtonBlur} />
            <Text style={styles.previewNextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.previewContent}>
          {/* Event Title */}
          <View style={styles.previewTitleContainer}>
            <Text style={[
              styles.previewTitle,
              {
                color: eventData.title ? eventData.titleStyle.color : '#FFFFFF',
                fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize * 1.1, 35)),
                fontFamily: eventData.titleStyle.fontFamily,
                fontWeight: eventData.titleStyle.fontWeight as any,
                textAlign: eventData.titleStyle.textAlign,
                fontStyle: eventData.titleStyle.fontStyle,
                textDecorationLine: eventData.titleStyle.textDecorationLine,
                lineHeight: moderateScale(Math.min(eventData.titleStyle.fontSize * 1.1, 35) * 1.2),
              }
            ]} numberOfLines={eventData.titleStyle.fontSize > 26 ? 2 : 3}>
              {eventData.title || 'Event Title'}
            </Text>
          </View>

          {/* Date & Time */}
          {(eventData.date || eventData.time) && (
            <Text style={styles.previewSubtitle}>
              {formatDateTime()}
            </Text>
          )}

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
              // Default background image when no image is selected
              return (
                <Image
                  source={require('@/assets/images/invites/default.png')}
                  style={styles.backgroundImage}
                  resizeMode="cover"
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
                  <View style={styles.titleTextContainer}>
                    <Text style={[
                      styles.titleText,
                      {
                        color: eventData.title ? eventData.titleStyle.color : 'rgba(255,255,255,0.7)',
                        fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize, 32)),
                        fontFamily: eventData.titleStyle.fontFamily,
                        fontWeight: eventData.titleStyle.fontWeight as any,
                        textAlign: eventData.titleStyle.textAlign,
                        fontStyle: eventData.titleStyle.fontStyle,
                        textDecorationLine: eventData.titleStyle.textDecorationLine,
                        lineHeight: moderateScale(Math.min(eventData.titleStyle.fontSize, 32) * 1.3),
                      }
                    ]} numberOfLines={eventData.titleStyle.fontSize > 26 ? 2 : 3}>
                      {eventData.title || 'Event Title *'}
                    </Text>
            </View>
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

        {/* Clean Title Input Modal */}
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
          <View style={[styles.titleInputModal, { backgroundColor: theme.isDark ? '#f3f4f6' : '#f3f4f6' }]}>
            <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
              {/* Clean Header */}
              <View style={[styles.cleanModalHeader, { backgroundColor: '#FFFFFF', borderBottomColor: '#e5e7eb' }]}>
            <TouchableOpacity 
                  onPress={() => setShowTitleInput(false)}
                  style={styles.cleanHeaderButton}
                >
                  <X size={scale(24)} color="#6b7280" strokeWidth={2} />
                </TouchableOpacity>
                
                <View style={styles.cleanHeaderCenter}>
                  <Text style={styles.cleanHeaderTitle}>
                    Event Title & Style
                  </Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => setShowTitleInput(false)}
                  style={styles.cleanDoneButton}
                >
                  <Text style={styles.cleanDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Clean Content */}
              <ScrollView 
                style={styles.cleanContent}
                contentContainerStyle={styles.cleanContentContainer}
                showsVerticalScrollIndicator={false}
                bounces={true}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}
                nestedScrollEnabled={true} // Enhanced for color picker interactions
              >
                {/* Title Input Card */}
                <View style={styles.cleanCard}>
                  <Text style={styles.cleanCardLabel}>
                    Event Title <Text style={styles.cleanRequiredStar}>*</Text>
                  </Text>
                  <TextInput
              style={[
                      styles.cleanInputField,
                      {
                        color: eventData.titleStyle.color,
                        fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize, 18)),
                        fontFamily: eventData.titleStyle.fontFamily,
                        fontWeight: eventData.titleStyle.fontWeight as any,
                        textAlign: eventData.titleStyle.textAlign,
                        fontStyle: eventData.titleStyle.fontStyle,
                        textDecorationLine: eventData.titleStyle.textDecorationLine,
                        // Dynamic height for larger fonts and script fonts
                        minHeight: eventData.titleStyle.fontSize > 20 ? verticalScale(60) : verticalScale(44),
                      }
                    ]}
                    placeholder="Event Title"
                    placeholderTextColor="#9ca3af"
                    value={eventData.title}
                    onChangeText={(title) => setEventData(prev => ({ ...prev, title }))}
                    maxLength={50}
                    autoFocus
                    multiline={eventData.titleStyle.fontSize > 16}
                  />
                </View>

                {/* Preview Card */}
                <View style={styles.cleanCard}>
                  <Text style={styles.cleanCardTitle}>Preview</Text>
                  <View style={styles.cleanPreviewBox}>
                    <Text style={[
                      styles.cleanPreviewText,
                      {
                        color: eventData.titleStyle.color,
                        fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize, 32)),
                        fontFamily: eventData.titleStyle.fontFamily,
                        fontWeight: eventData.titleStyle.fontWeight as any,
                        textAlign: eventData.titleStyle.textAlign,
                        fontStyle: eventData.titleStyle.fontStyle,
                        textDecorationLine: eventData.titleStyle.textDecorationLine,
                        lineHeight: moderateScale(Math.min(eventData.titleStyle.fontSize, 32) * 1.3),
                      }
                    ]} numberOfLines={eventData.titleStyle.fontSize > 26 ? 2 : 3}>
                      {eventData.title || 'Event Title Preview'}
                    </Text>
                  </View>
                </View>

                {/* Style Controls Card */}
                <View style={styles.cleanCard}>
                  {/* Grid Layout for Format Controls */}
                  <View style={styles.cleanGridRow}>
                    {/* Quick Format Column */}
                    <View style={styles.cleanGridColumn}>
                      <Text style={styles.cleanControlLabel}>Quick Format</Text>
                      <View style={styles.cleanFormatButtons}>
                        <TouchableOpacity
                          style={[
                            styles.cleanIconButton,
                            eventData.titleStyle.fontStyle === 'italic' && styles.cleanIconButtonActive
                          ]}
                          onPress={() => setEventData(prev => ({
                            ...prev,
                            titleStyle: {
                              ...prev.titleStyle,
                              fontStyle: prev.titleStyle.fontStyle === 'italic' ? 'normal' : 'italic'
                            }
                          }))}
                        >
                          <Text style={[
                            styles.cleanIconButtonText,
                            eventData.titleStyle.fontStyle === 'italic' && styles.cleanIconButtonTextActive,
                            { fontStyle: 'italic' }
                          ]}>I</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.cleanIconButton,
                            eventData.titleStyle.textDecorationLine.includes('underline') && styles.cleanIconButtonActive
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
                            styles.cleanIconButtonText,
                            eventData.titleStyle.textDecorationLine.includes('underline') && styles.cleanIconButtonTextActive,
                            { textDecorationLine: 'underline' }
                          ]}>U</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Text Alignment Column */}
                    <View style={styles.cleanGridColumn}>
                      <Text style={styles.cleanControlLabel}>Text Alignment</Text>
                      <View style={styles.cleanAlignmentButtons}>
                        {[
                          { align: 'left' as const, icon: AlignLeft },
                          { align: 'center' as const, icon: AlignCenter },
                          { align: 'right' as const, icon: AlignRight }
                        ].map(({ align, icon: IconComponent }) => (
                          <TouchableOpacity
                            key={align}
                            style={[
                              styles.cleanAlignButton,
                              eventData.titleStyle.textAlign === align && styles.cleanAlignButtonActive
                            ]}
                            onPress={() => setEventData(prev => ({
                              ...prev,
                              titleStyle: {
                                ...prev.titleStyle,
                                textAlign: align
                              }
                            }))}
                          >
                            <IconComponent 
                  size={getResponsiveSize(16, 18, 20, 22, 24)} 
                              color={eventData.titleStyle.textAlign === align ? '#FFFFFF' : '#6B7280'} 
                  strokeWidth={2}
                />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Font Controls Grid */}
                  <View style={styles.cleanGridRowSpaced}>
                    {/* Font Family Column */}
                    <View style={styles.cleanGridColumn}>
                      <Text style={styles.cleanControlLabel}>Font Family</Text>
                      <View>
                        <TouchableOpacity
                          style={styles.cleanDropdownSelect}
                          onPress={() => {
                            setShowFontWeightDropdown(false);
                            setShowFontFamilyDropdown(!showFontFamilyDropdown);
                          }}
                        >
                          <Text style={styles.cleanDropdownText}>
                            {getFontDisplayName(eventData.titleStyle.fontFamily)}
                </Text>
                          <ChevronDown 
                            size={getResponsiveSize(14, 16, 18, 20, 22)} 
                            color="#6B7280" 
                            strokeWidth={2}
                            style={{
                              transform: [{ rotate: showFontFamilyDropdown ? '180deg' : '0deg' }]
                            }}
                          />
            </TouchableOpacity>
                        
                        {/* Font Family Dropdown */}
                        {showFontFamilyDropdown && (
                          <View style={styles.cleanInlineDropdown}>
                            <ScrollView style={styles.cleanDropdownScroll} showsVerticalScrollIndicator={false}>
                              {/* Sans-serif Fonts */}
                              <View style={styles.cleanFontCategory}>
                                <Text style={styles.cleanFontCategoryLabel}>Sans-serif</Text>
                                {[
                                  { 
                                    family: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                                    label: 'System',
                                    fallback: 'sans-serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
                                    label: 'Arial',
                                    fallback: 'sans-serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
                                    label: 'Helvetica',
                                    fallback: 'sans-serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Verdana' : 'sans-serif',
                                    label: 'Verdana',
                                    fallback: 'sans-serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif',
                                    label: 'Trebuchet MS',
                                    fallback: 'sans-serif'
                                  }
                                ].map(({ family, label, fallback }) => (
                                  <TouchableOpacity
                                    key={label}
                                    style={[
                                      styles.cleanDropdownOption,
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionActive
                                    ]}
                                    onPress={() => handleFontFamilyChange(family)}
                                  >
                                    <Text style={[
                                      styles.cleanDropdownOptionText,
                                      { fontFamily: family },
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionTextActive
                                    ]}>
                                      {label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>

                              {/* Serif Fonts */}
                              <View style={styles.cleanFontCategory}>
                                <Text style={styles.cleanFontCategoryLabel}>Serif</Text>
                                {[
                                  { 
                                    family: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
                                    label: 'Times New Roman',
                                    fallback: 'serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                                    label: 'Georgia',
                                    fallback: 'serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Palatino' : 'serif',
                                    label: 'Palatino',
                                    fallback: 'serif'
                                  }
                                ].map(({ family, label, fallback }) => (
                                  <TouchableOpacity
                                    key={label}
                                    style={[
                                      styles.cleanDropdownOption,
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionActive
                                    ]}
                                    onPress={() => handleFontFamilyChange(family)}
                                  >
                                    <Text style={[
                                      styles.cleanDropdownOptionText,
                                      { fontFamily: family },
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionTextActive
                                    ]}>
                                      {label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>

                              {/* Monospace Fonts */}
                              <View style={styles.cleanFontCategory}>
                                <Text style={styles.cleanFontCategoryLabel}>Monospace</Text>
                                {[
                                  { 
                                    family: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                                    label: 'Courier',
                                    fallback: 'monospace'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
                                    label: 'Courier New',
                                    fallback: 'monospace'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                                    label: 'Menlo',
                                    fallback: 'monospace'
                                  }
                                ].map(({ family, label, fallback }) => (
                                  <TouchableOpacity
                                    key={label}
                                    style={[
                                      styles.cleanDropdownOption,
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionActive
                                    ]}
                                    onPress={() => handleFontFamilyChange(family)}
                                  >
                                    <Text style={[
                                      styles.cleanDropdownOptionText,
                                      { fontFamily: family },
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionTextActive
                                    ]}>
                                      {label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>

                              {/* Display Fonts */}
                              <View style={styles.cleanFontCategory}>
                                <Text style={styles.cleanFontCategoryLabel}>Display</Text>
                                {[
                                  { 
                                    family: Platform.OS === 'ios' ? 'Impact' : 'sans-serif',
                                    label: 'Impact',
                                    fallback: 'sans-serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'American Typewriter' : 'serif',
                                    label: 'American Typewriter',
                                    fallback: 'serif'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Copperplate' : 'fantasy',
                                    label: 'Copperplate',
                                    fallback: 'fantasy'
                                  }
                                ].map(({ family, label, fallback }) => (
                                  <TouchableOpacity
                                    key={label}
                                    style={[
                                      styles.cleanDropdownOption,
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionActive
                                    ]}
                                    onPress={() => handleFontFamilyChange(family)}
                                  >
                                    <Text style={[
                                      styles.cleanDropdownOptionText,
                                      { fontFamily: family },
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionTextActive
                                    ]}>
                                      {label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>

                              {/* Handwriting Fonts */}
                              <View style={styles.cleanFontCategory}>
                                <Text style={styles.cleanFontCategoryLabel}>Handwriting</Text>
                                {[
                                  { 
                                    family: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
                                    label: 'Snell Roundhand',
                                    fallback: 'cursive'
                                  },
                                  { 
                                    family: Platform.OS === 'ios' ? 'Marker Felt' : 'fantasy',
                                    label: 'Marker Felt',
                                    fallback: 'fantasy'
                                  }
                                ].map(({ family, label, fallback }) => (
                                  <TouchableOpacity
                                    key={label}
                                    style={[
                                      styles.cleanDropdownOption,
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionActive
                                    ]}
                                    onPress={() => handleFontFamilyChange(family)}
                                  >
                                    <Text style={[
                                      styles.cleanDropdownOptionText,
                                      { fontFamily: family },
                                      eventData.titleStyle.fontFamily === family && styles.cleanDropdownOptionTextActive
                                    ]}>
                                      {label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Font Weight Column */}
                    <View style={styles.cleanGridColumn}>
                      <Text style={styles.cleanControlLabel}>Font Weight</Text>
                      <View>
                                                <TouchableOpacity
                          style={styles.cleanDropdownSelect}
                          onPress={() => {
                            setShowFontFamilyDropdown(false);
                            setShowFontWeightDropdown(!showFontWeightDropdown);
                          }}
                        >
                          <Text style={styles.cleanDropdownText}>
                            {getWeightLabel(eventData.titleStyle.fontFamily, (eventData.titleStyle.fontWeight || '').toString())}
                          </Text>
                          <ChevronDown 
                            size={getResponsiveSize(14, 16, 18, 20, 22)} 
                            color="#6B7280" 
                            strokeWidth={2}
                            style={{
                              transform: [{ rotate: showFontWeightDropdown ? '180deg' : '0deg' }]
                            }}
                          />
                        </TouchableOpacity>
                        
                        {/* Font Weight Dropdown */}
                        {showFontWeightDropdown && (
                          <View style={styles.cleanInlineDropdown}>
                            {getFontWeightOptions(eventData.titleStyle.fontFamily).map(({ weight, label }) => (
                              <TouchableOpacity
                                key={weight}
                                style={[
                                  styles.cleanDropdownOption,
                                  eventData.titleStyle.fontWeight === weight && styles.cleanDropdownOptionActive
                                ]}
                                onPress={() => handleFontWeightChange(weight as RNTextStyle['fontWeight'])}
                              >
                                <Text style={[
                                  styles.cleanDropdownOptionText,
                                  eventData.titleStyle.fontWeight === weight && styles.cleanDropdownOptionTextActive,
                                  { fontFamily: eventData.titleStyle.fontFamily, fontWeight: weight as any }
                                ]}>
                                  {label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Font Size Column - Full Width */}
                    <View style={styles.cleanFontSizeColumn}>
                      <Text style={styles.cleanControlLabelCenter}>Font Size</Text>
                      <View style={styles.cleanNumberInput}>
                        <TouchableOpacity
                          style={[
                            styles.cleanNumberButton,
                            styles.cleanNumberButtonLeft,
                            eventData.titleStyle.fontSize <= 8 && styles.cleanNumberButtonDisabled
                          ]}
                          onPress={() => setEventData(prev => ({
                            ...prev,
                            titleStyle: {
                              ...prev.titleStyle,
                              fontSize: Math.max(8, prev.titleStyle.fontSize - 1)
                            }
                          }))}
                          disabled={eventData.titleStyle.fontSize <= 8}
                        >
                          <Text style={[
                            styles.cleanNumberButtonText,
                            eventData.titleStyle.fontSize <= 8 && styles.cleanNumberButtonTextDisabled
                          ]}>−</Text>
                        </TouchableOpacity>

                        <View style={styles.cleanNumberDisplay}>
                          <Text style={styles.cleanNumberDisplayText}>
                            {eventData.titleStyle.fontSize}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.cleanNumberButton,
                            styles.cleanNumberButtonRight,
                            eventData.titleStyle.fontSize >= 32 && styles.cleanNumberButtonDisabled
                          ]}
                          onPress={() => setEventData(prev => ({
                            ...prev,
                            titleStyle: {
                              ...prev.titleStyle,
                              fontSize: Math.min(32, prev.titleStyle.fontSize + 1)
                            }
                          }))}
                          disabled={eventData.titleStyle.fontSize >= 32}
                        >
                          <Text style={[
                            styles.cleanNumberButtonText,
                            eventData.titleStyle.fontSize >= 32 && styles.cleanNumberButtonTextDisabled
                          ]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Color Section */}
                  <View style={styles.cleanCard}>
                    <Text style={styles.cleanControlLabel}>Color</Text>
                    <View style={styles.cleanColorPickerContainer}>
                      <ColorPicker
                        initialColor={eventData.titleStyle.color}
                        onColorChange={(color) => setEventData(prev => ({
                          ...prev,
                          titleStyle: {
                            ...prev.titleStyle,
                            color: color
                          }
                        }))}
                        style={styles.cleanColorPickerStyle}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
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
              // Default background image - match CreateEventScreen
              return (
                <ImageBackground
                  source={require('@/assets/images/invites/default.png')}
                  style={styles.previewBackground}
                  resizeMode="cover"
                >
                  {renderPreviewContent()}
                </ImageBackground>
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

        <TextStylePickerModal
          visible={showTextStylePicker}
          onClose={() => setShowTextStylePicker(false)}
          onApply={handleTextStyleApply}
          currentStyle={{
            keyboardType: 'default',
            color: eventData.titleStyle.color,
            fontSize: eventData.titleStyle.fontSize,
            fontFamily: eventData.titleStyle.fontFamily,
            fontWeight: eventData.titleStyle.fontWeight as any,
            textAlign: eventData.titleStyle.textAlign,
            fontStyle: eventData.titleStyle.fontStyle,
            textDecorationLine: eventData.titleStyle.textDecorationLine,
          }}
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
  titleTextContainer: {
    overflow: 'hidden',
    paddingVertical: getResponsiveSpacing(4),
    width: '100%',
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
    paddingHorizontal: getResponsiveSpacing(16),
    paddingTop: getResponsiveSpacing(16),
    paddingBottom: getResponsiveSpacing(8),
    marginTop: Platform.OS === 'ios' ? getResponsiveSpacing(8) : getResponsiveSpacing(16),
  },
  previewBackButton: {
    width: getResponsiveSize(44, 48, 52, 56, 60),
    height: getResponsiveSize(44, 48, 52, 56, 60),
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  previewNextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(10),
    paddingHorizontal: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
    position: 'relative',
    overflow: 'hidden',
    minHeight: getResponsiveSize(44, 48, 52, 56, 60),
    justifyContent: 'center',
  },
  previewNextButtonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(22, 24, 26, 28, 30),
  },
  previewNextButtonText: {
    color: '#FFFFFF',
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
  previewTitleContainer: {
    overflow: 'hidden',
    paddingVertical: getResponsiveSpacing(8),
    width: '100%',
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

  // Font Family Styles
  fontFamilySection: {
    marginBottom: getResponsiveSpacing(20),
    borderRadius: getResponsiveSize(12, 14, 16, 18, 20),
    padding: getResponsiveSpacing(16),
  },
  fontFamilyDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing(16),
    borderRadius: getResponsiveSize(8, 9, 10, 11, 12),
    borderWidth: 1,
    minHeight: getResponsiveSize(60, 65, 70, 75, 80),
  },
  fontFamilyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(12),
  },
  fontFamilyPreview: {
    width: getResponsiveSize(40, 42, 44, 46, 48),
    height: getResponsiveSize(40, 42, 44, 46, 48),
    borderRadius: getResponsiveSize(20, 21, 22, 23, 24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontFamilyPreviewText: {
    fontSize: getResponsiveSize(18, 19, 20, 21, 22),
    fontWeight: '600',
  },
  fontFamilyInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: getResponsiveSpacing(2),
  },
  fontFamilyName: {
    fontSize: getResponsiveSize(15, 16, 17, 18, 19),
    fontWeight: '600',
  },
  fontFamilyDescription: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontWeight: '400',
  },
  fontFamilyArrow: {
    fontSize: getResponsiveSize(12, 13, 14, 15, 16),
    fontWeight: '500',
    paddingLeft: getResponsiveSpacing(8),
  },

  // Clean Modal Styles
  cleanModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  cleanHeaderButton: {
    padding: scale(8),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  cleanHeaderTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Inter-SemiBold',
  },
  cleanDoneButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    minWidth: scale(60),
    alignItems: 'center',
  },
  cleanDoneButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  // Clean Content
  cleanContent: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  cleanContentContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(180), // Enhanced for color picker + hue slider visibility
    gap: verticalScale(24),
    flexGrow: 1,
  },

  // Clean Cards
  cleanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cleanCardLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(4),
    fontFamily: 'Inter-Medium',
  },
  cleanRequiredStar: {
    color: '#ef4444',
  },
  cleanCardTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(8),
    fontFamily: 'Inter-Medium',
  },

  // Clean Input Field
  cleanInputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
    minHeight: verticalScale(44),
    // Fix for script/decorative fonts that extend beyond bounds
    overflow: 'hidden',
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
    // Additional padding for script fonts like Zapfino
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(16),
  },

  // Clean Preview
  cleanPreviewBox: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: scale(8),
    backgroundColor: '#f9fafb',
    minHeight: verticalScale(80),
    justifyContent: 'center',
    // Better overflow handling for script fonts
    overflow: 'hidden',
  },
  cleanPreviewText: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    lineHeight: moderateScale(32),
  },

  // Clean Grid Layout
  cleanGridRow: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(16),
  },
  cleanGridRowSpaced: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(16),
    flexWrap: 'wrap',
  },
  cleanGridColumn: {
    flex: 1,
    minWidth: scale(140),
  },
  cleanControlLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(4),
    fontFamily: 'Inter-Medium',
  },
  cleanControlLabelCenter: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(4),
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },

  // Clean Format Buttons
  cleanFormatButtons: {
    flexDirection: 'row',
    gap: scale(8),
  },
  cleanIconButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanIconButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  cleanIconButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#4b5563',
  },
  cleanIconButtonTextActive: {
    color: '#FFFFFF',
  },

  // Clean Alignment Buttons
  cleanAlignmentButtons: {
    flexDirection: 'row',
    gap: scale(4),
  },
  cleanAlignButton: {
    flex: 1,
    height: scale(32),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanAlignButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  cleanAlignButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#4b5563',
  },
  cleanAlignButtonTextActive: {
    color: '#FFFFFF',
  },

  // Clean Dropdown
  cleanDropdownSelect: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: verticalScale(44),
  },
  cleanDropdownText: {
    fontSize: moderateScale(14),
    color: '#374151',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  cleanDropdownArrow: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginLeft: scale(8),
  },

  // Clean Font Weight Selector
  cleanWeightSelector: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: scale(8),
    marginTop: verticalScale(4),
    maxHeight: verticalScale(200),
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cleanWeightOption: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  cleanWeightOptionActive: {
    backgroundColor: '#f3f4f6',
  },
  cleanWeightOptionText: {
    fontSize: moderateScale(14),
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  cleanWeightOptionTextActive: {
    color: '#8b5cf6',
    fontWeight: '500',
  },

  // Clean Font Size Column
  cleanFontSizeColumn: {
    flex: 1,
    minWidth: scale(120),
    alignItems: 'center',
  },

  // Clean Number Input
  cleanNumberInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanNumberButton: {
    width: scale(32),
    height: scale(40),
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanNumberButtonLeft: {
    borderTopLeftRadius: scale(6),
    borderBottomLeftRadius: scale(6),
    borderRightWidth: 0,
  },
  cleanNumberButtonRight: {
    borderTopRightRadius: scale(6),
    borderBottomRightRadius: scale(6),
    borderLeftWidth: 0,
  },
  cleanNumberButtonDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  cleanNumberButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#4b5563',
  },
  cleanNumberButtonTextDisabled: {
    color: '#9ca3af',
  },
  cleanNumberDisplay: {
    minWidth: scale(64),
    height: scale(40),
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  cleanNumberDisplayText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },

  // Clean Color Section
  cleanColorSection: {
    // Remove marginTop and marginBottom since cleanCard handles spacing
  },
  cleanColorPickerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(180), // Increased to accommodate both color picker and hue slider
  },
  cleanColorPickerStyle: {
    width: '100%',
    maxWidth: scale(300),
    minHeight: verticalScale(160), // Ensures full ColorPicker component is visible
  },

  // Clean Inline Dropdown
  cleanInlineDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: scale(8),
    marginTop: verticalScale(4),
    maxHeight: verticalScale(180),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  cleanDropdownOption: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  cleanDropdownOptionActive: {
    backgroundColor: '#f3f4f6',
  },
  cleanDropdownOptionText: {
    fontSize: moderateScale(14),
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  cleanDropdownOptionTextActive: {
    color: '#8b5cf6',
    fontWeight: '500',
  },

  // Font Category Styles
  cleanDropdownScroll: {
    maxHeight: verticalScale(180),
  },
  cleanFontCategory: {
    paddingVertical: verticalScale(4),
  },
  cleanFontCategoryLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: '#f9fafb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    fontFamily: 'Inter-SemiBold',
  },
}); 