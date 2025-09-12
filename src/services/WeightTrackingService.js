/**
 * WeightTrackingService - Comprehensive weight tracking and progress analytics
 * 
 * Features:
 * - Progress trend analysis with statistical methods
 * - Automatic macro adjustment recommendations
 * - Goal tracking with projections
 * - Data validation and cleanup
 * - Multiple calculation algorithms for accuracy
 */

export class WeightTrackingService {
  
  /**
   * Calculate comprehensive progress analytics from weight entries
   */
  static calculateProgressAnalytics(weightEntries, userProfile) {
    if (!weightEntries || weightEntries.length === 0) {
      return null;
    }

    // Sort entries by date (most recent first)
    const sortedEntries = weightEntries
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentWeight = sortedEntries[0].weight;
    const startingWeight = sortedEntries[sortedEntries.length - 1].weight;
    const totalChange = currentWeight - startingWeight;
    
    // Calculate trends using multiple methods for accuracy
    const weeklyTrend = this.calculateWeeklyTrend(sortedEntries);
    const monthlyTrend = this.calculateMonthlyTrend(sortedEntries);
    const linearTrend = this.calculateLinearTrend(sortedEntries);
    
    // Goal progress calculations
    const goalWeight = userProfile?.goalWeight;
    let progressAnalytics = {
      currentWeight,
      startingWeight,
      goalWeight,
      totalChange,
      totalChangePercent: ((totalChange / startingWeight) * 100),
      weeklyTrend,
      monthlyTrend,
      linearTrend,
      dataPoints: sortedEntries.length,
      trackingDays: this.calculateTrackingDays(sortedEntries),
      lastUpdated: Date.now()
    };

    // Add goal-specific calculations
    if (goalWeight && goalWeight !== currentWeight) {
      const remainingChange = goalWeight - currentWeight;
      const progressPercentage = totalChange !== 0 ? 
        Math.abs(totalChange) / Math.abs(goalWeight - startingWeight) * 100 : 0;
      
      progressAnalytics = {
        ...progressAnalytics,
        remainingChange,
        progressPercentage: Math.min(progressPercentage, 100),
        isOnTrack: this.isProgressOnTrack(weeklyTrend, userProfile),
        projectedGoalDate: this.calculateProjectedGoalDate(currentWeight, goalWeight, weeklyTrend),
        recommendedWeeklyRate: this.getRecommendedWeeklyRate(userProfile?.goal)
      };
    }

    return progressAnalytics;
  }

  /**
   * Calculate weekly weight trend using moving average
   */
  static calculateWeeklyTrend(sortedEntries, weeks = 2) {
    if (sortedEntries.length < 2) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

    const recentEntries = sortedEntries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    if (recentEntries.length < 2) return 0;

    const firstWeight = recentEntries[recentEntries.length - 1].weight;
    const lastWeight = recentEntries[0].weight;
    const daysDifference = (new Date(recentEntries[0].date) - new Date(recentEntries[recentEntries.length - 1].date)) / (1000 * 60 * 60 * 24);
    
    if (daysDifference === 0) return 0;
    
    const dailyRate = (lastWeight - firstWeight) / daysDifference;
    return dailyRate * 7; // Convert to weekly rate
  }

  /**
   * Calculate monthly weight trend
   */
  static calculateMonthlyTrend(sortedEntries, months = 1) {
    if (sortedEntries.length < 2) return 0;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const recentEntries = sortedEntries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    if (recentEntries.length < 2) return 0;

    const firstWeight = recentEntries[recentEntries.length - 1].weight;
    const lastWeight = recentEntries[0].weight;
    const daysDifference = (new Date(recentEntries[0].date) - new Date(recentEntries[recentEntries.length - 1].date)) / (1000 * 60 * 60 * 24);
    
    if (daysDifference === 0) return 0;
    
    const dailyRate = (lastWeight - firstWeight) / daysDifference;
    return dailyRate * 30; // Convert to monthly rate
  }

