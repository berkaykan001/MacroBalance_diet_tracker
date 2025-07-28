const fs = require('fs');

// Read defaultFoods.js
const defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Find all foods that still have sodium: 0, potassium: 0
const missingFoods = [];
const lines = defaultFoodsContent.split('\n');

let currentFood = null;
let hasZeroSodium = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Find food name
  if (line.startsWith('name: \'')) {
    currentFood = line.match(/name: '([^']+)'/);
    if (currentFood) {
      currentFood = currentFood[1];
    }
    hasZeroSodium = false;
  }
  
  // Check for sodium: 0,
  if (line === 'sodium: 0,') {
    hasZeroSodium = true;
  }
  
  // Check for potassium: 0 (end of nutrition data)
  if (line === 'potassium: 0' && hasZeroSodium && currentFood) {
    missingFoods.push(currentFood);
    currentFood = null;
    hasZeroSodium = false;
  }
}

console.log(`Found ${missingFoods.length} foods still missing sodium/potassium data:`);
console.log('='.repeat(60));

missingFoods.forEach((food, index) => {
  console.log(`${index + 1}. ${food}`);
});

// Write to the research file
const researchContent = missingFoods.join('\n');
fs.writeFileSync('/home/berkay_kan001/MacroBalance/food_names_for_nutrition_research.txt', researchContent);

console.log('\n' + '='.repeat(60));
console.log(`Missing foods list saved to food_names_for_nutrition_research.txt`);
console.log(`Ready for AI nutrition research!`);