import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { 
  OnboardingContainer, 
  SelectionCard, 
  PrimaryButton 
} from './components/OnboardingComponents';

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    subtitle: 'Little to no exercise',
    description: 'Desk job, minimal physical activity, mostly sitting',
    icon: '💺'
  },
  {
    id: 'light',
    title: 'Lightly Active',
    subtitle: '1-3 days exercise per week',
    description: 'Light exercise or sports, occasional walks',
    icon: '🚶'
  },
  {
    id: 'moderate',
    title: 'Moderately Active',
    subtitle: '3-5 days exercise per week',
    description: 'Regular workouts, sports, or physical activity',
    icon: '🏃'
  },
  {
    id: 'very_active',
    title: 'Very Active',
    subtitle: '6-7 days exercise per week',
    description: 'Daily exercise, intense training, or physical job',
    icon: '💪'
  },
  {
    id: 'extremely_active',
    title: 'Extremely Active',
    subtitle: '2x daily training or physical job',
    description: 'Professional athlete or very demanding physical work',
    icon: '🏋️'
  }
];

export default function ActivityLevelScreen({ navigation }) {
  const { updateUserProfile } = useSettings();
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleContinue = async () => {
    if (!selectedActivity) {
      Alert.alert('Selection Required', 'Please select your activity level to continue.');
      return;
    }

    try {
      await updateUserProfile({
        activityLevel: selectedActivity
      });

      navigation.navigate('GoalSelection');
    } catch (error) {
      console.error('Error updating activity level:', error);
      Alert.alert('Error', 'Failed to save your activity level. Please try again.');
    }
  };

  return (
    <OnboardingContainer currentStep={2} totalSteps={6}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What's your activity level?</Text>
          <Text style={styles.subtitle}>
            This helps us calculate how many calories you burn daily
          </Text>
        </View>

        {/* Activity Level Options */}
        <View style={styles.optionsSection}>
          {ACTIVITY_LEVELS.map((level) => (
            <SelectionCard
              key={level.id}
              title={level.title}
              subtitle={level.subtitle}
              description={level.description}
              icon={level.icon}
              selected={selectedActivity === level.id}
              onPress={() => setSelectedActivity(level.id)}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedActivity}
          />
          
          <Text style={styles.helpText}>
            💡 Not sure? Choose the level that best matches your weekly routine
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