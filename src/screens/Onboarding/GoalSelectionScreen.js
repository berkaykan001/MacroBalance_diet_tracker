import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../context/SettingsContext';
import { 
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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleContinue = async () => {
    console.log('handleContinue called, selectedGoal:', selectedGoal);
    if (!selectedGoal) {
      return;
    }

    // Show confirmation for aggressive options
    if (selectedGoal.includes('aggressive')) {
      console.log('Showing aggressive goal confirmation');
      setShowConfirmation(true);
    } else {
      console.log('Non-aggressive goal, proceeding directly');
      await saveGoalAndContinue();
    }
  };

  const saveGoalAndContinue = async () => {
    console.log('saveGoalAndContinue called with goal:', selectedGoal);
    try {
      await updateUserProfile({
        goal: selectedGoal
      });
      console.log('Goal updated successfully, navigating to MealFrequency');
      navigation.navigate('MealFrequency');
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleConfirmAggressive = async () => {
    console.log('User confirmed aggressive goal');
    setShowConfirmation(false);
    await saveGoalAndContinue();
  };

  const handleCancelAggressive = () => {
    console.log('User cancelled aggressive goal');
    setShowConfirmation(false);
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(3 / 6) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>3 of 6</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>What's your primary goal?</Text>
            <Text style={styles.subtitle}>
              This determines your calorie target and macro distribution
            </Text>
          </View>

          {/* Goal Options - RESTORED */}
          <View style={styles.optionsSection}>
            {GOAL_OPTIONS.map((goal) => (
              <SelectionCard
                key={goal.id}
                title={goal.title}
                subtitle={goal.subtitle}
                description={goal.description}
                icon={goal.icon}
                selected={selectedGoal === goal.id}
                onPress={() => {
                  console.log('Goal selected:', goal.id);
                  setSelectedGoal(goal.id);
                }}
              />
            ))}
          </View>

          {/* Continue Button - RESTORED */}
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

        {/* Bottom spacer exactly like dashboard */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Aggressive Goal Confirmation Modal - RESTORED */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Aggressive Goal Selected</Text>
            <Text style={styles.modalText}>
              Aggressive goals require more discipline and experience. Are you sure you want to proceed?
            </Text>
            
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalSecondaryButton} onPress={handleCancelAggressive}>
                <Text style={styles.modalSecondaryButtonText}>Choose Different Goal</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryButton} onPress={handleConfirmAggressive}>
                <Text style={styles.modalPrimaryButtonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Main container - EXACTLY like dashboard
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Progress indicator
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D084',
    borderRadius: 2,
  },
  progressText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },

  // Header - like dashboard header
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // Button Section
  buttonSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 30,
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },

  // Bottom spacer - EXACTLY like dashboard
  bottomSpacer: {
    height: 20,
  },

  // Dashboard card styles - copied exactly
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Modal styles - RESTORED
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: '#00D084',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});