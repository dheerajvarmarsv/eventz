import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Share2, Copy, Download } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  eventCode: string;
  theme: any;
}

export function QRCodeModal({ visible, onClose, eventCode, theme }: QRCodeModalProps) {
  const qrValue = `https://eventsnap.app/join/${eventCode}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my event! Scan this QR code or visit: ${qrValue}`,
        url: qrValue,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = () => {
    // In a real app, you would copy to clipboard
    console.log('Copy link:', qrValue);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Share Event
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={[styles.qrContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.qrTitle, { color: theme.text }]}>
              Event QR Code
            </Text>
            <Text style={[styles.qrSubtitle, { color: theme.textSecondary }]}>
              Let guests scan to join and share photos
            </Text>
            
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrValue}
                size={200}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>

            <Text style={[styles.eventCode, { color: theme.text }]}>
              Event Code: {eventCode}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={handleShare}
            >
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Share QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              onPress={handleCopyLink}
            >
              <Copy size={20} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>
                Copy Link
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
            >
              <Download size={20} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>
                Download QR
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.instructions, { backgroundColor: theme.surface }]}>
            <Text style={[styles.instructionsTitle, { color: theme.text }]}>
              How it works
            </Text>
            <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
              1. Share this QR code with your guests{'\n'}
              2. Guests scan the code to access the event{'\n'}
              3. They can instantly upload photos to your gallery{'\n'}
              4. All photos appear in real-time for everyone to see
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 24,
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
  qrTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
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
  eventCode: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  instructions: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});