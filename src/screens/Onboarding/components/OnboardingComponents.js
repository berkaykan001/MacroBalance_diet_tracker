import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Progress indicator showing current step
export function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{currentStep} of {totalSteps}</Text>
    </View>
  );
}

// Primary action button with gradient
export function PrimaryButton({ title, onPress, disabled = false, style }) {
  return (
    <Pressable 
      style={[styles.primaryButtonContainer, disabled && styles.buttonDisabled, style]}
      onPress={disabled ? null : onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ['#444444', '#333333'] : ['#00D084', '#00A86B']}
        style={styles.primaryButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.primaryButtonText, disabled && styles.buttonTextDisabled]}>
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

// Secondary button (outline style)
export function SecondaryButton({ title, onPress, style }) {
  return (
    <Pressable 
      style={[styles.secondaryButton, style]}
      onPress={onPress}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

// Input field with label
export function InputField({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  suffix,
  error 
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          keyboardType={keyboardType}
          selectionColor="#00D084"
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Selection option card
export function SelectionCard({ 
  title, 
  subtitle, 
  description, 
  selected = false, 
  onPress,
  icon 
}) {
  return (
    <Pressable 
      style={[styles.selectionCard, selected && styles.selectionCardSelected]}
      onPress={onPress}
    >
      <View style={styles.selectionCardContent}>
        {icon && <Text style={styles.selectionIcon}>{icon}</Text>}
        <View style={styles.selectionTextContainer}>
          <Text style={[styles.selectionTitle, selected && styles.selectionTitleSelected]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.selectionSubtitle, selected && styles.selectionSubtitleSelected]}>
              {subtitle}
            </Text>
          )}
          {description && (
            <Text style={styles.selectionDescription}>{description}</Text>
          )}
        </View>
        <View style={[styles.selectionIndicator, selected && styles.selectionIndicatorSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>
    </Pressable>
  );
}

// Gender selection buttons
export function GenderSelector({ selectedGender, onGenderSelect }) {
  return (
    <View style={styles.genderContainer}>
      <Pressable
        style={[
          styles.genderButton,
          selectedGender === 'male' && styles.genderButtonSelected
        ]}
        onPress={() => onGenderSelect('male')}
      >
        <Text style={styles.genderIcon}>👨</Text>
        <Text style={[
          styles.genderText,
          selectedGender === 'male' && styles.genderTextSelected
        ]}>Male</Text>
      </Pressable>
      
      <Pressable
        style={[
          styles.genderButton,
          selectedGender === 'female' && styles.genderButtonSelected
        ]}
        onPress={() => onGenderSelect('female')}
      >
        <Text style={styles.genderIcon}>👩</Text>
        <Text style={[
          styles.genderText,
          selectedGender === 'female' && styles.genderTextSelected
        ]}>Female</Text>
      </Pressable>
    </View>
  );
}

// Main container for onboarding screens
export function OnboardingContainer({ children, showProgress = true, currentStep, totalSteps }) {
  return (
    <LinearGradient
      colors={['#000000', '#1C1C1E']}
      style={styles.container}
    >
      {showProgress && (
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      )}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Progress indicator
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
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

  // Button styles
  primaryButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#00D084',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryButtonText: {
    color: '#00D084',
    fontSize: 16,
    fontWeight: '600',
  },

  // Input styles
  inputContainer: {
    marginVertical: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
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
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputSuffix: {
    color: '#8E8E93',
    fontSize: 16,
    paddingRight: 16,
  },
  inputError: {
    borderColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },

  // Selection card styles
  selectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectionCardSelected: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  selectionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  selectionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  selectionTextContainer: {
    flex: 1,
  },
  selectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectionTitleSelected: {
    color: '#00D084',
  },
  selectionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectionSubtitleSelected: {
    color: '#66E6AC',
  },
  selectionDescription: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    borderColor: '#00D084',
    backgroundColor: '#00D084',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Gender selector
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonSelected: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  genderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  genderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  genderTextSelected: {
    color: '#00D084',
  },
});

export default {
  ProgressIndicator,
  PrimaryButton,
  SecondaryButton,
  InputField,
  SelectionCard,
  GenderSelector,
  OnboardingContainer,
};