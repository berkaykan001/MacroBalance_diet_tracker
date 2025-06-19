import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useFood } from '../../context/FoodContext';
import { useMeal } from '../../context/MealContext';
import { CalculationService } from '../../services/calculationService';

export default function MealPlanningScreen() {
  const { foods, filteredFoods } = useFood();
  const { meals } = useMeal();
  
  const [selectedMeal, setSelectedMeal] = useState(meals[0]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showFoodList, setShowFoodList] = useState(false);

  const addFood = (food) => {
    const exists = selectedFoods.find(sf => sf.foodId === food.id);
    if (!exists) {
      setSelectedFoods([...selectedFoods, { foodId: food.id, portionGrams: 100 }]);
    }
    setShowFoodList(false);
  };

  const removeFood = (foodId) => {
    setSelectedFoods(selectedFoods.filter(sf => sf.foodId !== foodId));
  };

  const updatePortion = (foodId, newPortion) => {
    const optimized = CalculationService.optimizePortions(
      selectedFoods, 
      foods, 
      selectedMeal?.macroTargets || {}, 
      foodId, 
      newPortion
    );
    setSelectedFoods(optimized);
  };

  const currentMacros = selectedFoods.length > 0 
    ? CalculationService.calculateTotalMacros(selectedFoods, foods)
    : { protein: 0, carbs: 0, fat: 0, calories: 0, fiber: 0, sugar: 0 };

  const progress = selectedMeal 
    ? CalculationService.calculateMacroProgress(currentMacros, selectedMeal.macroTargets)
    : null;

  const renderFoodItem = ({ item }) => {
    const food = foods.find(f => f.id === item.foodId);
    if (!food) return null;

    return (
      <View style={styles.selectedFood}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{food.name}</Text>
          <TouchableOpacity onPress={() => removeFood(food.id)}>
            <Text style={styles.removeButton}>×</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.portionRow}>
          <Text style={styles.portionLabel}>Portion: {item.portionGrams}g</Text>
          <View style={styles.portionButtons}>
            <TouchableOpacity 
              style={styles.portionButton}
              onPress={() => updatePortion(food.id, Math.max(10, item.portionGrams - 10))}
            >
              <Text style={styles.portionButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.portionButton}
              onPress={() => updatePortion(food.id, item.portionGrams + 10)}
            >
              <Text style={styles.portionButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderAvailableFood = ({ item }) => (
    <TouchableOpacity style={styles.availableFood} onPress={() => addFood(item)}>
      <Text style={styles.availableFoodName}>{item.name}</Text>
      <Text style={styles.availableFoodCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan Your Meal</Text>
        
        {selectedMeal && (
          <View style={styles.targetCard}>
            <Text style={styles.mealName}>{selectedMeal.name} Targets</Text>
            <View style={styles.targetRow}>
              <Text style={styles.targetText}>Protein: {selectedMeal.macroTargets.protein}g</Text>
              <Text style={styles.targetText}>Carbs: {selectedMeal.macroTargets.carbs}g</Text>
              <Text style={styles.targetText}>Fat: {selectedMeal.macroTargets.fat}g</Text>
            </View>
          </View>
        )}
      </View>

      {progress && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Current Progress</Text>
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={[styles.macroValue, {color: progress.protein.status === 'met' ? '#00D084' : '#FF453A'}]}>
                {currentMacros.protein}g ({progress.protein.percentage}%)
              </Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={[styles.macroValue, {color: progress.carbs.status === 'met' ? '#00D084' : '#FF453A'}]}>
                {currentMacros.carbs}g ({progress.carbs.percentage}%)
              </Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={[styles.macroValue, {color: progress.fat.status === 'met' ? '#00D084' : '#FF453A'}]}>
                {currentMacros.fat}g ({progress.fat.percentage}%)
              </Text>
            </View>
          </View>
          <Text style={styles.caloriesText}>Total Calories: {currentMacros.calories}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addFoodButton}
        onPress={() => setShowFoodList(!showFoodList)}
      >
        <Text style={styles.addFoodButtonText}>
          {showFoodList ? 'Hide Foods' : 'Add Foods'}
        </Text>
      </TouchableOpacity>

      {showFoodList && (
        <View style={styles.foodList}>
          <FlatList
            data={filteredFoods.slice(0, 10)}
            renderItem={renderAvailableFood}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.selectedFoodsContainer}>
        <Text style={styles.sectionTitle}>Selected Foods</Text>
        {selectedFoods.length === 0 ? (
          <Text style={styles.emptyText}>No foods selected. Add foods to start planning!</Text>
        ) : (
          <FlatList
            data={selectedFoods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.foodId}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  targetCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  progressCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  caloriesText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  addFoodButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addFoodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  foodList: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  availableFood: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  availableFoodName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  availableFoodCategory: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  selectedFoodsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedFood: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    color: '#FF453A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  portionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portionLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  portionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  portionButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});