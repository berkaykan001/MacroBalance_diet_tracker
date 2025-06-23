import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FoodManagementScreen from '../screens/FoodManagement/FoodManagementScreen';
import DishCreatorScreen from '../screens/DishCreator/DishCreatorScreen';

const Stack = createStackNavigator();

export default function FoodsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We're using custom headers in each screen
        cardStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen 
        name="FoodManagement" 
        component={FoodManagementScreen}
      />
      <Stack.Screen 
        name="DishCreator" 
        component={DishCreatorScreen}
      />
    </Stack.Navigator>
  );
}