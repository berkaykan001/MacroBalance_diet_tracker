import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMeal } from '../../context/MealContext';
import { useFood } from '../../context/FoodContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { 
    getDailyProgress, 
    getMealsCompletedToday, 
    getRecentMealPlans,
    getTodaysMealPlans,
    getMealById,
    deleteMealPlan,
    updateMealPlan
  } = useMeal();
  const { getRecentlyUsed, foods } = useFood();

  const dailyProgress = getDailyProgress();
  const mealsToday = getMealsCompletedToday();
  const recentMealPlans = getRecentMealPlans(3);
  const recentFoods = getRecentlyUsed(6);
  const todaysMealPlans = getTodaysMealPlans();

  // Note: getNextMeal logic postponed for now

  const getWeeklyConsistency = () => {
    // Simple calculation for demo - in real app would track historical data
    const completedToday = mealsToday.filter(meal => meal.completed).length;
    const totalMeals = mealsToday.length;
    const todayProgress = totalMeals > 0 ? (completedToday / totalMeals) * 100 : 0;
    
    return {
      streak: Math.floor(Math.random() * 7) + 1, // Demo data
      weeklyAverage: Math.round((todayProgress + 85) / 2), // Demo calculation
      mostUsedFood: recentFoods[0]?.name || 'No data'
    };
  };

  const weeklyStats = getWeeklyConsistency();

  const getFoodById = (id) => {
    return foods.find(food => food.id === id);
  };

  const handleEditMeal = (mealPlan) => {
    // Navigate to meal planning with the existing meal plan data
    navigation.navigate('Plan Meal', { 
      editingMealPlan: mealPlan 
    });
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

  const renderProgressBar = (label, current, target, color, unit = 'g') => {
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const isComplete = percentage >= 95;
    
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={[styles.progressValue, { color: isComplete ? '#00D084' : '#FFFFFF' }]}>
            {Math.round(current * 10) / 10}/{target}{unit}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={color}
            style={[styles.progressFill, { width: `${percentage}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  const renderSubMacroBar = (label, current, target, color, isMax = false, unit = 'g') => {
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const isComplete = isMax ? percentage <= 100 : percentage >= 95;
    const isOverLimit = isMax && percentage > 100;
    
    return (
      <View style={styles.subMacroItem}>
        <View style={styles.subMacroHeader}>
          <Text style={styles.subMacroLabel}>{label}</Text>
          <Text style={[
            styles.subMacroValue, 
            { color: isOverLimit ? '#FF453A' : isComplete ? '#00D084' : '#FFFFFF' }
          ]}>
            {Math.round(current * 10) / 10}{isMax ? `/${target}` : `/${target}`}{unit}
          </Text>
        </View>
        <View style={styles.subMacroTrack}>
          <LinearGradient
            colors={isOverLimit ? ['#FF453A', '#FF6B6B'] : color}
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

  const renderRecentFood = ({ item: food }) => (
    <TouchableOpacity style={styles.recentFoodItem}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.recentFoodGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.recentFoodName}>{food.name}</Text>
        <Text style={styles.recentFoodCategory}>{food.category}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEatenMeal = ({ item: mealPlan }) => {
    const meal = getMealById(mealPlan.mealId);
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
            <Text style={styles.eatenMealName}>{meal?.name || 'Unknown Meal'}</Text>
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
          <Text style={styles.subtitle}>Track your daily macro progress</Text>
        </View>

        {/* Daily Progress Card */}
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
            <Text style={styles.cardSubtitle}>
              {dailyProgress.consumed.calories} / {Math.round((dailyProgress.targets.protein * 4) + (dailyProgress.targets.carbs * 4) + (dailyProgress.targets.fat * 9))} cal
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            {renderProgressBar('Protein', dailyProgress.consumed.protein, dailyProgress.targets.protein, ['#FF6B6B', '#FF8E8E'])}
            {renderProgressBar('Carbs', dailyProgress.consumed.carbs, dailyProgress.targets.carbs, ['#4ECDC4', '#6EDCD6'])}
            {renderProgressBar('Fat', dailyProgress.consumed.fat, dailyProgress.targets.fat, ['#45B7D1', '#6BC5D7'])}
          </View>

          {/* Sub-Macro Progress */}
          <View style={styles.subMacroSection}>
            <Text style={styles.subMacroSectionTitle}>Nutritional Breakdown</Text>
            <View style={styles.subMacroGrid}>
              {renderSubMacroBar('Omega-3', dailyProgress.consumed.omega3, dailyProgress.subMacroTargets.omega3, ['#00D084', '#00A86B'])}
              {renderSubMacroBar('Monounsaturated', dailyProgress.consumed.monounsaturatedFat, dailyProgress.subMacroTargets.monounsaturatedFat, ['#00D084', '#00A86B'])}
              {renderSubMacroBar('Polyunsaturated', dailyProgress.consumed.polyunsaturatedFat, dailyProgress.subMacroTargets.polyunsaturatedFat, ['#00D084', '#00A86B'])}
              {renderSubMacroBar('Fiber', dailyProgress.consumed.fiber, dailyProgress.subMacroTargets.minFiber, ['#00D084', '#00A86B'])}
              {renderSubMacroBar('Saturated Fat', dailyProgress.consumed.saturatedFat, dailyProgress.subMacroTargets.maxSaturatedFat, ['#FF9500', '#FFB84D'], true)}
              {renderSubMacroBar('Trans Fat', dailyProgress.consumed.transFat, dailyProgress.subMacroTargets.maxTransFat, ['#FF453A', '#FF6B6B'], true)}
              {renderSubMacroBar('Added Sugars', dailyProgress.consumed.addedSugars, dailyProgress.subMacroTargets.maxAddedSugars, ['#FF9500', '#FFB84D'], true)}
              {renderSubMacroBar('Natural Sugars', dailyProgress.consumed.naturalSugars, dailyProgress.subMacroTargets.maxNaturalSugars, ['#F1C40F', '#F39C12'], true)}
            </View>
          </View>

          {/* Micronutrient Progress */}
          <View style={styles.micronutrientSection}>
            <Text style={styles.micronutrientSectionTitle}>Essential Vitamins & Minerals</Text>
            <View style={styles.micronutrientGrid}>
              {renderSubMacroBar('Iron', dailyProgress.consumed.iron, dailyProgress.micronutrientTargets.iron, ['#E74C3C', '#C0392B'], false, 'mg')}
              {renderSubMacroBar('Calcium', dailyProgress.consumed.calcium, dailyProgress.micronutrientTargets.calcium, ['#F39C12', '#E67E22'], false, 'mg')}
              {renderSubMacroBar('Zinc', dailyProgress.consumed.zinc, dailyProgress.micronutrientTargets.zinc, ['#3498DB', '#2980B9'], false, 'mg')}
              {renderSubMacroBar('Magnesium', dailyProgress.consumed.magnesium, dailyProgress.micronutrientTargets.magnesium, ['#27AE60', '#229954'], false, 'mg')}
              {renderSubMacroBar('Vitamin B6', dailyProgress.consumed.vitaminB6, dailyProgress.micronutrientTargets.vitaminB6, ['#9B59B6', '#8E44AD'], false, 'mg')}
              {renderSubMacroBar('Vitamin B12', dailyProgress.consumed.vitaminB12, dailyProgress.micronutrientTargets.vitaminB12, ['#1ABC9C', '#16A085'], false, 'μg')}
              {renderSubMacroBar('Vitamin C', dailyProgress.consumed.vitaminC, dailyProgress.micronutrientTargets.vitaminC, ['#F1C40F', '#F39C12'], false, 'mg')}
              {renderSubMacroBar('Vitamin D', dailyProgress.consumed.vitaminD, dailyProgress.micronutrientTargets.vitaminD, ['#FF6B35', '#FF8C42'], false, 'μg')}
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

        {/* Quick Actions Card */}
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate('Plan Meal')}
          >
            <LinearGradient
              colors={['#007AFF', '#0051D5']}
              style={styles.primaryActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryActionText}>
                Plan Your Meal
              </Text>
              <Text style={styles.primaryActionSubtext}>
                Create and track your meal plans
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {recentFoods.length > 0 && (
            <View style={styles.recentFoodsSection}>
              <Text style={styles.sectionSubtitle}>Recently Used Foods</Text>
              <FlatList
                data={recentFoods}
                renderItem={renderRecentFood}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentFoodsList}
              />
            </View>
          )}
        </LinearGradient>

        {/* Eaten Meals Card */}
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

        {/* Weekly Insights Card */}
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cardTitle}>Weekly Insights</Text>
          
          <View style={styles.weeklyStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.weeklyAverage}%</Text>
              <Text style={styles.statLabel}>Weekly Avg</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{getTodaysMealPlans().length}</Text>
              <Text style={styles.statLabel}>Plans Today</Text>
            </View>
          </View>

          {weeklyStats.mostUsedFood !== 'No data' && (
            <View style={styles.favoriteFood}>
              <Text style={styles.favoriteFoodLabel}>Most Used: </Text>
              <Text style={styles.favoriteFoodName}>{weeklyStats.mostUsedFood}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  // Progress Styles
  progressContainer: {
    marginBottom: 20,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'right',
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

  // Quick Actions Styles
  primaryAction: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryActionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  primaryActionSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },

  // Recent Foods Styles
  recentFoodsSection: {
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  recentFoodsList: {
    paddingRight: 16,
  },
  recentFoodItem: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    width: 80,
  },
  recentFoodGradient: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  recentFoodName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  recentFoodCategory: {
    fontSize: 8,
    color: '#8E8E93',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Weekly Insights Styles
  weeklyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00D084',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  favoriteFood: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  favoriteFoodLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  favoriteFoodName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
});