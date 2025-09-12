import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './SettingsContext';
import TimeService from '../services/TimeService';

const MealContext = createContext();

const ACTIONS = {
  LOAD_MEALS: 'LOAD_MEALS',
  ADD_MEAL: 'ADD_MEAL',
  UPDATE_MEAL: 'UPDATE_MEAL',
  DELETE_MEAL: 'DELETE_MEAL',
  CREATE_MEAL_PLAN: 'CREATE_MEAL_PLAN',
  UPDATE_MEAL_PLAN: 'UPDATE_MEAL_PLAN',
  DELETE_MEAL_PLAN: 'DELETE_MEAL_PLAN',
  LOAD_MEAL_PLANS: 'LOAD_MEAL_PLANS',
  LOAD_DAILY_SUMMARIES: 'LOAD_DAILY_SUMMARIES',
  UPDATE_DAILY_SUMMARY: 'UPDATE_DAILY_SUMMARY',
  DELETE_OLD_DATA: 'DELETE_OLD_DATA'
};

const defaultMeals = [
  {
    id: '1',
    name: 'Breakfast',
    macroTargets: {
      protein: 45,
      carbs: 45,
      minFiber: 7,
      maxSugar: 12,
      fat: 15
    },
    userCustom: false,
    createdAt: TimeService.getCurrentDate().toISOString()
  },
  {
    id: '2',
    name: 'Lunch',
    macroTargets: {
      protein: 44,
      carbs: 45,
      minFiber: 8,
      maxSugar: 12,
      fat: 15
    },
    userCustom: false,
    createdAt: TimeService.getCurrentDate().toISOString()
  },
  {
    id: '3',
    name: 'Dinner (Pre-Workout)',
    macroTargets: {
      protein: 43,
      carbs: 66,
      minFiber: 8,
      maxSugar: 15,
      fat: 8
    },
    userCustom: false,
    createdAt: TimeService.getCurrentDate().toISOString()
  },
  {
    id: '4',
    name: 'Late Night Meal',
    macroTargets: {
      protein: 40,
      carbs: 10,
      minFiber: 5,
      maxSugar: 11,
      fat: 12
    },
    userCustom: false,
    createdAt: TimeService.getCurrentDate().toISOString()
  },
  {
    id: '5',
    name: 'Extra',
    macroTargets: {
      protein: 0,
      carbs: 0,
      minFiber: 0,
      maxSugar: 0,
      fat: 0
    },
    userCustom: false,
    createdAt: TimeService.getCurrentDate().toISOString()
  }
];

// Daily sub-macro targets (independent of meals)
const defaultDailySubMacroTargets = {
  // Healthy fats (daily targets)
  omega3: 1.5,            // 1.5g EPA+DHA daily (AI-calculated)
  monounsaturatedFat: 20, // 20g monounsaturated fat daily (AI-calculated)
  polyunsaturatedFat: 15, // 15g polyunsaturated fat daily (AI-calculated)
  maxSaturatedFat: 20,    // Max 20g saturated fat daily (AI-calculated)
  maxTransFat: 0,         // Zero trans fat daily (AI-calculated)
  
  // Sugar targets
  maxAddedSugars: 25,     // Max 25g added sugars daily (AI-calculated)
  maxNaturalSugars: 50,   // Max 50g natural sugars daily (AI-calculated)
  maxSugar: 75,           // Max 75g total sugars daily (AI-calculated)
  minFiber: 30,           // 30g fiber daily (AI-calculated)
  
  // Additional targets
  maxSodium: 2300,        // Max 2300mg sodium daily (AI-calculated)
  minPotassium: 3400      // Min 3400mg potassium daily (AI-calculated)
};

// Daily micronutrient targets (Personalized for 31-year-old male, 70kg)
const defaultDailyMicronutrientTargets = {
  // Minerals (mg)
  iron: 8,               // 8mg daily for adult men (AI-calculated)
  calcium: 1000,         // 1000mg daily (AI-calculated)
  zinc: 11,              // 11mg daily for men (AI-calculated)
  magnesium: 420,        // 420mg daily for men (AI-calculated)
  sodium: 2300,          // Max 2300mg sodium daily (AI-calculated)
  potassium: 3400,       // Min 3400mg potassium daily (AI-calculated)
  
  // Vitamins
  vitaminB6: 1.7,        // 1.7mg daily (AI-calculated)
  vitaminB12: 2.4,       // 2.4μg daily for adults (AI-calculated)
  vitaminC: 100,         // 100mg daily for men (AI-calculated)
  vitaminD: 25,          // 25μg daily (AI-calculated)
};

function mealReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_MEALS:
      return {
        ...state,
        meals: action.payload,
        loading: false
      };
    
    case ACTIONS.ADD_MEAL:
      const newMeal = {
        ...action.payload,
        id: TimeService.now().toString(),
        userCustom: true,
        createdAt: TimeService.getCurrentDate().toISOString()
      };
      return {
        ...state,
        meals: [...state.meals, newMeal]
      };
    
    case ACTIONS.UPDATE_MEAL:
      return {
        ...state,
        meals: state.meals.map(meal => 
          meal.id === action.payload.id ? { ...meal, ...action.payload } : meal
        )
      };
    
    case ACTIONS.DELETE_MEAL:
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload)
      };
    
    case ACTIONS.LOAD_MEAL_PLANS:
      return {
        ...state,
        mealPlans: action.payload
      };
    
    case ACTIONS.CREATE_MEAL_PLAN:
      const now = TimeService.getCurrentDate();
      const newMealPlan = {
        ...action.payload,
        id: TimeService.now().toString(),
        createdAt: now.toISOString(), // Keep timestamp for precision
        isCheatMeal: action.payload.isCheatMeal || false // Default to false if not specified
      };
      
      // DEBUG: Log meal plan creation with date mapping info
      // This helps us understand if dates are being mapped correctly
      const createdDateKey = now.toDateString();
      const myTodayKey = newMealPlan.createdAt ? (() => {
        return TimeService.getTodayString(4); // Use TimeService for consistency
      })() : null;
      
      console.log(`REDUCER CREATE_MEAL_PLAN: Created at ${newMealPlan.createdAt}`);
      console.log(`REDUCER CREATE_MEAL_PLAN: Regular date key = ${createdDateKey}`);
      console.log(`REDUCER CREATE_MEAL_PLAN: Custom date key = ${myTodayKey}`);
      
      return {
        ...state,
        mealPlans: [...state.mealPlans, newMealPlan]
      };
    
    case ACTIONS.UPDATE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.id ? { 
            ...plan, 
            ...action.payload,
            isCheatMeal: action.payload.isCheatMeal !== undefined ? action.payload.isCheatMeal : plan.isCheatMeal
          } : plan
        )
      };
    
    case ACTIONS.DELETE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.filter(plan => plan.id !== action.payload)
      };
    
    case ACTIONS.LOAD_DAILY_SUMMARIES:
      return {
        ...state,
        dailySummaries: action.payload
      };
    
    case ACTIONS.UPDATE_DAILY_SUMMARY:
      return {
        ...state,
        dailySummaries: {
          ...state.dailySummaries,
          [action.payload.date]: action.payload.summary
        }
      };
    
    case ACTIONS.DELETE_OLD_DATA:
      return {
        ...state,
        mealPlans: action.payload.mealPlans,
        dailySummaries: action.payload.dailySummaries
      };
    
    default:
      return state;
  }
}

const initialState = {
  meals: [],
  mealPlans: [],
  dailySummaries: {},
  loading: true
};

