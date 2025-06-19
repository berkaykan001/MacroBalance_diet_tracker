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
    if (!selectedMeal) return;
    
    const optimized = CalculationService.optimizePortions(
      selectedFoods, 
      foods, 
      selectedMeal.macroTargets, 
      foodId, 
      Math.round(newPortion)
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
    // Calculate the maximum scale (target * 1.5 so target appears at 66% of the bar)
    const maxValue = target * 1.5;
    const currentPercentage = Math.min(100, (current / maxValue) * 100);
    const targetPercentage = (target / maxValue) * 100; // Should be around 66%
    
    // Determine colors based on how close we are to target
    const difference = Math.abs(current - target);
    const tolerance = target * 0.05; // 5% tolerance
    
    let fillColor;
    if (difference <= tolerance) {
      fillColor = ['#00D084', '#00A86B']; // Green when close to target
    } else if (current < target) {
      fillColor = ['#FF9500', '#FF9F00']; // Orange when under
    } else {
      fillColor = ['#FF453A', '#FF6B6B']; // Red when over
    }

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarHeader}>
          <Text style={styles.progressBarLabel}>{label}</Text>
          <Text style={[styles.progressBarValue, {
            color: difference <= tolerance ? '#00D084' : current < target ? '#FF9500' : '#FF453A'
          }]}>
            {current}g / {target}g
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          {/* Background track */}
          <View style={styles.progressBarBackground} />
          
          {/* Target indicator line */}
          <View style={[styles.targetIndicator, { left: `${targetPercentage}%` }]} />
          
          {/* Current progress fill */}
          <LinearGradient
            colors={fillColor}
            style={[styles.progressBarFill, { width: `${currentPercentage}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <View style={styles.progressBarLabels}>
          <Text style={styles.progressBarLabelText}>0g</Text>
          <Text style={[styles.progressBarLabelText, styles.targetLabelText]}>{target}g</Text>
          <Text style={styles.progressBarLabelText}>{Math.round(maxValue)}g</Text>
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
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  
  // Target Card
  targetCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  targetLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
  },
  progressBarFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 3,
    zIndex: 1,
  },
  targetIndicator: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    marginLeft: -1,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    position: 'relative',
  },
  progressBarLabelText: {
    fontSize: 9,
    color: '#8E8E93',
  },
  targetLabelText: {
    color: '#FFFFFF',
    fontWeight: '600',
    position: 'absolute',
    left: '66.67%',
    transform: [{ translateX: -10 }],
  },
  totalCalories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  caloriesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  caloriesValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D084',
  },

  // Add Food Button
  addFoodButton: {
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addFoodButtonInner: {
    padding: 12,
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Food List
  foodListContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  foodListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  foodListRow: {
    justifyContent: 'space-between',
  },
  availableFood: {
    flex: 1,
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  availableFoodGradient: {
    padding: 10,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  availableFoodName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  availableFoodCategory: {
    color: '#8E8E93',
    fontSize: 9,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Selected Foods
  selectedFoodsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Selected Food Card
  selectedFood: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  foodCategory: {
    color: '#8E8E93',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Macro Display
  macroDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 9,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Slider
  sliderContainer: {
    marginTop: 4,
  },
  portionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 18,
    height: 18,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 10,
    color: '#8E8E93',
  },

  bottomSpacer: {
    height: 20,
  },
});