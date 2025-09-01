import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { 
  OnboardingContainer, 
  SelectionCard, 
  PrimaryButton,
  SecondaryButton 
} from './components/OnboardingComponents';

const BODY_FAT_RANGES = [
  {
    id: 'very_low',
    range: { male: '6-10%', female: '16-19%' },
    title: 'Very Low',
    subtitle: 'Athletic/Competition',
    description: {
      male: 'Highly defined abs, visible striations, competition-ready physique',
      female: 'Very defined muscle tone, minimal curves, athletic build'
    },
    averageValue: { male: 8, female: 17.5 }
  },
  {
    id: 'low',
    range: { male: '11-14%', female: '20-24%' },
    title: 'Low',
    subtitle: 'Fitness model',
    description: {
      male: 'Clearly visible abs, good muscle definition, lean physique',
      female: 'Toned appearance, some muscle definition, athletic look'
    },
    averageValue: { male: 12.5, female: 22 }
  },
  {
    id: 'normal',
    range: { male: '15-19%', female: '25-31%' },
    title: 'Normal',
    subtitle: 'Healthy & fit',
    description: {
      male: 'Some ab definition, healthy appearance, slight muscle visibility',
      female: 'Healthy curves, some muscle tone, normal feminine shape'
    },
    averageValue: { male: 17, female: 28 }
  },
  {
    id: 'moderate',
    range: { male: '20-24%', female: '32-38%' },
    title: 'Moderate',
    subtitle: 'Average range',
    description: {
      male: 'Soft appearance, minimal muscle definition, some belly fat',
      female: 'Softer curves, less muscle definition, healthy weight range'
    },
    averageValue: { male: 22, female: 35 }
  },
  {
    id: 'high',
    range: { male: '25%+', female: '39%+' },
    title: 'High',
    subtitle: 'Above average',
    description: {
      male: 'Rounder appearance, limited muscle visibility, higher fat storage',
      female: 'Fuller figure, minimal muscle definition, higher fat percentage'
    },
    averageValue: { male: 28, female: 42 }
  }
];

export default function BodyFatScreen({ navigation }) {
  const { updateUserProfile, userProfile } = useSettings();
  const [selectedBodyFat, setSelectedBodyFat] = useState(null);
  const [showSkipOption, setShowSkipOption] = useState(false);

  const getUserGender = () => userProfile?.gender || 'male';

  const handleContinue = async () => {
    if (!selectedBodyFat && !showSkipOption) {
      Alert.alert('Selection Required', 'Please select your estimated body fat range or skip this step.');
      return;
    }

    try {
      // Use average value for the selected range, or null if skipping
      const bodyFatValue = selectedBodyFat ? 
        BODY_FAT_RANGES.find(range => range.id === selectedBodyFat)?.averageValue[getUserGender()] || null 
        : null;

      await updateUserProfile({
        bodyFat: bodyFatValue
      });

      navigation.navigate('Completion');
    } catch (error) {
      console.error('Error updating body fat:', error);
      Alert.alert('Error', 'Failed to save your body fat estimate. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Body Fat Estimation?',
      'Body fat percentage helps us calculate more accurate macro targets. You can always add this later in settings.\n\nSkipping will use standard BMR calculations instead of the more precise Katch-McArdle formula.',
      [
        { text: 'Go Back', style: 'cancel' },
        { 
          text: 'Skip This Step', 
          onPress: async () => {
            try {
              await updateUserProfile({ bodyFat: null });
              navigation.navigate('Completion');
            } catch (error) {
              console.error('Error skipping body fat:', error);
              Alert.alert('Error', 'Failed to continue. Please try again.');
            }
          }
        }
      ]
    );
  };

  const currentGender = getUserGender();

  return (
    <OnboardingContainer currentStep={5} totalSteps={6}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Estimate your body fat percentage</Text>
          <Text style={styles.subtitle}>
            This helps us calculate more accurate macro targets for your body composition
          </Text>
        </View>

        {/* Body Fat Options */}
        <ScrollView style={styles.optionsSection} showsVerticalScrollIndicator={false}>
          {BODY_FAT_RANGES.map((range) => (
            <SelectionCard
              key={range.id}
              title={`${range.title} (${range.range[currentGender]})`}
              subtitle={range.subtitle}
              description={range.description[currentGender]}
              selected={selectedBodyFat === range.id}
              onPress={() => setSelectedBodyFat(range.id)}
            />
          ))}

          {/* Estimation Help */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>💡 Estimation Tips</Text>
            <Text style={styles.helpText}>
              • Look in a mirror with good lighting{'\n'}
              • Compare your physique to the descriptions above{'\n'}
              • When in doubt, choose the higher range{'\n'}
              • This is just an estimate - it can be refined over time
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedBodyFat}
          />
          
          <SecondaryButton
            title="Skip This Step"
            onPress={handleSkip}
            style={styles.skipButton}
          />
          
          <Text style={styles.disclaimerText}>
            Don't worry - you can always update this later in your settings
          </Text>
        </View>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Help Section
  helpSection: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Button Section
  buttonSection: {
    paddingVertical: 20,
  },
  skipButton: {
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});