import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useFood } from '../../context/FoodContext';
import { useMeal } from '../../context/MealContext';
import { useSettings } from '../../context/SettingsContext';
import { CalculationService } from '../../services/calculationService';
import LockButton from '../../components/LockButton';
import SegmentedProgressBar from '../../components/SegmentedProgressBar';

const { width } = Dimensions.get('window');

export default function MealPlanningScreen({ route }) {
  const { foods, filteredFoods, searchFoods } = useFood();
  const { meals, createMealPlan, updateMealPlan } = useMeal();
  const { selectedQuickFoods, appPreferences } = useSettings();
  
  // Check if we're editing an existing meal plan
  const editingMealPlan = route?.params?.editingMealPlan;
  
  const [selectedMealId, setSelectedMealId] = useState(editingMealPlan?.mealId || '1');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showFoodList, setShowFoodList] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [lockedFoods, setLockedFoods] = useState(new Set()); // Track locked food IDs

  // Initialize with existing meal plan data if editing
  useEffect(() => {
    if (editingMealPlan) {
      setSelectedMealId(editingMealPlan.mealId);
      setSelectedFoods(editingMealPlan.selectedFoods.map(food => ({
        ...food,
        id: `${food.foodId}_${Date.now()}` // Generate unique ID for React keys
      })));
    }
  }, [editingMealPlan]);

  // Reset state when navigating to this screen without editingMealPlan parameter
  useFocusEffect(
    React.useCallback(() => {
      if (!editingMealPlan) {
        // Reset to default state for new meal planning
        setSelectedMealId('1');
        setSelectedFoods([]);
        setShowFoodList(false);
        setFoodSearchQuery('');
        setLockedFoods(new Set());
      }
    }, [editingMealPlan])
  );

  // Always get the current meal data (updates when meals context changes)
  const selectedMeal = meals.find(meal => meal.id === selectedMealId) || meals[0];

  const handleFoodSearch = (query) => {
    setFoodSearchQuery(query);
    searchFoods(query);
  };

  const getAvailableFoods = () => {
    if (foodSearchQuery) {
      // If searching, show filtered results
      return filteredFoods;
    } else {
      // If not searching, show user's selected quick foods
      const quickFoods = selectedQuickFoods
        .map(foodId => foods.find(food => food.id === foodId))
        .filter(Boolean); // Remove any undefined foods
      
      // If no quick foods selected, fallback to first 12 foods
      return quickFoods.length > 0 ? quickFoods : foods.slice(0, 12);
    }
  };

  const addFood = (food) => {
    const exists = selectedFoods.find(sf => sf.foodId === food.id);
    if (!exists) {
      setSelectedFoods([...selectedFoods, { foodId: food.id, portionGrams: 100 }]);
    }
    // Don't close the food list anymore - let user add multiple foods
  };

  const removeFood = (foodId) => {
    setSelectedFoods(selectedFoods.filter(sf => sf.foodId !== foodId));
    // Also remove from locked foods if it was locked
    setLockedFoods(prev => {
      const newSet = new Set(prev);
      newSet.delete(foodId);
      return newSet;
    });
  };

  const toggleFoodLock = (foodId) => {
    setLockedFoods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(foodId)) {
        newSet.delete(foodId);
      } else {
        newSet.add(foodId);
      }
      return newSet;
    });
  };

  const isLocked = (foodId) => {
    return lockedFoods.has(foodId);
  };

  const updatePortion = (foodId, newPortion) => {
    if (!selectedMeal) return;
    
    if (appPreferences.autoOptimize) {
      // Auto-optimize other portions when enabled, respecting locked foods
      const optimized = CalculationService.optimizePortions(
        selectedFoods, 
        foods, 
        selectedMeal.macroTargets, 
        foodId, 
        Math.round(newPortion),
        Array.from(lockedFoods)
      );
      setSelectedFoods(optimized);
    } else {
      // Just update the single food without optimization
      const updatedFoods = selectedFoods.map(food => 
        food.foodId === foodId 
          ? { ...food, portionGrams: Math.round(newPortion) }
          : food
      );
      setSelectedFoods(updatedFoods);
    }
  };

  const currentMacros = selectedFoods.length > 0 
    ? CalculationService.calculateTotalMacros(selectedFoods, foods)
    : { protein: 0, carbs: 0, fat: 0, calories: 0, fiber: 0, sugar: 0 };

  const progress = selectedMeal 
    ? CalculationService.calculateMacroProgress(currentMacros, selectedMeal.macroTargets)
    : null;

  const saveMealPlan = () => {
    if (!selectedMeal || selectedFoods.length === 0) {
      Alert.alert('No Foods Selected', 'Please add some foods before marking the meal as eaten.');
      return;
    }

    // Create meal plan with current data
    const mealPlan = {
      mealId: selectedMealId,
      selectedFoods: selectedFoods,
      calculatedMacros: currentMacros
    };

    console.log('saveMealPlan - editingMealPlan:', !!editingMealPlan);
    console.log('saveMealPlan - creating new meal plan for:', selectedMeal.name);

    if (editingMealPlan) {
      // Update existing meal plan (when editing from dashboard)
      console.log('Updating existing meal plan:', editingMealPlan.id);
      updateMealPlan({
        ...editingMealPlan,
        ...mealPlan
      });
      Alert.alert(
        'Meal Updated!', 
        `${selectedMeal.name} has been updated with ${Math.round(currentMacros.calories)} calories.`
      );
    } else {
      // Always create new meal plan (allows multiple meals of same type per day)
      console.log('Creating new meal plan');
      createMealPlan(mealPlan);
      Alert.alert(
        'Meal Saved!', 
        `${selectedMeal.name} has been marked as eaten with ${Math.round(currentMacros.calories)} calories.`
      );
    }
    
    // Clear the current meal plan after saving
    setSelectedFoods([]);
  };

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
        {/* Top row: Food info, macros, and remove button all in one row */}
        <View style={styles.ultraCompactHeader}>
          <View style={styles.ultraCompactFoodInfo}>
            <Text style={styles.ultraCompactFoodName}>{food.name}</Text>
            <Text style={styles.ultraCompactFoodCategory}>{food.category}</Text>
          </View>
          
          <View style={styles.ultraCompactMacroDisplay}>
            <View style={styles.ultraCompactMacroItem}>
              <Text style={styles.ultraCompactMacroValue}>{macros.protein}g</Text>
              <Text style={styles.ultraCompactMacroLabel}>P</Text>
            </View>
            <View style={styles.ultraCompactMacroItem}>
              <Text style={styles.ultraCompactMacroValue}>{macros.carbs}g</Text>
              <Text style={styles.ultraCompactMacroLabel}>C</Text>
            </View>
            <View style={styles.ultraCompactMacroItem}>
              <Text style={styles.ultraCompactMacroValue}>{macros.fat}g</Text>
              <Text style={styles.ultraCompactMacroLabel}>F</Text>
            </View>
            <View style={styles.ultraCompactMacroItem}>
              <Text style={styles.ultraCompactMacroValue}>{macros.calories}</Text>
              <Text style={styles.ultraCompactMacroLabel}>Cal</Text>
            </View>
          </View>
          
          <View style={styles.ultraCompactPortionSection}>
            <Text style={styles.ultraCompactPortionLabel}>{item.portionGrams}g</Text>
          </View>
          
          <LockButton 
            isLocked={isLocked(food.id)}
            onToggle={() => toggleFoodLock(food.id)}
          />
          
          <TouchableOpacity onPress={() => removeFood(food.id)} style={styles.ultraCompactRemoveButton}>
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom row: Slider with lock state */}
        <View style={styles.ultraCompactSliderContainer}>
          <Slider
            style={[
              styles.ultraCompactSlider,
              isLocked(food.id) && styles.lockedSlider
            ]}
            minimumValue={10}
            maximumValue={500}
            value={item.portionGrams}
            onValueChange={isLocked(food.id) ? undefined : (value) => updatePortion(food.id, value)}
            minimumTrackTintColor={isLocked(food.id) ? "#666666" : "#007AFF"}
            maximumTrackTintColor="#3A3A3A"
            thumbStyle={[
              styles.ultraCompactSliderThumb,
              isLocked(food.id) && styles.lockedSliderThumb
            ]}
            trackStyle={styles.ultraCompactSliderTrack}
            step={5}
            disabled={isLocked(food.id)}
          />
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

  const getSegmentsForMacro = (macroType, currentMacros) => {
    switch (macroType) {
      case 'fat':
        return [
          // Unhealthy fats first (will appear on left)
          {
            value: currentMacros.saturatedFat || 0,
            colors: ['#FF9500', '#FFB84D'], // Orange for saturated fat
            name: 'Saturated'
          },
          {
            value: currentMacros.transFat || 0,
            colors: ['#FF453A', '#FF6B6B'], // Red for trans fat
            name: 'Trans'
          },
          // Healthy fats (will appear on right)
          {
            value: currentMacros.monounsaturatedFat || 0,
            colors: ['#00D084', '#00A86B'], // Green for monounsaturated
            name: 'Monounsaturated'
          },
          {
            value: currentMacros.omega3 || 0,
            colors: ['#00D084', '#26E599'], // Bright green for omega-3
            name: 'Omega-3'
          },
          {
            value: currentMacros.polyunsaturatedFat || 0,
            colors: ['#4ECDC4', '#6EDCD6'], // Blue-green for polyunsaturated
            name: 'Polyunsaturated'
          }
        ];
      
      case 'carbs':
        return [
          // Unhealthy carbs first
          {
            value: currentMacros.addedSugars || 0,
            colors: ['#FF9500', '#FFB84D'], // Orange for added sugars
            name: 'Added Sugars'
          },
          // Healthy carbs
          {
            value: currentMacros.naturalSugars || 0,
            colors: ['#4ECDC4', '#6EDCD6'], // Blue-green for natural sugars
            name: 'Natural Sugars'
          },
          {
            value: currentMacros.fiber || 0,
            colors: ['#00D084', '#00A86B'], // Green for fiber
            name: 'Fiber'
          },
          // Remaining carbs (starch, etc.)
          {
            value: Math.max(0, Math.round((currentMacros.carbs - (currentMacros.addedSugars || 0) - (currentMacros.naturalSugars || 0) - (currentMacros.fiber || 0)) * 10) / 10),
            colors: ['#45B7D1', '#6BC5D7'], // Blue for other carbs
            name: 'Other Carbs'
          }
        ];
      
      case 'protein':
        // For now, protein is just one segment, but could be expanded later
        return [
          {
            value: currentMacros.protein || 0,
            colors: ['#00D084', '#00A86B'], // Green gradient for protein
            name: 'Protein'
          }
        ];
      
      default:
        return [];
    }
  };

  return (
    <LinearGradient
      colors={['#0A0A0A', '#1A1A1A']}
      style={styles.container}
    >
      {/* Fixed Header Section - Compact */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.fixedHeader}>
        {/* Meal Selector */}
        <View style={styles.mealSelector}>
          <Text style={styles.mealSelectorLabel}>Meal:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealOptions}>
            {meals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.mealOption,
                  selectedMealId === meal.id && styles.mealOptionSelected
                ]}
                onPress={() => setSelectedMealId(meal.id)}
              >
                <Text style={[
                  styles.mealOptionText,
                  selectedMealId === meal.id && styles.mealOptionTextSelected
                ]}>
                  {meal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {progress && selectedMeal && selectedFoods.length > 0 && (
          <View style={styles.compactProgressSection}>
            <SegmentedProgressBar
              label="Protein"
              current={currentMacros.protein}
              target={selectedMeal.macroTargets.protein}
              segments={getSegmentsForMacro('protein', currentMacros)}
            />
            <SegmentedProgressBar
              label="Carbs"
              current={currentMacros.carbs}
              target={selectedMeal.macroTargets.carbs}
              segments={getSegmentsForMacro('carbs', currentMacros)}
            />
            <SegmentedProgressBar
              label="Fat"
              current={currentMacros.fat}
              target={selectedMeal.macroTargets.fat}
              segments={getSegmentsForMacro('fat', currentMacros)}
            />
            
            <View style={styles.compactCalories}>
              <Text style={styles.compactCaloriesLabel}>Total: </Text>
              <Text style={styles.compactCaloriesValue}>{currentMacros.calories} cal</Text>
            </View>
          </View>
        )}

        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          style={styles.addFoodButtonCompact}
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
        </View>
      </TouchableWithoutFeedback>

      {/* Scrollable Content Section */}
      <ScrollView 
        style={styles.scrollableContent} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {showFoodList && (
          <View style={styles.foodListContainer}>
            <View style={styles.foodListHeader}>
              <View>
                <Text style={styles.foodListTitle}>Add Foods</Text>
                <Text style={styles.foodListSubtitle}>
                  {foodSearchQuery 
                    ? `${getAvailableFoods().length} results found` 
                    : `Your ${selectedQuickFoods.length} quick foods`
                  }
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeFoodListButton}
                onPress={() => {
                  setShowFoodList(false);
                  setFoodSearchQuery('');
                  searchFoods(''); // Clear search when closing
                }}
              >
                <Text style={styles.closeFoodListText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.foodSearchContainer}>
              <TextInput
                style={styles.foodSearchInput}
                value={foodSearchQuery}
                onChangeText={handleFoodSearch}
                placeholder="Search foods to add..."
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Food List */}
            <FlatList
              data={getAvailableFoods()}
              renderItem={renderAvailableFood}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={3}
              columnWrapperStyle={styles.foodListRow}
              ListEmptyComponent={
                <View style={styles.noFoodsFound}>
                  <Text style={styles.noFoodsFoundText}>
                    {foodSearchQuery ? 'No foods found' : 'No quick foods selected'}
                  </Text>
                  <Text style={styles.noFoodsFoundSubtext}>
                    {foodSearchQuery 
                      ? 'Try adjusting your search' 
                      : 'Go to Settings to select your favorite foods for quick access'
                    }
                  </Text>
                </View>
              }
            />
          </View>
        )}

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.selectedFoodsContainer}>
            <Text style={styles.sectionTitle}>Selected Foods</Text>
          {selectedFoods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No foods selected yet</Text>
              <Text style={styles.emptySubtext}>Add foods above to start planning your perfect meal</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={selectedFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.foodId}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
              
              {/* Eaten Button */}
              <TouchableOpacity 
                style={styles.eatenButton}
                onPress={saveMealPlan}
              >
                <LinearGradient
                  colors={['#00D084', '#00A86B']}
                  style={styles.eatenButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.eatenButtonText}>
                    {editingMealPlan ? '✓ Update Meal' : '✓ Mark as Eaten'}
                  </Text>
                  <Text style={styles.eatenButtonSubtext}>
                    {Math.round(currentMacros.calories)} calories • {Math.round(currentMacros.protein)}p {Math.round(currentMacros.carbs)}c {Math.round(currentMacros.fat)}f
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
          </View>
        </TouchableWithoutFeedback>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    backgroundColor: 'transparent',
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
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
  foodListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  foodListSubtitle: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1,
  },
  closeFoodListButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFoodListText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Food Search
  foodSearchContainer: {
    marginBottom: 8,
  },
  foodSearchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  foodListRow: {
    justifyContent: 'space-between',
  },
  availableFood: {
    flex: 1,
    margin: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  availableFoodGradient: {
    padding: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  availableFoodName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 1,
  },
  availableFoodCategory: {
    color: '#8E8E93',
    fontSize: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  // No Foods Found
  noFoodsFound: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  noFoodsFoundText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  noFoodsFoundSubtext: {
    color: '#8E8E93',
    fontSize: 10,
    textAlign: 'center',
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
  
  // Selected Food Card - Ultra Compact
  selectedFood: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
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

  // Eaten Button Styles
  eatenButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  eatenButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eatenButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  eatenButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Meal Selector
  mealSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  mealOptions: {
    flex: 1,
  },
  mealOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mealOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  mealOptionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  mealOptionTextSelected: {
    fontWeight: '600',
  },

  // Compact Progress Section
  compactProgressSection: {
    marginBottom: 8,
  },

  // Compact Calories
  compactCalories: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  compactCaloriesLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
  },
  compactCaloriesValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D084',
  },

  // Compact Add Food Button
  addFoodButtonCompact: {
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Compact Food Container Styles
  compactFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactFoodInfo: {
    flex: 1,
  },
  compactFoodName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  compactFoodCategory: {
    color: '#8E8E93',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  compactRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Compact Main Row (Macros + Portion)
  compactMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactMacroDisplay: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 6,
    marginRight: 8,
  },
  compactMacroItem: {
    alignItems: 'center',
    flex: 1,
  },
  compactMacroValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 1,
  },
  compactMacroLabel: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  // Compact Portion Section
  compactPortionSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  compactPortionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  
  // Compact Slider
  compactSliderContainer: {
    marginTop: 2,
  },
  compactSlider: {
    width: '100%',
    height: 25,
  },
  compactSliderThumb: {
    backgroundColor: '#007AFF',
    width: 16,
    height: 16,
  },
  compactSliderTrack: {
    height: 3,
    borderRadius: 1.5,
  },

  // Ultra Compact Food Container Styles - Everything in one row
  ultraCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ultraCompactFoodInfo: {
    flex: 1,
    marginRight: 8,
  },
  ultraCompactFoodName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
  },
  ultraCompactFoodCategory: {
    color: '#8E8E93',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  
  // Ultra compact macros - side by side with food name
  ultraCompactMacroDisplay: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    padding: 4,
    marginRight: 6,
    flex: 2,
    justifyContent: 'space-between',
  },
  ultraCompactMacroItem: {
    alignItems: 'center',
    flex: 1,
  },
  ultraCompactMacroValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 1,
  },
  ultraCompactMacroLabel: {
    fontSize: 7,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  // Ultra compact portion and remove button
  ultraCompactPortionSection: {
    alignItems: 'center',
    marginRight: 6,
    minWidth: 32,
  },
  ultraCompactPortionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  ultraCompactRemoveButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Ultra compact slider
  ultraCompactSliderContainer: {
    marginTop: 0,
  },
  ultraCompactSlider: {
    width: '100%',
    height: 22,
  },
  ultraCompactSliderThumb: {
    backgroundColor: '#007AFF',
    width: 14,
    height: 14,
  },
  ultraCompactSliderTrack: {
    height: 2,
    borderRadius: 1,
  },
  
  // Locked slider styles
  lockedSlider: {
    opacity: 0.5,
  },
  lockedSliderThumb: {
    backgroundColor: '#666666',
  },

});