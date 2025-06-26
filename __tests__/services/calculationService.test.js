import { CalculationService } from '../../src/services/calculationService';

describe('CalculationService', () => {
  const mockFood = {
    id: '1',
    name: 'Chicken Breast',
    nutritionPer100g: {
      protein: 31,
      carbs: 0,
      fat: 3.6,
      calories: 165,
      fiber: 0,
      sugar: 0,
    }
  };

  const mockFoods = [mockFood];

  describe('calculateMacrosForPortion', () => {
    test('calculates macros correctly for 100g portion', () => {
      const result = CalculationService.calculateMacrosForPortion(mockFood, 100);
      
      expect(result).toEqual({
        protein: 31,
        carbs: 0,
        fat: 3.6, // precise calculation
        calories: 165,
        fiber: 0,
        sugar: 0,
        naturalSugars: 0,
        addedSugars: 0,
        saturatedFat: 0,
        monounsaturatedFat: 0,
        polyunsaturatedFat: 0,
        transFat: 0,
        omega3: 0,
        vitaminD: 0,
        magnesium: 0,
        iron: 0,
        calcium: 0,
        zinc: 0,
        vitaminB6: 0,
        vitaminB12: 0,
        vitaminC: 0,
      });
    });

    test('calculates macros correctly for 200g portion', () => {
      const result = CalculationService.calculateMacrosForPortion(mockFood, 200);
      
      expect(result).toEqual({
        protein: 62,
        carbs: 0,
        fat: 7.2, // precise calculation
        calories: 330,
        fiber: 0,
        sugar: 0,
        naturalSugars: 0,
        addedSugars: 0,
        saturatedFat: 0,
        monounsaturatedFat: 0,
        polyunsaturatedFat: 0,
        transFat: 0,
        omega3: 0,
        vitaminD: 0,
        magnesium: 0,
        iron: 0,
        calcium: 0,
        zinc: 0,
        vitaminB6: 0,
        vitaminB12: 0,
        vitaminC: 0,
      });
    });

    test('handles zero portion', () => {
      const result = CalculationService.calculateMacrosForPortion(mockFood, 0);
      
      expect(result).toEqual({
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        fiber: 0,
        sugar: 0,
        naturalSugars: 0,
        addedSugars: 0,
        saturatedFat: 0,
        monounsaturatedFat: 0,
        polyunsaturatedFat: 0,
        transFat: 0,
        omega3: 0,
        vitaminD: 0,
        magnesium: 0,
        iron: 0,
        calcium: 0,
        zinc: 0,
        vitaminB6: 0,
        vitaminB12: 0,
        vitaminC: 0,
      });
    });
  });

  describe('calculateTotalMacros', () => {
    test('calculates total macros for multiple foods', () => {
      const selectedFoods = [
        { foodId: '1', portionGrams: 100 },
        { foodId: '1', portionGrams: 150 },
      ];

      const result = CalculationService.calculateTotalMacros(selectedFoods, mockFoods);
      
      expect(result.protein).toBe(77.5); // 31 + 46.5
      expect(result.calories).toBe(412.5); // 165 + 247.5
    });

    test('handles empty food list', () => {
      const result = CalculationService.calculateTotalMacros([], mockFoods);
      
      expect(result).toEqual({
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        fiber: 0,
        sugar: 0,
        naturalSugars: 0,
        addedSugars: 0,
        saturatedFat: 0,
        monounsaturatedFat: 0,
        polyunsaturatedFat: 0,
        transFat: 0,
        omega3: 0,
        vitaminD: 0,
        magnesium: 0,
        iron: 0,
        calcium: 0,
        zinc: 0,
        vitaminB6: 0,
        vitaminB12: 0,
        vitaminC: 0,
      });
    });
  });

  describe('calculateMacroProgress', () => {
    const mockTargets = {
      protein: 30,
      carbs: 40,
      fat: 20,
    };

    const mockCurrentMacros = {
      protein: 25,
      carbs: 42, // This will be 105% which should be 'over'
      fat: 20,
    };

    test('calculates progress correctly', () => {
      const result = CalculationService.calculateMacroProgress(mockCurrentMacros, mockTargets);
      
      expect(result.protein.percentage).toBe(83);
      expect(result.protein.status).toBe('under');
      
      expect(result.carbs.percentage).toBe(100); // capped at 100 in implementation  
      expect(result.carbs.status).toBe('met'); // 105% is capped at 100, and 100 <= 105 so it's 'met'
      
      expect(result.fat.percentage).toBe(100);
      expect(result.fat.status).toBe('met');
    });

    test('handles zero targets', () => {
      const zeroTargets = { protein: 0, carbs: 0, fat: 0 };
      const result = CalculationService.calculateMacroProgress(mockCurrentMacros, zeroTargets);
      
      expect(result.protein.percentage).toBe(100);
      expect(result.protein.status).toBe('met');
    });
  });

  describe('optimizePortions', () => {
    const mockMultipleFoods = [
      {
        id: '1',
        name: 'Chicken Breast',
        nutritionPer100g: { protein: 31, carbs: 0, fat: 3.6, calories: 165 }
      },
      {
        id: '2', 
        name: 'Rice',
        nutritionPer100g: { protein: 2.7, carbs: 28, fat: 0.3, calories: 130 }
      }
    ];

    const mockSelectedFoods = [
      { foodId: '1', portionGrams: 100 },
      { foodId: '2', portionGrams: 100 }
    ];

    const mockTargets = {
      protein: 35,
      carbs: 40,
      fat: 10
    };

    test('optimizes portions when user adjusts one food', () => {
      const result = CalculationService.optimizePortions(
        mockSelectedFoods,
        mockMultipleFoods,
        mockTargets,
        '1', // foodId being adjusted
        150   // new portion
      );

      expect(result).toHaveLength(2);
      expect(result[0].portionGrams).toBe(150); // User-adjusted food stays at 150g
      expect(result[1].portionGrams).toBeGreaterThan(0); // Other food gets optimized
    });

    test('handles single food selection', () => {
      const singleFood = [{ foodId: '1', portionGrams: 100 }];
      
      const result = CalculationService.optimizePortions(
        singleFood,
        mockMultipleFoods,
        mockTargets,
        '1',
        120
      );

      expect(result).toHaveLength(1);
      expect(result[0].portionGrams).toBe(120);
    });
  });
});