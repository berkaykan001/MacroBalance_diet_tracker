const fs = require('fs');

// Read defaultFoods.js
const defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Use regex to find all foods with sodium: 0, potassium: 0
const foodBlocks = defaultFoodsContent.split(/(?=\s+{)/);
const missingFoods = [];

foodBlocks.forEach(block => {
  // Check if this block contains sodium: 0, and potassium: 0
  if (block.includes('sodium: 0,') && block.includes('potassium: 0')) {
    // Extract the food name
    const nameMatch = block.match(/name: '([^']+)'/);
    if (nameMatch) {
      const foodName = nameMatch[1];
      missingFoods.push(foodName);
    }
  }
});

// Remove duplicates and sort
const uniqueMissingFoods = [...new Set(missingFoods)].sort();

console.log(`Found ${uniqueMissingFoods.length} foods still missing sodium/potassium data:`);
console.log('='.repeat(80));

uniqueMissingFoods.forEach((food, index) => {
  console.log(`${index + 1}. ${food}`);
});

// Write to the research file with proper formatting
const researchContent = uniqueMissingFoods.join('\n');
fs.writeFileSync('/home/berkay_kan001/MacroBalance/food_names_for_nutrition_research.txt', researchContent);

console.log('\n' + '='.repeat(80));
console.log(`${uniqueMissingFoods.length} missing foods saved to food_names_for_nutrition_research.txt`);
console.log('Ready for AI nutrition research!');