import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationService } from '../services/calculationService';

const PresetContext = createContext();

const ACTIONS = {
  LOAD_PRESETS: 'LOAD_PRESETS',
  CREATE_PRESET: 'CREATE_PRESET',
  UPDATE_PRESET: 'UPDATE_PRESET',
  DELETE_PRESET: 'DELETE_PRESET',
  UPDATE_LAST_USED: 'UPDATE_LAST_USED'
};

const presetReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_PRESETS:
      return {
        ...state,
        presets: action.payload
      };
    
    case ACTIONS.CREATE_PRESET:
      const newPreset = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      return {
        ...state,
        presets: [...state.presets, newPreset]
      };
    
    case ACTIONS.UPDATE_PRESET:
      return {
        ...state,
        presets: state.presets.map(preset => 
          preset.id === action.payload.id 
            ? { ...preset, ...action.payload, lastUsed: new Date().toISOString() }
            : preset
        )
      };
    
    case ACTIONS.DELETE_PRESET:
      return {
        ...state,
        presets: state.presets.filter(preset => preset.id !== action.payload)
      };
    
    case ACTIONS.UPDATE_LAST_USED:
      return {
        ...state,
        presets: state.presets.map(preset => 
          preset.id === action.payload 
            ? { ...preset, lastUsed: new Date().toISOString() }
            : preset
        )
      };
    
    default:
      return state;
  }
};

const initialState = {
  presets: []
};

export function PresetProvider({ children }) {
  const [state, dispatch] = useReducer(presetReducer, initialState);

  // Load presets from AsyncStorage on app start
  useEffect(() => {
    loadPresets();
  }, []);

  // Save presets to AsyncStorage whenever state changes
  useEffect(() => {
    if (state.presets.length > 0) {
      savePresetsToStorage();
    }
  }, [state.presets]);

  const loadPresets = async () => {
    try {
      const presetsData = await AsyncStorage.getItem('meal_presets');
      if (presetsData) {
        const presets = JSON.parse(presetsData);
        dispatch({ type: ACTIONS.LOAD_PRESETS, payload: presets });
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const savePresetsToStorage = async () => {
    try {
      await AsyncStorage.setItem('meal_presets', JSON.stringify(state.presets));
    } catch (error) {
      console.error('Error saving presets:', error);
    }
  };

  const createPreset = (name, selectedFoods, foods) => {
    // Calculate total macros for the preset for display purposes
    const calculatedMacros = CalculationService.calculateTotalMacros(selectedFoods, foods);
    
    const preset = {
      name: name.trim(),
      foods: selectedFoods.map(food => ({
        foodId: food.foodId,
        portionGrams: food.portionGrams
      })),
      calculatedMacros, // Store for quick display without recalculation
      totalCalories: Math.round(calculatedMacros.calories)
    };

    dispatch({ type: ACTIONS.CREATE_PRESET, payload: preset });
    return preset;
  };

  const updatePreset = (presetId, updates) => {
    dispatch({ 
      type: ACTIONS.UPDATE_PRESET, 
      payload: { id: presetId, ...updates }
    });
  };

  const deletePreset = (presetId) => {
    dispatch({ type: ACTIONS.DELETE_PRESET, payload: presetId });
  };

  const updateLastUsed = (presetId) => {
    dispatch({ type: ACTIONS.UPDATE_LAST_USED, payload: presetId });
  };

  // Helper functions
  const getPresetsByUsage = () => {
    return [...state.presets].sort((a, b) => 
      new Date(b.lastUsed) - new Date(a.lastUsed)
    );
  };

  const getPresetsByName = () => {
    return [...state.presets].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  };

  const getPresetById = (id) => {
    return state.presets.find(preset => preset.id === id);
  };

  const searchPresets = (query) => {
    if (!query.trim()) return state.presets;
    
    const lowercaseQuery = query.toLowerCase();
    return state.presets.filter(preset =>
      preset.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value = {
    presets: state.presets,
    createPreset,
    updatePreset,
    deletePreset,
    updateLastUsed,
    getPresetsByUsage,
    getPresetsByName,
    getPresetById,
    searchPresets
  };

  return (
    <PresetContext.Provider value={value}>
      {children}
    </PresetContext.Provider>
  );
}

export const usePreset = () => {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePreset must be used within a PresetProvider');
  }
  return context;
};