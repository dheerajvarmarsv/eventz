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
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  Type,
  Palette,
  Hash,
  Check,
  Keyboard,
  AtSign,
  Phone,
  Calculator,
  Bold,
  Italic,
  Underline,
  Sliders,
  Paintbrush,
  Eye,
  Plus
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
  if (SCREEN_WIDTH <= 320) return 'extraSmall';
  if (SCREEN_WIDTH <= 375) return 'small';
  if (SCREEN_WIDTH <= 414) return 'medium';
  if (SCREEN_WIDTH <= 428) return 'large';
  return 'extraLarge';
};

const deviceCategory = getDeviceCategory();

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

// Keyboard types
interface KeyboardOption {
  id: string;
  name: string;
  type: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url' | 'web-search';
  icon: any;
  description: string;
}

const KEYBOARD_OPTIONS: KeyboardOption[] = [
  {
    id: 'default',
    name: 'Default',
    type: 'default',
    icon: Keyboard,
    description: 'Standard keyboard'
  },
  {
    id: 'email',
    name: 'Email',
    type: 'email-address',
    icon: AtSign,
    description: 'Email optimized'
  },
  {
    id: 'numeric',
    name: 'Numbers',
    type: 'numeric',
    icon: Calculator,
    description: 'Numbers only'
  },
  {
    id: 'phone',
    name: 'Phone',
    type: 'phone-pad',
    icon: Phone,
    description: 'Phone number pad'
  },
];

// Predefined text colors
interface ColorOption {
  id: string;
  name: string;
  color: string;
  category: 'primary' | 'neutral' | 'vibrant' | 'pastel';
}

const TEXT_COLORS: ColorOption[] = [
  // Primary colors
  { id: 'white', name: 'White', color: '#FFFFFF', category: 'primary' },
  { id: 'black', name: 'Black', color: '#000000', category: 'primary' },
  { id: 'blue', name: 'Blue', color: '#007AFF', category: 'primary' },
  { id: 'purple', name: 'Purple', color: '#AF52DE', category: 'primary' },
  
  // Neutral colors
  { id: 'gray', name: 'Gray', color: '#8E8E93', category: 'neutral' },
  { id: 'darkGray', name: 'Dark Gray', color: '#48484A', category: 'neutral' },
  { id: 'lightGray', name: 'Light Gray', color: '#C7C7CC', category: 'neutral' },
  { id: 'silver', name: 'Silver', color: '#AEAEB2', category: 'neutral' },
  
  // Vibrant colors
  { id: 'red', name: 'Red', color: '#FF3B30', category: 'vibrant' },
  { id: 'orange', name: 'Orange', color: '#FF9500', category: 'vibrant' },
  { id: 'yellow', name: 'Yellow', color: '#FFCC00', category: 'vibrant' },
  { id: 'green', name: 'Green', color: '#34C759', category: 'vibrant' },
  { id: 'teal', name: 'Teal', color: '#5AC8FA', category: 'vibrant' },
  { id: 'indigo', name: 'Indigo', color: '#5856D6', category: 'vibrant' },
  { id: 'pink', name: 'Pink', color: '#FF2D92', category: 'vibrant' },
  
  // Pastel colors
  { id: 'lightBlue', name: 'Light Blue', color: '#ADD8E6', category: 'pastel' },
  { id: 'lightGreen', name: 'Light Green', color: '#90EE90', category: 'pastel' },
  { id: 'lightPink', name: 'Light Pink', color: '#FFB6C1', category: 'pastel' },
  { id: 'lavender', name: 'Lavender', color: '#E6E6FA', category: 'pastel' },
  { id: 'peach', name: 'Peach', color: '#FFCBA4', category: 'pastel' },
  { id: 'mint', name: 'Mint', color: '#98FB98', category: 'pastel' },
];

// Font families
interface FontFamilyOption {
  id: string;
  name: string;
  family: string;
  weight: '400' | '500' | '600' | '700' | '800';
  description: string;
}

const FONT_FAMILIES: FontFamilyOption[] = [
  { id: 'regular', name: 'Regular', family: 'Inter-Regular', weight: '400', description: 'Clean and readable' },
  { id: 'medium', name: 'Medium', family: 'Inter-Medium', weight: '500', description: 'Slightly bold' },
  { id: 'semiBold', name: 'Semi Bold', family: 'Inter-SemiBold', weight: '600', description: 'Strong emphasis' },
  { id: 'bold', name: 'Bold', family: 'Inter-Bold', weight: '700', description: 'Bold and impactful' },
  { id: 'extraBold', name: 'Extra Bold', family: 'Inter-ExtraBold', weight: '800', description: 'Maximum boldness' },
];

// Text style interface with comprehensive formatting options
export interface TextStyle {
  keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url' | 'web-search';
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  isItalic: boolean;
  isUnderlined: boolean;
  isBold: boolean;
}

