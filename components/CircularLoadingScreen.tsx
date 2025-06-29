import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  useDerivedValue,
  cancelAnimation,
} from 'react-native-reanimated';
import { Heart, Calendar, Camera, Users, MapPin, Sparkles, Music, Gift, Star, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced responsive scaling with device orientation support
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Advanced device type detection for optimal performance and layout
const isTablet = SCREEN_WIDTH >= 768;
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 428;
const isExtraLargeDevice = SCREEN_WIDTH >= 428;
const isShortDevice = SCREEN_HEIGHT < 700;
const isTallDevice = SCREEN_HEIGHT > 900;

const centerX = SCREEN_WIDTH / 2;
const centerY = SCREEN_HEIGHT / 2;

// Dynamic scaling based on device type
const getResponsiveSize = (small: number, medium: number, large: number, tablet?: number) => {
  if (isTablet) return tablet || large * 1.2;
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  if (isLargeDevice || isExtraLargeDevice) return large;
  return medium;
};

// Performance-optimized configuration with responsive sizing
const ANIMATION_CONFIG = {
  ROTATION_DURATION: 8000,
  TEXT_TRANSITION_DURATION: 800,
  ICON_SCALE_DURATION: 600,
  LOADING_TIMEOUT: 15000, // Fallback timeout
  CIRCLE_RADIUS: getResponsiveSize(90, 110, 120, 140),
  ICON_SIZE: getResponsiveSize(18, 22, 24, 28),
  ICON_CONTAINER_SIZE: getResponsiveSize(40, 45, 50, 60),
  LOGO_SIZE: getResponsiveSize(24, 28, 32, 40),
  LOGO_CONTAINER_SIZE: getResponsiveSize(50, 56, 64, 76),
  STAGGER_DELAY: 100,
};

// Circular Icons Configuration
interface CircularIcon {
  id: string;
  icon: any;
  color: string;
  accessibilityLabel: string;
}

const CIRCULAR_ICONS: CircularIcon[] = [
  { id: 'heart', icon: Heart, color: '#FF6B6B', accessibilityLabel: 'Love and relationships' },
  { id: 'calendar', icon: Calendar, color: '#4ECDC4', accessibilityLabel: 'Event planning' },
  { id: 'camera', icon: Camera, color: '#45B7D1', accessibilityLabel: 'Photo memories' },
  { id: 'users', icon: Users, color: '#96CEB4', accessibilityLabel: 'Friends and family' },
  { id: 'mappin', icon: MapPin, color: '#FCEA2B', accessibilityLabel: 'Event locations' },
  { id: 'sparkles', icon: Sparkles, color: '#FF9FF3', accessibilityLabel: 'Special moments' },
  { id: 'music', icon: Music, color: '#A8E6CF', accessibilityLabel: 'Entertainment' },
  { id: 'gift', icon: Gift, color: '#FFB3BA', accessibilityLabel: 'Celebrations' },
];

// Onboarding Messages
interface OnboardingMessage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: number;
}

const ONBOARDING_MESSAGES: OnboardingMessage[] = [
  {
    id: 'welcome',
    title: 'Welcome to Eventz',
    subtitle: 'Your Event Companion',
    description: 'Creating magical moments together',
    duration: 3000,
  },
  {
    id: 'organize',
    title: 'Organize Effortlessly',
    subtitle: 'Smart Planning',
    description: 'AI-powered event coordination',
    duration: 3000,
  },
  {
    id: 'connect',
    title: 'Connect & Share',
    subtitle: 'Stay Together',
    description: 'Build lasting memories with loved ones',
    duration: 3000,
  },
  {
    id: 'ready',
    title: 'Ready to Begin?',
    subtitle: 'Let\'s Start',
    description: 'Your journey starts here',
    duration: 2000,
  },
];

// Error boundaries and loading states
type LoadingState = 'loading' | 'content' | 'complete' | 'ready' | 'error';

interface CircularIconProps {
  icon: CircularIcon;
  index: number;
  totalIcons: number;
  rotation: Animated.SharedValue<number>;
  isReducedMotion: boolean;
}

