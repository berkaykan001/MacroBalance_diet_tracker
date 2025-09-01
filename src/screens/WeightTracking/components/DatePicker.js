import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Modal, 
  Platform,
  ScrollView
} from 'react-native';

export default function DatePicker({ value, onChange, error, style }) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date().toISOString().split('T')[0]);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select Date';
    
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateSelect = (selectedDate) => {
    setTempDate(selectedDate);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date().toISOString().split('T')[0]);
    setShowPicker(false);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Generate last 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dateString = date.toISOString().split('T')[0];
      const displayName = i === 0 ? 'Today' : 
                         i === 1 ? 'Yesterday' :
                         date.toLocaleDateString('en-US', {
                           weekday: 'short',
                           month: 'short',
                           day: 'numeric'
                         });
      
      dates.push({
        value: dateString,
        label: displayName,
        fullDate: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        isToday: i === 0,
        isYesterday: i === 1
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={[styles.selector, error && styles.selectorError]}
        onPress={() => setShowPicker(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorText}>
            {formatDisplayDate(value)}
          </Text>
          <Text style={styles.selectorIcon}>📅</Text>
        </View>
      </Pressable>

      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCancel} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Pressable onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.confirmText}>Done</Text>
            </Pressable>
          </View>

          {/* Date List */}
          <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
            {dateOptions.map((dateOption) => (
              <Pressable
                key={dateOption.value}
                style={[
                  styles.dateOption,
                  tempDate === dateOption.value && styles.dateOptionSelected
                ]}
                onPress={() => handleDateSelect(dateOption.value)}
              >
                <View style={styles.dateOptionContent}>
                  <Text style={[
                    styles.dateOptionLabel,
                    tempDate === dateOption.value && styles.dateOptionLabelSelected
                  ]}>
                    {dateOption.label}
                  </Text>
                  <Text style={[
                    styles.dateOptionFull,
                    tempDate === dateOption.value && styles.dateOptionFullSelected
                  ]}>
                    {dateOption.fullDate}
                  </Text>
                </View>
                {tempDate === dateOption.value && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  
  // Selector
  selector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  selectorError: {
    borderColor: '#FF453A',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  selectorIcon: {
    fontSize: 18,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmText: {
    color: '#00D084',
    fontSize: 16,
    fontWeight: '600',
  },

  // Date List
  dateList: {
    flex: 1,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  dateOptionSelected: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateOptionLabelSelected: {
    color: '#00D084',
  },
  dateOptionFull: {
    color: '#8E8E93',
    fontSize: 14,
  },
  dateOptionFullSelected: {
    color: '#66E6AC',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});