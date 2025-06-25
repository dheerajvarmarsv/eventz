import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const itemSize = (width - 60) / 2; // 20px margin on each side + 20px gap between items

interface Photo {
  id: string;
  url: string;
  eventTitle: string;
  timestamp: string;
  author: string;
  likes: number;
  comments: number;
}

interface PhotoGridProps {
  photos: Photo[];
  theme: any;
}

export function PhotoGrid({ photos, theme }: PhotoGridProps) {
  return (
    <View style={styles.container}>
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id}
          style={[
            styles.photoItem,
            {
              marginLeft: index % 2 === 0 ? 0 : 10,
              marginRight: index % 2 === 0 ? 10 : 0,
            },
          ]}
        >
          <Image source={{ uri: photo.url }} style={styles.photo} />
          <View style={styles.overlay}>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Heart size={14} color="#FFFFFF" />
                <Text style={styles.statText}>{photo.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <MessageCircle size={14} color="#FFFFFF" />
                <Text style={styles.statText}>{photo.comments}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.info, { backgroundColor: theme.surface }]}>
            <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
              {photo.eventTitle}
            </Text>
            <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
              by {photo.author}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  photoItem: {
    width: itemSize,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: itemSize,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  info: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});