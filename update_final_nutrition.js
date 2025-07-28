const fs = require('fs');

// Read the final nutrition data
const finalNutritionData = JSON.parse(fs.readFileSync('/home/berkay_kan001/MacroBalance/food_names_for_nutrition_research.txt', 'utf8'));

// Read defaultFoods.js
let defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

console.log(`Found nutrition data for ${Object.keys(finalNutritionData).length} foods`);

let updateCount = 0;
let updatedContent = defaultFoodsContent;

// Update each food with its nutrition data
Object.entries(finalNutritionData).forEach(([foodName, data]) => {
  const { potassium_mg, sodium_mg } = data;
  
  // Handle foods with apostrophes - they appear as escaped in the JS file
  const escapedName = foodName.replace(/'/g, "\\'");
  
  // Create regex pattern to find this specific food's sodium: 0, potassium: 0
  const pattern = new RegExp(
    `(name: '${escapedName}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
    'g'
  );
  
  const previousContent = updatedContent;
  updatedContent = updatedContent.replace(pattern, 
    `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
  );
  
  if (updatedContent !== previousContent) {
    updateCount++;
    console.log(`✅ ${updateCount}. ${foodName} -> K:${potassium_mg}mg, Na:${sodium_mg}mg`);
  } else {
    // Try with unescaped name as fallback
    const pattern2 = new RegExp(
      `(name: '${foodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
      'g'
    );
    
    updatedContent = updatedContent.replace(pattern2, 
      `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
    );
    
    if (updatedContent !== previousContent) {
      updateCount++;
      console.log(`✅ ${updateCount}. ${foodName} -> K:${potassium_mg}mg, Na:${sodium_mg}mg (fallback)`);
    } else {
      console.log(`❌ Failed to update: ${foodName}`);
    }
  }
});

// Save the updated file
fs.writeFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', updatedContent);

// Check final status
const remainingZeros = (updatedContent.match(/sodium: 0,/g) || []).length;

console.log('\n' + '='.repeat(80));
console.log(`🎉 FINAL UPDATE COMPLETE!`);
console.log(`✅ Successfully updated: ${updateCount} foods`);
console.log(`⚠️  Remaining with sodium: 0: ${remainingZeros}`);
console.log('='.repeat(80));

if (remainingZeros === 0) {
  console.log('🏆 ALL FOODS NOW HAVE COMPLETE SODIUM AND POTASSIUM DATA!');
} else {
  console.log(`📝 ${remainingZeros} foods still need manual review`);
}

console.log('\ndefaultFoods.js has been updated with the final nutrition values!');