import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreatingEventScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const eventDataString = params.eventData as string;

  useEffect(() => {
    const createEvent = async () => {
      if (!eventDataString) {
        Alert.alert('Error', 'No event data found.', [{ text: 'OK', onPress: () => router.back() }]);
        return;
      }

      try {
        const eventData = JSON.parse(eventDataString);
        const eventId = Date.now().toString();

        console.log('📝 Creating event in CreatingEventScreen...');

        const finalEventForStorage = {
          // Core identifiers
          id: eventId,
          title: eventData.title,

          // Display date/time strings for the card
          date: eventData.date ? new Date(eventData.date).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
          }) : '',
          time: eventData.time ? new Date(eventData.time).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
          }) : '',

          // Location
          location: eventData.locationName || eventData.location || '',

          // Invitation preview fields
          backgroundImage: eventData.backgroundImage || null,
          description: eventData.description || '',
          hostName: eventData.hostName || '',
          titleStyle: eventData.titleStyle,

          // Stats
          attendees: 0,
          photos: 0,
          status: 'upcoming' as const,
        };
        
        const finalEventForInvitation = {
          ...eventData,
          id: eventId,
        };

        console.log('💾 Saving to storage:', finalEventForStorage);
        
        const existingEventsJson = await AsyncStorage.getItem('@events');
        const existingEvents = existingEventsJson ? JSON.parse(existingEventsJson) : [];
        const updatedEvents = [finalEventForStorage, ...existingEvents];
        await AsyncStorage.setItem('@events', JSON.stringify(updatedEvents));

        console.log('✅ Event created successfully. Resetting stack to share screen...');

        // Reset the navigation stack to provide a clean back-to-home behavior
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)', params: undefined },
            { name: 'share-invite', params: { event: JSON.stringify(finalEventForInvitation) } },
          ] as any, // Use 'as any' to bypass strict type checking for this complex action
        });

      } catch (error) {
        console.error('❌ Error creating event:', error);
        Alert.alert(
          'Error',
          'Failed to create event. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    };

    // Delay allows the modal transition to complete before heavy work
    setTimeout(createEvent, 500);

  }, [eventDataString, router, navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.content}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={[styles.loadingText, { color: '#FFFFFF' }]}>Creating your event...</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
}); 