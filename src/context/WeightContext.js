import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightTrackingService } from '../services/WeightTrackingService';

const WeightContext = createContext();

const ACTIONS = {
  LOAD_WEIGHT_DATA: 'LOAD_WEIGHT_DATA',
  ADD_WEIGHT_ENTRY: 'ADD_WEIGHT_ENTRY',
  UPDATE_WEIGHT_ENTRY: 'UPDATE_WEIGHT_ENTRY',
  DELETE_WEIGHT_ENTRY: 'DELETE_WEIGHT_ENTRY',
  UPDATE_PROGRESS_ANALYTICS: 'UPDATE_PROGRESS_ANALYTICS',
  UPDATE_WEIGHT_SETTINGS: 'UPDATE_WEIGHT_SETTINGS',
  SET_MACRO_ADJUSTMENT_RECOMMENDATION: 'SET_MACRO_ADJUSTMENT_RECOMMENDATION',
  DISMISS_MACRO_ADJUSTMENT: 'DISMISS_MACRO_ADJUSTMENT',
  RESET_WEIGHT_DATA: 'RESET_WEIGHT_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

const defaultWeightSettings = {
  trackingEnabled: true,
  units: 'metric', // 'metric' | 'imperial'
  goalWeight: null,
  weeklyGoal: null, // target kg/week change
  autoAdjustMacros: true,
  adjustmentSensitivity: 'medium', // 'low' | 'medium' | 'high'
  minimumWeeksForAdjustment: 2,
  reminderSettings: {
    enabled: false,
    frequency: 'weekly', // 'daily' | 'weekly'
    time: '08:00'
  }
};

const initialState = {
  // Weight entries data
  weightEntries: [],
  
  // Progress analytics
  progressAnalytics: null,
  lastAnalyticsUpdate: null,
  
  // Weight tracking settings
  weightSettings: defaultWeightSettings,
  
  // Macro adjustment system
  macroAdjustmentRecommendation: null,
  pendingMacroAdjustment: false,
  lastMacroAdjustment: null,
  
  // UI state
  isLoading: true,
  error: null,
  
  // Insights and notifications
  insights: [],
  lastInsightUpdate: null
};

function weightReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_WEIGHT_DATA:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null
      };
      
    case ACTIONS.ADD_WEIGHT_ENTRY:
      const newEntries = [...state.weightEntries, action.payload];
      return {
        ...state,
        weightEntries: newEntries,
        error: null
      };
      
    case ACTIONS.UPDATE_WEIGHT_ENTRY:
      return {
        ...state,
        weightEntries: state.weightEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload } : entry
        ),
        error: null
      };
      
    case ACTIONS.DELETE_WEIGHT_ENTRY:
      return {
        ...state,
        weightEntries: state.weightEntries.filter(entry => entry.id !== action.payload),
        error: null
      };
      
    case ACTIONS.UPDATE_PROGRESS_ANALYTICS:
      return {
        ...state,
        progressAnalytics: action.payload.analytics,
        insights: action.payload.insights || state.insights,
        lastAnalyticsUpdate: Date.now()
      };
      
    case ACTIONS.UPDATE_WEIGHT_SETTINGS:
      return {
        ...state,
        weightSettings: { ...state.weightSettings, ...action.payload },
        error: null
      };
      
    case ACTIONS.SET_MACRO_ADJUSTMENT_RECOMMENDATION:
      return {
        ...state,
        macroAdjustmentRecommendation: action.payload,
        pendingMacroAdjustment: action.payload?.shouldAdjust || false
      };
      
    case ACTIONS.DISMISS_MACRO_ADJUSTMENT:
      return {
        ...state,
        macroAdjustmentRecommendation: null,
        pendingMacroAdjustment: false,
        lastMacroAdjustment: Date.now()
      };
      
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case ACTIONS.RESET_WEIGHT_DATA:
      return {
        ...initialState,
        isLoading: false
      };
      
    default:
      return state;
  }
}

