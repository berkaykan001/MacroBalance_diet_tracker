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
      naturalSugars: 0,
      addedSugars: 0,
      fat: 12,
      saturatedFat: 1.9,
      monounsaturatedFat: 3.8,
      polyunsaturatedFat: 3.9,
      transFat: 0,
      omega3: 2.3,
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
      naturalSugars: 1,
      addedSugars: 0,
      fat: 7,
      saturatedFat: 1.2,
      monounsaturatedFat: 2.2,
      polyunsaturatedFat: 2.5,
      transFat: 0,
      omega3: 0.1,
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
      naturalSugars: 2,
      addedSugars: 4,
      fat: 4.2,
      saturatedFat: 0.8,
      monounsaturatedFat: 0.5,
      polyunsaturatedFat: 1.8,
      transFat: 0,
      omega3: 0.1,
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
      naturalSugars: 0,
      addedSugars: 0,
      fat: 100,
      saturatedFat: 13.8,
      monounsaturatedFat: 73.0,
      polyunsaturatedFat: 10.5,
      transFat: 0,
      omega3: 0.8,
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
  },

  // Additional Foods
  {
    id: '21',
    name: 'Pasta (Cooked)',
    category: 'carbs',
    nutritionPer100g: {
      calories: 131,
      protein: 5,
      carbs: 25,
      fiber: 1.8,
      sugar: 0.6,
      fat: 1.1,
      vitaminD: 0,
      magnesium: 18
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '22',
    name: 'Lean Beef (93/7)',
    category: 'protein',
    nutritionPer100g: {
      calories: 176,
      protein: 26,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 7,
      vitaminD: 0,
      magnesium: 21
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '23',
    name: 'Potato (Baked)',
    category: 'carbs',
    nutritionPer100g: {
      calories: 93,
      protein: 2.5,
      carbs: 21,
      fiber: 2.2,
      sugar: 1.2,
      fat: 0.1,
      vitaminD: 0,
      magnesium: 25
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '24',
    name: 'Veggies Mix (Frozen)',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 42,
      protein: 2.2,
      carbs: 8,
      fiber: 3.8,
      sugar: 3.2,
      fat: 0.3,
      vitaminD: 0,
      magnesium: 22
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  },
  {
    id: '25',
    name: 'Salad Mix (Fresh)',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 15,
      protein: 1.5,
      carbs: 2.9,
      fiber: 1.9,
      sugar: 1.2,
      fat: 0.2,
      vitaminD: 0,
      magnesium: 15
    },
    userAdded: false,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  }
];