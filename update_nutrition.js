const fs = require('fs');

// Read parsed nutrition data
const nutritionData = JSON.parse(fs.readFileSync('/home/berkay_kan001/MacroBalance/parsed_nutrition_data.json', 'utf8'));

// Read defaultFoods.js
let defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Create mapping for foods with exact matches
const exactMatches = {
  'Chicken Breast (Skinless)': nutritionData['Chicken Breast (Skinless)'],
  'Whey Protein Powder': nutritionData['Whey Protein Powder'],
  'Eggs (Whole)': nutritionData['Eggs (Whole)'],
  'Greek Yogurt (0% Fat)': nutritionData['Greek Yogurt (0% Fat)'],
  'Salmon (Atlantic)': nutritionData['Salmon (Atlantic)'],
  'Oats (Rolled)': nutritionData['Oats (Rolled)'],
  'White Rice (Cooked)': nutritionData['White Rice (Cooked)'],
  'Sweet Potato': nutritionData['Sweet Potato'],
  'Banana': nutritionData['Banana'],
  'Whole Wheat Bread': nutritionData['Whole Wheat Bread'],
  'Olive Oil': nutritionData['Olive Oil'],
  'Avocado': nutritionData['Avocado'],
  'Almonds': nutritionData['Almonds'],
  'Peanut Butter': nutritionData['Peanut Butter'],
  'Broccoli': nutritionData['Broccoli'],
  'Spinach': nutritionData['Spinach'],
  'Bell Peppers': nutritionData['Bell Peppers'],
  'Cucumber': nutritionData['Cucumber'],
  'Milk (2%)': nutritionData['Milk (2%)'],
  'Cottage Cheese (Low Fat)': nutritionData['Cottage Cheese (Low Fat)'],
  'Pasta (Cooked)': nutritionData['Pasta (Cooked)'],
  'Lean Beef (93/7)': nutritionData['Lean Beef (93/7)'],
  'Potato (Baked)': nutritionData['Potato (Baked)'],
  'Veggies Mix (Frozen)': nutritionData['Veggies Mix (Frozen)'],
  'Salad Mix (Fresh)': nutritionData['Salad Mix (Fresh)'],
  'Mushrooms': nutritionData['Mushrooms'],
  'Carrots': nutritionData['Carrots'],
  'Tomatoes': nutritionData['Tomatoes'],
  'Apple': nutritionData['Apple'],
  'Lemon': nutritionData['Lemon'],
  'Honey': nutritionData['Honey'],
  'Olives': nutritionData['Olives'],
  'Red Wine': nutritionData['Red Wine'],
  'White Wine': nutritionData['White Wine'],
  'Rosé Wine': nutritionData['Rosé Wine'],
  'Beer Blonde': nutritionData['Beer Blonde'],
  'Brown Pasta (Whole Wheat)': nutritionData['Brown Pasta (Whole Wheat)'],
  'Brown Rice (Cooked)': nutritionData['Brown Rice (Cooked)'],
  'Flour (White)': nutritionData['Flour (White)'],
  'Corn Flour': nutritionData['Corn Flour'],
  'Egg Whites': nutritionData['Egg Whites'],
  'Skipjack Tuna': nutritionData['Skipjack Tuna'],
  'St Moret Cheese': nutritionData['St Moret Cheese'],
  'KFC Wings': nutritionData['KFC Wings'],
  'KFC Tenders': nutritionData['KFC Tenders'],
  'St Moret Fromage': nutritionData['St Moret Fromage'],
  'Koska Tahin': nutritionData['Koska Tahin'],
  'Doritos Creamy Guacamole Dip': nutritionData['Doritos Creamy Guacamole Dip']
};

