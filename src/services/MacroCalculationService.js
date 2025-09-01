/**
 * MacroCalculationService - Personalized Macro/Micronutrient Calculator
 * 
 * Based on latest scientific research (2024) for accurate individualized calculations
 * Uses Mifflin-St Jeor, Katch-McArdle equations with goal-specific adjustments
 */

export class MacroCalculationService {
  
  /**
   * Calculate personalized macros and micronutrients
   * @param {Object} userProfile - User's physical and goal data
   * @returns {Object} Complete macro/micro targets
   */
  static calculatePersonalizedNutrition(userProfile) {
    const {
      age,
      gender, // 'male' | 'female'
      weight, // kg
      height, // cm
      bodyFat, // percentage (optional)
      activityLevel, // 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active'
      goal, // 'cutting' | 'bulking' | 'maintenance'
      mealsPerDay // 3, 4, 5, or 6
    } = userProfile;

    // Step 1: Calculate BMR using best available method
    const bmr = this.calculateBMR(weight, height, age, gender, bodyFat);
    
    // Step 2: Calculate TDEE with activity multiplier
    const tdee = this.calculateTDEE(bmr, activityLevel);
    
    // Step 3: Adjust calories for goal
    const targetCalories = this.adjustCaloriesForGoal(tdee, goal);
    
    // Step 4: Calculate macro distribution
    const macros = this.calculateMacroDistribution(targetCalories, weight, goal);
    
    // Step 5: Distribute macros across meals
    const mealDistribution = this.distributeMacrosAcrossMeals(macros, mealsPerDay);
    
    // Step 6: Calculate micronutrient needs
    const micronutrients = this.calculateMicronutrientNeeds(age, gender, weight, activityLevel);
    
    return {
      userProfile,
      calculations: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories)
      },
      dailyTargets: {
        ...macros,
        micronutrients
      },
      mealDistribution,
      recommendations: this.generateRecommendations(userProfile, macros)
    };
  }

  /**
   * Calculate BMR using most appropriate equation
   */
  static calculateBMR(weight, height, age, gender, bodyFat = null) {
    // Use Katch-McArdle if body fat is known (more accurate)
    if (bodyFat && bodyFat > 0 && bodyFat < 50) {
      const leanBodyMass = weight * (1 - bodyFat / 100);
      return 370 + (21.6 * leanBodyMass);
    }
    
    // Otherwise use Mifflin-St Jeor (most accurate for general population)
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
  }

  /**
   * Calculate TDEE with activity multipliers
   */
  static calculateTDEE(bmr, activityLevel) {
    const multipliers = {
      sedentary: 1.2,      // Little/no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      very_active: 1.725,  // Hard exercise 6-7 days/week
      extremely_active: 1.9 // Physical job + exercise or 2x/day training
    };
    
    return bmr * (multipliers[activityLevel] || 1.55);
  }

  /**
   * Adjust calories based on goal
   */
  static adjustCaloriesForGoal(tdee, goal) {
    switch (goal) {
      case 'cutting':
        return tdee * 0.85; // 15% deficit (conservative)
      case 'aggressive_cutting':
        return tdee * 0.75; // 25% deficit (aggressive)
      case 'bulking':
        return tdee * 1.15; // 15% surplus (lean bulking)
      case 'aggressive_bulking':
        return tdee * 1.25; // 25% surplus (faster gains)
      case 'maintenance':
      default:
        return tdee;
    }
  }

  /**
   * Calculate macro distribution based on goal and research
   */
  static calculateMacroDistribution(targetCalories, weight, goal) {
    let proteinGPerKg, proteinPercent, carbPercent, fatPercent;

    switch (goal) {
      case 'cutting':
      case 'aggressive_cutting':
        // Higher protein for muscle preservation in deficit
        proteinGPerKg = 2.2; // g/kg bodyweight
        proteinPercent = 35;
        carbPercent = 30;
        fatPercent = 35;
        break;
        
      case 'bulking':
      case 'aggressive_bulking':
        // Moderate protein, higher carbs for energy/growth
        proteinGPerKg = 1.8;
        proteinPercent = 25;
        carbPercent = 45;
        fatPercent = 30;
        break;
        
      case 'maintenance':
      default:
        // Balanced approach
        proteinGPerKg = 1.8;
        proteinPercent = 30;
        carbPercent = 40;
        fatPercent = 30;
        break;
    }

    // Calculate protein from bodyweight (more accurate)
    const proteinGrams = weight * proteinGPerKg;
    const proteinCalories = proteinGrams * 4;
    
    // Calculate remaining calories for carbs and fats
    const remainingCalories = targetCalories - proteinCalories;
    const carbCalories = remainingCalories * (carbPercent / (carbPercent + fatPercent));
    const fatCalories = remainingCalories * (fatPercent / (carbPercent + fatPercent));
    
    return {
      calories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbCalories / 4),
      fat: Math.round(fatCalories / 9),
      // Sub-macros (estimated based on quality guidelines)
      fiber: Math.round(Math.max(25, targetCalories / 1000 * 14)), // 14g per 1000 kcal
      sugar: Math.round(Math.min(50, carbCalories / 4 * 0.3)), // Max 30% of carbs
      saturatedFat: Math.round((fatCalories / 9) * 0.3), // Max 30% of total fat
      sodium: 2300, // mg - standard recommendation
    };
  }

  /**
   * Distribute daily macros across meals optimally
   */
  static distributeMacrosAcrossMeals(dailyMacros, mealsPerDay) {
    // Optimal protein per meal: 0.4-0.55g/kg bodyweight
    // For simplicity, distribute evenly with slight emphasis on post-workout meal
    
    const baseMealMacros = {
      calories: Math.round(dailyMacros.calories / mealsPerDay),
      protein: Math.round(dailyMacros.protein / mealsPerDay),
      carbs: Math.round(dailyMacros.carbs / mealsPerDay),
      fat: Math.round(dailyMacros.fat / mealsPerDay),
      fiber: Math.round(dailyMacros.fiber / mealsPerDay),
      minFiber: Math.round(dailyMacros.fiber / mealsPerDay * 0.8),
      maxSugar: Math.round(dailyMacros.sugar / mealsPerDay * 1.5), // Allow flexibility
    };

    // Generate meal targets (can be customized per meal type later)
    const mealNames = this.generateMealNames(mealsPerDay);
    const meals = mealNames.map(name => ({
      name,
      macroTargets: { ...baseMealMacros }
    }));

    return meals;
  }

  /**
   * Generate appropriate meal names based on meal count
   */
  static generateMealNames(mealsPerDay) {
    const mealOptions = {
      3: ['Breakfast', 'Lunch', 'Dinner'],
      4: ['Breakfast', 'Lunch', 'Post-Workout', 'Dinner'],
      5: ['Breakfast', 'Mid-Morning', 'Lunch', 'Post-Workout', 'Dinner'],
      6: ['Breakfast', 'Mid-Morning', 'Lunch', 'Post-Workout', 'Dinner', 'Evening']
    };
    
    return mealOptions[mealsPerDay] || mealOptions[4];
  }

  /**
   * Calculate micronutrient needs with athlete adjustments
   */
  static calculateMicronutrientNeeds(age, gender, weight, activityLevel) {
    // Base RDA values (adult averages)
    const baseRDA = {
      vitaminD: gender === 'male' ? 15 : 15, // mcg
      iron: gender === 'male' ? 8 : 18, // mg (higher for females)
      calcium: 1000, // mg
      magnesium: gender === 'male' ? 400 : 310, // mg
      zinc: gender === 'male' ? 11 : 8, // mg
      vitaminB6: 1.3, // mg
      vitaminB12: 2.4, // mcg
      folate: 400, // mcg
      vitaminC: gender === 'male' ? 90 : 75, // mg
      sodium: 2300, // mg (upper limit)
      potassium: 3500, // mg
    };

    // Athlete multiplier for active individuals
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      very_active: 1.3,
      extremely_active: 1.4
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;

    // Apply multipliers to key nutrients (not sodium - it's an upper limit)
    const adjustedRDA = {};
    Object.keys(baseRDA).forEach(nutrient => {
      if (nutrient === 'sodium') {
        adjustedRDA[nutrient] = baseRDA[nutrient]; // Keep sodium as upper limit
      } else {
        adjustedRDA[nutrient] = Math.round(baseRDA[nutrient] * multiplier);
      }
    });

    return adjustedRDA;
  }

  /**
   * Generate personalized recommendations
   */
  static generateRecommendations(userProfile, macros) {
    const { goal, bodyFat, activityLevel } = userProfile;
    const recommendations = [];

    // Goal-specific advice
    if (goal === 'cutting') {
      recommendations.push("Focus on high-protein foods to preserve muscle mass during deficit");
      recommendations.push("Include fibrous vegetables to maintain satiety with fewer calories");
      if (bodyFat && bodyFat < 15) {
        recommendations.push("Consider diet breaks every 4-6 weeks to support hormonal balance");
      }
    } else if (goal.includes('bulking')) {
      recommendations.push("Prioritize post-workout carbs for optimal recovery and growth");
      recommendations.push("Include healthy fats like nuts, avocados, and olive oil for calories");
    }

    // Activity-specific advice
    if (['very_active', 'extremely_active'].includes(activityLevel)) {
      recommendations.push("Consider higher meal frequency (5-6 meals) for better nutrient timing");
      recommendations.push("Focus on nutrient timing around workouts for optimal performance");
    }

    // General advice
    recommendations.push("Drink at least 35ml water per kg bodyweight daily");
    recommendations.push("Include a variety of colorful fruits and vegetables for micronutrients");

    return recommendations;
  }

  /**
   * Validate user input
   */
  static validateUserProfile(userProfile) {
    const errors = [];
    const { age, weight, height, gender, activityLevel, goal, mealsPerDay } = userProfile;

    if (!age || age < 18 || age > 80) errors.push("Age must be between 18-80 years");
    if (!weight || weight < 40 || weight > 200) errors.push("Weight must be between 40-200 kg");
    if (!height || height < 140 || height > 220) errors.push("Height must be between 140-220 cm");
    if (!['male', 'female'].includes(gender)) errors.push("Gender must be male or female");
    if (!['sedentary', 'light', 'moderate', 'very_active', 'extremely_active'].includes(activityLevel)) {
      errors.push("Invalid activity level");
    }
    if (!['cutting', 'bulking', 'maintenance', 'aggressive_cutting', 'aggressive_bulking'].includes(goal)) {
      errors.push("Invalid goal");
    }
    if (!mealsPerDay || ![3, 4, 5, 6].includes(mealsPerDay)) {
      errors.push("Meals per day must be 3, 4, 5, or 6");
    }

    return errors;
  }
}

export default MacroCalculationService;