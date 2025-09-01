import { MacroAdjustmentService } from '../src/services/MacroAdjustmentService';

// Mock dependencies
jest.mock('../src/services/MacroCalculationService', () => ({
  MacroCalculationService: {
    calculatePersonalizedNutrition: jest.fn(() => ({
      calculations: { targetCalories: 2000 },
      dailyTargets: {
        protein: 150,
        carbs: 200,
        fat: 67,
        fiber: 25,
        sugar: 50,
        saturatedFat: 20,
        sodium: 2300
      }
    })),
    distributeMacrosAcrossMeals: jest.fn(() => [
      {
        name: 'Breakfast',
        macroTargets: { protein: 37, carbs: 50, fat: 17, calories: 500 }
      },
      {
        name: 'Lunch',
        macroTargets: { protein: 37, carbs: 50, fat: 17, calories: 500 }
      },
      {
        name: 'Dinner',
        macroTargets: { protein: 37, carbs: 50, fat: 17, calories: 500 }
      },
      {
        name: 'Snack',
        macroTargets: { protein: 37, carbs: 50, fat: 17, calories: 500 }
      }
    ])
  }
}));

jest.mock('../src/services/WeightTrackingService', () => ({
  WeightTrackingService: {
    calculateProgressAnalytics: jest.fn(),
    calculateMacroAdjustmentRecommendation: jest.fn(),
    getRecommendedWeeklyRate: jest.fn()
  }
}));

