import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X as Close, HelpCircle } from 'lucide-react-native';

// Type definitions reused from CreateEventScreen
interface TextStyle {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: any;
  textAlign: 'left' | 'center' | 'right';
  fontStyle?: 'normal' | 'italic';
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
}

export interface InvitationEventData {
  id: string;
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string;
  locationName?: string;
  description?: string;
  hostName?: string;
  backgroundImage?: string | null;
  titleStyle?: TextStyle;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Static mapping for background images (same keys as BackgroundPickerModal)
const backgroundImages: { [key: string]: any } = {
  blackGreenWatercolor: require('@/assets/images/invites/_Black and Green Watercolor Phone Wallpaper.png'),
  beigeGoldMinimalist: require('@/assets/images/invites/Beige Gold Aesthetic Minimalist Phone Wallpaper.png'),
  beigePinkFlowers: require('@/assets/images/invites/Beige Pink Illustrated Flowers and Leaves Phone Wallpaper .png'),
  blackGoldBrush: require('@/assets/images/invites/Black and Gold Glitter Brush Stroke Phone Wallpaper.png'),
  blackGoldDrops: require('@/assets/images/invites/Black and Gold Glitter Drops Phone Wallpaper.png'),
  blackGoldGlossy: require('@/assets/images/invites/Black and Gold Glossy Phone Wallpaper.png'),
  blackWhiteStarry: require('@/assets/images/invites/Black And White Illustrated Starry Sky Phone Wallpaper.png'),
  blackBlueGoldLuxury: require('@/assets/images/invites/Black Dark Blue Gold Luxury Phone Wallpaper.png'),
  blackPinkBold: require('@/assets/images/invites/Black Pink Bold 3D Phone Wallpaper.png'),
  blueAbstractNight: require('@/assets/images/invites/Blue Abstract Night Star Phone Wallpaper.png'),
  blueSilverY2K: require('@/assets/images/invites/Blue and Silver Aesthetic Y2K Futuristic Love Phone Wallpaper .png'),
  blueGoldMarble: require('@/assets/images/invites/Blue Gold Minimalist Marble Background Phone Wallpaper.png'),
  colorfulGirlyCollage: require('@/assets/images/invites/Colorful Girly Aesthetic Collage Phone Wallpaper.png'),
  colorfulTropicalFlowers: require('@/assets/images/invites/Colorful Illustrative Tropical Flowers Phone Wallpaper.png'),
  colorfulWatercolor: require('@/assets/images/invites/Colorful Watercolor Illustrations Phone Wallpaper.png'),
  creamPinkBows: require('@/assets/images/invites/Cream and Pink Watercolor Gentle Illustrative Bows Background Wallpaper Phone Wallpaper.png'),
  creamGreenIllustrative: require('@/assets/images/invites/Cream Green Illustrative Phone Wallpaper.png'),
  yellowGreenNature: require('@/assets/images/invites/Yellow and Green Watercolor Illustration Nature View Phone Wallpaper.png'),
  yellowWhiteGreenFlower: require('@/assets/images/invites/Yellow White and Green Aesthetic Flower Wallpaper Phone .png'),
  default: require('@/assets/images/invites/default.png'),
};

const getBackgroundImageSource = (backgroundId?: string | null) => {
  if (!backgroundId) return backgroundImages.default;
  if (backgroundId.startsWith('background_')) {
    const key = backgroundId.replace('background_', '');
    return backgroundImages[key] || backgroundImages.default;
  }
  if (backgroundId.startsWith('#')) {
    return backgroundId; // color
  }
  if (backgroundId.startsWith('http')) {
    return { uri: backgroundId };
  }
  return backgroundImages.default;
};

interface InvitationPreviewProps {
  event: InvitationEventData;
}

export const InvitationPreview: React.FC<InvitationPreviewProps> = ({ event }) => {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);

  const backgroundSource = getBackgroundImageSource(event.backgroundImage);

  const getInitials = (name?: string) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('');
  };

  const handleRsvpSelect = (status: string) => setRsvpStatus(status);

  const renderRSVPOption = (
    label: string,
    IconComponent: React.ReactNode,
    statusKey: string,
  ) => (
    <TouchableOpacity
      style={[styles.rsvpOption, rsvpStatus === statusKey && styles.selectedRsvpOption]}
      onPress={() => handleRsvpSelect(statusKey)}
      activeOpacity={0.8}
    >
      {IconComponent}
      <Text style={styles.rsvpOptionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={typeof backgroundSource === 'string' ? undefined : backgroundSource}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      {/* If background is a color string, overlay gradient to mimic image */}
      {typeof backgroundSource === 'string' && (
        <LinearGradient
          colors={[backgroundSource, backgroundSource + 'E6', backgroundSource + 'CC']}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Dark gradient overlay for readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
        style={styles.gradientOverlay}
      />

      <View style={styles.contentWrapper}>
        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: event.titleStyle?.color || '#FFFFFF',
              fontSize: moderateScale(Math.min((event.titleStyle?.fontSize || 24) * 1.1, 35)),
              fontFamily: event.titleStyle?.fontFamily || 'System',
              fontWeight: event.titleStyle?.fontWeight as any,
              textAlign: event.titleStyle?.textAlign || 'center',
              fontStyle: event.titleStyle?.fontStyle || 'normal',
              textDecorationLine: event.titleStyle?.textDecorationLine || 'none',
              lineHeight: moderateScale(Math.min((event.titleStyle?.fontSize || 24) * 1.1, 35) * 1.2),
            },
          ]}
          numberOfLines={event.titleStyle && event.titleStyle.fontSize && event.titleStyle.fontSize > 26 ? 2 : 3}
        >
          {event.title || 'Event Title'}
        </Text>

        {/* Date & Location */}
        {(event.date || event.time) && (
          <Text style={styles.subtitle}>{[event.date, event.time].filter(Boolean).join(' at ')}</Text>
        )}
        {event.locationName && <Text style={styles.subtitle}>{event.locationName}</Text>}
        {event.location && <Text style={styles.location}>{event.location}</Text>}

        {/* Host */}
        {event.hostName && (
          <View style={styles.hostInfo}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>{getInitials(event.hostName)}</Text>
            </View>
            <Text style={styles.hostName}>Hosted by {event.hostName}</Text>
          </View>
        )}

        {/* Description */}
        {event.description && <Text style={styles.description}>{event.description}</Text>}

        {/* RSVP */}
        <View style={styles.rsvpContainer}>
          <View style={styles.rsvpOptions}>
            {renderRSVPOption('Going', <Check size={24} color="white" />, 'going')}
            <View style={styles.rsvpDivider} />
            {renderRSVPOption('Not Going', <Close size={24} color="white" />, 'not_going')}
            <View style={styles.rsvpDivider} />
            {renderRSVPOption('Maybe', <HelpCircle size={24} color="white" />, 'maybe')}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: moderateScale(320, 0.4),
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hostAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hostName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 24,
    textAlign: 'center',
  },
  rsvpContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '100%',
  },
  rsvpOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rsvpOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  selectedRsvpOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  rsvpOptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  rsvpDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
}); 