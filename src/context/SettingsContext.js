import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MacroCalculationService from '../services/MacroCalculationService';

const SettingsContext = createContext();

const ACTIONS = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  UPDATE_QUICK_FOODS: 'UPDATE_QUICK_FOODS',
  UPDATE_APP_PREFERENCES: 'UPDATE_APP_PREFERENCES',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  SET_PERSONALIZED_TARGETS: 'SET_PERSONALIZED_TARGETS',
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
    case ACTIONS.UPDATE_USER_PROFILE:
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload }
      };
    case ACTIONS.SET_PERSONALIZED_TARGETS:
      return {
        ...state,
        personalizedTargets: action.payload
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

const defaultUserProfile = {
  // Basic Information
  age: null,
  gender: null, // 'male' | 'female'
  weight: null, // kg
  height: null, // cm
  bodyFat: null, // percentage (optional)
  
  // Activity & Goals
  activityLevel: null, // 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active'
  goal: null, // 'cutting' | 'bulking' | 'maintenance' | 'aggressive_cutting' | 'aggressive_bulking'
  mealsPerDay: 4, // Default to 4 meals
  
  // Profile Status
  isProfileComplete: false,
  hasCompletedOnboarding: false,
  lastUpdated: null
};

const defaultSettings = {
  selectedQuickFoods: ['1', '2', '3'], // Default to first 3 foods
  appPreferences: {
    autoOptimize: true,
    dayResetHour: 4, // Hour when the day resets (default 4 AM)
    // Cheat meal/day settings
    cheatMealsPerPeriod: 2, // Number of cheat meals allowed per period
    cheatDaysPerPeriod: 1, // Number of cheat days allowed per period  
    cheatPeriodType: 'weekly' // 'weekly' or 'monthly'
  },
  userProfile: { ...defaultUserProfile },
  personalizedTargets: null, // Will be calculated from user profile
  isLoading: true
};

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, defaultSettings);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const timestamp = new Date().toISOString();
    console.log('\n=== 🔍 [SETTINGS-LOAD] START ===');
    console.log('🔍 [SETTINGS-LOAD] Time:', timestamp);

    try {
      const storedSettings = await AsyncStorage.getItem('appSettings');

      if (storedSettings) {
        console.log('✅ [SETTINGS-LOAD] Data found! Size:', (storedSettings.length / 1024).toFixed(2), 'KB');
        const parsedSettings = JSON.parse(storedSettings);
        console.log('✅ [SETTINGS-LOAD] Has user profile:', !!parsedSettings.userProfile);
        console.log('✅ [SETTINGS-LOAD] Has personalized targets:', !!parsedSettings.personalizedTargets);
        dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: parsedSettings });
      } else {
        console.log('⚠️ [SETTINGS-LOAD] NO DATA - Using defaults');
        await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));
        console.log('⚠️ [SETTINGS-LOAD] Saved defaults to storage');
        dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: defaultSettings });
      }

      console.log('=== 🔍 [SETTINGS-LOAD] END ===\n');
    } catch (error) {
      console.error('\n❌ [SETTINGS-LOAD] ERROR!');
      console.error('❌ [SETTINGS-LOAD]:', error.message);
      console.error('❌ [SETTINGS-LOAD] Full error:', error);
      dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: defaultSettings });
      console.error('=== 🔍 [SETTINGS-LOAD] END (ERROR) ===\n');
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

  const updateUserProfile = async (profileUpdates) => {
    try {
      console.log('Updating user profile:', profileUpdates);
      
      const updatedProfile = {
        ...state.userProfile,
        ...profileUpdates,
        lastUpdated: new Date().toISOString()
      };

      // Check if profile is now complete
      const isComplete = checkProfileComplete(updatedProfile);
      if (isComplete !== updatedProfile.isProfileComplete) {
        updatedProfile.isProfileComplete = isComplete;
      }

      dispatch({ type: ACTIONS.UPDATE_USER_PROFILE, payload: updatedProfile });
      
      // If profile is complete, calculate personalized targets
      if (updatedProfile.isProfileComplete) {
        await calculateAndSetPersonalizedTargets(updatedProfile);
      }

      // Save to AsyncStorage
      const updatedSettings = { ...state, userProfile: updatedProfile };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      console.log('User profile updated and saved successfully');

    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const calculateAndSetPersonalizedTargets = async (profile, adjustedTargets = null) => {
    try {
      console.log('Calculating personalized targets for profile:', profile);
      console.log('Using adjusted targets:', adjustedTargets);

      // Validate profile has all required fields
      const errors = MacroCalculationService.validateUserProfile(profile);
      if (errors.length > 0) {
        console.warn('Profile validation errors:', errors);
        return;
      }

      let personalizedNutrition;

      if (adjustedTargets) {
        // Use the provided adjusted targets instead of recalculating
        console.log('Using provided adjusted targets instead of calculating from scratch');

        // Calculate the full nutrition structure with adjusted targets
        const baseNutrition = MacroCalculationService.calculatePersonalizedNutrition(profile);
        personalizedNutrition = {
          ...baseNutrition,
          dailyTargets: adjustedTargets,
          calculations: {
            ...baseNutrition.calculations,
            targetCalories: adjustedTargets.calories
          }
        };
      } else {
        // Calculate personalized nutrition from scratch
        personalizedNutrition = MacroCalculationService.calculatePersonalizedNutrition(profile);
      }

      console.log('Final personalized targets:', personalizedNutrition);

      dispatch({ type: ACTIONS.SET_PERSONALIZED_TARGETS, payload: personalizedNutrition });

      // Save to AsyncStorage
      const updatedSettings = { 
        ...state, 
        userProfile: profile, 
        personalizedTargets: personalizedNutrition 
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      
    } catch (error) {
      console.error('Error calculating personalized targets:', error);
    }
  };

  const checkProfileComplete = (profile) => {
    // Check if all required fields are filled
    return profile.age && profile.gender && profile.weight && profile.height && 
           profile.activityLevel && profile.goal && profile.mealsPerDay;
  };

  const resetUserProfile = async () => {
    try {
      console.log('Resetting user profile to defaults...');
      dispatch({ type: ACTIONS.UPDATE_USER_PROFILE, payload: { ...defaultUserProfile } });
      dispatch({ type: ACTIONS.SET_PERSONALIZED_TARGETS, payload: null });

      // Save to AsyncStorage  
      const updatedSettings = { 
        ...state, 
        userProfile: { ...defaultUserProfile }, 
        personalizedTargets: null 
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      console.log('User profile reset successfully');

    } catch (error) {
      console.error('Error resetting user profile:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      const updatedProfile = {
        ...state.userProfile,
        hasCompletedOnboarding: true,
        lastUpdated: new Date().toISOString()
      };

      dispatch({ type: ACTIONS.UPDATE_USER_PROFILE, payload: updatedProfile });

      // Save to AsyncStorage
      const updatedSettings = { ...state, userProfile: updatedProfile };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      console.log('Onboarding completed successfully');

    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const clearAllData = async () => {
    try {
      console.log('Clearing all AsyncStorage data...');
      // Clear ALL AsyncStorage data including all context data and time simulation
      await AsyncStorage.multiRemove([
        // Settings & User Data
        'appSettings',
        // Food & Meal Data  
        'foods', 
        'meals', 
        'mealPlans', 
        'meal_presets',
        'dailySummaries',
        // Weight Tracking Data
        'weightEntries',
        'weightSettings', 
        'lastMacroAdjustment',
        // Time Simulation Data
        'timeOffset'
      ]);
      console.log('AsyncStorage cleared successfully');
      dispatch({ type: ACTIONS.RESET_SETTINGS });
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{
      // Existing settings
      selectedQuickFoods: state.selectedQuickFoods,
      appPreferences: state.appPreferences,
      isLoading: state.isLoading,
      updateQuickFoods,
      updateAppPreferences,
      resetSettings,
      clearAllData,
      
      // User Profile & Personalized Targets
      userProfile: state.userProfile,
      personalizedTargets: state.personalizedTargets,
      updateUserProfile,
      calculateAndSetPersonalizedTargets,
      resetUserProfile,
      completeOnboarding,
      checkProfileComplete
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