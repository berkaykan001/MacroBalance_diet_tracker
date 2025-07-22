import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFood } from '../../context/FoodContext';

export default function FoodManagementScreen({ navigation }) {
  const { foods, filteredFoods, searchFoods, addFood, updateFood, deleteFood } = useFood();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Form state for adding/editing foods
  const [formData, setFormData] = useState({
    name: '',
    category: 'protein',
    nutritionPer100g: {
      calories: '',
      protein: '',
      carbs: '',
      fiber: '',
      sugar: '',
      fat: '',
      // Sub-macros
      naturalSugars: '',
      addedSugars: '',
      saturatedFat: '',
      monounsaturatedFat: '',
      polyunsaturatedFat: '',
      transFat: '',
      omega3: '',
      // Existing micronutrients
      vitaminD: '',
      magnesium: '',
      // New micronutrients
      iron: '',
      calcium: '',
      zinc: '',
      sodium: '',
      potassium: '',
      vitaminB6: '',
      vitaminB12: '',
      vitaminC: ''
    }
  });

  const categories = [
    { id: 'all', name: 'All Foods', count: foods.length },
    { id: 'dishes', name: 'Dishes', count: foods.filter(f => f.category === 'dishes').length },
    { id: 'protein', name: 'Protein', count: foods.filter(f => f.category === 'protein').length },
    { id: 'carbs', name: 'Carbs', count: foods.filter(f => f.category === 'carbs').length },
    { id: 'fats', name: 'Fats', count: foods.filter(f => f.category === 'fats').length },
    { id: 'vegetables', name: 'Vegetables', count: foods.filter(f => f.category === 'vegetables').length },
    { id: 'fruits', name: 'Fruits', count: foods.filter(f => f.category === 'fruits').length },
    { id: 'grains', name: 'Grains', count: foods.filter(f => f.category === 'grains').length },
    { id: 'dairy', name: 'Dairy', count: foods.filter(f => f.category === 'dairy').length },
    { id: 'nuts', name: 'Nuts', count: foods.filter(f => f.category === 'nuts').length },
    { id: 'other', name: 'Other', count: foods.filter(f => f.category === 'other').length },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchFoods(query);
  };

  const getFilteredFoods = () => {
    let result = searchQuery ? filteredFoods : foods;
    if (selectedCategory !== 'all') {
      result = result.filter(food => food.category === selectedCategory);
    }
    return result;
  };

  const handleAddFood = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      category: 'protein',
      nutritionPer100g: {
        calories: '',
        protein: '',
        carbs: '',
        fiber: '',
        sugar: '',
        fat: '',
        // Sub-macros
        naturalSugars: '',
        addedSugars: '',
        saturatedFat: '',
        monounsaturatedFat: '',
        polyunsaturatedFat: '',
        transFat: '',
        omega3: '',
        // Existing micronutrients
        vitaminD: '',
        magnesium: '',
        // New micronutrients
        iron: '',
        calcium: '',
        zinc: '',
        sodium: '',
        potassium: '',
        vitaminB6: '',
        vitaminB12: '',
        vitaminC: ''
      }
    });
    setShowAddForm(true);
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    // Convert all nutrition values to strings for form inputs
    const nutritionAsStrings = {};
    Object.keys(food.nutritionPer100g).forEach(key => {
      nutritionAsStrings[key] = food.nutritionPer100g[key].toString();
    });
    
    setFormData({
      name: food.name,
      category: food.category,
      nutritionPer100g: nutritionAsStrings
    });
    setShowAddForm(true);
  };

  const handleDeleteFood = (food) => {
    // For web environment, use window.confirm instead of Alert.alert
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Are you sure you want to delete "${food.name}"?`);
      if (confirmed) {
        deleteFood(food.id);
      }
    } else {
      // For mobile environment, use Alert.alert
      Alert.alert(
        'Delete Food',
        `Are you sure you want to delete "${food.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => deleteFood(food.id)
          }
        ]
      );
    }
  };

  const handleSaveFood = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Food name is required');
      return;
    }

    const nutrition = formData.nutritionPer100g;
    if (!nutrition.calories || !nutrition.protein || !nutrition.carbs || !nutrition.fat) {
      Alert.alert('Error', 'Calories, protein, carbs, and fat are required');
      return;
    }

    // Convert string inputs to numbers
    const processedFood = {
      ...formData,
      nutritionPer100g: {
        calories: parseFloat(nutrition.calories) || 0,
        protein: parseFloat(nutrition.protein) || 0,
        carbs: parseFloat(nutrition.carbs) || 0,
        fiber: parseFloat(nutrition.fiber) || 0,
        sugar: parseFloat(nutrition.sugar) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        // Sub-macros
        naturalSugars: parseFloat(nutrition.naturalSugars) || 0,
        addedSugars: parseFloat(nutrition.addedSugars) || 0,
        saturatedFat: parseFloat(nutrition.saturatedFat) || 0,
        monounsaturatedFat: parseFloat(nutrition.monounsaturatedFat) || 0,
        polyunsaturatedFat: parseFloat(nutrition.polyunsaturatedFat) || 0,
        transFat: parseFloat(nutrition.transFat) || 0,
        omega3: parseFloat(nutrition.omega3) || 0,
        // Vitamins
        vitaminB6: parseFloat(nutrition.vitaminB6) || 0,
        vitaminB12: parseFloat(nutrition.vitaminB12) || 0,
        vitaminC: parseFloat(nutrition.vitaminC) || 0,
        vitaminD: parseFloat(nutrition.vitaminD) || 0,
        // Minerals
        iron: parseFloat(nutrition.iron) || 0,
        calcium: parseFloat(nutrition.calcium) || 0,
        zinc: parseFloat(nutrition.zinc) || 0,
        magnesium: parseFloat(nutrition.magnesium) || 0,
        sodium: parseFloat(nutrition.sodium) || 0,
        potassium: parseFloat(nutrition.potassium) || 0,
      }
    };

    if (editingFood) {
      updateFood(editingFood.id, processedFood);
    } else {
      addFood(processedFood);
    }

    setShowAddForm(false);
    setEditingFood(null);
  };

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.categoryButtonTextActive
      ]}>
        {item.name} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }) => (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.foodItem}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.foodHeader}>
        <View style={styles.foodInfo}>
          <View style={styles.foodNameRow}>
            <Text style={styles.foodName}>{item.name}</Text>
            {item.isDish && <Text style={styles.dishIndicator}>🍲</Text>}
          </View>
          <Text style={styles.foodCategory}>{item.category}</Text>
          {item.userAdded && <Text style={styles.userAddedBadge}>Custom</Text>}
        </View>
        <View style={styles.foodActions}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEditFood(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          {item.userAdded && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDeleteFood(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{item.nutritionPer100g.calories}</Text>
          <Text style={styles.nutritionLabel}>Cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{item.nutritionPer100g.protein}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{item.nutritionPer100g.carbs}g</Text>
          <Text style={styles.nutritionLabel}>Carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{item.nutritionPer100g.fat}g</Text>
          <Text style={styles.nutritionLabel}>Fat</Text>
        </View>
      </View>
    </LinearGradient>
  );

  if (showAddForm) {
    return (
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
        <View style={styles.formHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowAddForm(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>
            {editingFood ? 'Edit Food' : 'Add New Food'}
          </Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveFood}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter food name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                {['protein', 'carbs', 'fats', 'vegetables', 'fruits', 'grains', 'dairy', 'nuts', 'other'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categorySelectorButton,
                      formData.category === cat && styles.categorySelectorButtonActive
                    ]}
                    onPress={() => setFormData({...formData, category: cat})}
                  >
                    <Text style={[
                      styles.categorySelectorButtonText,
                      formData.category === cat && styles.categorySelectorButtonTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Nutrition Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Nutrition per 100g</Text>
            
            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Calories *</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.calories}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, calories: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Protein (g) *</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.protein}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, protein: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Carbs (g) *</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.carbs}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, carbs: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Fat (g) *</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.fat}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, fat: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Fiber (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.fiber}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, fiber: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Total Sugar (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.sugar}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, sugar: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Sub-Macro Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Sugar Breakdown</Text>
            
            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Natural Sugars (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.naturalSugars}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, naturalSugars: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Added Sugars (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.addedSugars}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, addedSugars: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Fat Breakdown */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Fat Breakdown</Text>
            
            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Saturated Fat (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.saturatedFat}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, saturatedFat: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Monounsaturated Fat (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.monounsaturatedFat}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, monounsaturatedFat: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Polyunsaturated Fat (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.polyunsaturatedFat}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, polyunsaturatedFat: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Trans Fat (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.transFat}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, transFat: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Omega-3 (g)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.omega3}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, omega3: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                {/* Empty for symmetry */}
              </View>
            </View>
          </View>

          {/* Vitamins */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Vitamins</Text>
            
            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Vitamin B6 (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.vitaminB6}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, vitaminB6: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Vitamin B12 (μg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.vitaminB12}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, vitaminB12: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Vitamin C (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.vitaminC}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, vitaminC: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Vitamin D (μg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.vitaminD}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, vitaminD: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Minerals */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Minerals</Text>
            
            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Iron (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.iron}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, iron: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Calcium (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.calcium}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, calcium: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Zinc (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.zinc}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, zinc: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Magnesium (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.magnesium}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, magnesium: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionInputRow}>
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Sodium (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.sodium}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, sodium: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputGroup}>
                <Text style={styles.inputLabel}>Potassium (mg)</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={formData.nutritionPer100g.potassium}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    nutritionPer100g: {...formData.nutritionPer100g, potassium: text}
                  })}
                  placeholder="0"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.formSpacer} />
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Food Database</Text>
        <View style={styles.headerButtonGroup}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleAddFood}
          >
            <LinearGradient
              colors={['#007AFF', '#0051D5']}
              style={styles.headerButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.headerButtonText}>Add a Food</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('DishCreator')}
          >
            <LinearGradient
              colors={['#34C759', '#28A745']}
              style={styles.headerButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.headerButtonText}>Add a Dish</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search foods..."
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Food List */}
      <FlatList
        data={getFilteredFoods()}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        style={styles.foodList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No foods found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first food to get started'}
            </Text>
          </View>
        }
      />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerButtonGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Categories
  categoryContainer: {
    marginBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    fontWeight: '600',
  },

  // Food List
  foodList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  foodItem: {
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
    marginBottom: 6,
  },
  foodInfo: {
    flex: 1,
  },
  foodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  dishIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },
  foodCategory: {
    color: '#8E8E93',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  userAddedBadge: {
    color: '#007AFF',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(0,122,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Nutrition Display
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 6,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 1,
  },
  nutritionLabel: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
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

  // Form Styles
  formHeader: {
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
  formTitle: {
    fontSize: 16,
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

  formContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Category Selector
  categorySelector: {
    flexDirection: 'row',
  },
  categorySelectorButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categorySelectorButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categorySelectorButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categorySelectorButtonTextActive: {
    fontWeight: '600',
  },

  // Nutrition Inputs
  nutritionInputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  nutritionInputGroup: {
    flex: 1,
    marginRight: 8,
  },
  nutritionInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },

  formSpacer: {
    height: 40,
  },
});