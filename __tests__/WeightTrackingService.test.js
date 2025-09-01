import { WeightTrackingService } from '../src/services/WeightTrackingService';

describe('WeightTrackingService', () => {
  // Sample test data
  const mockWeightEntries = [
    { id: '1', weight: 70.0, date: '2024-01-01', timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 },
    { id: '2', weight: 69.8, date: '2024-01-03', timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000 },
    { id: '3', weight: 69.5, date: '2024-01-05', timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { id: '4', weight: 69.3, date: '2024-01-07', timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
    { id: '5', weight: 69.0, date: '2024-01-09', timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
    { id: '6', weight: 68.8, date: '2024-01-11', timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
    { id: '7', weight: 68.5, date: '2024-01-13', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: '8', weight: 68.2, date: '2024-01-15', timestamp: Date.now() }
  ];

  const mockUserProfile = {
    goal: 'cutting',
    goalWeight: 65.0,
    gender: 'male',
    age: 30,
    height: 175,
    weight: 70.0
  };

  describe('calculateProgressAnalytics', () => {
    it('should return null for empty weight entries', () => {
      const result = WeightTrackingService.calculateProgressAnalytics([], mockUserProfile);
      expect(result).toBeNull();
    });

    it('should return null for null weight entries', () => {
      const result = WeightTrackingService.calculateProgressAnalytics(null, mockUserProfile);
      expect(result).toBeNull();
    });

    it('should calculate basic progress analytics correctly', () => {
      const result = WeightTrackingService.calculateProgressAnalytics(mockWeightEntries, mockUserProfile);
      
      expect(result).toBeDefined();
      expect(result.currentWeight).toBe(68.2);
      expect(result.startingWeight).toBe(70.0);
      expect(result.totalChange).toBe(-1.8);
      expect(result.goalWeight).toBe(65.0);
      expect(result.dataPoints).toBe(8);
    });

    it('should calculate progress percentage correctly', () => {
      const result = WeightTrackingService.calculateProgressAnalytics(mockWeightEntries, mockUserProfile);
      
      // Progress towards goal: (70.0 - 68.2) / (70.0 - 65.0) = 1.8 / 5.0 = 36%
      expect(result.progressPercentage).toBeCloseTo(36, 0);
    });

    it('should calculate remaining change correctly', () => {
      const result = WeightTrackingService.calculateProgressAnalytics(mockWeightEntries, mockUserProfile);
      
      expect(result.remainingChange).toBe(65.0 - 68.2); // -3.2
    });
  });

  describe('calculateWeeklyTrend', () => {
    it('should return 0 for insufficient data', () => {
      const singleEntry = [mockWeightEntries[0]];
      const result = WeightTrackingService.calculateWeeklyTrend(singleEntry);
      expect(result).toBe(0);
    });

    it('should calculate weekly trend correctly', () => {
      // Test with entries spanning 2 weeks with consistent weight loss
      const sortedEntries = [...mockWeightEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
      const result = WeightTrackingService.calculateWeeklyTrend(sortedEntries, 2);
      
      // Should show negative trend (weight loss)
      expect(result).toBeLessThan(0);
    });

    it('should handle single time point correctly', () => {
      const sameTimeEntries = [
        { weight: 70.0, date: '2024-01-15', timestamp: Date.now() },
        { weight: 69.0, date: '2024-01-15', timestamp: Date.now() }
      ];
      
      const result = WeightTrackingService.calculateWeeklyTrend(sameTimeEntries);
      expect(result).toBe(0);
    });
  });

  describe('calculateLinearTrend', () => {
    it('should return 0 for insufficient data', () => {
      const twoEntries = mockWeightEntries.slice(0, 2);
      const result = WeightTrackingService.calculateLinearTrend(twoEntries);
      expect(result).toBe(0);
    });

    it('should calculate linear trend using regression', () => {
      const result = WeightTrackingService.calculateLinearTrend(mockWeightEntries);
      
      // Should show negative trend (weight loss) for our test data
      expect(result).toBeLessThan(0);
    });

    it('should handle consistent weight correctly', () => {
      const consistentEntries = [
        { weight: 70.0, date: '2024-01-01' },
        { weight: 70.0, date: '2024-01-03' },
        { weight: 70.0, date: '2024-01-05' }
      ];
      
      const result = WeightTrackingService.calculateLinearTrend(consistentEntries);
      expect(Math.abs(result)).toBeLessThan(0.1); // Should be close to 0
    });
  });

  describe('isProgressOnTrack', () => {
    it('should return true for progress matching cutting goal', () => {
      const weeklyTrend = -0.5; // 0.5kg loss per week
      const userProfile = { goal: 'cutting' };
      
      const result = WeightTrackingService.isProgressOnTrack(weeklyTrend, userProfile);
      expect(result).toBe(true);
    });

    it('should return false for insufficient progress on cutting', () => {
      const weeklyTrend = -0.1; // Too slow weight loss
      const userProfile = { goal: 'cutting' };
      
      const result = WeightTrackingService.isProgressOnTrack(weeklyTrend, userProfile);
      expect(result).toBe(false);
    });

    it('should return true for progress matching bulking goal', () => {
      const weeklyTrend = 0.25; // 0.25kg gain per week
      const userProfile = { goal: 'bulking' };
      
      const result = WeightTrackingService.isProgressOnTrack(weeklyTrend, userProfile);
      expect(result).toBe(true);
    });

    it('should return null for unknown goal', () => {
      const weeklyTrend = 0.0;
      const userProfile = { goal: 'unknown' };
      
      const result = WeightTrackingService.isProgressOnTrack(weeklyTrend, userProfile);
      expect(result).toBeNull();
    });
  });

  describe('getRecommendedWeeklyRate', () => {
    it('should return correct rate for cutting', () => {
      expect(WeightTrackingService.getRecommendedWeeklyRate('cutting')).toBe(-0.5);
    });

    it('should return correct rate for aggressive cutting', () => {
      expect(WeightTrackingService.getRecommendedWeeklyRate('aggressive_cutting')).toBe(-0.75);
    });

    it('should return correct rate for bulking', () => {
      expect(WeightTrackingService.getRecommendedWeeklyRate('bulking')).toBe(0.25);
    });

    it('should return correct rate for aggressive bulking', () => {
      expect(WeightTrackingService.getRecommendedWeeklyRate('aggressive_bulking')).toBe(0.5);
    });

    it('should return 0 for maintenance', () => {
      expect(WeightTrackingService.getRecommendedWeeklyRate('maintenance')).toBe(0);
    });

    it('should return 0 for unknown goal', () => {
      expect(WeightTrackingService.getRecommendedWeeklyRate('unknown')).toBe(0);
    });
  });

  describe('calculateProjectedGoalDate', () => {
    it('should calculate correct projection for weight loss', () => {
      const currentWeight = 70;
      const goalWeight = 65;
      const weeklyTrend = -0.5; // 0.5kg loss per week
      
      const result = WeightTrackingService.calculateProjectedGoalDate(currentWeight, goalWeight, weeklyTrend);
      
      expect(result).toBeDefined();
      // Should project 10 weeks from now (5kg / 0.5kg per week)
      const projectedDate = new Date(result);
      const today = new Date();
      const daysDifference = (projectedDate - today) / (1000 * 60 * 60 * 24);
      
      expect(daysDifference).toBeCloseTo(70, 5); // 10 weeks = 70 days, with some tolerance
    });

    it('should return null for wrong direction trend', () => {
      const currentWeight = 70;
      const goalWeight = 65;
      const weeklyTrend = 0.5; // Gaining weight when trying to lose
      
      const result = WeightTrackingService.calculateProjectedGoalDate(currentWeight, goalWeight, weeklyTrend);
      expect(result).toBeNull();
    });

    it('should return null for zero trend', () => {
      const currentWeight = 70;
      const goalWeight = 65;
      const weeklyTrend = 0;
      
      const result = WeightTrackingService.calculateProjectedGoalDate(currentWeight, goalWeight, weeklyTrend);
      expect(result).toBeNull();
    });

    it('should return null for unrealistic timeframes', () => {
      const currentWeight = 70;
      const goalWeight = 65;
      const weeklyTrend = -0.01; // Very slow progress
      
      const result = WeightTrackingService.calculateProjectedGoalDate(currentWeight, goalWeight, weeklyTrend);
      expect(result).toBeNull(); // Should be > 2 years
    });
  });

  describe('calculateMacroAdjustmentRecommendation', () => {
    const mockProgressAnalytics = {
      weeklyTrend: -0.3, // Slower than target
      isOnTrack: false,
      recommendedWeeklyRate: -0.5,
      dataPoints: 8,
      trackingDays: 14
    };

    const mockCurrentTargets = {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 67
    };

    it('should recommend adjustment for insufficient data', () => {
      const insufficientAnalytics = { ...mockProgressAnalytics, dataPoints: 3 };
      
      const result = WeightTrackingService.calculateMacroAdjustmentRecommendation(
        insufficientAnalytics,
        mockUserProfile,
        mockCurrentTargets
      );
      
      expect(result.shouldAdjust).toBe(false);
      expect(result.reason).toContain('Insufficient data');
    });

    it('should not recommend adjustment when on track', () => {
      const onTrackAnalytics = { ...mockProgressAnalytics, isOnTrack: true };
      
      const result = WeightTrackingService.calculateMacroAdjustmentRecommendation(
        onTrackAnalytics,
        mockUserProfile,
        mockCurrentTargets
      );
      
      expect(result.shouldAdjust).toBe(false);
      expect(result.reason).toContain('on track');
    });

    it('should recommend adjustment for significant deviation', () => {
      // Slow progress should trigger adjustment
      const result = WeightTrackingService.calculateMacroAdjustmentRecommendation(
        mockProgressAnalytics,
        mockUserProfile,
        mockCurrentTargets
      );
      
      expect(result.shouldAdjust).toBe(true);
      expect(result.adjustment).toBeLessThan(0); // Should reduce calories for faster weight loss
    });

    it('should cap extreme adjustments', () => {
      const extremeAnalytics = {
        ...mockProgressAnalytics,
        weeklyTrend: 0.5, // Gaining weight while trying to lose
        recommendedWeeklyRate: -0.5
      };
      
      const result = WeightTrackingService.calculateMacroAdjustmentRecommendation(
        extremeAnalytics,
        mockUserProfile,
        mockCurrentTargets
      );
      
      expect(result.shouldAdjust).toBe(true);
      expect(Math.abs(result.adjustment)).toBeLessThanOrEqual(300); // Capped at 300
    });
  });

  describe('validateWeightEntry', () => {
    it('should validate correct weight entry', () => {
      const result = WeightTrackingService.validateWeightEntry(70.5, '2024-01-15');
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject missing weight', () => {
      const result = WeightTrackingService.validateWeightEntry(null, '2024-01-15');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.weight).toBeDefined();
    });

    it('should reject invalid weight range', () => {
      const result1 = WeightTrackingService.validateWeightEntry(25, '2024-01-15'); // Too low
      const result2 = WeightTrackingService.validateWeightEntry(350, '2024-01-15'); // Too high
      
      expect(result1.isValid).toBe(false);
      expect(result1.errors.weight).toContain('between 30-300');
      
      expect(result2.isValid).toBe(false);
      expect(result2.errors.weight).toContain('between 30-300');
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const result = WeightTrackingService.validateWeightEntry(70, futureDate.toISOString().split('T')[0]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.date).toContain('future');
    });

    it('should reject dates too far in the past', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 2);
      
      const result = WeightTrackingService.validateWeightEntry(70, pastDate.toISOString().split('T')[0]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.date).toContain('1 year ago');
    });
  });

  describe('cleanWeightEntries', () => {
    it('should return empty array for null input', () => {
      const result = WeightTrackingService.cleanWeightEntries(null);
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      const result = WeightTrackingService.cleanWeightEntries('not an array');
      expect(result).toEqual([]);
    });

    it('should filter out invalid entries', () => {
      const mixedEntries = [
        { weight: 70.0, date: '2024-01-01' }, // Valid
        { weight: null, date: '2024-01-02' }, // Invalid weight
        { weight: 69.5, date: null }, // Invalid date
        { weight: 'invalid', date: '2024-01-03' }, // Invalid weight type
        { weight: 69.0, date: '2024-01-04' }, // Valid
      ];
      
      const result = WeightTrackingService.cleanWeightEntries(mixedEntries);
      
      expect(result).toHaveLength(2);
      expect(result[0].weight).toBe(70.0);
      expect(result[1].weight).toBe(69.0);
    });

    it('should normalize date formats', () => {
      const entries = [
        { weight: 70.0, date: '2024-01-01T12:00:00Z' }, // Full ISO string
        { weight: 69.5, date: '2024-01-02' }, // Date only
      ];
      
      const result = WeightTrackingService.cleanWeightEntries(entries);
      
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
    });

    it('should sort entries chronologically', () => {
      const unsortedEntries = [
        { weight: 69.0, date: '2024-01-05' },
        { weight: 70.0, date: '2024-01-01' },
        { weight: 68.0, date: '2024-01-10' },
        { weight: 69.5, date: '2024-01-03' },
      ];
      
      const result = WeightTrackingService.cleanWeightEntries(unsortedEntries);
      
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-03');
      expect(result[2].date).toBe('2024-01-05');
      expect(result[3].date).toBe('2024-01-10');
    });
  });

  describe('generateWeightTrackingInsights', () => {
    const mockAnalytics = {
      weeklyTrend: -0.5,
      dataPoints: 8,
      trackingDays: 14,
      isOnTrack: true,
      progressPercentage: 50
    };

    it('should return empty array for null analytics', () => {
      const result = WeightTrackingService.generateWeightTrackingInsights(null, mockUserProfile);
      expect(result).toEqual([]);
    });

    it('should generate insights for insufficient data', () => {
      const insufficientAnalytics = { ...mockAnalytics, dataPoints: 2 };
      
      const result = WeightTrackingService.generateWeightTrackingInsights(insufficientAnalytics, mockUserProfile);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(insight => insight.message.includes('consistently'))).toBe(true);
    });

    it('should generate success insight for on-track progress', () => {
      const result = WeightTrackingService.generateWeightTrackingInsights(mockAnalytics, mockUserProfile);
      
      const successInsight = result.find(insight => insight.type === 'success');
      expect(successInsight).toBeDefined();
      expect(successInsight.title).toContain('Great progress');
    });

    it('should generate warning for off-track progress', () => {
      const offTrackAnalytics = { ...mockAnalytics, isOnTrack: false };
      
      const result = WeightTrackingService.generateWeightTrackingInsights(offTrackAnalytics, mockUserProfile);
      
      const warningInsight = result.find(insight => insight.type === 'warning');
      expect(warningInsight).toBeDefined();
    });

    it('should sort insights by priority', () => {
      const analytics = {
        ...mockAnalytics,
        isOnTrack: false,
        progressPercentage: 80
      };
      
      const result = WeightTrackingService.generateWeightTrackingInsights(analytics, mockUserProfile);
      
      // High priority items should come first
      expect(result[0].priority).toBe('high');
    });
  });
});