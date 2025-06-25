import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock } from 'lucide-react-native';

interface DateTimePickerModalProps {
  visible: boolean;
  mode: 'date' | 'time';
  onClose: () => void;
  onSelect: (date: Date) => void;
  theme: any;
  title: string;
}

export function DateTimePickerModal({
  visible,
  mode,
  onClose,
  onSelect,
  theme,
  title,
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const generateTimes = () => {
    const times = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        times.push(time);
      }
    }
    
    return times;
  };

  const formatDateOption = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTimeOption = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSelect = (value: Date) => {
    if (mode === 'date') {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
      onSelect(newDate);
    } else {
      const newTime = new Date(selectedDate);
      newTime.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onSelect(newTime);
    }
  };

  const options = mode === 'date' ? generateDates() : generateTimes();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            {mode === 'date' ? (
              <Calendar size={20} color={theme.primary} />
            ) : (
              <Clock size={20} color={theme.primary} />
            )}
            <Text style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  { backgroundColor: theme.surface, borderColor: theme.border }
                ]}
                onPress={() => handleSelect(option)}
              >
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {mode === 'date' ? formatDateOption(option) : formatTimeOption(option)}
                </Text>
                {mode === 'date' && (
                  <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                    {option.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  optionSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});