import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useFood } from '../../context/FoodContext';
import { useMeal } from '../../context/MealContext';
import { CalculationService } from '../../services/calculationService';

const { width } = Dimensions.get('window');

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
    const updatedFoods = selectedFoods.map(food => 
      food.foodId === foodId ? { ...food, portionGrams: Math.round(newPortion) } : food
    );
    setSelectedFoods(updatedFoods);
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

    const macros = CalculationService.calculateMacrosForPortion(food, item.portionGrams);

    return (
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.selectedFood}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.foodHeader}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCategory}>{food.category}</Text>
          </View>
          <TouchableOpacity onPress={() => removeFood(food.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.macroDisplay}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{macros.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{macros.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{macros.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{macros.calories}</Text>
            <Text style={styles.macroLabel}>Cal</Text>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.portionLabel}>{item.portionGrams}g</Text>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={500}
            value={item.portionGrams}
            onValueChange={(value) => updatePortion(food.id, value)}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#3A3A3A"
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
            step={5}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>10g</Text>
            <Text style={styles.sliderLabelText}>500g</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderAvailableFood = ({ item }) => (
    <TouchableOpacity style={styles.availableFood} onPress={() => addFood(item)}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.availableFoodGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.availableFoodName}>{item.name}</Text>
        <Text style={styles.availableFoodCategory}>{item.category}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProgressBar = (label, current, target, status) => {
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarHeader}>
          <Text style={styles.progressBarLabel}>{label}</Text>
          <Text style={[styles.progressBarValue, {color: status === 'met' ? '#00D084' : '#FF453A'}]}>
            {current}g / {target}g
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <LinearGradient
            colors={status === 'met' ? ['#00D084', '#00A86B'] : ['#FF453A', '#FF6B6B']}
            style={[styles.progressBarFill, { width: `${percentage}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0A0A0A', '#1A1A1A']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Meal</Text>
          <Text style={styles.subtitle}>Optimize your nutrition with precision</Text>
        </View>

        {selectedMeal && (
          <LinearGradient
            colors={['#007AFF', '#0051D5']}
            style={styles.targetCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.mealName}>{selectedMeal.name}</Text>
            <View style={styles.targetGrid}>
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{selectedMeal.macroTargets.protein}g</Text>
                <Text style={styles.targetLabel}>Protein</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{selectedMeal.macroTargets.carbs}g</Text>
                <Text style={styles.targetLabel}>Carbs</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{selectedMeal.macroTargets.fat}g</Text>
                <Text style={styles.targetLabel}>Fat</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {progress && selectedMeal && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Progress Overview</Text>
            {renderProgressBar('Protein', currentMacros.protein, selectedMeal.macroTargets.protein, progress.protein.status)}
            {renderProgressBar('Carbs', currentMacros.carbs, selectedMeal.macroTargets.carbs, progress.carbs.status)}
            {renderProgressBar('Fat', currentMacros.fat, selectedMeal.macroTargets.fat, progress.fat.status)}
            
            <View style={styles.totalCalories}>
              <Text style={styles.caloriesLabel}>Total Calories</Text>
              <Text style={styles.caloriesValue}>{currentMacros.calories}</Text>
            </View>
          </View>
        )}

        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          style={styles.addFoodButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity 
            style={styles.addFoodButtonInner}
            onPress={() => setShowFoodList(!showFoodList)}
          >
            <Text style={styles.addFoodButtonText}>
              {showFoodList ? '✕ Hide Foods' : '+ Add Foods'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {showFoodList && (
          <View style={styles.foodListContainer}>
            <Text style={styles.foodListTitle}>Available Foods</Text>
            <FlatList
              data={filteredFoods.slice(0, 8)}
              renderItem={renderAvailableFood}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.foodListRow}
            />
          </View>
        )}

        <View style={styles.selectedFoodsContainer}>
          <Text style={styles.sectionTitle}>Selected Foods</Text>
          {selectedFoods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No foods selected yet</Text>
              <Text style={styles.emptySubtext}>Add foods above to start planning your perfect meal</Text>
            </View>
          ) : (
            <FlatList
              data={selectedFoods}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.foodId}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  
  // Target Card
  targetCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mealName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  targetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetItem: {
    alignItems: 'center',
    flex: 1,
  },
  targetValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalCalories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  caloriesLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00D084',
  },

  // Add Food Button
  addFoodButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addFoodButtonInner: {
    padding: 18,
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Food List
  foodListContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  foodListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  foodListRow: {
    justifyContent: 'space-between',
  },
  availableFood: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  availableFoodGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  availableFoodName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  availableFoodCategory: {
    color: '#8E8E93',
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Selected Foods
  selectedFoodsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Selected Food Card
  selectedFood: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  foodCategory: {
    color: '#8E8E93',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FF453A',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Macro Display
  macroDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00D084',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Slider
  sliderContainer: {
    marginTop: 8,
  },
  portionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#8E8E93',
  },

  bottomSpacer: {
    height: 40,
  },
});