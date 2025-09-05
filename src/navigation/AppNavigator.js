import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useSettings } from '../context/SettingsContext';
import OnboardingNavigator from '../screens/Onboarding/OnboardingNavigator';
import HomeScreen from '../screens/Home/HomeScreen';
import MealPlanningScreen from '../screens/MealPlanning/MealPlanningScreen';
import FoodsStackNavigator from './FoodsStackNavigator';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00D084',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopColor: '#38383A',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color: color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Plan Meal" 
        component={MealPlanningScreen}
        options={{
          title: 'Plan Meal',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color: color }}>🍽️</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Foods" 
        component={FoodsStackNavigator}
        options={{
          title: 'Food Database',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color: color }}>🥗</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color: color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading MacroBalance...</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { userProfile, isLoading } = useSettings();
  const [initialRouteName, setInitialRouteName] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      const hasCompletedOnboarding = userProfile?.hasCompletedOnboarding;
      setInitialRouteName(hasCompletedOnboarding ? 'MainApp' : 'Onboarding');
    }
  }, [isLoading, userProfile]);

  if (isLoading || !initialRouteName) {
    return (
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during onboarding
          cardStyle: { flex: 1 }, // Fix for React Navigation Web scrolling
          animationEnabled: false, // Disable animations that create overlays
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingNavigator} 
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainTabNavigator} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});