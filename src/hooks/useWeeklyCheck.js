/**
 * useWeeklyCheck - React hook for managing weekly weight check notifications
 * 
 * Integrates WeeklyCheckService with app state and UI notifications
 * Handles the complete weekly check workflow:
 * 1. Detection of when weekly weigh-in is due
 * 2. Processing weight entries and macro adjustments
 * 3. Managing notification states and user responses
 */

import { useState, useEffect, useCallback } from 'react';
import { WeeklyCheckService } from '../services/WeeklyCheckService';
import { useWeight } from '../context/WeightContext';
import { useSettings } from '../context/SettingsContext';
import TimeService from '../services/TimeService';

export function useWeeklyCheck() {
  const { 
    weightEntries, 
    weightSettings, 
    addWeightEntry, 
    calculateProgressAnalytics,
    lastMacroAdjustment 
  } = useWeight();
  
  const {
    userProfile,
    personalizedTargets,
    updateUserProfile,
    calculateAndSetPersonalizedTargets
  } = useSettings();

  // Extract current macro targets from personalized targets
  const currentTargets = personalizedTargets?.dailyTargets || null;

  // Notification state
  const [weeklyCheckNotification, setWeeklyCheckNotification] = useState(null);
  const [macroAdjustmentNotification, setMacroAdjustmentNotification] = useState(null);
  const [isProcessingWeight, setIsProcessingWeight] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(TimeService.now());

  /**
   * Check if weekly weight entry is due
   */
  const checkWeeklyWeightStatus = useCallback(() => {
    if (!userProfile?.hasCompletedOnboarding) {
      return null;
    }

    const checkResult = WeeklyCheckService.checkIfWeeklyWeightDue(
      weightEntries,
      weightSettings,
      userProfile
    );

    if (checkResult.isDue) {
      const notification = WeeklyCheckService.createWeeklyCheckNotification(
        checkResult,
        userProfile
      );
      
      setWeeklyCheckNotification(notification);
      return notification;
    } else {
      // Clear notification if not due anymore
      if (weeklyCheckNotification) {
        setWeeklyCheckNotification(null);
      }
      return null;
    }
  }, [weightEntries, weightSettings, userProfile, weeklyCheckNotification]);

  /**
   * Process new weight entry from weekly check
   */
  const logWeeklyWeight = useCallback(async (weight, date = null) => {
    setIsProcessingWeight(true);

    try {
      const entryDate = date || TimeService.formatShort();
      
      // First add the weight entry
      const entryResult = await addWeightEntry({
        weight: parseFloat(weight),
        date: entryDate,
        notes: 'Weekly check-in',
        source: 'weekly_check'
      });

      if (!entryResult.success) {
        throw new Error(entryResult.error);
      }

      // Process the entry and check for macro adjustments
      console.log('=== Processing weekly weight entry ===');
      console.log('Input data:', {
        weight,
        entryDate,
        weightEntriesCount: weightEntries?.length,
        userProfile: userProfile?.goal,
        currentTargets: currentTargets?.calories
      });

      const processResult = await WeeklyCheckService.processWeeklyWeightEntry(
        weight,
        entryDate,
        weightEntries,
        userProfile,
        currentTargets,
        weightSettings
      );

      console.log('Process result:', {
        success: processResult.success,
        requiresMacroAdjustment: processResult.requiresMacroAdjustment,
        message: processResult.message
      });

      if (!processResult.success) {
        throw new Error(processResult.error);
      }

      // Clear the weekly check notification
      setWeeklyCheckNotification(null);

      // Show macro adjustment notification if needed
      if (processResult.requiresMacroAdjustment) {
        console.log('Creating macro adjustment notification...');
        const adjustmentNotification = WeeklyCheckService.createMacroAdjustmentNotification(
          processResult,
          userProfile
        );
        setMacroAdjustmentNotification(adjustmentNotification);
        console.log('Macro adjustment notification set');
      } else {
        console.log('No macro adjustment needed');
      }
      console.log('=====================================');

      // Update last check time
      setLastCheckTime(TimeService.now());

      return {
        success: true,
        message: processResult.message,
        requiresAdjustment: processResult.requiresMacroAdjustment,
        insights: processResult.insights,
        progressAnalytics: processResult.progressAnalytics
      };

    } catch (error) {
      console.error('Error logging weekly weight:', error);
      return {
        success: false,
        error: error.message || 'Failed to log weight'
      };
    } finally {
      setIsProcessingWeight(false);
    }
  }, [
    weightEntries, 
    userProfile, 
    currentTargets, 
    weightSettings, 
    addWeightEntry
  ]);

  /**
   * Apply macro adjustment recommendation
   */
  const applyMacroAdjustment = useCallback(async (adjustmentData) => {
    try {
      console.log('=== Applying Macro Adjustment ===');
      console.log('adjustmentData:', adjustmentData);

      const { macroAdjustmentRecommendation } = adjustmentData;
      console.log('macroAdjustmentRecommendation:', macroAdjustmentRecommendation);
      console.log('adjustedTargets:', macroAdjustmentRecommendation?.adjustedTargets);

      // Update user weight if it has changed
      if (macroAdjustmentRecommendation.progressAnalytics?.currentWeight !== userProfile.weight) {
        console.log('Updating user weight...');
        await updateUserProfile({
          weight: macroAdjustmentRecommendation.progressAnalytics.currentWeight
        });
      }

      // Apply new macro targets
      console.log('Calling calculateAndSetPersonalizedTargets with:', {
        userProfile: {
          ...userProfile,
          weight: macroAdjustmentRecommendation.progressAnalytics.currentWeight
        },
        adjustedTargets: macroAdjustmentRecommendation.adjustedTargets
      });

      await calculateAndSetPersonalizedTargets(
        {
          ...userProfile,
          weight: macroAdjustmentRecommendation.progressAnalytics.currentWeight
        },
        macroAdjustmentRecommendation.adjustedTargets
      );

      // Clear the adjustment notification
      setMacroAdjustmentNotification(null);

      console.log('Macro adjustment applied successfully!');
      console.log('===================================');

      return {
        success: true,
        message: 'Macro targets updated successfully based on your progress!'
      };

    } catch (error) {
      console.error('Error applying macro adjustment:', error);
      return {
        success: false,
        error: error.message || 'Failed to apply macro adjustment'
      };
    }
  }, [userProfile, updateUserProfile, calculateAndSetPersonalizedTargets]);

  /**
   * Dismiss weekly check notification
   */
  const dismissWeeklyCheck = useCallback(async (action = 'dismiss') => {
    setWeeklyCheckNotification(null);

    // If user chooses to skip or remind later, set a delay
    if (action === 'remind_later') {
      // Show again in 2 hours
      setTimeout(() => {
        checkWeeklyWeightStatus();
      }, 2 * 60 * 60 * 1000);
    } else if (action === 'skip_week') {
      // Add a "skip" entry to reset the 7-day cycle without requiring actual weight
      // This prevents the check from immediately re-triggering
      try {
        const entryDate = TimeService.formatShort();
        await addWeightEntry({
          weight: weightEntries?.length > 0 ? weightEntries[0].weight : 70, // Use last weight or default
          date: entryDate,
          notes: 'Skipped weekly check',
          source: 'weekly_check_skip',
          isSkipped: true
        });
        console.log('Added skip entry to reset weekly check cycle');
      } catch (error) {
        console.error('Failed to add skip entry:', error);
      }
      setLastCheckTime(TimeService.now());
    }
  }, [checkWeeklyWeightStatus, addWeightEntry, weightEntries]);

  /**
   * Dismiss macro adjustment notification
   */
  const dismissMacroAdjustment = useCallback((keepCurrentMacros = true) => {
    setMacroAdjustmentNotification(null);
    
    if (keepCurrentMacros) {
      // User chose to keep current macros - record this decision
      // to avoid showing the same recommendation too soon
      setLastCheckTime(TimeService.now());
    }
  }, []);

  /**
   * Get current weekly check status
   */
  const getWeeklyCheckStatus = useCallback(() => {
    if (!userProfile?.hasCompletedOnboarding) {
      return { status: 'not_available', reason: 'Complete onboarding first' };
    }

    const checkResult = WeeklyCheckService.checkIfWeeklyWeightDue(
      weightEntries,
      weightSettings,
      userProfile
    );

    return {
      status: checkResult.isDue ? 'due' : 'current',
      ...checkResult,
      hasNotification: weeklyCheckNotification !== null,
      hasMacroAdjustment: macroAdjustmentNotification !== null
    };
  }, [weightEntries, weightSettings, userProfile, weeklyCheckNotification, macroAdjustmentNotification]);

  /**
   * Get tracking tips and recommendations
   */
  const getTrackingGuidance = useCallback(() => {
    if (!userProfile) return null;

    return {
      schedule: WeeklyCheckService.getWeighInSchedule(weightSettings, userProfile),
      tips: WeeklyCheckService.generateTrackingTips(userProfile, weightEntries),
      shouldShowReminder: WeeklyCheckService.shouldShowAdjustmentReminder(
        lastMacroAdjustment,
        weightEntries,
        weightSettings
      )
    };
  }, [userProfile, weightSettings, weightEntries, lastMacroAdjustment]);

  /**
   * Manual trigger for checking weekly status
   */
  const refreshWeeklyCheck = useCallback(() => {
    return checkWeeklyWeightStatus();
  }, [checkWeeklyWeightStatus]);

  // Auto-check for weekly weight when component mounts or data changes
  useEffect(() => {
    if (userProfile?.hasCompletedOnboarding && weightSettings?.trackingEnabled) {
      // Small delay to avoid multiple rapid checks
      const timer = setTimeout(() => {
        checkWeeklyWeightStatus();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userProfile?.hasCompletedOnboarding, weightSettings?.trackingEnabled, checkWeeklyWeightStatus]);

  // Listen for time changes and recheck weekly status
  useEffect(() => {
    const unsubscribe = TimeService.addListener((newDate, offsetDays) => {
      // Recheck weekly status when time changes
      setTimeout(() => {
        checkWeeklyWeightStatus();
      }, 200); // Delay to ensure contexts updated
    });

    return unsubscribe;
  }, [weightEntries, weightSettings, userProfile, checkWeeklyWeightStatus]);

  // Periodically check for weekly weight status (every 30 minutes when app is active)
  useEffect(() => {
    if (!userProfile?.hasCompletedOnboarding) return;

    const interval = setInterval(() => {
      checkWeeklyWeightStatus();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [userProfile?.hasCompletedOnboarding, checkWeeklyWeightStatus]);

  return {
    // Notification states
    weeklyCheckNotification,
    macroAdjustmentNotification,
    isProcessingWeight,
    
    // Actions
    logWeeklyWeight,
    applyMacroAdjustment,
    dismissWeeklyCheck,
    dismissMacroAdjustment,
    refreshWeeklyCheck,
    
    // Status and guidance
    getWeeklyCheckStatus,
    getTrackingGuidance,
    
    // Utilities
    checkWeeklyWeightStatus
  };
}

export default useWeeklyCheck;