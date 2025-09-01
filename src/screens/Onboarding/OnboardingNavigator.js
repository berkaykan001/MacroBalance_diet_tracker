import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import BasicInfoScreen from './BasicInfoScreen';
import ActivityLevelScreen from './ActivityLevelScreen';
import GoalSelectionScreen from './GoalSelectionScreen';
import MealFrequencyScreen from './MealFrequencyScreen';
import BodyFatScreen from './BodyFatScreen';
import CompletionScreen from './CompletionScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C1C1E',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: '#000000' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BasicInfo" 
        component={BasicInfoScreen} 
        options={{ 
          title: 'Basic Information',
          headerLeft: () => null // Prevent going back from first real step
        }}
      />
      <Stack.Screen 
        name="ActivityLevel" 
        component={ActivityLevelScreen} 
        options={{ title: 'Activity Level' }}
      />
      <Stack.Screen 
        name="GoalSelection" 
        component={GoalSelectionScreen} 
        options={{ title: 'Your Goal' }}
      />
      <Stack.Screen 
        name="MealFrequency" 
        component={MealFrequencyScreen} 
        options={{ title: 'Meal Frequency' }}
      />
      <Stack.Screen 
        name="BodyFat" 
        component={BodyFatScreen} 
        options={{ title: 'Body Composition' }}
      />
      <Stack.Screen 
        name="Completion" 
        component={CompletionScreen} 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Prevent swiping back from completion
        }}
      />
    </Stack.Navigator>
  );
}