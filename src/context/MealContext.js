import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MealContext = createContext();

const ACTIONS = {
  LOAD_MEALS: 'LOAD_MEALS',
  ADD_MEAL: 'ADD_MEAL',
  UPDATE_MEAL: 'UPDATE_MEAL',
  DELETE_MEAL: 'DELETE_MEAL',
  CREATE_MEAL_PLAN: 'CREATE_MEAL_PLAN',
  UPDATE_MEAL_PLAN: 'UPDATE_MEAL_PLAN',
  DELETE_MEAL_PLAN: 'DELETE_MEAL_PLAN',
  LOAD_MEAL_PLANS: 'LOAD_MEAL_PLANS'
};

const defaultMeals = [
  {
    id: '1',
    name: 'Breakfast',
    macroTargets: {
      protein: 30,
      carbs: 45,
      minFiber: 5,
      maxSugar: 15,
      fat: 15
    },
    userCustom: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Lunch',
    macroTargets: {
      protein: 40,
      carbs: 50,
      minFiber: 8,
      maxSugar: 10,
      fat: 20
    },
    userCustom: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Dinner',
    macroTargets: {
      protein: 35,
      carbs: 40,
      minFiber: 10,
      maxSugar: 8,
      fat: 25
    },
    userCustom: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Post-Workout',
    macroTargets: {
      protein: 25,
      carbs: 30,
      minFiber: 3,
      maxSugar: 20,
      fat: 5
    },
    userCustom: false,
    createdAt: new Date().toISOString()
  }
];

// Daily sub-macro targets (independent of meals)
const defaultDailySubMacroTargets = {
  // Healthy fats (daily targets)
  omega3: 2.0,           // 2g omega-3 daily (heart/brain health)
  monounsaturatedFat: 25, // 25g monounsaturated fat daily
  polyunsaturatedFat: 15, // 15g polyunsaturated fat daily (5-10% of calories)
  maxSaturatedFat: 20,    // Max 20g saturated fat daily
  maxTransFat: 0,         // Zero trans fat daily
  
  // Sugar targets
  maxAddedSugars: 25,     // Max 25g added sugars daily (WHO recommendation)
  maxNaturalSugars: 100,  // Max 100g natural sugars daily (from fruits/dairy)
  minFiber: 25,           // Min 25g fiber daily (general health)
  
  // Additional targets you can customize later
  maxSodium: 2300,        // Max 2300mg sodium daily (optional)
  minPotassium: 3500      // Min 3500mg potassium daily (optional)
};

// Daily micronutrient targets (RDA - Recommended Daily Allowance)
const defaultDailyMicronutrientTargets = {
  // Minerals (mg)
  iron: 18,              // 18mg daily (higher for women of reproductive age)
  calcium: 1000,         // 1000mg daily for adults
  zinc: 11,              // 11mg daily for men, 8mg for women (using higher value)
  magnesium: 400,        // 400mg daily for men, 310mg for women (using higher value)
  
  // Vitamins
  vitaminB6: 1.3,        // 1.3mg daily for adults
  vitaminB12: 2.4,       // 2.4μg daily for adults
  vitaminC: 90,          // 90mg daily for men, 75mg for women (using higher value)
  vitaminD: 20,          // 20μg (800 IU) daily for adults
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
        id: Date.now().toString(),
        userCustom: true,
        createdAt: new Date().toISOString()
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
      const newMealPlan = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        mealPlans: [...state.mealPlans, newMealPlan]
      };
    
    case ACTIONS.UPDATE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.map(plan => 
          plan.id === action.payload.id ? { ...plan, ...action.payload } : plan
        )
      };
    
    case ACTIONS.DELETE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.filter(plan => plan.id !== action.payload)
      };
    
    default:
      return state;
  }
}

const initialState = {
  meals: [],
  mealPlans: [],
  loading: true
};

export function MealProvider({ children }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);

  useEffect(() => {
    loadMeals();
    loadMealPlans();
  }, []);

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

  const loadMeals = async () => {
    try {
      const storedMeals = await AsyncStorage.getItem('meals');
      if (storedMeals) {
        const meals = JSON.parse(storedMeals);
        dispatch({ type: ACTIONS.LOAD_MEALS, payload: meals });
      } else {
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
        dispatch({ type: ACTIONS.LOAD_MEAL_PLANS, payload: mealPlans });
      } else {
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
    const today = new Date().toDateString();
    return state.mealPlans.filter(plan => 
      new Date(plan.createdAt).toDateString() === today
    );
  };

  const getDailyProgress = () => {
    const todaysPlans = getTodaysMealPlans();
    const targets = getDailyTargets();
    
    const consumed = todaysPlans.reduce((total, plan) => ({
      protein: total.protein + (plan.calculatedMacros?.protein || 0),
      carbs: total.carbs + (plan.calculatedMacros?.carbs || 0),
      fat: total.fat + (plan.calculatedMacros?.fat || 0),
      calories: total.calories + (plan.calculatedMacros?.calories || 0),
      // Sub-macros
      omega3: total.omega3 + (plan.calculatedMacros?.omega3 || 0),
      monounsaturatedFat: total.monounsaturatedFat + (plan.calculatedMacros?.monounsaturatedFat || 0),
      polyunsaturatedFat: total.polyunsaturatedFat + (plan.calculatedMacros?.polyunsaturatedFat || 0),
      saturatedFat: total.saturatedFat + (plan.calculatedMacros?.saturatedFat || 0),
      transFat: total.transFat + (plan.calculatedMacros?.transFat || 0),
      addedSugars: total.addedSugars + (plan.calculatedMacros?.addedSugars || 0),
      naturalSugars: total.naturalSugars + (plan.calculatedMacros?.naturalSugars || 0),
      fiber: total.fiber + (plan.calculatedMacros?.fiber || 0),
      // Micronutrients
      iron: total.iron + (plan.calculatedMacros?.iron || 0),
      calcium: total.calcium + (plan.calculatedMacros?.calcium || 0),
      zinc: total.zinc + (plan.calculatedMacros?.zinc || 0),
      magnesium: total.magnesium + (plan.calculatedMacros?.magnesium || 0),
      vitaminB6: total.vitaminB6 + (plan.calculatedMacros?.vitaminB6 || 0),
      vitaminB12: total.vitaminB12 + (plan.calculatedMacros?.vitaminB12 || 0),
      vitaminC: total.vitaminC + (plan.calculatedMacros?.vitaminC || 0),
      vitaminD: total.vitaminD + (plan.calculatedMacros?.vitaminD || 0)
    }), { 
      protein: 0, carbs: 0, fat: 0, calories: 0,
      omega3: 0, monounsaturatedFat: 0, polyunsaturatedFat: 0, saturatedFat: 0, transFat: 0,
      addedSugars: 0, naturalSugars: 0, fiber: 0,
      iron: 0, calcium: 0, zinc: 0, magnesium: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0, vitaminD: 0
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
    // Dashboard functions
    getDailyTargets,
    getTodaysMealPlans,
    getDailyProgress,
    getMealsCompletedToday
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