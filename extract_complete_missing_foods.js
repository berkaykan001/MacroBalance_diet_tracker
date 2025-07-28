const fs = require('fs');

// Read defaultFoods.js
const defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Get all line numbers with sodium: 0,
const lines = defaultFoodsContent.split('\n');
const sodiumZeroLines = [];

lines.forEach((line, index) => {
  if (line.trim() === 'sodium: 0,') {
    sodiumZeroLines.push(index);
  }
});

console.log(`Found ${sodiumZeroLines.length} foods with sodium: 0`);

// For each sodium: 0 line, find the corresponding food name by going backwards
const missingFoods = [];

sodiumZeroLines.forEach(lineNum => {
  // Go backwards from sodium: 0 line to find the name
  for (let i = lineNum; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('name: \'')) {
      const nameMatch = line.match(/name: '([^']+)'/);
      if (nameMatch) {
        const foodName = nameMatch[1];
        
        // Check if the next line after sodium: 0 is potassium: 0
        const nextLine = lines[lineNum + 1];
        if (nextLine && nextLine.trim() === 'potassium: 0') {
          missingFoods.push(foodName);
          console.log(`Found missing: ${foodName}`);
        }
      }
      break; // Found name, stop looking backwards
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log(`COMPLETE LIST OF ${missingFoods.length} MISSING FOODS:`);
console.log('='.repeat(80));

missingFoods.forEach((food, index) => {
  console.log(`${index + 1}. ${food}`);
});

// Write to the research file
const researchContent = missingFoods.join('\n');
fs.writeFileSync('/home/berkay_kan001/MacroBalance/food_names_for_nutrition_research.txt', researchContent);

console.log('\n' + '='.repeat(80));
console.log(`✅ ${missingFoods.length} missing foods saved to food_names_for_nutrition_research.txt`);
console.log('Ready for AI nutrition research!');