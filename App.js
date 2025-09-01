import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { FoodProvider } from './src/context/FoodContext';
import { MealProvider } from './src/context/MealContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { PresetProvider } from './src/context/PresetContext';
import { WeightProvider } from './src/context/WeightContext';
import MacroAdjustmentDialog from './src/components/MacroAdjustmentDialog';
import { useMacroAdjustments } from './src/hooks/useWeightTrackingIntegration';

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong!</Text>
          <Text style={styles.errorDetails}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Match app background
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetails: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

// Component to handle macro adjustment dialog
function MacroAdjustmentManager() {
  const {
    showAdjustmentDialog,
    currentRecommendation,
    isApplyingAdjustment,
    acceptMacroAdjustment,
    customizeMacroAdjustment,
    dismissAdjustmentDialog
  } = useMacroAdjustments();

  const handleAccept = async (recommendation) => {
    try {
      const result = await acceptMacroAdjustment(recommendation);
      if (result.success) {
        Alert.alert('Success!', result.message || 'Your macro targets have been updated based on your progress.');
      } else {
        Alert.alert('Error', result.error || 'Failed to apply macro adjustment. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while updating your targets.');
    }
  };

  const handleCustomize = (recommendation) => {
    const result = customizeMacroAdjustment(recommendation);
    if (result.action === 'navigate_to_settings') {
      Alert.alert(
        'Manual Adjustment',
        'You can manually adjust your macro targets in the Settings screen.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <MacroAdjustmentDialog
      visible={showAdjustmentDialog}
      recommendation={currentRecommendation}
      onAccept={handleAccept}
      onCustomize={handleCustomize}
      onDismiss={dismissAdjustmentDialog}
      isLoading={isApplyingAdjustment}
    />
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  
  try {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ErrorBoundary>
          <SettingsProvider>
            <FoodProvider>
              <MealProvider>
                <WeightProvider>
                  <PresetProvider>
                    <AppNavigator />
                    <MacroAdjustmentManager />
                  </PresetProvider>
                </WeightProvider>
              </MealProvider>
            </FoodProvider>
          </SettingsProvider>
        </ErrorBoundary>
        <StatusBar style="light" />
      </View>
    );
  } catch (error) {
    console.error('Critical App Error:', error);
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Critical Error!</Text>
          <Text style={styles.errorDetails}>{error.toString()}</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
