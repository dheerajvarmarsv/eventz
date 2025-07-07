import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Platform,
  Dimensions,
  Pressable,
  Animated,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, ChevronDown } from 'lucide-react-native';
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

// Responsive content spacing for pickers
const getPickerContentSpacing = () => {
  const baseSpacing = {
    padding: 20,
    margin: 16,
    gap: 12
  };
  
  return {
    padding: getResponsiveSpacing(baseSpacing.padding),
    margin: getResponsiveSpacing(baseSpacing.margin),
    gap: getResponsiveSpacing(baseSpacing.gap)
  };
};

// Platform-specific constants
const TOUCH_TARGET_SIZE = Platform.OS === 'ios' ? 44 : 48;
const MODAL_MAX_HEIGHT = Platform.OS === 'ios' ? 0.8 : 0.85;
const PICKER_MAX_HEIGHT = Platform.OS === 'ios' ? 0.6 : 0.65;

// Simple dropdown data
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

// Helper function for date validation
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Simple Dropdown Component
interface SimpleDropdownProps {
  label: string;
  value: number | string;
  options: (number | string)[];
  onSelect: (value: number | string) => void;
  theme: any;
  formatter?: (value: number | string) => string;
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  theme, 
  formatter 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when parent scrolls or other dropdowns open
  useEffect(() => {
    if (!isOpen) return;
    
    const closeDropdown = () => setIsOpen(false);
    
    // Auto-close after 10 seconds of inactivity
    const timer = setTimeout(closeDropdown, 10000);
    
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSelect = useCallback((option: number | string) => {
    onSelect(option);
    setIsOpen(false);
  }, [onSelect]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={[styles.dropdownLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      
      <TouchableOpacity
        style={[styles.dropdownButton, { 
          backgroundColor: theme.surface, 
          borderColor: theme.border 
        }]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.dropdownButtonText, { color: theme.text }]} numberOfLines={1}>
          {formatter ? formatter(value) : value}
        </Text>
        <ChevronDown 
          size={scale(14)} 
          color={theme.textSecondary} 
          style={[styles.dropdownIcon, isOpen && styles.dropdownIconRotated]} 
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdownMenu, { 
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.text
        }]}>
          <ScrollView 
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={Platform.OS === 'ios'}
            overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
            contentContainerStyle={{ paddingVertical: verticalScale(2) }}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownOption,
                  value === option && { backgroundColor: theme.primary + '20' }
                ]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.7}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  { 
                    color: value === option ? theme.primary : theme.text,
                    fontWeight: value === option ? '600' : '400'
                  }
                ]} numberOfLines={1}>
                  {formatter ? formatter(option) : option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date, time?: Date, endTime?: Date) => void;
  currentDate?: Date | null;
  currentTime?: Date | null;
  currentEndTime?: Date | null;
}

type PickerType = 'date' | 'startTime' | 'endDate' | 'endTime' | null;

