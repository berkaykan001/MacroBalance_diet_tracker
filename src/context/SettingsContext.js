import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

const ACTIONS = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  UPDATE_QUICK_FOODS: 'UPDATE_QUICK_FOODS',
  UPDATE_APP_PREFERENCES: 'UPDATE_APP_PREFERENCES',
  RESET_SETTINGS: 'RESET_SETTINGS'
};

function settingsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_SETTINGS:
      return {
        ...state,
        ...action.payload,
        isLoading: false
      };
    case ACTIONS.UPDATE_QUICK_FOODS:
      return {
        ...state,
        selectedQuickFoods: action.payload
      };
    case ACTIONS.UPDATE_APP_PREFERENCES:
      return {
        ...state,
        appPreferences: { ...state.appPreferences, ...action.payload }
      };
    case ACTIONS.RESET_SETTINGS:
      return {
        ...defaultSettings,
        isLoading: false
      };
    default:
      return state;
  }
}

const defaultSettings = {
  selectedQuickFoods: ['1', '2', '3'], // Default to first 3 foods
  appPreferences: {
    autoOptimize: true
  },
  isLoading: true
};

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, defaultSettings);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('appSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: parsedSettings });
      } else {
        // Save default settings to storage
        await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));
        dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: defaultSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: defaultSettings });
    }
  };

  const updateQuickFoods = async (foodIds) => {
    try {
      dispatch({ type: ACTIONS.UPDATE_QUICK_FOODS, payload: foodIds });
      
      // Save to AsyncStorage
      const updatedSettings = { ...state, selectedQuickFoods: foodIds };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      console.log('Quick foods updated and saved:', foodIds);
    } catch (error) {
      console.error('Error updating quick foods:', error);
    }
  };

  const updateAppPreferences = async (preferences) => {
    try {
      dispatch({ type: ACTIONS.UPDATE_APP_PREFERENCES, payload: preferences });
      
      // Save to AsyncStorage
      const updatedSettings = { 
        ...state, 
        appPreferences: { ...state.appPreferences, ...preferences }
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating app preferences:', error);
    }
  };

  const resetSettings = async () => {
    try {
      console.log('Resetting settings to defaults...');
      dispatch({ type: ACTIONS.RESET_SETTINGS });
      await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      console.log('Settings reset successfully');
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const clearAllData = async () => {
    try {
      console.log('Clearing all AsyncStorage data...');
      // Clear all AsyncStorage data including mealPlans
      await AsyncStorage.multiRemove(['appSettings', 'foods', 'meals', 'mealPlans']);
      console.log('AsyncStorage cleared successfully');
      dispatch({ type: ACTIONS.RESET_SETTINGS });
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{
      selectedQuickFoods: state.selectedQuickFoods,
      appPreferences: state.appPreferences,
      isLoading: state.isLoading,
      updateQuickFoods,
      updateAppPreferences,
      resetSettings,
      clearAllData
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}