// Add brand-specific foods that are in the research data
const brandMatches = {
  'Charal Steak Haché 5% MG': nutritionData['Charal Steak Haché 5% MG'],
  'Charal Hot Dog Merguez': nutritionData['Charal Hot Dog Merguez'],
  'Charal Sauce Forestière': nutritionData['Charal Sauce Forestière'],
  'Cassegrain Haricots Verts Extra-Fins': nutritionData['Cassegrain Haricots Verts Extra-Fins'],
  'Cassegrain Petits Pois': nutritionData['Cassegrain Petits Pois'],
  'Cassegrain Champignons de Paris à la Crème': nutritionData['Cassegrain Champignons de Paris à la Crème'],
  'Cassegrain Légumes du Soleil et Épeautre': nutritionData['Cassegrain Légumes du Soleil et Épeautre'],
  'Bonduelle Haricots Verts Extra-Fin': nutritionData['Bonduelle Haricots Verts Extra-Fin'],
  'Bonduelle Petits Pois Bio': nutritionData['Bonduelle Petits Pois Bio'],
  'Bonduelle Champignons de Paris': nutritionData['Bonduelle Champignons de Paris'],
  'Bonduelle Maïs': nutritionData['Bonduelle Maïs'],
  'Fleury Michon Jambon Supérieur sans Nitrite': nutritionData['Fleury Michon Jambon Supérieur sans Nitrite'],
  'Fleury Michon Jambon de Dinde': nutritionData['Fleury Michon Jambon de Dinde'],
  'Fleury Michon Saucisse Grillée Purée': nutritionData['Fleury Michon Saucisse Grillée Purée'],
  'Le Gaulois Gésiers de Volaille': nutritionData['Le Gaulois Gésiers de Volaille'],
  'Le Gaulois Filet de Poulet': nutritionData['Le Gaulois Filet de Poulet'],
  'Le Gaulois Cordon Bleu Dinde': nutritionData['Le Gaulois Cordon Bleu Dinde'],
  'Gervita Fromage Blanc Mousse Nature': nutritionData['Gervita Fromage Blanc Mousse Nature'],
  'Myrtilles (Blueberries)': nutritionData['Myrtilles (Blueberries)'],
  'Fraises (Strawberries)': nutritionData['Fraises (Strawberries)'],
  'Mélange de Noix': nutritionData['Mélange de Noix'],
  'Parmesan': nutritionData['Parmesan'],
  'Raclette': nutritionData['Raclette'],
  'Emmental': nutritionData['Emmental'],
  'Heinz Mayonnaise': nutritionData['Heinz Mayonnaise'],
  'Sauce Samouraï': nutritionData['Sauce Samouraï'],
  'Heinz Ketchup': nutritionData['Heinz Ketchup']
};

// Add McDonald's and fast food items
const fastFoodMatches = {
  "McDonald's Big Mac": nutritionData["McDonald's Big Mac"],
  "McDonald's McChicken": nutritionData["McDonald's McChicken"],
  "McDonald's French Fries": nutritionData["McDonald's French Fries"],
  "McDonald's Nuggets": nutritionData["McDonald's Nuggets"],
  "McDonald's Quarter Pounder": nutritionData["McDonald's Quarter Pounder"],
  "Burger King Whopper": nutritionData["Burger King Whopper"],
  "Burger King Onion Rings": nutritionData["Burger King Onion Rings"],
  "Pizza Hut Pepperoni Pizza": nutritionData["Pizza Hut Pepperoni Pizza"],
  "KFC Nutella Muffin": nutritionData["KFC Nutella Muffin"]
};

// Combine all matches
const allMatches = { ...exactMatches, ...brandMatches, ...fastFoodMatches };

// Update the defaultFoods.js content
let updatedContent = defaultFoodsContent;

Object.entries(allMatches).forEach(([foodName, data]) => {
  if (data) {
    const { potassium_mg, sodium_mg } = data;
    
    // Find the pattern for this food and update sodium/potassium values
    const foodPattern = new RegExp(
      `(name: '${foodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
      'g'
    );
    
    updatedContent = updatedContent.replace(foodPattern, 
      `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
    );
  }
});

// Save the updated file
fs.writeFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', updatedContent);

console.log(`Updated nutrition data for ${Object.keys(allMatches).filter(key => allMatches[key]).length} foods`);

// List foods that we still couldn't match
const unmatchedFoods = Object.keys(allMatches).filter(key => !allMatches[key]);
if (unmatchedFoods.length > 0) {
  console.log('Could not find data for:', unmatchedFoods);
}

console.log('defaultFoods.js has been updated with sodium and potassium values!');