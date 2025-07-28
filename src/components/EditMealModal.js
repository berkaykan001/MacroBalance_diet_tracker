import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, Alert, Modal, Pressable, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useFood } from '../context/FoodContext';
import { useMeal } from '../context/MealContext';
import { useSettings } from '../context/SettingsContext';
import { CalculationService } from '../services/calculationService';
import LockControls from './LockControls';
import SegmentedProgressBar from './SegmentedProgressBar';

export default function EditMealModal({ visible, onClose, mealPlan, onUpdate }) {
  const { foods, filteredFoods, searchFoods } = useFood();
  const { meals, updateMealPlan } = useMeal();
  const { selectedQuickFoods } = useSettings();

  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showFoodList, setShowFoodList] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [lockedFoods, setLockedFoods] = useState(new Set());
  const [maxLimitFoods, setMaxLimitFoods] = useState(new Map());
  const [minLimitFoods, setMinLimitFoods] = useState(new Map());
  const [editingPortion, setEditingPortion] = useState(null);
  const [tempPortionValue, setTempPortionValue] = useState('');

  // Get meal data
  const selectedMeal = mealPlan ? meals.find(meal => meal.id === mealPlan.mealId) || meals[0] : null;

  // Initialize with meal plan data when modal opens
  useEffect(() => {
    if (visible && mealPlan) {
      setSelectedFoods(mealPlan.selectedFoods.map(food => ({
        ...food,
        id: `${food.foodId}_${Date.now()}`
      })));
      setShowFoodList(false);
      setFoodSearchQuery('');
      setLockedFoods(new Set());
      setMaxLimitFoods(new Map());
      setMinLimitFoods(new Map());
      setEditingPortion(null);
      setTempPortionValue('');
    }
  }, [visible, mealPlan]);

  // Clear search when modal closes
  useEffect(() => {
    if (!visible) {
      setFoodSearchQuery('');
      searchFoods('');
    }
  }, [visible]);

  const handleFoodSearch = (query) => {
    setFoodSearchQuery(query);
    searchFoods(query);
  };

  const getAvailableFoods = () => {
    if (foodSearchQuery) {
      return filteredFoods;
    } else {
      const quickFoods = selectedQuickFoods
        .map(foodId => foods.find(food => food.id === foodId))
        .filter(Boolean);
      return quickFoods.length > 0 ? quickFoods : foods.slice(0, 12);
    }
  };

  const addFood = (food) => {
    const exists = selectedFoods.find(sf => sf.foodId === food.id);
    if (!exists) {
      setSelectedFoods([...selectedFoods, { foodId: food.id, portionGrams: 100 }]);
    }
  };

  const removeFood = (foodId) => {
    setSelectedFoods(selectedFoods.filter(sf => sf.foodId !== foodId));
    setLockedFoods(prev => {
      const newSet = new Set(prev);
      newSet.delete(foodId);
      return newSet;
    });
    setMaxLimitFoods(prev => {
      const newMap = new Map(prev);
      newMap.delete(foodId);
      return newMap;
    });
    setMinLimitFoods(prev => {
      const newMap = new Map(prev);
      newMap.delete(foodId);
      return newMap;
    });
  };

  const updatePortion = (foodId, newPortion) => {
    if (!selectedMeal) return;
    
    if (isLocked(foodId)) return;
    
    let clampedPortion = Math.max(0, Math.round(newPortion));
    if (hasMaxLimit(foodId)) {
      clampedPortion = Math.min(clampedPortion, getMaxLimit(foodId));
    }
    if (hasMinLimit(foodId)) {
      clampedPortion = Math.max(clampedPortion, getMinLimit(foodId));
    }
    
    const updatedFoods = selectedFoods.map(food => 
      food.foodId === foodId 
        ? { ...food, portionGrams: clampedPortion }
        : food
    );
    setSelectedFoods(updatedFoods);
  };

  // Lock control functions
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

  const isLocked = (foodId) => lockedFoods.has(foodId);
  const hasMaxLimit = (foodId) => maxLimitFoods.has(foodId);
  const hasMinLimit = (foodId) => minLimitFoods.has(foodId);
  const getMaxLimit = (foodId) => maxLimitFoods.get(foodId) || 500;
  const getMinLimit = (foodId) => minLimitFoods.get(foodId) || 0;

  const toggleMaxLimit = (foodId) => {
    const currentFood = selectedFoods.find(sf => sf.foodId === foodId);
    if (!currentFood) return;

    setMaxLimitFoods(prev => {
      const newMap = new Map(prev);
      if (newMap.has(foodId)) {
        newMap.delete(foodId);
      } else {
        newMap.set(foodId, currentFood.portionGrams);
      }
      return newMap;
    });
  };

  const toggleMinLimit = (foodId) => {
    const currentFood = selectedFoods.find(sf => sf.foodId === foodId);
    if (!currentFood) return;

    setMinLimitFoods(prev => {
      const newMap = new Map(prev);
      if (newMap.has(foodId)) {
        newMap.delete(foodId);
      } else {
        newMap.set(foodId, currentFood.portionGrams);
      }
      return newMap;
    });
  };

  const currentMacros = selectedFoods.length > 0 
    ? CalculationService.calculateTotalMacros(selectedFoods, foods)
    : { protein: 0, carbs: 0, fat: 0, calories: 0, fiber: 0, sugar: 0 };

  const targetCalories = selectedMeal 
    ? CalculationService.calculateTargetCalories(selectedMeal.macroTargets)
    : 0;

  const handleSave = () => {
    if (!selectedMeal || selectedFoods.length === 0) {
      Alert.alert('No Foods Selected', 'Please add some foods before updating the meal.');
      return;
    }

    const updatedMealPlan = {
      ...mealPlan,
      selectedFoods: selectedFoods,
      calculatedMacros: currentMacros
    };

    updateMealPlan(updatedMealPlan);
    
    if (onUpdate) {
      onUpdate(updatedMealPlan);
    }
    
    Alert.alert(
      'Meal Updated!', 
      `${selectedMeal.name} has been updated with ${Math.round(currentMacros.calories)} calories.`
    );
    
    onClose();
  };

  const handleCancel = () => {
    onClose();
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
        <View style={styles.foodHeader}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCategory}>{food.category}</Text>
          </View>
          
          <View style={styles.macroDisplay}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.protein}g</Text>
              <Text style={styles.macroLabel}>P</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.carbs}g</Text>
              <Text style={styles.macroLabel}>C</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.fat}g</Text>
              <Text style={styles.macroLabel}>F</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.calories}</Text>
              <Text style={styles.macroLabel}>Cal</Text>
            </View>
          </View>
          
          <View style={styles.portionSection}>
            {editingPortion === food.id ? (
              <TextInput
                style={styles.portionInput}
                value={tempPortionValue}
                onChangeText={setTempPortionValue}
                onBlur={() => {
                  const numValue = parseFloat(tempPortionValue);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 500) {
                    updatePortion(food.id, numValue);
                  }
                  setEditingPortion(null);
                  setTempPortionValue('');
                }}
                onSubmitEditing={() => {
                  const numValue = parseFloat(tempPortionValue);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 500) {
                    updatePortion(food.id, numValue);
                  }
                  setEditingPortion(null);
                  setTempPortionValue('');
                }}
                keyboardType="numeric"
                selectTextOnFocus
                autoFocus
                maxLength={6}
              />
            ) : (
              <Pressable onPressIn={() => Keyboard.dismiss()} onPress={() => {
                setEditingPortion(food.id);
                setTempPortionValue(item.portionGrams.toString());
              }}>
                <Text style={styles.portionLabel}>{item.portionGrams}g</Text>
              </Pressable>
            )}
          </View>
          
          <LockControls 
            isLocked={isLocked(food.id)}
            hasMaxLimit={hasMaxLimit(food.id)}
            hasMinLimit={hasMinLimit(food.id)}
            onToggleLock={() => toggleFoodLock(food.id)}
            onToggleMaxLimit={() => toggleMaxLimit(food.id)}
            onToggleMinLimit={() => toggleMinLimit(food.id)}
            maxLimitValue={getMaxLimit(food.id)}
            minLimitValue={getMinLimit(food.id)}
          />
          
          <Pressable onPressIn={() => Keyboard.dismiss()} onPress={() => removeFood(food.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={[
              styles.slider,
              isLocked(food.id) && styles.lockedSlider
            ]}
            minimumValue={0}
            maximumValue={500}
            value={Math.max(0, Math.min(500, item.portionGrams))}
            onValueChange={(value) => updatePortion(food.id, value)}
            minimumTrackTintColor={
              isLocked(food.id) ? "#666666" : 
              hasMaxLimit(food.id) || hasMinLimit(food.id) ? "#FF9500" : 
              "#007AFF"
            }
            maximumTrackTintColor="#3A3A3A"
            thumbStyle={[
              styles.sliderThumb,
              isLocked(food.id) && styles.lockedSliderThumb,
              (hasMaxLimit(food.id) || hasMinLimit(food.id)) && styles.limitedSliderThumb
            ]}
            trackStyle={styles.sliderTrack}
            step={5}
            disabled={isLocked(food.id)}
          />
        </View>
      </LinearGradient>
    );
  };

  const renderAvailableFood = ({ item }) => (
    <Pressable style={styles.availableFood} onPressIn={() => Keyboard.dismiss()} onPress={() => addFood(item)}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.availableFoodGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.availableFoodName}>{item.name}</Text>
        <Text style={styles.availableFoodCategory}>{item.category}</Text>
      </LinearGradient>
    </Pressable>
  );

  const getSegmentsForMacro = (macroType, currentMacros) => {
    switch (macroType) {
      case 'protein':
        return [
          {
            value: currentMacros.protein || 0,
            colors: ['#00D084', '#00A86B'],
            name: 'Protein'
          }
        ];
      case 'carbs':
        return [
          {
            value: currentMacros.fiber || 0,
            colors: ['#00D084', '#00A86B'],
            name: 'Fiber'
          },
          {
            value: Math.max(0, (currentMacros.carbs - (currentMacros.fiber || 0))),
            colors: ['#45B7D1', '#6BC5D7'],
            name: 'Other Carbs'
          }
        ];
      case 'fat':
        return [
          {
            value: currentMacros.fat || 0,
            colors: ['#00D084', '#00A86B'],
            name: 'Fat'
          }
        ];
      default:
        return [];
    }
  };

  if (!visible || !selectedMeal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.cancelButton} onPressIn={() => Keyboard.dismiss()} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Edit {selectedMeal.name}</Text>
          <Pressable style={styles.saveButton} onPressIn={() => Keyboard.dismiss()} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Update</Text>
          </Pressable>
        </View>

        {/* Progress Section */}
        {selectedFoods.length > 0 && selectedMeal.name !== 'Snack' && (
          <View style={styles.progressSection}>
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
            
            <View style={styles.calories}>
              <Text style={styles.caloriesLabel}>Total: </Text>
              <Text style={styles.caloriesValue}>
                {currentMacros.calories}/{targetCalories} cal
              </Text>
            </View>
          </View>
        )}

        {/* Snack Calories Section */}
        {selectedFoods.length > 0 && selectedMeal.name === 'Snack' && (
          <View style={styles.snackCalories}>
            <Text style={styles.snackCaloriesLabel}>Snack: </Text>
            <Text style={styles.snackCaloriesValue}>
              {currentMacros.calories} cal • {Math.round(currentMacros.protein)}p {Math.round(currentMacros.carbs)}c {Math.round(currentMacros.fat)}f
            </Text>
          </View>
        )}

        {/* Add Foods Button */}
        <TouchableOpacity 
          style={styles.addFoodButton}
          onPress={() => setShowFoodList(!showFoodList)}
        >
          <LinearGradient
            colors={['#007AFF', '#0051D5']}
            style={styles.addFoodButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.addFoodButtonText}>
              {showFoodList ? '✕ Hide Foods' : '+ Add Foods'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
          {showFoodList && (
            <View style={styles.foodListContainer}>
              <View style={styles.foodListHeader}>
                <Text style={styles.foodListTitle}>Add Foods</Text>
                <Text style={styles.foodListSubtitle}>
                  {foodSearchQuery 
                    ? `${getAvailableFoods().length} results found` 
                    : `Your ${selectedQuickFoods.length} quick foods`
                  }
                </Text>
              </View>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={foodSearchQuery}
                  onChangeText={handleFoodSearch}
                  placeholder="Search foods to add..."
                  placeholderTextColor="#8E8E93"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {foodSearchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.searchClearButton}
                    onPress={() => setFoodSearchQuery('')}
                  >
                    <Text style={styles.searchClearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

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
                  </View>
                }
              />
            </View>
          )}

          <View style={styles.selectedFoodsContainer}>
            <Text style={styles.sectionTitle}>Selected Foods</Text>
              {selectedFoods.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🍽️</Text>
                  <Text style={styles.emptyText}>No foods selected</Text>
                  <Text style={styles.emptySubtext}>Add foods above to update this meal</Text>
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
        </ScrollView>
      </LinearGradient>
    </Modal>
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calories: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  caloriesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D084',
  },

  // Snack Calories
  snackCalories: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  snackCaloriesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  snackCaloriesValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D084',
  },

  // Add Food Button
  addFoodButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addFoodButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },

  // Food List
  foodListContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  foodListHeader: {
    marginBottom: 12,
  },
  foodListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  foodListSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Search Container
  searchContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingRight: 40,
  },
  searchClearButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: 'bold',
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

  // Selected Foods
  selectedFoodsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
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

  // Selected Food Item
  selectedFood: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
    marginRight: 8,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
  },
  foodCategory: {
    color: '#8E8E93',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  
  macroDisplay: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    padding: 4,
    marginRight: 6,
    flex: 2,
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 1,
  },
  macroLabel: {
    fontSize: 7,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  portionSection: {
    alignItems: 'center',
    marginRight: 6,
    minWidth: 32,
  },
  portionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  portionInput: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 40,
  },
  
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Slider
  sliderContainer: {
    marginTop: 4,
  },
  slider: {
    width: '100%',
    height: 22,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 14,
    height: 14,
  },
  sliderTrack: {
    height: 2,
    borderRadius: 1,
  },
  lockedSlider: {
    opacity: 0.5,
  },
  lockedSliderThumb: {
    backgroundColor: '#666666',
  },
  limitedSliderThumb: {
    backgroundColor: '#FF9500',
  },
});