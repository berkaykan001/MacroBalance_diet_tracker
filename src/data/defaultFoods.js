export const defaultFoods = [
  // Proteins
  {
    id: '1',
    name: 'Chicken Breast (Skinless)',
    category: 'protein',
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 3.6,
      vitaminD: 0,
      magnesium: 25
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Whey Protein Powder',
    category: 'protein',
    nutritionPer100g: {
      calories: 400,
      protein: 80,
      carbs: 8,
      fiber: 0,
      sugar: 6,
      fat: 4,
      vitaminD: 0,
      magnesium: 0
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Eggs (Whole)',
    category: 'protein',
    nutritionPer100g: {
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fiber: 0,
      sugar: 1.1,
      fat: 11,
      vitaminD: 2,
      magnesium: 12
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Greek Yogurt (0% Fat)',
    category: 'protein',
    nutritionPer100g: {
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fiber: 0,
      sugar: 3.2,
      fat: 0.4,
      vitaminD: 0,
      magnesium: 11
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Salmon (Atlantic)',
    category: 'protein',
    nutritionPer100g: {
      calories: 208,
      protein: 25,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 12,
      vitaminD: 11,
      magnesium: 30
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },

  // Carbs
  {
    id: '6',
    name: 'Oats (Rolled)',
    category: 'carbs',
    nutritionPer100g: {
      calories: 389,
      protein: 17,
      carbs: 66,
      fiber: 10,
      sugar: 1,
      fat: 7,
      vitaminD: 0,
      magnesium: 177
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '7',
    name: 'White Rice (Cooked)',
    category: 'carbs',
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fiber: 0.4,
      sugar: 0.1,
      fat: 0.3,
      vitaminD: 0,
      magnesium: 12
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Sweet Potato',
    category: 'carbs',
    nutritionPer100g: {
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fiber: 3,
      sugar: 4.2,
      fat: 0.1,
      vitaminD: 0,
      magnesium: 25
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Banana',
    category: 'carbs',
    nutritionPer100g: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fiber: 2.6,
      sugar: 12,
      fat: 0.3,
      vitaminD: 0,
      magnesium: 27
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Whole Wheat Bread',
    category: 'carbs',
    nutritionPer100g: {
      calories: 247,
      protein: 13,
      carbs: 41,
      fiber: 7,
      sugar: 6,
      fat: 4.2,
      vitaminD: 0,
      magnesium: 76
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },

  // Fats
  {
    id: '11',
    name: 'Olive Oil',
    category: 'fats',
    nutritionPer100g: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 100,
      vitaminD: 0,
      magnesium: 0
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '12',
    name: 'Avocado',
    category: 'fats',
    nutritionPer100g: {
      calories: 160,
      protein: 2,
      carbs: 9,
      fiber: 7,
      sugar: 0.7,
      fat: 15,
      vitaminD: 0,
      magnesium: 29
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '13',
    name: 'Almonds',
    category: 'fats',
    nutritionPer100g: {
      calories: 579,
      protein: 21,
      carbs: 22,
      fiber: 12,
      sugar: 4.4,
      fat: 50,
      vitaminD: 0,
      magnesium: 270
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '14',
    name: 'Peanut Butter',
    category: 'fats',
    nutritionPer100g: {
      calories: 588,
      protein: 25,
      carbs: 20,
      fiber: 8,
      sugar: 9,
      fat: 50,
      vitaminD: 0,
      magnesium: 168
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },

  // Vegetables
  {
    id: '15',
    name: 'Broccoli',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 34,
      protein: 2.8,
      carbs: 7,
      fiber: 2.6,
      sugar: 1.5,
      fat: 0.4,
      vitaminD: 0,
      magnesium: 21
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '16',
    name: 'Spinach',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fiber: 2.2,
      sugar: 0.4,
      fat: 0.4,
      vitaminD: 0,
      magnesium: 79
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '17',
    name: 'Bell Peppers',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 31,
      protein: 1,
      carbs: 7,
      fiber: 2.5,
      sugar: 4.2,
      fat: 0.3,
      vitaminD: 0,
      magnesium: 12
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '18',
    name: 'Cucumber',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 16,
      protein: 0.7,
      carbs: 4,
      fiber: 0.5,
      sugar: 1.7,
      fat: 0.1,
      vitaminD: 0,
      magnesium: 13
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },

  // Dairy
  {
    id: '19',
    name: 'Milk (2%)',
    category: 'dairy',
    nutritionPer100g: {
      calories: 50,
      protein: 3.3,
      carbs: 4.8,
      fiber: 0,
      sugar: 4.8,
      fat: 2,
      vitaminD: 1.3,
      magnesium: 11
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '20',
    name: 'Cottage Cheese (Low Fat)',
    category: 'dairy',
    nutritionPer100g: {
      calories: 98,
      protein: 11,
      carbs: 3.4,
      fiber: 0,
      sugar: 2.7,
      fat: 4.3,
      vitaminD: 0,
      magnesium: 8
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  }
];