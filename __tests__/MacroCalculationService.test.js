import MacroCalculationService from '../src/services/MacroCalculationService';

describe('MacroCalculationService', () => {
  
  describe('validateUserProfile', () => {
    test('should return no errors for valid profile', () => {
      const validProfile = {
        age: 25,
        gender: 'male',
        weight: 75,
        height: 180,
        bodyFat: 15,
        activityLevel: 'moderate',
        goal: 'bulking',
        mealsPerDay: 4
      };
      
      const errors = MacroCalculationService.validateUserProfile(validProfile);
      expect(errors).toHaveLength(0);
    });
    
    test('should return errors for invalid profile', () => {
      const invalidProfile = {
        age: 16, // Too young
        gender: 'other', // Invalid
        weight: 300, // Too high
        height: 120, // Too low
        activityLevel: 'invalid',
        goal: 'invalid',
        mealsPerDay: 10
      };
      
      const errors = MacroCalculationService.validateUserProfile(invalidProfile);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('calculateBMR', () => {
    test('should calculate BMR correctly using Mifflin-St Jeor for male', () => {
      const bmr = MacroCalculationService.calculateBMR(75, 180, 25, 'male');
      // Expected: (10 * 75) + (6.25 * 180) - (5 * 25) + 5 = 1755
      expect(bmr).toBeCloseTo(1755, 0);
    });
    
    test('should calculate BMR correctly using Mifflin-St Jeor for female', () => {
      const bmr = MacroCalculationService.calculateBMR(60, 165, 30, 'female');
      // Expected: (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(bmr).toBeCloseTo(1320, 0);
    });
    
    test('should use Katch-McArdle when body fat is provided', () => {
      const bmr = MacroCalculationService.calculateBMR(80, 180, 30, 'male', 12);
      // Expected: 370 + (21.6 * (80 * 0.88)) = 370 + (21.6 * 70.4) = 1890.64
      expect(bmr).toBeCloseTo(1891, 0);
    });
  });

  describe('calculateTDEE', () => {
    test('should calculate TDEE correctly with different activity levels', () => {
      const bmr = 1800;
      
      expect(MacroCalculationService.calculateTDEE(bmr, 'sedentary')).toBe(2160); // 1800 * 1.2
      expect(MacroCalculationService.calculateTDEE(bmr, 'moderate')).toBe(2790); // 1800 * 1.55
      expect(MacroCalculationService.calculateTDEE(bmr, 'very_active')).toBe(3105); // 1800 * 1.725
    });
  });

  describe('adjustCaloriesForGoal', () => {
    test('should adjust calories correctly for different goals', () => {
      const tdee = 2500;
      
      expect(MacroCalculationService.adjustCaloriesForGoal(tdee, 'cutting')).toBe(2125); // 15% deficit
      expect(MacroCalculationService.adjustCaloriesForGoal(tdee, 'bulking')).toBe(2875); // 15% surplus
      expect(MacroCalculationService.adjustCaloriesForGoal(tdee, 'maintenance')).toBe(2500); // No change
    });
  });

  describe('calculateMacroDistribution', () => {
    test('should calculate macros correctly for cutting', () => {
      const macros = MacroCalculationService.calculateMacroDistribution(2000, 75, 'cutting');
      
      expect(macros.calories).toBe(2000);
      expect(macros.protein).toBe(165); // 75 * 2.2 = 165g
      expect(macros.carbs).toBeGreaterThan(100);
      expect(macros.fat).toBeGreaterThan(50);
      expect(macros.fiber).toBeGreaterThan(20);
    });
    
    test('should calculate macros correctly for bulking', () => {
      const macros = MacroCalculationService.calculateMacroDistribution(3000, 80, 'bulking');
      
      expect(macros.calories).toBe(3000);
      expect(macros.protein).toBe(144); // 80 * 1.8 = 144g
      expect(macros.carbs).toBeGreaterThan(200);
      expect(macros.fat).toBeGreaterThan(80);
    });
  });

  describe('calculateMicronutrientNeeds', () => {
    test('should calculate micronutrients with activity adjustments', () => {
      const micros = MacroCalculationService.calculateMicronutrientNeeds(25, 'male', 75, 'very_active');
      
      expect(micros.iron).toBeGreaterThan(8); // Base RDA * activity multiplier
      expect(micros.magnesium).toBeGreaterThan(400);
      expect(micros.vitaminD).toBeGreaterThan(15);
      expect(micros.sodium).toBe(2300); // Should remain as upper limit
    });
    
    test('should account for gender differences', () => {
      const maleMicros = MacroCalculationService.calculateMicronutrientNeeds(25, 'male', 75, 'moderate');
      const femaleMicros = MacroCalculationService.calculateMicronutrientNeeds(25, 'female', 60, 'moderate');
      
      expect(femaleMicros.iron).toBeGreaterThan(maleMicros.iron); // Females need more iron
      expect(maleMicros.magnesium).toBeGreaterThan(femaleMicros.magnesium); // Males need more magnesium
    });
  });

  describe('calculatePersonalizedNutrition - Integration Tests', () => {
    test('should calculate complete nutrition profile for cutting male', () => {
      const profile = {
        age: 28,
        gender: 'male',
        weight: 80,
        height: 185,
        bodyFat: 18,
        activityLevel: 'very_active',
        goal: 'cutting',
        mealsPerDay: 5
      };
      
      const result = MacroCalculationService.calculatePersonalizedNutrition(profile);
      
      // Check structure
      expect(result).toHaveProperty('userProfile');
      expect(result).toHaveProperty('calculations');
      expect(result).toHaveProperty('dailyTargets');
      expect(result).toHaveProperty('mealDistribution');
      expect(result).toHaveProperty('recommendations');
      
      // Check calculations
      expect(result.calculations.bmr).toBeGreaterThan(1500);
      expect(result.calculations.tdee).toBeGreaterThan(result.calculations.bmr);
      expect(result.calculations.targetCalories).toBeLessThan(result.calculations.tdee); // Cutting deficit
      
      // Check macros
      expect(result.dailyTargets.protein).toBeGreaterThan(150); // High protein for cutting
      expect(result.dailyTargets.carbs).toBeGreaterThan(100);
      expect(result.dailyTargets.fat).toBeGreaterThan(50);
      
      // Check meal distribution
      expect(result.mealDistribution).toHaveLength(5);
      expect(result.mealDistribution[0]).toHaveProperty('name');
      expect(result.mealDistribution[0]).toHaveProperty('macroTargets');
      
      // Check micronutrients
      expect(result.dailyTargets.micronutrients).toHaveProperty('iron');
      expect(result.dailyTargets.micronutrients).toHaveProperty('vitaminD');
      expect(result.dailyTargets.micronutrients).toHaveProperty('magnesium');
      
      // Check recommendations
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
    
    test('should calculate complete nutrition profile for bulking female', () => {
      const profile = {
        age: 24,
        gender: 'female',
        weight: 55,
        height: 165,
        bodyFat: 22,
        activityLevel: 'moderate',
        goal: 'bulking',
        mealsPerDay: 4
      };
      
      const result = MacroCalculationService.calculatePersonalizedNutrition(profile);
      
      // Check calculations
      expect(result.calculations.targetCalories).toBeGreaterThan(result.calculations.tdee); // Bulking surplus
      
      // Check macros favor carbs for bulking
      expect(result.dailyTargets.carbs).toBeGreaterThan(result.dailyTargets.protein);
      
      // Check meal distribution
      expect(result.mealDistribution).toHaveLength(4);
      expect(result.mealDistribution.map(m => m.name)).toContain('Breakfast');
      expect(result.mealDistribution.map(m => m.name)).toContain('Post-Workout');
      
      // Check female-specific micronutrients
      expect(result.dailyTargets.micronutrients.iron).toBeGreaterThan(15); // Females need more iron
    });
    
    test('should handle maintenance goal correctly', () => {
      const profile = {
        age: 35,
        gender: 'male',
        weight: 75,
        height: 180,
        activityLevel: 'light',
        goal: 'maintenance',
        mealsPerDay: 3
      };
      
      const result = MacroCalculationService.calculatePersonalizedNutrition(profile);
      
      // Maintenance should have calories = TDEE
      expect(result.calculations.targetCalories).toBeCloseTo(result.calculations.tdee, 0);
      
      // Should have balanced macro distribution
      const proteinCals = result.dailyTargets.protein * 4;
      const carbCals = result.dailyTargets.carbs * 4;
      const fatCals = result.dailyTargets.fat * 9;
      const totalMacroCals = proteinCals + carbCals + fatCals;
      
      expect(Math.abs(totalMacroCals - result.dailyTargets.calories)).toBeLessThan(50); // Within 50 cal tolerance
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing body fat gracefully', () => {
      const profile = {
        age: 30,
        gender: 'female',
        weight: 65,
        height: 170,
        // bodyFat: undefined
        activityLevel: 'moderate',
        goal: 'maintenance',
        mealsPerDay: 4
      };
      
      const result = MacroCalculationService.calculatePersonalizedNutrition(profile);
      expect(result.calculations.bmr).toBeGreaterThan(0);
    });
    
    test('should handle extreme activity levels', () => {
      const profile = {
        age: 25,
        gender: 'male',
        weight: 80,
        height: 185,
        activityLevel: 'extremely_active',
        goal: 'bulking',
        mealsPerDay: 6
      };
      
      const result = MacroCalculationService.calculatePersonalizedNutrition(profile);
      expect(result.calculations.tdee).toBeGreaterThan(3000); // Should be high for extreme activity
      expect(result.mealDistribution).toHaveLength(6);
    });
  });
});