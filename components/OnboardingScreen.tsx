import React, { useState } from 'react';
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
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { AnimatedOnboardingScreen } from './AnimatedOnboardingScreen';
import { CircularLoadingScreen } from './CircularLoadingScreen';
import { SignInScreen } from './SignInScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Advanced device detection for optimal scaling
const getDeviceType = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  if (SCREEN_WIDTH < 375) return 'small';
  if (SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414) return 'medium';
  if (SCREEN_WIDTH >= 414 && aspectRatio > 2.1) return 'large';
  if (SCREEN_WIDTH >= 428) return 'extraLarge';
  return 'medium';
};

const deviceType = getDeviceType();
const isSmallDevice = deviceType === 'small';
const isLargeDevice = deviceType === 'large';

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



interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [showSignIn, setShowSignIn] = useState(false);

  const handleLoadingComplete = () => {
    setShowSignIn(true);
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in logic
    console.log('Google sign-in pressed');
    onComplete();
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple sign-in logic
    console.log('Apple sign-in pressed');
    onComplete();
  };

  const handleEmailSignIn = () => {
    // TODO: Implement email sign-in logic
    console.log('Email sign-in pressed');
    onComplete();
  };

  if (showSignIn) {
    return (
      <SignInScreen
        onGoogleSignIn={handleGoogleSignIn}
        onAppleSignIn={handleAppleSignIn}
        onEmailSignIn={handleEmailSignIn}
      />
    );
  }

  return <CircularLoadingScreen onComplete={handleLoadingComplete} />;
}

