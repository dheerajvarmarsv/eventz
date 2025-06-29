import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  ScrollView,
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
import { X } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced responsive scaling
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Advanced device type detection
const isTablet = SCREEN_WIDTH >= 768;
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 428;
const isExtraLargeDevice = SCREEN_WIDTH >= 428;

const getResponsiveSize = (small: number, medium: number, large: number, tablet?: number) => {
  if (isTablet) return tablet || large * 1.2;
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  if (isLargeDevice || isExtraLargeDevice) return large;
  return medium;
};

interface EventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (description: string, hostName: string) => void;
  currentDescription?: string;
  currentHostName?: string;
}

export function EventDetailsModal({
  visible,
  onClose,
  onSave,
  currentDescription = '',
  currentHostName = 'Joshua Smith',
}: EventDetailsModalProps) {
  const [description, setDescription] = useState(currentDescription);
  const [hostName, setHostName] = useState(currentHostName);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      headerOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      contentTranslateY.value = withDelay(200, withTiming(0, { 
        duration: 500, 
        easing: Easing.out(Easing.quad) 
      }));
    } else {
      headerOpacity.value = 0;
      contentOpacity.value = 0;
      contentTranslateY.value = 20;
    }
  }, [visible]);

  const handleDone = () => {
    onSave(description.trim(), hostName.trim());
  };

  // Character count for description
  const maxDescriptionLength = 1000;
  const descriptionLength = description.length;
  const remainingChars = maxDescriptionLength - descriptionLength;

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Dark Background with Gradient */}
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <X size={getResponsiveSize(22, 24, 26, 28)} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerTitle}>
              <Text style={styles.title}>Event Details</Text>
            </View>
            
            <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Event Description Section */}
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>EVENT DESCRIPTION</Text>
                
                <View style={styles.descriptionContainer}>
                  <View style={styles.descriptionGlassBackground} />
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Tell your guests about your event."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={8}
                    maxLength={maxDescriptionLength}
                    textAlignVertical="top"
                  />
                </View>
                
                <Text style={styles.characterCount}>
                  Character Limit: {descriptionLength}/{maxDescriptionLength}
                </Text>
              </View>

              {/* Host Name Section */}
              <View style={styles.hostSection}>
                <Text style={styles.sectionTitle}>HOST NAME</Text>
                
                <View style={styles.hostNameContainer}>
                  <View style={styles.hostNameGlassBackground} />
                  <TextInput
                    style={styles.hostNameInput}
                    placeholder="Host name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={hostName}
                    onChangeText={setHostName}
                    maxLength={50}
                  />
                </View>
                
                <Text style={styles.hostNote}>
                  This is how guests will see you in the event. You can also change your name on a per-event basis.
                </Text>
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20, 24, 28, 32),
    paddingVertical: getResponsiveSize(16, 18, 20, 24),
  },
  headerButton: {
    width: getResponsiveSize(36, 40, 44, 48),
    height: getResponsiveSize(36, 40, 44, 48),
    borderRadius: getResponsiveSize(18, 20, 22, 24),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveSize(18, 20, 22, 26),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  doneButton: {
    paddingHorizontal: getResponsiveSize(16, 18, 20, 24),
    paddingVertical: getResponsiveSize(8, 10, 12, 14),
    borderRadius: getResponsiveSize(16, 18, 20, 22),
    backgroundColor: '#007AFF',
  },
  doneButtonText: {
    fontSize: getResponsiveSize(14, 15, 16, 18),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSize(20, 24, 28, 32),
  },
  
  // Event Description Section
  descriptionSection: {
    marginBottom: getResponsiveSize(32, 36, 40, 48),
  },
  sectionTitle: {
    fontSize: getResponsiveSize(12, 13, 14, 16),
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: getResponsiveSize(0.5, 0.6, 0.7, 0.8),
    marginBottom: getResponsiveSize(12, 14, 16, 18),
  },
  descriptionContainer: {
    position: 'relative',
    borderRadius: getResponsiveSize(16, 18, 20, 24),
    overflow: 'hidden',
    minHeight: getResponsiveSize(160, 180, 200, 240),
    marginBottom: getResponsiveSize(8, 10, 12, 14),
  },
  descriptionGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: getResponsiveSize(16, 18, 20, 24),
  },
  descriptionInput: {
    paddingHorizontal: getResponsiveSize(16, 18, 20, 24),
    paddingVertical: getResponsiveSize(16, 18, 20, 24),
    fontSize: getResponsiveSize(16, 17, 18, 20),
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    minHeight: getResponsiveSize(160, 180, 200, 240),
    maxHeight: getResponsiveSize(240, 260, 280, 320),
  },
  characterCount: {
    fontSize: getResponsiveSize(12, 13, 14, 16),
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
  },

  // Host Name Section
  hostSection: {
    marginBottom: getResponsiveSize(40, 48, 56, 64),
  },
  hostNameContainer: {
    position: 'relative',
    borderRadius: getResponsiveSize(12, 14, 16, 18),
    overflow: 'hidden',
    marginBottom: getResponsiveSize(12, 14, 16, 18),
  },
  hostNameGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: getResponsiveSize(12, 14, 16, 18),
  },
  hostNameInput: {
    paddingHorizontal: getResponsiveSize(16, 18, 20, 24),
    paddingVertical: getResponsiveSize(14, 16, 18, 20),
    fontSize: getResponsiveSize(16, 17, 18, 20),
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  hostNote: {
    fontSize: getResponsiveSize(13, 14, 15, 17),
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: getResponsiveSize(18, 20, 22, 24),
  },
}); 