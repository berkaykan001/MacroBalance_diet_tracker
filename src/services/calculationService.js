export class CalculationService {
  static calculateMacrosForPortion(food, portionGrams) {
    const multiplier = portionGrams / 100;
    const nutrition = food.nutritionPer100g;
    
    return {
      calories: Math.round(nutrition.calories * multiplier * 10) / 10,
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
      fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
      sugar: Math.round(nutrition.sugar * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      // Sub-macros (only if they exist in the food data)
      naturalSugars: nutrition.naturalSugars ? Math.round(nutrition.naturalSugars * multiplier * 10) / 10 : 0,
      addedSugars: nutrition.addedSugars ? Math.round(nutrition.addedSugars * multiplier * 10) / 10 : 0,
      saturatedFat: nutrition.saturatedFat ? Math.round(nutrition.saturatedFat * multiplier * 10) / 10 : 0,
      monounsaturatedFat: nutrition.monounsaturatedFat ? Math.round(nutrition.monounsaturatedFat * multiplier * 10) / 10 : 0,
      polyunsaturatedFat: nutrition.polyunsaturatedFat ? Math.round(nutrition.polyunsaturatedFat * multiplier * 10) / 10 : 0,
      transFat: nutrition.transFat ? Math.round(nutrition.transFat * multiplier * 10) / 10 : 0,
      omega3: nutrition.omega3 ? Math.round(nutrition.omega3 * multiplier * 10) / 10 : 0
    };
  }

  static calculateTotalMacros(selectedFoods, foods) {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 0,
      // Sub-macros
      naturalSugars: 0,
      addedSugars: 0,
      saturatedFat: 0,
      monounsaturatedFat: 0,
      polyunsaturatedFat: 0,
      transFat: 0,
      omega3: 0
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
        // Sub-macros
        totals.naturalSugars += macros.naturalSugars || 0;
        totals.addedSugars += macros.addedSugars || 0;
        totals.saturatedFat += macros.saturatedFat || 0;
        totals.monounsaturatedFat += macros.monounsaturatedFat || 0;
        totals.polyunsaturatedFat += macros.polyunsaturatedFat || 0;
        totals.transFat += macros.transFat || 0;
        totals.omega3 += macros.omega3 || 0;
      }
    });

    return {
      calories: Math.round(totals.calories * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      // Sub-macros
      naturalSugars: Math.round(totals.naturalSugars * 10) / 10,
      addedSugars: Math.round(totals.addedSugars * 10) / 10,
      saturatedFat: Math.round(totals.saturatedFat * 10) / 10,
      monounsaturatedFat: Math.round(totals.monounsaturatedFat * 10) / 10,
      polyunsaturatedFat: Math.round(totals.polyunsaturatedFat * 10) / 10,
      transFat: Math.round(totals.transFat * 10) / 10,
      omega3: Math.round(totals.omega3 * 10) / 10
    };
  }

  static optimizePortions(selectedFoods, foods, macroTargets, adjustedFoodId, newPortion, lockedFoodIds = []) {
    const adjustedFood = foods.find(f => f.id === adjustedFoodId);
    if (!adjustedFood) return selectedFoods;

    const updatedSelections = selectedFoods.map(selection => 
      selection.foodId === adjustedFoodId 
        ? { ...selection, portionGrams: newPortion }
        : selection
    );

    // Calculate macros from all locked foods (including the adjusted one if it's locked)
    const lockedSelections = updatedSelections.filter(s => 
      lockedFoodIds.includes(s.foodId) || s.foodId === adjustedFoodId
    );
    
    const lockedMacros = this.calculateTotalMacros(lockedSelections, foods);
    
    const remainingTargets = {
      protein: Math.max(0, macroTargets.protein - lockedMacros.protein),
      carbs: Math.max(0, macroTargets.carbs - lockedMacros.carbs),
      fat: Math.max(0, macroTargets.fat - lockedMacros.fat)
    };

    // Only optimize unlocked foods (excluding the adjusted food and all locked foods)
    const unlockedSelections = updatedSelections.filter(s => 
      s.foodId !== adjustedFoodId && !lockedFoodIds.includes(s.foodId)
    );
    
    if (unlockedSelections.length === 0) {
      return updatedSelections;
    }

    const optimizedUnlocked = this.redistributePortions(unlockedSelections, foods, remainingTargets);
    
    // Maintain original order by merging back optimized unlocked foods
    return updatedSelections.map(selection => {
      if (selection.foodId === adjustedFoodId || lockedFoodIds.includes(selection.foodId)) {
        // Keep adjusted food and locked foods as-is
        return selection;
      } else {
        // Use optimized version for unlocked foods
        const optimizedVersion = optimizedUnlocked.find(opt => opt.foodId === selection.foodId);
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
    
    const baseScore = proteinError + carbsError + fatError;
    
    // Add gentle health bonuses to encourage healthier sub-macros
    let healthBonus = 0;
    
    // Bonus for high monounsaturated fats (like olive oil)
    if (totalMacros.monounsaturatedFat > 0) {
      healthBonus -= totalMacros.monounsaturatedFat * 0.1;
    }
    
    // Bonus for omega-3 fatty acids
    if (totalMacros.omega3 > 0) {
      healthBonus -= totalMacros.omega3 * 0.2;
    }
    
    // Bonus for high fiber
    if (totalMacros.fiber > 0) {
      healthBonus -= totalMacros.fiber * 0.1;
    }
    
    // Small penalty for trans fats
    if (totalMacros.transFat > 0) {
      healthBonus += totalMacros.transFat * 0.5;
    }
    
    // Small penalty for high added sugars
    if (totalMacros.addedSugars > 0) {
      healthBonus += totalMacros.addedSugars * 0.05;
    }
    
    return baseScore + healthBonus;
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