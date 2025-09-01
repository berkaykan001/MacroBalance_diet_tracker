/**
 * MacroAdjustmentService - Intelligent macro adjustment based on weight tracking progress
 * 
 * Coordinates between WeightTrackingService, MacroCalculationService, and user contexts
 * to provide automated macro adjustments based on real progress data.
 */

import { MacroCalculationService } from './MacroCalculationService';
import { WeightTrackingService } from './WeightTrackingService';

export class MacroAdjustmentService {

  /**
   * Analyze current progress and generate macro adjustment recommendation
   */
  static analyzeProgressAndRecommendAdjustment(
    weightEntries, 
    userProfile, 
    currentTargets,
    weightSettings
  ) {
    // Calculate current progress analytics
    const progressAnalytics = WeightTrackingService.calculateProgressAnalytics(
      weightEntries, 
      userProfile
    );

    if (!progressAnalytics) {
      return {
        shouldAdjust: false,
        reason: 'Insufficient weight tracking data for analysis'
      };
    }

    // Get macro adjustment recommendation from weight tracking
    const adjustmentRecommendation = WeightTrackingService.calculateMacroAdjustmentRecommendation(
      progressAnalytics,
      userProfile,
      currentTargets
    );

    if (!adjustmentRecommendation.shouldAdjust) {
      return adjustmentRecommendation;
    }

    // Calculate new personalized targets with adjusted calories
    const adjustedProfile = {
      ...userProfile,
      // Temporarily override weight for new calculations
      weight: progressAnalytics.currentWeight
    };

    // Calculate what the targets would be with the new calorie goal
    const baseTargets = MacroCalculationService.calculatePersonalizedNutrition(adjustedProfile);
    
    // Apply the recommended calorie adjustment
    const adjustedCalories = adjustmentRecommendation.recommendedCalories;
    const calorieRatio = adjustedCalories / baseTargets.calculations.targetCalories;
    
    // Scale all macros proportionally to maintain ratios
    const adjustedTargets = {
      calories: Math.round(adjustedCalories),
      protein: Math.round(baseTargets.dailyTargets.protein * calorieRatio),
      carbs: Math.round(baseTargets.dailyTargets.carbs * calorieRatio),
      fat: Math.round(baseTargets.dailyTargets.fat * calorieRatio),
      fiber: Math.round(baseTargets.dailyTargets.fiber * calorieRatio),
      sugar: Math.round(baseTargets.dailyTargets.sugar * calorieRatio),
      saturatedFat: Math.round(baseTargets.dailyTargets.saturatedFat * calorieRatio),
      sodium: baseTargets.dailyTargets.sodium // Keep sodium constant
    };

    // Generate new meal distribution with adjusted targets
    const adjustedMealDistribution = MacroCalculationService.distributeMacrosAcrossMeals(
      adjustedTargets, 
      userProfile.mealsPerDay || 4
    );

    return {
      ...adjustmentRecommendation,
      adjustedTargets,
      adjustedMealDistribution,
      progressAnalytics,
      implementationPlan: this.generateImplementationPlan(
        currentTargets, 
        adjustedTargets, 
        adjustmentRecommendation
      )
    };
  }

  /**
   * Generate a gradual implementation plan for macro adjustments
   */
  static generateImplementationPlan(currentTargets, adjustedTargets, recommendation) {
    const calorieChange = adjustedTargets.calories - currentTargets.calories;
    const isLargeAdjustment = Math.abs(calorieChange) > 200;
    
    if (!isLargeAdjustment) {
      // Small adjustment - implement immediately
      return {
        type: 'immediate',
        duration: 'immediate',
        steps: [{
          week: 1,
          targets: adjustedTargets,
          description: 'Implement new macro targets'
        }]
      };
    }

    // Large adjustment - implement gradually over 2-3 weeks
    const weeks = Math.abs(calorieChange) > 300 ? 3 : 2;
    const steps = [];
    
    for (let week = 1; week <= weeks; week++) {
      const progress = week / weeks;
      const intermediateCalories = currentTargets.calories + (calorieChange * progress);
      const ratio = intermediateCalories / currentTargets.calories;
      
      steps.push({
        week,
        targets: {
          calories: Math.round(intermediateCalories),
          protein: Math.round(currentTargets.protein * ratio),
          carbs: Math.round(currentTargets.carbs * ratio),
          fat: Math.round(currentTargets.fat * ratio),
          fiber: Math.round(currentTargets.fiber * ratio),
          sugar: Math.round(currentTargets.sugar * ratio)
        },
        description: week === weeks ? 
          'Reach new target macros' : 
          `Gradual adjustment - Week ${week} of ${weeks}`
      });
    }

    return {
      type: 'gradual',
      duration: `${weeks} weeks`,
      totalAdjustment: calorieChange,
      weeklyAdjustment: Math.round(calorieChange / weeks),
      steps,
      rationale: 'Large calorie changes are implemented gradually to minimize metabolic adaptation and maintain adherence.'
    };
  }

