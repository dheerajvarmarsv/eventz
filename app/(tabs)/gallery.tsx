import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Heart, MessageCircle, Share, Download } from 'lucide-react-native';
import { PhotoGrid } from '@/components/PhotoGrid';
import { FilterModal } from '@/components/FilterModal';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const { theme } = useTheme();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const photos = [
    {
      id: '1',
      url: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
      eventTitle: 'Sarah\'s Birthday Party',
      timestamp: '2025-01-20T19:30:00Z',
      author: 'Mike Johnson',
      likes: 24,
      comments: 8,
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      eventTitle: 'Company Meeting',
      timestamp: '2025-01-18T14:15:00Z',
      author: 'Emma Davis',
      likes: 12,
      comments: 3,
    },
    {
      id: '3',
      url: 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg',
      eventTitle: 'Weekend BBQ',
      timestamp: '2025-01-15T16:45:00Z',
      author: 'Alex Chen',
      likes: 18,
      comments: 5,
    },
    {
      id: '4',
      url: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg',
      eventTitle: 'Wedding Reception',
      timestamp: '2025-01-12T20:00:00Z',
      author: 'Lisa Wilson',
      likes: 45,
      comments: 12,
    },
    {
      id: '5',
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      eventTitle: 'Concert Night',
      timestamp: '2025-01-10T21:30:00Z',
      author: 'David Brown',
      likes: 33,
      comments: 7,
    },
    {
      id: '6',
      url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
      eventTitle: 'Art Gallery Opening',
      timestamp: '2025-01-08T18:00:00Z',
      author: 'Sophie Taylor',
      likes: 27,
      comments: 9,
    },
  ];

  const filterOptions = [
    { id: 'all', label: 'All Photos', count: photos.length },
    { id: 'recent', label: 'Recent', count: 12 },
    { id: 'popular', label: 'Most Liked', count: 8 },
    { id: 'mine', label: 'My Photos', count: 15 },
  ];

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Photo Gallery
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.surface }]}
          >
            <Search size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.surface }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterTab,
              {
                backgroundColor: selectedFilter === option.id ? theme.primary : theme.surface,
              }
            ]}
            onPress={() => setSelectedFilter(option.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: selectedFilter === option.id ? '#FFFFFF' : theme.text,
                }
              ]}
            >
              {option.label}
            </Text>
            <View
              style={[
                styles.filterBadge,
                {
                  backgroundColor: selectedFilter === option.id ? 'rgba(255,255,255,0.3)' : theme.primary,
                }
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  {
                    color: selectedFilter === option.id ? '#FFFFFF' : '#FFFFFF',
                  }
                ]}
              >
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoGrid photos={photos} theme={theme} />
        
        <View style={styles.stats}>
          <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>1,247</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Photos
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Events
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>89</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Contributors
            </Text>
          </View>
        </View>

        <View style={[styles.recentActivity, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Activity
          </Text>
          {photos.slice(0, 3).map((photo) => (
            <View key={photo.id} style={[styles.activityItem, { borderBottomColor: theme.border }]}>
              <Image source={{ uri: photo.url }} style={styles.activityImage} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: theme.text }]}>
                  {photo.author} added a photo to {photo.eventTitle}
                </Text>
                <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                  2 hours ago
                </Text>
              </View>
              <View style={styles.activityActions}>
                <TouchableOpacity style={styles.activityAction}>
                  <Heart size={16} color={theme.textSecondary} />
                  <Text style={[styles.activityActionText, { color: theme.textSecondary }]}>
                    {photo.likes}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        options={filterOptions}
        selectedFilter={selectedFilter}
        onSelectFilter={handleFilterSelect}
        theme={theme}
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabs: {
    maxHeight: 60,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  recentActivity: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  activityActions: {
    marginLeft: 12,
  },
  activityAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});