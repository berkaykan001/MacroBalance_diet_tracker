const fs = require('fs');

// Read parsed nutrition data
const nutritionData = JSON.parse(fs.readFileSync('/home/berkay_kan001/MacroBalance/parsed_nutrition_data.json', 'utf8'));

// Read defaultFoods.js
let defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Create final mapping with proper apostrophe handling
const finalMatches = {
  // Handle apostrophe differences - JS file uses \' but JSON uses '
  "Pom'Potes Pomme Nature": nutritionData["Pom'Potes Pomme Nature"],
  "Pom'Potes Pomme sans Sucres Ajoutés": nutritionData["Pom'Potes Pomme sans Sucres Ajoutés"],
  "Pom'Potes 5 Fruits Tropical": nutritionData["Pom'Potes 5 Fruits Tropical"],
  "Pom'Potes Pomme Fraise": nutritionData["Pom'Potes Pomme Fraise"],
  "Pom'Potes Pomme Poire": nutritionData["Pom'Potes Pomme Poire"],
  "Pom'Potes Pomme Abricot": nutritionData["Pom'Potes Pomme Abricot"],
  "Bjorg Flocons d'Avoine Complète": nutritionData["Bjorg Flocons d'Avoine Complète"],
  "Bjorg Son d'Avoine Bio": nutritionData["Bjorg Son d'Avoine Bio"],
  "Menguy's Beurre de Cacahuètes Creamy": nutritionData["Menguy's Beurre de Cacahuètes Creamy"],
  "Maille Moutarde à l'Ancienne": nutritionData["Maille Moutarde à l'Ancienne"],
  "Cassegrain Poivrons au Piment d'Espelette": nutritionData["Cassegrain Poivrons au Piment d'Espelette"],
  "Charal Tartare de Boeuf Façon Brasserie": nutritionData["Charal Tartare de Boeuf Façon Brasserie"],
  "Charal Le Caractère de Boeuf": nutritionData["Charal Le Caractère de Boeuf"],
  "Charal Pavé de Boeuf": nutritionData["Charal Pavé de Boeuf"],
  "Harry's Pain Céréales et Graines": nutritionData["Harry's Pain Céréales et Graines"],
  "Carrefour Classic' - Fruits rouges surgelés": nutritionData["Carrefour Classic' - Fruits rouges surgelés"],
  "Carrefour Classic' - Jus de citron": nutritionData["Carrefour Classic' - Jus de citron"],
  "Carrefour Classic' - Jus de citron (2nd bottle)": nutritionData["Carrefour Classic' - Jus de citron (2nd bottle)"],
  "Harry's - Pain de mie céréales et graines": nutritionData["Harry's - Pain de mie céréales et graines"],
  "Harry's - Pain de mie céréales et graines (2nd pack)": nutritionData["Harry's - Pain de mie céréales et graines (2nd pack)"],
  "Carrefour Bio - Jus d'ananas mangue et fruit de la passion": nutritionData["Carrefour Bio - Jus d'ananas mangue et fruit de la passion"],
  "Dés de fromage épices et aromates CARREFOUR CLASSIC'": nutritionData["Dés de fromage épices et aromates CARREFOUR CLASSIC'"]
};

// Update the defaultFoods.js content with special apostrophe handling
let updatedContent = defaultFoodsContent;
let updateCount = 0;

Object.entries(finalMatches).forEach(([foodName, data]) => {
  if (data) {
    const { potassium_mg, sodium_mg } = data;
    
    // Handle both regular apostrophes and escaped apostrophes
    const escapedName = foodName.replace(/'/g, "\\'");
    
    // Look for the pattern with escaped apostrophes as it appears in the JS file
    const pattern1 = new RegExp(
      `(name: '${escapedName}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
      'g'
    );
    
    // Also try with regular apostrophes just in case
    const pattern2 = new RegExp(
      `(name: '${foodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
      'g'
    );
    
    const previousContent = updatedContent;
    
    // Try both patterns
    updatedContent = updatedContent.replace(pattern1, 
      `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
    );
    
    if (updatedContent === previousContent) {
      updatedContent = updatedContent.replace(pattern2, 
        `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
      );
    }
    
    if (updatedContent !== previousContent) {
      updateCount++;
      console.log(`Updated: ${foodName} -> K:${potassium_mg}mg, Na:${sodium_mg}mg`);
    }
  }
});

// Save the updated file
fs.writeFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', updatedContent);

console.log(`\nFinal update: ${updateCount} more foods updated with nutrition data`);

// Check how many still need data
const remainingZeros = (updatedContent.match(/sodium: 0,/g) || []).length;
console.log(`Remaining foods with sodium: 0: ${remainingZeros}`);
console.log('Final nutrition data update complete!');