  /**
   * Validate macro adjustment safety and reasonableness
   */
  static validateAdjustmentSafety(currentTargets, adjustedTargets, userProfile) {
    const warnings = [];
    const errors = [];

    // Check for extreme calorie changes
    const calorieChange = Math.abs(adjustedTargets.calories - currentTargets.calories);
    if (calorieChange > 500) {
      warnings.push('Large calorie adjustment detected. Consider gradual implementation.');
    }

    // Check minimum calorie requirements
    const minCalories = userProfile.gender === 'male' ? 1500 : 1200;
    if (adjustedTargets.calories < minCalories) {
      errors.push(`Adjusted calories (${adjustedTargets.calories}) are below safe minimum (${minCalories}).`);
    }

    // Check maximum reasonable calories
    const maxCalories = userProfile.gender === 'male' ? 4000 : 3500;
    if (adjustedTargets.calories > maxCalories) {
      warnings.push(`Very high calorie target (${adjustedTargets.calories}). Verify this is appropriate for your activity level.`);
    }

    // Check protein adequacy
    const proteinPerKg = adjustedTargets.protein / userProfile.weight;
    if (proteinPerKg < 1.2) {
      warnings.push(`Protein intake may be low (${proteinPerKg.toFixed(1)}g/kg). Consider maintaining higher protein levels.`);
    }

    // Check fat adequacy
    const fatCalories = adjustedTargets.fat * 9;
    const fatPercent = (fatCalories / adjustedTargets.calories) * 100;
    if (fatPercent < 20) {
      warnings.push('Fat intake may be too low for optimal hormone production. Consider maintaining at least 20% of calories from fat.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendation: errors.length === 0 ? 'safe' : 'unsafe'
    };
  }

  /**
   * Create user-friendly explanation of the adjustment
   */
  static explainAdjustment(recommendation, userProfile) {
    const { adjustment, deviation, progressAnalytics } = recommendation;
    const goal = userProfile?.goal || 'maintenance';
    
    let explanation = {
      title: '',
      summary: '',
      details: [],
      benefits: [],
      timeline: ''
    };

    // Determine adjustment direction and magnitude
    const isIncrease = adjustment > 0;
    const magnitude = Math.abs(adjustment);
    const sizeDescription = magnitude > 200 ? 'significant' : magnitude > 100 ? 'moderate' : 'small';

    // Generate title
    explanation.title = isIncrease ? 
      `Increase Daily Calories by ${magnitude}` :
      `Decrease Daily Calories by ${magnitude}`;

    // Generate summary based on goal and progress
    if (goal === 'cutting' || goal === 'aggressive_cutting') {
      if (isIncrease) {
        explanation.summary = 'Your weight loss is faster than target. Increasing calories will help maintain muscle mass and prevent metabolic slowdown.';
      } else {
        explanation.summary = 'Your weight loss is slower than target. Reducing calories will help accelerate progress toward your goal.';
      }
    } else if (goal === 'bulking' || goal === 'aggressive_bulking') {
      if (isIncrease) {
        explanation.summary = 'Your weight gain is slower than target. Increasing calories will help achieve your muscle-building goals.';
      } else {
        explanation.summary = 'Your weight gain is faster than target. Reducing calories slightly will help minimize fat gain.';
      }
    } else {
      explanation.summary = 'Your weight has changed from your maintenance target. This adjustment will help you return to your goal weight.';
    }

    // Generate detailed explanation
    explanation.details = [
      `Your recent weight trend: ${deviation > 0 ? 'gaining' : 'losing'} ${Math.abs(deviation).toFixed(1)} kg/week`,
      `Target rate for ${goal}: ${WeightTrackingService.getRecommendedWeeklyRate(goal)} kg/week`,
      `Confidence in recommendation: ${recommendation.confidence}%`,
      `Based on ${progressAnalytics.dataPoints} weight entries over ${progressAnalytics.trackingDays} days`
    ];

    // Generate benefits
    explanation.benefits = this.generateAdjustmentBenefits(goal, isIncrease, sizeDescription);

    // Timeline information
    if (recommendation.implementationPlan?.type === 'gradual') {
      explanation.timeline = `This ${sizeDescription} adjustment will be implemented gradually over ${recommendation.implementationPlan.duration} to optimize adherence and minimize metabolic adaptation.`;
    } else {
      explanation.timeline = 'This adjustment will be implemented immediately as it represents a small, manageable change.';
    }

    return explanation;
  }

  /**
   * Generate benefits list based on adjustment context
   */
  static generateAdjustmentBenefits(goal, isIncrease, magnitude) {
    const benefits = [];

    if (goal === 'cutting' || goal === 'aggressive_cutting') {
      if (isIncrease) {
        benefits.push('Prevent metabolic slowdown and maintain energy levels');
        benefits.push('Preserve lean muscle mass during weight loss');
        benefits.push('Improve workout performance and recovery');
      } else {
        benefits.push('Accelerate fat loss progress toward your goal');
        benefits.push('Overcome potential weight loss plateau');
        benefits.push('Maintain motivation with visible progress');
      }
    } else if (goal === 'bulking' || goal === 'aggressive_bulking') {
      if (isIncrease) {
        benefits.push('Support muscle protein synthesis for growth');
        benefits.push('Provide adequate energy for intense training');
        benefits.push('Optimize recovery between workouts');
      } else {
        benefits.push('Minimize excess fat accumulation');
        benefits.push('Maintain lean bulk with better body composition');
        benefits.push('Support sustainable long-term progress');
      }
    } else {
      benefits.push('Return to your target maintenance weight');
      benefits.push('Stabilize your metabolism and energy levels');
      benefits.push('Maintain your achieved physique');
    }

    // Add general benefits for larger adjustments
    if (magnitude === 'significant') {
      benefits.push('Gradual implementation reduces adaptation stress');
      benefits.push('Better adherence through manageable changes');
    }

    return benefits;
  }

  /**
   * Generate macro adjustment notification for user
   */
  static generateAdjustmentNotification(recommendation, userProfile) {
    const explanation = this.explainAdjustment(recommendation, userProfile);
    const validation = this.validateAdjustmentSafety(
      { calories: recommendation.currentCalories }, 
      { calories: recommendation.recommendedCalories }, 
      userProfile
    );

    return {
      type: validation.isValid ? 'macro_adjustment' : 'macro_adjustment_warning',
      title: explanation.title,
      message: explanation.summary,
      priority: validation.errors.length > 0 ? 'high' : 'medium',
      data: {
        recommendation,
        explanation,
        validation,
        userProfile,
        timestamp: Date.now()
      },
      actions: [
        {
          id: 'accept',
          title: 'Accept Changes',
          type: 'primary'
        },
        {
          id: 'customize',
          title: 'Customize',
          type: 'secondary'
        },
        {
          id: 'dismiss',
          title: 'Not Now',
          type: 'tertiary'
        }
      ]
    };
  }

  /**
   * Apply macro adjustment to user profile and regenerate targets
   */
  static async applyMacroAdjustment(recommendation, userProfile, updateUserProfile, calculateAndSetPersonalizedTargets) {
    try {
      // Update user profile with current weight if needed
      if (recommendation.progressAnalytics?.currentWeight !== userProfile.weight) {
        await updateUserProfile({
          weight: recommendation.progressAnalytics.currentWeight
        });
      }

      // Apply the new targets
      await calculateAndSetPersonalizedTargets({
        ...userProfile,
        weight: recommendation.progressAnalytics.currentWeight
      }, recommendation.adjustedTargets);

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
  }

  /**
   * Check if user is eligible for macro adjustments
   */
  static isEligibleForAdjustment(userProfile, weightEntries, lastAdjustment, settings) {
    // Check if auto-adjustment is enabled
    if (!settings?.autoAdjustMacros) {
      return { eligible: false, reason: 'Auto-adjustment disabled in settings' };
    }

    // Check if user has completed onboarding
    if (!userProfile?.hasCompletedOnboarding) {
      return { eligible: false, reason: 'Complete onboarding first' };
    }

    // Check minimum data requirements
    if (!weightEntries || weightEntries.length < 6) {
      return { eligible: false, reason: 'Need at least 6 weight entries (2+ weeks)' };
    }

    // Check time since last adjustment
    const minInterval = (settings?.minimumWeeksForAdjustment || 2) * 7 * 24 * 60 * 60 * 1000;
    const timeSinceLastAdjustment = lastAdjustment ? Date.now() - lastAdjustment : Infinity;
    
    if (timeSinceLastAdjustment < minInterval) {
      const daysRemaining = Math.ceil((minInterval - timeSinceLastAdjustment) / (24 * 60 * 60 * 1000));
      return { 
        eligible: false, 
        reason: `Wait ${daysRemaining} more days between adjustments` 
      };
    }

    return { eligible: true };
  }
}

export default MacroAdjustmentService;