const fs = require('fs');

// Read parsed nutrition data
const nutritionData = JSON.parse(fs.readFileSync('/home/berkay_kan001/MacroBalance/parsed_nutrition_data.json', 'utf8'));

// Read defaultFoods.js
let defaultFoodsContent = fs.readFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', 'utf8');

// Create comprehensive mapping for remaining foods with special characters and brand names
const specialCharacterMatches = {
  // Pom'Potes products (apostrophe in JSON data)
  "Pom'Potes Pomme Nature": nutritionData["Pom'Potes Pomme Nature"],
  "Pom'Potes Pomme sans Sucres Ajoutés": nutritionData["Pom'Potes Pomme sans Sucres Ajoutés"],
  "Pom'Potes 5 Fruits Tropical": nutritionData["Pom'Potes 5 Fruits Tropical"],
  "Pom'Potes Pomme Fraise": nutritionData["Pom'Potes Pomme Fraise"],
  "Pom'Potes Pomme Poire": nutritionData["Pom'Potes Pomme Poire"],
  "Pom'Potes Pomme Abricot": nutritionData["Pom'Potes Pomme Abricot"],
  
  // Bjorg products with apostrophes
  "Bjorg Flocons d'Avoine Complète": nutritionData["Bjorg Flocons d'Avoine Complète"],
  "Bjorg Son d'Avoine Bio": nutritionData["Bjorg Son d'Avoine Bio"],
  "Bjorg - Flocons d'avoine 4 graines et raisins bio": nutritionData["Bjorg - Flocons d'avoine 4 graines et raisins bio"],
  
  // Menguy's products
  "Menguy's Beurre de Cacahuètes Creamy": nutritionData["Menguy's Beurre de Cacahuètes Creamy"],
  
  // Heinz/Maille products
  "Heinz Moutarde": nutritionData["Heinz Mustard"], // Different name in research data
  "Maille Moutarde à l'Ancienne": nutritionData["Maille Moutarde à l'Ancienne"],
  
  // Cassegrain products
  "Cassegrain Poivrons au Piment d'Espelette": nutritionData["Cassegrain Poivrons au Piment d'Espelette"],
  "Cassegrain Courgettes à la Provençale": nutritionData["Cassegrain Courgettes à la Provençale"],
  "Cassegrain Ratatouille à la Provençale": nutritionData["Cassegrain Ratatouille à la Provençale"],
  
  // Charal products
  "Charal Tartare de Boeuf Façon Brasserie": nutritionData["Charal Tartare de Boeuf Façon Brasserie"],
  "Charal Le Caractère de Boeuf": nutritionData["Charal Le Caractère de Boeuf"],
  "Charal Pavé de Boeuf": nutritionData["Charal Pavé de Boeuf"],
  "Charal Bifteck": nutritionData["Charal Bifteck"],
  "Charal Entrecôte": nutritionData["Charal Entrecôte"],
  "Charal - Entrecôte intensément persillée": nutritionData["Charal - Entrecôte intensément persillée"],
  "Charal - Pavés bœuf marinés échalotes": nutritionData["Charal Pavés Bœuf Marinés Échalotes"],
  "Charal - Pavés boeuf aux 3 poivres": nutritionData["Charal Pavés Bœuf aux 3 Poivres"],
  "Charal - Carpaccio de boeuf basilic": nutritionData["Charal Carpaccio de Bœuf Basilic"],
  "Charal - Carpaccio parmesan au bœuf marinade": nutritionData["Charal Carpaccio Parmesan au Bœuf Marinade"],
  "Charal - Steak haché viande bovine": nutritionData["Charal - Steak haché viande bovine"],
  
  // Harry's products
  "Harry's Pain Céréales et Graines": nutritionData["Harry's Pain Céréales et Graines"],
  "Harry's - Pain de mie céréales et graines": nutritionData["Harry's - Pain de mie céréales et graines"],
  "Harry's - Pain de mie céréales et graines (2nd pack)": nutritionData["Harry's - Pain de mie céréales et graines (2nd pack)"],
  
  // Carrefour products
  "Carrefour Classic' - Fruits rouges surgelés": nutritionData["Carrefour Classic' - Fruits rouges surgelés"],
  "Carrefour Classic' - Jus de citron": nutritionData["Carrefour Classic' - Jus de citron"],
  "Carrefour Classic' - Jus de citron (2nd bottle)": nutritionData["Carrefour Classic' - Jus de citron (2nd bottle)"],
  "Carrefour Bio - Jus d'ananas mangue et fruit de la passion": nutritionData["Carrefour Bio - Jus d'ananas mangue et fruit de la passion"],
  "Dés de fromage épices et aromates CARREFOUR CLASSIC'": nutritionData["Dés de fromage épices et aromates CARREFOUR CLASSIC'"],
  
  // Remaining brand products
  "Knorr - Bouillon cube légumes réduit en sel": nutritionData["Knorr - Bouillon cube légumes réduit en sel"],
  "Knorr - Sauce hollandaise au jus de fruit-citron": nutritionData["Knorr - Sauce hollandaise au jus de fruit-citron"],
  "Knorr - Sauce poivre à la crème fraîche": nutritionData["Knorr - Sauce poivre à la crème fraîche"],
  "Lactel - Lait écrémé UHT vitamine-D": nutritionData["Lactel - Lait écrémé UHT vitamine-D"],
  "Lactel Lait Bio Écrémé": nutritionData["Lactel Lait Bio Écrémé"],
  "Carrefour - Salade mélange gourmand": nutritionData["Carrefour - Salade mélange gourmand"],
  "Carrefour Bio - Pois chiches au sel de noirmoutier": nutritionData["Carrefour Bio - Pois chiches au sel de noirmoutier"],
  "Petits pois extra-fins Bio JARDIN BIO ETIC": nutritionData["Petits pois extra-fins Bio JARDIN BIO ETIC"],
  "Carrefour Bio - Haricots blancs cuisinés": nutritionData["Carrefour Bio - Haricots blancs cuisinés"],
  "Carrefour Bio - Haricots blancs bio à la tomate": nutritionData["Carrefour Bio - Haricots blancs bio à la tomate"],
  "Carrefour Bio - Haricots rouges": nutritionData["Carrefour Bio - Haricots rouges"],
  "Jardin Bio - Maïs doux": nutritionData["Jardin Bio - Maïs doux"],
  "Bjorg - Galettes maïs extra-fines bio": nutritionData["Bjorg - Galettes maïs extra-fines bio"],
  "Bjorg - Galettes riz sésame bio": nutritionData["Bjorg - Galettes riz sésame bio"],
  "Bjorg - Céréales muesli sans sucres ajoutés bio": nutritionData["Bjorg - Céréales muesli sans sucres ajoutés bio"],
  "Carrefour Bio - Quinoa": nutritionData["Carrefour Bio - Quinoa"],
  "Carrefour Bio - Chia seeds": nutritionData["Carrefour Bio - Chia seeds"],
  "Maggi - Fond de veau dégraissé": nutritionData["Maggi - Fond de veau dégraissé"],
  "Maggi - Fond de sauce volaille": nutritionData["Maggi - Fond de sauce volaille"],
  "Carrefour Bio - Ail surgelé": nutritionData["Carrefour Bio - Ail surgelé"],
  "Carrefour Bio - Poêlée de 6 légumes surgelés": nutritionData["Carrefour Bio - Poêlée de 6 légumes surgelés"],
  "Carrefour Bio - Oignons bio émincés surgelé": nutritionData["Carrefour Bio - Oignons bio émincés surgelé"],
  "Elle & Vire Crème Entière De Normandie": nutritionData["Elle & Vire Crème Entière De Normandie"],
  "Carrefour Extra - Persil surgelé": nutritionData["Carrefour Extra - Persil surgelé"],
  "Kikkoman - Sauce teriyaki": nutritionData["Kikkoman - Sauce teriyaki"],
  "Kikkoman - Sauce soja à teneur réduite en sel": nutritionData["Kikkoman - Sauce soja à teneur réduite en sel"],
  "Maggi - Sauce arôme": nutritionData["Maggi - Sauce arôme"],
  "Tipiak - Fine chapelure de pain": nutritionData["Tipiak - Fine chapelure de pain"],
  "Tipiak - Chapelure dorée": nutritionData["Tipiak - Chapelure dorée"],
  "Mon Fournil - Farine de maïs bio": nutritionData["Mon Fournil - Farine de maïs bio"],
  "Carrefour Bio - Jus de fruits bio multifruits": nutritionData["Carrefour Bio - Jus de fruits bio multifruits"],
  "Carrefour Bio - Jus de fruits matin douceur": nutritionData["Carrefour Bio - Jus de fruits matin douceur"],
  "Carrefour Bio - Jus pomme-mangue": nutritionData["Carrefour Bio - Jus pomme-mangue"],
  
  // Fleury Michon products
  "Fleury Michon Filet de Poulet": nutritionData["Fleury Michon Filet de Poulet"],
  "Fleury Michon Blanc de Poulet -25% Sel": nutritionData["Fleury Michon Blanc de Poulet -25% Sel"],
  "Fleury Michon Rôti de Poulet 100% Filet": nutritionData["Fleury Michon Rôti de Poulet 100% Filet"],
  "Fleury Michon Blanc de Dinde Fumé": nutritionData["Fleury Michon Blanc de Dinde Fumé"],
  "Fleury Michon Allumettes de Poulet": nutritionData["Fleury Michon Allumettes de Poulet"],
  "Fleury Michon Pastrami de Boeuf au Poivre": nutritionData["Fleury Michon Pastrami de Boeuf au Poivre"],
  "Fleury Michon Émincés de Poulet Rôti": nutritionData["Fleury Michon Émincés de Poulet Rôti"],
  "Fleury Michon Aiguillettes de Poulet Rôti": nutritionData["Fleury Michon Aiguillettes de Poulet Rôti"],
  "Fleury Michon Rôti de Boeuf": nutritionData["Fleury Michon Rôti de Boeuf"],
  
  // Bjorg products
  "Bjorg Muesli sans Sucres Ajoutés": nutritionData["Bjorg Muesli sans Sucres Ajoutés"],
  "Bjorg Muesli Avoine Chocolat": nutritionData["Bjorg Muesli Avoine Chocolat"],
  "Bjorg Granola Chocolat Noir": nutritionData["Bjorg Granola Chocolat Noir"],
  "Bjorg Muesli Superfruits": nutritionData["Bjorg Muesli Superfruits"],
  "Bjorg Le Croustillant Chocolat Noir & Fruits Rouges": nutritionData["Bjorg Le Croustillant Chocolat Noir & Fruits Rouges"],
  "Bjorg Muesli Protéines": nutritionData["Bjorg Muesli Protéines"],
  "Bjorg Croustillant 3 Noix": nutritionData["Bjorg Croustillant 3 Noix"],
  
  // Barilla products
  "Barilla Sauce Tomate Basilic": nutritionData["Barilla Sauce Tomate Basilic"],
  "Barilla Sauce Bolognaise": nutritionData["Barilla Sauce Bolognaise"],
  "Barilla Pesto Basilic": nutritionData["Barilla Pesto Basilic"],
  "Barilla Sauce Arrabbiata": nutritionData["Barilla Sauce Arrabbiata"]
};

