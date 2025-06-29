import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Heart, Calendar, Camera, Users, MapPin, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Floating Object Component
const FloatingObject = ({ 
  icon: Icon, 
  color, 
  size = 40,
  delay = 0,
  duration = 4000,
  startPosition,
}: {
  icon: any;
  color: string;
  size?: number;
  delay?: number;
  duration?: number;
  startPosition: { x: number; y: number };
}) => {
  const translateX = useSharedValue(startPosition.x);
  const translateY = useSharedValue(startPosition.y);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Scale animation
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) })
    );

    // Floating animation
    const animateFloat = () => {
      translateY.value = withRepeat(
        withSequence(
                  withTiming(startPosition.y - 20, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(startPosition.y + 20, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      translateX.value = withRepeat(
        withSequence(
                  withTiming(startPosition.x + 15, { duration: duration * 0.7, easing: Easing.inOut(Easing.sin) }),
        withTiming(startPosition.x - 15, { duration: duration * 0.7, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      rotate.value = withRepeat(
        withTiming(360, { duration: duration * 2, easing: Easing.linear }),
        -1,
        false
      );
    };

    const timer = setTimeout(animateFloat, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.floatingObject, animatedStyle]}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon size={size * 0.6} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
};

// Onboarding Steps Data
const onboardingSteps = [
  {
    id: 1,
    title: "Delightful Events",
    subtitle: "Start Here",
    description: "Create magical moments with friends and family",
    backgroundColor: ['#000000', '#1a1a1a'],
  },
  {
    id: 2,
    title: "Organize Effortlessly",
    subtitle: "Smart Planning",
    description: "AI-powered event planning that handles every detail",
    backgroundColor: ['#000000', '#1a1a1a'],
  },
  {
    id: 3,
    title: "Connect & Share",
    subtitle: "Together Forever",
    description: "Invite friends and create memories that last",
    backgroundColor: ['#000000', '#1a1a1a'],
  },
];

// Floating objects configuration
const floatingObjects = [
  { icon: Heart, color: '#FF6B6B', position: { x: 50, y: 150 }, delay: 0 },
  { icon: Calendar, color: '#4ECDC4', position: { x: SCREEN_WIDTH - 80, y: 200 }, delay: 200 },
  { icon: Camera, color: '#45B7D1', position: { x: 30, y: 400 }, delay: 400 },
  { icon: Users, color: '#96CEB4', position: { x: SCREEN_WIDTH - 60, y: 450 }, delay: 600 },
  { icon: MapPin, color: '#FCEA2B', position: { x: 80, y: 600 }, delay: 800 },
  { icon: Sparkles, color: '#FF9FF3', position: { x: SCREEN_WIDTH - 100, y: 350 }, delay: 1000 },
];

interface AnimatedOnboardingScreenProps {
  onComplete: () => void;
}

export function AnimatedOnboardingScreen({ onComplete }: AnimatedOnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    // Animate in text for current step
    titleOpacity.value = withTiming(1, { duration: 800 });
    titleTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    buttonScale.value = withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }));
  }, [currentStep]);

  const animateToNextStep = () => {
    titleOpacity.value = withTiming(0, { duration: 300 });
    titleTranslateY.value = withTiming(-50, { duration: 300 });
    
    setTimeout(() => {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleGetStarted();
      }
    }, 300);
  };

  const handleGetStarted = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const currentStepData = onboardingSteps[currentStep];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={currentStepData.backgroundColor as [string, string, ...string[]]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Animated.View 
              entering={ZoomIn.duration(600)}
              style={styles.logoContainer}
            >
              <Heart size={40} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.logoText}>eventz</Text>
            </Animated.View>
            
            <Animated.View 
              entering={FadeIn.delay(800)}
              style={styles.loadingIndicator}
            >
              <View style={styles.loadingSpinner} />
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={currentStepData.backgroundColor as [string, string, ...string[]]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Objects */}
      {floatingObjects.map((obj, index) => (
        <FloatingObject
          key={index}
          icon={obj.icon}
          color={obj.color}
          startPosition={obj.position}
          delay={obj.delay}
          duration={4000 + index * 500}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View 
            entering={ZoomIn.delay(200).duration(800)}
            style={styles.topLogoContainer}
          >
            <Heart size={moderateScale(24)} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.brandText}>eventz</Text>
          </Animated.View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Animated.View style={[styles.textContainer, titleAnimatedStyle]}>
              <Text style={styles.mainTitle}>{currentStepData.title}</Text>
              <View style={styles.subtitleContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.subtitleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.description}>{currentStepData.description}</Text>
            </Animated.View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Step Indicators */}
            <View style={styles.stepIndicators}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive
                  ]}
                />
              ))}
            </View>

            {/* Action Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={animateToNextStep}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>
                    {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  
  // Floating Objects
  floatingObject: {
    position: 'absolute',
    zIndex: 1,
  },
  iconContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Logo
  topLogoContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(20),
    gap: verticalScale(8),
    zIndex: 2,
  },
  brandText: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: scale(1),
  },

  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  mainTitle: {
    fontSize: moderateScale(42),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(12),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    marginBottom: verticalScale(16),
  },
  subtitleGradient: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(24),
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    textAlign: 'center',
  },
  description: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    maxWidth: scale(280),
  },

  // Bottom Section
  bottomSection: {
    paddingBottom: verticalScale(40),
    alignItems: 'center',
    gap: verticalScale(30),
    zIndex: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    gap: scale(8),
  },
  stepDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
    width: scale(24),
  },
  actionButton: {
    borderRadius: moderateScale(25),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    paddingHorizontal: scale(40),
    paddingVertical: verticalScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: moderateScale(25),
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(40),
  },
  logoContainer: {
    alignItems: 'center',
    gap: verticalScale(12),
  },
  logoText: {
    fontSize: moderateScale(24),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: scale(2),
  },
  loadingIndicator: {
    width: moderateScale(40),
    height: moderateScale(40),
  },
  loadingSpinner: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(20),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
  },
}); 