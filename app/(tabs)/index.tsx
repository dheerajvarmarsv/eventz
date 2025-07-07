import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, Users, Star, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventCard } from '@/components/EventCard';
import { CreateEventScreen } from '@/components/CreateEventScreen';
import { useTheme } from '@/contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  photos: number;
  status: 'active' | 'upcoming' | 'completed';
  image?: string;
}

export default function EventsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const defaultEvents: Event[] = [
    {
      id: '1',
      title: "Sarah's Birthday Party",
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
  ];

  const [events, setEvents] = useState<Event[]>([]);
  const isInitialLoad = useRef(true);
  const isNavigating = useRef(false);

  // Load events when screen comes into focus (including on app start)
  useFocusEffect(
    React.useCallback(() => {
      const loadEvents = async () => {
        try {
          const stored = await AsyncStorage.getItem('@events');
          if (stored) {
            setEvents(JSON.parse(stored));
          } else {
            // Preload default demo events for first-time users
            setEvents(defaultEvents);
          }
        } catch (err) {
          console.error('[EventsScreen] Failed to load events from storage', err);
          setEvents(defaultEvents);
        }
      };
      
      loadEvents();
    }, [])
  );

  // Persist events whenever they change, but skip the very first load.
  useEffect(() => {
    // If it's the initial render and events are still empty, do nothing.
    // When useFocusEffect loads events, this will run again.
    if (isInitialLoad.current && events.length === 0) {
      return;
    }
    
    // If it's the initial load (from focus effect), just mark it as complete and don't save.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // For all subsequent changes (e.g., deletions), save to storage.
    (async () => {
      try {
        await AsyncStorage.setItem('@events', JSON.stringify(events));
        console.log('✅ Events updated in storage.');
      } catch (err) {
        console.error('[EventsScreen] Failed to save events to storage', err);
      }
    })();
  }, [events]);

  const stats = [
    { icon: Calendar, label: 'Events Hosted', value: events.length.toString() },
    { icon: Users, label: 'Total Attendees', value: events.reduce((sum, event) => sum + event.attendees, 0).toString() },
    { icon: Star, label: 'Photos Shared', value: events.reduce((sum, event) => sum + event.photos, 0).toString() },
  ];

  const handleCreateEvent = (eventData: any) => {
    // Event creation now happens in ShareInviteScreen
    // Just close the modal here
    setShowCreateModal(false);
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

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleOpenEvent = (event: any) => {
    if (isNavigating.current) return; // throttle
    isNavigating.current = true;
    try {
      router.push({ pathname: '/share-invite', params: { event: JSON.stringify(event) } } as any);
    } catch (err) {
      console.error('Failed to navigate to share screen', err);
    } finally {
      // Reset flag after navigation stack settles
      setTimeout(() => { isNavigating.current = false; }, 800);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      // Remove from events array
      const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
      setEvents(updatedEvents);
      
      // Save to storage
      await AsyncStorage.setItem('@events', JSON.stringify(updatedEvents));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setEventToDelete(null);
      
      // Show success message
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Event Deleted',
          `${eventToDelete.title} has been deleted successfully.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert(
        'Error',
        'Failed to delete event. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const cancelDeleteEvent = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
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
              onPress={() => handleOpenEvent(event)}
              onShare={() => handleShareEvent(event)}
              onDelete={() => handleDeleteEvent(event)}
              onLongPress={() => handleDeleteEvent(event)}
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
      
      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteEvent}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.deleteModalTitle, { color: theme.text }]}>
              Delete Event
            </Text>
            <Text style={[styles.deleteModalMessage, { color: theme.textSecondary }]}>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={cancelDeleteEvent}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: theme.error || '#FF4444' }]}
                onPress={confirmDeleteEvent}
              >
                <Text style={styles.deleteButtonText}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModal: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  deleteModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});