import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Check, UserPlus, FileText } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Responsive Design Utilities
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: string[];
  emails?: string[];
  imageAvailable: boolean;
  thumbnail?: string;
}

interface ContactPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (contacts: Contact[]) => void;
  theme: any;
}

export function ContactPickerModal({ visible, onClose, onSelect, theme }: ContactPickerModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  const loadContacts = async () => {
    setIsLoading(true);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'To invite guests, please grant contacts access in your phone settings.',
        [{ text: 'OK', onPress: onClose }]
      );
      setPermissionGranted(false);
      setIsLoading(false);
      return;
    }

    setPermissionGranted(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Image],
      });

      const formattedContacts = data
        .filter(c => c.id && c.name && (c.phoneNumbers?.length || c.emails?.length))
        .map((c: Contacts.Contact) => ({
          id: c.id!,
          name: c.name,
          phoneNumbers: c.phoneNumbers?.map(p => p.number).filter(Boolean) as string[] || [],
          emails: c.emails?.map(e => e.email).filter(Boolean) as string[] || [],
          imageAvailable: c.imageAvailable ?? false,
          thumbnail: c.image?.uri,
        }));
      
      setContacts(formattedContacts);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      Alert.alert('Error', 'Could not load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      return contacts.filter(contact =>
        contact.name.toLowerCase().includes(lowercasedQuery)
      );
    }
    return contacts;
  }, [searchQuery, contacts]);

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev =>
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleDone = () => {
    onSelect(selectedContacts);
    onClose();
    setSelectedContacts([]);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.contactItem, { borderBottomColor: theme.border }]}
        onPress={() => toggleContactSelection(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contactInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.avatarImage} />
            ) : (
              <UserPlus size={moderateScale(20)} color={theme.primary} />
            )}
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.contactDetail, { color: theme.textSecondary }]}>
              {item.phoneNumbers?.[0] || item.emails?.[0] || 'No contact info'}
            </Text>
          </View>
        </View>
        <View style={[styles.checkbox, isSelected ? { backgroundColor: theme.primary, borderColor: theme.primary } : { borderColor: theme.border }]}>
          {isSelected && <Check size={moderateScale(16)} color="#FFFFFF" strokeWidth={2.5} />}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <FileText size={moderateScale(48)} color={theme.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
        {isLoading ? 'Loading Contacts...' : !permissionGranted ? 'Permission Denied' : 'No Contacts Found'}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}>
        {isLoading
          ? 'Fetching your address book...'
          : !permissionGranted
          ? 'Please enable contacts access in your settings to proceed.'
          : 'It seems there are no contacts to display from your device.'}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={moderateScale(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Invite Guests</Text>
          <TouchableOpacity onPress={handleDone} disabled={selectedContacts.length === 0} style={styles.headerButton}>
            <Text style={[styles.doneButton, { color: selectedContacts.length > 0 ? theme.primary : theme.textSecondary }]}>
              Done ({selectedContacts.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchContainer, { borderBottomColor: theme.border }]}>
          <View style={[styles.searchInputWrapper, { backgroundColor: theme.surface }]}>
            <Search size={moderateScale(20)} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search contacts..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        
        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={isLoading ? null : renderEmptyState}
          contentContainerStyle={[styles.listContentContainer, contacts.length === 0 && { flex: 1 }]}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
        {isLoading && (
          <View style={StyleSheet.absoluteFill}>
            {renderEmptyState()}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: { 
    padding: scale(8),
  },
  headerTitle: { 
    fontSize: moderateScale(17), 
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  doneButton: { 
    fontSize: moderateScale(16), 
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  searchContainer: { 
    paddingHorizontal: scale(16), 
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
  },
  searchInput: {
    flex: 1,
    height: verticalScale(44),
    marginLeft: scale(8),
    fontSize: moderateScale(16),
    fontFamily: 'Inter-Regular',
  },
  listContentContainer: { 
    paddingBottom: verticalScale(40),
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
    paddingRight: scale(10),
  },
  contactTextContainer: {
    flex: 1,
  },
  avatar: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  contactName: { 
    fontSize: moderateScale(16), 
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  contactDetail: { 
    fontSize: moderateScale(13), 
    fontFamily: 'Inter-Regular', 
    marginTop: verticalScale(2) 
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(40),
  },
  emptyStateTitle: { 
    fontSize: moderateScale(18), 
    fontFamily: 'Inter-SemiBold', 
    marginTop: verticalScale(16), 
    textAlign: 'center' 
  },
  emptyStateSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },
}); 