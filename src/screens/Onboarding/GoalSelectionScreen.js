import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { 
  OnboardingContainer, 
  SelectionCard, 
  PrimaryButton 
} from './components/OnboardingComponents';

const GOAL_OPTIONS = [
  {
    id: 'cutting',
    title: 'Weight Loss (Cutting)',
    subtitle: 'Lose fat while preserving muscle',
    description: '15% calorie deficit with higher protein to maintain lean mass',
    icon: '📉'
  },
  {
    id: 'maintenance',
    title: 'Maintain Weight',
    subtitle: 'Stay at current weight',
    description: 'Balanced nutrition to maintain your current physique and weight',
    icon: '⚖️'
  },
  {
    id: 'bulking',
    title: 'Weight Gain (Bulking)',
    subtitle: 'Build muscle and gain weight',
    description: '15% calorie surplus with optimized macros for muscle growth',
    icon: '📈'
  },
  {
    id: 'aggressive_cutting',
    title: 'Aggressive Weight Loss',
    subtitle: 'Faster fat loss (Advanced)',
    description: '25% calorie deficit - requires discipline and experience',
    icon: '🔥'
  },
  {
    id: 'aggressive_bulking',
    title: 'Aggressive Weight Gain',
    subtitle: 'Faster muscle gain (Advanced)',
    description: '25% calorie surplus for rapid gains - may include some fat gain',
    icon: '⚡'
  }
];

export default function GoalSelectionScreen({ navigation }) {
  const { updateUserProfile } = useSettings();
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleContinue = async () => {
    if (!selectedGoal) {
      Alert.alert('Selection Required', 'Please select your fitness goal to continue.');
      return;
    }

    // Show confirmation for aggressive options
    if (selectedGoal.includes('aggressive')) {
      Alert.alert(
        'Aggressive Goal Selected',
        'Aggressive goals require more discipline and experience. Are you sure you want to proceed?',
        [
          { text: 'Choose Different Goal', style: 'cancel' },
          { text: 'Continue', onPress: () => saveGoalAndContinue() }
        ]
      );
    } else {
      await saveGoalAndContinue();
    }
  };

  const saveGoalAndContinue = async () => {
    try {
      await updateUserProfile({
        goal: selectedGoal
      });

      navigation.navigate('MealFrequency');
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to save your goal. Please try again.');
    }
  };

  return (
    <OnboardingContainer currentStep={3} totalSteps={6}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What's your primary goal?</Text>
          <Text style={styles.subtitle}>
            This determines your calorie target and macro distribution
          </Text>
        </View>

        {/* Goal Options */}
        <View style={styles.optionsSection}>
          {GOAL_OPTIONS.map((goal) => (
            <SelectionCard
              key={goal.id}
              title={goal.title}
              subtitle={goal.subtitle}
              description={goal.description}
              icon={goal.icon}
              selected={selectedGoal === goal.id}
              onPress={() => setSelectedGoal(goal.id)}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedGoal}
          />
          
          <Text style={styles.helpText}>
            💡 You can always change your goal later in settings
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