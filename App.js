import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { FoodProvider } from './src/context/FoodContext';
import { MealProvider } from './src/context/MealContext';

export default function App() {
  return (
    <FoodProvider>
      <MealProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </MealProvider>
    </FoodProvider>
  );
}
