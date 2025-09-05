/**
 * MacroAdjustmentDialog - Modal for displaying macro adjustment recommendations
 * 
 * Shows when the app recommends macro changes based on weight progress analysis.
 * Displays detailed explanation and allows user to accept, customize, or dismiss changes.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Pressable, 
  ScrollView,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MacroAdjustmentDialog({
  visible,
  notification,
  onAcceptAdjustment,
  onCustomizeAdjustment,
  onDismiss,
  isProcessing = false
}) {
  if (!notification || !visible) return null;

  const { data } = notification;
  const { recommendation, explanation, adjustmentData } = data;
  const { adjustment, currentCalories, recommendedCalories, confidence } = recommendation;

  const isIncrease = adjustment > 0;
  const magnitude = Math.abs(adjustment);

  const handleAccept = async () => {
    const result = await onAcceptAdjustment(adjustmentData);
    
    if (result.success) {
      Alert.alert(
        'Macros Updated! ✅',
        'Your new macro targets have been applied based on your progress.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Update Failed',
        result.error || 'Failed to update macro targets',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCustomize = () => {
    // For now, just dismiss - in future could open customization screen
    Alert.alert(
      'Customization Coming Soon',
      'Manual macro customization will be available in a future update. For now, you can accept the recommendation or keep your current macros.',
      [{ text: 'OK' }]
    );
  };

  const handleDismiss = (keepCurrent = true) => {
    onDismiss(keepCurrent);
  };

  const formatMacros = (calories) => {
    // Estimate macro breakdown based on typical ratios
    const proteinCals = calories * 0.30; // 30% protein
    const carbCals = calories * 0.40;    // 40% carbs  
    const fatCals = calories * 0.30;     // 30% fat
    
    return {
      protein: Math.round(proteinCals / 4),
      carbs: Math.round(carbCals / 4),
      fat: Math.round(fatCals / 9)
    };
  };

  const currentMacros = formatMacros(currentCalories);
  const newMacros = formatMacros(recommendedCalories);

  const getAdjustmentIcon = () => {
    return isIncrease ? '📈' : '📉';
  };

  const getProgressSummary = () => {
    const { progressAnalytics } = adjustmentData;
    const weeklyTrend = progressAnalytics?.weeklyTrend || 0;
    const direction = weeklyTrend > 0 ? 'gaining' : weeklyTrend < 0 ? 'losing' : 'maintaining';
    const rate = Math.abs(weeklyTrend).toFixed(1);
    
    return `You're currently ${direction} ${rate} kg/week`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => handleDismiss(true)}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>{getAdjustmentIcon()}</Text>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.subtitle}>{getProgressSummary()}</Text>
            </View>

            {/* Explanation */}
            <View style={styles.explanationSection}>
              <Text style={styles.explanationTitle}>Why This Adjustment?</Text>
              <Text style={styles.explanationText}>{explanation.summary}</Text>
              
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence Level</Text>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { width: `${confidence}%` },
                      { backgroundColor: confidence > 80 ? '#00D084' : confidence > 60 ? '#FF9500' : '#FF453A' }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceText}>{confidence}%</Text>
              </View>
            </View>

            {/* Macro Comparison */}
            <View style={styles.comparisonSection}>
              <Text style={styles.sectionTitle}>Macro Changes</Text>
              
              <View style={styles.macroComparison}>
                {/* Current Macros */}
                <View style={styles.macroColumn}>
                  <Text style={styles.macroColumnTitle}>Current</Text>
                  <View style={styles.macroCard}>
                    <Text style={styles.calorieText}>{currentCalories}</Text>
                    <Text style={styles.calorieLabel}>calories</Text>
                    <View style={styles.macroBreakdown}>
                      <Text style={styles.macroText}>{currentMacros.protein}g protein</Text>
                      <Text style={styles.macroText}>{currentMacros.carbs}g carbs</Text>
                      <Text style={styles.macroText}>{currentMacros.fat}g fat</Text>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>

                {/* New Macros */}
                <View style={styles.macroColumn}>
                  <Text style={styles.macroColumnTitle}>Recommended</Text>
                  <View style={[styles.macroCard, styles.macroCardHighlight]}>
                    <Text style={styles.calorieText}>{recommendedCalories}</Text>
                    <Text style={styles.calorieLabel}>calories</Text>
                    <View style={styles.macroBreakdown}>
                      <Text style={styles.macroText}>{newMacros.protein}g protein</Text>
                      <Text style={styles.macroText}>{newMacros.carbs}g carbs</Text>
                      <Text style={styles.macroText}>{newMacros.fat}g fat</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.changeIndicator}>
                <Text style={styles.changeText}>
                  {isIncrease ? '+' : ''}{adjustment} calories per day
                </Text>
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Expected Benefits</Text>
              {explanation.benefits?.map((benefit, index) => (
                <View key={index} style={styles.benefit}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Timeline */}
            {explanation.timeline && (
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>Implementation</Text>
                <Text style={styles.timelineText}>{explanation.timeline}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable 
                style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
                onPress={handleAccept}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={isProcessing ? ['#444444', '#333333'] : ['#00D084', '#00A86B']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.primaryButtonText, isProcessing && styles.buttonTextDisabled]}>
                    {isProcessing ? 'Updating Macros...' : 'Apply Changes'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.secondaryActions}>
                <Pressable 
                  style={styles.secondaryButton}
                  onPress={handleCustomize}
                  disabled={isProcessing}
                >
                  <Text style={styles.secondaryButtonText}>Customize</Text>
                </Pressable>

                <Pressable 
                  style={styles.tertiaryButton}
                  onPress={() => handleDismiss(true)}
                  disabled={isProcessing}
                >
                  <Text style={styles.tertiaryButtonText}>Keep Current</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    maxWidth: 450,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  explanationSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  explanationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginRight: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 12,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  macroComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroColumn: {
    flex: 1,
  },
  macroColumnTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  macroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  macroCardHighlight: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  calorieText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  calorieLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  macroBreakdown: {
    alignItems: 'center',
  },
  macroText: {
    color: '#8E8E93',
    fontSize: 11,
    marginBottom: 2,
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrow: {
    color: '#00D084',
    fontSize: 20,
    fontWeight: 'bold',
  },
  changeIndicator: {
    alignItems: 'center',
    marginTop: 12,
  },
  changeText: {
    color: '#00D084',
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitIcon: {
    color: '#00D084',
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  timelineSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 153, 0, 0.05)',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
  },
  timelineText: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: '#999999',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  tertiaryButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
});