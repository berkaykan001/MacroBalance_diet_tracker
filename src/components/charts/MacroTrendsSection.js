import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MacroTrendChart from './MacroTrendChart';
import { useMeal } from '../../context/MealContext';

export default function MacroTrendsSection() {
  const { getDailySummariesForPeriod, getDailyTargets } = useMeal();
  
  // Get 7 days of data
  const weeklyData = getDailySummariesForPeriod(7);
  const targets = getDailyTargets();

  // If we don't have enough historical data, show message
  if (weeklyData.length < 2) {
    return (
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Macro Trends</Text>
          <Text style={styles.cardSubtitle}>Track your weekly progress</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Building Your Trends</Text>
          <Text style={styles.emptyStateText}>
            Keep logging meals for a few more days to see your macro trends and patterns.
          </Text>
          <View style={styles.emptyStateProgress}>
            <Text style={styles.progressText}>
              {weeklyData.length}/7 days logged
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(weeklyData.length / 7) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>7-Day Macro Trends</Text>
        <Text style={styles.sectionSubtitle}>Your weekly nutrition patterns</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        <MacroTrendChart
          data={weeklyData}
          macro="protein"
          color={['#FF6B6B', '#FF8E8E']}
          title="Protein"
          unit="g"
          target={targets.protein}
        />
        
        <MacroTrendChart
          data={weeklyData}
          macro="carbs"
          color={['#4ECDC4', '#6EDCD6']}
          title="Carbohydrates"
          unit="g"
          target={targets.carbs}
        />
        
        <MacroTrendChart
          data={weeklyData}
          macro="fat"
          color={['#45B7D1', '#6BC5D7']}
          title="Fat"
          unit="g"
          target={targets.fat}
        />
      </ScrollView>

      <View style={styles.insights}>
        <MacroInsights weeklyData={weeklyData} targets={targets} />
      </View>
    </View>
  );
}

function MacroInsights({ weeklyData, targets }) {
  const calculateInsights = () => {
    if (weeklyData.length < 2) return null;

    const latest = weeklyData[weeklyData.length - 1];
    const previous = weeklyData[weeklyData.length - 2];
    
    const insights = [];

    // Protein insight
    const proteinChange = latest.macros.protein - previous.macros.protein;
    const proteinGap = latest.macros.protein - targets.protein;
    if (Math.abs(proteinGap) > targets.protein * 0.1) { // 10% off target
      insights.push({
        type: proteinGap > 0 ? 'positive' : 'warning',
        text: `Protein ${proteinGap > 0 ? 'exceeded' : 'below'} target by ${Math.abs(Math.round(proteinGap))}g`
      });
    }

    // Trend insight
    const avgProtein = weeklyData.reduce((sum, day) => sum + day.macros.protein, 0) / weeklyData.length;
    const avgCarbs = weeklyData.reduce((sum, day) => sum + day.macros.carbs, 0) / weeklyData.length;
    const avgFat = weeklyData.reduce((sum, day) => sum + day.macros.fat, 0) / weeklyData.length;

    const bestMacro = avgProtein / targets.protein > avgCarbs / targets.carbs && avgProtein / targets.protein > avgFat / targets.fat 
      ? 'protein' 
      : avgCarbs / targets.carbs > avgFat / targets.fat 
        ? 'carbs' 
        : 'fat';

    insights.push({
      type: 'info',
      text: `Most consistent with ${bestMacro} targets this week`
    });

    return insights.slice(0, 2); // Max 2 insights
  };

  const insights = calculateInsights();

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Quick Insights</Text>
      {insights.map((insight, index) => (
        <View key={index} style={styles.insightItem}>
          <Text style={[
            styles.insightIcon,
            { color: insight.type === 'positive' ? '#00D084' : insight.type === 'warning' ? '#FF9500' : '#4ECDC4' }
          ]}>
            {insight.type === 'positive' ? '💪' : insight.type === 'warning' ? '⚠️' : '💡'}
          </Text>
          <Text style={styles.insightText}>{insight.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  scrollView: {
    marginBottom: 16,
  },
  scrollContainer: {
    paddingRight: 16,
  },
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateProgress: {
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  insights: {
    marginTop: 8,
  },
  insightsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  insightsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
});