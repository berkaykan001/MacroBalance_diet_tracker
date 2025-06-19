import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
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
    getTodaysMealPlans 
  } = useMeal();
  const { getRecentlyUsed } = useFood();

  const dailyProgress = getDailyProgress();
  const mealsToday = getMealsCompletedToday();
  const recentMealPlans = getRecentMealPlans(3);
  const recentFoods = getRecentlyUsed(6);

  const getNextMeal = () => {
    const incompleteMeals = mealsToday.filter(meal => !meal.completed);
    return incompleteMeals.length > 0 ? incompleteMeals[0] : mealsToday[0];
  };

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

  const renderProgressBar = (label, current, target, color) => {
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const isComplete = percentage >= 95;
    
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={[styles.progressValue, { color: isComplete ? '#00D084' : '#FFFFFF' }]}>
            {Math.round(current)}/{target}g
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
                Plan {getNextMeal()?.name || 'Next Meal'}
              </Text>
              <Text style={styles.primaryActionSubtext}>
                {getNextMeal()?.completed ? 'Update meal plan' : 'Create new meal plan'}
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
});