// Props interface
interface TextStylePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (textStyle: TextStyle) => void;
  currentStyle: TextStyle;
}

// Custom Slider Component
const CustomSlider = ({ 
  value, 
  minimumValue, 
  maximumValue, 
  onValueChange, 
  style, 
  theme 
}: {
  value: number;
  minimumValue: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  style?: any;
  theme: any;
}) => {
  const sliderWidth = scale(250);
  const thumbSize = scale(20);
  
  const progress = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = progress * (sliderWidth - thumbSize);
  
  const handleTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / sliderWidth));
    const newValue = minimumValue + newProgress * (maximumValue - minimumValue);
    onValueChange(Math.round(newValue));
  };
  
  return (
    <View style={[styles.sliderContainer, style]}>
      <View 
        style={[styles.sliderTrack, { backgroundColor: theme.border }]}
        onTouchStart={handleTouch}
      >
        <View 
          style={[
            styles.sliderActive, 
            { 
              width: thumbPosition + thumbSize / 2,
              backgroundColor: theme.primary 
            }
          ]} 
        />
        <View 
          style={[
            styles.sliderThumb, 
            { 
              left: thumbPosition,
              backgroundColor: theme.primary 
            }
          ]} 
        />
      </View>
      <Text style={[styles.sliderValue, { color: theme.textSecondary }]}>
        {value}px
      </Text>
    </View>
  );
};

