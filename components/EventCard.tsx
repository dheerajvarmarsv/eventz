import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Calendar, MapPin, Users, Image as ImageIcon, Share2, QrCode, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

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
  backgroundImage?: string;
}

interface EventCardProps {
  event: Event;
  theme: any;
  onShare?: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
}

export function EventCard({ event, theme, onShare, onDelete, onLongPress, onPress }: EventCardProps) {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const [isSwipeActive, setIsSwipeActive] = React.useState(false);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 80;
      },
      onPanResponderGrant: () => {
        setIsSwipeActive(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(Math.min(gestureState.dx, SWIPE_THRESHOLD * 1.2));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Trigger delete
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete?.();
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => {
            setIsSwipeActive(false);
          });
        }
      },
    })
  ).current;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.success;
      case 'upcoming':
        return theme.warning;
      case 'completed':
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live Now';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const deleteButtonScale = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Map background image id to actual require source (keep in sync with BackgroundPickerModal)
  const backgroundImages: { [key: string]: any } = {
    blackGreenWatercolor: require('@/assets/images/invites/_Black and Green Watercolor Phone Wallpaper.png'),
    beigeGoldMinimalist: require('@/assets/images/invites/Beige Gold Aesthetic Minimalist Phone Wallpaper.png'),
    beigePinkFlowers: require('@/assets/images/invites/Beige Pink Illustrated Flowers and Leaves Phone Wallpaper .png'),
    blackGoldBrush: require('@/assets/images/invites/Black and Gold Glitter Brush Stroke Phone Wallpaper.png'),
    blackGoldDrops: require('@/assets/images/invites/Black and Gold Glitter Drops Phone Wallpaper.png'),
    blackGoldGlossy: require('@/assets/images/invites/Black and Gold Glossy Phone Wallpaper.png'),
    blackWhiteStarry: require('@/assets/images/invites/Black And White Illustrated Starry Sky Phone Wallpaper.png'),
    blackBlueGoldLuxury: require('@/assets/images/invites/Black Dark Blue Gold Luxury Phone Wallpaper.png'),
    yellowWhiteGreenFlower: require('@/assets/images/invites/Yellow White and Green Aesthetic Flower Wallpaper Phone .png'),
    yellowGreenNature: require('@/assets/images/invites/Yellow and Green Watercolor Illustration Nature View Phone Wallpaper.png'),
    default: require('@/assets/images/invites/default.png'),
    dustyBlueFloral: require('@/assets/images/invites/Dusty Blue Cream Motivational Floral Vintage Phone Wallpaper.png'),
    creamPinkBows: require('@/assets/images/invites/Cream and Pink Watercolor Gentle Illustrative Bows Background Wallpaper Phone Wallpaper.png'),
    creamGreenIllustrative: require('@/assets/images/invites/Cream Green Illustrative Phone Wallpaper.png'),
    creamVintageStorms: require('@/assets/images/invites/Cream Vintage Art Aesthetic Storms Christian Phone Wallpaper.png'),
  };

  const getBackgroundImageSource = (backgroundId?: string) => {
    if (!backgroundId) return null;
    if (backgroundId.startsWith('background_')) {
      const key = backgroundId.replace('background_', '');
      return backgroundImages[key] || null;
    }
    if (backgroundId.startsWith('http')) return { uri: backgroundId };
    return null;
  };

  return (
    <View style={styles.cardContainer}>
      {/* Delete background */}
      <View style={[styles.deleteBackground, { backgroundColor: theme.error || '#FF4444' }]}>
        <Animated.View 
          style={[
            styles.deleteButton,
            {
              transform: [{ scale: deleteButtonScale }],
            },
          ]}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </View>
      
      {/* Main card */}
      <Animated.View
        style={[
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.surface }]}
          onLongPress={onLongPress}
          delayLongPress={500}
          onPress={onPress}
        >
      {(() => {
        const source = getBackgroundImageSource(event.backgroundImage);
        if (source || event.image) {
          const imgSource = source || { uri: event.image! };
          return (
            <ImageBackground source={imgSource} style={styles.image} imageStyle={styles.imageStyle}>
              {/* Subtle bottom fade for readability */}
              <LinearGradient
                colors={[ 'transparent', 'rgba(0,0,0,0.35)' ]}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          );
        }
        return null;
      })()}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {event.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(event.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(event.status) },
              ]}
            >
              {getStatusText(event.status)}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {event.date} at {event.time}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Users size={16} color={theme.primary} />
              <Text style={[styles.statText, { color: theme.text }]}>
                {event.attendees} guests
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <ImageIcon size={16} color={theme.primary} />
              <Text style={[styles.statText, { color: theme.text }]}>
                {event.photos} photos
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${theme.primary}20` }]}
            >
              <QrCode size={16} color={theme.primary} />
            </TouchableOpacity>
            
            {onShare && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${theme.primary}20` }]}
                onPress={onShare}
              >
                <Share2 size={16} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  imageStyle: {
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  details: {
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});