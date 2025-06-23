import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFood } from '../../context/FoodContext';
import { useMeal } from '../../context/MealContext';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsScreen() {
  const { foods, reloadFoods } = useFood();
  const { meals, updateMeal, addMeal, deleteMeal, reloadMeals } = useMeal();
  const { 
    selectedQuickFoods, 
    appPreferences, 
    updateQuickFoods, 
    updateAppPreferences, 
    resetSettings, 
    clearAllData 
  } = useSettings();
  
  const [activeSection, setActiveSection] = useState('meal-targets');
  const [editingMeal, setEditingMeal] = useState(null);
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);
  const [mealFormData, setMealFormData] = useState({
    name: '',
    macroTargets: { protein: '', carbs: '', fat: '' }
  });

  const sections = [
    { id: 'meal-targets', title: 'Meal Targets', icon: '🎯' },
    { id: 'quick-foods', title: 'Quick-Add Foods', icon: '⚡' },
    { id: 'preferences', title: 'App Preferences', icon: '⚙️' }
  ];

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

  const renderMealTargetItem = ({ item: meal }) => (
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
            P: {meal.macroTargets.protein}g | C: {meal.macroTargets.carbs}g | F: {meal.macroTargets.fat}g
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
      case 'meal-targets':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Customize Meal Targets</Text>
            <Text style={styles.sectionDescription}>
              Set your macro goals for each meal type
            </Text>
            
            <FlatList
              data={meals}
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
            
            <FlatList
              data={foods}
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
              {renderPreferenceItem(
                'Auto-Optimize',
                'Automatically optimize portions when adding foods',
                appPreferences.autoOptimize,
                (value) => updateAppPreferences({ autoOptimize: value })
              )}
              
              {renderPreferenceItem(
                'Notifications',
                'Receive reminders and updates (coming soon)',
                appPreferences.notifications,
                (value) => updateAppPreferences({ notifications: value })
              )}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
});