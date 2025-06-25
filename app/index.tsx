import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTheme } from '@/contexts/ThemeContext';

export default function IndexPage() {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();
  const { theme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [hasCompletedOnboarding, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});