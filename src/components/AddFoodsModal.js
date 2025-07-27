import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, Modal, Pressable, Keyboard, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFood } from '../context/FoodContext';
import { useSettings } from '../context/SettingsContext';

export default function AddFoodsModal({ visible, onClose, onAddFood, selectedMeal }) {
  const { foods, filteredFoods, searchFoods } = useFood();
  const { selectedQuickFoods } = useSettings();
  
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [addedFoodName, setAddedFoodName] = useState('');
  const slideAnim = useState(new Animated.Value(-100))[0];

  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setFoodSearchQuery('');
      searchFoods('');
    }
  }, [visible]);

  const showConfirmation = (foodName) => {
    setAddedFoodName(foodName);
    setConfirmationVisible(true);
    
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto hide after 2 seconds
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setConfirmationVisible(false);
      });
    }, 2000);
  };

  const handleAddFood = (food) => {
    onAddFood(food);
    showConfirmation(food.name);
    // Don't close modal - allow multiple food selections
  };

  const handleClose = () => {
    setFoodSearchQuery('');
    searchFoods('');
    onClose();
  };

  const handleSearch = (query) => {
    setFoodSearchQuery(query);
    searchFoods(query);
  };

  // Get foods to display - filtered foods if searching, otherwise quick foods
  const getFoodsToDisplay = () => {
    if (foodSearchQuery.trim()) {
      return filteredFoods.filter(food => food && food.nutritionPer100g);
    }
    
    // selectedQuickFoods might be IDs, so we need to map them to actual food objects
    let quickFoods;
    if (selectedQuickFoods.length > 0) {
      quickFoods = selectedQuickFoods
        .map(foodId => foods.find(food => food.id === foodId))
        .filter(food => food && food.nutritionPer100g);
    } else {
      quickFoods = foods.slice(0, 10).filter(food => food && food.nutritionPer100g);
    }
    
    return quickFoods;
  };

  const renderAvailableFood = ({ item }) => {
    // Safety check for item and nutrition data
    if (!item || !item.nutritionPer100g) {
      return null;
    }

    return (
      <Pressable 
        style={styles.availableFood} 
        onPressIn={() => Keyboard.dismiss()}
        onPress={() => handleAddFood(item)}
      >
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.availableFoodGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.foodInfo}>
            <Text style={styles.availableFoodName}>{item.name}</Text>
            <Text style={styles.availableFoodCategory}>{item.category}</Text>
          </View>
          <View style={styles.foodNutrition}>
            <Text style={styles.nutritionText}>
              {Math.round(item.nutritionPer100g.calories)}cal • {Math.round(item.nutritionPer100g.protein)}p {Math.round(item.nutritionPer100g.carbs)}c {Math.round(item.nutritionPer100g.fat)}f
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Add Foods to {selectedMeal?.name || 'Meal'}</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.searchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods..."
              placeholderTextColor="#666"
              value={foodSearchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </LinearGradient>
        </View>

        {/* Food List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>
            {foodSearchQuery.trim() 
              ? `Search results (${filteredFoods.length})`
              : selectedQuickFoods.length > 0 
                ? `Your quick foods (${selectedQuickFoods.length})`
                : `Popular foods`
            }
          </Text>
        </View>

        {/* Food List */}
        <FlatList
          data={getFoodsToDisplay()}
          renderItem={renderAvailableFood}
          keyExtractor={(item, index) => item?.id || index.toString()}
          style={styles.foodList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={styles.foodListContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No foods found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          }
        />
        
        {/* Confirmation Toast */}
        {confirmationVisible && (
          <Animated.View 
            style={[
              styles.confirmationToast,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#00C851', '#007E33']}
              style={styles.confirmationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.confirmationIcon}>✓</Text>
              <Text style={styles.confirmationText}>Added {addedFoodName}</Text>
            </LinearGradient>
          </Animated.View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchGradient: {
    borderRadius: 12,
    padding: 1,
  },
  searchInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  foodList: {
    flex: 1,
  },
  foodListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  availableFood: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  availableFoodGradient: {
    padding: 16,
  },
  foodInfo: {
    marginBottom: 8,
  },
  availableFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  availableFoodCategory: {
    fontSize: 13,
    color: '#999',
    textTransform: 'capitalize',
  },
  foodNutrition: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: '#BBB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  confirmationToast: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  confirmationIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
});