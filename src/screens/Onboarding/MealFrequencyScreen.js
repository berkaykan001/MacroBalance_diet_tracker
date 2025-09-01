import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { 
  OnboardingContainer, 
  SelectionCard, 
  PrimaryButton 
} from './components/OnboardingComponents';

const MEAL_FREQUENCY_OPTIONS = [
  {
    id: 3,
    title: '3 Meals',
    subtitle: 'Traditional approach',
    description: 'Breakfast, Lunch, and Dinner - larger portions per meal',
    icon: '🍽️'
  },
  {
    id: 4,
    title: '4 Meals',
    subtitle: 'Balanced & practical',
    description: 'Three main meals plus one snack - optimal for most people',
    icon: '⚖️'
  },
  {
    id: 5,
    title: '5 Meals',
    subtitle: 'Frequent eating',
    description: 'Three meals plus two snacks - better appetite control',
    icon: '🕐'
  },
  {
    id: 6,
    title: '6 Meals',
    subtitle: 'Athletic approach',
    description: 'Small frequent meals - optimal for muscle building',
    icon: '💪'
  }
];

export default function MealFrequencyScreen({ navigation }) {
  const { updateUserProfile } = useSettings();
  const [selectedFrequency, setSelectedFrequency] = useState(4); // Default to 4 meals

  const handleContinue = async () => {
    if (!selectedFrequency) {
      Alert.alert('Selection Required', 'Please select your preferred meal frequency to continue.');
      return;
    }

    try {
      await updateUserProfile({
        mealsPerDay: selectedFrequency
      });

      navigation.navigate('BodyFat');
    } catch (error) {
      console.error('Error updating meal frequency:', error);
      Alert.alert('Error', 'Failed to save your meal frequency. Please try again.');
    }
  };

  return (
    <OnboardingContainer currentStep={4} totalSteps={6}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How many meals per day?</Text>
          <Text style={styles.subtitle}>
            This determines how your daily macros will be distributed
          </Text>
        </View>

        {/* Meal Frequency Options */}
        <View style={styles.optionsSection}>
          {MEAL_FREQUENCY_OPTIONS.map((option) => (
            <SelectionCard
              key={option.id}
              title={option.title}
              subtitle={option.subtitle}
              description={option.description}
              icon={option.icon}
              selected={selectedFrequency === option.id}
              onPress={() => setSelectedFrequency(option.id)}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedFrequency}
          />
          
          <Text style={styles.helpText}>
            💡 More meals = smaller portions, fewer meals = larger portions
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

  // Options Section
  optionsSection: {
    flex: 1,
    paddingVertical: 20,
  },

  // Button Section
  buttonSection: {
    paddingVertical: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});