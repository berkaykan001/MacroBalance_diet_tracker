import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMeal } from '../../context/MealContext';
import { useFood } from '../../context/FoodContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import EditMealModal from '../../components/EditMealModal';
import MacroTrendsSection from '../../components/charts/MacroTrendsSection';
import WeeklyComparisonChart from '../../components/charts/WeeklyComparisonChart';
import { CircularProgressSection } from '../../components/charts/CircularProgress';
import ConsistencyHeatmap from '../../components/charts/ConsistencyHeatmap';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { 
    getDailyProgress, 
    getMealsCompletedToday, 
    getTodaysMealPlans,
    getMealById,
    deleteMealPlan,
    updateMealPlan,
    getCheatStats
  } = useMeal();
  const { foods } = useFood();
  const { appPreferences } = useSettings();

  // Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);

  const dailyProgress = getDailyProgress();
  const mealsToday = getMealsCompletedToday().filter(meal => meal.name !== 'Extra');
  const todaysMealPlans = getTodaysMealPlans();

  // Note: getNextMeal logic postponed for now

  const getFoodById = (id) => {
    return foods.find(food => food.id === id);
  };



  const handleEditMeal = (mealPlan) => {
    const meal = getMealById(mealPlan.mealId);
    navigation.navigate('Plan Meal', {
      editingMealPlan: mealPlan,
      preselectedMealId: mealPlan.mealId
    });
  };

  const handleCloseModal = () => {
    setEditModalVisible(false);
    setSelectedMealPlan(null);
  };

  const handleMealUpdate = (updatedMealPlan) => {
    // The modal already calls updateMealPlan, so we just need to close
    handleCloseModal();
  };

  const handleDeleteMeal = (mealPlan) => {
    const meal = getMealById(mealPlan.mealId);
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete this ${meal?.name || 'meal'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMealPlan(mealPlan.id)
        }
      ]
    );
  };


  const getProgressColor = (percentage, isMax = false) => {
    if (isMax) {
      // For max limits (lower is better): sodium, trans fat, etc.
      if (percentage <= 70) return ['#00D084', '#00A86B']; // Green - good
      if (percentage <= 90) return ['#F1C40F', '#E67E22']; // Yellow - warning  
      return ['#FF453A', '#FF6B6B']; // Red - over limit
    } else {
      // For minimum targets (higher is better): vitamins, minerals, etc.
      if (percentage >= 90) return ['#00D084', '#00A86B']; // Green - complete
      if (percentage >= 60) return ['#F1C40F', '#E67E22']; // Yellow - partial
      return ['#FF453A', '#FF6B6B']; // Red - insufficient
    }
  };

  const renderSubMacroBar = (label, current, target, isMax = false, unit = 'g') => {
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const progressColor = getProgressColor(percentage, isMax);
    
    return (
      <View style={styles.subMacroItem}>
        <View style={styles.subMacroHeader}>
          <Text style={styles.subMacroLabel}>{label}</Text>
          <Text style={styles.subMacroValue}>
            {Math.round(current * 10) / 10}{isMax ? `/${target}` : `/${target}`}{unit}
          </Text>
        </View>
        <View style={styles.subMacroTrack}>
          <LinearGradient
            colors={progressColor}
            style={[styles.subMacroFill, { width: `${Math.min(100, percentage)}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    );
  };

  const renderMealStatus = ({ item: meal }) => (
    <View style={[styles.mealStatusItem, meal.completed && styles.mealStatusCompleted]}>
      <View style={styles.mealStatusIcon}>
        <Text style={styles.mealStatusEmoji}>
          {meal.completed ? '✅' : '⭕'}
        </Text>
      </View>
      <Text style={[styles.mealStatusText, meal.completed && styles.mealStatusTextCompleted]}>
        {meal.name}
      </Text>
    </View>
  );


  const renderEatenMeal = ({ item: mealPlan }) => {
    const meal = getMealById(mealPlan.mealId);
    
    // Generate display name for extras (Extra 1, Extra 2, etc.)
    const getDisplayName = () => {
      let baseName;
      if (meal?.name === 'Extra') {
        // Get all today's extras in chronological order
        const todaysExtras = todaysMealPlans
          .filter(plan => {
            const planMeal = getMealById(plan.mealId);
            return planMeal?.name === 'Extra';
          })
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Find the index of current extra
        const extraIndex = todaysExtras.findIndex(extra => extra.id === mealPlan.id);
        baseName = `Extra ${extraIndex + 1}`;
      } else {
        baseName = meal?.name || 'Unknown Meal';
      }
      
      // Add cheat meal indication
      return mealPlan.isCheatMeal ? `${baseName} (cheat meal)` : baseName;
    };
    
    const foodSummary = mealPlan.selectedFoods
      .slice(0, 3) // Show only first 3 foods
      .map(selectedFood => {
        const food = getFoodById(selectedFood.foodId);
        return food ? `${food.name} (${selectedFood.portionGrams}g)` : null;
      })
      .filter(Boolean)
      .join(', ');
    
    const remainingCount = Math.max(0, mealPlan.selectedFoods.length - 3);
    const displayText = remainingCount > 0 
      ? `${foodSummary}${remainingCount > 0 ? ` +${remainingCount} more` : ''}`
      : foodSummary;

    // Calculate macro differences from targets
    const calculateDifference = (actual, target) => {
      const diff = actual - target;
      return diff >= 0 ? `(+${diff})` : `(${diff})`;
    };

    const actualMacros = mealPlan.calculatedMacros || {};
    const targets = meal?.macroTargets || {};
    
    // Calculate calories target (4*protein + 4*carbs + 9*fat)
    const caloriesTarget = Math.round((targets.protein || 0) * 4 + (targets.carbs || 0) * 4 + (targets.fat || 0) * 9);
    
    const actualCalories = Math.round(actualMacros.calories || 0);
    const actualProtein = Math.round(actualMacros.protein || 0);
    const actualCarbs = Math.round(actualMacros.carbs || 0);
    const actualFat = Math.round(actualMacros.fat || 0);

    const calorieDiff = calculateDifference(actualCalories, caloriesTarget);
    const proteinDiff = calculateDifference(actualProtein, Math.round(targets.protein || 0));
    const carbsDiff = calculateDifference(actualCarbs, Math.round(targets.carbs || 0));
    const fatDiff = calculateDifference(actualFat, Math.round(targets.fat || 0));

    return (
      <TouchableOpacity 
        style={styles.eatenMealItem}
        onPress={() => handleEditMeal(mealPlan)}
        onLongPress={() => handleDeleteMeal(mealPlan)}
      >
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.eatenMealGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.eatenMealHeader}>
            <Text style={styles.eatenMealName}>{getDisplayName()}</Text>
            <Text style={styles.eatenMealTime}>
              {new Date(mealPlan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.eatenMealFoods} numberOfLines={2}>
            {displayText || 'No foods selected'}
          </Text>
          <View style={styles.eatenMealMacros}>
            <Text style={styles.eatenMealMacroText}>
              {actualCalories} cal {calorieDiff}
            </Text>
            <Text style={styles.eatenMealMacroText}>
              {actualProtein}p {proteinDiff}
            </Text>
            <Text style={styles.eatenMealMacroText}>
              {actualCarbs}c {carbsDiff}
            </Text>
            <Text style={styles.eatenMealMacroText}>
              {actualFat}f {fatDiff}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        {/* Circular Progress Section */}
        <CircularProgressSection />

        {/* Daily Progress Card */}
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
          </View>

          {/* Sub-Macro Progress */}
          <View style={styles.subMacroSection}>
            <Text style={styles.subMacroSectionTitle}>Nutritional Breakdown</Text>
            <View style={styles.subMacroGrid}>
              {renderSubMacroBar('Omega-3', dailyProgress.consumed.omega3, dailyProgress.subMacroTargets.omega3, false)}
              {renderSubMacroBar('Monounsaturated', dailyProgress.consumed.monounsaturatedFat, dailyProgress.subMacroTargets.monounsaturatedFat, false)}
              {renderSubMacroBar('Polyunsaturated', dailyProgress.consumed.polyunsaturatedFat, dailyProgress.subMacroTargets.polyunsaturatedFat, false)}
              {renderSubMacroBar('Fiber', dailyProgress.consumed.fiber, dailyProgress.subMacroTargets.minFiber, false)}
              {renderSubMacroBar('Saturated Fat', dailyProgress.consumed.saturatedFat, dailyProgress.subMacroTargets.maxSaturatedFat, true)}
              {renderSubMacroBar('Trans Fat', dailyProgress.consumed.transFat, dailyProgress.subMacroTargets.maxTransFat, true)}
              {renderSubMacroBar('Added Sugars', dailyProgress.consumed.addedSugars, dailyProgress.subMacroTargets.maxAddedSugars, true)}
              {renderSubMacroBar('Natural Sugars', dailyProgress.consumed.naturalSugars, dailyProgress.subMacroTargets.maxNaturalSugars, true)}
            </View>
          </View>

          {/* Micronutrient Progress */}
          <View style={styles.micronutrientSection}>
            <Text style={styles.micronutrientSectionTitle}>Essential Vitamins & Minerals</Text>
            <View style={styles.micronutrientGrid}>
              {renderSubMacroBar('Iron', dailyProgress.consumed.iron, dailyProgress.micronutrientTargets.iron, false, 'mg')}
              {renderSubMacroBar('Calcium', dailyProgress.consumed.calcium, dailyProgress.micronutrientTargets.calcium, false, 'mg')}
              {renderSubMacroBar('Zinc', dailyProgress.consumed.zinc, dailyProgress.micronutrientTargets.zinc, false, 'mg')}
              {renderSubMacroBar('Magnesium', dailyProgress.consumed.magnesium, dailyProgress.micronutrientTargets.magnesium, false, 'mg')}
              {renderSubMacroBar('Sodium', dailyProgress.consumed.sodium, dailyProgress.micronutrientTargets.sodium, true, 'mg')}
              {renderSubMacroBar('Potassium', dailyProgress.consumed.potassium, dailyProgress.micronutrientTargets.potassium, false, 'mg')}
              {renderSubMacroBar('Vitamin B6', dailyProgress.consumed.vitaminB6, dailyProgress.micronutrientTargets.vitaminB6, false, 'mg')}
              {renderSubMacroBar('Vitamin B12', dailyProgress.consumed.vitaminB12, dailyProgress.micronutrientTargets.vitaminB12, false, 'μg')}
              {renderSubMacroBar('Vitamin C', dailyProgress.consumed.vitaminC, dailyProgress.micronutrientTargets.vitaminC, false, 'mg')}
              {renderSubMacroBar('Vitamin D', dailyProgress.consumed.vitaminD, dailyProgress.micronutrientTargets.vitaminD, false, 'μg')}
            </View>
          </View>

          {/* Meal Status */}
          <View style={styles.mealStatusContainer}>
            <Text style={styles.mealStatusTitle}>Meals Today</Text>
            <FlatList
              data={mealsToday}
              renderItem={renderMealStatus}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mealStatusList}
            />
          </View>
        </LinearGradient>

        {/* Cheat Usage Statistics Card */}
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎉 Cheat Usage</Text>
            <Text style={styles.cardSubtitle}>
              {appPreferences.cheatPeriodType === 'weekly' ? 'This Week' : 'This Month'}
            </Text>
          </View>
          
          {(() => {
            const stats = getCheatStats(appPreferences);
            
            const renderCheatProgressBar = (type, used, limit, color) => {
              const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
              const remaining = Math.max(0, limit - used);
              
              return (
                <View style={styles.cheatProgressContainer}>
                  <View style={styles.cheatProgressHeader}>
                    <Text style={styles.cheatProgressLabel}>{type}</Text>
                    <Text style={styles.cheatProgressValue}>
                      {used}/{limit} ({remaining} remaining)
                    </Text>
                  </View>
                  <View style={styles.cheatProgressTrack}>
                    <LinearGradient
                      colors={percentage >= 100 ? ['#FF453A', '#FF6B6B'] : [color, color + '80']}
                      style={[styles.cheatProgressFill, { width: `${Math.min(100, percentage)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <View style={styles.cheatProgressStatus}>
                    {percentage >= 100 ? (
                      <Text style={styles.cheatProgressStatusText}>🚫 Limit reached</Text>
                    ) : percentage >= 80 ? (
                      <Text style={styles.cheatProgressStatusText}>⚠️ Almost at limit</Text>
                    ) : (
                      <Text style={styles.cheatProgressStatusText}>✅ Available</Text>
                    )}
                  </View>
                </View>
              );
            };
            
            return (
              <View style={styles.cheatStatsContainer}>
                {renderCheatProgressBar('Cheat Meals', stats.cheatMeals.used, stats.cheatMeals.limit, '#FF9F00')}
                {renderCheatProgressBar('Cheat Days', stats.cheatDays.used, stats.cheatDays.limit, '#FF9F00')}
                
                {/* Reset Information */}
                <View style={styles.cheatResetInfo}>
                  <Text style={styles.cheatResetText}>
                    Limits reset {stats.periodType === 'weekly' ? `weekly on Sunday at ${appPreferences.dayResetHour || 4}:00` : `monthly on the 1st at ${appPreferences.dayResetHour || 4}:00`}
                  </Text>
                </View>
                
                {/* Quick Stats Summary */}
                <View style={styles.cheatQuickStats}>
                  <View style={styles.cheatQuickStatItem}>
                    <Text style={styles.cheatQuickStatValue}>
                      {stats.cheatMeals.remaining + stats.cheatDays.remaining}
                    </Text>
                    <Text style={styles.cheatQuickStatLabel}>Total Remaining</Text>
                  </View>
                  <View style={styles.cheatQuickStatItem}>
                    <Text style={styles.cheatQuickStatValue}>
                      {Math.round(((stats.cheatMeals.used + stats.cheatDays.used) / (stats.cheatMeals.limit + stats.cheatDays.limit)) * 100)}%
                    </Text>
                    <Text style={styles.cheatQuickStatLabel}>Usage Rate</Text>
                  </View>
                </View>
              </View>
            );
          })()}
        </LinearGradient>

        {/* Today's Meals Card */}
        {todaysMealPlans.length > 0 && (
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Meals</Text>
              <Text style={styles.cardSubtitle}>
                Tap to edit • Long press to delete
              </Text>
            </View>
            
            <FlatList
              data={todaysMealPlans}
              renderItem={renderEatenMeal}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </LinearGradient>
        )}

        {/* Macro Trends Section */}
        <MacroTrendsSection />

        {/* Weekly Comparison Chart */}
        <WeeklyComparisonChart />

        {/* Consistency Heatmap */}
        <ConsistencyHeatmap />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Meal Modal */}
      <EditMealModal
        visible={editModalVisible}
        onClose={handleCloseModal}
        mealPlan={selectedMealPlan}
        onUpdate={handleMealUpdate}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },

  // Card Styles
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },


  // Meal Status Styles
  mealStatusContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  mealStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  mealStatusList: {
    paddingRight: 16,
  },
  mealStatusItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    minWidth: 70,
  },
  mealStatusCompleted: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  mealStatusIcon: {
    marginBottom: 4,
  },
  mealStatusEmoji: {
    fontSize: 16,
  },
  mealStatusText: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
  },
  mealStatusTextCompleted: {
    color: '#00D084',
  },



  bottomSpacer: {
    height: 20,
  },

  // Sub-Macro Styles
  subMacroSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  subMacroSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subMacroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subMacroItem: {
    width: '48%',
    marginBottom: 10,
  },
  subMacroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subMacroLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    flex: 1,
  },
  subMacroValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subMacroTrack: {
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  subMacroFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  // Micronutrient Styles
  micronutrientSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  micronutrientSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  micronutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Eaten Meals Styles
  eatenMealItem: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eatenMealGradient: {
    padding: 12,
  },
  eatenMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eatenMealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eatenMealTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  eatenMealFoods: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 16,
  },
  eatenMealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eatenMealMacroText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00D084',
  },

  // Cheat Statistics Styles
  cheatStatsContainer: {
    // Container for all cheat stats
  },
  cheatProgressContainer: {
    marginBottom: 12,
  },
  cheatProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cheatProgressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cheatProgressValue: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cheatProgressTrack: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cheatProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cheatProgressStatus: {
    alignItems: 'flex-end',
  },
  cheatProgressStatusText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cheatResetInfo: {
    backgroundColor: 'rgba(255, 159, 0, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  cheatResetText: {
    fontSize: 10,
    color: '#FF9F00',
    textAlign: 'center',
    fontWeight: '500',
  },
  cheatQuickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cheatQuickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  cheatQuickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9F00',
    marginBottom: 2,
  },
  cheatQuickStatLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
});