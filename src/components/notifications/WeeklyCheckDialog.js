/**
 * WeeklyCheckDialog - Modal for weekly weight check prompts
 * 
 * Displays when user needs to log their weekly weight and handles
 * the weight entry process with immediate macro adjustment feedback
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Pressable, 
  TextInput, 
  ScrollView,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WeeklyCheckDialog({
  visible,
  notification,
  onLogWeight,
  onDismiss,
  isProcessing = false
}) {
  const [weight, setWeight] = useState('');
  const [weightError, setWeightError] = useState('');

  if (!notification || !visible) return null;

  const { data } = notification;
  const { checkResult, userProfile, isFirstEntry } = data;

  const validateWeight = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid weight';
    }
    if (numValue < 30 || numValue > 300) {
      return 'Weight must be between 30-300 kg';
    }
    return null;
  };

  const handleWeightChange = (text) => {
    setWeight(text);
    if (weightError) {
      setWeightError('');
    }
  };

  const handleLogWeight = async () => {
    const error = validateWeight(weight);
    if (error) {
      setWeightError(error);
      return;
    }

    const result = await onLogWeight(parseFloat(weight));
    
    if (result.success) {
      setWeight('');
      setWeightError('');
      
      // Show success message
      if (result.requiresAdjustment) {
        Alert.alert(
          'Weight Logged! 📊',
          'Based on your progress, we have some macro recommendations for you.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Great Job! ✅',
          result.message || 'Weight logged successfully!',
          [{ text: 'OK' }]
        );
      }
    } else {
      setWeightError(result.error || 'Failed to log weight');
    }
  };

  const handleDismiss = (action) => {
    setWeight('');
    setWeightError('');
    onDismiss(action);
  };

  const getIcon = () => {
    if (isFirstEntry) return '🎯';
    if (checkResult.isOverdue) return '⚠️';
    return '📊';
  };

  const getProgressMessage = () => {
    if (isFirstEntry) {
      return 'Starting your weight tracking journey will help us personalize your macro targets perfectly for your goals.';
    }
    
    if (checkResult.isOverdue) {
      return `It's been ${checkResult.daysSinceLastEntry} days since your last weigh-in. Regular tracking helps us keep your macros optimized for your ${userProfile.goal} goal.`;
    }
    
    return `Ready for your weekly check-in? Your last weight was ${checkResult.lastWeight}kg on ${new Date(checkResult.lastDate).toLocaleDateString()}.`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => handleDismiss('dismiss')}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>{getIcon()}</Text>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.subtitle}>{getProgressMessage()}</Text>
            </View>

            {/* Weight Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Your Current Weight</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, weightError && styles.inputError]}
                  value={weight}
                  onChangeText={handleWeightChange}
                  placeholder={checkResult.lastWeight ? checkResult.lastWeight.toString() : "Enter weight"}
                  placeholderTextColor="#8E8E93"
                  keyboardType="decimal-pad"
                  selectionColor="#00D084"
                  editable={!isProcessing}
                />
                <Text style={styles.inputSuffix}>kg</Text>
              </View>
              {weightError ? (
                <Text style={styles.errorText}>{weightError}</Text>
              ) : null}
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 For Best Results</Text>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Weigh yourself at the same time each day</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Best time is morning, after using the bathroom</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Focus on weekly trends, not daily fluctuations</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable 
                style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
                onPress={handleLogWeight}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={isProcessing ? ['#444444', '#333333'] : ['#00D084', '#00A86B']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.primaryButtonText, isProcessing && styles.buttonTextDisabled]}>
                    {isProcessing ? 'Logging Weight...' : 'Log Weight'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.secondaryActions}>
                <Pressable 
                  style={styles.secondaryButton}
                  onPress={() => handleDismiss('remind_later')}
                  disabled={isProcessing}
                >
                  <Text style={styles.secondaryButtonText}>Remind Me Later</Text>
                </Pressable>

                <Pressable 
                  style={styles.tertiaryButton}
                  onPress={() => handleDismiss('skip_week')}
                  disabled={isProcessing}
                >
                  <Text style={styles.tertiaryButtonText}>Skip This Week</Text>
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
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
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
    lineHeight: 20,
  },
  inputSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  inputSuffix: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 16,
  },
  inputError: {
    borderColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(0, 208, 132, 0.05)',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    color: '#00D084',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tip: {
    marginBottom: 4,
  },
  tipText: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
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