import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BirthdayInvitationScreen: React.FC = () => {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);

  const handleRsvpSelect = (status: string) => {
    setRsvpStatus(status);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIqOyEY-Ffg84y4QqdQgOopfNjFYk47TZqWUKsMnxFXsiOZAl8_-KHaA4JfUMn9bq4Obx7Uztcq1DtHpFH8UK9CZVG3QL2BRs1rJ9SJp1NufygpXVKyRU5wS01JgpKyPymLgTREVyOkxlgmxtjrfbSij9YGnlpJlbk5gNOdHZWf4W1uTAXuMFBZLJ7c380S0m7JJeEVUEnfZ1rS190-TYJn9jHsaV0eFrx3HCzPawgRItmaqCdbNRvFyCNZEq6pjcbd_fFrT6RGjE' }}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios_new" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Jane's Birthday!</Text>
          <Text style={styles.subtitle}>Sat, 8 Feb, 6:00 – 8:00 PM</Text>
          <Text style={styles.subtitle}>Alex's House</Text>
          <Text style={styles.location}>1226 University Dr, Menlo Park CA</Text>

          <View style={styles.hostInfo}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQjInYpA9sz4JaIKYstYCk9YzBY2pBwhFZQAs_CewLkppuAr8bpyRJLeAh_CCeo03RuQMl9rKXYZyQdxg43k9kP7ZTNzf1xW9_R7KsrMuK-M_EtjCebVO2QJYb_14Ra4-uxYY1_vJdGbY-WvvRRTY9bv-87prrcPfJu10K6C1dzbzpN9iGISrj3L3MYD-DxPGOaVIm2r_Sj8kuQRm-FkoGBdlWlLM4JUATVvHsbANI-MXNv65m60F0HiqNi6UUlbEj7pbfO96jTKI' }}
              style={styles.hostAvatar}
            />
            <Text style={styles.hostName}>Hosted by Alex Smith</Text>
          </View>

          <Text style={styles.description}>
            Join us for a night of fun, laughter, and celebration as we mark Jane's special day. There will be cake, games, and great company!
          </Text>

          <View style={styles.rsvpContainer}>
            <View style={styles.rsvpOptions}>
              <TouchableOpacity
                style={[
                  styles.rsvpOption,
                  rsvpStatus === 'going' && styles.selectedRsvpOption,
                ]}
                onPress={() => handleRsvpSelect('going')}
              >
                <MaterialIcons name="check_circle_outline" size={24} color="white" />
                <Text style={styles.rsvpOptionText}>Going</Text>
              </TouchableOpacity>

              <View style={styles.rsvpDivider} />

              <TouchableOpacity
                style={[
                  styles.rsvpOption,
                  rsvpStatus === 'not_going' && styles.selectedRsvpOption,
                ]}
                onPress={() => handleRsvpSelect('not_going')}
              >
                <MaterialIcons name="highlight_off" size={24} color="white" />
                <Text style={styles.rsvpOptionText}>Not Going</Text>
              </TouchableOpacity>

              <View style={styles.rsvpDivider} />

              <TouchableOpacity
                style={[
                  styles.rsvpOption,
                  rsvpStatus === 'maybe' && styles.selectedRsvpOption,
                ]}
                onPress={() => handleRsvpSelect('maybe')}
              >
                <MaterialIcons name="help_outline" size={24} color="white" />
                <Text style={styles.rsvpOptionText}>Maybe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 24,
  },
  nextButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 16,
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 12,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  rsvpContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    transitionDuration: '200ms',
  },
  selectedRsvpOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'white',
  },
  rsvpOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginTop: 6,
  },
  rsvpDivider: {
    height: 48,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default BirthdayInvitationScreen;