describe('MacroAdjustmentService', () => {
  const mockWeightEntries = [
    { id: '1', weight: 70.0, date: '2024-01-01' },
    { id: '2', weight: 69.5, date: '2024-01-05' },
    { id: '3', weight: 69.0, date: '2024-01-10' },
    { id: '4', weight: 68.5, date: '2024-01-15' }
  ];

  const mockUserProfile = {
    age: 30,
    gender: 'male',
    height: 175,
    weight: 70,
    goal: 'cutting',
    mealsPerDay: 4,
    hasCompletedOnboarding: true
  };

  const mockCurrentTargets = {
    calories: 2200,
    protein: 165,
    carbs: 220,
    fat: 73,
    fiber: 28,
    sugar: 55
  };

  const mockWeightSettings = {
    autoAdjustMacros: true,
    minimumWeeksForAdjustment: 2
  };

  describe('analyzeProgressAndRecommendAdjustment', () => {
    beforeEach(() => {
      const { WeightTrackingService } = require('../src/services/WeightTrackingService');
      
      WeightTrackingService.calculateProgressAnalytics.mockReturnValue({
        currentWeight: 68.5,
        weeklyTrend: -0.3,
        isOnTrack: false,
        dataPoints: 4
      });

      WeightTrackingService.calculateMacroAdjustmentRecommendation.mockReturnValue({
        shouldAdjust: true,
        currentCalories: 2200,
        recommendedCalories: 1950,
        adjustment: -250,
        reason: 'Weight loss is slower than target',
        confidence: 75
      });
    });

    it('should return recommendation when adjustment is needed', () => {
      const result = MacroAdjustmentService.analyzeProgressAndRecommendAdjustment(
        mockWeightEntries,
        mockUserProfile,
        mockCurrentTargets,
        mockWeightSettings
      );

      expect(result.shouldAdjust).toBe(true);
      expect(result.adjustedTargets).toBeDefined();
      expect(result.adjustedMealDistribution).toBeDefined();
      expect(result.implementationPlan).toBeDefined();
    });

    it('should return no recommendation when insufficient data', () => {
      const { WeightTrackingService } = require('../src/services/WeightTrackingService');
      WeightTrackingService.calculateProgressAnalytics.mockReturnValue(null);

      const result = MacroAdjustmentService.analyzeProgressAndRecommendAdjustment(
        [],
        mockUserProfile,
        mockCurrentTargets,
        mockWeightSettings
      );

      expect(result.shouldAdjust).toBe(false);
      expect(result.reason).toContain('Insufficient weight tracking data');
    });

    it('should return no recommendation when tracking says no adjustment needed', () => {
      const { WeightTrackingService } = require('../src/services/WeightTrackingService');
      
      WeightTrackingService.calculateMacroAdjustmentRecommendation.mockReturnValue({
        shouldAdjust: false,
        reason: 'Progress is on track'
      });

      const result = MacroAdjustmentService.analyzeProgressAndRecommendAdjustment(
        mockWeightEntries,
        mockUserProfile,
        mockCurrentTargets,
        mockWeightSettings
      );

      expect(result.shouldAdjust).toBe(false);
      expect(result.reason).toBe('Progress is on track');
    });

    it('should generate adjusted meal distribution', () => {
      const result = MacroAdjustmentService.analyzeProgressAndRecommendAdjustment(
        mockWeightEntries,
        mockUserProfile,
        mockCurrentTargets,
        mockWeightSettings
      );

      expect(result.adjustedMealDistribution).toBeDefined();
      expect(Array.isArray(result.adjustedMealDistribution)).toBe(true);
      expect(result.adjustedMealDistribution).toHaveLength(4); // 4 meals per day
    });
  });

  describe('generateImplementationPlan', () => {
    it('should generate immediate plan for small adjustments', () => {
      const currentTargets = { calories: 2000, protein: 150, carbs: 200, fat: 67 };
      const adjustedTargets = { calories: 1900, protein: 143, carbs: 190, fat: 63 }; // 100 cal difference
      const recommendation = { adjustment: -100 };

      const result = MacroAdjustmentService.generateImplementationPlan(
        currentTargets,
        adjustedTargets,
        recommendation
      );

      expect(result.type).toBe('immediate');
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].targets.calories).toBe(1900);
    });

    it('should generate gradual plan for large adjustments', () => {
      const currentTargets = { calories: 2000, protein: 150, carbs: 200, fat: 67 };
      const adjustedTargets = { calories: 1600, protein: 120, carbs: 160, fat: 53 }; // 400 cal difference
      const recommendation = { adjustment: -400 };

      const result = MacroAdjustmentService.generateImplementationPlan(
        currentTargets,
        adjustedTargets,
        recommendation
      );

      expect(result.type).toBe('gradual');
      expect(result.duration).toContain('weeks');
      expect(result.steps.length).toBeGreaterThan(1);
      expect(result.rationale).toBeDefined();
    });

    it('should create appropriate number of steps for gradual implementation', () => {
      const currentTargets = { calories: 2000 };
      const adjustedTargets = { calories: 1700 }; // 300 cal difference
      const recommendation = { adjustment: -300 };

      const result = MacroAdjustmentService.generateImplementationPlan(
        currentTargets,
        adjustedTargets,
        recommendation
      );

      expect(result.steps).toHaveLength(2); // 300 cal = 2 weeks
      expect(result.steps[0].week).toBe(1);
      expect(result.steps[1].week).toBe(2);
    });
  });

  describe('validateAdjustmentSafety', () => {
    it('should validate safe adjustments', () => {
      const currentTargets = { calories: 2000 };
      const adjustedTargets = { calories: 1800, protein: 135, fat: 60 };
      const userProfile = { gender: 'male', weight: 70 };

      const result = MacroAdjustmentService.validateAdjustmentSafety(
        currentTargets,
        adjustedTargets,
        userProfile
      );

      expect(result.isValid).toBe(true);
      expect(result.recommendation).toBe('safe');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect dangerous low calorie targets', () => {
      const currentTargets = { calories: 1800 };
      const adjustedTargets = { calories: 1200, protein: 90, fat: 40 }; // Below male minimum
      const userProfile = { gender: 'male', weight: 70 };

      const result = MacroAdjustmentService.validateAdjustmentSafety(
        currentTargets,
        adjustedTargets,
        userProfile
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('below safe minimum');
    });

    it('should detect dangerous low calorie targets for females', () => {
      const currentTargets = { calories: 1500 };
      const adjustedTargets = { calories: 1000 }; // Below female minimum
      const userProfile = { gender: 'female', weight: 60 };

      const result = MacroAdjustmentService.validateAdjustmentSafety(
        currentTargets,
        adjustedTargets,
        userProfile
      );

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('1200');
    });

    it('should warn about very high calorie targets', () => {
      const currentTargets = { calories: 3000 };
      const adjustedTargets = { calories: 4500 }; // Very high
      const userProfile = { gender: 'male', weight: 70 };

      const result = MacroAdjustmentService.validateAdjustmentSafety(
        currentTargets,
        adjustedTargets,
        userProfile
      );

      expect(result.isValid).toBe(true); // Valid but with warnings
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Very high calorie target');
    });

    it('should warn about low protein intake', () => {
      const currentTargets = { calories: 2000 };
      const adjustedTargets = { calories: 1800, protein: 70, fat: 60 }; // ~1g/kg protein
      const userProfile = { gender: 'male', weight: 80 };

      const result = MacroAdjustmentService.validateAdjustmentSafety(
        currentTargets,
        adjustedTargets,
        userProfile
      );

      expect(result.warnings.some(w => w.includes('Protein intake may be low'))).toBe(true);
    });

    it('should warn about very low fat intake', () => {
      const currentTargets = { calories: 2000 };
      const adjustedTargets = { calories: 1800, protein: 135, fat: 30 }; // 15% fat
      const userProfile = { gender: 'male', weight: 70 };

      const result = MacroAdjustmentService.validateAdjustmentSafety(
        currentTargets,
        adjustedTargets,
        userProfile
      );

      expect(result.warnings.some(w => w.includes('Fat intake may be too low'))).toBe(true);
    });
  });

  describe('explainAdjustment', () => {
    const mockRecommendation = {
      adjustment: -200,
      deviation: 0.2, // 0.2kg/week difference
      progressAnalytics: { dataPoints: 8, trackingDays: 14 },
      confidence: 80
    };

    it('should explain calorie increase for cutting', () => {
      const recommendation = { ...mockRecommendation, adjustment: 150, deviation: -0.3 }; // Faster loss
      const userProfile = { goal: 'cutting' };

      const result = MacroAdjustmentService.explainAdjustment(recommendation, userProfile);

      expect(result.title).toContain('Increase');
      expect(result.summary).toContain('faster than target');
      expect(result.details).toBeDefined();
      expect(result.benefits).toBeDefined();
    });

    it('should explain calorie decrease for slow cutting', () => {
      const userProfile = { goal: 'cutting' };

      const result = MacroAdjustmentService.explainAdjustment(mockRecommendation, userProfile);

      expect(result.title).toContain('Decrease');
      expect(result.summary).toContain('slower than target');
    });

    it('should explain adjustments for bulking goals', () => {
      const recommendation = { ...mockRecommendation, adjustment: 200, deviation: -0.1 }; // Slow gain
      const userProfile = { goal: 'bulking' };

      const result = MacroAdjustmentService.explainAdjustment(recommendation, userProfile);

      expect(result.title).toContain('Increase');
      expect(result.summary).toContain('slower than target');
      expect(result.summary).toContain('muscle-building');
    });

    it('should include confidence and data information', () => {
      const userProfile = { goal: 'cutting' };

      const result = MacroAdjustmentService.explainAdjustment(mockRecommendation, userProfile);

      expect(result.details.some(d => d.includes('80%'))).toBe(true);
      expect(result.details.some(d => d.includes('8 weight entries'))).toBe(true);
      expect(result.details.some(d => d.includes('14 days'))).toBe(true);
    });
  });

  describe('generateAdjustmentBenefits', () => {
    it('should generate benefits for cutting with calorie decrease', () => {
      const result = MacroAdjustmentService.generateAdjustmentBenefits('cutting', false, 'moderate');

      expect(result).toContain('Accelerate fat loss progress');
      expect(result).toContain('Overcome potential weight loss plateau');
    });

    it('should generate benefits for cutting with calorie increase', () => {
      const result = MacroAdjustmentService.generateAdjustmentBenefits('cutting', true, 'small');

      expect(result).toContain('Prevent metabolic slowdown');
      expect(result).toContain('Preserve lean muscle mass');
    });

    it('should generate benefits for bulking with calorie increase', () => {
      const result = MacroAdjustmentService.generateAdjustmentBenefits('bulking', true, 'moderate');

      expect(result).toContain('Support muscle protein synthesis');
      expect(result).toContain('Provide adequate energy');
    });

    it('should generate benefits for bulking with calorie decrease', () => {
      const result = MacroAdjustmentService.generateAdjustmentBenefits('bulking', false, 'small');

      expect(result).toContain('Minimize excess fat accumulation');
      expect(result).toContain('Maintain lean bulk');
    });

    it('should add gradual implementation benefits for significant adjustments', () => {
      const result = MacroAdjustmentService.generateAdjustmentBenefits('cutting', false, 'significant');

      expect(result).toContain('Gradual implementation reduces adaptation stress');
    });
  });

  describe('isEligibleForAdjustment', () => {
    it('should allow eligible user with sufficient data', () => {
      const weightEntries = Array(8).fill().map((_, i) => ({ id: i, weight: 70 - i * 0.2, date: `2024-01-${i + 1}` }));

      const result = MacroAdjustmentService.isEligibleForAdjustment(
        mockUserProfile,
        weightEntries,
        null,
        mockWeightSettings
      );

      expect(result.eligible).toBe(true);
    });

    it('should reject if auto-adjustment is disabled', () => {
      const disabledSettings = { ...mockWeightSettings, autoAdjustMacros: false };

      const result = MacroAdjustmentService.isEligibleForAdjustment(
        mockUserProfile,
        mockWeightEntries,
        null,
        disabledSettings
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should reject if onboarding not completed', () => {
      const incompleteProfile = { ...mockUserProfile, hasCompletedOnboarding: false };

      const result = MacroAdjustmentService.isEligibleForAdjustment(
        incompleteProfile,
        mockWeightEntries,
        null,
        mockWeightSettings
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('onboarding');
    });

    it('should reject with insufficient weight entries', () => {
      const fewEntries = mockWeightEntries.slice(0, 3); // Only 3 entries

      const result = MacroAdjustmentService.isEligibleForAdjustment(
        mockUserProfile,
        fewEntries,
        null,
        mockWeightSettings
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('6 weight entries');
    });

    it('should reject if too recent adjustment', () => {
      const recentAdjustment = Date.now() - (7 * 24 * 60 * 60 * 1000); // 1 week ago
      const weightEntries = Array(8).fill().map((_, i) => ({ id: i, weight: 70, date: `2024-01-${i + 1}` }));

      const result = MacroAdjustmentService.isEligibleForAdjustment(
        mockUserProfile,
        weightEntries,
        recentAdjustment,
        mockWeightSettings
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('days between adjustments');
    });

    it('should calculate correct days remaining for recent adjustment', () => {
      const recentAdjustment = Date.now() - (10 * 24 * 60 * 60 * 1000); // 10 days ago
      const weightEntries = Array(8).fill().map((_, i) => ({ id: i, weight: 70, date: `2024-01-${i + 1}` }));
      const settings = { ...mockWeightSettings, minimumWeeksForAdjustment: 2 }; // 14 days minimum

      const result = MacroAdjustmentService.isEligibleForAdjustment(
        mockUserProfile,
        weightEntries,
        recentAdjustment,
        settings
      );

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('4 more days'); // 14 - 10 = 4 days
    });
  });
});