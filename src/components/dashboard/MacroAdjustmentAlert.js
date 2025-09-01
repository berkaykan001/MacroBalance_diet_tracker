import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMacroAdjustments } from '../../hooks/useWeightTrackingIntegration';

export default function MacroAdjustmentAlert({ 
  onPress, 
  onDismiss,
  style,
  compact = false 
}) {
  const {
    showAdjustmentDialog,
    currentRecommendation
  } = useMacroAdjustments();

  // Only show if there's a pending recommendation
  if (!currentRecommendation) {
    return null;
  }

  const { 
    explanation, 
    adjustment, 
    confidence,
    recommendedCalories,
    currentCalories
  } = currentRecommendation;

  const getAdjustmentType = () => {
    if (Math.abs(adjustment) < 50) return { type: 'minor', color: '#FF9500', icon: '📊' };
    if (Math.abs(adjustment) < 150) return { type: 'moderate', color: '#FF9500', icon: '⚡' };
    return { type: 'major', color: '#FF453A', icon: '🎯' };
  };

  const adjustmentType = getAdjustmentType();

  const getConfidenceDisplay = () => {
    if (confidence >= 80) return { text: 'High confidence', color: '#00D084' };
    if (confidence >= 60) return { text: 'Medium confidence', color: '#FF9500' };
    return { text: 'Low confidence', color: '#FF453A' };
  };

  const confidenceDisplay = getConfidenceDisplay();

  if (compact) {
    return (
      <Pressable style={[styles.compactContainer, style]} onPress={onPress}>
        <LinearGradient
          colors={['rgba(255, 149, 0, 0.2)', 'rgba(255, 149, 0, 0.1)']}
          style={styles.compactGradient}
        >
          <View style={styles.compactHeader}>
            <Text style={styles.compactIcon}>{adjustmentType.icon}</Text>
            <View style={styles.compactTextContainer}>
              <Text style={styles.compactTitle}>Macro Update Available</Text>
              <Text style={styles.compactSubtitle}>
                {adjustment > 0 ? '+' : ''}{Math.round(adjustment)} calories • {confidenceDisplay.text}
              </Text>
            </View>
            <View style={styles.compactBadge}>
              <Text style={styles.compactBadgeText}>!</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[
          'rgba(255, 149, 0, 0.15)',
          'rgba(255, 149, 0, 0.1)',
          'rgba(255, 149, 0, 0.05)'
        ]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: adjustmentType.color + '30' }]}>
              <Text style={styles.icon}>{adjustmentType.icon}</Text>
            </View>
            <View>
              <Text style={styles.title}>Macro Adjustment Recommended</Text>
              <Text style={styles.subtitle}>
                Based on your weight tracking progress
              </Text>
            </View>
          </View>
          
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>
            {explanation?.summary || 'Your progress suggests a macro adjustment would be beneficial.'}
          </Text>
        </View>

        {/* Key Numbers */}
        <View style={styles.numbersSection}>
          <View style={styles.numberItem}>
            <Text style={styles.numberLabel}>Adjustment</Text>
            <Text style={[
              styles.numberValue,
              { color: adjustment > 0 ? '#00D084' : '#FF453A' }
            ]}>
              {adjustment > 0 ? '+' : ''}{Math.round(adjustment)}
            </Text>
            <Text style={styles.numberUnit}>calories</Text>
          </View>
          
          <View style={styles.numberDivider} />
          
          <View style={styles.numberItem}>
            <Text style={styles.numberLabel}>New Target</Text>
            <Text style={styles.numberValue}>{Math.round(recommendedCalories)}</Text>
            <Text style={styles.numberUnit}>cal/day</Text>
          </View>
          
          <View style={styles.numberDivider} />
          
          <View style={styles.numberItem}>
            <Text style={styles.numberLabel}>Confidence</Text>
            <Text style={[styles.numberValue, { color: confidenceDisplay.color }]}>
              {confidence || 0}%
            </Text>
            <Text style={styles.numberUnit}>sure</Text>
          </View>
        </View>

        {/* Benefits Preview */}
        {explanation?.benefits && explanation.benefits.length > 0 && (
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Expected Benefits:</Text>
            <Text style={styles.benefitPreview}>
              {explanation.benefits[0]}
              {explanation.benefits.length > 1 && ` +${explanation.benefits.length - 1} more`}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Pressable style={styles.primaryAction} onPress={onPress}>
            <Text style={styles.primaryActionText}>Review Changes</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryAction} onPress={onDismiss}>
            <Text style={styles.secondaryActionText}>Not Now</Text>
          </Pressable>
        </View>

        {/* Confidence Indicator */}
        <View style={styles.confidenceIndicator}>
          <View style={[
            styles.confidenceFill,
            { 
              width: `${confidence || 0}%`,
              backgroundColor: confidenceDisplay.color
            }
          ]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full Alert Styles
  container: {
    borderRadius: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dismissButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 14,
    color: '#8E8E93',
  },

  // Summary
  summarySection: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // Numbers Section
  numbersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  numberItem: {
    flex: 1,
    alignItems: 'center',
  },
  numberDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  numberLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  numberValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  numberUnit: {
    fontSize: 10,
    color: '#8E8E93',
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitPreview: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },

  // Actions Section
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },

  // Confidence Indicator
  confidenceIndicator: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Compact Alert Styles
  compactContainer: {
    borderRadius: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },
  compactGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  compactBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});