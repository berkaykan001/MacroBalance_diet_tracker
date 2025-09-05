import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, Switch, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFood } from '../../context/FoodContext';
import { useMeal } from '../../context/MealContext';
import { useSettings } from '../../context/SettingsContext';
import { CalculationService } from '../../services/calculationService';

export default function SettingsScreen() {
  const { foods, reloadFoods } = useFood();
  const { meals, updateMeal, addMeal, deleteMeal, reloadMeals } = useMeal();
  const { 
    selectedQuickFoods, 
    appPreferences,
    userProfile,
    updateQuickFoods, 
    updateAppPreferences, 
    updateUserProfile,
    resetSettings, 
    clearAllData 
  } = useSettings();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [editingMeal, setEditingMeal] = useState(null);
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);
  const [mealFormData, setMealFormData] = useState({
    name: '',
    macroTargets: { protein: '', carbs: '', fat: '' }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(userProfile?.goal || 'maintenance');
  
  // Profile editing states
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);
  const [editingProfile, setEditingProfile] = useState({
    age: userProfile?.age?.toString() || '',
    height: userProfile?.height?.toString() || '',
    weight: userProfile?.weight?.toString() || '',
    gender: userProfile?.gender || 'male',
    activityLevel: userProfile?.activityLevel || 'moderately_active',
    mealsPerDay: userProfile?.mealsPerDay || 4
  });

  const sections = [
    { id: 'profile', title: 'Personal Profile', icon: '👤' },
    { id: 'meal-targets', title: 'Meal Targets', icon: '🎯' },
    { id: 'quick-foods', title: 'Quick-Add Foods', icon: '⚡' },
    { id: 'preferences', title: 'App Preferences', icon: '⚙️' }
  ];

  // Goal options (same as onboarding)
  const GOAL_OPTIONS = [
    {
      id: 'cutting',
      title: 'Weight Loss (Cutting)',
      subtitle: 'Lose fat while preserving muscle',
      description: '15% calorie deficit with higher protein to maintain lean mass',
      icon: '📉'
    },
    {
      id: 'maintenance',
      title: 'Maintain Weight',
      subtitle: 'Stay at current weight',
      description: 'Balanced nutrition to maintain your current physique and weight',
      icon: '⚖️'
    },
    {
      id: 'bulking',
      title: 'Weight Gain (Bulking)',
      subtitle: 'Build muscle and gain weight',
      description: '15% calorie surplus with optimized macros for muscle growth',
      icon: '📈'
    },
    {
      id: 'aggressive_cutting',
      title: 'Aggressive Weight Loss',
      subtitle: 'Faster fat loss (Advanced)',
      description: '25% calorie deficit - requires discipline and experience',
      icon: '🔥'
    },
    {
      id: 'aggressive_bulking',
      title: 'Aggressive Weight Gain',
      subtitle: 'Faster muscle gain (Advanced)',
      description: '25% calorie surplus for rapid gains - may include some fat gain',
      icon: '⚡'
    }
  ];

  const handleGoalUpdate = async () => {
    if (!selectedGoal) return;

    // Show confirmation for aggressive options
    if (selectedGoal.includes('aggressive')) {
      setShowGoalSelector(false);
      // For web compatibility, use window.confirm instead of Alert.alert
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(
          'Aggressive Goal Selected\n\nAggressive goals require more discipline and experience. Are you sure you want to proceed?'
        );
        if (confirmed) {
          await saveGoal();
        }
      } else {
        Alert.alert(
          'Aggressive Goal Selected',
          'Aggressive goals require more discipline and experience. Are you sure you want to proceed?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: saveGoal }
          ]
        );
      }
    } else {
      setShowGoalSelector(false);
      await saveGoal();
    }
  };

  const saveGoal = async () => {
    try {
      await updateUserProfile({ goal: selectedGoal });
      Alert.alert('Success', 'Your fitness goal has been updated successfully!');
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update your goal. Please try again.');
    }
  };

  const handleProfileUpdate = async () => {
    // Validate inputs
    const age = parseInt(editingProfile.age);
    const height = parseInt(editingProfile.height);
    const weight = parseInt(editingProfile.weight);

    if (!age || age < 13 || age > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 13-100 years');
      return;
    }

    if (!height || height < 100 || height > 250) {
      Alert.alert('Invalid Height', 'Please enter a valid height between 100-250 cm');
      return;
    }

    if (!weight || weight < 30 || weight > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 30-300 kg');
      return;
    }

    try {
      await updateUserProfile({
        age,
        height,
        weight,
        gender: editingProfile.gender,
        activityLevel: editingProfile.activityLevel,
        mealsPerDay: editingProfile.mealsPerDay
      });
      
      setShowProfileEditor(false);
      
      // Trigger UI refresh
      setProfileUpdateTrigger(prev => prev + 1);
      
      Alert.alert('Success', 'Your profile has been updated successfully! Your macro targets have been recalculated based on your new information.');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update your profile. Please try again.');
    }
  };

  const openProfileEditor = () => {
    // Reset form with current values
    setEditingProfile({
      age: userProfile?.age?.toString() || '',
      height: userProfile?.height?.toString() || '',
      weight: userProfile?.weight?.toString() || '',
      gender: userProfile?.gender || 'male',
      activityLevel: userProfile?.activityLevel || 'moderately_active',
      mealsPerDay: userProfile?.mealsPerDay || 4
    });
    setShowProfileEditor(true);
  };

  const handleMealEdit = (meal) => {
    setEditingMeal(meal);
    setMealFormData({
      name: meal.name,
      macroTargets: {
        protein: meal.macroTargets.protein.toString(),
        carbs: meal.macroTargets.carbs.toString(),
        fat: meal.macroTargets.fat.toString()
      }
    });
  };

  const saveMealTargets = () => {
    if (!mealFormData.name.trim()) {
      Alert.alert('Error', 'Please enter a meal name.');
      return;
    }

    const mealData = {
      name: mealFormData.name,
      macroTargets: {
        protein: parseFloat(mealFormData.macroTargets.protein) || 0,
        carbs: parseFloat(mealFormData.macroTargets.carbs) || 0,
        fat: parseFloat(mealFormData.macroTargets.fat) || 0
      }
    };

    if (isCreatingMeal) {
      // Creating new meal
      addMeal(mealData);
      Alert.alert('Success', 'New meal created successfully!');
    } else if (editingMeal) {
      // Updating existing meal
      const updatedMeal = {
        ...editingMeal,
        ...mealData
      };
      updateMeal(updatedMeal);
      Alert.alert('Success', 'Meal updated successfully!');
    }

    setEditingMeal(null);
    setIsCreatingMeal(false);
    setMealFormData({ name: '', macroTargets: { protein: '', carbs: '', fat: '' } });
  };

  const startCreatingMeal = () => {
    setIsCreatingMeal(true);
    setEditingMeal(null);
    setMealFormData({ name: '', macroTargets: { protein: '', carbs: '', fat: '' } });
  };

  const deleteMealWithConfirmation = (meal) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${meal.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          deleteMeal(meal.id);
          Alert.alert('Success', 'Meal deleted successfully!');
        }}
      ]
    );
  };

  const cancelMealEdit = () => {
    setEditingMeal(null);
    setIsCreatingMeal(false);
    setMealFormData({ name: '', macroTargets: { protein: '', carbs: '', fat: '' } });
  };

  const toggleQuickFood = (foodId) => {
    if (selectedQuickFoods.includes(foodId)) {
      const updatedFoods = selectedQuickFoods.filter(id => id !== foodId);
      updateQuickFoods(updatedFoods);
    } else {
      if (selectedQuickFoods.length < 12) {
        const updatedFoods = [...selectedQuickFoods, foodId];
        updateQuickFoods(updatedFoods);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 12 quick-add foods.');
      }
    }
  };

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSectionButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        activeSection === item.id && styles.sectionButtonActive
      ]}
      onPress={() => setActiveSection(item.id)}
    >
      <Text style={styles.sectionIcon}>{item.icon}</Text>
      <Text style={[
        styles.sectionButtonText,
        activeSection === item.id && styles.sectionButtonTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderMealTargetItem = ({ item: meal }) => {
    const targetCalories = CalculationService.calculateTargetCalories(meal.macroTargets);
    
    return (
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.mealTargetCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.mealTargetHeader}>
          <View style={styles.mealTargetInfo}>
            <Text style={styles.mealTargetName}>{meal.name}</Text>
            <Text style={styles.mealTargetSubtext}>
              P: {meal.macroTargets.protein}g | C: {meal.macroTargets.carbs}g | F: {meal.macroTargets.fat}g | {targetCalories} cal
            </Text>
          </View>
        <View style={styles.mealTargetActions}>
          <TouchableOpacity 
            style={styles.editMealButton}
            onPress={() => handleMealEdit(meal)}
          >
            <Text style={styles.editMealButtonText}>Edit</Text>
          </TouchableOpacity>
          {meal.userCustom && (
            <TouchableOpacity 
              style={styles.deleteMealButton}
              onPress={() => deleteMealWithConfirmation(meal)}
            >
              <Text style={styles.deleteMealButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
    );
  };

  const renderQuickFoodItem = ({ item: food }) => {
    const isSelected = selectedQuickFoods.includes(food.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.quickFoodItem,
          isSelected && styles.quickFoodItemSelected
        ]}
        onPress={() => toggleQuickFood(food.id)}
      >
        <LinearGradient
          colors={isSelected ? ['#007AFF', '#0051D5'] : ['#1A1A1A', '#2A2A2A']}
          style={styles.quickFoodGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[
            styles.quickFoodName,
            isSelected && styles.quickFoodNameSelected
          ]}>
            {food.name}
          </Text>
          <Text style={[
            styles.quickFoodCategory,
            isSelected && styles.quickFoodCategorySelected
          ]}>
            {food.category}
          </Text>
          {isSelected && (
            <View style={styles.quickFoodCheckmark}>
              <Text style={styles.quickFoodCheckmarkText}>✓</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderPreferenceItem = (title, description, value, onValueChange) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3A3A3A', true: '#007AFF' }}
        thumbColor={value ? '#FFFFFF' : '#8E8E93'}
      />
    </View>
  );

  const renderDataAction = (title, description, action, destructive = false) => (
    <TouchableOpacity 
      style={[styles.dataActionItem, destructive && styles.dataActionDestructive]}
      onPress={action}
    >
      <View style={styles.dataActionInfo}>
        <Text style={[
          styles.dataActionTitle,
          destructive && styles.dataActionTitleDestructive
        ]}>
          {title}
        </Text>
        <Text style={styles.dataActionDescription}>{description}</Text>
      </View>
      <Text style={[
        styles.dataActionArrow,
        destructive && styles.dataActionArrowDestructive
      ]}>
        →
      </Text>
    </TouchableOpacity>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Personal Profile</Text>
            <Text style={styles.sectionDescription}>
              Update your personal information and fitness goals
            </Text>
            
            <View style={styles.preferencesContainer}>
              {/* Current Goal Display */}
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Current Goal</Text>
                  <Text style={styles.preferenceDescription}>
                    {GOAL_OPTIONS.find(g => g.id === (userProfile?.goal || 'maintenance'))?.title || 'Maintain Weight'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.goalChangeButton}
                  onPress={() => setShowGoalSelector(true)}
                >
                  <Text style={styles.goalChangeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* User Info Display */}
              {userProfile && (
                <>
                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>Age</Text>
                      <Text style={styles.preferenceDescription}>
                        {userProfile.age ? `${userProfile.age} years old` : 'Not set'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>Gender</Text>
                      <Text style={styles.preferenceDescription}>
                        {userProfile.gender ? (userProfile.gender === 'male' ? 'Male' : 'Female') : 'Not set'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>Height</Text>
                      <Text style={styles.preferenceDescription}>
                        {userProfile.height ? `${userProfile.height} cm` : 'Not set'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>Weight</Text>
                      <Text style={styles.preferenceDescription}>
                        {userProfile.weight ? `${userProfile.weight} kg` : 'Not set'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>Activity Level</Text>
                      <Text style={styles.preferenceDescription}>
                        {userProfile.activityLevel ? 
                          userProfile.activityLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          'Not set'
                        }
                      </Text>
                    </View>
                  </View>

                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>Meals Per Day</Text>
                      <Text style={styles.preferenceDescription}>
                        {userProfile.mealsPerDay || 4} meals per day
                      </Text>
                    </View>
                  </View>

                  {/* Current Calculated Targets */}
                  {userProfile?.age && userProfile?.height && userProfile?.weight && (
                    <>
                      <View style={styles.sectionDivider}>
                        <Text style={styles.sectionDividerText}>Current Calculated Targets</Text>
                      </View>
                      
                      {(() => {
                        try {
                          const calculatedTargets = require('../../services/MacroCalculationService').default.calculatePersonalizedNutrition(userProfile);
                          return (
                            <>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceInfo}>
                                  <Text style={styles.preferenceTitle}>Daily Calories</Text>
                                  <Text style={styles.preferenceDescriptionHighlight}>
                                    {calculatedTargets?.calculations?.targetCalories || 'Not calculated'} calories
                                  </Text>
                                </View>
                              </View>
                              
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceInfo}>
                                  <Text style={styles.preferenceTitle}>Daily Macros</Text>
                                  <Text style={styles.preferenceDescriptionHighlight}>
                                    {calculatedTargets?.dailyTargets?.protein || 0}g protein • {' '}
                                    {calculatedTargets?.dailyTargets?.carbs || 0}g carbs • {' '}
                                    {calculatedTargets?.dailyTargets?.fat || 0}g fat
                                  </Text>
                                </View>
                              </View>
                            </>
                          );
                        } catch (error) {
                          console.error('Error calculating targets for display:', error);
                          return (
                            <View style={styles.preferenceItem}>
                              <View style={styles.preferenceInfo}>
                                <Text style={styles.preferenceTitle}>Calculated Targets</Text>
                                <Text style={styles.preferenceDescription}>
                                  Complete your profile to see calculated targets
                                </Text>
                              </View>
                            </View>
                          );
                        }
                      })()}
                    </>
                  )}

                  {/* Edit Profile Button */}
                  <View style={styles.preferenceItem}>
                    <TouchableOpacity
                      style={styles.editProfileButton}
                      onPress={openProfileEditor}
                    >
                      <Text style={styles.editProfileButtonText}>Edit Personal Info</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        );

      case 'meal-targets':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Customize Meal Targets</Text>
            <Text style={styles.sectionDescription}>
              Set your macro goals for each meal type
            </Text>
            
            <FlatList
              data={meals.filter(meal => meal.name !== 'Extra')}
              renderItem={renderMealTargetItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />

            {/* Add New Meal Button */}
            <TouchableOpacity 
              style={styles.addMealButton}
              onPress={startCreatingMeal}
            >
              <LinearGradient
                colors={['#007AFF', '#0051D5']}
                style={styles.addMealButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.addMealButtonText}>+ Add New Meal</Text>
              </LinearGradient>
            </TouchableOpacity>

            {(editingMeal || isCreatingMeal) && (
              <View style={styles.editMealModal}>
                <LinearGradient
                  colors={['#1A1A1A', '#2A2A2A']}
                  style={styles.editMealContent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.editMealHeader}>
                    <Text style={styles.editMealTitle}>
                      {isCreatingMeal ? 'Create New Meal' : `Edit ${editingMeal?.name}`}
                    </Text>
                    <TouchableOpacity 
                      style={styles.closeEditButton}
                      onPress={cancelMealEdit}
                    >
                      <Text style={styles.closeEditButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Meal Name Input */}
                  <View style={styles.mealNameInputGroup}>
                    <Text style={styles.macroInputLabel}>Meal Name</Text>
                    <TextInput
                      style={styles.mealNameInput}
                      value={mealFormData.name}
                      onChangeText={(text) => setMealFormData({
                        ...mealFormData,
                        name: text
                      })}
                      placeholder="Enter meal name"
                      placeholderTextColor="#8E8E93"
                    />
                  </View>

                  <View style={styles.macroInputRow}>
                    <View style={styles.macroInputGroup}>
                      <Text style={styles.macroInputLabel}>Protein (g)</Text>
                      <TextInput
                        style={styles.macroInput}
                        value={mealFormData.macroTargets.protein}
                        onChangeText={(text) => setMealFormData({
                          ...mealFormData,
                          macroTargets: { ...mealFormData.macroTargets, protein: text }
                        })}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#8E8E93"
                      />
                    </View>
                    
                    <View style={styles.macroInputGroup}>
                      <Text style={styles.macroInputLabel}>Carbs (g)</Text>
                      <TextInput
                        style={styles.macroInput}
                        value={mealFormData.macroTargets.carbs}
                        onChangeText={(text) => setMealFormData({
                          ...mealFormData,
                          macroTargets: { ...mealFormData.macroTargets, carbs: text }
                        })}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#8E8E93"
                      />
                    </View>
                    
                    <View style={styles.macroInputGroup}>
                      <Text style={styles.macroInputLabel}>Fat (g)</Text>
                      <TextInput
                        style={styles.macroInput}
                        value={mealFormData.macroTargets.fat}
                        onChangeText={(text) => setMealFormData({
                          ...mealFormData,
                          macroTargets: { ...mealFormData.macroTargets, fat: text }
                        })}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#8E8E93"
                      />
                    </View>
                  </View>

                  {/* Target Calories Display - Calculated and non-editable */}
                  <View style={styles.targetCaloriesDisplay}>
                    <Text style={styles.targetCaloriesLabel}>Target Calories (calculated)</Text>
                    <View style={styles.targetCaloriesValue}>
                      <Text style={styles.targetCaloriesText}>
                        {CalculationService.calculateTargetCalories({
                          protein: parseFloat(mealFormData.macroTargets.protein) || 0,
                          carbs: parseFloat(mealFormData.macroTargets.carbs) || 0,
                          fat: parseFloat(mealFormData.macroTargets.fat) || 0
                        })} cal
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.saveMealButton}
                    onPress={saveMealTargets}
                  >
                    <LinearGradient
                      colors={['#007AFF', '#0051D5']}
                      style={styles.saveMealButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.saveMealButtonText}>
                        {isCreatingMeal ? 'Create Meal' : 'Save Changes'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>
        );

      case 'quick-foods':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Quick-Add Foods</Text>
            <Text style={styles.sectionDescription}>
              Select your favorite foods for quick access in meal planning ({selectedQuickFoods.length}/12)
            </Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods by name or category..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.searchClearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.searchClearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={filteredFoods}
              renderItem={renderQuickFoodItem}
              keyExtractor={(item) => item.id}
              key="quickFoods-3-columns"
              numColumns={3}
              columnWrapperStyle={styles.quickFoodRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        );

      case 'preferences':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            <Text style={styles.sectionDescription}>
              Customize your MacroBalance experience
            </Text>
            
            <View style={styles.preferencesContainer}>
              
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>Day Reset Hour</Text>
                  <Text style={styles.preferenceDescription}>
                    When your day resets
                  </Text>
                </View>
                <View style={styles.hourPickerContainer}>
                  <TouchableOpacity
                    style={styles.hourButton}
                    onPress={() => {
                      const currentHour = appPreferences.dayResetHour || 4;
                      const newHour = currentHour > 0 ? currentHour - 1 : 23;
                      updateAppPreferences({ dayResetHour: newHour });
                    }}
                  >
                    <Text style={styles.hourButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.hourText}>{appPreferences.dayResetHour || 4}:00</Text>
                  <TouchableOpacity
                    style={styles.hourButton}
                    onPress={() => {
                      const currentHour = appPreferences.dayResetHour || 4;
                      const newHour = currentHour < 23 ? currentHour + 1 : 0;
                      updateAppPreferences({ dayResetHour: newHour });
                    }}
                  >
                    <Text style={styles.hourButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Cheat Meal/Day Settings Section */}
              <View style={styles.cheatSettingsSection}>
                <Text style={styles.cheatSectionTitle}>🎉 Cheat Meal & Day Limits</Text>
                <Text style={styles.cheatSectionDescription}>
                  Configure how many cheat meals and cheat days you can use per period
                </Text>
                
                {/* Period Type Selector */}
                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>Reset Period</Text>
                    <Text style={styles.preferenceDescription}>
                      How often your cheat meal/day limits reset
                    </Text>
                  </View>
                  <View style={styles.periodSelectorContainer}>
                    <TouchableOpacity
                      style={[
                        styles.periodButton,
                        appPreferences.cheatPeriodType === 'weekly' && styles.periodButtonActive
                      ]}
                      onPress={() => updateAppPreferences({ cheatPeriodType: 'weekly' })}
                    >
                      <Text style={[
                        styles.periodButtonText,
                        appPreferences.cheatPeriodType === 'weekly' && styles.periodButtonTextActive
                      ]}>
                        Weekly
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.periodButton,
                        appPreferences.cheatPeriodType === 'monthly' && styles.periodButtonActive
                      ]}
                      onPress={() => updateAppPreferences({ cheatPeriodType: 'monthly' })}
                    >
                      <Text style={[
                        styles.periodButtonText,
                        appPreferences.cheatPeriodType === 'monthly' && styles.periodButtonTextActive
                      ]}>
                        Monthly
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Cheat Meals Per Period */}
                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>Cheat Meals</Text>
                    <Text style={styles.preferenceDescription}>
                      Number of cheat meals per {appPreferences.cheatPeriodType === 'weekly' ? 'week' : 'month'}
                    </Text>
                  </View>
                  <View style={styles.numberPickerContainer}>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => {
                        const current = appPreferences.cheatMealsPerPeriod || 2;
                        const newValue = Math.max(0, current - 1);
                        updateAppPreferences({ cheatMealsPerPeriod: newValue });
                      }}
                    >
                      <Text style={styles.numberButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.numberText}>{appPreferences.cheatMealsPerPeriod || 2}</Text>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => {
                        const current = appPreferences.cheatMealsPerPeriod || 2;
                        const newValue = Math.min(10, current + 1);
                        updateAppPreferences({ cheatMealsPerPeriod: newValue });
                      }}
                    >
                      <Text style={styles.numberButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Cheat Days Per Period */}
                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>Cheat Days</Text>
                    <Text style={styles.preferenceDescription}>
                      Number of cheat days per {appPreferences.cheatPeriodType === 'weekly' ? 'week' : 'month'}
                    </Text>
                  </View>
                  <View style={styles.numberPickerContainer}>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => {
                        const current = appPreferences.cheatDaysPerPeriod || 1;
                        const newValue = Math.max(0, current - 1);
                        updateAppPreferences({ cheatDaysPerPeriod: newValue });
                      }}
                    >
                      <Text style={styles.numberButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.numberText}>{appPreferences.cheatDaysPerPeriod || 1}</Text>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => {
                        const current = appPreferences.cheatDaysPerPeriod || 1;
                        const newValue = Math.min(7, current + 1);
                        updateAppPreferences({ cheatDaysPerPeriod: newValue });
                      }}
                    >
                      <Text style={styles.numberButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
            </View>

            <View style={styles.resetSection}>
              <Text style={styles.resetSectionTitle}>Reset App</Text>
              <Text style={styles.resetSectionDescription}>
                Reset all app data including foods, meals, and settings
              </Text>
              
              {renderDataAction(
                'Reset Everything',
                'Delete all data and restore app to defaults',
                () => {
                  // Add confirmation dialog before reset
                  if (typeof window !== 'undefined') {
                    // For web environment
                    const confirmed = window.confirm(
                      'Are you sure you want to reset everything?\n\nThis will delete ALL your data including:\n• Custom foods and dishes\n• Meal targets\n• App settings\n• Quick-add foods\n\nThis action cannot be undone!'
                    );
                    if (confirmed) {
                      clearAllData();
                      Alert.alert('Success', 'All data has been reset successfully!');
                    }
                  } else {
                    // For mobile environment
                    Alert.alert(
                      'Reset Everything',
                      'Are you sure you want to reset everything?\n\nThis will delete ALL your data including:\n• Custom foods and dishes\n• Meal targets\n• App settings\n• Quick-add foods\n\nThis action cannot be undone!',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Reset Everything', 
                          style: 'destructive',
                          onPress: () => {
                            clearAllData();
                            Alert.alert('Success', 'All data has been reset successfully!');
                          }
                        }
                      ]
                    );
                  }
                },
                true
              )}
            </View>
          </View>
        );


      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Section Navigation */}
      <View style={styles.sectionNavigation}>
        <FlatList
          data={sections}
          renderItem={renderSectionButton}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionButtonContainer}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderSectionContent()}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Goal Selector Modal */}
      <Modal
        visible={showGoalSelector}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.goalModalOverlay}>
          <View style={styles.goalModalContainer}>
            <View style={styles.goalModalHeader}>
              <Text style={styles.goalModalTitle}>Choose Your Goal</Text>
              <TouchableOpacity
                style={styles.goalModalCloseButton}
                onPress={() => setShowGoalSelector(false)}
              >
                <Text style={styles.goalModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.goalModalContent} showsVerticalScrollIndicator={false}>
              {GOAL_OPTIONS.map((goal) => (
                <Pressable
                  key={goal.id}
                  style={[
                    styles.goalSelectionCard,
                    selectedGoal === goal.id && styles.goalSelectionCardSelected
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                >
                  <View style={styles.goalSelectionContent}>
                    <Text style={styles.goalSelectionIcon}>{goal.icon}</Text>
                    <View style={styles.goalSelectionTextContainer}>
                      <Text style={[
                        styles.goalSelectionTitle,
                        selectedGoal === goal.id && styles.goalSelectionTitleSelected
                      ]}>
                        {goal.title}
                      </Text>
                      <Text style={[
                        styles.goalSelectionSubtitle,
                        selectedGoal === goal.id && styles.goalSelectionSubtitleSelected
                      ]}>
                        {goal.subtitle}
                      </Text>
                      <Text style={styles.goalSelectionDescription}>{goal.description}</Text>
                    </View>
                    <View style={[
                      styles.goalSelectionIndicator,
                      selectedGoal === goal.id && styles.goalSelectionIndicatorSelected
                    ]}>
                      {selectedGoal === goal.id && <Text style={styles.goalCheckmark}>✓</Text>}
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.goalModalButtons}>
              <TouchableOpacity
                style={styles.goalModalSecondaryButton}
                onPress={() => setShowGoalSelector(false)}
              >
                <Text style={styles.goalModalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goalModalPrimaryButton}
                onPress={handleGoalUpdate}
              >
                <Text style={styles.goalModalPrimaryButtonText}>Update Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Editor Modal */}
      <Modal
        visible={showProfileEditor}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.goalModalOverlay}>
          <View style={styles.profileModalContainer}>
            <View style={styles.goalModalHeader}>
              <Text style={styles.goalModalTitle}>Edit Personal Info</Text>
              <TouchableOpacity
                style={styles.goalModalCloseButton}
                onPress={() => setShowProfileEditor(false)}
              >
                <Text style={styles.goalModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.profileModalContent} showsVerticalScrollIndicator={false}>
              {/* Age Input */}
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Age (years)</Text>
                <TextInput
                  style={styles.profileInput}
                  value={editingProfile.age}
                  onChangeText={(text) => setEditingProfile(prev => ({...prev, age: text}))}
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor="#8E8E93"
                />
              </View>

              {/* Gender Selector */}
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Gender</Text>
                <View style={styles.genderSelectorContainer}>
                  <Pressable
                    style={[
                      styles.genderOptionButton,
                      editingProfile.gender === 'male' && styles.genderOptionButtonSelected
                    ]}
                    onPress={() => setEditingProfile(prev => ({...prev, gender: 'male'}))}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      editingProfile.gender === 'male' && styles.genderOptionTextSelected
                    ]}>Male</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.genderOptionButton,
                      editingProfile.gender === 'female' && styles.genderOptionButtonSelected
                    ]}
                    onPress={() => setEditingProfile(prev => ({...prev, gender: 'female'}))}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      editingProfile.gender === 'female' && styles.genderOptionTextSelected
                    ]}>Female</Text>
                  </Pressable>
                </View>
              </View>

              {/* Height Input */}
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.profileInput}
                  value={editingProfile.height}
                  onChangeText={(text) => setEditingProfile(prev => ({...prev, height: text}))}
                  keyboardType="numeric"
                  placeholder="175"
                  placeholderTextColor="#8E8E93"
                />
              </View>

              {/* Weight Input */}
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.profileInput}
                  value={editingProfile.weight}
                  onChangeText={(text) => setEditingProfile(prev => ({...prev, weight: text}))}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor="#8E8E93"
                />
              </View>

              {/* Activity Level Selector */}
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Activity Level</Text>
                {[
                  { id: 'sedentary', title: 'Sedentary', description: 'Little or no exercise' },
                  { id: 'lightly_active', title: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
                  { id: 'moderately_active', title: 'Moderately Active', description: 'Exercise 3-5 days/week' },
                  { id: 'very_active', title: 'Very Active', description: 'Hard exercise 6-7 days/week' },
                  { id: 'super_active', title: 'Super Active', description: 'Very hard exercise, physical job' }
                ].map((level) => (
                  <Pressable
                    key={level.id}
                    style={[
                      styles.activityLevelOption,
                      editingProfile.activityLevel === level.id && styles.activityLevelOptionSelected
                    ]}
                    onPress={() => setEditingProfile(prev => ({...prev, activityLevel: level.id}))}
                  >
                    <View style={styles.activityLevelContent}>
                      <Text style={[
                        styles.activityLevelTitle,
                        editingProfile.activityLevel === level.id && styles.activityLevelTitleSelected
                      ]}>
                        {level.title}
                      </Text>
                      <Text style={styles.activityLevelDescription}>{level.description}</Text>
                    </View>
                    <View style={[
                      styles.activityLevelIndicator,
                      editingProfile.activityLevel === level.id && styles.activityLevelIndicatorSelected
                    ]}>
                      {editingProfile.activityLevel === level.id && <Text style={styles.goalCheckmark}>✓</Text>}
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Meals Per Day */}
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Meals Per Day</Text>
                <View style={styles.mealsPerDayContainer}>
                  {[3, 4, 5, 6].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.mealsPerDayOption,
                        editingProfile.mealsPerDay === num && styles.mealsPerDayOptionSelected
                      ]}
                      onPress={() => setEditingProfile(prev => ({...prev, mealsPerDay: num}))}
                    >
                      <Text style={[
                        styles.mealsPerDayText,
                        editingProfile.mealsPerDay === num && styles.mealsPerDayTextSelected
                      ]}>
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.goalModalButtons}>
              <TouchableOpacity
                style={styles.goalModalSecondaryButton}
                onPress={() => setShowProfileEditor(false)}
              >
                <Text style={styles.goalModalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goalModalPrimaryButton}
                onPress={handleProfileUpdate}
              >
                <Text style={styles.goalModalPrimaryButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
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

  // Section Navigation
  sectionNavigation: {
    marginBottom: 12,
  },
  sectionButtonContainer: {
    paddingHorizontal: 16,
  },
  sectionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sectionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sectionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  sectionButtonTextActive: {
    fontWeight: '600',
  },

  // Content
  scrollContainer: {
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 16,
  },

  // Meal Targets
  mealTargetCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  mealTargetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTargetInfo: {
    flex: 1,
  },
  mealTargetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  mealTargetSubtext: {
    fontSize: 11,
    color: '#8E8E93',
  },
  editMealButton: {
    backgroundColor: 'rgba(0,122,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editMealButtonText: {
    color: '#007AFF',
    fontSize: 11,
    fontWeight: '600',
  },
  mealTargetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteMealButton: {
    backgroundColor: 'rgba(255,69,58,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteMealButtonText: {
    color: '#FF453A',
    fontSize: 10,
    fontWeight: '600',
  },

  // Edit Meal Modal
  editMealModal: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
    bottom: -100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editMealContent: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  editMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editMealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeEditButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,69,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeEditButtonText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  macroInputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  macroInputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  macroInputLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  macroInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
  saveMealButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveMealButtonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveMealButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Target Calories Display
  targetCaloriesDisplay: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  targetCaloriesLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 6,
    textAlign: 'center',
  },
  targetCaloriesValue: {
    alignItems: 'center',
  },
  targetCaloriesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D084',
    textAlign: 'center',
  },

  // Add New Meal Button
  addMealButton: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addMealButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addMealButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Meal Name Input
  mealNameInputGroup: {
    marginBottom: 16,
  },
  mealNameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Search Bar
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
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

  // Quick Foods
  quickFoodRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickFoodItem: {
    flex: 1,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quickFoodItemSelected: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quickFoodGradient: {
    padding: 8,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  quickFoodName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 1,
  },
  quickFoodNameSelected: {
    color: '#FFFFFF',
  },
  quickFoodCategory: {
    color: '#8E8E93',
    fontSize: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  quickFoodCategorySelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  quickFoodCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickFoodCheckmarkText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Preferences
  preferencesContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 14,
  },

  // Reset Section
  resetSection: {
    marginTop: 20,
  },
  resetSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resetSectionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 16,
  },

  // Data Management (reused for reset button)
  dataActionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dataActionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dataActionDestructive: {
    backgroundColor: 'rgba(255,69,58,0.1)',
  },
  dataActionInfo: {
    flex: 1,
  },
  dataActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dataActionTitleDestructive: {
    color: '#FF453A',
  },
  dataActionDescription: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 14,
  },
  dataActionArrow: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  dataActionArrowDestructive: {
    color: '#FF453A',
  },

  bottomSpacer: {
    height: 40,
  },

  // Hour Picker
  hourPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  hourButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hourText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },

  // Cheat Settings Styles
  cheatSettingsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cheatSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9F00',
    marginBottom: 4,
  },
  cheatSectionDescription: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 16,
  },
  
  // Period Selector
  periodSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Number Picker (similar to hour picker but for cheat counts)
  numberPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  numberButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  numberText: {
    color: '#FF9F00',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },

  // Goal Change Button
  goalChangeButton: {
    backgroundColor: 'rgba(0,122,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  goalChangeButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Goal Modal Styles
  goalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  goalModalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  goalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalModalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalModalCloseText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  goalModalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalModalSecondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  goalModalSecondaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  goalModalPrimaryButton: {
    flex: 1,
    backgroundColor: '#00D084',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  goalModalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Goal Selection Card Styles
  goalSelectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalSelectionCardSelected: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  goalSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  goalSelectionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  goalSelectionTextContainer: {
    flex: 1,
  },
  goalSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  goalSelectionTitleSelected: {
    color: '#00D084',
  },
  goalSelectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  goalSelectionSubtitleSelected: {
    color: '#FFFFFF',
  },
  goalSelectionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  goalSelectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSelectionIndicatorSelected: {
    borderColor: '#00D084',
    backgroundColor: '#00D084',
  },
  goalCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Edit Profile Button
  editProfileButton: {
    backgroundColor: '#00D084',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Modal Styles
  profileModalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  profileModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileInputGroup: {
    marginBottom: 24,
  },
  profileInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  profileInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  // Gender Selector
  genderSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOptionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderOptionButtonSelected: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  genderOptionTextSelected: {
    color: '#00D084',
  },

  // Activity Level Options
  activityLevelOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityLevelOptionSelected: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  activityLevelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  activityLevelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  activityLevelTitleSelected: {
    color: '#00D084',
  },
  activityLevelDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 12,
  },
  activityLevelIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityLevelIndicatorSelected: {
    borderColor: '#00D084',
    backgroundColor: '#00D084',
  },

  // Meals Per Day
  mealsPerDayContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mealsPerDayOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealsPerDayOptionSelected: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  mealsPerDayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E93',
  },
  mealsPerDayTextSelected: {
    color: '#00D084',
  },

  // Section Divider
  sectionDivider: {
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  sectionDividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D084',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Highlighted preference description
  preferenceDescriptionHighlight: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: '600',
    lineHeight: 14,
  },
});