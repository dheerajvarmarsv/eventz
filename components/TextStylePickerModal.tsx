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
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Droplet
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

// Text colors
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

// Font sizes
interface FontSizeOption {
  id: string;
  name: string;
  size: number;
  description: string;
}

const FONT_SIZES: FontSizeOption[] = [
  { id: 'small', name: 'Small', size: 16, description: 'Compact text' },
  { id: 'medium', name: 'Medium', size: 20, description: 'Standard size' },
  { id: 'large', name: 'Large', size: 24, description: 'Prominent text' },
  { id: 'extraLarge', name: 'Extra Large', size: 28, description: 'Bold statement' },
  { id: 'huge', name: 'Huge', size: 32, description: 'Maximum impact' },
];

// Font families with cross-platform support
interface FontFamilyOption {
  id: string;
  name: string;
  family: string;
  weight: '400' | '500' | '600' | '700' | '800';
  description: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
}

// Cross-platform font families - ensuring no undefined values
const FONT_FAMILIES: FontFamilyOption[] = [
  // Sans-serif fonts
  { 
    id: 'system', 
    name: 'System', 
    family: Platform.OS === 'ios' ? 'System' : 'sans-serif', 
    weight: '400', 
    description: 'Default system font',
    category: 'sans-serif'
  },
  { 
    id: 'arial', 
    name: 'Arial', 
    family: Platform.OS === 'ios' ? 'Arial' : 'sans-serif', 
    weight: '400', 
    description: 'Classic, versatile font',
    category: 'sans-serif'
  },
  { 
    id: 'helvetica', 
    name: 'Helvetica', 
    family: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif', 
    weight: '400', 
    description: 'Clean and modern',
    category: 'sans-serif'
  },
  { 
    id: 'verdana', 
    name: 'Verdana', 
    family: Platform.OS === 'ios' ? 'Verdana' : 'sans-serif', 
    weight: '400', 
    description: 'Highly readable',
    category: 'sans-serif'
  },
  { 
    id: 'trebuchet', 
    name: 'Trebuchet MS', 
    family: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif', 
    weight: '400', 
    description: 'Friendly and approachable',
    category: 'sans-serif'
  },
  
  // Serif fonts
  { 
    id: 'timesNewRoman', 
    name: 'Times New Roman', 
    family: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', 
    weight: '400', 
    description: 'Traditional serif font',
    category: 'serif'
  },
  { 
    id: 'georgia', 
    name: 'Georgia', 
    family: Platform.OS === 'ios' ? 'Georgia' : 'serif', 
    weight: '400', 
    description: 'Elegant serif font',
    category: 'serif'
  },
  { 
    id: 'palatino', 
    name: 'Palatino', 
    family: Platform.OS === 'ios' ? 'Palatino' : 'serif', 
    weight: '400', 
    description: 'Classic serif style',
    category: 'serif'
  },
  
  // Monospace fonts
  { 
    id: 'courier', 
    name: 'Courier', 
    family: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    weight: '400', 
    description: 'Fixed-width font',
    category: 'monospace'
  },
  { 
    id: 'courierNew', 
    name: 'Courier New', 
    family: Platform.OS === 'ios' ? 'Courier New' : 'monospace', 
    weight: '400', 
    description: 'Modern monospace',
    category: 'monospace'
  },
  { 
    id: 'menlo', 
    name: 'Menlo', 
    family: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
    weight: '400', 
    description: 'Developer favorite',
    category: 'monospace'
  },
  
  // Display fonts
  { 
    id: 'impact', 
    name: 'Impact', 
    family: Platform.OS === 'ios' ? 'Impact' : 'sans-serif', 
    weight: '700', 
    description: 'Bold and striking',
    category: 'display'
  },
  { 
    id: 'americanTypewriter', 
    name: 'American Typewriter', 
    family: Platform.OS === 'ios' ? 'American Typewriter' : 'serif', 
    weight: '400', 
    description: 'Vintage typewriter style',
    category: 'display'
  },
  { 
    id: 'copperplate', 
    name: 'Copperplate', 
    family: Platform.OS === 'ios' ? 'Copperplate' : 'sans-serif', 
    weight: '400', 
    description: 'Elegant all-caps style',
    category: 'display'
  },
  
  // Handwriting fonts
  { 
    id: 'zapfino', 
    name: 'Zapfino', 
    family: Platform.OS === 'ios' ? 'Zapfino' : 'cursive', 
    weight: '400', 
    description: 'Elegant script font',
    category: 'handwriting'
  },
  { 
    id: 'snellRoundhand', 
    name: 'Snell Roundhand', 
    family: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive', 
    weight: '400', 
    description: 'Classic handwriting',
    category: 'handwriting'
  },
  { 
    id: 'markerFelt', 
    name: 'Marker Felt', 
    family: Platform.OS === 'ios' ? 'Marker Felt' : 'fantasy', 
    weight: '400', 
    description: 'Casual marker style',
    category: 'handwriting'
  },
];

