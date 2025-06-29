import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  SlideInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Heart, Mail } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

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
const isShortDevice = SCREEN_HEIGHT < 700;

const getResponsiveSize = (small: number, medium: number, large: number, tablet?: number) => {
  if (isTablet) return tablet || large * 1.2;
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  if (isLargeDevice || isExtraLargeDevice) return large;
  return medium;
};

// Apple Icon Component
const AppleIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg viewBox="0 0 50 50" width={size} height={size}>
    <Path 
      d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z" 
      fill={color}
    />
  </Svg>
);

// Google Icon Component
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg viewBox="0 0 48 48" width={size} height={size}>
    <Path 
      fill="#FFC107" 
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <Path 
      fill="#FF3D00" 
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <Path 
      fill="#4CAF50" 
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <Path 
      fill="#1976D2" 
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </Svg>
);

interface SignInScreenProps {
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  onEmailSignIn: () => void;
}

export function SignInScreen({ onGoogleSignIn, onAppleSignIn, onEmailSignIn }: SignInScreenProps) {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(40);
  
  // Dynamic gradient animation values
  const gradientRotation1 = useSharedValue(0);
  const gradientRotation2 = useSharedValue(0);
  const gradientRotation3 = useSharedValue(0);

  // Initialize animations
  useEffect(() => {
    // Logo animation
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(200, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.1)) 
    }));

    // Title animation
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { 
      duration: 600, 
      easing: Easing.out(Easing.quad) 
    }));

    // Buttons animation
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(600, withTiming(0, { 
      duration: 600, 
      easing: Easing.out(Easing.quad) 
    }));

    // Dynamic gradient animations - slow, random movements
    gradientRotation1.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );
    gradientRotation2.value = withRepeat(
      withTiming(-360, { duration: 35000, easing: Easing.linear }),
      -1,
      false
    );
    gradientRotation3.value = withRepeat(
      withTiming(360, { duration: 45000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  // Animated styles for dynamic gradients
  const gradient1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gradientRotation1.value}deg` }],
  }));

  const gradient2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gradientRotation2.value}deg` }],
  }));

  const gradient3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gradientRotation3.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Dynamic Blue Gradient Background */}
      <View style={styles.backgroundContainer}>
        {/* Base black background */}
        <View style={styles.blackBackground} />
        
        {/* Dynamic random blue gradient accents */}
        <Animated.View style={[styles.gradientAccent, styles.gradientAccent1, gradient1AnimatedStyle]}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'transparent', 'rgba(139, 92, 246, 0.12)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        <Animated.View style={[styles.gradientAccent, styles.gradientAccent2, gradient2AnimatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(37, 99, 235, 0.08)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>
        
        <Animated.View style={[styles.gradientAccent, styles.gradientAccent3, gradient3AnimatedStyle]}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.06)', 'transparent', 'rgba(79, 70, 229, 0.10)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.3, y: 0.2 }}
            end={{ x: 0.8, y: 0.9 }}
          />
        </Animated.View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <Heart 
                size={getResponsiveSize(28, 32, 36, 42)} 
                color="#FFFFFF" 
                fill="#FFFFFF"
                strokeWidth={0}
              />
            </View>
            <Text style={styles.brandText}>eventz</Text>
          </Animated.View>

          {/* Title Section */}
          <Animated.View style={[styles.titleSection, titleAnimatedStyle]}>
            <Text style={styles.mainTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </Animated.View>

          {/* Sign In Buttons */}
          <Animated.View style={[styles.buttonsContainer, buttonAnimatedStyle]}>
            {/* Google Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, styles.googleButton]}
              onPress={onGoogleSignIn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4285F4', '#5A67D8', '#667EEA']}
                style={styles.googleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonGlassOverlay} />
                <View style={styles.buttonContent}>
                  <GoogleIcon size={getResponsiveSize(18, 20, 22, 26)} />
                  <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Apple Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, styles.appleButton]}
              onPress={onAppleSignIn}
              activeOpacity={0.85}
            >
              <View style={styles.appleButtonGlassOverlay} />
              <View style={styles.buttonContent}>
                <AppleIcon 
                  size={getResponsiveSize(18, 20, 22, 26)} 
                  color="#FFFFFF" 
                />
                <Text style={[styles.buttonText, styles.appleButtonText]}>Sign in with Apple</Text>
              </View>
            </TouchableOpacity>

            {/* Email Sign In Option */}
            <TouchableOpacity 
              style={styles.emailOption}
              onPress={onEmailSignIn}
              activeOpacity={0.7}
            >
              <Mail 
                size={getResponsiveSize(16, 18, 20, 22)} 
                color="#9CA3AF" 
                strokeWidth={2}
              />
              <Text style={styles.emailOptionText}>Sign in with Email</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
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
  blackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  gradientAccent: {
    position: 'absolute',
    borderRadius: moderateScale(100),
  },
  gradientAccent1: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.6,
    top: -SCREEN_HEIGHT * 0.2,
    left: -SCREEN_WIDTH * 0.2,
  },
  gradientAccent2: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT * 0.5,
    top: SCREEN_HEIGHT * 0.3,
    right: -SCREEN_WIDTH * 0.3,
  },
  gradientAccent3: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.4,
    bottom: -SCREEN_HEIGHT * 0.1,
    left: SCREEN_WIDTH * 0.2,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSize(24, 28, 32, 40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(40, 50, 60, 80),
  },
  logoContainer: {
    width: getResponsiveSize(60, 70, 80, 100),
    height: getResponsiveSize(60, 70, 80, 100),
    borderRadius: getResponsiveSize(30, 35, 40, 50),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: getResponsiveSize(12, 16, 20, 24),
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
  brandText: {
    fontSize: getResponsiveSize(18, 20, 22, 26),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: getResponsiveSize(1.5, 2, 2.5, 3),
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(50, 60, 70, 90),
  },
  mainTitle: {
    fontSize: getResponsiveSize(28, 32, 36, 42),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: getResponsiveSize(8, 10, 12, 16),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: getResponsiveSize(14, 16, 18, 20),
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Buttons Container
  buttonsContainer: {
    width: '100%',
    maxWidth: getResponsiveSize(320, 360, 400, 480),
    gap: getResponsiveSize(16, 18, 20, 24),
  },

  // Sign In Buttons
  signInButton: {
    borderRadius: getResponsiveSize(24, 28, 32, 38),
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

  // Google Button
  googleButton: {
    height: getResponsiveSize(52, 56, 60, 70),
  },
  googleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Apple Button
  appleButton: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: getResponsiveSize(52, 56, 60, 70),
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButtonGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Button Content
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSize(10, 12, 14, 16),
    zIndex: 2,
  },
  buttonGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Button Text
  buttonText: {
    fontSize: getResponsiveSize(15, 16, 17, 19),
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  googleButtonText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  appleButtonText: {
    color: '#FFFFFF',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: getResponsiveSize(8, 10, 12, 16),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: getResponsiveSize(13, 14, 15, 16),
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginHorizontal: getResponsiveSize(16, 18, 20, 24),
  },

  // Email Option
  emailOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSize(8, 10, 12, 14),
    paddingVertical: getResponsiveSize(16, 18, 20, 24),
    marginTop: getResponsiveSize(8, 10, 12, 16),
  },
  emailOptionText: {
    fontSize: getResponsiveSize(14, 15, 16, 18),
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
}); 