// Memoized Circular Icon Component for performance
const CircularIcon = React.memo<CircularIconProps>(({ 
  icon, 
  index, 
  totalIcons, 
  rotation,
  isReducedMotion 
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const angle = (360 / totalIcons) * index;
  const IconComponent = icon.icon;

  useEffect(() => {
    // Staggered entry animation
    const delay = index * ANIMATION_CONFIG.STAGGER_DELAY;
    
    scale.value = withDelay(
      delay,
      withTiming(1, {
        duration: ANIMATION_CONFIG.ICON_SCALE_DURATION,
        easing: Easing.out(Easing.back(1.2))
      })
    );

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400 })
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentAngle = isReducedMotion ? angle : (angle + rotation.value) % 360;
    const radian = (currentAngle * Math.PI) / 180;
    
    const translateX = Math.cos(radian) * ANIMATION_CONFIG.CIRCLE_RADIUS;
    const translateY = Math.sin(radian) * ANIMATION_CONFIG.CIRCLE_RADIUS;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  }, [isReducedMotion]);

  return (
    <Animated.View 
      style={[styles.circularIcon, animatedStyle]}
      accessible={true}
      accessibilityLabel={icon.accessibilityLabel}
      accessibilityRole="image"
    >
      <View style={[styles.iconContainer, { backgroundColor: icon.color }]}>
        <IconComponent 
          size={ANIMATION_CONFIG.ICON_SIZE} 
          color="#FFFFFF" 
          strokeWidth={2}
        />
      </View>
    </Animated.View>
  );
});

// Main Loading Screen Component
interface CircularLoadingScreenProps {
  onComplete: () => void;
  onError?: (error: Error) => void;
  testID?: string;
}

