import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, MapPin, Users, Star, Share2 } from 'lucide-react-native';
import { EventCard } from '@/components/EventCard';
import { CreateEventScreen } from '@/components/CreateEventScreen';
import { useTheme } from '@/contexts/ThemeContext';

export default function EventsScreen() {
  const { theme } = useTheme();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Sarah\'s Birthday Party',
      date: 'Sat, 25 January 2025',
      time: '7:00 PM',
      location: 'Central Park Pavilion, 830 5th Ave, New York, NY 10065',
      attendees: 24,
      photos: 156,
      status: 'active' as const,
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    },
    {
      id: '2',
      title: 'Company Annual Meeting',
      date: 'Thu, 30 January 2025',
      time: '2:00 PM',
      location: 'The Grand Ballroom, 123 Main St, Downtown',
      attendees: 45,
      photos: 12,
      status: 'upcoming' as const,
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    },
  ]);

  const stats = [
    { icon: Calendar, label: 'Events Hosted', value: events.length.toString() },
    { icon: Users, label: 'Total Attendees', value: events.reduce((sum, event) => sum + event.attendees, 0).toString() },
    { icon: Star, label: 'Photos Shared', value: events.reduce((sum, event) => sum + event.photos, 0).toString() },
  ];

  const handleCreateEvent = (eventData: any) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      attendees: 0,
      photos: 0,
      status: 'upcoming' as const,
    };
    
    setEvents(prev => [newEvent, ...prev]);
    setShowCreateModal(false);
    
    // Show success message
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Event Created!',
        `${eventData.title} has been created successfully. You can now share it with your guests.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleShareEvent = (event: any) => {
    // In a real app, this would generate a shareable link
    const shareText = `Join me at ${event.title} on ${event.date} at ${event.time}!\nLocation: ${event.location}`;
    
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Share Event',
        shareText,
        [
          { text: 'Copy Link', onPress: () => console.log('Copy link') },
          { text: 'Share QR Code', onPress: () => console.log('Share QR') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Welcome back!
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ready to create memorable moments?
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: theme.surface }]}
            >
              <stat.icon size={20} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Events
            </Text>
            {events.length > 0 && (
              <TouchableOpacity
                style={[styles.shareAllButton, { backgroundColor: theme.surface }]}
                onPress={() => handleShareEvent(events[0])}
              >
                <Share2 size={16} color={theme.primary} />
                <Text style={[styles.shareAllText, { color: theme.primary }]}>
                  Share
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              theme={theme}
              onShare={() => handleShareEvent(event)}
            />
          ))}
        </View>

        {events.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No events yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create your first event to start capturing memories
            </Text>
            <TouchableOpacity
              style={[styles.createFirstButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.createFirstButtonText}>
                Create Your First Event
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CreateEventScreen
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleCreateEvent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  shareAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  shareAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});