export function TextStylePickerModal({
  visible,
  onClose,
  onApply,
  currentStyle,
}: TextStylePickerModalProps) {
  const { theme } = useTheme();

  // State management with comprehensive formatting options
  const [selectedKeyboard, setSelectedKeyboard] = useState<string>(() => {
    const keyboard = KEYBOARD_OPTIONS.find(k => k.type === currentStyle.keyboardType);
    return keyboard?.id || 'default';
  });
  
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const color = TEXT_COLORS.find(c => c.color === currentStyle.color);
    return color?.id || 'white';
  });
  
  const [customColor, setCustomColor] = useState<string>(currentStyle.color);
  const [useCustomColor, setUseCustomColor] = useState<boolean>(() => {
    return !TEXT_COLORS.find(c => c.color === currentStyle.color);
  });
  
  const [fontSize, setFontSize] = useState<number>(currentStyle.fontSize);
  
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(() => {
    const fontFamily = FONT_FAMILIES.find(f => f.family === currentStyle.fontFamily);
    return fontFamily?.id || 'bold';
  });
  
  const [isBold, setIsBold] = useState<boolean>(currentStyle.isBold);
  const [isItalic, setIsItalic] = useState<boolean>(currentStyle.isItalic);
  const [isUnderlined, setIsUnderlined] = useState<boolean>(currentStyle.isUnderlined);
  
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'format'>('colors');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

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

  // Handle apply with animation
  const handleApply = useCallback(() => {
    buttonScale.value = withSpring(0.95, { duration: 100 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { duration: 200 });
    }, 100);

    const keyboardOption = KEYBOARD_OPTIONS.find(k => k.id === selectedKeyboard);
    const colorOption = TEXT_COLORS.find(c => c.id === selectedColor);
    const fontFamilyOption = FONT_FAMILIES.find(f => f.id === selectedFontFamily);

    const finalColor = useCustomColor ? customColor : (colorOption?.color || '#FFFFFF');

    const newTextStyle: TextStyle = {
      keyboardType: keyboardOption?.type || 'default',
      color: finalColor,
      fontSize: fontSize,
      fontFamily: fontFamilyOption?.family || 'Inter-Bold',
      fontWeight: fontFamilyOption?.weight || '700',
      isItalic: isItalic,
      isUnderlined: isUnderlined,
      isBold: isBold,
    };

    onApply(newTextStyle);
  }, [selectedKeyboard, selectedColor, customColor, useCustomColor, fontSize, selectedFontFamily, isBold, isItalic, isUnderlined, onApply, buttonScale]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Get preview style
  const getPreviewStyle = () => {
    const colorOption = TEXT_COLORS.find(c => c.id === selectedColor);
    const fontFamilyOption = FONT_FAMILIES.find(f => f.id === selectedFontFamily);
    const finalColor = useCustomColor ? customColor : (colorOption?.color || '#FFFFFF');

    return {
      color: finalColor,
      fontSize: moderateScale(Math.min(fontSize, 28)), // Cap preview size
      fontFamily: fontFamilyOption?.family || 'Inter-Bold',
      fontWeight: isBold ? '700' as const : (fontFamilyOption?.weight || '700'),
      fontStyle: isItalic ? 'italic' as const : 'normal' as const,
      textDecorationLine: isUnderlined ? 'underline' as const : 'none' as const,
    };
  };

  // Validate hex color
  const isValidHexColor = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };

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
                Text Style
              </Text>
            </View>
            
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity 
                onPress={handleApply}
                style={[styles.applyButton, { backgroundColor: theme.primary }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {/* Preview */}
            <View style={[styles.previewContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
                <Eye size={scale(14)} color={theme.textSecondary} />  Preview
              </Text>
              <View style={[styles.previewBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.previewText, getPreviewStyle()]} numberOfLines={1}>
                  Event Title Sample
                </Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              {[
                { id: 'colors', label: 'Colors', icon: Palette },
                { id: 'typography', label: 'Typography', icon: Type },
                { id: 'format', label: 'Format', icon: Bold },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: activeTab === tab.id ? theme.primary : theme.surface,
                    }
                  ]}
                  onPress={() => setActiveTab(tab.id as any)}
                >
                  <tab.icon 
                    size={scale(16)} 
                    color={activeTab === tab.id ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.tabText,
                    {
                      color: activeTab === tab.id ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: activeTab === tab.id ? 'Inter-SemiBold' : 'Inter-Medium',
                    }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <View style={styles.section}>
                  {/* Predefined Colors */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Predefined Colors
                  </Text>
                  <View style={styles.colorGrid}>
                    {TEXT_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color.id}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color.color,
                            borderColor: selectedColor === color.id && !useCustomColor ? theme.primary : 'transparent',
                            borderWidth: selectedColor === color.id && !useCustomColor ? 3 : 1,
                          }
                        ]}
                        onPress={() => {
                          setSelectedColor(color.id);
                          setUseCustomColor(false);
                        }}
                      >
                        {selectedColor === color.id && !useCustomColor && (
                          <Check size={scale(16)} color={color.color === '#FFFFFF' ? '#000000' : '#FFFFFF'} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Custom Color */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Custom Color
                  </Text>
                  <View style={styles.customColorContainer}>
                    <TouchableOpacity
                      style={[
                        styles.customColorPreview,
                        {
                          backgroundColor: isValidHexColor(customColor) ? customColor : theme.surface,
                          borderColor: useCustomColor ? theme.primary : theme.border,
                          borderWidth: useCustomColor ? 3 : 1,
                        }
                      ]}
                      onPress={() => setUseCustomColor(true)}
                    >
                      {useCustomColor && (
                        <Check size={scale(16)} color={customColor === '#FFFFFF' ? '#000000' : '#FFFFFF'} />
                      )}
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.customColorInput,
                        {
                          backgroundColor: theme.surface,
                          color: theme.text,
                          borderColor: useCustomColor ? theme.primary : theme.border,
                        }
                      ]}
                      value={customColor}
                      onChangeText={(text) => {
                        setCustomColor(text);
                        if (isValidHexColor(text)) {
                          setUseCustomColor(true);
                        }
                      }}
                      placeholder="#FFFFFF"
                      placeholderTextColor={theme.textSecondary}
                      maxLength={7}
                    />
                  </View>
                </View>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <View style={styles.section}>
                  {/* Font Size */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Font Size
                  </Text>
                  <CustomSlider
                    value={fontSize}
                    minimumValue={12}
                    maximumValue={48}
                    onValueChange={setFontSize}
                    theme={theme}
                  />

                  {/* Font Family */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Font Family
                  </Text>
                  <View style={styles.fontFamilyGrid}>
                    {FONT_FAMILIES.map((font) => (
                      <TouchableOpacity
                        key={font.id}
                        style={[
                          styles.fontFamilyOption,
                          {
                            backgroundColor: theme.surface,
                            borderColor: selectedFontFamily === font.id ? theme.primary : 'transparent',
                            borderWidth: selectedFontFamily === font.id ? 2 : 0,
                          }
                        ]}
                        onPress={() => setSelectedFontFamily(font.id)}
                      >
                        <Text style={[
                          styles.fontFamilyText,
                          {
                            color: theme.text,
                            fontFamily: font.family,
                          }
                        ]}>
                          {font.name}
                        </Text>
                        <Text style={[styles.fontFamilyDescription, { color: theme.textSecondary }]}>
                          {font.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Format Tab */}
              {activeTab === 'format' && (
                <View style={styles.section}>
                  {/* Formatting Options */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Text Formatting
                  </Text>
                  <View style={styles.formatGrid}>
                    {[
                      { id: 'bold', label: 'Bold', icon: Bold, active: isBold, onPress: () => setIsBold(!isBold) },
                      { id: 'italic', label: 'Italic', icon: Italic, active: isItalic, onPress: () => setIsItalic(!isItalic) },
                      { id: 'underline', label: 'Underline', icon: Underline, active: isUnderlined, onPress: () => setIsUnderlined(!isUnderlined) },
                    ].map((format) => (
                      <TouchableOpacity
                        key={format.id}
                        style={[
                          styles.formatOption,
                          {
                            backgroundColor: format.active ? theme.primary : theme.surface,
                            borderColor: format.active ? theme.primary : 'transparent',
                          }
                        ]}
                        onPress={format.onPress}
                      >
                        <format.icon 
                          size={scale(20)} 
                          color={format.active ? '#FFFFFF' : theme.text} 
                        />
                        <Text style={[
                          styles.formatText,
                          {
                            color: format.active ? '#FFFFFF' : theme.text,
                            fontFamily: format.active ? 'Inter-SemiBold' : 'Inter-Medium',
                          }
                        ]}>
                          {format.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Keyboard Type */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Keyboard Type
                  </Text>
                  <View style={styles.keyboardGrid}>
                    {KEYBOARD_OPTIONS.map((keyboard) => (
                      <TouchableOpacity
                        key={keyboard.id}
                        style={[
                          styles.keyboardOption,
                          {
                            backgroundColor: theme.surface,
                            borderColor: selectedKeyboard === keyboard.id ? theme.primary : 'transparent',
                            borderWidth: selectedKeyboard === keyboard.id ? 2 : 0,
                          }
                        ]}
                        onPress={() => setSelectedKeyboard(keyboard.id)}
                      >
                        <keyboard.icon 
                          size={scale(20)} 
                          color={selectedKeyboard === keyboard.id ? theme.primary : theme.text} 
                        />
                        <Text style={[
                          styles.keyboardText,
                          {
                            color: selectedKeyboard === keyboard.id ? theme.primary : theme.text,
                            fontFamily: selectedKeyboard === keyboard.id ? 'Inter-SemiBold' : 'Inter-Medium',
                          }
                        ]}>
                          {keyboard.name}
                        </Text>
                        <Text style={[styles.keyboardDescription, { color: theme.textSecondary }]}>
                          {keyboard.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingVertical: getResponsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: 'Inter-Bold',
  },
  applyButton: {
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(8),
    borderRadius: scale(16),
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(20),
  },
  previewContainer: {
    borderRadius: scale(16),
    padding: getResponsiveSpacing(16),
    marginVertical: getResponsiveSpacing(16),
  },
  previewLabel: {
    fontSize: moderateScale(12),
    fontFamily: 'Inter-Medium',
    marginBottom: getResponsiveSpacing(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBox: {
    borderRadius: scale(12),
    padding: getResponsiveSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(60),
  },
  previewText: {
    fontSize: moderateScale(20),
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: getResponsiveSpacing(16),
    gap: getResponsiveSpacing(8),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: scale(12),
    gap: getResponsiveSpacing(6),
  },
  tabText: {
    fontSize: moderateScale(12),
  },
  scrollContent: {
    paddingBottom: getResponsiveSpacing(20),
  },
  section: {
    marginBottom: getResponsiveSpacing(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter-SemiBold',
    marginBottom: getResponsiveSpacing(12),
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(16),
  },
  colorOption: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  customColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(12),
  },
  customColorPreview: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  customColorInput: {
    flex: 1,
    height: scale(40),
    borderRadius: scale(12),
    paddingHorizontal: getResponsiveSpacing(12),
    fontSize: moderateScale(14),
    fontFamily: 'Inter-Medium',
    borderWidth: 1,
  },
  sliderContainer: {
    marginBottom: getResponsiveSpacing(16),
  },
  sliderTrack: {
    height: scale(4),
    borderRadius: scale(2),
    marginBottom: getResponsiveSpacing(8),
    position: 'relative',
  },
  sliderActive: {
    height: scale(4),
    borderRadius: scale(2),
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sliderThumb: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    position: 'absolute',
    top: scale(-8),
  },
  sliderValue: {
    fontSize: moderateScale(12),
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  fontFamilyGrid: {
    gap: getResponsiveSpacing(8),
  },
  fontFamilyOption: {
    padding: getResponsiveSpacing(16),
    borderRadius: scale(12),
    borderWidth: 2,
  },
  fontFamilyText: {
    fontSize: moderateScale(16),
    marginBottom: getResponsiveSpacing(4),
  },
  fontFamilyDescription: {
    fontSize: moderateScale(12),
    fontFamily: 'Inter-Regular',
  },
  formatGrid: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(16),
  },
  formatOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(16),
    borderRadius: scale(12),
    borderWidth: 2,
    gap: getResponsiveSpacing(6),
  },
  formatText: {
    fontSize: moderateScale(12),
  },
  keyboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing(8),
  },
  keyboardOption: {
    width: '48%',
    padding: getResponsiveSpacing(16),
    borderRadius: scale(12),
    alignItems: 'center',
    borderWidth: 2,
    gap: getResponsiveSpacing(6),
  },
  keyboardText: {
    fontSize: moderateScale(14),
  },
  keyboardDescription: {
    fontSize: moderateScale(10),
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
}); 