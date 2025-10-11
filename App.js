import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Alert, LogBox, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  async componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);

    // Store crash log locally for debugging
    try {
      const crashLog = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        errorInfo: errorInfo,
        componentStack: errorInfo.componentStack
      };

      const existingCrashLogs = await AsyncStorage.getItem('crashLogs');
      const crashLogs = existingCrashLogs ? JSON.parse(existingCrashLogs) : [];
      crashLogs.push(crashLog);

      // Keep only last 10 crash logs
      if (crashLogs.length > 10) {
        crashLogs.splice(0, crashLogs.length - 10);
      }

      await AsyncStorage.setItem('crashLogs', JSON.stringify(crashLogs));
      console.log('Crash log saved to AsyncStorage');
    } catch (storageError) {
      console.error('Failed to save crash log:', storageError);
    }
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

  // Global error handling and crash logging
  useEffect(() => {
    let originalErrorHandler = null;
    let originalConsoleError = null;

    try {
      // Set up global error handler (if available)
      if (typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler) {
        originalErrorHandler = ErrorUtils.getGlobalHandler();

        ErrorUtils.setGlobalHandler((error, isFatal) => {
          console.error('Global Error:', error, 'Fatal:', isFatal);

          // Simple crash log storage (non-blocking)
          AsyncStorage.getItem('crashLogs')
            .then(existing => {
              const crashLogs = existing ? JSON.parse(existing) : [];
              crashLogs.push({
                timestamp: new Date().toISOString(),
                error: error.toString(),
                stack: error.stack,
                isFatal,
                type: 'global'
              });

              if (crashLogs.length > 10) {
                crashLogs.splice(0, crashLogs.length - 10);
              }

              return AsyncStorage.setItem('crashLogs', JSON.stringify(crashLogs));
            })
            .catch(() => {}); // Ignore storage errors

          // Call original handler if available
          if (originalErrorHandler) {
            originalErrorHandler(error, isFatal);
          }
        });
      }

      // Enhanced console error logging
      originalConsoleError = console.error;
      console.error = (...args) => {
        // Simple debug log storage (non-blocking)
        AsyncStorage.getItem('debugLogs')
          .then(existing => {
            const logs = existing ? JSON.parse(existing) : [];
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'console.error',
              args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
            });

            if (logs.length > 50) {
              logs.splice(0, logs.length - 50);
            }

            return AsyncStorage.setItem('debugLogs', JSON.stringify(logs));
          })
          .catch(() => {}); // Ignore storage errors

        originalConsoleError(...args);
      };
    } catch (setupError) {
      console.log('Error setting up global error handling:', setupError);
    }

    return () => {
      try {
        if (originalErrorHandler && typeof ErrorUtils !== 'undefined' && ErrorUtils.setGlobalHandler) {
          ErrorUtils.setGlobalHandler(originalErrorHandler);
        }
        if (originalConsoleError) {
          console.error = originalConsoleError;
        }
      } catch (cleanupError) {
        console.log('Error cleaning up error handlers:', cleanupError);
      }
    };
  }, []);

  // Fix React Navigation mouse wheel blocking on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Add CSS to prevent hidden React Navigation overlays from blocking mouse events
      const style = document.createElement('style');
      style.innerHTML = `
        /* Fix for React Navigation blocking mouse wheel events */
        [aria-hidden="true"] {
          pointer-events: none !important;
        }
        [aria-hidden="true"] * {
          pointer-events: none !important;
        }
        [style*="display: none"] {
          pointer-events: none !important;
        }
        
        /* Re-enable for visible content */
        [aria-hidden="false"] {
          pointer-events: auto !important;
        }
        [aria-hidden="false"] * {
          pointer-events: auto !important;
        }
        
        /* Hide web scrollbars to match dashboard style */
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);
  
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