// Text style interface
export interface TextStyle {
  keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url' | 'web-search';
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  textAlign: 'left' | 'center' | 'right';
  fontStyle: 'normal' | 'italic';
  textDecorationLine: 'none' | 'underline' | 'line-through' | 'underline line-through';
}

// Props interface
interface TextStylePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (textStyle: TextStyle) => void;
  currentStyle: TextStyle;
}

export function TextStylePickerModal({
  visible,
  onClose,
  onApply,
  currentStyle,
}: TextStylePickerModalProps) {
  const { theme } = useTheme();

  // State management with enhanced options
  const [selectedStyle, setSelectedStyle] = useState<TextStyle>({
    keyboardType: currentStyle.keyboardType || 'default',
    color: currentStyle.color || '#FFFFFF',
    fontSize: currentStyle.fontSize || 24,
    fontFamily: currentStyle.fontFamily || (Platform.OS === 'ios' ? 'System' : 'sans-serif'), // Safe default
    fontWeight: currentStyle.fontWeight || '600',
    textAlign: currentStyle.textAlign || 'center',
    fontStyle: currentStyle.fontStyle || 'normal',
    textDecorationLine: currentStyle.textDecorationLine || 'none',
  });

  const [activeSection, setActiveSection] = useState<'keyboard' | 'color' | 'size' | 'font' | 'format'>('font');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(currentStyle.color || '#FFFFFF');
  const [showFontDropdown, setShowFontDropdown] = useState(true); // Auto-open font dropdown
  const [selectedFontCategory, setSelectedFontCategory] = useState<'all' | 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting'>('all');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  // Initialize animations and reset state
  useEffect(() => {
    if (visible) {
      // Reset to initial state when modal opens
      setShowFontDropdown(true);
      setSelectedFontCategory('all');
      setShowColorPicker(false);
      
      // Animate in
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

    // Close font dropdown and apply changes
    setShowFontDropdown(false);
    onApply(selectedStyle);
  }, [selectedStyle, onApply, buttonScale, setShowFontDropdown]);

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
    return {
      color: selectedStyle.color,
      fontSize: moderateScale(Math.min(selectedStyle.fontSize, 24)), // Cap preview size
      fontFamily: selectedStyle.fontFamily,
      fontWeight: selectedStyle.fontWeight,
      textAlign: selectedStyle.textAlign,
      fontStyle: selectedStyle.fontStyle,
      textDecorationLine: selectedStyle.textDecorationLine,
    };
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
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Preview */}
              <View style={[styles.previewContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
                  Live Preview
                </Text>
                <View style={[styles.previewBox, { backgroundColor: theme.background }]}>
                  <Text style={[styles.previewText, getPreviewStyle()]} numberOfLines={2}>
                    Event Title Preview
                  </Text>
                </View>
              </View>

              {/* Quick Format Toggles */}
              <View style={[styles.quickFormatContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.quickFormatLabel, { color: theme.textSecondary }]}>
                  Quick Format
                </Text>
                <View style={styles.formatToggles}>
                  {/* Bold Toggle */}
                  <TouchableOpacity
                    style={[
                      styles.formatToggle,
                      {
                        backgroundColor: ['700', '800'].includes(selectedStyle.fontWeight) ? theme.primary : theme.border + '40',
                        borderColor: ['700', '800'].includes(selectedStyle.fontWeight) ? theme.primary : theme.border,
                      }
                    ]}
                    onPress={() => setSelectedStyle(prev => ({
                      ...prev,
                      fontWeight: ['700', '800'].includes(prev.fontWeight) ? '400' : '700'
                    }))}
                  >
                    <Bold 
                      size={scale(16)} 
                      color={['700', '800'].includes(selectedStyle.fontWeight) ? '#FFFFFF' : theme.text} 
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>

                  {/* Italic Toggle */}
                  <TouchableOpacity
                    style={[
                      styles.formatToggle,
                      {
                        backgroundColor: selectedStyle.fontStyle === 'italic' ? theme.primary : theme.border + '40',
                        borderColor: selectedStyle.fontStyle === 'italic' ? theme.primary : theme.border,
                      }
                    ]}
                    onPress={() => setSelectedStyle(prev => ({
                      ...prev,
                      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic'
                    }))}
                  >
                    <Italic 
                      size={scale(16)} 
                      color={selectedStyle.fontStyle === 'italic' ? '#FFFFFF' : theme.text}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>

                  {/* Underline Toggle */}
                  <TouchableOpacity
                    style={[
                      styles.formatToggle,
                      {
                        backgroundColor: selectedStyle.textDecorationLine.includes('underline') ? theme.primary : theme.border + '40',
                        borderColor: selectedStyle.textDecorationLine.includes('underline') ? theme.primary : theme.border,
                      }
                    ]}
                    onPress={() => setSelectedStyle(prev => ({
                      ...prev,
                      textDecorationLine: prev.textDecorationLine.includes('underline') ? 'none' : 'underline'
                    }))}
                  >
                    <Underline 
                      size={scale(16)} 
                      color={selectedStyle.textDecorationLine.includes('underline') ? '#FFFFFF' : theme.text}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>

                  {/* Alignment Toggles */}
                  <View style={styles.alignmentGroup}>
                    {[
                      { align: 'left', icon: AlignLeft },
                      { align: 'center', icon: AlignCenter },
                      { align: 'right', icon: AlignRight }
                    ].map(({ align, icon: Icon }) => (
                      <TouchableOpacity
                        key={align}
                        style={[
                          styles.formatToggle,
                          {
                            backgroundColor: selectedStyle.textAlign === align ? theme.primary : theme.border + '40',
                            borderColor: selectedStyle.textAlign === align ? theme.primary : theme.border,
                          }
                        ]}
                        onPress={() => setSelectedStyle(prev => ({
                          ...prev,
                          textAlign: align as 'left' | 'center' | 'right'
                        }))}
                      >
                        <Icon 
                          size={scale(16)} 
                          color={selectedStyle.textAlign === align ? '#FFFFFF' : theme.text}
                          strokeWidth={2}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Font Family with Dropdown */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Choose Font Style
                </Text>
                
                {/* Current Font Display */}
                <TouchableOpacity
                  style={[styles.fontDropdownTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setShowFontDropdown(!showFontDropdown)}
                  activeOpacity={0.8}
                >
                  <View style={styles.fontDropdownContent}>
                    <View style={[styles.fontPreviewContainer, { backgroundColor: `${theme.primary}20` }]}>
                      <Text style={[
                        styles.fontPreviewText,
                        {
                          color: theme.primary,
                          fontFamily: selectedStyle.fontFamily,
                          fontWeight: selectedStyle.fontWeight
                        }
                      ]}>
                        Aa
                      </Text>
                    </View>
                    <View style={styles.fontInfo}>
                      <Text style={[styles.selectedFontName, { color: theme.text }]} numberOfLines={1}>
                        {FONT_FAMILIES.find(f => f.family === selectedStyle.fontFamily)?.name || 'System'}
                      </Text>
                      <Text style={[styles.selectedFontDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                        {FONT_FAMILIES.find(f => f.family === selectedStyle.fontFamily)?.description || 'Choose from 17 font styles'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.dropdownArrow, { transform: [{ rotate: showFontDropdown ? '180deg' : '0deg' }] }]}>
                    <Text style={[styles.dropdownArrowText, { color: theme.textSecondary }]}>▼</Text>
                  </View>
                </TouchableOpacity>

                {/* Font Dropdown */}
                {showFontDropdown && (
                  <View style={styles.fontDropdownOverlay} pointerEvents="box-none">
                    <View style={[styles.fontDropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {/* Category Filter */}
                      <View style={styles.fontCategories}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollContent}>
                          {['all', 'sans-serif', 'serif', 'monospace', 'display', 'handwriting'].map((category) => (
                            <TouchableOpacity
                              key={category}
                              style={[
                                styles.categoryChip,
                                {
                                  backgroundColor: selectedFontCategory === category ? theme.primary : theme.border + '40',
                                  borderColor: selectedFontCategory === category ? theme.primary : theme.border,
                                }
                              ]}
                              onPress={() => setSelectedFontCategory(category as any)}
                            >
                              <Text style={[
                                styles.categoryChipText,
                                { color: selectedFontCategory === category ? '#FFFFFF' : theme.text }
                              ]}>
                                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Font List */}
                      <ScrollView style={styles.fontList} showsVerticalScrollIndicator={false}>
                        {FONT_FAMILIES
                          .filter(font => selectedFontCategory === 'all' || font.category === selectedFontCategory)
                          .map((fontFamily) => (
                          <TouchableOpacity
                            key={fontFamily.id}
                            style={[
                              styles.fontOption,
                              {
                                backgroundColor: selectedStyle.fontFamily === fontFamily.family ? `${theme.primary}20` : 'transparent',
                                borderColor: selectedStyle.fontFamily === fontFamily.family ? theme.primary : 'transparent',
                              }
                            ]}
                            onPress={() => {
                              setSelectedStyle(prev => ({ ...prev, fontFamily: fontFamily.family }));
                              setShowFontDropdown(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.fontOptionContent}>
                              <View style={[styles.fontOptionPreview, { backgroundColor: `${theme.primary}15` }]}>
                                <Text style={[
                                  styles.fontOptionPreviewText,
                                  {
                                    color: theme.primary,
                                    fontFamily: fontFamily.family,
                                    fontWeight: fontFamily.weight
                                  }
                                ]}>
                                  Aa
                                </Text>
                              </View>
                              <View style={styles.fontOptionInfo}>
                                <Text style={[styles.fontOptionName, { color: theme.text }]} numberOfLines={1}>
                                  {fontFamily.name}
                                </Text>
                                <Text style={[styles.fontOptionDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                                  {fontFamily.description}
                                </Text>
                                <Text style={[styles.fontOptionCategory, { color: theme.textSecondary }]} numberOfLines={1}>
                                  {fontFamily.category.charAt(0).toUpperCase() + fontFamily.category.slice(1).replace('-', ' ')}
                                </Text>
                              </View>
                            </View>
                            
                            {selectedStyle.fontFamily === fontFamily.family && (
                              <View style={[styles.fontSelectedIndicator, { backgroundColor: theme.primary }]}>
                                <Check size={scale(14)} color="#FFFFFF" strokeWidth={2.5} />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>

              {/* Keyboard Type */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Keyboard Type
                </Text>
                <View style={styles.optionsGrid}>
                  {KEYBOARD_OPTIONS.map((keyboard) => (
                    <TouchableOpacity
                      key={keyboard.id}
                      style={[
                        styles.optionItem,
                        {
                          backgroundColor: theme.surface,
                          borderColor: selectedStyle.keyboardType === keyboard.type ? theme.primary : 'transparent',
                          borderWidth: selectedStyle.keyboardType === keyboard.type ? 2 : 0,
                        }
                      ]}
                      onPress={() => setSelectedStyle(prev => ({ ...prev, keyboardType: keyboard.type }))}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.optionIcon, { backgroundColor: `${theme.primary}20` }]}>
                        <keyboard.icon size={scale(18)} color={theme.primary} strokeWidth={2} />
                      </View>
                      <Text style={[styles.optionName, { color: theme.text }]} numberOfLines={1}>
                        {keyboard.name}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                        {keyboard.description}
                      </Text>
                      
                      {selectedStyle.keyboardType === keyboard.type && (
                        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                          <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Text Color */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Text Color
                </Text>
                
                {/* Custom Color Picker */}
                <View style={[styles.colorPickerContainer, { backgroundColor: theme.surface }]}>
                  <TouchableOpacity 
                    style={[styles.customColorButton, { backgroundColor: customColor }]}
                    onPress={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Droplet size={scale(18)} color={customColor === '#FFFFFF' ? '#000000' : '#FFFFFF'} />
                  </TouchableOpacity>
                  <Text style={[styles.customColorLabel, { color: theme.text }]}>
                    Custom Color
                  </Text>
                  <Text style={[styles.customColorValue, { color: theme.textSecondary }]}>
                    {customColor}
                  </Text>
                </View>

                {showColorPicker && (
                  <View style={[styles.colorSliders, { backgroundColor: theme.surface }]}>
                    <View style={styles.colorSlider}>
                      <Text style={[styles.sliderLabel, { color: theme.text }]}>Red</Text>
                      <View style={styles.sliderContainer}>
                        <Text style={[styles.sliderValue, { color: theme.textSecondary }]}>
                          {Math.round((parseInt(customColor.slice(1, 3), 16) / 255) * 100)}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.colorSlider}>
                      <Text style={[styles.sliderLabel, { color: theme.text }]}>Green</Text>
                      <View style={styles.sliderContainer}>
                        <Text style={[styles.sliderValue, { color: theme.textSecondary }]}>
                          {Math.round((parseInt(customColor.slice(3, 5), 16) / 255) * 100)}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.colorSlider}>
                      <Text style={[styles.sliderLabel, { color: theme.text }]}>Blue</Text>
                      <View style={styles.sliderContainer}>
                        <Text style={[styles.sliderValue, { color: theme.textSecondary }]}>
                          {Math.round((parseInt(customColor.slice(5, 7), 16) / 255) * 100)}%
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.applyColorButton, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        setSelectedStyle(prev => ({ ...prev, color: customColor }));
                        setShowColorPicker(false);
                      }}
                    >
                      <Text style={styles.applyColorText}>Apply Color</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Preset Colors */}
                {['primary', 'neutral', 'vibrant', 'pastel'].map((category) => (
                  <View key={category} style={styles.colorCategory}>
                    <Text style={[styles.colorCategoryTitle, { color: theme.textSecondary }]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <View style={styles.colorGrid}>
                      {TEXT_COLORS.filter(color => color.category === category).map((color) => (
                        <TouchableOpacity
                          key={color.id}
                          style={[
                            styles.colorOption,
                            {
                              backgroundColor: color.color,
                              borderColor: selectedStyle.color === color.color ? theme.primary : theme.border,
                              borderWidth: selectedStyle.color === color.color ? 3 : 1,
                            }
                          ]}
                          onPress={() => {
                            setSelectedStyle(prev => ({ ...prev, color: color.color }));
                            setCustomColor(color.color);
                          }}
                          activeOpacity={0.8}
                        >
                          {selectedStyle.color === color.color && (
                            <View style={styles.colorSelectedIndicator}>
                              <Check 
                                size={scale(12)} 
                                color={color.color === '#FFFFFF' ? '#000000' : '#FFFFFF'} 
                                strokeWidth={3} 
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Font Size */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Font Size
                </Text>
                <View style={styles.optionsGrid}>
                  {FONT_SIZES.map((fontSize) => (
                    <TouchableOpacity
                      key={fontSize.id}
                      style={[
                        styles.optionItem,
                        {
                          backgroundColor: theme.surface,
                          borderColor: selectedStyle.fontSize === fontSize.size ? theme.primary : 'transparent',
                          borderWidth: selectedStyle.fontSize === fontSize.size ? 2 : 0,
                        }
                      ]}
                      onPress={() => setSelectedStyle(prev => ({ ...prev, fontSize: fontSize.size }))}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.fontSizePreview, { backgroundColor: `${theme.primary}20` }]}>
                        <Text style={[
                          styles.fontSizeText, 
                          { 
                            color: theme.primary,
                            fontSize: moderateScale(Math.min(fontSize.size * 0.6, 16))
                          }
                        ]}>
                          Aa
                        </Text>
                      </View>
                      <Text style={[styles.optionName, { color: theme.text }]} numberOfLines={1}>
                        {fontSize.name}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                        {fontSize.description}
                      </Text>
                      
                      {selectedStyle.fontSize === fontSize.size && (
                        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                          <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Text Alignment */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Text Alignment
                </Text>
                <View style={styles.optionsGrid}>
                  {['left', 'center', 'right'].map((alignment) => (
                    <TouchableOpacity
                      key={alignment}
                      style={[
                        styles.optionItem,
                        {
                          backgroundColor: theme.surface,
                          borderColor: selectedStyle.textAlign === alignment ? theme.primary : 'transparent',
                          borderWidth: selectedStyle.textAlign === alignment ? 2 : 0,
                        }
                      ]}
                      onPress={() => setSelectedStyle(prev => ({ ...prev, textAlign: alignment as 'left' | 'center' | 'right' }))}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.textAlignPreview, { backgroundColor: `${theme.primary}20` }]}>
                        <Text style={[
                          styles.textAlignText, 
                          { 
                            color: theme.primary,
                            fontSize: moderateScale(Math.min(24, 16))
                          }
                        ]}>
                          {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                        </Text>
                      </View>
                      <Text style={[styles.optionName, { color: theme.text }]} numberOfLines={1}>
                        {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                        {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                      </Text>
                      
                      {selectedStyle.textAlign === alignment && (
                        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                          <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Font Weight */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Font Weight
                </Text>
                <View style={styles.optionsGrid}>
                  {['400', '500', '600', '700', '800'].map((weight) => (
                    <TouchableOpacity
                      key={weight}
                      style={[
                        styles.optionItem,
                        {
                          backgroundColor: theme.surface,
                          borderColor: selectedStyle.fontWeight === weight ? theme.primary : 'transparent',
                          borderWidth: selectedStyle.fontWeight === weight ? 2 : 0,
                        }
                      ]}
                      onPress={() => setSelectedStyle(prev => ({ ...prev, fontWeight: weight as '400' | '500' | '600' | '700' | '800' }))}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.fontWeightPreview, { backgroundColor: `${theme.primary}20` }]}>
                        <Text style={[
                          styles.fontWeightText, 
                          { 
                            color: theme.primary,
                            fontWeight: weight as '400' | '500' | '600' | '700' | '800'
                          }
                        ]}>
                          Aa
                        </Text>
                      </View>
                      <Text style={[styles.optionName, { color: theme.text }]} numberOfLines={1}>
                        {weight}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                        {weight}
                      </Text>
                      
                      {selectedStyle.fontWeight === weight as '400' | '500' | '600' | '700' | '800' && (
                        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                          <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>



              {/* Text Decoration */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Text Decoration
                </Text>
                <View style={styles.optionsGrid}>
                  {['none', 'underline', 'line-through', 'underline line-through'].map((decoration) => (
                    <TouchableOpacity
                      key={decoration}
                      style={[
                        styles.optionItem,
                        {
                          backgroundColor: theme.surface,
                          borderColor: selectedStyle.textDecorationLine === decoration ? theme.primary : 'transparent',
                          borderWidth: selectedStyle.textDecorationLine === decoration ? 2 : 0,
                        }
                      ]}
                      onPress={() => setSelectedStyle(prev => ({ ...prev, textDecorationLine: decoration as 'none' | 'underline' | 'line-through' | 'underline line-through' }))}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.textDecorationPreview, { backgroundColor: `${theme.primary}20` }]}>
                        <Text style={[
                          styles.textDecorationText, 
                          { 
                            color: theme.primary,
                            textDecorationLine: selectedStyle.textDecorationLine === decoration ? 'underline' : 'none'
                          }
                        ]}>
                          {decoration.charAt(0).toUpperCase() + decoration.slice(1)}
                        </Text>
                      </View>
                      <Text style={[styles.optionName, { color: theme.text }]} numberOfLines={1}>
                        {decoration.charAt(0).toUpperCase() + decoration.slice(1)}
                      </Text>
                      <Text style={[styles.optionDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                        {decoration.charAt(0).toUpperCase() + decoration.slice(1)}
                      </Text>
                      
                      {selectedStyle.textDecorationLine === decoration && (
                        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                          <Check size={scale(12)} color="#FFFFFF" strokeWidth={3} />
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
  applyButton: {
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    paddingVertical: verticalScale(getResponsiveSpacing(8)),
    borderRadius: scale(16),
    minWidth: scale(deviceCategory === 'extraSmall' ? 60 : 70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Content - Responsive
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: verticalScale(getResponsiveSpacing(16)),
    paddingBottom: verticalScale(getResponsiveSpacing(20)),
  },

  // Preview - Responsive
  previewContainer: {
    marginHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(16),
    padding: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(24)),
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
  previewLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 12 : 13),
    fontWeight: '500',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  previewBox: {
    borderRadius: scale(12),
    padding: scale(getResponsiveSpacing(16)),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 60 : 70),
  },
  previewText: {
    textAlign: 'center',
  },

  // Sections - Responsive
  section: {
    marginBottom: verticalScale(getResponsiveSpacing(32)),
  },
  sectionTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 18 : 20),
    fontWeight: '700',
    marginHorizontal: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(16)),
  },

  // Options Grid - Responsive
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    gap: scale(getResponsiveSpacing(12)),
  },
  optionItem: {
    width: (SCREEN_WIDTH - scale(getResponsiveSpacing(16)) * 2 - scale(getResponsiveSpacing(12))) / 2,
    borderRadius: scale(16),
    padding: scale(getResponsiveSpacing(16)),
    alignItems: 'center',
    position: 'relative',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 100 : 110),
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
  optionIcon: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 18 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  optionName: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(4)),
  },
  optionDescription: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 11 : 12),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: moderateScale(deviceCategory === 'extraSmall' ? 14 : 16),
  },
  selectedIndicator: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    width: scale(deviceCategory === 'extraSmall' ? 20 : 24),
    height: scale(deviceCategory === 'extraSmall' ? 20 : 24),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 10 : 12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Color Options - Responsive
  colorCategory: {
    marginBottom: verticalScale(getResponsiveSpacing(20)),
  },
  colorCategoryTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '500',
    marginHorizontal: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    gap: scale(getResponsiveSpacing(8)),
  },
  colorOption: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 18 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 2 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  colorSelectedIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Font Previews - Responsive
  fontSizePreview: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 18 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  fontSizeText: {
    fontWeight: '600',
  },


  // Text Alignment Previews - Responsive
  textAlignPreview: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 18 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  textAlignText: {
    fontWeight: '600',
  },

  // Font Weight Previews - Responsive
  fontWeightPreview: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 18 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  fontWeightText: {
    fontWeight: '600',
  },

  // Text Decoration Previews - Responsive
  textDecorationPreview: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 18 : 20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(getResponsiveSpacing(8)),
  },
  textDecorationText: {
    fontWeight: '600',
  },

  // Color Picker Styles - Responsive
  colorPickerContainer: {
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
  customColorButton: {
    width: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    height: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 24 : 28),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  customColorLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '600',
    flex: 1,
  },
  customColorValue: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 13 : 14),
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  colorSliders: {
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
  colorSlider: {
    gap: scale(getResponsiveSpacing(8)),
  },
  sliderLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderValue: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 13 : 14),
    fontWeight: '400',
    minWidth: scale(40),
    textAlign: 'right',
  },
  applyColorButton: {
    paddingVertical: verticalScale(getResponsiveSpacing(12)),
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(8),
    alignItems: 'center',
    marginTop: verticalScale(getResponsiveSpacing(8)),
  },
  applyColorText: {
    color: '#FFFFFF',
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '600',
  },

  // Quick Format Styles - Responsive
  quickFormatContainer: {
    marginHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(16),
    padding: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(24)),
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
  quickFormatLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 12 : 13),
    fontWeight: '500',
    marginBottom: verticalScale(getResponsiveSpacing(12)),
  },
  formatToggles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(getResponsiveSpacing(8)),
    flexWrap: 'wrap',
  },
  formatToggle: {
    width: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 8 : 10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  alignmentGroup: {
    flexDirection: 'row',
    gap: scale(getResponsiveSpacing(4)),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 8 : 10),
    overflow: 'hidden',
  },

  // Font Dropdown Styles - Responsive
  fontDropdownTrigger: {
    marginHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(16),
    padding: scale(getResponsiveSpacing(16)),
    marginBottom: verticalScale(getResponsiveSpacing(16)),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 70 : 80),
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
  fontDropdownContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(getResponsiveSpacing(12)),
  },
  fontPreviewContainer: {
    width: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    height: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 24 : 28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontPreviewText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 18 : 22),
    fontWeight: '600',
  },
  fontInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(getResponsiveSpacing(2)),
  },
  selectedFontName: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 16 : 17),
    fontWeight: '600',
  },
  selectedFontDescription: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 13 : 14),
    fontWeight: '400',
  },
  dropdownArrow: {
    padding: scale(getResponsiveSpacing(4)),
  },
  dropdownArrowText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 12 : 14),
    fontWeight: '500',
  },
  fontDropdownOverlay: {
    position: 'absolute',
    top: verticalScale(deviceCategory === 'extraSmall' ? 240 : 260),
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: scale(getResponsiveSpacing(16)),
  },
  fontDropdown: {
    borderWidth: 1,
    borderRadius: scale(16),
    paddingVertical: verticalScale(getResponsiveSpacing(8)),
    maxHeight: verticalScale(deviceCategory === 'extraSmall' ? 280 : 320),
    overflow: 'hidden',
    elevation: Platform.OS === 'android' ? 8 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  fontCategories: {
    paddingVertical: verticalScale(getResponsiveSpacing(12)),
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  categoriesScrollContent: {
    gap: scale(getResponsiveSpacing(8)),
    paddingRight: scale(getResponsiveSpacing(16)),
  },
  categoryChip: {
    paddingHorizontal: scale(getResponsiveSpacing(12)),
    paddingVertical: verticalScale(getResponsiveSpacing(6)),
    borderRadius: scale(16),
    borderWidth: 1,
    minWidth: scale(deviceCategory === 'extraSmall' ? 60 : 70),
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 12 : 13),
    fontWeight: '500',
  },
  fontList: {
    maxHeight: verticalScale(deviceCategory === 'extraSmall' ? 220 : 250),
  },
  fontOption: {
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    paddingVertical: verticalScale(getResponsiveSpacing(12)),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 80 : 90),
    borderWidth: 1,
    borderRadius: scale(12),
    marginHorizontal: scale(getResponsiveSpacing(8)),
    marginVertical: verticalScale(getResponsiveSpacing(4)),
  },
  fontOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(getResponsiveSpacing(12)),
  },
  fontOptionPreview: {
    width: scale(deviceCategory === 'extraSmall' ? 40 : 48),
    height: scale(deviceCategory === 'extraSmall' ? 40 : 48),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 20 : 24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontOptionPreviewText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 16 : 18),
    fontWeight: '600',
  },
  fontOptionInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(getResponsiveSpacing(2)),
  },
  fontOptionName: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '600',
  },
  fontOptionDescription: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 12 : 13),
    fontWeight: '400',
  },
  fontOptionCategory: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 11 : 12),
    fontWeight: '400',
    fontStyle: 'italic',
  },
  fontSelectedIndicator: {
    width: scale(deviceCategory === 'extraSmall' ? 24 : 28),
    height: scale(deviceCategory === 'extraSmall' ? 24 : 28),
    borderRadius: scale(deviceCategory === 'extraSmall' ? 12 : 14),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(getResponsiveSpacing(8)),
  },
}); 