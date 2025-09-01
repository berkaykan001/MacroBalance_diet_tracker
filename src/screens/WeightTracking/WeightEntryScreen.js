import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeight } from '../../context/WeightContext';
import { 
  PrimaryButton, 
  SecondaryButton,
  InputField
} from '../Onboarding/components/OnboardingComponents';
import DatePicker from './components/DatePicker';

export default function WeightEntryScreen({ navigation, route }) {
  const { addWeightEntry, updateWeightEntry, error } = useWeight();
  const isEditing = route?.params?.entryId;
  const existingEntry = route?.params?.entry;

  const [formData, setFormData] = useState({
    weight: existingEntry?.weight?.toString() || '',
    date: existingEntry?.date || new Date().toISOString().split('T')[0],
    bodyFat: existingEntry?.bodyFat?.toString() || '',
    notes: existingEntry?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const validateForm = () => {
    const newErrors = {};
    
    // Weight validation
    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight)) {
      newErrors.weight = 'Weight is required and must be a number';
    } else if (weight < 30 || weight > 300) {
      newErrors.weight = 'Weight must be between 30-300 kg';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const entryDate = new Date(formData.date);
      const today = new Date();
      const yearAgo = new Date();
      yearAgo.setFullYear(today.getFullYear() - 1);
      
      if (isNaN(entryDate.getTime())) {
        newErrors.date = 'Invalid date';
      } else if (entryDate > today) {
        newErrors.date = 'Date cannot be in the future';
      } else if (entryDate < yearAgo) {
        newErrors.date = 'Date cannot be more than 1 year ago';
      }
    }

    // Body fat validation (optional)
    if (formData.bodyFat) {
      const bodyFat = parseFloat(formData.bodyFat);
      if (isNaN(bodyFat)) {
        newErrors.bodyFat = 'Body fat must be a number';
      } else if (bodyFat < 5 || bodyFat > 50) {
        newErrors.bodyFat = 'Body fat must be between 5-50%';
      }
    }

    // Notes validation (optional)
    if (formData.notes && formData.notes.length > 200) {
      newErrors.notes = 'Notes must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      Alert.alert('Please fix the errors', 'Check the highlighted fields and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const weightData = {
        weight: parseFloat(formData.weight),
        date: formData.date,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        notes: formData.notes.trim()
      };

      let result;
      if (isEditing) {
        result = await updateWeightEntry(route.params.entryId, weightData);
      } else {
        result = await addWeightEntry(weightData);
      }

      if (result.success) {
        Alert.alert(
          'Success!',
          isEditing ? 'Weight entry updated successfully.' : 'Weight entry added successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save weight entry');
      }
    } catch (error) {
      console.error('Error saving weight entry:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const hasUnsavedChanges = () => {
    if (!isEditing) {
      return formData.weight || formData.bodyFat || formData.notes;
    }

    return (
      formData.weight !== existingEntry?.weight?.toString() ||
      formData.date !== existingEntry?.date ||
      formData.bodyFat !== (existingEntry?.bodyFat?.toString() || '') ||
      formData.notes !== (existingEntry?.notes || '')
    );
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isFormValid = formData.weight && formData.date && Object.keys(errors).length === 0;

  return (
    <LinearGradient colors={['#000000', '#1C1C1E']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Edit Weight Entry' : 'Add Weight Entry'}
            </Text>
            <Text style={styles.subtitle}>
              {isEditing ? 'Update your weight information' : 'Track your progress with a new weight entry'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Weight Input */}
            <InputField
              label="Weight *"
              value={formData.weight}
              onChangeText={(value) => updateField('weight', value)}
              placeholder="Enter your weight"
              keyboardType="decimal-pad"
              suffix="kg"
              error={errors.weight}
            />

            {/* Date Selection */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Date *</Text>
              <DatePicker
                value={formData.date}
                onChange={(date) => updateField('date', date)}
                error={errors.date}
                style={styles.datePicker}
              />
              {formData.date && (
                <Text style={styles.dateDisplay}>
                  {formatDate(formData.date)}
                </Text>
              )}
              {errors.date && (
                <Text style={styles.errorText}>{errors.date}</Text>
              )}
            </View>

            {/* Body Fat Input (Optional) */}
            <InputField
              label="Body Fat % (Optional)"
              value={formData.bodyFat}
              onChangeText={(value) => updateField('bodyFat', value)}
              placeholder="Enter body fat percentage"
              keyboardType="decimal-pad"
              suffix="%"
              error={errors.bodyFat}
            />

            {/* Notes Input (Optional) */}
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes (Optional)</Text>
              <View style={[styles.notesInputWrapper, errors.notes && styles.inputError]}>
                <TextInput
                  style={styles.notesInput}
                  value={formData.notes}
                  onChangeText={(value) => updateField('notes', value)}
                  placeholder="Add any notes about this entry..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.characterCount}>
                {formData.notes.length}/200 characters
              </Text>
              {errors.notes && (
                <Text style={styles.errorText}>{errors.notes}</Text>
              )}
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Weight Tracking Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Weigh yourself at the same time each day</Text>
              <Text style={styles.tipItem}>• Use the bathroom before weighing</Text>
              <Text style={styles.tipItem}>• Track consistently for accurate trends</Text>
              <Text style={styles.tipItem}>• Focus on weekly averages, not daily fluctuations</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title={isEditing ? 'Update Entry' : 'Save Entry'}
            onPress={handleSave}
            disabled={!isFormValid || isLoading}
            style={styles.saveButton}
          />
          
          <SecondaryButton
            title="Cancel"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },

  // Form Section
  formSection: {
    marginBottom: 30,
  },
  
  // Date Section
  dateSection: {
    marginVertical: 12,
  },
  dateLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  datePicker: {
    marginBottom: 8,
  },
  dateDisplay: {
    color: '#00D084',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },

  // Notes Section
  notesSection: {
    marginVertical: 12,
  },
  notesLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesInputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    minHeight: 80,
  },
  notesInput: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  inputError: {
    borderColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },

  // Tips Section
  tipsSection: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 12,
  },
  tipsList: {
    marginLeft: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 4,
  },

  // Button Section
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#8E8E93',
  },
});