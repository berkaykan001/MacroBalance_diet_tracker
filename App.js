import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { FoodProvider } from './src/context/FoodContext';
import { MealProvider } from './src/context/MealContext';
import { SettingsProvider } from './src/context/SettingsContext';

// Test AsyncStorage availability
import AsyncStorage from '@react-native-async-storage/async-storage';

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

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('App: Starting initialization...');
      
      // Test AsyncStorage
      await AsyncStorage.setItem('test', 'test');
      await AsyncStorage.removeItem('test');
      console.log('App: AsyncStorage working');
      
      // Small delay to ensure native modules are ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('App: Initialization complete');
      setIsReady(true);
    } catch (error) {
      console.error('App: Initialization failed:', error);
      setInitError(error);
    }
  };

  if (initError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Startup Error!</Text>
          <Text style={styles.errorDetails}>{initError.toString()}</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.errorText}>Loading MacroBalance...</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }
  
  try {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ErrorBoundary>
          <SettingsProvider>
            <FoodProvider>
              <MealProvider>
                <AppNavigator />
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
