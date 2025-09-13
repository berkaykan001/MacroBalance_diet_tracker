/**
 * WeeklyCheckService - Manages weekly weight check prompts and macro adjustments
 * 
 * Core functionality:
 * - Detects when user needs to log weekly weight
 * - Triggers macro adjustment analysis after weight entry
 * - Manages notification scheduling and display
 * - Handles user responses to adjustment recommendations
 */

import { WeightTrackingService } from './WeightTrackingService';
import { MacroAdjustmentService } from './MacroAdjustmentService';
import TimeService from './TimeService';

export class WeeklyCheckService {

  /**
   * Check if user needs to log their weekly weight
   */
  static checkIfWeeklyWeightDue(weightEntries, weightSettings, userProfile) {
    if (!weightSettings?.trackingEnabled || !userProfile?.hasCompletedOnboarding) {
      return {
        isDue: false,
        reason: 'Weight tracking not enabled or onboarding incomplete'
      };
    }

    // No entries - first weight should be handled during onboarding, not weekly check
    if (!weightEntries || weightEntries.length === 0) {
      return {
        isDue: false,
        reason: 'First weight entry should be collected during onboarding'
      };
    }

    // Sort entries by date (most recent first)
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    const lastEntry = sortedEntries[0];
    const lastEntryDate = new Date(lastEntry.date);
    const today = TimeService.getCurrentDate();
    const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));

    // Check if it's been a week or more
    const weeklyTarget = 7; // days
    const isDue = daysSinceLastEntry >= weeklyTarget;

    if (!isDue) {
      return {
        isDue: false,
        reason: `Last weight logged ${daysSinceLastEntry} days ago`,
        daysSinceLastEntry,
        daysUntilNext: weeklyTarget - daysSinceLastEntry
      };
    }

    // Determine priority based on how overdue
    let priority = 'medium';
    let recommendedAction = 'log_weekly_weight';
    
    if (daysSinceLastEntry >= 14) {
      priority = 'high';
      recommendedAction = 'log_overdue_weight';
    } else if (daysSinceLastEntry >= 10) {
      priority = 'high';
    }

    return {
      isDue: true,
      reason: `It's been ${daysSinceLastEntry} days since your last weight entry`,
      priority,
      daysSinceLastEntry,
      lastWeight: lastEntry.weight,
      lastDate: lastEntry.date,
      isOverdue: daysSinceLastEntry > 7,
      recommendedAction
    };
  }

  /**
   * Process new weight entry and check for macro adjustments
   */
  static async processWeeklyWeightEntry(
    newWeight,
    date,
    weightEntries,
    userProfile,
    currentTargets,
    weightSettings
  ) {
    try {
      // Add the new weight entry to the analysis
      const updatedEntries = [
        ...weightEntries,
        {
          id: TimeService.now().toString(),
          weight: parseFloat(newWeight),
          date: date,
          timestamp: TimeService.now(),
          source: 'weekly_check',
          createdAt: TimeService.now()
        }
      ];

      // Calculate fresh progress analytics with new entry
      const progressAnalytics = WeightTrackingService.calculateProgressAnalytics(
        updatedEntries,
        userProfile
      );

      if (!progressAnalytics) {
        return {
          success: true,
          requiresMacroAdjustment: false,
          message: 'Weight logged successfully!'
        };
      }

      // Check if macro adjustment is needed
      const macroAdjustmentRecommendation = MacroAdjustmentService.analyzeProgressAndRecommendAdjustment(
        updatedEntries,
        userProfile,
        currentTargets,
        weightSettings
      );

      // Generate insights for user
      const insights = WeightTrackingService.generateWeightTrackingInsights(
        progressAnalytics,
        userProfile
      );

      const response = {
        success: true,
        newEntry: updatedEntries[updatedEntries.length - 1],
        progressAnalytics,
        insights,
        requiresMacroAdjustment: macroAdjustmentRecommendation?.shouldAdjust || false
      };

      // Add macro adjustment details if needed
      if (macroAdjustmentRecommendation?.shouldAdjust) {
        response.macroAdjustmentRecommendation = macroAdjustmentRecommendation;
        response.adjustmentExplanation = MacroAdjustmentService.explainAdjustment(
          macroAdjustmentRecommendation,
          userProfile
        );
        response.message = 'Weight logged! Based on your progress, we recommend adjusting your macros.';
      } else {
        response.message = `Great job! ${this.generateProgressMessage(progressAnalytics, userProfile)}`;
      }

      return response;

    } catch (error) {
      console.error('Error processing weekly weight entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to process weight entry'
      };
    }
  }

  /**
   * Generate encouraging progress message
   */
  static generateProgressMessage(progressAnalytics, userProfile) {
    const goal = userProfile?.goal;
    const weeklyTrend = progressAnalytics?.weeklyTrend || 0;
    const isOnTrack = progressAnalytics?.isOnTrack;

    if (isOnTrack) {
      return `You're perfectly on track with your ${goal} goal. Keep up the excellent work!`;
    }

    const trendDirection = weeklyTrend > 0 ? 'gaining' : weeklyTrend < 0 ? 'losing' : 'maintaining';
    const rate = Math.abs(weeklyTrend).toFixed(1);

    if (goal === 'cutting' || goal === 'aggressive_cutting') {
      if (weeklyTrend < 0) {
        return `You're losing ${rate} kg/week - great progress toward your goal!`;
      } else {
        return `Your weight is ${trendDirection} - let's fine-tune your plan to get back on track.`;
      }
    } else if (goal === 'bulking' || goal === 'aggressive_bulking') {
      if (weeklyTrend > 0) {
        return `You're gaining ${rate} kg/week - excellent progress toward your goal!`;
      } else {
        return `Your weight trend needs adjustment - let's optimize your plan for better gains.`;
      }
    } else {
      return `Your weight is ${rate > 0.1 ? trendDirection : 'stable'} - your plan is working well!`;
    }
  }

  /**
   * Create weekly check notification data
   */
  static createWeeklyCheckNotification(checkResult, userProfile) {
    if (!checkResult.isDue) {
      return null;
    }

    const { daysSinceLastEntry, isFirstEntry, priority, recommendedAction } = checkResult;

    let title, message, urgencyLevel;

    if (isFirstEntry) {
      title = '🎯 Start Your Weight Tracking Journey';
      message = 'Log your starting weight to begin tracking your progress and receive personalized macro adjustments.';
      urgencyLevel = 'high';
    } else if (daysSinceLastEntry >= 14) {
      title = '⚠️ Weight Check Overdue';
      message = `It's been ${daysSinceLastEntry} days since your last weigh-in. Regular tracking helps us keep your macros perfectly tuned for your goals.`;
      urgencyLevel = 'high';
    } else if (daysSinceLastEntry >= 10) {
      title = '📊 Weekly Weight Check';
      message = `Time for your weekly weigh-in! It's been ${daysSinceLastEntry} days - let's see how your progress is going.`;
      urgencyLevel = 'high';
    } else {
      title = '📊 Weekly Weight Check';
      message = `Ready for your weekly weigh-in? It's been ${daysSinceLastEntry} days since your last entry.`;
      urgencyLevel = 'medium';
    }

    return {
      id: 'weekly_weight_check',
      type: 'weekly_weight_check',
      title,
      message,
      priority: urgencyLevel,
      timestamp: TimeService.now(),
      data: {
        checkResult,
        userProfile,
        daysSinceLastEntry,
        isFirstEntry,
        recommendedAction
      },
      actions: [
        {
          id: 'log_weight',
          title: 'Log Weight Now',
          type: 'primary'
        },
        {
          id: 'remind_later',
          title: 'Remind Me Later',
          type: 'secondary'
        },
        {
          id: 'skip_week',
          title: 'Skip This Week',
          type: 'tertiary'
        }
      ]
    };
  }

  /**
   * Create macro adjustment notification after weight entry
   */
  static createMacroAdjustmentNotification(adjustmentData, userProfile) {
    if (!adjustmentData.requiresMacroAdjustment) {
      return null;
    }

    const { macroAdjustmentRecommendation, adjustmentExplanation } = adjustmentData;
    const adjustment = macroAdjustmentRecommendation.adjustment;
    const isIncrease = adjustment > 0;
    const magnitude = Math.abs(adjustment);

    const title = isIncrease ? 
      `📈 Increase Calories by ${magnitude}` :
      `📉 Decrease Calories by ${magnitude}`;

    return {
      id: 'macro_adjustment_recommendation',
      type: 'macro_adjustment',
      title,
      message: adjustmentExplanation.summary,
      priority: 'high',
      timestamp: TimeService.now(),
      data: {
        adjustmentData,
        userProfile,
        recommendation: macroAdjustmentRecommendation,
        explanation: adjustmentExplanation
      },
      actions: [
        {
          id: 'accept_adjustment',
          title: 'Apply Changes',
          type: 'primary'
        },
        {
          id: 'customize_adjustment',
          title: 'Customize',
          type: 'secondary'
        },
        {
          id: 'keep_current',
          title: 'Keep Current Macros',
          type: 'tertiary'
        }
      ]
    };
  }

  /**
   * Check if user should receive adjustment reminder
   */
  static shouldShowAdjustmentReminder(lastAdjustment, weightEntries, weightSettings) {
    if (!weightSettings?.autoAdjustMacros) {
      return false;
    }

    // Don't remind too frequently
    const minimumDaysBetweenReminders = 7;
    const daysSinceLastAdjustment = lastAdjustment ? 
      Math.floor((TimeService.now() - lastAdjustment) / (1000 * 60 * 60 * 24)) : 
      Infinity;

    if (daysSinceLastAdjustment < minimumDaysBetweenReminders) {
      return false;
    }

    // Need sufficient data for reliable adjustments
    if (!weightEntries || weightEntries.length < 6) {
      return false;
    }

    // Check if enough time has passed since initial tracking
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const trackingStartDate = new Date(sortedEntries[0].date);
    const daysSinceStart = Math.floor((TimeService.now() - trackingStartDate) / (1000 * 60 * 60 * 24));

    return daysSinceStart >= 14; // At least 2 weeks of data
  }

  /**
   * Get recommended weigh-in schedule
   */
  static getWeighInSchedule(weightSettings, userProfile) {
    const goal = userProfile?.goal;
    
    // More frequent weigh-ins for aggressive goals
    if (goal === 'aggressive_cutting' || goal === 'aggressive_bulking') {
      return {
        frequency: 'twice_weekly', // Every 3-4 days
        days: [1, 4], // Monday and Thursday (1-based week days)
        reason: 'Aggressive goals benefit from more frequent monitoring'
      };
    }
    
    // Standard weekly for most goals
    return {
      frequency: 'weekly', // Every 7 days
      days: [1], // Monday (1-based week day)
      reason: 'Weekly tracking provides reliable trend analysis'
    };
  }

  /**
   * Generate personalized tips for consistent tracking
   */
  static generateTrackingTips(userProfile, weightEntries) {
    const tips = [
      '⏰ Weigh yourself at the same time each day (preferably morning, after using the bathroom)',
      '📱 Set a weekly reminder on your phone to stay consistent',
      '📊 Focus on the weekly trend, not daily fluctuations',
      '💧 Avoid weighing after high-sodium meals or intense workouts'
    ];

    // Add goal-specific tips
    const goal = userProfile?.goal;
    if (goal === 'cutting' || goal === 'aggressive_cutting') {
      tips.push('🔥 During cutting phases, expect small daily fluctuations - the weekly average matters most');
    } else if (goal === 'bulking' || goal === 'aggressive_bulking') {
      tips.push('💪 During bulking, gradual steady gains indicate quality muscle growth');
    }

    // Add data-specific tips
    if (weightEntries && weightEntries.length > 0) {
      const daysSinceStart = WeightTrackingService.calculateTrackingDays(weightEntries);
      if (daysSinceStart >= 30) {
        tips.push('🎯 You\'ve been tracking for over a month - great consistency leads to better results!');
      }
    }

    return tips.slice(0, 4); // Return top 4 most relevant tips
  }
}

export default WeeklyCheckService;