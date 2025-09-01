import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Pressable,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../screens/Onboarding/components/OnboardingComponents';

export default function MacroAdjustmentDialog({
  visible,
  recommendation,
  onAccept,
  onCustomize,
  onDismiss,
  isLoading = false
}) {
  const [selectedImplementation, setSelectedImplementation] = useState('recommended');

  if (!visible || !recommendation) {
    return null;
  }

  const { 
    explanation, 
    validation, 
    currentCalories, 
    recommendedCalories, 
    adjustment, 
    implementationPlan,
    confidence,
    progressAnalytics 
  } = recommendation;

  const formatMacroComparison = (current, adjusted) => {
    return {
      calories: {
        current: current.calories || currentCalories,
        adjusted: adjusted.calories || recommendedCalories,
        change: (adjusted.calories || recommendedCalories) - (current.calories || currentCalories)
      },
      protein: {
        current: current.protein || Math.round((current.calories || currentCalories) * 0.3 / 4),
        adjusted: adjusted.protein || Math.round((adjusted.calories || recommendedCalories) * 0.3 / 4),
        change: (adjusted.protein || Math.round((adjusted.calories || recommendedCalories) * 0.3 / 4)) - 
               (current.protein || Math.round((current.calories || currentCalories) * 0.3 / 4))
      },
      carbs: {
        current: current.carbs || Math.round((current.calories || currentCalories) * 0.4 / 4),
        adjusted: adjusted.carbs || Math.round((adjusted.calories || recommendedCalories) * 0.4 / 4),
        change: (adjusted.carbs || Math.round((adjusted.calories || recommendedCalories) * 0.4 / 4)) - 
               (current.carbs || Math.round((current.calories || currentCalories) * 0.4 / 4))
      },
      fat: {
        current: current.fat || Math.round((current.calories || currentCalories) * 0.3 / 9),
        adjusted: adjusted.fat || Math.round((adjusted.calories || recommendedCalories) * 0.3 / 9),
        change: (adjusted.fat || Math.round((adjusted.calories || recommendedCalories) * 0.3 / 9)) - 
               (current.fat || Math.round((current.calories || currentCalories) * 0.3 / 9))
      }
    };
  };

  const macroComparison = formatMacroComparison(
    { calories: currentCalories }, 
    recommendation.adjustedTargets || { calories: recommendedCalories }
  );

  const getChangeColor = (change) => {
    if (Math.abs(change) < 1) return '#8E8E93';
    return change > 0 ? '#00D084' : '#FF453A';
  };

  const formatChange = (change, unit = '') => {
    if (Math.abs(change) < 1) return 'No change';
    const sign = change > 0 ? '+' : '';
    return `${sign}${Math.round(change)}${unit}`;
  };

  const handleAccept = () => {
    if (validation && !validation.isValid) {
      Alert.alert(
        'Safety Warning',
        `${validation.errors.join('\n')}\n\nAre you sure you want to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed Anyway', style: 'destructive', onPress: () => onAccept(recommendation) }
        ]
      );
    } else if (validation && validation.warnings.length > 0) {
      Alert.alert(
        'Please Note',
        validation.warnings.join('\n'),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => onAccept(recommendation) }
        ]
      );
    } else {
      onAccept(recommendation);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#00D084';
    if (confidence >= 60) return '#FF9500';
    return '#FF453A';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <LinearGradient colors={['#000000', '#1C1C1E']} style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <Text style={styles.title}>Macro Adjustment Recommendation</Text>
            <Text style={styles.subtitle}>
              Based on your weight tracking progress
            </Text>
          </View>

          {/* Confidence Score */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.confidenceLabel}>Recommendation Confidence</Text>
              <Text style={[
                styles.confidenceValue,
                { color: getConfidenceColor(confidence) }
              ]}>
                {confidence || 0}%
              </Text>
            </View>
            <View style={styles.confidenceBar}>
              <View style={[
                styles.confidenceFill,
                { 
                  width: `${confidence || 0}%`,
                  backgroundColor: getConfidenceColor(confidence)
                }
              ]} />
            </View>
            <Text style={styles.confidenceText}>
              {getConfidenceLabel(confidence)} • Based on {progressAnalytics?.dataPoints || 0} data points over {progressAnalytics?.trackingDays || 0} days
            </Text>
          </View>

          {/* Explanation */}
          <View style={styles.explanationSection}>
            <Text style={styles.sectionTitle}>Why This Adjustment?</Text>
            <Text style={styles.explanationText}>{explanation?.summary}</Text>
            
            {explanation?.details && explanation.details.length > 0 && (
              <View style={styles.detailsList}>
                {explanation.details.map((detail, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailBullet}>•</Text>
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Macro Comparison */}
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Target Changes</Text>
            
            <View style={styles.macroComparison}>
              {/* Calories */}
              <View style={styles.macroComparisonRow}>
                <Text style={styles.macroLabel}>Daily Calories</Text>
                <View style={styles.macroValues}>
                  <Text style={styles.currentValue}>{macroComparison.calories.current}</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.adjustedValue}>{macroComparison.calories.adjusted}</Text>
                  <Text style={[
                    styles.changeValue,
                    { color: getChangeColor(macroComparison.calories.change) }
                  ]}>
                    ({formatChange(macroComparison.calories.change)})
                  </Text>
                </View>
              </View>

              {/* Protein */}
              <View style={styles.macroComparisonRow}>
                <Text style={styles.macroLabel}>Protein</Text>
                <View style={styles.macroValues}>
                  <Text style={styles.currentValue}>{macroComparison.protein.current}g</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.adjustedValue}>{macroComparison.protein.adjusted}g</Text>
                  <Text style={[
                    styles.changeValue,
                    { color: getChangeColor(macroComparison.protein.change) }
                  ]}>
                    ({formatChange(macroComparison.protein.change, 'g')})
                  </Text>
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroComparisonRow}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View style={styles.macroValues}>
                  <Text style={styles.currentValue}>{macroComparison.carbs.current}g</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.adjustedValue}>{macroComparison.carbs.adjusted}g</Text>
                  <Text style={[
                    styles.changeValue,
                    { color: getChangeColor(macroComparison.carbs.change) }
                  ]}>
                    ({formatChange(macroComparison.carbs.change, 'g')})
                  </Text>
                </View>
              </View>

              {/* Fat */}
              <View style={styles.macroComparisonRow}>
                <Text style={styles.macroLabel}>Fat</Text>
                <View style={styles.macroValues}>
                  <Text style={styles.currentValue}>{macroComparison.fat.current}g</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.adjustedValue}>{macroComparison.fat.adjusted}g</Text>
                  <Text style={[
                    styles.changeValue,
                    { color: getChangeColor(macroComparison.fat.change) }
                  ]}>
                    ({formatChange(macroComparison.fat.change, 'g')})
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Implementation Plan */}
          {implementationPlan && (
            <View style={styles.implementationSection}>
              <Text style={styles.sectionTitle}>Implementation Plan</Text>
              
              <View style={[
                styles.implementationCard,
                implementationPlan.type === 'gradual' && styles.gradualImplementation
              ]}>
                <View style={styles.implementationHeader}>
                  <Text style={styles.implementationType}>
                    {implementationPlan.type === 'gradual' ? '📅 Gradual Implementation' : '⚡ Immediate Implementation'}
                  </Text>
                  <Text style={styles.implementationDuration}>
                    {implementationPlan.duration}
                  </Text>
                </View>
                
                {implementationPlan.type === 'gradual' && implementationPlan.steps && (
                  <View style={styles.implementationSteps}>
                    {implementationPlan.steps.map((step, index) => (
                      <View key={index} style={styles.implementationStep}>
                        <Text style={styles.stepWeek}>Week {step.week}</Text>
                        <Text style={styles.stepTargets}>
                          {step.targets.calories} cal • {step.targets.protein}g P • {step.targets.carbs}g C • {step.targets.fat}g F
                        </Text>
                        <Text style={styles.stepDescription}>{step.description}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {implementationPlan.rationale && (
                  <Text style={styles.implementationRationale}>
                    {implementationPlan.rationale}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Benefits */}
          {explanation?.benefits && explanation.benefits.length > 0 && (
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Expected Benefits</Text>
              <View style={styles.benefitsList}>
                {explanation.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>✓</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Safety Warnings */}
          {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
            <View style={styles.warningsSection}>
              <Text style={styles.sectionTitle}>
                {validation.errors.length > 0 ? '⚠️ Safety Concerns' : '💡 Important Notes'}
              </Text>
              
              {validation.errors.map((error, index) => (
                <View key={`error-${index}`} style={styles.errorItem}>
                  <Text style={styles.errorIcon}>❌</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ))}
              
              {validation.warnings.map((warning, index) => (
                <View key={`warning-${index}`} style={styles.warningItem}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Timeline */}
          {explanation?.timeline && (
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <Text style={styles.timelineText}>{explanation.timeline}</Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <PrimaryButton
            title="Accept Changes"
            onPress={handleAccept}
            disabled={isLoading}
            style={styles.acceptButton}
          />
          
          <View style={styles.secondaryButtons}>
            <SecondaryButton
              title="Customize"
              onPress={() => onCustomize(recommendation)}
              style={styles.customizeButton}
            />
            
            <SecondaryButton
              title="Not Now"
              onPress={onDismiss}
              style={styles.dismissButton}
            />
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Confidence Section
  confidenceSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  
  // Explanation Section
  explanationSection: {
    marginBottom: 24,
  },
  explanationText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsList: {
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailBullet: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    flex: 1,
  },

  // Macro Comparison
  comparisonSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  macroComparison: {
    gap: 16,
  },
  macroComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  macroValues: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  currentValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  arrow: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 8,
  },
  adjustedValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Implementation Section
  implementationSection: {
    marginBottom: 24,
  },
  implementationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradualImplementation: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  implementationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  implementationType: {
    fontSize: 14,
    color: '#00D084',
    fontWeight: '600',
  },
  implementationDuration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  implementationSteps: {
    marginTop: 12,
    gap: 8,
  },
  implementationStep: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  stepWeek: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTargets: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#8E8E93',
  },
  implementationRationale: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    fontSize: 16,
    color: '#00D084',
    marginRight: 8,
    marginTop: 1,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    flex: 1,
  },

  // Warnings Section
  warningsSection: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#FF453A',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    lineHeight: 20,
    flex: 1,
  },

  // Timeline Section
  timelineSection: {
    marginBottom: 24,
  },
  timelineText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Action Buttons
  actionButtons: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  acceptButton: {
    marginBottom: 16,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  customizeButton: {
    flex: 1,
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: '#8E8E93',
  },
});