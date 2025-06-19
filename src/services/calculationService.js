export class CalculationService {
  static calculateMacrosForPortion(food, portionGrams) {
    const multiplier = portionGrams / 100;
    return {
      calories: Math.round(food.nutritionPer100g.calories * multiplier * 10) / 10,
      protein: Math.round(food.nutritionPer100g.protein * multiplier * 10) / 10,
      carbs: Math.round(food.nutritionPer100g.carbs * multiplier * 10) / 10,
      fiber: Math.round(food.nutritionPer100g.fiber * multiplier * 10) / 10,
      sugar: Math.round(food.nutritionPer100g.sugar * multiplier * 10) / 10,
      fat: Math.round(food.nutritionPer100g.fat * multiplier * 10) / 10
    };
  }

  static calculateTotalMacros(selectedFoods, foods) {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 0
    };

    selectedFoods.forEach(selection => {
      const food = foods.find(f => f.id === selection.foodId);
      if (food) {
        const macros = this.calculateMacrosForPortion(food, selection.portionGrams);
        totals.calories += macros.calories;
        totals.protein += macros.protein;
        totals.carbs += macros.carbs;
        totals.fiber += macros.fiber;
        totals.sugar += macros.sugar;
        totals.fat += macros.fat;
      }
    });

    return {
      calories: Math.round(totals.calories * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10
    };
  }

  static optimizePortions(selectedFoods, foods, macroTargets, adjustedFoodId, newPortion) {
    const adjustedFood = foods.find(f => f.id === adjustedFoodId);
    if (!adjustedFood) return selectedFoods;

    const updatedSelections = selectedFoods.map(selection => 
      selection.foodId === adjustedFoodId 
        ? { ...selection, portionGrams: newPortion }
        : selection
    );

    const adjustedMacros = this.calculateMacrosForPortion(adjustedFood, newPortion);
    
    const remainingTargets = {
      protein: Math.max(0, macroTargets.protein - adjustedMacros.protein),
      carbs: Math.max(0, macroTargets.carbs - adjustedMacros.carbs),
      fat: Math.max(0, macroTargets.fat - adjustedMacros.fat)
    };

    const otherSelections = updatedSelections.filter(s => s.foodId !== adjustedFoodId);
    
    if (otherSelections.length === 0) {
      return updatedSelections;
    }

    const optimizedOthers = this.redistributePortions(otherSelections, foods, remainingTargets);
    
    // Maintain original order by merging back in the same positions
    return updatedSelections.map(selection => {
      if (selection.foodId === adjustedFoodId) {
        return { foodId: adjustedFoodId, portionGrams: newPortion };
      } else {
        const optimizedVersion = optimizedOthers.find(opt => opt.foodId === selection.foodId);
        return optimizedVersion || selection;
      }
    });
  }

  static redistributePortions(selections, foods, targets) {
    const maxIterations = 10;
    let currentSelections = [...selections];
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const currentMacros = this.calculateTotalMacros(currentSelections, foods);
      
      const errors = {
        protein: targets.protein - currentMacros.protein,
        carbs: targets.carbs - currentMacros.carbs,
        fat: targets.fat - currentMacros.fat
      };

      const totalError = Math.abs(errors.protein) + Math.abs(errors.carbs) + Math.abs(errors.fat);
      
      if (totalError < 1) break;

      currentSelections = currentSelections.map(selection => {
        const food = foods.find(f => f.id === selection.foodId);
        if (!food) return selection;

        const currentPortion = selection.portionGrams;
        const step = 5;
        let bestPortion = currentPortion;
        let bestScore = this.calculateOptimizationScore(selection, food, foods, currentSelections, targets);

        for (let testPortion = Math.max(10, currentPortion - 20); testPortion <= currentPortion + 20; testPortion += step) {
          const testSelection = { ...selection, portionGrams: testPortion };
          const testSelections = currentSelections.map(s => 
            s.foodId === selection.foodId ? testSelection : s
          );
          
          const score = this.calculateOptimizationScore(testSelection, food, foods, testSelections, targets);
          
          if (score < bestScore) {
            bestScore = score;
            bestPortion = testPortion;
          }
        }

        return { ...selection, portionGrams: bestPortion };
      });
    }

    return currentSelections;
  }

  static calculateOptimizationScore(selection, food, foods, allSelections, targets) {
    const totalMacros = this.calculateTotalMacros(allSelections, foods);
    
    const proteinError = Math.abs(targets.protein - totalMacros.protein);
    const carbsError = Math.abs(targets.carbs - totalMacros.carbs);
    const fatError = Math.abs(targets.fat - totalMacros.fat);
    
    return proteinError + carbsError + fatError;
  }

  static calculateMacroProgress(currentMacros, targets) {
    const progress = {
      protein: this.calculateProgress(currentMacros.protein, targets.protein),
      carbs: this.calculateProgress(currentMacros.carbs, targets.carbs),
      fat: this.calculateProgress(currentMacros.fat, targets.fat),
      fiber: this.calculateFiberProgress(currentMacros.fiber, targets.minFiber),
      sugar: this.calculateSugarProgress(currentMacros.sugar, targets.maxSugar)
    };

    return progress;
  }

  static calculateProgress(current, target) {
    if (target === 0) return { percentage: 100, status: 'met' };
    
    const percentage = Math.min(100, (current / target) * 100);
    let status = 'under';
    
    if (percentage >= 95 && percentage <= 105) {
      status = 'met';
    } else if (percentage > 105) {
      status = 'over';
    }

    return { percentage: Math.round(percentage), status };
  }

  static calculateFiberProgress(current, minTarget) {
    if (minTarget === 0) return { percentage: 100, status: 'met' };
    
    const percentage = Math.min(100, (current / minTarget) * 100);
    const status = percentage >= 100 ? 'met' : 'under';

    return { percentage: Math.round(percentage), status };
  }

  static calculateSugarProgress(current, maxTarget) {
    if (maxTarget === 0) return { percentage: 0, status: 'met' };
    
    const percentage = (current / maxTarget) * 100;
    const status = percentage <= 100 ? 'met' : 'over';

    return { percentage: Math.round(percentage), status };
  }

  static generateInitialPortions(selectedFoodIds, foods, macroTargets) {
    const selections = selectedFoodIds.map(foodId => ({
      foodId,
      portionGrams: 100
    }));

    return this.redistributePortions(selections, foods, macroTargets);
  }

  static validateMacroTargets(targets) {
    const errors = [];
    
    if (!targets.protein || targets.protein <= 0) {
      errors.push('Protein target must be greater than 0');
    }
    
    if (!targets.carbs || targets.carbs <= 0) {
      errors.push('Carbs target must be greater than 0');
    }
    
    if (!targets.fat || targets.fat <= 0) {
      errors.push('Fat target must be greater than 0');
    }
    
    if (targets.minFiber < 0) {
      errors.push('Minimum fiber cannot be negative');
    }
    
    if (targets.maxSugar < 0) {
      errors.push('Maximum sugar cannot be negative');
    }

    return errors;
  }
}