const fs = require('fs');

// Read the nutrition data and defaultFoods.js
const finalNutritionData = JSON.parse(fs.readFileSync('/home/berkay_kan001/MacroBalance/food_names_for_nutrition_research.txt', 'utf8'));
let defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Manual mapping to handle character encoding differences
const manualMappings = {
  // Pom'Potes products - JSON has ' but JS file has \'
  "Pom'Potes Pomme Nature": { find: "Pom\\'Potes Pomme Nature", data: finalNutritionData["Pom'Potes Pomme Nature"] },
  "Pom'Potes Pomme sans Sucres Ajoutés": { find: "Pom\\'Potes Pomme sans Sucres Ajoutés", data: finalNutritionData["Pom'Potes Pomme sans Sucres Ajoutés"] },
  "Pom'Potes 5 Fruits Tropical": { find: "Pom\\'Potes 5 Fruits Tropical", data: finalNutritionData["Pom'Potes 5 Fruits Tropical"] },
  "Pom'Potes Pomme Fraise": { find: "Pom\\'Potes Pomme Fraise", data: finalNutritionData["Pom'Potes Pomme Fraise"] },
  "Pom'Potes Pomme Poire": { find: "Pom\\'Potes Pomme Poire", data: finalNutritionData["Pom'Potes Pomme Poire"] },
  "Pom'Potes Pomme Abricot": { find: "Pom\\'Potes Pomme Abricot", data: finalNutritionData["Pom'Potes Pomme Abricot"] },
  
  // Bjorg products with d'
  "Bjorg Flocons d'Avoine Complète": { find: "Bjorg Flocons d\\'Avoine Complète", data: finalNutritionData["Bjorg Flocons d'Avoine Complète"] },
  "Bjorg Son d'Avoine Bio": { find: "Bjorg Son d\\'Avoine Bio", data: finalNutritionData["Bjorg Son d'Avoine Bio"] },
  "Bjorg - Flocons d'avoine 4 graines et raisins bio": { find: "Bjorg - Flocons d\\'avoine 4 graines et raisins bio", data: finalNutritionData["Bjorg - Flocons d'avoine 4 graines et raisins bio"] },
  
  // Other products with apostrophes
  "Menguy's Beurre de Cacahuètes Creamy": { find: "Menguy\\'s Beurre de Cacahuètes Creamy", data: finalNutritionData["Menguy's Beurre de Cacahuètes Creamy"] },
  "Maille Moutarde à l'Ancienne": { find: "Maille Moutarde à l\\'Ancienne", data: finalNutritionData["Maille Moutarde à l'Ancienne"] },
  "Cassegrain Poivrons au Piment d'Espelette": { find: "Cassegrain Poivrons au Piment d\\'Espelette", data: finalNutritionData["Cassegrain Poivrons au Piment d'Espelette"] },
  
  // Harry's products
  "Harry's Pain Céréales et Graines": { find: "Harry\\'s Pain Céréales et Graines", data: finalNutritionData["Harry's Pain Céréales et Graines"] },
  "Harry's - Pain de mie céréales et graines": { find: "Harry\\'s - Pain de mie céréales et graines", data: finalNutritionData["Harry's - Pain de mie céréales et graines"] },
  "Harry's - Pain de mie céréales et graines (2nd pack)": { find: "Harry\\'s - Pain de mie céréales et graines (2nd pack)", data: finalNutritionData["Harry's - Pain de mie céréales et graines (2nd pack)"] },
  
  // McDonald's products
  "McDonald's Big Mac": { find: "McDonald\\'s Big Mac", data: finalNutritionData["McDonald's Big Mac"] },
  "McDonald's McChicken": { find: "McDonald\\'s McChicken", data: finalNutritionData["McDonald's McChicken"] },
  "McDonald's French Fries": { find: "McDonald\\'s French Fries", data: finalNutritionData["McDonald's French Fries"] },
  "McDonald's Nuggets": { find: "McDonald\\'s Nuggets", data: finalNutritionData["McDonald's Nuggets"] },
  "McDonald's Quarter Pounder": { find: "McDonald\\'s Quarter Pounder", data: finalNutritionData["McDonald's Quarter Pounder"] },
  
  // Carrefour products with '
  "Carrefour Classic' - Fruits rouges surgelés": { find: "Carrefour Classic\\' - Fruits rouges surgelés", data: finalNutritionData["Carrefour Classic' - Fruits rouges surgelés"] },
  "Carrefour Classic' - Jus de citron": { find: "Carrefour Classic\\' - Jus de citron", data: finalNutritionData["Carrefour Classic' - Jus de citron"] },
  "Carrefour Classic' - Jus de citron (2nd bottle)": { find: "Carrefour Classic\\' - Jus de citron (2nd bottle)", data: finalNutritionData["Carrefour Classic' - Jus de citron (2nd bottle)"] },
  "Carrefour Bio - Jus d'ananas mangue et fruit de la passion": { find: "Carrefour Bio - Jus d\\'ananas mangue et fruit de la passion", data: finalNutritionData["Carrefour Bio - Jus d'ananas mangue et fruit de la passion"] },
  
  // Dés de fromage with '
  "Dés de fromage épices et aromates CARREFOUR CLASSIC'": { find: "Dés de fromage épices et aromates CARREFOUR CLASSIC\\'", data: finalNutritionData["Dés de fromage épices et aromates CARREFOUR CLASSIC'"] }
};

let updateCount = 0;
let updatedContent = defaultFoodsContent;

console.log(`Processing ${Object.keys(manualMappings).length} foods with special characters...`);
console.log('='.repeat(80));

Object.entries(manualMappings).forEach(([originalName, mapping]) => {
  const { find, data } = mapping;
  
  if (data) {
    const { potassium_mg, sodium_mg } = data;
    
    // Create pattern to find this food and update its sodium/potassium
    const pattern = new RegExp(
      `(name: '${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
      'g'
    );
    
    const previousContent = updatedContent;
    updatedContent = updatedContent.replace(pattern, 
      `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
    );
    
    if (updatedContent !== previousContent) {
      updateCount++;
      console.log(`✅ ${updateCount}. ${originalName}`);
      console.log(`    -> K:${potassium_mg}mg, Na:${sodium_mg}mg`);
    } else {
      console.log(`❌ Failed: ${originalName}`);
    }
  } else {
    console.log(`❌ No data: ${originalName}`);
  }
});

// Save the updated file
fs.writeFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', updatedContent);

// Check final status
const remainingZeros = (updatedContent.match(/sodium: 0,/g) || []).length;

console.log('\n' + '='.repeat(80));
console.log(`🎉 MANUAL UPDATE COMPLETE!`);
console.log(`✅ Successfully updated: ${updateCount} foods`);
console.log(`⚠️  Remaining with sodium: 0: ${remainingZeros}`);
console.log('='.repeat(80));

if (remainingZeros === 0) {
  console.log('🏆 ALL FOODS NOW HAVE COMPLETE SODIUM AND POTASSIUM DATA!');
  console.log('🎯 100% COMPLETION ACHIEVED!');
} else {
  console.log(`📝 ${remainingZeros} foods still need review`);
}

console.log('\ndefaultFoods.js has been updated with all final nutrition values!');