export function CircularLoadingScreen({ 
  onComplete, 
  onError,
  testID = 'circular-loading-screen'
}: CircularLoadingScreenProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Animated values with proper cleanup
  const rotation = useSharedValue(0);
  const logoScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  
  // Timers ref for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isComponentMounted = useRef(true);

  // Accessibility support
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        const isReducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isComponentMounted.current) {
          setIsReducedMotion(isReducedMotionEnabled);
        }
      } catch (error) {
        console.warn('Failed to check reduced motion preference:', error);
      }
    };

    checkReducedMotion();
  }, []);

  // Error handling with fallback
  const handleError = useCallback((error: Error) => {
    console.error('CircularLoadingScreen error:', error);
    setLoadingState('error');
    onError?.(error);
  }, [onError]);

  // Safe state update helper
  const safeSetState = useCallback((callback: () => void) => {
    if (isComponentMounted.current) {
      try {
        callback();
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }, [handleError]);

  // Initialize animations
  useEffect(() => {
    try {
      // Logo entrance animation
      logoScale.value = withDelay(
        200,
        withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.back(1.1))
        })
      );

      // Start continuous rotation if motion is enabled
      if (!isReducedMotion) {
        rotation.value = withRepeat(
          withTiming(360, {
            duration: ANIMATION_CONFIG.ROTATION_DURATION,
            easing: Easing.linear
          }),
          -1,
          false
        );
      }

      // Start text animation cycle
      animateText();

    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Animation initialization failed'));
    }

          return () => {
      isComponentMounted.current = false;
      timersRef.current.forEach(timer => clearTimeout(timer));
      cancelAnimation(rotation);
      cancelAnimation(logoScale);
      cancelAnimation(textOpacity);
      cancelAnimation(textTranslateY);
      cancelAnimation(buttonOpacity);
      cancelAnimation(buttonScale);
    };
  }, [isReducedMotion]);

  // Text animation cycle
  const animateText = useCallback(() => {
    if (!isComponentMounted.current || loadingState !== 'loading') return;

    try {
      // Animate in
      textOpacity.value = withTiming(1, { duration: ANIMATION_CONFIG.TEXT_TRANSITION_DURATION });
      textTranslateY.value = withTiming(0, { 
        duration: ANIMATION_CONFIG.TEXT_TRANSITION_DURATION,
        easing: Easing.out(Easing.quad)
      });

      const currentMessage = ONBOARDING_MESSAGES[currentMessageIndex];
      
      const timer = setTimeout(() => {
        if (!isComponentMounted.current || loadingState !== 'loading') return;
        
        // Animate out
        textOpacity.value = withTiming(0, { duration: 400 });
        textTranslateY.value = withTiming(-20, { duration: 400 });

        setTimeout(() => {
          if (isComponentMounted.current && loadingState === 'loading') {
            const nextIndex = currentMessageIndex + 1;
            
            if (nextIndex >= ONBOARDING_MESSAGES.length) {
              setLoadingState('ready');
            } else {
              setCurrentMessageIndex(nextIndex);
            }
          }
        }, 400);
      }, currentMessage.duration);

      timersRef.current.push(timer);

    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Text animation failed'));
    }
  }, [currentMessageIndex, loadingState, safeSetState]);

  // Memoized current message
  const currentMessage = useMemo(() => 
    ONBOARDING_MESSAGES[currentMessageIndex], 
    [currentMessageIndex]
  );

  // Trigger text animation when message index changes
  useEffect(() => {
    if (loadingState === 'loading') {
      textTranslateY.value = 30;
      animateText();
    }
  }, [currentMessageIndex, loadingState, animateText]);

  // Show Get Started button when ready
  useEffect(() => {
    if (loadingState === 'ready') {
      buttonOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
      buttonScale.value = withDelay(500, withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.back(1.1)) 
      }));
    }
  }, [loadingState]);

  // Handle Get Started button press
  const handleGetStarted = useCallback(() => {
    setLoadingState('complete');
    onComplete();
  }, [onComplete]);

  // Animated styles with proper performance optimization
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }), []);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }), []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }), []);

  // Error state
  if (loadingState === 'error') {
    return (
      <View style={styles.container} testID={`${testID}-error`}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorDescription}>Please try again</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setLoadingState('loading');
                setCurrentMessageIndex(0);
                animateText();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry loading"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Circular Icons Container */}
          <View 
            style={styles.circularContainer}
            accessible={true}
            accessibilityLabel="Loading animation with rotating icons"
          >
            {CIRCULAR_ICONS.map((icon, index) => (
              <CircularIcon
                key={icon.id}
                icon={icon}
                index={index}
                totalIcons={CIRCULAR_ICONS.length}
                rotation={rotation}
                isReducedMotion={isReducedMotion}
              />
            ))}
            
            {/* Center Logo */}
            <Animated.View 
              style={[styles.centerLogo, logoAnimatedStyle]}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel="Eventz app logo"
            >
              <View style={styles.logoContainer}>
                              <Heart 
                size={ANIMATION_CONFIG.LOGO_SIZE} 
                color="#FFFFFF" 
                fill="#FFFFFF"
                strokeWidth={0}
              />
              </View>
              <Text style={styles.logoText}>eventz</Text>
            </Animated.View>
          </View>

          {/* Dynamic Text Content */}
          {loadingState !== 'ready' && (
            <Animated.View 
              style={[styles.textContainer, textAnimatedStyle]}
              accessible={true}
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.titleText}>{currentMessage.title}</Text>
              <Text style={styles.subtitleText}>{currentMessage.subtitle}</Text>
              <Text style={styles.descriptionText}>{currentMessage.description}</Text>
            </Animated.View>
          )}

          {/* Enhanced Get Started Button - Shown when ready */}
          {loadingState === 'ready' && (
            <Animated.View 
              style={[styles.buttonContainer, buttonAnimatedStyle]}
              accessible={true}
            >
              <TouchableOpacity 
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Get started with Eventz"
              >
                {/* Multiple glass layers for premium effect */}
                <View style={styles.buttonGlassOverlay} />
                <View style={styles.buttonShimmerOverlay} />
                <Text style={styles.getStartedButtonText}>Get Started</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {ONBOARDING_MESSAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentMessageIndex && styles.progressDotActive,
                  loadingState === 'ready' && styles.progressDotCompleted
                ]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(16, 20, 24, 28),
    paddingTop: getResponsiveSize(20, 30, 40, 50),
    paddingBottom: getResponsiveSize(20, 30, 40, 50),
  },
  
  // Enhanced Circular Animation Styles
  circularContainer: {
    width: ANIMATION_CONFIG.CIRCLE_RADIUS * 2 + getResponsiveSize(80, 90, 100, 120),
    height: ANIMATION_CONFIG.CIRCLE_RADIUS * 2 + getResponsiveSize(80, 90, 100, 120),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(40, 50, 60, 80),
    marginTop: isShortDevice ? getResponsiveSize(10, 15, 20, 25) : getResponsiveSize(20, 30, 40, 50),
  },
  circularIcon: {
    position: 'absolute',
  },
  iconContainer: {
    width: ANIMATION_CONFIG.ICON_CONTAINER_SIZE,
    height: ANIMATION_CONFIG.ICON_CONTAINER_SIZE,
    borderRadius: ANIMATION_CONFIG.ICON_CONTAINER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  // Center Logo Styles
  centerLogo: {
    alignItems: 'center',
    gap: verticalScale(8),
    zIndex: 10,
  },
  logoContainer: {
    width: ANIMATION_CONFIG.LOGO_CONTAINER_SIZE,
    height: ANIMATION_CONFIG.LOGO_CONTAINER_SIZE,
    borderRadius: ANIMATION_CONFIG.LOGO_CONTAINER_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoText: {
    fontSize: getResponsiveSize(14, 16, 18, 22),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: getResponsiveSize(1, 1.2, 1.5, 2),
    textAlign: 'center',
  },
  
  // Text Content Styles - Enhanced Responsiveness
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(16, 20, 24, 32),
    minHeight: getResponsiveSize(100, 110, 120, 140),
    justifyContent: 'center',
  },
  titleText: {
    fontSize: getResponsiveSize(22, 26, 28, 34),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: getResponsiveSize(6, 7, 8, 10),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: getResponsiveSize(28, 32, 36, 42),
  },
  subtitleText: {
    fontSize: getResponsiveSize(14, 16, 18, 22),
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: getResponsiveSize(10, 11, 12, 14),
  },
  descriptionText: {
    fontSize: getResponsiveSize(13, 15, 16, 18),
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: getResponsiveSize(18, 20, 22, 26),
    maxWidth: getResponsiveSize(240, 260, 280, 320),
    paddingHorizontal: getResponsiveSize(8, 12, 16, 20),
  },
  
  // Enhanced Progress Indicator Styles
  progressContainer: {
    flexDirection: 'row',
    gap: getResponsiveSize(6, 7, 8, 10),
    marginTop: getResponsiveSize(32, 36, 40, 48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    width: getResponsiveSize(6, 7, 8, 10),
    height: getResponsiveSize(6, 7, 8, 10),
    borderRadius: getResponsiveSize(3, 3.5, 4, 5),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
    width: getResponsiveSize(18, 20, 24, 28),
    transform: [{ scale: 1.1 }],
  },
  
  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
  },
  errorTitle: {
    fontSize: moderateScale(24),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  errorDescription: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: verticalScale(32),
    lineHeight: moderateScale(22),
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryButtonText: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // Enhanced Get Started Button Styles - Premium Design
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20, 24, 28, 32),
    minHeight: getResponsiveSize(100, 110, 120, 140),
    justifyContent: 'center',
    marginTop: getResponsiveSize(8, 12, 16, 20),
  },
  getStartedButton: {
    // Premium gradient-like background with enhanced glass morphism
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: getResponsiveSize(28, 32, 36, 42),
    paddingVertical: getResponsiveSize(14, 16, 18, 22),
    paddingHorizontal: getResponsiveSize(32, 40, 48, 60),
    minWidth: getResponsiveSize(160, 180, 200, 240),
    overflow: 'hidden',
    position: 'relative',
    // Enhanced shadow for premium feel
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.4)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  buttonGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: getResponsiveSize(28, 32, 36, 42),
  },
  buttonShimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderTopLeftRadius: getResponsiveSize(28, 32, 36, 42),
    borderBottomLeftRadius: getResponsiveSize(28, 32, 36, 42),
  },
  getStartedButtonText: {
    fontSize: getResponsiveSize(16, 17, 18, 20),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: getResponsiveSize(0.3, 0.4, 0.5, 0.6),
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    zIndex: 2,
    lineHeight: getResponsiveSize(20, 22, 24, 26),
  },
  progressDotCompleted: {
    backgroundColor: '#FFFFFF',
    width: scale(8),
  },
}); 