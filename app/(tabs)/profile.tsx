import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Crown, Camera, Image as ImageIcon, Users, Bell, Shield, CircleHelp as HelpCircle, LogOut, Moon, Sun, Star, RotateCcw } from 'lucide-react-native';
import { PremiumModal } from '@/components/PremiumModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function ProfileScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { resetOnboarding } = useOnboarding();

  const [showPremium, setShowPremium] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const userStats = [
    { icon: Camera, label: 'Events Created', value: '12', color: theme.primary },
    { icon: ImageIcon, label: 'Photos Shared', value: '1,247', color: '#10B981' },
    { icon: Users, label: 'Guests Invited', value: '324', color: '#F59E0B' },
    { icon: Star, label: 'Memories Made', value: '∞', color: '#EF4444' },
  ];

  const handleThemeToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Crown, label: 'Upgrade to Premium', onPress: () => setShowPremium(true), isPremium: true },
        { icon: Settings, label: 'Account Settings', onPress: () => {} },
        { icon: Bell, label: 'Notifications', onPress: () => {}, toggle: notifications, onToggle: setNotifications },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: themeMode === 'dark' ? Sun : Moon, 
          label: 'Dark Mode', 
          onPress: () => {}, 
          toggle: themeMode === 'dark', 
          onToggle: handleThemeToggle 
        },
        { icon: Shield, label: 'Privacy & Security', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', onPress: () => {} },
        { icon: RotateCcw, label: 'Reset Onboarding', onPress: handleResetOnboarding },
        { icon: LogOut, label: 'Sign Out', onPress: () => {}, isDestructive: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <User size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            John Doe
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            john.doe@example.com
          </Text>
          <View style={styles.premiumBadge}>
            <Crown size={16} color="#F59E0B" />
            <Text style={[styles.premiumText, { color: '#F59E0B' }]}>
              Free Plan
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {userStats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: theme.surface }]}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {section.title}
            </Text>
            <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomColor: theme.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.menuIcon,
                        {
                          backgroundColor: item.isPremium
                            ? '#F59E0B20'
                            : item.isDestructive
                            ? '#EF444420'
                            : `${theme.primary}20`,
                        },
                      ]}
                    >
                      <item.icon
                        size={20}
                        color={
                          item.isPremium
                            ? '#F59E0B'
                            : item.isDestructive
                            ? '#EF4444'
                            : theme.primary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: item.isDestructive ? '#EF4444' : theme.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.toggle !== undefined && (
                    <Switch
                      value={item.toggle}
                      onValueChange={item.onToggle}
                      trackColor={{
                        false: theme.border,
                        true: theme.primary,
                      }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            EventSnap v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Made with ❤️ for memorable moments
          </Text>
        </View>
      </ScrollView>

      <PremiumModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F59E0B20',
    gap: 6,
  },
  premiumText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  menuContainer: {
    borderRadius: 16,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
});