export function WeightProvider({ children }) {
  const [state, dispatch] = useReducer(weightReducer, initialState);

  // Load weight data on initialization
  useEffect(() => {
    loadWeightData();
  }, []);

  // Recalculate analytics when weight entries change
  useEffect(() => {
    if (state.weightEntries.length > 0 && !state.isLoading) {
      calculateProgressAnalytics();
    }
  }, [state.weightEntries]);

  /**
   * Load all weight data from AsyncStorage
   */
  const loadWeightData = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const [entriesData, settingsData, lastAdjustmentData] = await Promise.all([
        AsyncStorage.getItem('weightEntries'),
        AsyncStorage.getItem('weightSettings'),
        AsyncStorage.getItem('lastMacroAdjustment')
      ]);

      const weightEntries = entriesData ? JSON.parse(entriesData) : [];
      const weightSettings = settingsData ? 
        { ...defaultWeightSettings, ...JSON.parse(settingsData) } : 
        defaultWeightSettings;
      const lastMacroAdjustment = lastAdjustmentData ? 
        parseInt(lastAdjustmentData) : null;

      // Clean and validate entries
      const cleanedEntries = WeightTrackingService.cleanWeightEntries(weightEntries);

      dispatch({
        type: ACTIONS.LOAD_WEIGHT_DATA,
        payload: {
          weightEntries: cleanedEntries,
          weightSettings,
          lastMacroAdjustment
        }
      });

    } catch (error) {
      console.error('Error loading weight data:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: 'Failed to load weight tracking data' 
      });
    }
  };

  /**
   * Add new weight entry
   */
  const addWeightEntry = async (weightData) => {
    try {
      // Validate entry
      const validation = WeightTrackingService.validateWeightEntry(
        weightData.weight, 
        weightData.date
      );
      
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // Create new entry
      const newEntry = {
        id: Date.now().toString(),
        weight: parseFloat(weightData.weight),
        date: weightData.date,
        timestamp: Date.now(),
        notes: weightData.notes || '',
        bodyFat: weightData.bodyFat ? parseFloat(weightData.bodyFat) : null,
        source: 'manual',
        createdAt: Date.now()
      };

      // Check for duplicate dates
      const existingEntry = state.weightEntries.find(entry => entry.date === newEntry.date);
      if (existingEntry) {
        throw new Error('Weight entry already exists for this date. Please update the existing entry or choose a different date.');
      }

      // Add entry to state
      dispatch({ type: ACTIONS.ADD_WEIGHT_ENTRY, payload: newEntry });

      // Save to AsyncStorage
      const updatedEntries = [...state.weightEntries, newEntry];
      await AsyncStorage.setItem('weightEntries', JSON.stringify(updatedEntries));

      return { success: true, entry: newEntry };

    } catch (error) {
      console.error('Error adding weight entry:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to add weight entry' 
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Update existing weight entry
   */
  const updateWeightEntry = async (entryId, updateData) => {
    try {
      const existingEntry = state.weightEntries.find(entry => entry.id === entryId);
      if (!existingEntry) {
        throw new Error('Weight entry not found');
      }

      // Validate updated data
      const validation = WeightTrackingService.validateWeightEntry(
        updateData.weight || existingEntry.weight, 
        updateData.date || existingEntry.date
      );
      
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const updatedEntry = {
        ...existingEntry,
        ...updateData,
        weight: parseFloat(updateData.weight || existingEntry.weight),
        bodyFat: updateData.bodyFat ? parseFloat(updateData.bodyFat) : existingEntry.bodyFat,
        updatedAt: Date.now()
      };

      // Update entry in state
      dispatch({ type: ACTIONS.UPDATE_WEIGHT_ENTRY, payload: updatedEntry });

      // Save to AsyncStorage
      const updatedEntries = state.weightEntries.map(entry =>
        entry.id === entryId ? updatedEntry : entry
      );
      await AsyncStorage.setItem('weightEntries', JSON.stringify(updatedEntries));

      return { success: true, entry: updatedEntry };

    } catch (error) {
      console.error('Error updating weight entry:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to update weight entry' 
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete weight entry
   */
  const deleteWeightEntry = async (entryId) => {
    try {
      const existingEntry = state.weightEntries.find(entry => entry.id === entryId);
      if (!existingEntry) {
        throw new Error('Weight entry not found');
      }

      // Remove entry from state
      dispatch({ type: ACTIONS.DELETE_WEIGHT_ENTRY, payload: entryId });

      // Save to AsyncStorage
      const updatedEntries = state.weightEntries.filter(entry => entry.id !== entryId);
      await AsyncStorage.setItem('weightEntries', JSON.stringify(updatedEntries));

      return { success: true };

    } catch (error) {
      console.error('Error deleting weight entry:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to delete weight entry' 
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Calculate progress analytics with insights
   */
  const calculateProgressAnalytics = async (userProfile = null) => {
    try {
      if (state.weightEntries.length === 0) {
        dispatch({
          type: ACTIONS.UPDATE_PROGRESS_ANALYTICS,
          payload: { analytics: null, insights: [] }
        });
        return;
      }

      // Use userProfile from parent context if available
      const analytics = WeightTrackingService.calculateProgressAnalytics(
        state.weightEntries, 
        userProfile || state.weightSettings
      );

      const insights = WeightTrackingService.generateWeightTrackingInsights(
        analytics, 
        userProfile || state.weightSettings
      );

      dispatch({
        type: ACTIONS.UPDATE_PROGRESS_ANALYTICS,
        payload: { analytics, insights }
      });

      return analytics;

    } catch (error) {
      console.error('Error calculating progress analytics:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: 'Failed to calculate progress analytics' 
      });
      return null;
    }
  };

  /**
   * Check for macro adjustment recommendations
   */
  const checkMacroAdjustmentRecommendation = async (userProfile, currentTargets) => {
    try {
      if (!state.progressAnalytics || !state.weightSettings.autoAdjustMacros) {
        return null;
      }

      // Don't recommend adjustments too frequently
      const timeSinceLastAdjustment = state.lastMacroAdjustment ? 
        Date.now() - state.lastMacroAdjustment : Infinity;
      const minimumInterval = state.weightSettings.minimumWeeksForAdjustment * 7 * 24 * 60 * 60 * 1000;
      
      if (timeSinceLastAdjustment < minimumInterval) {
        return null;
      }

      const recommendation = WeightTrackingService.calculateMacroAdjustmentRecommendation(
        state.progressAnalytics,
        userProfile,
        currentTargets
      );

      if (recommendation.shouldAdjust) {
        dispatch({
          type: ACTIONS.SET_MACRO_ADJUSTMENT_RECOMMENDATION,
          payload: recommendation
        });
      }

      return recommendation;

    } catch (error) {
      console.error('Error checking macro adjustment:', error);
      return null;
    }
  };

  /**
   * Dismiss macro adjustment recommendation
   */
  const dismissMacroAdjustment = async () => {
    dispatch({ type: ACTIONS.DISMISS_MACRO_ADJUSTMENT });
    await AsyncStorage.setItem('lastMacroAdjustment', Date.now().toString());
  };

  /**
   * Update weight tracking settings
   */
  const updateWeightSettings = async (updates) => {
    try {
      const updatedSettings = { ...state.weightSettings, ...updates };
      
      dispatch({ type: ACTIONS.UPDATE_WEIGHT_SETTINGS, payload: updates });
      
      await AsyncStorage.setItem('weightSettings', JSON.stringify(updatedSettings));
      
      return { success: true };

    } catch (error) {
      console.error('Error updating weight settings:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: 'Failed to update settings' 
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Reset all weight tracking data
   */
  const resetWeightData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('weightEntries'),
        AsyncStorage.removeItem('weightSettings'),
        AsyncStorage.removeItem('lastMacroAdjustment')
      ]);

      dispatch({ type: ACTIONS.RESET_WEIGHT_DATA });

      return { success: true };

    } catch (error) {
      console.error('Error resetting weight data:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: 'Failed to reset weight data' 
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Get weight statistics for dashboard
   */
  const getWeightStatistics = () => {
    if (!state.progressAnalytics) return null;

    const { progressAnalytics, weightEntries } = state;
    
    return {
      totalEntries: weightEntries.length,
      trackingDays: progressAnalytics.trackingDays,
      currentWeight: progressAnalytics.currentWeight,
      totalChange: progressAnalytics.totalChange,
      weeklyTrend: progressAnalytics.weeklyTrend,
      goalProgress: progressAnalytics.progressPercentage,
      isOnTrack: progressAnalytics.isOnTrack,
      lastEntry: weightEntries[0]?.date,
      consistency: Math.min((weightEntries.length / Math.max(progressAnalytics.trackingDays, 1)) * 100, 100)
    };
  };

  const contextValue = {
    // State
    ...state,
    
    // Weight entry operations
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    
    // Analytics operations
    calculateProgressAnalytics,
    checkMacroAdjustmentRecommendation,
    dismissMacroAdjustment,
    
    // Settings operations
    updateWeightSettings,
    resetWeightData,
    
    // Utility functions
    getWeightStatistics,
    
    // Data loading
    loadWeightData
  };

  return (
    <WeightContext.Provider value={contextValue}>
      {children}
    </WeightContext.Provider>
  );
}

export const useWeight = () => {
  const context = useContext(WeightContext);
  if (!context) {
    throw new Error('useWeight must be used within a WeightProvider');
  }
  return context;
};

export default WeightContext;