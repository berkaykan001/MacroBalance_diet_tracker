/**
 * useWeightTrackingIntegration - Integration hook for weight tracking with macro adjustments
 * 
 * This hook connects the WeightContext with SettingsContext and MealContext to provide
 * seamless integration for automatic macro adjustments based on weight tracking progress.
 */

import { useEffect, useState, useCallback } from 'react';
import { useWeight } from '../context/WeightContext';
import { useSettings } from '../context/SettingsContext';
import { useMeal } from '../context/MealContext';
import { MacroAdjustmentService } from '../services/MacroAdjustmentService';

export function useWeightTrackingIntegration() {
  const {
    weightEntries,
    progressAnalytics,
    macroAdjustmentRecommendation,
    pendingMacroAdjustment,
    weightSettings,
    checkMacroAdjustmentRecommendation,
    dismissMacroAdjustment,
    calculateProgressAnalytics
  } = useWeight();

  const {
    userProfile,
    personalizedTargets,
    updateUserProfile,
    calculateAndSetPersonalizedTargets
  } = useSettings();

  const {
    generatePersonalizedMeals
  } = useMeal();

  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [isApplyingAdjustment, setIsApplyingAdjustment] = useState(false);

  // Check for macro adjustments when relevant data changes
  useEffect(() => {
    checkForMacroAdjustments();
  }, [weightEntries, userProfile, personalizedTargets]);

  // Show adjustment dialog when recommendation is available
  useEffect(() => {
    if (macroAdjustmentRecommendation && pendingMacroAdjustment) {
      setCurrentRecommendation(macroAdjustmentRecommendation);
      setShowAdjustmentDialog(true);
    }
  }, [macroAdjustmentRecommendation, pendingMacroAdjustment]);

  /**
   * Check if macro adjustments are needed based on current progress
   */
  const checkForMacroAdjustments = useCallback(async () => {
    if (!userProfile?.hasCompletedOnboarding || !weightSettings?.autoAdjustMacros) {
      return;
    }

    if (!weightEntries || weightEntries.length < 6) {
      return; // Need at least 6 entries for reliable analysis
    }

    if (!personalizedTargets?.dailyTargets) {
      return; // Need current targets for comparison
    }

    try {
      // Check eligibility
      const eligibility = MacroAdjustmentService.isEligibleForAdjustment(
        userProfile,
        weightEntries,
        null, // lastAdjustment will be checked in context
        weightSettings
      );

      if (!eligibility.eligible) {
        return;
      }

      // Check for recommendation
      await checkMacroAdjustmentRecommendation(userProfile, personalizedTargets.dailyTargets);

    } catch (error) {
      console.error('Error checking macro adjustments:', error);
    }
  }, [
    userProfile,
    weightEntries,
    personalizedTargets,
    weightSettings,
    checkMacroAdjustmentRecommendation
  ]);

  /**
   * Accept macro adjustment recommendation
   */
  const acceptMacroAdjustment = useCallback(async (recommendation) => {
    setIsApplyingAdjustment(true);
    
    try {
      // Apply the adjustment using MacroAdjustmentService
      const result = await MacroAdjustmentService.applyMacroAdjustment(
        recommendation,
        userProfile,
        updateUserProfile,
        calculateAndSetPersonalizedTargets
      );

      if (result.success) {
        // Update user weight if it has changed
        if (recommendation.progressAnalytics?.currentWeight !== userProfile.weight) {
          await updateUserProfile({
            weight: recommendation.progressAnalytics.currentWeight
          });
        }

        // Regenerate personalized meals with new targets
        if (recommendation.adjustedMealDistribution) {
          await generatePersonalizedMeals(recommendation.adjustedMealDistribution);
        }

        setShowAdjustmentDialog(false);
        setCurrentRecommendation(null);
        dismissMacroAdjustment();

        return { success: true, message: result.message };

      } else {
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('Error applying macro adjustment:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to apply macro adjustment' 
      };

    } finally {
      setIsApplyingAdjustment(false);
    }
  }, [
    userProfile,
    updateUserProfile,
    calculateAndSetPersonalizedTargets,
    generatePersonalizedMeals,
    dismissMacroAdjustment
  ]);

  /**
   * Customize macro adjustment (open detailed settings)
   */
  const customizeMacroAdjustment = useCallback((recommendation) => {
    // This would navigate to a detailed macro customization screen
    // For now, we'll just dismiss and let user manually adjust in settings
    setShowAdjustmentDialog(false);
    setCurrentRecommendation(null);
    dismissMacroAdjustment();
    
    return {
      action: 'navigate_to_settings',
      message: 'Navigate to settings to manually adjust macro targets'
    };
  }, [dismissMacroAdjustment]);

  /**
   * Dismiss macro adjustment recommendation
   */
  const dismissAdjustmentDialog = useCallback(() => {
    setShowAdjustmentDialog(false);
    setCurrentRecommendation(null);
    dismissMacroAdjustment();
  }, [dismissMacroAdjustment]);

  /**
   * Force recalculation of progress analytics
   */
  const refreshProgressAnalytics = useCallback(async () => {
    if (!userProfile) return null;
    
    try {
      const analytics = await calculateProgressAnalytics(userProfile);
      return analytics;
    } catch (error) {
      console.error('Error refreshing progress analytics:', error);
      return null;
    }
  }, [calculateProgressAnalytics, userProfile]);

  /**
   * Get current weight tracking status
   */
  const getWeightTrackingStatus = useCallback(() => {
    if (!userProfile?.hasCompletedOnboarding) {
      return {
        status: 'setup_required',
        message: 'Complete onboarding to enable weight tracking',
        canTrack: false
      };
    }

    if (!weightSettings?.trackingEnabled) {
      return {
        status: 'disabled',
        message: 'Weight tracking is disabled in settings',
        canTrack: false
      };
    }

    if (!weightEntries || weightEntries.length === 0) {
      return {
        status: 'no_data',
        message: 'Add your first weight entry to start tracking',
        canTrack: true
      };
    }

    if (weightEntries.length < 6) {
      return {
        status: 'insufficient_data',
        message: `${6 - weightEntries.length} more entries needed for macro adjustments`,
        canTrack: true
      };
    }

    return {
      status: 'active',
      message: 'Weight tracking is active and monitoring progress',
      canTrack: true,
      hasRecommendations: pendingMacroAdjustment
    };
  }, [
    userProfile,
    weightSettings,
    weightEntries,
    pendingMacroAdjustment
  ]);

  /**
   * Get integration statistics
   */
  const getIntegrationStats = useCallback(() => {
    const status = getWeightTrackingStatus();
    
    return {
      weightTrackingStatus: status,
      totalEntries: weightEntries?.length || 0,
      hasProgressAnalytics: !!progressAnalytics,
      autoAdjustEnabled: weightSettings?.autoAdjustMacros || false,
      pendingAdjustments: pendingMacroAdjustment ? 1 : 0,
      lastEntryDate: weightEntries && weightEntries.length > 0 ? 
        weightEntries[0]?.date : null,
      nextAdjustmentEligible: null // Could calculate based on last adjustment
    };
  }, [
    getWeightTrackingStatus,
    weightEntries,
    progressAnalytics,
    weightSettings,
    pendingMacroAdjustment
  ]);

  return {
    // Dialog state
    showAdjustmentDialog,
    currentRecommendation,
    isApplyingAdjustment,

    // Actions
    acceptMacroAdjustment,
    customizeMacroAdjustment,
    dismissAdjustmentDialog,
    checkForMacroAdjustments,
    refreshProgressAnalytics,

    // Status and stats
    getWeightTrackingStatus,
    getIntegrationStats,

    // Direct access to related data
    weightEntries,
    progressAnalytics,
    userProfile,
    personalizedTargets,
    weightSettings
  };
}

/**
 * Hook for components that only need weight tracking status
 */
export function useWeightTrackingStatus() {
  const { getWeightTrackingStatus, getIntegrationStats } = useWeightTrackingIntegration();
  
  return {
    getWeightTrackingStatus,
    getIntegrationStats
  };
}

/**
 * Hook for components that need to trigger macro adjustments
 */
export function useMacroAdjustments() {
  const {
    showAdjustmentDialog,
    currentRecommendation,
    isApplyingAdjustment,
    acceptMacroAdjustment,
    customizeMacroAdjustment,
    dismissAdjustmentDialog,
    checkForMacroAdjustments
  } = useWeightTrackingIntegration();

  return {
    showAdjustmentDialog,
    currentRecommendation,
    isApplyingAdjustment,
    acceptMacroAdjustment,
    customizeMacroAdjustment,
    dismissAdjustmentDialog,
    checkForMacroAdjustments
  };
}

export default useWeightTrackingIntegration;