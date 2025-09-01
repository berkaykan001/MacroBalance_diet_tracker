import { MacroCalculationService } from '../src/services/MacroCalculationService';

describe('User Profile Integration', () => {
  describe('End-to-End Profile to Meals Flow', () => {
    test('should generate complete personalized nutrition and meal distribution', () => {
      const testProfile = {
        age: 28,
        gender: 'male',
        weight: 80,
        height: 185,
        bodyFat: 15,
        activityLevel: 'very_active',
        goal: 'cutting',
        mealsPerDay: 5
      };

      const result = MacroCalculationService.calculatePersonalizedNutrition(testProfile);

      // Verify structure for integration with SettingsContext
      expect(result).toHaveProperty('userProfile');
      expect(result).toHaveProperty('calculations');
      expect(result).toHaveProperty('dailyTargets');
      expect(result).toHaveProperty('mealDistribution');
      expect(result).toHaveProperty('recommendations');

      // Verify meal distribution structure for MealContext integration
      expect(result.mealDistribution).toHaveLength(5);
      result.mealDistribution.forEach(meal => {
        expect(meal).toHaveProperty('name');
        expect(meal).toHaveProperty('macroTargets');
        expect(meal.macroTargets).toHaveProperty('protein');
        expect(meal.macroTargets).toHaveProperty('carbs');
        expect(meal.macroTargets).toHaveProperty('fat');
        expect(meal.macroTargets).toHaveProperty('calories');
        expect(meal.macroTargets).toHaveProperty('fiber');
      });

      // Verify daily targets structure for compatibility
      expect(result.dailyTargets).toHaveProperty('protein');
      expect(result.dailyTargets).toHaveProperty('carbs');
      expect(result.dailyTargets).toHaveProperty('fat');
      expect(result.dailyTargets).toHaveProperty('calories');
      expect(result.dailyTargets).toHaveProperty('micronutrients');

      // Verify calculations are reasonable
      expect(result.calculations.bmr).toBeGreaterThan(1500);
      expect(result.calculations.tdee).toBeGreaterThan(result.calculations.bmr);
      expect(result.calculations.targetCalories).toBeLessThan(result.calculations.tdee); // Cutting
    });

    test('should handle different meal counts correctly', () => {
      const profiles = [
        { mealsPerDay: 3, expectedMeals: ['Breakfast', 'Lunch', 'Dinner'] },
        { mealsPerDay: 4, expectedMeals: ['Breakfast', 'Lunch', 'Post-Workout', 'Dinner'] },
        { mealsPerDay: 5, expectedMeals: ['Breakfast', 'Mid-Morning', 'Lunch', 'Post-Workout', 'Dinner'] },
        { mealsPerDay: 6, expectedMeals: ['Breakfast', 'Mid-Morning', 'Lunch', 'Post-Workout', 'Dinner', 'Evening'] }
      ];

      profiles.forEach(({ mealsPerDay, expectedMeals }) => {
        const testProfile = {
          age: 25, gender: 'female', weight: 60, height: 165,
          activityLevel: 'moderate', goal: 'maintenance', mealsPerDay
        };

        const result = MacroCalculationService.calculatePersonalizedNutrition(testProfile);
        
        expect(result.mealDistribution).toHaveLength(mealsPerDay);
        expect(result.mealDistribution.map(m => m.name)).toEqual(expectedMeals);

        // Verify macro distribution sums to daily totals (approximately)
        const totalProtein = result.mealDistribution.reduce((sum, meal) => sum + meal.macroTargets.protein, 0);
        const totalCarbs = result.mealDistribution.reduce((sum, meal) => sum + meal.macroTargets.carbs, 0);
        const totalFat = result.mealDistribution.reduce((sum, meal) => sum + meal.macroTargets.fat, 0);

        expect(Math.abs(totalProtein - result.dailyTargets.protein)).toBeLessThan(5);
        expect(Math.abs(totalCarbs - result.dailyTargets.carbs)).toBeLessThan(5);
        expect(Math.abs(totalFat - result.dailyTargets.fat)).toBeLessThan(5);
      });
    });

    test('should generate different targets for different goals', () => {
      const baseProfile = {
        age: 30, gender: 'male', weight: 75, height: 180,
        activityLevel: 'moderate', mealsPerDay: 4
      };

      const cuttingResult = MacroCalculationService.calculatePersonalizedNutrition({
        ...baseProfile, goal: 'cutting'
      });
      
      const bulkingResult = MacroCalculationService.calculatePersonalizedNutrition({
        ...baseProfile, goal: 'bulking'
      });
      
      const maintenanceResult = MacroCalculationService.calculatePersonalizedNutrition({
        ...baseProfile, goal: 'maintenance'
      });

      // Cutting should have fewer calories than maintenance
      expect(cuttingResult.dailyTargets.calories).toBeLessThan(maintenanceResult.dailyTargets.calories);
      
      // Bulking should have more calories than maintenance
      expect(bulkingResult.dailyTargets.calories).toBeGreaterThan(maintenanceResult.dailyTargets.calories);
      
      // Cutting should have higher protein percentage
      const cuttingProteinPercent = (cuttingResult.dailyTargets.protein * 4) / cuttingResult.dailyTargets.calories;
      const bulkingProteinPercent = (bulkingResult.dailyTargets.protein * 4) / bulkingResult.dailyTargets.calories;
      expect(cuttingProteinPercent).toBeGreaterThan(bulkingProteinPercent);
    });
  });

  describe('Data Validation for Context Integration', () => {
    test('should validate profile completeness correctly', () => {
      const incompleteProfile = {
        age: 25,
        gender: 'male',
        // Missing weight, height, activityLevel, goal
      };

      const errors = MacroCalculationService.validateUserProfile(incompleteProfile);
      expect(errors.length).toBeGreaterThan(0);

      const completeProfile = {
        age: 25,
        gender: 'male',
        weight: 75,
        height: 180,
        activityLevel: 'moderate',
        goal: 'maintenance',
        mealsPerDay: 4
      };

      const noErrors = MacroCalculationService.validateUserProfile(completeProfile);
      expect(noErrors.length).toBe(0);
    });

    test('should handle missing optional fields gracefully', () => {
      const profileWithoutBodyFat = {
        age: 25, gender: 'female', weight: 60, height: 165,
        activityLevel: 'light', goal: 'cutting', mealsPerDay: 3
        // bodyFat is optional
      };

      const result = MacroCalculationService.calculatePersonalizedNutrition(profileWithoutBodyFat);
      expect(result.calculations.bmr).toBeGreaterThan(0);
      expect(result.mealDistribution).toHaveLength(3);
    });
  });

  describe('MealContext Integration Compatibility', () => {
    test('should generate meal structure compatible with MealContext', () => {
      const testProfile = {
        age: 25, gender: 'male', weight: 75, height: 180,
        activityLevel: 'moderate', goal: 'bulking', mealsPerDay: 4
      };

      const result = MacroCalculationService.calculatePersonalizedNutrition(testProfile);

      // Test that meal distribution can be converted to MealContext format
      const mealContextFormat = result.mealDistribution.map((meal, index) => ({
        id: (index + 1).toString(),
        name: meal.name,
        macroTargets: {
          protein: meal.macroTargets.protein,
          carbs: meal.macroTargets.carbs,
          minFiber: meal.macroTargets.minFiber || Math.round(meal.macroTargets.fiber * 0.8),
          maxSugar: meal.macroTargets.maxSugar || Math.round(meal.macroTargets.carbs * 0.3),
          fat: meal.macroTargets.fat
        },
        userCustom: false,
        personalizedGenerated: true,
        createdAt: expect.any(String)
      }));

      // Verify the structure matches what MealContext expects
      mealContextFormat.forEach(meal => {
        expect(meal).toHaveProperty('id');
        expect(meal).toHaveProperty('name');
        expect(meal).toHaveProperty('macroTargets');
        expect(meal).toHaveProperty('userCustom');
        expect(meal.macroTargets).toHaveProperty('protein');
        expect(meal.macroTargets).toHaveProperty('carbs');
        expect(meal.macroTargets).toHaveProperty('fat');
        expect(meal.macroTargets).toHaveProperty('minFiber');
        expect(meal.macroTargets).toHaveProperty('maxSugar');
      });
    });
  });
});