export function DateTimePickerModal({
  visible,
  onClose,
  onSelect,
  currentDate,
  currentTime,
  currentEndTime,
}: DateTimePickerModalProps) {
  const { theme } = useTheme();
  
  // State management
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [includeEndTime, setIncludeEndTime] = useState<boolean>(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => 
    isValidDate(currentDate) ? new Date(currentDate) : new Date()
  );
  
  const [startTime, setStartTime] = useState<Date>(() => {
    if (isValidDate(currentTime)) return new Date(currentTime);
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  });
  
  const [endTime, setEndTime] = useState<Date>(() => {
    if (isValidDate(currentEndTime)) return new Date(currentEndTime);
    const defaultEnd = new Date();
    defaultEnd.setHours(defaultEnd.getHours() + 1, 0, 0, 0);
    return defaultEnd;
  });
  
  const [endDate, setEndDate] = useState<Date>(() => 
    isValidDate(currentEndTime) ? new Date(currentEndTime) : new Date(selectedDate)
  );
  
  const [activePickerType, setActivePickerType] = useState<PickerType>(null);

  // Time picker states for start time
  const [startHour, setStartHour] = useState<number>(() => {
    const hour = startTime.getHours();
    return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  });
  const [startMinute, setStartMinute] = useState<number>(startTime.getMinutes());
  const [startPeriod, setStartPeriod] = useState<string>(startTime.getHours() >= 12 ? 'PM' : 'AM');

  // Time picker states for end time
  const [endHour, setEndHour] = useState<number>(() => {
    const hour = endTime.getHours();
    return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  });
  const [endMinute, setEndMinute] = useState<number>(endTime.getMinutes());
  const [endPeriod, setEndPeriod] = useState<string>(endTime.getHours() >= 12 ? 'PM' : 'AM');
  
  // Animation refs
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const pickerOffset = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const animationRefs = useRef<{[key: string]: Animated.CompositeAnimation}>({});

  // Cleanup function
  const cleanup = useCallback(() => {
    Object.values(animationRefs.current).forEach(animation => {
      animation?.stop();
    });
    
    headerOpacity.setValue(0);
    contentOpacity.setValue(0);
    pickerOffset.setValue(SCREEN_HEIGHT);
    backdropOpacity.setValue(0);
  }, [headerOpacity, contentOpacity, pickerOffset, backdropOpacity]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle modal visibility changes
  useEffect(() => {
    if (visible) {
      setActivePickerType(null);
      
      // Animate in
      animationRefs.current.headerAnimation = Animated.timing(headerOpacity, {
        toValue: 1,
        duration: Platform.OS === 'ios' ? 300 : 250,
        delay: 50,
        useNativeDriver: true,
      });
      
      animationRefs.current.contentAnimation = Animated.timing(contentOpacity, {
        toValue: 1,
        duration: Platform.OS === 'ios' ? 300 : 250,
        delay: 100,
        useNativeDriver: true,
      });

      animationRefs.current.headerAnimation.start();
      animationRefs.current.contentAnimation.start();
    } else {
      cleanup();
      setActivePickerType(null);
    }
  }, [visible, cleanup, headerOpacity, contentOpacity]);

  // Update state when props change
  useEffect(() => {
    if (isValidDate(currentDate)) setSelectedDate(new Date(currentDate));
    if (isValidDate(currentTime)) {
      const time = new Date(currentTime);
      setStartTime(time);
      const hour = time.getHours();
      setStartHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
      setStartMinute(time.getMinutes());
      setStartPeriod(hour >= 12 ? 'PM' : 'AM');
    }
    if (isValidDate(currentEndTime)) {
      const time = new Date(currentEndTime);
      setEndTime(time);
      setEndDate(time);
      const hour = time.getHours();
      setEndHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
      setEndMinute(time.getMinutes());
      setEndPeriod(hour >= 12 ? 'PM' : 'AM');
    }
  }, [currentDate, currentTime, currentEndTime]);

  // Format functions
  const formatDate = useCallback((date: Date): string => {
    const validDate = isValidDate(date) ? date : new Date();
    return validDate.toLocaleDateString('en-US', {
        day: 'numeric',
      month: 'short',
      year: 'numeric'
      });
  }, []);

  const formatTime = useCallback((time: Date): string => {
    const validTime = isValidDate(time) ? time : new Date();
    return validTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Convert dropdown values to Date
  const createTimeFromDropdowns = useCallback((hour: number, minute: number, period: string, baseDate: Date): Date => {
    const newTime = new Date(baseDate);
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }
    newTime.setHours(hour24, minute, 0, 0);
    return newTime;
  }, []);

  // Handle done action
  const handleDone = useCallback(() => {
    try {
      const validSelectedDate = isValidDate(selectedDate) ? selectedDate : new Date();

    if (isAllDay) {
        const endDateToPass = includeEndTime && isValidDate(endDate) ? endDate : undefined;
        onSelect(validSelectedDate, undefined, endDateToPass);
    } else {
        const validStartTime = createTimeFromDropdowns(startHour, startMinute, startPeriod, validSelectedDate);
        const endTimeToPass = includeEndTime ? createTimeFromDropdowns(endHour, endMinute, endPeriod, endDate) : undefined;
        onSelect(validSelectedDate, validStartTime, endTimeToPass);
    }
    onClose();
    } catch (error) {
      console.error('Error in handleDone:', error);
      onClose();
    }
  }, [isAllDay, selectedDate, includeEndTime, endDate, onSelect, onClose, createTimeFromDropdowns, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod]);

  // Show picker with animation
  const showPickerWithAnimation = useCallback((pickerType: PickerType) => {
    setActivePickerType(pickerType);
    
    // Stop existing animations
    animationRefs.current.backdropAnimation?.stop();
    animationRefs.current.pickerAnimation?.stop();
    
    // Animate picker in
    animationRefs.current.backdropAnimation = Animated.timing(backdropOpacity, {
      toValue: 0.5,
      duration: Platform.OS === 'ios' ? 200 : 150,
      useNativeDriver: true,
    });
    
    animationRefs.current.pickerAnimation = Animated.spring(pickerOffset, {
      toValue: 0,
      tension: Platform.OS === 'ios' ? 150 : 120,
      friction: Platform.OS === 'ios' ? 8 : 7,
      useNativeDriver: true,
    });

    animationRefs.current.backdropAnimation.start();
    animationRefs.current.pickerAnimation.start();
  }, [backdropOpacity, pickerOffset]);

  // Hide picker with animation
  const hidePicker = useCallback(() => {
    // Stop existing animations
    animationRefs.current.backdropAnimation?.stop();
    animationRefs.current.pickerAnimation?.stop();
    
    // Animate picker out
    const backdropAnim = Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: Platform.OS === 'ios' ? 200 : 150,
      useNativeDriver: true,
    });
    
    const pickerAnim = Animated.timing(pickerOffset, {
      toValue: SCREEN_HEIGHT,
      duration: Platform.OS === 'ios' ? 200 : 150,
      useNativeDriver: true,
    });

    Animated.parallel([backdropAnim, pickerAnim]).start(() => {
      setActivePickerType(null);
    });
  }, [backdropOpacity, pickerOffset]);

  // Date picker handlers
  const onDateChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' && event?.type === 'dismissed') {
      hidePicker();
      return;
    }
    
    if (Platform.OS === 'android' && event?.type === 'set') {
      hidePicker();
    }
    
    if (selectedDate && isValidDate(selectedDate)) {
      setSelectedDate(new Date(selectedDate));
      }
  }, [hidePicker]);

  const onEndDateChange = useCallback((event: any, selectedEndDate?: Date) => {
    if (Platform.OS === 'android' && event?.type === 'dismissed') {
      hidePicker();
      return;
      }
    
    if (Platform.OS === 'android' && event?.type === 'set') {
      hidePicker();
    }
    
    if (selectedEndDate && isValidDate(selectedEndDate)) {
      const newEndDate = new Date(selectedEndDate);
      
      // Ensure end date is not before start date
      if (newEndDate < selectedDate) {
        setEndDate(new Date(selectedDate));
      } else {
        setEndDate(newEndDate);
      }
    }
  }, [hidePicker, selectedDate]);

  // Time dropdown handlers
  const handleStartTimeChange = useCallback((field: 'hour' | 'minute' | 'period', value: number | string) => {
    let newHour = startHour;
    let newMinute = startMinute;
    let newPeriod = startPeriod;

    if (field === 'hour') newHour = value as number;
    if (field === 'minute') newMinute = value as number;
    if (field === 'period') newPeriod = value as string;

    setStartHour(newHour);
    setStartMinute(newMinute);
    setStartPeriod(newPeriod);
    
    const newStartTime = createTimeFromDropdowns(newHour, newMinute, newPeriod, selectedDate);
    setStartTime(newStartTime);
  }, [startHour, startMinute, startPeriod, createTimeFromDropdowns, selectedDate]);

  const handleEndTimeChange = useCallback((field: 'hour' | 'minute' | 'period', value: number | string) => {
    let newHour = endHour;
    let newMinute = endMinute;
    let newPeriod = endPeriod;

    if (field === 'hour') newHour = value as number;
    if (field === 'minute') newMinute = value as number;
    if (field === 'period') newPeriod = value as string;

    setEndHour(newHour);
    setEndMinute(newMinute);
    setEndPeriod(newPeriod);
    
    const newEndTime = createTimeFromDropdowns(newHour, newMinute, newPeriod, endDate);
      setEndTime(newEndTime);
  }, [endHour, endMinute, endPeriod, createTimeFromDropdowns, endDate]);

  // Toggle handlers
  const handleAllDayToggle = useCallback((value: boolean) => {
    setIsAllDay(value);
  }, []);

  const handleIncludeEndTimeToggle = useCallback((value: boolean) => {
    setIncludeEndTime(value);
  }, []);

  // Handle picker done button
  const handlePickerDone = useCallback(() => {
    hidePicker();
  }, [hidePicker]);

  // Render picker overlay
  const renderPicker = () => {
    if (!activePickerType) {
      return null;
    }

    // Date picker (for date and endDate)
    if (activePickerType === 'date' || activePickerType === 'endDate') {
      const currentValue = activePickerType === 'date' ? selectedDate : endDate;
      const onChange = activePickerType === 'date' ? onDateChange : onEndDateChange;
      const title = activePickerType === 'date' ? 'Select Date' : 'Select End Date';

    return (
      <>
        {/* Backdrop */}
          <Animated.View
            style={[styles.pickerBackdrop, { opacity: backdropOpacity }]}
            pointerEvents="auto"
          >
          <Pressable style={styles.backdropPress} onPress={hidePicker} />
        </Animated.View>

        {/* Picker Container */}
          <Animated.View
            style={[
              styles.pickerContainer,
              {
                transform: [{ translateY: pickerOffset }],
                backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
              }
            ]}
          >
            {/* Picker Header */}
            <View style={[styles.pickerHeader, { backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <TouchableOpacity 
                onPress={hidePicker} 
                style={styles.pickerButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
              <Text style={[styles.pickerButtonText, { color: theme.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
              <Text style={[styles.pickerTitle, { color: theme.isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                {title}
            </Text>
            
              <TouchableOpacity 
                onPress={handlePickerDone} 
                style={styles.pickerButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
              <Text style={[styles.pickerButtonText, { color: theme.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          
            {/* Date Picker Content */}
            <View style={[
              styles.pickerContent, 
              { 
                backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
                paddingVertical: getPickerContentSpacing().padding,
                paddingHorizontal: getPickerContentSpacing().margin,
              }
            ]}>
            <DateTimePicker
              value={currentValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={onChange}
                textColor={theme.isDark ? '#FFFFFF' : '#000000'}
              accentColor={theme.primary}
              themeVariant={theme.isDark ? 'dark' : 'light'}
                style={[
                  styles.dateTimePicker,
                  {
                    height: Platform.OS === 'ios' 
                      ? Math.min(verticalScale(240), SCREEN_HEIGHT * 0.35)
                      : Math.min(verticalScale(280), SCREEN_HEIGHT * 0.4),
                  }
                ]}
                minimumDate={new Date(2020, 0, 1)}
                maximumDate={new Date(2050, 11, 31)}
                locale="en-US"
            />
          </View>
        </Animated.View>
      </>
    );
    }

    // Time picker (for startTime and endTime)
    if (activePickerType === 'startTime' || activePickerType === 'endTime') {
      const isStartTime = activePickerType === 'startTime';
      const currentHour = isStartTime ? startHour : endHour;
      const currentMinute = isStartTime ? startMinute : endMinute;
      const currentPeriod = isStartTime ? startPeriod : endPeriod;
      const title = isStartTime ? 'Select Start Time' : 'Select End Time';
      const handleTimeChange = isStartTime ? handleStartTimeChange : handleEndTimeChange;

      return (
        <>
          {/* Backdrop */}
          <Animated.View
            style={[styles.pickerBackdrop, { opacity: backdropOpacity }]}
            pointerEvents="auto"
          >
            <Pressable style={styles.backdropPress} onPress={hidePicker} />
          </Animated.View>

          {/* Picker Container */}
          <Animated.View
            style={[
              styles.pickerContainer,
              {
                transform: [{ translateY: pickerOffset }],
                backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
              }
            ]}
          >
            {/* Picker Header */}
            <View style={[styles.pickerHeader, { backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <TouchableOpacity 
                onPress={hidePicker} 
                style={styles.pickerButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.pickerButtonText, { color: theme.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <Text style={[styles.pickerTitle, { color: theme.isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                {title}
              </Text>

              <TouchableOpacity 
                onPress={handlePickerDone} 
                style={styles.pickerButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.pickerButtonText, { color: theme.primary }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker Content - 3 Simple Dropdowns */}
            <KeyboardAvoidingView 
              style={[
                styles.timePickerContent, 
                { 
                  backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingVertical: getPickerContentSpacing().padding,
                  paddingHorizontal: getPickerContentSpacing().margin,
                  minHeight: Math.min(
                    verticalScale(deviceCategory === 'extraSmall' ? 280 : 320), 
                    SCREEN_HEIGHT * (deviceCategory === 'extraSmall' ? 0.35 : 0.4)
                  ),
                }
              ]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <Text style={[
                styles.timePickerTitle, 
                { 
                  color: theme.text,
                  marginBottom: getPickerContentSpacing().gap * 1.5 
                }
              ]} numberOfLines={1}>
                Select Time
              </Text>
              
              <View style={[
                styles.timeDropdownsRow,
                {
                  gap: getPickerContentSpacing().gap,
                  marginBottom: getPickerContentSpacing().gap * 1.5,
                  paddingHorizontal: getResponsiveSpacing(4),
                }
              ]}>
                {/* Hours Dropdown */}
                <SimpleDropdown
                  label="Hour"
                  value={currentHour}
                  options={HOURS}
                  onSelect={(value) => handleTimeChange('hour', value)}
                  theme={theme}
                />

                {/* Minutes Dropdown */}
                <SimpleDropdown
                  label="Minute"
                  value={currentMinute}
                  options={MINUTES}
                  onSelect={(value) => handleTimeChange('minute', value)}
                  theme={theme}
                  formatter={(min) => min.toString().padStart(2, '0')}
                />

                {/* AM/PM Dropdown */}
                <SimpleDropdown
                  label="Period"
                  value={currentPeriod}
                  options={PERIODS}
                  onSelect={(value) => handleTimeChange('period', value)}
                  theme={theme}
                />
              </View>

              <View style={[
                styles.timePreview,
                {
                  paddingVertical: getPickerContentSpacing().gap,
                  marginTop: 'auto',
                }
              ]}>
                <Text style={[styles.timePreviewText, { color: theme.primary }]} numberOfLines={1}>
                  {formatTime(createTimeFromDropdowns(currentHour, currentMinute, currentPeriod, new Date()))}
                </Text>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </>
      );
    }

    return null;
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
      supportedOrientations={['portrait', 'landscape']}
    >
      <StatusBar 
        barStyle={theme.isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
        translucent={false}
      />
      
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.headerButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={scale(20)} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
                Date and Time
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleDone} 
              style={styles.doneButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.doneButtonText, { color: theme.primary }]} numberOfLines={1}>
                Done
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={Platform.OS === 'ios'}
              overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
              contentContainerStyle={styles.scrollContent}
            >
            {/* Toggle Options */}
            <View style={[styles.optionsContainer, { backgroundColor: theme.surface }]}>
              {/* All-day Toggle */}
              <View style={styles.optionRow}>
                  <Text style={[styles.optionLabel, { color: theme.text }]} numberOfLines={1}>
                  All-day
                </Text>
                <Switch
                  value={isAllDay}
                  onValueChange={handleAllDayToggle}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  ios_backgroundColor={theme.border}
                />
              </View>

              {/* Include End Time Toggle */}
                <View style={[styles.optionRow, styles.optionRowBorder, { borderTopColor: theme.border }]}>
                  <Text style={[styles.optionLabel, { color: theme.text }]} numberOfLines={1}>
                    Include End Time
                  </Text>
                  <Switch
                    value={includeEndTime}
                    onValueChange={handleIncludeEndTimeToggle}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                    ios_backgroundColor={theme.border}
                  />
                </View>
            </View>

            {/* Date and Time Selectors */}
            <View style={[styles.selectorsContainer, { backgroundColor: theme.surface }]}>
              {/* Starts Row */}
                <View style={styles.selectorRow}>
                  <Text style={[styles.selectorLabel, { color: theme.text }]} numberOfLines={1}>
                    Starts
                  </Text>
                  <View style={styles.selectorValues}>
              <TouchableOpacity 
                      onPress={() => showPickerWithAnimation('date')}
                      style={[styles.selectorButton, { backgroundColor: theme.background }]}
                activeOpacity={0.7}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                      <Text style={[styles.selectorText, { color: theme.primary }]} numberOfLines={1}>
                        {formatDate(selectedDate)}
                </Text>
                    </TouchableOpacity>
                  
                  {!isAllDay && (
                      <TouchableOpacity 
                        onPress={() => showPickerWithAnimation('startTime')}
                        style={[styles.selectorButton, { backgroundColor: theme.background }]}
                        activeOpacity={0.7}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      >
                        <Text style={[styles.selectorText, { color: theme.primary }]} numberOfLines={1}>
                        {formatTime(startTime)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                </View>

              {/* Ends Row */}
                {includeEndTime && (
                  <View style={[styles.selectorRow, styles.selectorRowBorder, { borderTopColor: theme.border }]}>
                    <Text style={[styles.selectorLabel, { color: theme.text }]} numberOfLines={1}>
                      Ends
                    </Text>
                    <View style={styles.selectorValues}>
                <TouchableOpacity 
                        onPress={() => showPickerWithAnimation('endDate')}
                        style={[styles.selectorButton, { backgroundColor: theme.background }]}
                  activeOpacity={0.7}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                        <Text style={[styles.selectorText, { color: theme.primary }]} numberOfLines={1}>
                          {formatDate(endDate)}
                  </Text>
                      </TouchableOpacity>
                      
                      {!isAllDay && (
                        <TouchableOpacity 
                          onPress={() => showPickerWithAnimation('endTime')}
                          style={[styles.selectorButton, { backgroundColor: theme.background }]}
                          activeOpacity={0.7}
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <Text style={[styles.selectorText, { color: theme.primary }]} numberOfLines={1}>
                      {formatTime(endTime)}
                    </Text>
                </TouchableOpacity>
                      )}
                    </View>
                  </View>
              )}

              {/* No End Time Row */}
                {!includeEndTime && (
                <View style={[styles.selectorRow, styles.selectorRowBorder, { borderTopColor: theme.border }]}>
                    <Text style={[styles.selectorLabel, { color: theme.text }]} numberOfLines={1}>
                    Ends
                  </Text>
                    <Text style={[styles.noEndTimeText, { color: theme.textSecondary }]} numberOfLines={1}>
                    None
                  </Text>
                </View>
              )}
            </View>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>

        {/* Picker Overlay */}
        {renderPicker()}
      </KeyboardAvoidingView>
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
    zIndex: 10,
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
  doneButton: {
    width: scale(deviceCategory === 'extraSmall' ? 52 : 56),
    height: scale(deviceCategory === 'extraSmall' ? 36 : 40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '600',
  },

  // Content - Responsive
  content: {
    flex: 1,
    paddingTop: verticalScale(getResponsiveSpacing(16)),
  },
  scrollContent: {
    paddingBottom: verticalScale(getResponsiveSpacing(20)),
  },

  // Options Container - Responsive
  optionsContainer: {
    marginHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(12),
    marginBottom: verticalScale(getResponsiveSpacing(20)),
    overflow: 'hidden',
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
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    paddingVertical: verticalScale(getResponsiveSpacing(14)),
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 48 : 52),
  },
  optionRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '400',
    flex: 1,
  },

  // Selectors Container - Responsive
  selectorsContainer: {
    marginHorizontal: scale(getResponsiveSpacing(16)),
    borderRadius: scale(12),
    overflow: 'hidden',
    marginBottom: verticalScale(getResponsiveSpacing(20)),
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
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    paddingVertical: verticalScale(getResponsiveSpacing(14)),
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 48 : 52),
  },
  selectorRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  selectorLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '400',
    minWidth: scale(deviceCategory === 'extraSmall' ? 60 : 70),
    maxWidth: scale(deviceCategory === 'extraLarge' ? 120 : 100),
  },
  selectorValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(getResponsiveSpacing(6)),
    flex: 1,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  selectorButton: {
    paddingVertical: verticalScale(getResponsiveSpacing(8)),
    paddingHorizontal: scale(getResponsiveSpacing(10)),
    borderRadius: scale(8),
    minWidth: scale(deviceCategory === 'extraSmall' ? 65 : 75),
    maxWidth: scale(deviceCategory === 'extraLarge' ? 160 : 140),
    alignItems: 'center',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 30 : 34),
    flexShrink: 1,
  },
  selectorText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '400',
    textAlign: 'center',
  },
  noEndTimeText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '400',
    textAlign: 'right',
  },

  // Picker Overlay
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  backdropPress: {
    flex: 1,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    overflow: 'hidden',
    elevation: Platform.OS === 'android' ? 10 : 0,
    maxHeight: SCREEN_HEIGHT * (deviceCategory === 'extraSmall' ? 0.75 : 0.8),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    }),
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(16)),
    paddingVertical: verticalScale(getResponsiveSpacing(12)),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 48 : 52),
    maxHeight: verticalScale(deviceCategory === 'extraLarge' ? 68 : 64),
  },
  pickerButton: {
    paddingVertical: verticalScale(getResponsiveSpacing(8)),
    paddingHorizontal: scale(getResponsiveSpacing(8)),
    minWidth: scale(deviceCategory === 'extraSmall' ? 48 : 56),
    maxWidth: scale(deviceCategory === 'extraLarge' ? 88 : 80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '400',
  },
  pickerTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 15 : 16),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: scale(getResponsiveSpacing(8)),
  },
  pickerContent: {
    // Dynamic padding handled inline
    justifyContent: 'center',
  },
  dateTimePicker: {
    width: '100%',
    // Dynamic height handled inline
  },
  
  // Time Picker Styles - Responsive
  timePickerContent: {
    // Dynamic padding and sizing handled inline
  },
  timePickerTitle: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 16 : 18),
    fontWeight: '600',
    textAlign: 'center',
    // Dynamic margin handled inline
  },
  timeDropdownsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // Dynamic spacing handled inline
  },
  timePreview: {
    alignItems: 'center',
    // Dynamic padding handled inline
  },
  timePreviewText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 20 : 22),
    fontWeight: '600',
  },

  // Simple Dropdown Styles - Responsive
  dropdownContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    minWidth: scale(deviceCategory === 'extraSmall' ? 60 : 70),
    maxWidth: scale(deviceCategory === 'extraLarge' ? 140 : 120),
  },
  dropdownLabel: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 12 : 13),
    fontWeight: '600',
    marginBottom: verticalScale(getResponsiveSpacing(6)),
    textAlign: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(getResponsiveSpacing(8)),
    paddingVertical: verticalScale(getResponsiveSpacing(10)),
    borderRadius: scale(8),
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 36 : 40),
    maxHeight: verticalScale(deviceCategory === 'extraLarge' ? 52 : 48),
  },
  dropdownButtonText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  dropdownIcon: {
    marginLeft: scale(2),
  },
  dropdownIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: verticalScale(2),
    borderRadius: scale(8),
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: Math.min(
      verticalScale(deviceCategory === 'extraSmall' ? 140 : 160), 
      SCREEN_HEIGHT * (deviceCategory === 'extraSmall' ? 0.2 : 0.25)
    ),
    zIndex: 1000,
    elevation: Platform.OS === 'android' ? 8 : 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownOption: {
    paddingVertical: verticalScale(getResponsiveSpacing(10)),
    paddingHorizontal: scale(getResponsiveSpacing(12)),
    borderRadius: scale(4),
    marginHorizontal: scale(2),
    marginVertical: verticalScale(1),
    minHeight: verticalScale(deviceCategory === 'extraSmall' ? 32 : 36),
    justifyContent: 'center',
  },
  dropdownOptionText: {
    fontSize: moderateScale(deviceCategory === 'extraSmall' ? 14 : 15),
    textAlign: 'center',
  },
});