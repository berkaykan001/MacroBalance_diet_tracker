/**
 * Integration tests for the complete weight tracking system
 * Tests the end-to-end workflow from weight entry to macro adjustments
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightProvider, useWeight } from '../src/context/WeightContext';
import { WeightTrackingService } from '../src/services/WeightTrackingService';
import { MacroAdjustmentService } from '../src/services/MacroAdjustmentService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Test component to interact with WeightContext
function TestComponent({ onContextReady }) {
  const context = useWeight();

  React.useEffect(() => {
    if (context && onContextReady) {
      onContextReady(context);
    }
  }, [context, onContextReady]);

  return null;
}

describe('Weight Tracking Integration', () => {
  let contextInstance;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock AsyncStorage to return empty data
    AsyncStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'weightEntries':
          return Promise.resolve('[]');
        case 'weightSettings':
          return Promise.resolve(JSON.stringify({
            trackingEnabled: true,
            autoAdjustMacros: true,
            minimumWeeksForAdjustment: 2
          }));
        case 'lastMacroAdjustment':
          return Promise.resolve(null);
        default:
          return Promise.resolve(null);
      }
    });

    AsyncStorage.setItem.mockResolvedValue();
    contextInstance = null;
  });

  const renderWithProvider = (onContextReady) => {
    return render(
      <WeightProvider>
        <TestComponent onContextReady={onContextReady} />
      </WeightProvider>
    );
  };

  describe('Weight Entry Workflow', () => {
    it('should successfully add a weight entry and update analytics', async () => {
      let contextReady = false;

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      // Wait for context to be ready
      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance).toBeDefined();
      });

      // Add a weight entry
      const weightData = {
        weight: 70.5,
        date: '2025-01-15',
        notes: 'Morning weight'
      };

      let addResult;
      await act(async () => {
        addResult = await contextInstance.addWeightEntry(weightData);
      });

      expect(addResult.success).toBe(true);
      expect(addResult.entry).toBeDefined();
      expect(addResult.entry.weight).toBe(70.5);
      expect(addResult.entry.date).toBe('2025-01-15');

      // Verify AsyncStorage was called
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'weightEntries',
        expect.stringContaining('70.5')
      );
    });

    it('should prevent duplicate entries for the same date', async () => {
      let contextReady = false;

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      // Add first entry
      const weightData = {
        weight: 70.5,
        date: '2025-01-15'
      };

      await act(async () => {
        await contextInstance.addWeightEntry(weightData);
      });

      // Try to add duplicate entry
      const duplicateData = {
        weight: 71.0,
        date: '2025-01-15'
      };

      let duplicateResult;
      await act(async () => {
        duplicateResult = await contextInstance.addWeightEntry(duplicateData);
      });

      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.error).toContain('already exists');
    });

    it('should validate weight entry data', async () => {
      let contextReady = false;

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      // Try to add invalid entry
      const invalidData = {
        weight: 25, // Too low
        date: '2025-01-15'
      };

      let result;
      await act(async () => {
        result = await contextInstance.addWeightEntry(invalidData);
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('between 30-300');
    });
  });

  describe('Progress Analytics Integration', () => {
    it('should calculate progress analytics when sufficient data is available', async () => {
      let contextReady = false;

      // Mock AsyncStorage to return weight entries
      const mockEntries = [
        { id: '1', weight: 70.0, date: '2025-01-01', timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 },
        { id: '2', weight: 69.5, date: '2025-01-05', timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
        { id: '3', weight: 69.0, date: '2025-01-10', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
        { id: '4', weight: 68.5, date: '2025-01-15', timestamp: Date.now() }
      ];

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve(JSON.stringify(mockEntries));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance.weightEntries).toHaveLength(4);
        expect(contextInstance.progressAnalytics).toBeDefined();
      });

      // Verify analytics calculations
      expect(contextInstance.progressAnalytics.currentWeight).toBe(68.5);
      expect(contextInstance.progressAnalytics.startingWeight).toBe(70.0);
      expect(contextInstance.progressAnalytics.totalChange).toBe(-1.5);
    });

    it('should generate insights based on progress data', async () => {
      let contextReady = false;

      // Mock weight entries showing good progress
      const mockEntries = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        weight: 70.0 - (i * 0.2), // Steady weight loss
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        timestamp: Date.now() - (14 - i) * 24 * 60 * 60 * 1000
      }));

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve(JSON.stringify(mockEntries));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance.insights).toBeDefined();
        expect(contextInstance.insights.length).toBeGreaterThan(0);
      });

      // Should have insights about the tracking data
      const hasDataInsight = contextInstance.insights.some(
        insight => insight.message.includes('entries') || insight.message.includes('tracking')
      );
      expect(hasDataInsight).toBe(true);
    });
  });

  describe('Macro Adjustment Integration', () => {
    it('should check for macro adjustments when analytics are available', async () => {
      let contextReady = false;

      // Mock weight entries showing slow progress (needs adjustment)
      const mockEntries = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        weight: 70.0 - (i * 0.05), // Very slow weight loss
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        timestamp: Date.now() - (14 - i) * 24 * 60 * 60 * 1000
      }));

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve(JSON.stringify(mockEntries));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      // Mock user profile and targets
      const mockUserProfile = {
        goal: 'cutting',
        weight: 70,
        hasCompletedOnboarding: true
      };

      const mockTargets = {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 67
      };

      // Check for macro adjustments
      let recommendation;
      await act(async () => {
        recommendation = await contextInstance.checkMacroAdjustmentRecommendation(
          mockUserProfile,
          mockTargets
        );
      });

      // Should detect that progress is slow and recommend adjustment
      expect(recommendation).toBeDefined();
    });

    it('should not recommend adjustment for users without auto-adjust enabled', async () => {
      let contextReady = false;

      // Mock settings with auto-adjust disabled
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightSettings') {
          return Promise.resolve(JSON.stringify({
            trackingEnabled: true,
            autoAdjustMacros: false,
            minimumWeeksForAdjustment: 2
          }));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance.weightSettings.autoAdjustMacros).toBe(false);
      });

      const mockUserProfile = {
        goal: 'cutting',
        weight: 70,
        hasCompletedOnboarding: true
      };

      const mockTargets = {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 67
      };

      // Should not recommend adjustment when auto-adjust is disabled
      let recommendation;
      await act(async () => {
        recommendation = await contextInstance.checkMacroAdjustmentRecommendation(
          mockUserProfile,
          mockTargets
        );
      });

      expect(recommendation).toBeNull();
    });
  });

  describe('Weight Statistics Integration', () => {
    it('should provide comprehensive statistics when data is available', async () => {
      let contextReady = false;

      // Mock comprehensive weight data
      const mockEntries = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        weight: 70.0 - (i * 0.15),
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        timestamp: Date.now() - (20 - i * 2) * 24 * 60 * 60 * 1000
      }));

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve(JSON.stringify(mockEntries));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      // Get weight statistics
      const stats = contextInstance.getWeightStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBe(10);
      expect(stats.currentWeight).toBeDefined();
      expect(stats.totalChange).toBeDefined();
      expect(stats.trackingDays).toBeGreaterThan(0);
      expect(stats.consistency).toBeGreaterThan(0);
      expect(stats.lastEntry).toBeDefined();
    });

    it('should return null statistics when no data is available', async () => {
      let contextReady = false;

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      const stats = contextInstance.getWeightStatistics();
      expect(stats).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      let contextReady = false;

      // Mock AsyncStorage to throw error
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance.error).toContain('Failed to load');
      });
    });

    it('should handle invalid stored data gracefully', async () => {
      let contextReady = false;

      // Mock AsyncStorage to return invalid JSON
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve('invalid json');
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        // Should handle invalid data and continue with defaults
        expect(contextInstance.weightEntries).toEqual([]);
      });
    });

    it('should handle calculation errors in analytics', async () => {
      let contextReady = false;

      // Mock weight entries with invalid data
      const invalidEntries = [
        { id: '1', weight: 'invalid', date: '2025-01-01' },
        { id: '2', weight: null, date: '2025-01-02' }
      ];

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve(JSON.stringify(invalidEntries));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        // Should clean invalid entries
        expect(contextInstance.weightEntries).toEqual([]);
      });
    });
  });

  describe('Data Persistence', () => {
    it('should persist weight entries to AsyncStorage', async () => {
      let contextReady = false;

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      const weightData = {
        weight: 70.5,
        date: '2025-01-15',
        notes: 'Test entry'
      };

      await act(async () => {
        await contextInstance.addWeightEntry(weightData);
      });

      // Verify data was saved
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'weightEntries',
        expect.stringContaining('70.5')
      );
    });

    it('should load persisted data on initialization', async () => {
      let contextReady = false;

      const mockEntries = [
        { id: '1', weight: 70.0, date: '2025-01-01' },
        { id: '2', weight: 69.5, date: '2025-01-02' }
      ];

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightEntries') {
          return Promise.resolve(JSON.stringify(mockEntries));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance.weightEntries).toHaveLength(2);
        expect(contextInstance.weightEntries[0].weight).toBe(70.0);
      });

      // Verify AsyncStorage was queried
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('weightEntries');
    });
  });

  describe('Settings Integration', () => {
    it('should respect weight tracking settings', async () => {
      let contextReady = false;

      const customSettings = {
        trackingEnabled: true,
        autoAdjustMacros: false,
        minimumWeeksForAdjustment: 3,
        units: 'imperial'
      };

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'weightSettings') {
          return Promise.resolve(JSON.stringify(customSettings));
        }
        return Promise.resolve(null);
      });

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
        expect(contextInstance.weightSettings.autoAdjustMacros).toBe(false);
        expect(contextInstance.weightSettings.minimumWeeksForAdjustment).toBe(3);
        expect(contextInstance.weightSettings.units).toBe('imperial');
      });
    });

    it('should update settings and persist changes', async () => {
      let contextReady = false;

      renderWithProvider((context) => {
        contextInstance = context;
        contextReady = true;
      });

      await waitFor(() => {
        expect(contextReady).toBe(true);
      });

      const updates = {
        autoAdjustMacros: false,
        units: 'imperial'
      };

      let result;
      await act(async () => {
        result = await contextInstance.updateWeightSettings(updates);
      });

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'weightSettings',
        expect.stringContaining('imperial')
      );
    });
  });
});