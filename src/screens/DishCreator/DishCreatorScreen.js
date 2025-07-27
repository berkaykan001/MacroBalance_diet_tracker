import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, Alert, Pressable, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFood } from '../../context/FoodContext';
import { CalculationService } from '../../services/calculationService';

export default function DishCreatorScreen({ navigation, route }) {
  const { foods, filteredFoods, searchFoods, createDish, updateFood } = useFood();
  
  // Check if we're editing an existing dish
  const editingDish = route?.params?.editingDish;
  const isEditing = !!editingDish;
  
  const [dishName, setDishName] = useState(editingDish?.name || '');
  const [ingredients, setIngredients] = useState(editingDish?.ingredients || []);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');

  const handleFoodSearch = (query) => {
    setFoodSearchQuery(query);
    searchFoods(query);
  };

  const getAvailableFoods = () => {
    if (foodSearchQuery) {
      return filteredFoods.filter(food => !food.isDish); // Exclude dishes from ingredients
    } else {
      return foods.filter(food => !food.isDish).slice(0, 20); // Show first 20 foods
    }
  };

  const addIngredient = (food) => {
    const exists = ingredients.find(ing => ing.foodId === food.id);
    if (!exists) {
      setIngredients([...ingredients, { foodId: food.id, grams: 100 }]);
    }
    setShowFoodSelector(false);
    setFoodSearchQuery('');
    searchFoods('');
  };

  const removeIngredient = (foodId) => {
    setIngredients(ingredients.filter(ing => ing.foodId !== foodId));
  };

  const updateIngredientPortion = (foodId, grams) => {
    setIngredients(ingredients.map(ing => 
      ing.foodId === foodId ? { ...ing, grams: Math.max(0, Math.round(grams * 10) / 10) } : ing
    ));
  };

  const getFoodById = (id) => {
    return foods.find(food => food.id === id);
  };

  const calculateDishSummary = () => {
    if (ingredients.length === 0) {
      return {
        totalGrams: 0,
        nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
      };
    }

    const totalGrams = ingredients.reduce((sum, ing) => sum + ing.grams, 0);
    const dishNutrition = CalculationService.calculateDishNutrition(ingredients, foods);
    const nutritionPer100g = CalculationService.convertToNutritionPer100g(dishNutrition, totalGrams);

    return { totalGrams, nutritionPer100g };
  };

  const handleSaveDish = () => {
    if (!dishName.trim()) {
      Alert.alert('Error', 'Please enter a dish name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    if (isEditing) {
      // Update existing dish
      const dishSummary = calculateDishSummary();
      const updatedDish = {
        ...editingDish,
        name: dishName.trim(),
        ingredients: ingredients,
        totalGrams: dishSummary.totalGrams,
        nutritionPer100g: dishSummary.nutritionPer100g,
        lastUsed: new Date().toISOString()
      };
      updateFood(updatedDish);
    } else {
      // Create new dish
      createDish(dishName.trim(), ingredients);
    }
    
    // Navigate back immediately after saving
    navigation.goBack();
  };

  const dishSummary = calculateDishSummary();

  const renderIngredient = ({ item }) => {
    const food = getFoodById(item.foodId);
    if (!food) return null;

    const macros = CalculationService.calculateMacrosForPortion(food, item.grams);

    return (
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.ingredientItem}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientInfo}>
            <Text style={styles.ingredientName}>{food.name}</Text>
            <Text style={styles.ingredientCategory}>{food.category}</Text>
          </View>
          <Pressable 
            style={styles.removeButton}
            onPressIn={() => Keyboard.dismiss()}
            onPress={() => removeIngredient(item.foodId)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.ingredientControls}>
          <View style={styles.portionInputContainer}>
            <TextInput
              style={styles.portionInput}
              value={item.grams.toString()}
              onChangeText={(text) => {
                const grams = parseInt(text) || 0;
                updateIngredientPortion(item.foodId, grams);
              }}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <Text style={styles.portionUnit}>g</Text>
          </View>
          
          <View style={styles.ingredientMacros}>
            <Text style={styles.macroText}>{Math.round(macros.calories)} cal</Text>
            <Text style={styles.macroText}>{Math.round(macros.protein)}p</Text>
            <Text style={styles.macroText}>{Math.round(macros.carbs)}c</Text>
            <Text style={styles.macroText}>{Math.round(macros.fat)}f</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderAvailableFood = ({ item }) => (
    <Pressable 
      style={styles.foodSelectorItem}
      onPressIn={() => Keyboard.dismiss()}
      onPress={() => addIngredient(item)}
    >
      <Text style={styles.foodSelectorName}>{item.name}</Text>
      <Text style={styles.foodSelectorCategory}>{item.category}</Text>
    </Pressable>
  );

  return (
    <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPressIn={() => Keyboard.dismiss()}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{isEditing ? 'Edit Dish' : 'Create Dish'}</Text>
          <Pressable 
            style={styles.saveButton}
            onPressIn={() => Keyboard.dismiss()}
            onPress={() => handleSaveDish()}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
          {/* Dish Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dish Name</Text>
            <TextInput
              style={styles.dishNameInput}
              value={dishName}
              onChangeText={setDishName}
              placeholder="Enter dish name (e.g., 'My Chicken Rice Bowl')"
              placeholderTextColor="#8E8E93"
            />
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients ({ingredients.length})</Text>
              <Pressable 
                style={styles.addIngredientButton}
                onPressIn={() => Keyboard.dismiss()}
                onPress={() => setShowFoodSelector(!showFoodSelector)}
              >
                <Text style={styles.addIngredientText}>
                  {showFoodSelector ? '✕ Hide' : '+ Add'}
                </Text>
              </Pressable>
            </View>

            {showFoodSelector && (
              <View style={styles.foodSelector}>
                <TextInput
                  style={styles.foodSearchInput}
                  value={foodSearchQuery}
                  onChangeText={handleFoodSearch}
                  placeholder="Search foods to add..."
                  placeholderTextColor="#8E8E93"
                />
                <FlatList
                  data={getAvailableFoods()}
                  renderItem={renderAvailableFood}
                  keyExtractor={(item) => item.id}
                  style={styles.foodSelectorList}
                  scrollEnabled={false}
                  numColumns={2}
                  columnWrapperStyle={styles.foodSelectorRow}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <Text style={styles.noFoodsText}>
                      {foodSearchQuery ? 'No foods found' : 'Search to add ingredients'}
                    </Text>
                  }
                />
              </View>
            )}

            <FlatList
              data={ingredients}
              renderItem={renderIngredient}
              keyExtractor={(item) => item.foodId}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyIngredients}>
                  <Text style={styles.emptyIngredientsIcon}>🥄</Text>
                  <Text style={styles.emptyIngredientsText}>No ingredients added yet</Text>
                  <Text style={styles.emptyIngredientsSubtext}>Tap "Add" to add ingredients</Text>
                </View>
              }
            />
          </View>

          {/* Dish Summary */}
          {ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dish Summary</Text>
              <LinearGradient
                colors={['#1A1A1A', '#2A2A2A']}
                style={styles.summaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Weight:</Text>
                  <Text style={styles.summaryValue}>{dishSummary.totalGrams}g</Text>
                </View>
                
                <Text style={styles.nutritionTitle}>Nutrition per 100g:</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(dishSummary.nutritionPer100g.calories)}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(dishSummary.nutritionPer100g.protein)}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(dishSummary.nutritionPer100g.carbs)}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(dishSummary.nutritionPer100g.fat)}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Complete Macro Display */}
          {ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Complete Nutrition Profile (per 100g)</Text>
              <LinearGradient
                colors={['#1A1A1A', '#2A2A2A']}
                style={styles.macroDisplayCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Basic Macros */}
                <View style={styles.macroSection}>
                  <Text style={styles.macroSectionTitle}>Macronutrients</Text>
                  <View style={styles.macroGrid}>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Calories</Text>
                      <Text style={styles.macroValue}>{Math.round(dishSummary.nutritionPer100g.calories)}</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{Math.round(dishSummary.nutritionPer100g.protein * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Carbohydrates</Text>
                      <Text style={styles.macroValue}>{Math.round(dishSummary.nutritionPer100g.carbs * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Total Fat</Text>
                      <Text style={styles.macroValue}>{Math.round(dishSummary.nutritionPer100g.fat * 10) / 10}g</Text>
                    </View>
                  </View>
                </View>

                {/* Detailed Carbs */}
                <View style={styles.macroSection}>
                  <Text style={styles.macroSectionTitle}>Carbohydrate Details</Text>
                  <View style={styles.macroGrid}>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Fiber</Text>
                      <Text style={styles.macroValue}>{Math.round(dishSummary.nutritionPer100g.fiber * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Total Sugar</Text>
                      <Text style={styles.macroValue}>{Math.round(dishSummary.nutritionPer100g.sugar * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Natural Sugars</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.naturalSugars || 0) * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Added Sugars</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.addedSugars || 0) * 10) / 10}g</Text>
                    </View>
                  </View>
                </View>

                {/* Detailed Fats */}
                <View style={styles.macroSection}>
                  <Text style={styles.macroSectionTitle}>Fat Details</Text>
                  <View style={styles.macroGrid}>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Saturated Fat</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.saturatedFat || 0) * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Monounsaturated Fat</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.monounsaturatedFat || 0) * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Polyunsaturated Fat</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.polyunsaturatedFat || 0) * 10) / 10}g</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Omega-3</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.omega3 || 0) * 100) / 100}g</Text>
                    </View>
                  </View>
                </View>

                {/* Micronutrients */}
                <View style={styles.macroSection}>
                  <Text style={styles.macroSectionTitle}>Minerals & Vitamins</Text>
                  <View style={styles.macroGrid}>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Sodium</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.sodium || 0))}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Potassium</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.potassium || 0))}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Magnesium</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.magnesium || 0))}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Iron</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.iron || 0) * 10) / 10}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Calcium</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.calcium || 0))}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Zinc</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.zinc || 0) * 10) / 10}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Vitamin D</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.vitaminD || 0) * 10) / 10}μg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Vitamin B6</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.vitaminB6 || 0) * 100) / 100}mg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Vitamin B12</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.vitaminB12 || 0) * 100) / 100}μg</Text>
                    </View>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Vitamin C</Text>
                      <Text style={styles.macroValue}>{Math.round((dishSummary.nutritionPer100g.vitaminC || 0) * 10) / 10}mg</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  // Dish Name
  dishNameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Add Ingredient Button
  addIngredientButton: {
    backgroundColor: 'rgba(52,199,89,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  addIngredientText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },

  // Food Selector
  foodSelector: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  foodSearchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  foodSelectorList: {
    maxHeight: 200,
  },
  foodSelectorRow: {
    justifyContent: 'space-between',
  },
  foodSelectorItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    width: '48%',
  },
  foodSelectorName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  foodSelectorCategory: {
    color: '#8E8E93',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  noFoodsText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // Ingredients List
  ingredientItem: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  ingredientCategory: {
    color: '#8E8E93',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ingredientControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  portionInput: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  portionUnit: {
    color: '#8E8E93',
    fontSize: 10,
    marginLeft: 2,
  },
  ingredientMacros: {
    flexDirection: 'row',
    gap: 8,
  },
  macroText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '600',
  },

  // Empty State
  emptyIngredients: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIngredientsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyIngredientsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyIngredientsSubtext: {
    color: '#8E8E93',
    fontSize: 12,
  },

  // Summary
  summaryCard: {
    borderRadius: 8,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  nutritionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    color: '#00D084',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  nutritionLabel: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '500',
  },

  bottomSpacer: {
    height: 20,
  },

  // Macro Display Styles
  macroDisplayCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  macroSection: {
    marginBottom: 16,
  },
  macroSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 4,
  },
  macroGrid: {
    gap: 6,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  macroLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  macroValue: {
    color: '#BBB',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 60,
  },
});