// Original static onboarding (kept for reference)
export function StaticOnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const handleAppleSignIn = () => {
    onComplete();
  };

  const handleGoogleSignIn = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Chalky noisy background with layered textures */}
      <View style={styles.backgroundContainer}>
        {/* Base gradient layer */}
        <LinearGradient
          colors={['#1a237e', '#283593', '#3949ab', '#303f9f', '#1a237e']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.25, 0.5, 0.75, 1]}
        />
        
        {/* Film grain layer 1 - Heavy texture */}
        <LinearGradient
          colors={[
            'rgba(100, 149, 237, 0.35)',
            'rgba(0, 0, 0, 0.45)',
            'rgba(135, 206, 250, 0.28)',
            'rgba(0, 0, 0, 0.52)',
            'rgba(70, 130, 180, 0.40)',
            'rgba(0, 0, 0, 0.38)',
            'rgba(123, 167, 255, 0.45)',
            'rgba(0, 0, 0, 0.48)',
            'rgba(106, 156, 255, 0.32)',
            'rgba(0, 0, 0, 0.55)',
            'rgba(89, 142, 255, 0.38)',
            'rgba(0, 0, 0, 0.42)',
          ]}
          style={[styles.noiseLayer, { opacity: 1.0 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Film grain layer 2 - Cross pattern */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.60)',
            'rgba(95, 158, 160, 0.25)',
            'rgba(0, 0, 0, 0.65)',
            'rgba(176, 196, 222, 0.35)',
            'rgba(0, 0, 0, 0.55)',
            'rgba(119, 136, 153, 0.40)',
            'rgba(0, 0, 0, 0.70)',
            'rgba(138, 164, 255, 0.30)',
            'rgba(0, 0, 0, 0.58)',
            'rgba(147, 171, 255, 0.45)',
          ]}
          style={[styles.noiseLayer, { opacity: 1.0 }]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Film grain layer 3 - Random speckles */}
        <LinearGradient
          colors={[
            'rgba(65, 105, 225, 0.50)',
            'rgba(0, 0, 0, 0.75)',
            'rgba(72, 118, 255, 0.35)',
            'rgba(0, 0, 0, 0.65)',
            'rgba(58, 95, 205, 0.55)',
            'rgba(0, 0, 0, 0.80)',
            'rgba(83, 129, 255, 0.40)',
            'rgba(0, 0, 0, 0.70)',
            'rgba(76, 122, 255, 0.60)',
            'rgba(0, 0, 0, 0.85)',
          ]}
          style={[styles.noiseLayer, { opacity: 1.0 }]}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 0.8, y: 0.9 }}
        />
        
        {/* Final grain overlay - Very pronounced */}
        <LinearGradient
          colors={[
            'rgba(91, 144, 255, 0.65)',
            'rgba(108, 161, 255, 0.25)',
            'rgba(0, 0, 0, 0.75)',
            'rgba(115, 168, 255, 0.45)',
            'rgba(0, 0, 0, 0.85)',
            'rgba(98, 151, 255, 0.70)',
            'rgba(0, 0, 0, 0.65)',
            'rgba(122, 175, 255, 0.35)',
            'rgba(0, 0, 0, 0.90)',
            'rgba(105, 158, 255, 0.55)',
          ]}
          style={[styles.dustOverlay]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Main Content - Perfectly Centered */}
        <View style={styles.mainContent}>
          {/* Logo and Title Section - Combined */}
          <Animated.View 
            entering={ZoomIn.delay(200).duration(800)}
            style={styles.heroSection}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Heart 
                  size={moderateScale(20)} 
                  color="#FFFFFF" 
                  fill="#FFFFFF"
                  strokeWidth={0}
                />
              </View>
              <Text style={styles.brandText}>eventz</Text>
            </View>

            {/* Title Section with Liquid Glass Effect */}
            <Animated.View 
              entering={FadeIn.delay(400).duration(600)}
              style={styles.titleContainer}
            >
              {/* Glass overlay for enhanced effect */}
              <View style={styles.titleGlassOverlay} />
              <View style={styles.titleTextContainer}>
                <Text style={styles.mainTitle}>Delightful Events</Text>
                <View style={styles.gradientTextContainer}>
                  <LinearGradient
                    colors={['#3B82F6', '#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    <Text style={[styles.mainTitle, styles.gradientText]}>Start Here</Text>
                  </LinearGradient>
                </View>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Buttons Section */}
          <Animated.View 
            entering={SlideInDown.delay(600).duration(500)}
            style={styles.buttonsContainer}
          >
            {/* Apple Sign In Button */}
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
            >
              {/* Glass overlay for button */}
              <View style={styles.buttonGlassOverlay} />
              <View style={styles.buttonContent}>
                <AppleIcon 
                  size={moderateScale(isSmallDevice ? 18 : 20)} 
                  color="#FFFFFF" 
                />
                <Text style={styles.buttonText}>Sign in with Apple</Text>
              </View>
            </TouchableOpacity>

            {/* Google Sign In Button */}
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              {/* Glass overlay for button */}
              <View style={styles.buttonGlassOverlay} />
              <View style={styles.buttonContent}>
                <GoogleIcon size={moderateScale(isSmallDevice ? 18 : 20)} />
                <Text style={styles.buttonText}>Sign in with Google</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom spacer for perfect balance */}
        <View style={styles.bottomSpacer} />
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noiseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dustOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  
  // Hero Section - Logo and Title Combined
  heroSection: {
    alignItems: 'center',
    gap: verticalScale(isSmallDevice ? 20 : isLargeDevice ? 30 : 25),
  },
  logoContainer: {
    alignItems: 'center',
    gap: verticalScale(8),
  },
  logoBackground: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  brandText: {
    fontSize: moderateScale(isSmallDevice ? 14 : 16),
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: scale(1),
  },

  // Main Content - Perfectly centered between logo and bottom
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(0),
    paddingTop: verticalScale(isSmallDevice ? 40 : isLargeDevice ? 60 : 50),
  },
  
  titleContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(isSmallDevice ? 40 : isLargeDevice ? 55 : 48),
    // Liquid Glass Effect for Title
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(20),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  titleGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: moderateScale(22),
  },
  titleTextContainer: {
    alignItems: 'center',
    gap: verticalScale(isSmallDevice ? 8 : 12),
    zIndex: 1,
  },
  gradientTextContainer: {
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  gradientBackground: {
    paddingHorizontal: scale(4),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  gradientText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mainTitle: {
    fontSize: moderateScale(isSmallDevice ? 42 : isLargeDevice ? 50 : 46),
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: moderateScale(isSmallDevice ? 50 : isLargeDevice ? 58 : 54),
    letterSpacing: scale(-0.6),
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    zIndex: 1,
  },

  // Buttons Section
  buttonsContainer: {
    width: '100%',
    gap: verticalScale(12),
    alignItems: 'center',
  },
  signInButton: {
    // Liquid Glass Button Effect - Refined Size
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(isSmallDevice ? 12 : 14),
    paddingHorizontal: scale(20),
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(24),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
    zIndex: 1,
  },

  buttonText: {
    fontSize: moderateScale(isSmallDevice ? 14 : 15),
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: scale(0.2),
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Bottom spacer for perfect visual balance
  bottomSpacer: {
    height: verticalScale(isSmallDevice ? 30 : isLargeDevice ? 50 : 40),
  },
});