// Update the defaultFoods.js content
let updatedContent = defaultFoodsContent;
let updateCount = 0;

Object.entries(specialCharacterMatches).forEach(([foodName, data]) => {
  if (data) {
    const { potassium_mg, sodium_mg } = data;
    
    // Create a regex that escapes special characters in the food name
    const escapedFoodName = foodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const foodPattern = new RegExp(
      `(name: '${escapedFoodName}',[\\s\\S]*?)sodium: 0,\\s*potassium: 0`,
      'g'
    );
    
    if (defaultFoodsContent.includes(`name: '${foodName}'`)) {
      const previousContent = updatedContent;
      updatedContent = updatedContent.replace(foodPattern, 
        `$1sodium: ${sodium_mg},\n      potassium: ${potassium_mg}`
      );
      
      if (updatedContent !== previousContent) {
        updateCount++;
        console.log(`Updated: ${foodName} -> K:${potassium_mg}mg, Na:${sodium_mg}mg`);
      }
    }
  }
});

// Save the updated file
fs.writeFileSync('/home/berkay_kan001/MacroBalance/src/data/defaultFoods.js', updatedContent);

console.log(`\nUpdated ${updateCount} additional foods with nutrition data`);
console.log('defaultFoods.js has been updated with more sodium and potassium values!');