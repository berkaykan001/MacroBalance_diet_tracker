import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { useWeight } from '../../context/WeightContext';
import { MacroCalculationService } from '../../services/MacroCalculationService';
import TimeService from '../../services/TimeService';
import {
  OnboardingContainer,
  PrimaryButton
} from './components/OnboardingComponents';

export default function CompletionScreen({ navigation }) {
  const { userProfile, completeOnboarding } = useSettings();
  const { addWeightEntry } = useWeight();
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculatePersonalizedTargets();
  }, []);

  const calculatePersonalizedTargets = async () => {
    try {
      if (!userProfile || !userProfile.age) {
        throw new Error('User profile incomplete');
      }

      const nutrition = MacroCalculationService.calculatePersonalizedNutrition(userProfile);
      setCalculatedNutrition(nutrition);
    } catch (error) {
      console.error('Error calculating personalized targets:', error);
      Alert.alert(
        'Calculation Error', 
        'Unable to calculate your personalized targets. Please check your information and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!calculatedNutrition) {
      Alert.alert('Error', 'Unable to complete setup. Please try again.');
      return;
    }

    try {
      setIsLoading(true);

      // First complete the onboarding process
      await completeOnboarding();

      // Create initial weight entry from user profile
      if (userProfile.weight) {
        console.log('Creating initial weight entry:', userProfile.weight);
        const weightEntryResult = await addWeightEntry({
          weight: userProfile.weight,
          date: TimeService.formatShort(), // Today's date
          notes: 'Initial weight from onboarding',
          source: 'onboarding'
        });

        if (weightEntryResult.success) {
          console.log('Initial weight entry created successfully');
        } else {
          console.error('Failed to create initial weight entry:', weightEntryResult.error);
        }
      }

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
      setIsLoading(false);
    }
  };

  const getActivityLevelDisplay = (level) => {
    const levels = {
      sedentary: 'Sedentary',
      light: 'Lightly Active',
      moderate: 'Moderately Active',
      very_active: 'Very Active',
      extremely_active: 'Extremely Active'
    };
    return levels[level] || level;
  };

  const getGoalDisplay = (goal) => {
    const goals = {
      cutting: 'Weight Loss (Cutting)',
      maintenance: 'Maintain Weight',
      bulking: 'Weight Gain (Bulking)',
      aggressive_cutting: 'Aggressive Weight Loss',
      aggressive_bulking: 'Aggressive Weight Gain'
    };
    return goals[goal] || goal;
  };

  if (isLoading) {
    return (
      <OnboardingContainer currentStep={6} totalSteps={6}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating your personalized targets...</Text>
        </View>
      </OnboardingContainer>
    );
  }

  if (!calculatedNutrition) {
    return (
      <OnboardingContainer currentStep={6} totalSteps={6}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to calculate targets</Text>
          <PrimaryButton title="Try Again" onPress={calculatePersonalizedTargets} />
        </View>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer currentStep={6} totalSteps={6}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.congratsText}>🎉</Text>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            We've calculated your personalized nutrition targets
          </Text>
        </View>

        {/* Profile Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          
          <View style={styles.profileGrid}>
            <ProfileItem 
              label="Age" 
              value={`${userProfile.age} years`} 
            />
            <ProfileItem 
              label="Gender" 
              value={userProfile.gender === 'male' ? 'Male' : 'Female'} 
            />
            <ProfileItem 
              label="Height" 
              value={`${userProfile.height} cm`} 
            />
            <ProfileItem 
              label="Weight" 
              value={`${userProfile.weight} kg`} 
            />
            <ProfileItem 
              label="Activity Level" 
              value={getActivityLevelDisplay(userProfile.activityLevel)} 
            />
            <ProfileItem 
              label="Goal" 
              value={getGoalDisplay(userProfile.goal)} 
            />
            <ProfileItem 
              label="Meals per Day" 
              value={`${userProfile.mealsPerDay} meals`} 
            />
            {userProfile.bodyFat && (
              <ProfileItem 
                label="Body Fat" 
                value={`${userProfile.bodyFat.toFixed(1)}%`} 
              />
            )}
          </View>
        </View>

        {/* Calculated Targets */}
        <View style={styles.targetsSection}>
          <Text style={styles.sectionTitle}>Your Daily Targets</Text>
          
          <View style={styles.macroCard}>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieLabel}>Daily Calories</Text>
              <Text style={styles.calorieValue}>{calculatedNutrition.calculations.targetCalories}</Text>
            </View>
            
            <View style={styles.macroGrid}>
              <MacroItem 
                label="Protein" 
                value={`${calculatedNutrition.dailyTargets.protein}g`}
                color="#FF6B6B"
              />
              <MacroItem 
                label="Carbs" 
                value={`${calculatedNutrition.dailyTargets.carbs}g`}
                color="#4ECDC4"
              />
              <MacroItem 
                label="Fat" 
                value={`${calculatedNutrition.dailyTargets.fat}g`}
                color="#FFD93D"
              />
            </View>
          </View>
        </View>

        {/* Meal Distribution */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Meal Distribution</Text>
          
          {calculatedNutrition.mealDistribution.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.mealMacros}>
                <Text style={styles.mealMacroText}>
                  P: {Math.round(meal.macroTargets.protein)}g
                </Text>
                <Text style={styles.mealMacroText}>
                  C: {Math.round(meal.macroTargets.carbs)}g
                </Text>
                <Text style={styles.mealMacroText}>
                  F: {Math.round(meal.macroTargets.fat)}g
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Complete Button */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Start Using MacroBalance"
            onPress={handleComplete}
            disabled={isLoading}
          />
          
          <Text style={styles.finalText}>
            🚀 Your personalized meal plans are ready to use!
          </Text>
        </View>
      </ScrollView>
    </OnboardingContainer>
  );
}

function ProfileItem({ label, value }) {
  return (
    <View style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

function MacroItem({ label, value, color }) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroColorDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#FF453A',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  congratsText: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  // Profile Summary
  summarySection: {
    marginBottom: 30,
  },
  profileGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  profileValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Targets Section
  targetsSection: {
    marginBottom: 30,
  },
  macroCard: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 208, 132, 0.3)',
  },
  calorieLabel: {
    fontSize: 18,
    color: '#00D084',
    fontWeight: '600',
  },
  calorieValue: {
    fontSize: 24,
    color: '#00D084',
    fontWeight: '700',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Meals Section
  mealsSection: {
    marginBottom: 30,
  },
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealMacroText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Button Section
  buttonSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  finalText: {
    fontSize: 16,
    color: '#00D084',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});