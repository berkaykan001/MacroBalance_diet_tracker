import React from 'react';
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
            title: '🏠 Dashboard',
          }}
        />
        <Tab.Screen 
          name="Plan Meal" 
          component={MealPlanningScreen}
          options={{
            title: '🍽️ Plan Meal',
          }}
        />
        <Tab.Screen 
          name="Foods" 
          component={FoodManagementScreen}
          options={{
            title: '🥗 Foods',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: '⚙️ Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}