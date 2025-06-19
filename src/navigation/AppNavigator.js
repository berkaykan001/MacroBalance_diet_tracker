import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/Home/HomeScreen';
import MealPlanningScreen from '../screens/MealPlanning/MealPlanningScreen';
import FoodManagementScreen from '../screens/FoodManagement/FoodManagementScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#1C1C1E',
            borderTopColor: '#38383A',
          },
          headerShown: false, // Remove top navigation headers
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
          component={FoodManagementScreen}
          options={{
            title: 'Foods',
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
    </NavigationContainer>
  );
}