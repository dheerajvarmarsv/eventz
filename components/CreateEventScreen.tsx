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
import { TextStylePickerModal, TextStyle } from './TextStylePickerModal';
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
      keyboardType: 'default',
      color: '#FFFFFF',
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      fontWeight: '700',
      isItalic: false,
      isUnderlined: false,
      isBold: false,
    },
  });

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextStylePicker, setShowTextStylePicker] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);

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
          keyboardType: 'default',
          color: '#FFFFFF',
          fontSize: 20,
          fontFamily: 'Inter-Bold',
          fontWeight: '700',
          isItalic: false,
          isUnderlined: false,
          isBold: false,
        },
      });
    }
  }, [visible]);

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

  const handleTitleStylePress = () => {
    setShowTextStylePicker(true);
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

  const handleTextStyleSelect = (textStyle: TextStyle) => {
    setEventData(prev => ({
      ...prev,
      titleStyle: textStyle,
    }));
    setShowTextStylePicker(false);
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

  const fillDemoData = () => {
    const demoDate = new Date();
    demoDate.setDate(demoDate.getDate() + 7);
    const demoTime = new Date();
    demoTime.setHours(19, 0, 0, 0);
    
    setEventData({
      title: "Sarah's Birthday Party",
      date: demoDate,
      time: demoTime,
      location: "123 Party Street, New York, NY",
      locationName: "Central Park Pavilion",
      description: "Join us for an amazing birthday celebration with music, food, and great company! Bring your dancing shoes!",
      hostName: "Joshua Smith",
      backgroundImage: null,
      titleStyle: {
        keyboardType: 'default',
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        fontWeight: '700',
        isItalic: false,
        isUnderlined: false,
        isBold: false,
      },
    });
    
    Alert.alert('Demo Data Loaded! 🎉', 'All fields have been filled with sample data. You can now test the Create Event functionality.');
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
          {eventData.backgroundImage ? (
            <>
              {eventData.backgroundImage.startsWith('#') ? (
                // Color background (emoji backgrounds)
                <LinearGradient
                  colors={[
                    eventData.backgroundImage, 
                    eventData.backgroundImage + 'E6', // 90% opacity
                    eventData.backgroundImage + 'CC'  // 80% opacity
                  ]}
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              ) : (
                // Image background (photographic or custom)
                <Image
                  source={{ uri: eventData.backgroundImage }}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
              )}
              {/* Semi-transparent overlay to ensure content readability */}
              <View style={[
                styles.backgroundOverlay, 
                { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)' }
              ]} />
            </>
          ) : (
            // Default gradient when no background is selected
            <LinearGradient
              colors={isDark 
                ? [theme.background, theme.surface, theme.background]
                : [theme.surface, theme.background, theme.surface]
              }
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
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
              onPress={fillDemoData}
            >
              <Text style={styles.demoButtonText}>Fill Demo</Text>
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
                    fontSize: moderateScale(eventData.titleStyle.fontSize),
                    fontFamily: eventData.titleStyle.fontFamily,
                    fontWeight: eventData.titleStyle.fontWeight,
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
                    Event Title
                  </Text>
                </View>
                
                <TouchableOpacity 
                  onPress={handleTitleStylePress}
                  style={[styles.styleButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.styleButtonText}>Style</Text>
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <View style={styles.titleInputContent}>
                <TextInput
                  style={[
                    styles.titleInputField,
                    {
                      color: eventData.titleStyle.color,
                      fontSize: moderateScale(eventData.titleStyle.fontSize),
                      fontFamily: eventData.titleStyle.fontFamily,
                      fontWeight: eventData.titleStyle.fontWeight,
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
                  keyboardType={eventData.titleStyle.keyboardType}
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
                      fontSize: moderateScale(Math.min(eventData.titleStyle.fontSize, 24)),
                      fontFamily: eventData.titleStyle.fontFamily,
                      fontWeight: eventData.titleStyle.fontWeight,
                    }
                  ]} numberOfLines={2}>
                    {eventData.title || 'Event Title Preview'}
                  </Text>
                </View>
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

        <TextStylePickerModal
          visible={showTextStylePicker}
          onClose={() => setShowTextStylePicker(false)}
          onApply={handleTextStyleSelect}
          currentStyle={eventData.titleStyle}
        />
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
}); 