const fs = require('fs');

// Read the research data
const data = fs.readFileSync('/home/berkay_kan001/MacroBalance/food_names_for_nutrition_research.txt', 'utf8');

// Split by JSON objects and parse each one
const jsonBlocks = data.split('\n\n').filter(block => block.trim().startsWith('{'));
const nutritionData = {};

jsonBlocks.forEach(block => {
  try {
    const parsed = JSON.parse(block.trim());
    // Merge data, latest values override previous ones
    Object.assign(nutritionData, parsed);
  } catch (e) {
    console.error('Error parsing JSON block:', e.message);
  }
});

console.log('Parsed nutrition data for', Object.keys(nutritionData).length, 'foods');

// Read defaultFoods.js to get the current food list
const defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Extract food names from defaultFoods.js
const foodMatches = defaultFoodsContent.match(/name: '([^']+)'/g);
const currentFoods = foodMatches.map(match => match.replace("name: '", '').replace("'", ''));

console.log('Found', currentFoods.length, 'foods in defaultFoods.js');

// Check for missing foods
const missingFoods = [];
const foundFoods = [];

currentFoods.forEach(food => {
  if (nutritionData[food]) {
    foundFoods.push(food);
  } else {
    missingFoods.push(food);
  }
});

console.log('Matched nutrition data for', foundFoods.length, 'foods');
if (missingFoods.length > 0) {
  console.log('Missing nutrition data for', missingFoods.length, 'foods:');
  missingFoods.forEach(food => console.log('-', food));
}

// Output the mapping for verification
console.log('\nFood nutrition mapping:');
foundFoods.slice(0, 5).forEach(food => {
  const data = nutritionData[food];
  console.log(`${food}: K=${data.potassium_mg}mg, Na=${data.sodium_mg}mg`);
});

// Save the parsed data as JSON for easy access
fs.writeFileSync('/home/berkay_kan001/MacroBalance/parsed_nutrition_data.json', 
  JSON.stringify(nutritionData, null, 2));

console.log('\nParsed data saved to parsed_nutrition_data.json');