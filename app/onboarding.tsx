import React from 'react';
import { router } from 'expo-router';
import { OnboardingScreen } from '@/components/OnboardingScreen';

export default function OnboardingPage() {
  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}