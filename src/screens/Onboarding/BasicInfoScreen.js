import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Keyboard } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { 
  OnboardingContainer, 
  InputField, 
  GenderSelector, 
  PrimaryButton 
} from './components/OnboardingComponents';

export default function BasicInfoScreen({ navigation }) {
  const { updateUserProfile } = useSettings();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: null,
    height: '',
    weight: ''
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 18 || age > 80) {
      newErrors.age = 'Age must be between 18-80 years';
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    // Height validation (cm)
    const height = parseInt(formData.height);
    if (!formData.height || isNaN(height) || height < 140 || height > 220) {
      newErrors.height = 'Height must be between 140-220 cm';
    }
    
    // Weight validation (kg)
    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight < 40 || weight > 200) {
      newErrors.weight = 'Weight must be between 40-200 kg';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      Alert.alert('Please fix the errors', 'Check the highlighted fields and try again.');
      return;
    }

    try {
      // Update user profile with basic info
      await updateUserProfile({
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight)
      });

      navigation.navigate('ActivityLevel');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const isFormValid = formData.age && formData.gender && formData.height && formData.weight;

  return (
    <OnboardingContainer currentStep={1} totalSteps={6}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We need some basic information to calculate your personalized nutrition targets
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Age Input */}
          <InputField
            label="Age"
            value={formData.age}
            onChangeText={(value) => updateField('age', value)}
            placeholder="Enter your age"
            keyboardType="numeric"
            suffix="years"
            error={errors.age}
          />

          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <Text style={styles.genderLabel}>Gender</Text>
            <GenderSelector
              selectedGender={formData.gender}
              onGenderSelect={(gender) => updateField('gender', gender)}
            />
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          {/* Height Input */}
          <InputField
            label="Height"
            value={formData.height}
            onChangeText={(value) => updateField('height', value)}
            placeholder="Enter your height"
            keyboardType="numeric"
            suffix="cm"
            error={errors.height}
          />

          {/* Weight Input */}
          <InputField
            label="Weight"
            value={formData.weight}
            onChangeText={(value) => updateField('weight', value)}
            placeholder="Enter your weight"
            keyboardType="decimal-pad"
            suffix="kg"
            error={errors.weight}
          />
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!isFormValid}
          />
          
          <Text style={styles.privacyText}>
            Your information is stored securely on your device and never shared
          </Text>
        </View>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },

  // Header
  header: {
    paddingVertical: 20,
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
    flex: 1,
    paddingVertical: 20,
  },
  genderSection: {
    marginVertical: 12,
  },
  genderLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },

  // Button Section
  buttonSection: {
    paddingVertical: 20,
  },
  privacyText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});