export function MealProvider({ children }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);
  const { appPreferences, personalizedTargets, userProfile } = useSettings();

  useEffect(() => {
    loadMeals();
    loadMealPlans();
    loadDailySummaries();
  }, []);

  // Reload meals when personalized targets change
  useEffect(() => {
    if (!state.loading && personalizedTargets) {
      console.log('Personalized targets updated, reloading meals');
      loadMeals();
    }
  }, [personalizedTargets, userProfile?.isProfileComplete]);

  // Update day reset hour in TimeService when settings change
  useEffect(() => {
    const dayResetHour = appPreferences?.dayResetHour || 4;
    TimeService.setDayResetHour(dayResetHour);
  }, [appPreferences?.dayResetHour]);

  useEffect(() => {
    if (!state.loading) {
      saveMeals();
    }
  }, [state.meals, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      saveMealPlans();
    }
  }, [state.mealPlans, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      saveDailySummaries();
    }
  }, [state.dailySummaries, state.loading]);

  // Automatic data lifecycle management
  useEffect(() => {
    const runDataLifecycle = async () => {
      if (!state.loading) {
        try {
          // Get retention days from settings (default 90)
          const retentionDays = 90; // TODO: Get from settings context
          await processDataLifecycle(retentionDays);
        } catch (error) {
          console.error('Automatic data lifecycle failed:', error);
        }
      }
    };

    // Run immediately on load
    runDataLifecycle();

    // Set up daily interval (24 hours)
    const interval = setInterval(runDataLifecycle, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.loading, state.mealPlans.length]);

  // Generate meals from personalized targets
  const generatePersonalizedMeals = () => {
    if (!personalizedTargets || !personalizedTargets.mealDistribution) {
      return defaultMeals;
    }

    const personalizedMeals = personalizedTargets.mealDistribution.map((meal, index) => ({
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
      createdAt: TimeService.getCurrentDate().toISOString()
    }));

    // Always add the Extra meal
    personalizedMeals.push({
      id: (personalizedMeals.length + 1).toString(),
      name: 'Extra',
      macroTargets: {
        protein: 0,
        carbs: 0,
        minFiber: 0,
        maxSugar: 0,
        fat: 0
      },
      userCustom: false,
      personalizedGenerated: false,
      createdAt: TimeService.getCurrentDate().toISOString()
    });

    return personalizedMeals;
  };

  const loadMeals = async () => {
    try {
      // If we have personalized targets and user hasn't completed onboarding or wants to use personalized meals
      const shouldUsePersonalizedMeals = personalizedTargets && 
                                        personalizedTargets.mealDistribution &&
                                        userProfile?.isProfileComplete;

      if (shouldUsePersonalizedMeals) {
        console.log('Loading personalized meals from targets');
        const personalizedMeals = generatePersonalizedMeals();
        dispatch({ type: ACTIONS.LOAD_MEALS, payload: personalizedMeals });
        
        // Save personalized meals to storage
        await AsyncStorage.setItem('meals', JSON.stringify(personalizedMeals));
        return;
      }

      // Otherwise, load from storage or use defaults
      const storedMeals = await AsyncStorage.getItem('meals');
      if (storedMeals) {
        const meals = JSON.parse(storedMeals);
        // Check if stored meals are outdated personalized meals - if so, regenerate
        const hasPersonalizedMeals = meals.some(meal => meal.personalizedGenerated);
        if (hasPersonalizedMeals && shouldUsePersonalizedMeals) {
          console.log('Updating outdated personalized meals');
          const updatedMeals = generatePersonalizedMeals();
          dispatch({ type: ACTIONS.LOAD_MEALS, payload: updatedMeals });
          await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
        } else {
          dispatch({ type: ACTIONS.LOAD_MEALS, payload: meals });
        }
      } else {
        console.log('No stored meals found, using defaults');
        dispatch({ type: ACTIONS.LOAD_MEALS, payload: defaultMeals });
        await AsyncStorage.setItem('meals', JSON.stringify(defaultMeals));
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      dispatch({ type: ACTIONS.LOAD_MEALS, payload: defaultMeals });
    }
  };

  const loadMealPlans = async () => {
    try {
      const storedMealPlans = await AsyncStorage.getItem('mealPlans');
      if (storedMealPlans) {
        const mealPlans = JSON.parse(storedMealPlans);
        console.log('Loaded meal plans:', mealPlans.length, 'plans');
        dispatch({ type: ACTIONS.LOAD_MEAL_PLANS, payload: mealPlans });
      } else {
        console.log('No stored meal plans found');
        dispatch({ type: ACTIONS.LOAD_MEAL_PLANS, payload: [] });
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
      dispatch({ type: ACTIONS.LOAD_MEAL_PLANS, payload: [] });
    }
  };

  const saveMeals = async () => {
    try {
      await AsyncStorage.setItem('meals', JSON.stringify(state.meals));
      console.log('Meals saved successfully:', state.meals.length, 'meals');
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  };

  const saveMealPlans = async () => {
    try {
      await AsyncStorage.setItem('mealPlans', JSON.stringify(state.mealPlans));
    } catch (error) {
      console.error('Error saving meal plans:', error);
    }
  };

  const loadDailySummaries = async () => {
    try {
      const storedSummaries = await AsyncStorage.getItem('dailySummaries');
      if (storedSummaries) {
        const summaries = JSON.parse(storedSummaries);
        console.log('Loaded daily summaries:', Object.keys(summaries).length, 'days');
        dispatch({ type: ACTIONS.LOAD_DAILY_SUMMARIES, payload: summaries });
      } else {
        console.log('No stored daily summaries found');
        dispatch({ type: ACTIONS.LOAD_DAILY_SUMMARIES, payload: {} });
      }
    } catch (error) {
      console.error('Error loading daily summaries:', error);
      dispatch({ type: ACTIONS.LOAD_DAILY_SUMMARIES, payload: {} });
    }
  };

  const saveDailySummaries = async () => {
    try {
      await AsyncStorage.setItem('dailySummaries', JSON.stringify(state.dailySummaries));
    } catch (error) {
      console.error('Error saving daily summaries:', error);
    }
  };

  const addMeal = (meal) => {
    dispatch({ type: ACTIONS.ADD_MEAL, payload: meal });
  };

  const updateMeal = (meal) => {
    dispatch({ type: ACTIONS.UPDATE_MEAL, payload: meal });
  };

  const deleteMeal = (mealId) => {
    dispatch({ type: ACTIONS.DELETE_MEAL, payload: mealId });
  };

  const createMealPlan = (mealPlan) => {
    dispatch({ type: ACTIONS.CREATE_MEAL_PLAN, payload: mealPlan });
  };

  const updateMealPlan = (mealPlan) => {
    dispatch({ type: ACTIONS.UPDATE_MEAL_PLAN, payload: mealPlan });
  };

  const deleteMealPlan = (mealPlanId) => {
    dispatch({ type: ACTIONS.DELETE_MEAL_PLAN, payload: mealPlanId });
  };

  const getMealById = (id) => {
    return state.meals.find(meal => meal.id === id);
  };

  const getMealPlanById = (id) => {
    return state.mealPlans.find(plan => plan.id === id);
  };

  const getMealPlansByMeal = (mealId) => {
    return state.mealPlans.filter(plan => plan.mealId === mealId);
  };

  const getRecentMealPlans = (limit = 5) => {
    return [...state.mealPlans]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const reloadMeals = async () => {
    console.log('Reloading meals...');
    await loadMeals();
    await loadMealPlans();
    await loadDailySummaries();
  };

  const regeneratePersonalizedMeals = async () => {
    console.log('Regenerating personalized meals...');
    if (personalizedTargets && personalizedTargets.mealDistribution) {
      const personalizedMeals = generatePersonalizedMeals();
      dispatch({ type: ACTIONS.LOAD_MEALS, payload: personalizedMeals });
      await AsyncStorage.setItem('meals', JSON.stringify(personalizedMeals));
      console.log('Personalized meals regenerated successfully');
    } else {
      console.warn('Cannot regenerate personalized meals: no personalized targets available');
    }
  };

  const switchToDefaultMeals = async () => {
    console.log('Switching to default meals...');
    dispatch({ type: ACTIONS.LOAD_MEALS, payload: defaultMeals });
    await AsyncStorage.setItem('meals', JSON.stringify(defaultMeals));
    console.log('Switched to default meals successfully');
  };

  // Daily Summary Functions
  const createDailySummary = (mealPlans) => {
    if (!mealPlans || mealPlans.length === 0) {
      return null;
    }

    // Calculate total macros for the day
    const macros = mealPlans.reduce((total, plan) => {
      const effectiveMacros = getEffectiveMacros(plan);
      return {
        protein: total.protein + (effectiveMacros?.protein || 0),
        carbs: total.carbs + (effectiveMacros?.carbs || 0),
        fat: total.fat + (effectiveMacros?.fat || 0),
        calories: total.calories + (effectiveMacros?.calories || 0)
      };
    }, { protein: 0, carbs: 0, fat: 0, calories: 0 });

    // Calculate sub-macros
    const subMacros = mealPlans.reduce((total, plan) => {
      const effectiveMacros = getEffectiveMacros(plan);
      return {
        fiber: total.fiber + (effectiveMacros?.fiber || 0),
        omega3: total.omega3 + (effectiveMacros?.omega3 || 0),
        saturatedFat: total.saturatedFat + (effectiveMacros?.saturatedFat || 0),
        monounsaturatedFat: total.monounsaturatedFat + (effectiveMacros?.monounsaturatedFat || 0),
        polyunsaturatedFat: total.polyunsaturatedFat + (effectiveMacros?.polyunsaturatedFat || 0),
        transFat: total.transFat + (effectiveMacros?.transFat || 0),
        addedSugars: total.addedSugars + (effectiveMacros?.addedSugars || 0),
        naturalSugars: total.naturalSugars + (effectiveMacros?.naturalSugars || 0)
      };
    }, { fiber: 0, omega3: 0, saturatedFat: 0, monounsaturatedFat: 0, polyunsaturatedFat: 0, transFat: 0, addedSugars: 0, naturalSugars: 0 });

    // Calculate micronutrients
    const micronutrients = mealPlans.reduce((total, plan) => {
      const effectiveMacros = getEffectiveMacros(plan);
      return {
        iron: total.iron + (effectiveMacros?.iron || 0),
        calcium: total.calcium + (effectiveMacros?.calcium || 0),
        zinc: total.zinc + (effectiveMacros?.zinc || 0),
        magnesium: total.magnesium + (effectiveMacros?.magnesium || 0),
        sodium: total.sodium + (effectiveMacros?.sodium || 0),
        potassium: total.potassium + (effectiveMacros?.potassium || 0),
        vitaminB6: total.vitaminB6 + (effectiveMacros?.vitaminB6 || 0),
        vitaminB12: total.vitaminB12 + (effectiveMacros?.vitaminB12 || 0),
        vitaminC: total.vitaminC + (effectiveMacros?.vitaminC || 0),
        vitaminD: total.vitaminD + (effectiveMacros?.vitaminD || 0)
      };
    }, { iron: 0, calcium: 0, zinc: 0, magnesium: 0, sodium: 0, potassium: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0, vitaminD: 0 });

    // Calculate targets achieved
    const targets = getDailyTargets();
    const subMacroTargets = defaultDailySubMacroTargets;
    const microTargets = defaultDailyMicronutrientTargets;
    
    // Calculate individual macro achievement percentages
    const targetsAchieved = {
      protein: targets.protein > 0 ? macros.protein / targets.protein : 0,
      carbs: targets.carbs > 0 ? macros.carbs / targets.carbs : 0,
      fat: targets.fat > 0 ? macros.fat / targets.fat : 0
    };

    // Calculate weighted consistency score
    // Main Macros: 60% weight (20% each) - Critical for body composition
    // Key Nutrients: 40% weight (8% each) - Important but secondary
    
    let macroScore = 0;
    let nutrientScore = 0;
    
    // Macro scoring (60% total weight, 20% each)
    const macroResults = {
      protein: {
        achieved: targetsAchieved.protein >= 0.95 && targetsAchieved.protein <= 1.05,
        percentage: targetsAchieved.protein,
        target: targets.protein,
        actual: macros.protein,
        status: targetsAchieved.protein < 0.95 ? 'under' : targetsAchieved.protein > 1.05 ? 'over' : 'hit'
      },
      carbs: {
        achieved: targetsAchieved.carbs >= 0.95 && targetsAchieved.carbs <= 1.05,
        percentage: targetsAchieved.carbs,
        target: targets.carbs,
        actual: macros.carbs,
        status: targetsAchieved.carbs < 0.95 ? 'under' : targetsAchieved.carbs > 1.05 ? 'over' : 'hit'
      },
      fat: {
        achieved: targetsAchieved.fat >= 0.95 && targetsAchieved.fat <= 1.05,
        percentage: targetsAchieved.fat,
        target: targets.fat,
        actual: macros.fat,
        status: targetsAchieved.fat < 0.95 ? 'under' : targetsAchieved.fat > 1.05 ? 'over' : 'hit'
      }
    };
    
    if (macroResults.protein.achieved) macroScore += 20;
    if (macroResults.carbs.achieved) macroScore += 20;
    if (macroResults.fat.achieved) macroScore += 20;
    
    // Nutrient scoring (40% total weight, 8% each)
    const nutrientResults = {
      fiber: {
        achieved: subMacros.fiber >= subMacroTargets.minFiber,
        actual: subMacros.fiber,
        target: subMacroTargets.minFiber,
        deficit: Math.max(0, subMacroTargets.minFiber - subMacros.fiber)
      },
      omega3: {
        achieved: subMacros.omega3 >= subMacroTargets.omega3,
        actual: subMacros.omega3,
        target: subMacroTargets.omega3,
        deficit: Math.max(0, subMacroTargets.omega3 - subMacros.omega3)
      },
      iron: {
        achieved: micronutrients.iron >= microTargets.iron,
        actual: micronutrients.iron,
        target: microTargets.iron,
        deficit: Math.max(0, microTargets.iron - micronutrients.iron)
      },
      calcium: {
        achieved: micronutrients.calcium >= microTargets.calcium,
        actual: micronutrients.calcium,
        target: microTargets.calcium,
        deficit: Math.max(0, microTargets.calcium - micronutrients.calcium)
      },
      vitaminD: {
        achieved: micronutrients.vitaminD >= microTargets.vitaminD,
        actual: micronutrients.vitaminD,
        target: microTargets.vitaminD,
        deficit: Math.max(0, microTargets.vitaminD - micronutrients.vitaminD)
      }
    };
    
    if (nutrientResults.fiber.achieved) nutrientScore += 8;
    if (nutrientResults.omega3.achieved) nutrientScore += 8;
    if (nutrientResults.iron.achieved) nutrientScore += 8;
    if (nutrientResults.calcium.achieved) nutrientScore += 8;
    if (nutrientResults.vitaminD.achieved) nutrientScore += 8;
    
    const consistencyScore = (macroScore + nutrientScore) / 100;

    // Get top 3 most used foods by weight
    const foodUsage = {};
    mealPlans.forEach(plan => {
      plan.selectedFoods?.forEach(food => {
        foodUsage[food.foodId] = (foodUsage[food.foodId] || 0) + food.portionGrams;
      });
    });
    
    const topFoods = Object.entries(foodUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([foodId]) => foodId);

    return {
      macros,
      subMacros,
      micronutrients,
      targetsAchieved,
      consistencyScore,
      macroScore,
      nutrientScore,
      macroResults,
      nutrientResults,
      topFoods,
      isCheatDay: false, // Default to false, can be toggled by user
      createdAt: TimeService.getCurrentDate().toISOString()
    };
  };

  const updateDailySummary = (date, summary) => {
    dispatch({ 
      type: ACTIONS.UPDATE_DAILY_SUMMARY, 
      payload: { date, summary } 
    });
  };

  const getTodaysSummary = () => {
    const todayKey = getMyTodayDate(); // Use custom day reset logic
    
    // Check if we already have a daily summary for today
    if (state.dailySummaries[todayKey]) {
      return {
        date: todayKey,
        ...state.dailySummaries[todayKey]
      };
    }
    
    // Get today's meal plans using consistent logic
    const todaysMealPlans = state.mealPlans.filter(plan => 
      getMyTodayDate(new Date(plan.createdAt)) === todayKey
    );
    
    if (todaysMealPlans.length === 0) {
      return null;
    }
    
    // Create real-time summary from today's meal plans
    const summary = createDailySummary(todaysMealPlans);
    return summary ? { date: todayKey, ...summary } : null;
  };

  const getDailySummariesForPeriod = (days = 7) => {
    const summaries = [];
    const todayKey = getMyTodayDate(); // Use custom day reset logic
    // Use TimeService's current date instead of parsing the string
    const todayDate = TimeService.getCurrentDate();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      
      // CRITICAL FIX: Use consistent date logic for both summary lookup and meal plan filtering
      // Instead of using regular toDateString(), use the same getMyTodayDate logic
      // This ensures meal plans and summaries use the same date keys
      const dateKey = getMyTodayDate(date);
      
      if (i === 0) {
        // For today, get real-time summary
        const todaysSummary = getTodaysSummary();
        if (todaysSummary) {
          summaries.unshift(todaysSummary);
        }
      } else {
        // For past days, check stored daily summaries first
        if (state.dailySummaries[dateKey]) {
          summaries.unshift({
            date: dateKey,
            ...state.dailySummaries[dateKey]
          });
        } else {
          // If no stored summary, try to create one from meal plans for that date
          // This handles recent days that haven't been converted to summaries yet
          const dayMealPlans = state.mealPlans.filter(plan => {
            const planDateKey = getMyTodayDate(new Date(plan.createdAt));
            return planDateKey === dateKey;
          });
          
          if (dayMealPlans.length > 0) {
            const summary = createDailySummary(dayMealPlans);
            if (summary) {
              summaries.unshift({
                date: dateKey,
                ...summary
              });
            }
          }
        }
      }
    }
    
    return summaries;
  };

  const getWeeklyComparison = () => {
    const thisWeekSummaries = getDailySummariesForPeriod(7);
    const lastWeekSummaries = getDailySummariesForPeriod(14).slice(0, 7);
    
    const calculateAverage = (summaries) => {
      if (summaries.length === 0) return { protein: 0, carbs: 0, fat: 0, calories: 0 };
      
      return summaries.reduce((total, summary) => {
        // Handle cases where summary.macros might be undefined (like cheat days with no meal data)
        const macros = summary.macros || { protein: 0, carbs: 0, fat: 0, calories: 0 };
        return {
          protein: total.protein + macros.protein,
          carbs: total.carbs + macros.carbs,
          fat: total.fat + macros.fat,
          calories: total.calories + macros.calories
        };
      }, { protein: 0, carbs: 0, fat: 0, calories: 0 });
    };
    
    const thisWeek = calculateAverage(thisWeekSummaries);
    const lastWeek = calculateAverage(lastWeekSummaries);
    
    // Calculate averages
    if (thisWeekSummaries.length > 0) {
      Object.keys(thisWeek).forEach(key => {
        thisWeek[key] = thisWeek[key] / thisWeekSummaries.length;
      });
    }
    
    if (lastWeekSummaries.length > 0) {
      Object.keys(lastWeek).forEach(key => {
        lastWeek[key] = lastWeek[key] / lastWeekSummaries.length;
      });
    }
    
    return { thisWeek, lastWeek };
  };

  // Data Lifecycle Management
  const processDataLifecycle = async (retentionDays = 90) => {
    // Use consistent date calculation with getMyTodayDate logic
    const myToday = getMyTodayDate(); // Use custom day reset logic
    const myTodayDate = new Date(myToday);
    
    const sevenDaysAgo = new Date(myTodayDate);
    sevenDaysAgo.setDate(myTodayDate.getDate() - 7);
    
    const retentionCutoff = new Date(myTodayDate);
    retentionCutoff.setDate(myTodayDate.getDate() - retentionDays);

    // Step 1: Convert meal plans older than 7 days to daily summaries
    const mealPlansToConvert = state.mealPlans.filter(plan => {
      const planDate = new Date(getMyTodayDate(new Date(plan.createdAt)));
      return planDate < sevenDaysAgo;
    });

    // Group meal plans by date
    const plansByDate = {};
    mealPlansToConvert.forEach(plan => {
      const dateKey = getMyTodayDate(new Date(plan.createdAt));
      if (!plansByDate[dateKey]) {
        plansByDate[dateKey] = [];
      }
      plansByDate[dateKey].push(plan);
    });

    // Create daily summaries for each date
    const newSummaries = {};
    Object.entries(plansByDate).forEach(([dateKey, plans]) => {
      if (!state.dailySummaries[dateKey]) { // Don't overwrite existing summaries
        const summary = createDailySummary(plans);
        if (summary) {
          newSummaries[dateKey] = summary;
        }
      }
    });

    // Step 2: Remove old meal plans (now converted to summaries)
    const remainingMealPlans = state.mealPlans.filter(plan => {
      const planDate = new Date(getMyTodayDate(new Date(plan.createdAt)));
      return planDate >= sevenDaysAgo;
    });

    // Step 3: Remove old daily summaries based on retention period
    const remainingSummaries = {};
    Object.entries({ ...state.dailySummaries, ...newSummaries }).forEach(([dateKey, summary]) => {
      const summaryDate = new Date(dateKey);
      if (summaryDate >= retentionCutoff) {
        remainingSummaries[dateKey] = summary;
      }
    });

    // Update state with cleaned data
    dispatch({
      type: ACTIONS.DELETE_OLD_DATA,
      payload: {
        mealPlans: remainingMealPlans,
        dailySummaries: remainingSummaries
      }
    });

    // Update daily summaries with new ones
    Object.entries(newSummaries).forEach(([dateKey, summary]) => {
      dispatch({
        type: ACTIONS.UPDATE_DAILY_SUMMARY,
        payload: { date: dateKey, summary }
      });
    });

    console.log(`Data lifecycle processed: 
      - Converted ${Object.keys(newSummaries).length} days to summaries
      - Kept ${remainingMealPlans.length} recent meal plans
      - Kept ${Object.keys(remainingSummaries).length} daily summaries`);

    return {
      summariesCreated: Object.keys(newSummaries).length,
      mealPlansRemaining: remainingMealPlans.length,
      summariesRemaining: Object.keys(remainingSummaries).length
    };
  };

  const cleanupOldData = async (retentionDays = 90) => {
    try {
      const result = await processDataLifecycle(retentionDays);
      return result;
    } catch (error) {
      console.error('Error during data cleanup:', error);
      throw error;
    }
  };

  const getDataStorageInfo = () => {
    const mealPlansSize = JSON.stringify(state.mealPlans).length;
    const summariesSize = JSON.stringify(state.dailySummaries).length;
    const totalSize = mealPlansSize + summariesSize;
    
    return {
      mealPlansCount: state.mealPlans.length,
      summariesCount: Object.keys(state.dailySummaries).length,
      mealPlansSize: Math.round(mealPlansSize / 1024), // KB
      summariesSize: Math.round(summariesSize / 1024), // KB
      totalSize: Math.round(totalSize / 1024), // KB
      estimatedSavings: Math.round((mealPlansSize * 0.9) / 1024) // Estimated 90% savings from conversion
    };
  };

  // Dashboard helper functions
  const getDailyTargets = () => {
    return state.meals.reduce((total, meal) => ({
      protein: total.protein + meal.macroTargets.protein,
      carbs: total.carbs + meal.macroTargets.carbs,
      fat: total.fat + meal.macroTargets.fat
    }), { protein: 0, carbs: 0, fat: 0 });
  };

  const getTodaysMealPlans = () => {
    const today = getMyTodayDate();
    return state.mealPlans.filter(plan => 
      getMyTodayDate(new Date(plan.createdAt)) === today
    );
  };

  // Helper function to get "today" based on user's custom reset hour instead of midnight
  const getMyTodayDate = (date = null) => {
    const dayResetHour = appPreferences?.dayResetHour || 4;
    
    if (date) {
      // For specific dates (like from meal plans), calculate based on that date
      const currentDate = new Date(date);
      if (currentDate.getHours() < dayResetHour) {
        currentDate.setDate(currentDate.getDate() - 1);
      }
      return currentDate.toDateString();
    }
    
    // For "today", use TimeService which respects simulation
    return TimeService.getTodayString(dayResetHour);
  };

  const getDailyProgress = () => {
    const todaysPlans = getTodaysMealPlans();
    const targets = getDailyTargets();
    
    const consumed = todaysPlans.reduce((total, plan) => {
      const effectiveMacros = getEffectiveMacros(plan);
      return {
        protein: total.protein + (effectiveMacros?.protein || 0),
        carbs: total.carbs + (effectiveMacros?.carbs || 0),
        fat: total.fat + (effectiveMacros?.fat || 0),
        calories: total.calories + (effectiveMacros?.calories || 0),
        // Sub-macros
        omega3: total.omega3 + (effectiveMacros?.omega3 || 0),
        monounsaturatedFat: total.monounsaturatedFat + (effectiveMacros?.monounsaturatedFat || 0),
        polyunsaturatedFat: total.polyunsaturatedFat + (effectiveMacros?.polyunsaturatedFat || 0),
        saturatedFat: total.saturatedFat + (effectiveMacros?.saturatedFat || 0),
        transFat: total.transFat + (effectiveMacros?.transFat || 0),
        addedSugars: total.addedSugars + (effectiveMacros?.addedSugars || 0),
        naturalSugars: total.naturalSugars + (effectiveMacros?.naturalSugars || 0),
        fiber: total.fiber + (effectiveMacros?.fiber || 0),
        // Micronutrients
        iron: total.iron + (effectiveMacros?.iron || 0),
        calcium: total.calcium + (effectiveMacros?.calcium || 0),
        zinc: total.zinc + (effectiveMacros?.zinc || 0),
        magnesium: total.magnesium + (effectiveMacros?.magnesium || 0),
        sodium: total.sodium + (effectiveMacros?.sodium || 0),
        potassium: total.potassium + (effectiveMacros?.potassium || 0),
        vitaminB6: total.vitaminB6 + (effectiveMacros?.vitaminB6 || 0),
        vitaminB12: total.vitaminB12 + (effectiveMacros?.vitaminB12 || 0),
        vitaminC: total.vitaminC + (effectiveMacros?.vitaminC || 0),
        vitaminD: total.vitaminD + (effectiveMacros?.vitaminD || 0)
      };
    }, { 
      protein: 0, carbs: 0, fat: 0, calories: 0,
      omega3: 0, monounsaturatedFat: 0, polyunsaturatedFat: 0, saturatedFat: 0, transFat: 0,
      addedSugars: 0, naturalSugars: 0, fiber: 0,
      iron: 0, calcium: 0, zinc: 0, magnesium: 0, sodium: 0, potassium: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0, vitaminD: 0
    });

    return {
      targets,
      consumed,
      subMacroTargets: defaultDailySubMacroTargets,
      micronutrientTargets: defaultDailyMicronutrientTargets,
      percentages: {
        protein: targets.protein > 0 ? (consumed.protein / targets.protein) * 100 : 0,
        carbs: targets.carbs > 0 ? (consumed.carbs / targets.carbs) * 100 : 0,
        fat: targets.fat > 0 ? (consumed.fat / targets.fat) * 100 : 0
      },
      subMacroPercentages: {
        omega3: defaultDailySubMacroTargets.omega3 > 0 ? (consumed.omega3 / defaultDailySubMacroTargets.omega3) * 100 : 0,
        monounsaturatedFat: defaultDailySubMacroTargets.monounsaturatedFat > 0 ? (consumed.monounsaturatedFat / defaultDailySubMacroTargets.monounsaturatedFat) * 100 : 0,
        polyunsaturatedFat: defaultDailySubMacroTargets.polyunsaturatedFat > 0 ? (consumed.polyunsaturatedFat / defaultDailySubMacroTargets.polyunsaturatedFat) * 100 : 0,
        saturatedFat: defaultDailySubMacroTargets.maxSaturatedFat > 0 ? (consumed.saturatedFat / defaultDailySubMacroTargets.maxSaturatedFat) * 100 : 0,
        transFat: defaultDailySubMacroTargets.maxTransFat > 0 ? (consumed.transFat / defaultDailySubMacroTargets.maxTransFat) * 100 : (consumed.transFat > 0 ? 100 : 0),
        addedSugars: defaultDailySubMacroTargets.maxAddedSugars > 0 ? (consumed.addedSugars / defaultDailySubMacroTargets.maxAddedSugars) * 100 : 0,
        naturalSugars: defaultDailySubMacroTargets.maxNaturalSugars > 0 ? (consumed.naturalSugars / defaultDailySubMacroTargets.maxNaturalSugars) * 100 : 0,
        fiber: defaultDailySubMacroTargets.minFiber > 0 ? (consumed.fiber / defaultDailySubMacroTargets.minFiber) * 100 : 0
      },
      micronutrientPercentages: {
        iron: defaultDailyMicronutrientTargets.iron > 0 ? (consumed.iron / defaultDailyMicronutrientTargets.iron) * 100 : 0,
        calcium: defaultDailyMicronutrientTargets.calcium > 0 ? (consumed.calcium / defaultDailyMicronutrientTargets.calcium) * 100 : 0,
        zinc: defaultDailyMicronutrientTargets.zinc > 0 ? (consumed.zinc / defaultDailyMicronutrientTargets.zinc) * 100 : 0,
        magnesium: defaultDailyMicronutrientTargets.magnesium > 0 ? (consumed.magnesium / defaultDailyMicronutrientTargets.magnesium) * 100 : 0,
        sodium: defaultDailyMicronutrientTargets.sodium > 0 ? (consumed.sodium / defaultDailyMicronutrientTargets.sodium) * 100 : 0,
        potassium: defaultDailyMicronutrientTargets.potassium > 0 ? (consumed.potassium / defaultDailyMicronutrientTargets.potassium) * 100 : 0,
        vitaminB6: defaultDailyMicronutrientTargets.vitaminB6 > 0 ? (consumed.vitaminB6 / defaultDailyMicronutrientTargets.vitaminB6) * 100 : 0,
        vitaminB12: defaultDailyMicronutrientTargets.vitaminB12 > 0 ? (consumed.vitaminB12 / defaultDailyMicronutrientTargets.vitaminB12) * 100 : 0,
        vitaminC: defaultDailyMicronutrientTargets.vitaminC > 0 ? (consumed.vitaminC / defaultDailyMicronutrientTargets.vitaminC) * 100 : 0,
        vitaminD: defaultDailyMicronutrientTargets.vitaminD > 0 ? (consumed.vitaminD / defaultDailyMicronutrientTargets.vitaminD) * 100 : 0
      }
    };
  };

  const getMealsCompletedToday = () => {
    const todaysPlans = getTodaysMealPlans();
    const mealIds = new Set(todaysPlans.map(plan => plan.mealId));
    
    return state.meals.map(meal => ({
      ...meal,
      completed: mealIds.has(meal.id),
      plan: todaysPlans.find(plan => plan.mealId === meal.id)
    }));
  };

  // Cheat Meal/Day Functions
  const getEffectiveMacros = (mealPlan) => {
    if (mealPlan.isCheatMeal) {
      // For cheat meals, return the meal's targets as if they were perfectly achieved
      const meal = getMealById(mealPlan.mealId);
      if (meal) {
        const targets = meal.macroTargets;
        return {
          // Main macros
          protein: targets.protein,
          carbs: targets.carbs,
          fat: targets.fat,
          calories: (targets.protein * 4) + (targets.carbs * 4) + (targets.fat * 9),
          // Sub-macros - assume optimal values for cheat meals
          fiber: targets.minFiber || 0,
          sugar: Math.min(targets.maxSugar || 0, targets.carbs * 0.3), // Assume 30% of carbs as sugar
          naturalSugars: Math.min(targets.maxSugar || 0, targets.carbs * 0.2) * 0.8, // 80% natural
          addedSugars: Math.min(targets.maxSugar || 0, targets.carbs * 0.2) * 0.2, // 20% added
          saturatedFat: targets.fat * 0.3, // Assume 30% saturated
          monounsaturatedFat: targets.fat * 0.4, // Assume 40% monounsaturated  
          polyunsaturatedFat: targets.fat * 0.3, // Assume 30% polyunsaturated
          transFat: 0, // Assume no trans fat
          omega3: targets.fat * 0.05, // Assume 5% omega-3
          // Micronutrients - assume reasonable values
          iron: 2, calcium: 50, zinc: 1, magnesium: 25,
          sodium: 300, potassium: 200, vitaminB6: 0.1,
          vitaminB12: 0.2, vitaminC: 5, vitaminD: 1
        };
      }
    }
    // For normal meals, return the actual calculated macros
    return mealPlan.calculatedMacros || {};
  };

  const toggleCheatMeal = (mealPlanId) => {
    const mealPlan = state.mealPlans.find(plan => plan.id === mealPlanId);
    if (mealPlan) {
      updateMealPlan({
        ...mealPlan,
        isCheatMeal: !mealPlan.isCheatMeal
      });
    }
  };

  const toggleCheatDay = (date) => {
    const existingSummary = state.dailySummaries[date];
    const updatedSummary = {
      ...existingSummary,
      isCheatDay: !existingSummary?.isCheatDay,
      // Ensure we have default macro data for cheat days to prevent crashes
      macros: existingSummary?.macros || { protein: 0, carbs: 0, fat: 0, calories: 0 },
      consistencyScore: existingSummary?.consistencyScore || 0
    };
    updateDailySummary(date, updatedSummary);
  };

  const getCheatMealUsage = (periodType = 'weekly') => {
    const myToday = getMyTodayDate(); // Use custom reset hour
    const todayDate = new Date(myToday);
    const startDate = new Date(todayDate);
    
    if (periodType === 'weekly') {
      // Go back to the beginning of this week (Sunday at reset hour)
      const daysToSubtract = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      startDate.setDate(todayDate.getDate() - daysToSubtract);
      startDate.setHours(appPreferences?.dayResetHour || 4, 0, 0, 0);
    } else if (periodType === 'monthly') {
      // Go to the 1st of current month at reset hour
      startDate.setDate(1);
      startDate.setHours(appPreferences?.dayResetHour || 4, 0, 0, 0);
    }
    
    const usedCheatMeals = state.mealPlans.filter(plan => {
      const planDate = new Date(plan.createdAt);
      return plan.isCheatMeal && planDate >= startDate;
    }).length;
    
    return usedCheatMeals;
  };

  const getCheatDayUsage = (periodType = 'weekly') => {
    const myToday = getMyTodayDate(); // Use custom reset hour
    const todayDate = new Date(myToday);
    const startDate = new Date(todayDate);
    
    if (periodType === 'weekly') {
      // Go back to the beginning of this week (Sunday at reset hour)
      const daysToSubtract = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      startDate.setDate(todayDate.getDate() - daysToSubtract);
      startDate.setHours(appPreferences?.dayResetHour || 4, 0, 0, 0);
    } else if (periodType === 'monthly') {
      // Go to the 1st of current month at reset hour
      startDate.setDate(1);
      startDate.setHours(appPreferences?.dayResetHour || 4, 0, 0, 0);
    }
    
    const usedCheatDays = Object.entries(state.dailySummaries).filter(([dateKey, summary]) => {
      const summaryDate = new Date(dateKey);
      return summary.isCheatDay && summaryDate >= startDate;
    }).length;
    
    return usedCheatDays;
  };

  const canUseCheatMeal = (settings) => {
    const used = getCheatMealUsage(settings?.cheatPeriodType);
    const limit = settings?.cheatMealsPerPeriod || 2;
    console.log('canUseCheatMeal - used:', used, 'limit:', limit, 'result:', used < limit);
    return used < limit;
  };

  const canUseCheatDay = (settings) => {
    const used = getCheatDayUsage(settings?.cheatPeriodType);
    const limit = settings?.cheatDaysPerPeriod || 1;
    console.log('canUseCheatDay - used:', used, 'limit:', limit, 'result:', used < limit);
    return used < limit;
  };

  const getCheatStats = (settings) => {
    const periodType = settings?.cheatPeriodType || 'weekly';
    return {
      cheatMeals: {
        used: getCheatMealUsage(periodType),
        limit: settings?.cheatMealsPerPeriod || 2,
        remaining: Math.max(0, (settings?.cheatMealsPerPeriod || 2) - getCheatMealUsage(periodType))
      },
      cheatDays: {
        used: getCheatDayUsage(periodType),
        limit: settings?.cheatDaysPerPeriod || 1,
        remaining: Math.max(0, (settings?.cheatDaysPerPeriod || 1) - getCheatDayUsage(periodType))
      },
      periodType
    };
  };

  const value = {
    ...state,
    addMeal,
    updateMeal,
    deleteMeal,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    getMealById,
    getMealPlanById,
    getMealPlansByMeal,
    getRecentMealPlans,
    reloadMeals,
    regeneratePersonalizedMeals,
    switchToDefaultMeals,
    // Dashboard functions
    getDailyTargets,
    getTodaysMealPlans,
    getDailyProgress,
    getMealsCompletedToday,
    // Daily Summary functions
    createDailySummary,
    updateDailySummary,
    getTodaysSummary,
    getDailySummariesForPeriod,
    getWeeklyComparison,
    // Data Lifecycle functions
    processDataLifecycle,
    cleanupOldData,
    getDataStorageInfo,
    // Cheat Meal/Day functions
    getEffectiveMacros,
    toggleCheatMeal,
    toggleCheatDay,
    getCheatMealUsage,
    getCheatDayUsage,
    canUseCheatMeal,
    canUseCheatDay,
    getCheatStats,
    // Helper functions
    getMyTodayDate
  };

  return (
    <MealContext.Provider value={value}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeal() {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
}