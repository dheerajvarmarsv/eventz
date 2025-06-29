import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enhanced responsive scaling
const scale = (size: number): number => {
  const factor = SCREEN_WIDTH / 375;
  const minFactor = Platform.OS === 'ios' ? 0.85 : 0.8;
  const maxFactor = Platform.OS === 'ios' ? 1.35 : 1.4;
  return Math.round(size * Math.min(Math.max(factor, minFactor), maxFactor));
};

const moderateScale = (size: number, factor: number = 0.3): number => {
  return size + (scale(size) - size) * factor;
};

// Device detection
const getDeviceCategory = () => {
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

interface ColorPickerProps {
  initialColor: string;
  onColorChange: (color: string) => void;
  style?: any;
}

// Color conversion utilities
const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (300 <= h && h < 360) {
    [r, g, b] = [c, 0, x];
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return [h, s, v];
};

const hexToRgb = (hex: string): [number, number, number] => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export function ColorPicker({ initialColor, onColorChange, style }: ColorPickerProps) {
  const { theme } = useTheme();
  
  // Initialize state from initial color
  const [r, g, b] = hexToRgb(initialColor);
  const [h, s, v] = rgbToHsv(r, g, b);
  
  const [hue, setHue] = useState(h);
  const [saturation, setSaturation] = useState(s);
  const [value, setValue] = useState(v);
  const [hexInput, setHexInput] = useState(initialColor.replace('#', ''));
  
  // Animated values for picker positions
  const colorPickerX = useSharedValue(saturation);
  const colorPickerY = useSharedValue(1 - value);
  const huePickerX = useSharedValue(hue / 360);
  
  // Dimensions
  const colorPickerSize = scale(Math.min(SCREEN_WIDTH - getResponsiveSpacing(80), 280));
  const hueSliderWidth = colorPickerSize;
  const hueSliderHeight = scale(30);
  const pickerKnobSize = scale(20);
  
  // Refs
  const colorPickerRef = useRef<View>(null);
  const hueSliderRef = useRef<View>(null);
  
  // Update color and notify parent
  const updateColor = useCallback((newH: number, newS: number, newV: number) => {
    const [newR, newG, newB] = hsvToRgb(newH, newS, newV);
    const newHex = rgbToHex(newR, newG, newB);
    setHexInput(newHex.replace('#', ''));
    onColorChange(newHex);
  }, [onColorChange]);
  
  // Color picker pan responder
  const colorPickerPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newS = Math.max(0, Math.min(1, locationX / colorPickerSize));
      const newV = Math.max(0, Math.min(1, 1 - (locationY / colorPickerSize)));
      
      setSaturation(newS);
      setValue(newV);
      colorPickerX.value = withSpring(newS);
      colorPickerY.value = withSpring(1 - newV);
      updateColor(hue, newS, newV);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newS = Math.max(0, Math.min(1, locationX / colorPickerSize));
      const newV = Math.max(0, Math.min(1, 1 - (locationY / colorPickerSize)));
      
      setSaturation(newS);
      setValue(newV);
      colorPickerX.value = newS;
      colorPickerY.value = 1 - newV;
      updateColor(hue, newS, newV);
    },
  });
  
  // Hue slider pan responder
  const hueSliderPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX } = evt.nativeEvent;
      const newH = Math.max(0, Math.min(360, (locationX / hueSliderWidth) * 360));
      
      setHue(newH);
      huePickerX.value = withSpring(newH / 360);
      updateColor(newH, saturation, value);
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const newH = Math.max(0, Math.min(360, (locationX / hueSliderWidth) * 360));
      
      setHue(newH);
      huePickerX.value = newH / 360;
      updateColor(newH, saturation, value);
    },
  });
  
  // Handle hex input change
  const handleHexChange = (text: string) => {
    const cleanText = text.replace(/[^0-9A-Fa-f]/g, '').substr(0, 6);
    setHexInput(cleanText);
    
    if (cleanText.length === 6) {
      try {
        const [newR, newG, newB] = hexToRgb(`#${cleanText}`);
        const [newH, newS, newV] = rgbToHsv(newR, newG, newB);
        
        setHue(newH);
        setSaturation(newS);
        setValue(newV);
        
        colorPickerX.value = withSpring(newS);
        colorPickerY.value = withSpring(1 - newV);
        huePickerX.value = withSpring(newH / 360);
        
        onColorChange(`#${cleanText.toUpperCase()}`);
      } catch (error) {
        // Invalid hex, ignore
      }
    }
  };
  
  // Current color for preview
  const currentColor = rgbToHex(...hsvToRgb(hue, saturation, value));
  
  // Animated styles
  const colorPickerKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: colorPickerX.value * colorPickerSize - pickerKnobSize / 2 },
      { translateY: colorPickerY.value * colorPickerSize - pickerKnobSize / 2 },
    ],
  }));
  
  const huePickerKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: huePickerX.value * hueSliderWidth - pickerKnobSize / 2 },
    ],
  }));
  
  return (
    <View style={[styles.container, style]}>
      {/* Main Color Picker */}
      <View style={styles.colorPickerContainer}>
        <View
          ref={colorPickerRef}
          style={[styles.colorPicker, { width: colorPickerSize, height: colorPickerSize }]}
          {...colorPickerPanResponder.panHandlers}
        >
          {/* Hue background */}
          <View style={[styles.hueBackground, { backgroundColor: rgbToHex(...hsvToRgb(hue, 1, 1)) }]} />
          
          {/* Saturation gradient (left to right) */}
          <LinearGradient
            colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saturationGradient}
          />
          
          {/* Value gradient (top to bottom) */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.valueGradient}
          />
          
          {/* Color picker knob */}
          <Animated.View style={[styles.colorPickerKnob, colorPickerKnobStyle]}>
            <View style={[styles.colorPickerKnobInner, { backgroundColor: currentColor }]} />
          </Animated.View>
        </View>
      </View>
      
      {/* Hue Slider */}
      <View style={styles.hueSliderContainer}>
        <View
          ref={hueSliderRef}
          style={[styles.hueSlider, { width: hueSliderWidth, height: hueSliderHeight }]}
          {...hueSliderPanResponder.panHandlers}
        >
          <LinearGradient
            colors={[
              '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
              '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080', '#FF0000'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.hueGradient}
          />
          
          {/* Hue picker knob */}
          <Animated.View style={[styles.huePickerKnob, huePickerKnobStyle]}>
            <View style={styles.huePickerKnobInner} />
          </Animated.View>
        </View>
      </View>
      
      {/* Color Preview and Hex Input */}
      <View style={[styles.hexInputContainer, { backgroundColor: theme.surface }]}>
        <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
        <View style={styles.hexInputWrapper}>
          <Text style={[styles.hexLabel, { color: theme.text }]}>#</Text>
          <TextInput
            style={[styles.hexInput, { 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.text 
            }]}
            value={hexInput}
            onChangeText={handleHexChange}
            placeholder="4063BC"
            placeholderTextColor={theme.textSecondary}
            maxLength={6}
            autoCapitalize="characters"
            selectTextOnFocus
          />
        </View>
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            // Copy to clipboard functionality could be added here
            onColorChange(currentColor);
          }}
        >
          <Text style={styles.copyButtonText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: getResponsiveSpacing(16),
  },
  
  // Color Picker
  colorPickerContainer: {
    alignItems: 'center',
  },
  colorPicker: {
    borderRadius: scale(16),
    overflow: 'hidden',
    position: 'relative',
    elevation: Platform.OS === 'android' ? 4 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  hueBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  saturationGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  valueGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  colorPickerKnob: {
    position: 'absolute',
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 4 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  colorPickerKnobInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  
  // Hue Slider
  hueSliderContainer: {
    alignItems: 'center',
  },
  hueSlider: {
    borderRadius: scale(15),
    overflow: 'hidden',
    position: 'relative',
    elevation: Platform.OS === 'android' ? 2 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  hueGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  huePickerKnob: {
    position: 'absolute',
    top: -scale(5),
    width: scale(20),
    height: scale(40),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 4 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  huePickerKnobInner: {
    width: scale(14),
    height: scale(30),
    borderRadius: scale(7),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  
  // Hex Input
  hexInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(12),
    borderRadius: scale(12),
    gap: getResponsiveSpacing(12),
    minWidth: scale(200),
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
  colorPreview: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: Platform.OS === 'android' ? 2 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  hexInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hexLabel: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: getResponsiveSpacing(4),
  },
  hexInput: {
    flex: 1,
    height: scale(36),
    paddingHorizontal: getResponsiveSpacing(12),
    borderRadius: scale(8),
    borderWidth: 1,
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
});