  /**
   * Calculate linear trend using least squares regression
   */
  static calculateLinearTrend(sortedEntries) {
    if (sortedEntries.length < 3) return 0;

    // Convert dates to days since first entry for regression
    const firstDate = new Date(sortedEntries[sortedEntries.length - 1].date);
    const dataPoints = sortedEntries.map(entry => ({
      x: (new Date(entry.date) - firstDate) / (1000 * 60 * 60 * 24), // days
      y: entry.weight
    }));

    // Linear regression calculation
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
    const sumXY = dataPoints.reduce((sum, point) => sum + (point.x * point.y), 0);
    const sumXX = dataPoints.reduce((sum, point) => sum + (point.x * point.x), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Convert slope (weight change per day) to weekly rate
    return slope * 7;
  }

  /**
   * Calculate total days of tracking
   */
  static calculateTrackingDays(sortedEntries) {
    if (sortedEntries.length < 2) return 0;
    
    const firstDate = new Date(sortedEntries[sortedEntries.length - 1].date);
    const lastDate = new Date(sortedEntries[0].date);
    
    return Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine if progress is on track for goal
   */
  static isProgressOnTrack(weeklyTrend, userProfile) {
    const goal = userProfile?.goal;
    const recommendedRate = this.getRecommendedWeeklyRate(goal);
    
    if (!recommendedRate) return null;

    const tolerance = Math.abs(recommendedRate) * 0.3; // 30% tolerance
    
    if (goal === 'cutting' || goal === 'aggressive_cutting') {
      // For cutting, we want negative trend (losing weight)
      return weeklyTrend <= recommendedRate + tolerance && weeklyTrend >= recommendedRate - tolerance;
    } else if (goal === 'bulking' || goal === 'aggressive_bulking') {
      // For bulking, we want positive trend (gaining weight)
      return weeklyTrend >= recommendedRate - tolerance && weeklyTrend <= recommendedRate + tolerance;
    }
    
    // For maintenance, we want minimal change
    return Math.abs(weeklyTrend) <= tolerance;
  }

  /**
   * Get recommended weekly weight change rate by goal
   */
  static getRecommendedWeeklyRate(goal) {
    switch (goal) {
      case 'cutting':
        return -0.5; // kg per week (1 lb/week)
      case 'aggressive_cutting':
        return -0.75; // kg per week (1.5 lbs/week)
      case 'bulking':
        return 0.25; // kg per week (0.5 lbs/week)
      case 'aggressive_bulking':
        return 0.5; // kg per week (1 lb/week)
      case 'maintenance':
      default:
        return 0; // No change
    }
  }

  /**
   * Calculate projected goal achievement date
   */
  static calculateProjectedGoalDate(currentWeight, goalWeight, weeklyTrend) {
    if (!goalWeight || weeklyTrend === 0) return null;

    const weightDifference = goalWeight - currentWeight;
    
    // Check if trend is in right direction for goal
    const isCorrectDirection = (weightDifference > 0 && weeklyTrend > 0) || 
                              (weightDifference < 0 && weeklyTrend < 0);
    
    if (!isCorrectDirection) return null;

    const weeksToGoal = Math.abs(weightDifference / weeklyTrend);
    
    // Don't project beyond reasonable timeframes (2 years)
    if (weeksToGoal > 104) return null;

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + (weeksToGoal * 7));
    
    return projectedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Calculate macro adjustment recommendations based on progress
   */
  static calculateMacroAdjustmentRecommendation(progressAnalytics, userProfile, currentTargets) {
    if (!progressAnalytics || progressAnalytics.dataPoints < 6) {
      // Need at least 6 data points (2+ weeks) for reliable adjustment
      return {
        shouldAdjust: false,
        reason: 'Insufficient data - need at least 2 weeks of tracking'
      };
    }

    const { weeklyTrend, isOnTrack, recommendedWeeklyRate } = progressAnalytics;
    const goal = userProfile?.goal;
    
    if (isOnTrack === true) {
      return {
        shouldAdjust: false,
        reason: 'Progress is on track - no adjustment needed'
      };
    }

    // Calculate deviation from target
    const deviation = weeklyTrend - recommendedWeeklyRate;
    const deviationPercent = Math.abs(deviation / recommendedWeeklyRate) * 100;
    
    // Only adjust if deviation is significant (>25%)
    if (deviationPercent < 25) {
      return {
        shouldAdjust: false,
        reason: 'Deviation is within acceptable range'
      };
    }

    // Calculate calorie adjustment needed
    // 1 kg = ~7700 calories, so 1 kg/week = ~1100 calories/day adjustment
    const calorieAdjustmentPerDay = deviation * 1100;
    
    // Cap adjustments to reasonable amounts (±300 calories per day)
    const cappedAdjustment = Math.max(-300, Math.min(300, calorieAdjustmentPerDay));
    
    const newCalorieTarget = currentTargets.calories + cappedAdjustment;
    
    return {
      shouldAdjust: true,
      reason: this.getAdjustmentReason(deviation, goal),
      currentCalories: currentTargets.calories,
      recommendedCalories: Math.round(newCalorieTarget),
      adjustment: Math.round(cappedAdjustment),
      deviation: Math.round(deviation * 1000) / 1000, // Round to 3 decimal places
      confidence: this.calculateAdjustmentConfidence(progressAnalytics)
    };
  }

  /**
   * Generate human-readable adjustment reason
   */
  static getAdjustmentReason(deviation, goal) {
    const isSlowerThanTarget = Math.abs(deviation) < Math.abs(this.getRecommendedWeeklyRate(goal));
    
    if (goal === 'cutting' || goal === 'aggressive_cutting') {
      if (deviation > 0) {
        return 'Weight loss is slower than target - recommend reducing calories';
      } else {
        return 'Weight loss is faster than target - recommend increasing calories slightly';
      }
    } else if (goal === 'bulking' || goal === 'aggressive_bulking') {
      if (deviation < 0) {
        return 'Weight gain is slower than target - recommend increasing calories';
      } else {
        return 'Weight gain is faster than target - recommend reducing calories slightly';
      }
    }
    
    return 'Weight change detected - adjusting calories to maintain goal';
  }

  /**
   * Calculate confidence score for adjustment recommendation
   */
  static calculateAdjustmentConfidence(progressAnalytics) {
    const { dataPoints, trackingDays, linearTrend, weeklyTrend } = progressAnalytics;
    
    let confidence = 0;
    
    // More data points = higher confidence (max 40%)
    confidence += Math.min(dataPoints / 20 * 40, 40);
    
    // Longer tracking period = higher confidence (max 30%)
    confidence += Math.min(trackingDays / 60 * 30, 30);
    
    // Consistency between trend methods = higher confidence (max 30%)
    const trendConsistency = 1 - Math.abs(linearTrend - weeklyTrend) / Math.max(Math.abs(linearTrend), Math.abs(weeklyTrend), 1);
    confidence += trendConsistency * 30;
    
    return Math.min(Math.round(confidence), 100);
  }

  /**
   * Validate weight entry data
   */
  static validateWeightEntry(weight, date) {
    const errors = {};
    
    // Weight validation
    if (!weight || isNaN(weight)) {
      errors.weight = 'Weight is required and must be a number';
    } else if (weight < 30 || weight > 300) {
      errors.weight = 'Weight must be between 30-300 kg';
    }
    
    // Date validation
    if (!date) {
      errors.date = 'Date is required';
    } else {
      const entryDate = new Date(date);
      const today = new Date();
      const yearAgo = new Date();
      yearAgo.setFullYear(today.getFullYear() - 1);
      
      if (isNaN(entryDate.getTime())) {
        errors.date = 'Invalid date format';
      } else if (entryDate > today) {
        errors.date = 'Date cannot be in the future';
      } else if (entryDate < yearAgo) {
        errors.date = 'Date cannot be more than 1 year ago';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Clean and prepare weight entries data
   */
  static cleanWeightEntries(entries) {
    if (!entries || !Array.isArray(entries)) return [];
    
    return entries
      .filter(entry => entry && entry.weight && entry.date)
      .map(entry => ({
        ...entry,
        weight: parseFloat(entry.weight),
        date: new Date(entry.date).toISOString().split('T')[0] // Normalize to YYYY-MM-DD
      }))
      .filter(entry => !isNaN(entry.weight))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort chronologically
  }

  /**
   * Generate weight tracking insights and recommendations
   */
  static generateWeightTrackingInsights(progressAnalytics, userProfile) {
    if (!progressAnalytics) return [];

    const insights = [];
    const { weeklyTrend, dataPoints, trackingDays, isOnTrack, progressPercentage } = progressAnalytics;
    const goal = userProfile?.goal;

    // Data quality insights
    if (dataPoints < 4) {
      insights.push({
        type: 'info',
        title: 'Keep tracking!',
        message: 'Log your weight consistently for more accurate progress analysis.',
        priority: 'medium'
      });
    }

    // Progress insights
    if (isOnTrack === true) {
      insights.push({
        type: 'success',
        title: 'Great progress!',
        message: `You're on track with your ${goal} goal. Keep up the excellent work!`,
        priority: 'high'
      });
    } else if (isOnTrack === false) {
      insights.push({
        type: 'warning',
        title: 'Progress needs attention',
        message: 'Your weight trend suggests adjustments to your nutrition plan might help.',
        priority: 'high'
      });
    }

    // Goal progress insights
    if (progressPercentage && progressPercentage > 75) {
      insights.push({
        type: 'success',
        title: 'Almost there!',
        message: `You've achieved ${Math.round(progressPercentage)}% of your goal. The finish line is in sight!`,
        priority: 'high'
      });
    } else if (progressPercentage && progressPercentage > 50) {
      insights.push({
        type: 'success',
        title: 'Halfway milestone!',
        message: `You've completed ${Math.round(progressPercentage)}% of your journey. Keep pushing forward!`,
        priority: 'medium'
      });
    }

    // Trend insights
    const trendDirection = weeklyTrend > 0 ? 'gaining' : weeklyTrend < 0 ? 'losing' : 'maintaining';
    const trendRate = Math.abs(weeklyTrend);
    
    if (trendRate > 0.1) {
      insights.push({
        type: 'info',
        title: `You're ${trendDirection} ${trendRate.toFixed(1)} kg/week`,
        message: 'This trend is based on your recent weight entries.',
        priority: 'low'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Validate weight entry data
   */
  static validateWeightEntry(weight, date) {
    const errors = {};
    
    // Weight validation
    if (!weight || isNaN(weight) || weight <= 0) {
      errors.weight = 'Weight must be a positive number';
    } else if (weight < 30 || weight > 500) {
      errors.weight = 'Weight must be between 30 and 500 kg';
    }
    
    // Date validation - allow future dates when time simulation is active
    if (!date) {
      errors.date = 'Date is required';
    } else {
      const entryDate = new Date(date);
      if (isNaN(entryDate.getTime())) {
        errors.date = 'Invalid date format';
      }
      // Note: Removed future date check to support time simulation
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default WeightTrackingService;