import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  FlatList,
  Platform,
  Dimensions,
  StatusBar,
  ImageBackground,
  Clipboard,
  Share,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Settings, Copy, Plus, Send, Link } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { ContactPickerModal } from '@/components/ContactPickerModal';
import { InvitationPreview } from '@/components/InvitationPreview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced responsive scaling
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Device type detection
const isTablet = SCREEN_WIDTH >= 768;
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

const getResponsiveSize = (small: number, medium: number, large: number, tablet?: number) => {
  if (isTablet) return tablet || large * 1.2;
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

const getResponsiveSpacing = (base: number) => {
  return moderateScale(base, 0.3);
};

interface Guest {
  id: string;
  name: string;
  status: 'Invited' | 'Going' | 'Not Going' | 'Maybe';
  avatar?: string;
}

// Default guests for demo purposes
const defaultGuests = [
  {
    id: '1',
    name: 'Liam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'Invited',
  },
  {
    id: '2',
    name: 'Olivia',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    status: 'Invited',
  },
];

// Import all invitation background images (same as CreateEventScreen)
const backgroundImages = {
  blackGreenWatercolor: require('@/assets/images/invites/_Black and Green Watercolor Phone Wallpaper.png'),
  beigeGoldMinimalist: require('@/assets/images/invites/Beige Gold Aesthetic Minimalist Phone Wallpaper.png'),
  beigePinkFlowers: require('@/assets/images/invites/Beige Pink Illustrated Flowers and Leaves Phone Wallpaper .png'),
  blackGoldBrush: require('@/assets/images/invites/Black and Gold Glitter Brush Stroke Phone Wallpaper.png'),
  blackGoldDrops: require('@/assets/images/invites/Black and Gold Glitter Drops Phone Wallpaper.png'),
  blackGoldGlossy: require('@/assets/images/invites/Black and Gold Glossy Phone Wallpaper.png'),
  blackWhiteStarry: require('@/assets/images/invites/Black And White Illustrated Starry Sky Phone Wallpaper.png'),
  blackBlueGoldLuxury: require('@/assets/images/invites/Black Dark Blue Gold Luxury Phone Wallpaper.png'),
  blackMinimalistQuotes: require('@/assets/images/invites/Black Minimalist Quotes Phone Wallpaper.png'),
  blackPinkBold: require('@/assets/images/invites/Black Pink Bold 3D Phone Wallpaper.png'),
  blueAbstractNight: require('@/assets/images/invites/Blue Abstract Night Star Phone Wallpaper.png'),
  blueSilverY2K: require('@/assets/images/invites/Blue and Silver Aesthetic Y2K Futuristic Love Phone Wallpaper .png'),
  blueGoldMarble: require('@/assets/images/invites/Blue Gold Minimalist Marble Background Phone Wallpaper.png'),
  colorfulGirlyCollage: require('@/assets/images/invites/Colorful Girly Aesthetic Collage Phone Wallpaper.png'),
  colorfulTropicalFlowers: require('@/assets/images/invites/Colorful Illustrative Tropical Flowers Phone Wallpaper.png'),
  colorfulWatercolor: require('@/assets/images/invites/Colorful Watercolor Illustrations Phone Wallpaper.png'),
  creamPinkBows: require('@/assets/images/invites/Cream and Pink Watercolor Gentle Illustrative Bows Background Wallpaper Phone Wallpaper.png'),
  creamGreenIllustrative: require('@/assets/images/invites/Cream Green Illustrative Phone Wallpaper.png'),
  default: require('@/assets/images/invites/default.png'),
};

// Helper function to get background image source (same logic as CreateEventScreen)
const getBackgroundImageSource = (backgroundId: string | null) => {
  if (!backgroundId) return null;
  
  // Handle new background format (background_imageKey)
  if (backgroundId.startsWith('background_')) {
    const imageKey = backgroundId.replace('background_', '');
    return backgroundImages[imageKey as keyof typeof backgroundImages] || null;
  }
  
  // Handle legacy formats for backward compatibility
  if (backgroundId.startsWith('#')) {
    return backgroundId; // Color
  }
  
  if (backgroundId.startsWith('http')) {
    return { uri: backgroundId }; // URL
  }
  
  return null;
};

export default function ShareInviteScreen() {
  console.log('🔥 ShareInviteScreen mounted');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  console.log('📊 Navigation params:', params);
  
  // Parse event data from navigation params
  const eventData = params.event ? JSON.parse(params.event as string) : null;
  
  console.log('🎉 Parsed event data:', eventData);
  
  const [guests, setGuests] = useState<Guest[]>([]);

  // Load saved guests for this event
  useEffect(() => {
    const loadGuests = async () => {
      if (!eventData?.id) return;
      try {
        const saved = await AsyncStorage.getItem(`@guests:${eventData.id}`);
        if (saved) setGuests(JSON.parse(saved));
      } catch (err) {
        console.warn('Failed to load guests', err);
      }
    };
    loadGuests();
  }, [eventData?.id]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate a unique slug for the event
  const generateSlug = (title: string, id: string) => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${baseSlug}-${id.slice(-6)}`;
  };

  const slug = eventData?.title && eventData?.id
    ? generateSlug(eventData.title, eventData.id)
    : `event-${Date.now().toString().slice(-6)}`;

  const publicLink = `https://eventz.app/invite/${slug}`;

  const handleShare = async (method: 'message' | 'mail' | 'share' | 'copy') => {
    const subject = `You're invited to ${eventData?.title}!`;
    const message = `You're invited to ${eventData?.title}! View the details and RSVP here: ${publicLink}`;

    try {
      if (method === 'copy') {
        Clipboard.setString(publicLink);
        Alert.alert('Copied!', 'Invite link copied to clipboard.');
        return;
      }

      if (method === 'message') {
        const smsURL = Platform.select({
          ios: `sms:&body=${encodeURIComponent(message)}`,
          android: `sms:?body=${encodeURIComponent(message)}`,
        });
        await Linking.openURL(smsURL || '');
        return;
      }

      if (method === 'mail') {
        const safeSubject = encodeURIComponent(subject).replace(/'/g, '%27');
        const safeBody = encodeURIComponent(message).replace(/'/g, '%27');
        const mailURL = `mailto:?subject=${safeSubject}&body=${safeBody}`;
        await Linking.openURL(mailURL);
        return;
      }

      // Generic share sheet
      await Share.share({ message, title: subject });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Could not share the invitation.');
    }
  };

  const handleSelectContacts = (selected: any[]) => {
    const newGuests: Guest[] = selected.map(c => ({
      id: c.id,
      name: c.name,
      status: 'Invited',
      avatar: c.thumbnail,
    }));

    // Avoid adding duplicates
    setGuests(prev => {
      const existingIds = new Set(prev.map(g => g.id));
      const filteredNew = newGuests.filter(g => !existingIds.has(g.id));
      const updated = [...prev, ...filteredNew];
      // Persist
      (async () => {
        try {
          await AsyncStorage.setItem(`@guests:${eventData.id}`, JSON.stringify(updated));
          // update attendees count in events array for home screen
          const eventsJson = await AsyncStorage.getItem('@events');
          if (eventsJson) {
            const events = JSON.parse(eventsJson);
            const idx = events.findIndex((e:any)=> e.id===eventData.id);
            if (idx!==-1) {
              events[idx].attendees = updated.length;
              await AsyncStorage.setItem('@events', JSON.stringify(events));
            }
          }
        } catch(err){ console.warn('Failed to save guests', err);} 
      })();
      return updated;
    });

    Alert.alert('Guests Invited', `${selected.length} guest(s) have been invited.`);
  };

  // Handle close - navigate back to events tab
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // Handle guest resend
  const handleResend = (guestId: string, guestName: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Resent!',
        `Invitation resent to ${guestName}.`,
        [{ text: 'OK' }]
      );
    }, 1000);
  };

  // Handle add guest
  const handleAddGuest = () => {
    Alert.alert(
      'Add Guest',
      'Guest invitation feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  // Handle settings
  const handleSettings = () => {
    Alert.alert(
      'Settings',
      'Event settings feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  // Render guest item
  const renderGuestItem = ({ item }: { item: Guest }) => (
    <View style={styles.guestCard}>
      <View style={styles.guestInfo}>
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.guestAvatar}
          defaultSource={require('@/assets/images/icon.png')}
        />
        <View style={styles.guestDetails}>
          <Text style={styles.guestName}>{item.name}</Text>
          <Text style={styles.guestStatus}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.resendButton, isLoading && styles.resendButtonDisabled]}
        onPress={() => handleResend(item.id, item.name)}
        disabled={isLoading}
      >
        <Text style={styles.resendButtonText}>
          {isLoading ? 'Sending...' : 'Resend'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Get event image for display
  const getEventImage = () => {
    if (!eventData) return backgroundImages.default;
    
    const backgroundSource = getBackgroundImageSource(eventData.backgroundImage);
    
    // If it's an image source (object or require), return it
    if (backgroundSource && typeof backgroundSource === 'object') {
      return backgroundSource;
    }
    
    // If no background or it's a color, use default
    return backgroundImages.default;
  };

  // Check if background is a color
  const isColorBackground = () => {
    if (!eventData?.backgroundImage) return false;
    return eventData.backgroundImage.startsWith('#');
  };

  // Get background color if it's a color background
  const getBackgroundColor = () => {
    if (!eventData?.backgroundImage) return null;
    if (eventData.backgroundImage.startsWith('#')) {
      return eventData.backgroundImage;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1b23" translucent />
      
      {/* Background */}
      <LinearGradient
        colors={['#1a1b23', '#2d2e3a', '#1a1b23']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <BlurView intensity={80} tint="dark" style={styles.headerButtonBlur} />
            <X size={getResponsiveSize(22, 24, 26)} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <BlurView intensity={80} tint="dark" style={styles.headerButtonBlur} />
            <Settings size={getResponsiveSize(20, 22, 24)} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <FlatList
          ListHeaderComponent={
            <>
              {/* Dynamic Invitation Preview */}
              {eventData && (
                <InvitationPreview event={eventData as any} />
              )}

              {/* Share Options Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Share Invitation</Text>
                <View style={styles.shareButtonsContainer}>
                  <ShareButton icon={Send} label="Message" onPress={() => handleShare('message')} theme={theme} />
                  <ShareButton icon={Link} label="Share" onPress={() => handleShare('share')} theme={theme} />
                  <ShareButton icon={Copy} label="Copy" onPress={() => handleShare('copy')} theme={theme} />
                </View>
              </View>

              {/* Invite Individuals Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Invite Individuals</Text>
                <TouchableOpacity 
                  style={styles.addGuestContainer}
                  onPress={() => setShowContactPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addGuestText}>Choose from contacts</Text>
                  <View style={styles.addButton}>
                    <Plus size={getResponsiveSize(18, 19, 20)} color="#FFFFFF" strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Guest List Header */}
              {guests.length > 0 && <Text style={styles.guestListTitle}>Guest List</Text>}
            </>
          }
          data={guests}
          keyExtractor={(item) => item.id}
          renderItem={renderGuestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          style={styles.scrollView}
        />

        <ContactPickerModal 
          visible={showContactPicker}
          onClose={() => setShowContactPicker(false)}
          onSelect={handleSelectContacts}
          theme={theme}
        />
      </SafeAreaView>
    </View>
  );
}

const ShareButton = ({ icon: Icon, label, onPress, theme }: any) => (
  <TouchableOpacity style={styles.shareButton} onPress={onPress}>
    <View style={[styles.shareButtonIconContainer, { backgroundColor: theme.primary + '20' }]}>
      <Icon size={22} color={theme.primary} />
    </View>
    <Text style={[styles.shareButtonLabel, { color: theme.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b23',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(20),
    paddingTop: getResponsiveSpacing(Platform.OS === 'ios' ? 8 : 16),
    paddingBottom: getResponsiveSpacing(8),
  },
  headerButton: {
    width: getResponsiveSize(44, 46, 48),
    height: getResponsiveSize(44, 46, 48),
    borderRadius: getResponsiveSize(22, 23, 24),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerButtonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(22, 23, 24),
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: getResponsiveSpacing(32),
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: getResponsiveSpacing(20),
  },
  imageWrapper: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  eventImage: {
    width: getResponsiveSize(220, 240, 260),
    height: getResponsiveSize(280, 320, 360),
    justifyContent: 'flex-end',
  },
  eventImageStyle: {
    borderRadius: getResponsiveSize(20, 22, 24),
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: getResponsiveSize(80, 90, 100),
    justifyContent: 'flex-end',
    paddingHorizontal: getResponsiveSpacing(16),
    paddingBottom: getResponsiveSpacing(16),
  },
  titleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    borderBottomLeftRadius: getResponsiveSize(20, 22, 24),
    borderBottomRightRadius: getResponsiveSize(20, 22, 24),
  },
  eventTitle: {
    fontSize: getResponsiveSize(18, 20, 22),
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: getResponsiveSize(22, 24, 26),
  },
  card: {
    backgroundColor: '#23242a',
    borderRadius: getResponsiveSize(18, 20, 22),
    padding: getResponsiveSpacing(18),
    marginHorizontal: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSpacing(14),
  },
  cardTitle: {
    fontSize: getResponsiveSize(16, 17, 18),
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  switch: {
    transform: [{ scale: getResponsiveSize(0.9, 1, 1.1) }],
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181a20',
    borderRadius: getResponsiveSize(12, 14, 16),
    paddingHorizontal: getResponsiveSpacing(14),
    paddingVertical: getResponsiveSpacing(12),
    marginBottom: getResponsiveSpacing(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkText: {
    color: '#9ca3af',
    flex: 1,
    fontSize: getResponsiveSize(14, 15, 16),
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  copyButton: {
    backgroundColor: '#374151',
    width: getResponsiveSize(32, 34, 36),
    height: getResponsiveSize(32, 34, 36),
    borderRadius: getResponsiveSize(16, 17, 18),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: getResponsiveSpacing(8),
  },
  addGuestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181a20',
    borderRadius: getResponsiveSize(12, 14, 16),
    paddingHorizontal: getResponsiveSpacing(14),
    paddingVertical: getResponsiveSpacing(12),
    marginBottom: getResponsiveSpacing(8),
    marginTop: getResponsiveSpacing(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  addGuestText: {
    color: '#9ca3af',
    flex: 1,
    fontSize: getResponsiveSize(14, 15, 16),
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#374151',
    width: getResponsiveSize(32, 34, 36),
    height: getResponsiveSize(32, 34, 36),
    borderRadius: getResponsiveSize(16, 17, 18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDescription: {
    color: '#6b7280',
    fontSize: getResponsiveSize(12, 13, 14),
    fontFamily: 'Inter-Regular',
    lineHeight: getResponsiveSize(16, 18, 20),
  },
  guestListTitle: {
    fontSize: getResponsiveSize(20, 22, 24),
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(12),
    marginTop: getResponsiveSpacing(8),
  },
  guestCard: {
    backgroundColor: '#23242a',
    borderRadius: getResponsiveSize(18, 20, 22),
    padding: getResponsiveSpacing(16),
    marginHorizontal: getResponsiveSpacing(16),
    marginBottom: getResponsiveSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  guestAvatar: {
    width: getResponsiveSize(44, 48, 52),
    height: getResponsiveSize(44, 48, 52),
    borderRadius: getResponsiveSize(22, 24, 26),
    marginRight: getResponsiveSpacing(12),
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guestDetails: {
    flex: 1,
  },
  guestName: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: getResponsiveSize(15, 16, 17),
    marginBottom: getResponsiveSpacing(2),
  },
  guestStatus: {
    color: '#6b7280',
    fontSize: getResponsiveSize(12, 13, 14),
    fontFamily: 'Inter-Regular',
  },
  resendButton: {
    backgroundColor: '#22c55e',
    borderRadius: getResponsiveSize(18, 20, 22),
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(8),
    ...Platform.select({
      ios: {
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resendButtonDisabled: {
    backgroundColor: '#6b7280',
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontSize: getResponsiveSize(13, 14, 15),
  },
  footer: {
    backgroundColor: '#181a20',
    paddingVertical: getResponsiveSpacing(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  footerIndicator: {
    width: getResponsiveSize(100, 120, 140),
    height: getResponsiveSize(4, 5, 6),
    backgroundColor: '#374151',
    borderRadius: getResponsiveSize(2, 2.5, 3),
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: getResponsiveSpacing(16),
  },
  shareButton: {
    alignItems: 'center',
    width: 70,
  },
  shareButtonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareButtonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  approveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approveText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
}); 