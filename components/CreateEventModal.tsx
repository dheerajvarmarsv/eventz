import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, MapPin, Clock, Users, Image as ImageIcon, Share2 } from 'lucide-react-native';
import { DateTimePickerModal } from '@/components/DateTimePickerModal';
import { LocationPickerModal } from '@/components/LocationPickerModal';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  theme: any;
}

export function CreateEventModal({ visible, onClose, onSave, theme }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Event title is required';
    }
    if (!selectedDate) {
      newErrors.date = 'Event date is required';
    }
    if (!selectedTime) {
      newErrors.time = 'Event time is required';
    }
    if (!location.trim()) {
      newErrors.location = 'Event location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const eventData = {
      title: title.trim(),
      date: formatDate(selectedDate!),
      time: formatTime(selectedTime!),
      location: location.trim(),
      description: description.trim(),
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    };

    onSave(eventData);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSelectedDate(null);
    setSelectedTime(null);
    setLocation('');
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setShowTimePicker(false);
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationPicker(false);
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const isFormValid = title.trim() && selectedDate && selectedTime && location.trim();

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>
              Create Event
            </Text>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: isFormValid ? theme.primary : theme.border,
                }
              ]}
              onPress={handleSave}
              disabled={!isFormValid}
            >
              <Text style={[
                styles.saveButtonText,
                { color: isFormValid ? '#FFFFFF' : theme.textSecondary }
              ]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>
                Event Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: errors.title ? theme.error : theme.border,
                  },
                ]}
                placeholder="What's the occasion?"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
              />
              {errors.title && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {errors.title}
                </Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Date *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.surface,
                      borderColor: errors.date ? theme.error : theme.border,
                    }
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color={theme.textSecondary} />
                  <Text
                    style={[
                      styles.inputWithIconText,
                      {
                        color: selectedDate ? theme.text : theme.textSecondary,
                      },
                    ]}
                  >
                    {selectedDate ? formatDate(selectedDate) : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {errors.date && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.date}
                  </Text>
                )}
              </View>

              <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Time *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.surface,
                      borderColor: errors.time ? theme.error : theme.border,
                    }
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={theme.textSecondary} />
                  <Text
                    style={[
                      styles.inputWithIconText,
                      {
                        color: selectedTime ? theme.text : theme.textSecondary,
                      },
                    ]}
                  >
                    {selectedTime ? formatTime(selectedTime) : 'Select time'}
                  </Text>
                </TouchableOpacity>
                {errors.time && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.time}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>
                Location *
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.surface,
                    borderColor: errors.location ? theme.error : theme.border,
                  }
                ]}
                onPress={() => setShowLocationPicker(true)}
              >
                <MapPin size={20} color={theme.textSecondary} />
                <Text
                  style={[
                    styles.inputWithIconText,
                    {
                      color: location ? theme.text : theme.textSecondary,
                    },
                  ]}
                >
                  {location || 'Choose location'}
                </Text>
              </TouchableOpacity>
              {errors.location && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {errors.location}
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Add event details, dress code, special instructions..."
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={[styles.featuresSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.featuresTitle, { color: theme.text }]}>
                Event Features
              </Text>
              
              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <Users size={20} color={theme.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Guest Management
                  </Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Send invitations and track RSVPs automatically
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <ImageIcon size={20} color={theme.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Photo Sharing
                  </Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    QR code access for instant photo uploads
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <Share2 size={20} color={theme.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Real-time Gallery
                  </Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Live photo stream visible to all guests
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <DateTimePickerModal
        visible={showDatePicker}
        mode="date"
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        theme={theme}
        title="Select Event Date"
      />

      <DateTimePickerModal
        visible={showTimePicker}
        mode="time"
        onClose={() => setShowTimePicker(false)}
        onSelect={handleTimeSelect}
        theme={theme}
        title="Select Event Time"
      />

      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
        theme={theme}
      />
    </>
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  inputWithIconText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  featuresSection: {
    marginTop: 32,
    marginBottom: 32,
    padding: 20,
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
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});