import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMeal } from '../../context/MealContext';

const { width } = Dimensions.get('window');

export default function WeeklyComparisonChart() {
  const { getWeeklyComparison, getDailyTargets } = useMeal();
  
  const comparison = getWeeklyComparison();
  const targets = getDailyTargets();

  // Check if we have enough data for comparison
  const hasData = comparison && 
    (comparison.thisWeek.protein > 0 || comparison.thisWeek.carbs > 0 || comparison.thisWeek.fat > 0) &&
    (comparison.lastWeek.protein > 0 || comparison.lastWeek.carbs > 0 || comparison.lastWeek.fat > 0);

  if (!hasData) {
    return (
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Comparison</Text>
          <Text style={styles.subtitle}>This week vs last week</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Keep logging for another week to see your comparison</Text>
        </View>
      </LinearGradient>
    );
  }

  const macros = [
    {
      name: 'Protein',
      thisWeek: comparison.thisWeek.protein,
      lastWeek: comparison.lastWeek.protein,
      target: targets.protein,
      color: '#FF6B6B',
      unit: 'g'
    },
    {
      name: 'Carbs',
      thisWeek: comparison.thisWeek.carbs,
      lastWeek: comparison.lastWeek.carbs,
      target: targets.carbs,
      color: '#4ECDC4',
      unit: 'g'
    },
    {
      name: 'Fat',
      thisWeek: comparison.thisWeek.fat,
      lastWeek: comparison.lastWeek.fat,
      target: targets.fat,
      color: '#45B7D1',
      unit: 'g'
    },
    {
      name: 'Calories',
      thisWeek: comparison.thisWeek.calories,
      lastWeek: comparison.lastWeek.calories,
      target: (targets.protein * 4) + (targets.carbs * 4) + (targets.fat * 9),
      color: '#9B59B6',
      unit: 'cal'
    }
  ];

  return (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Comparison</Text>
        <Text style={styles.subtitle}>Average daily intake</Text>
      </View>

      <View style={styles.comparisonContainer}>
        {macros.map((macro, index) => (
          <MacroComparisonBar
            key={index}
            name={macro.name}
            thisWeek={macro.thisWeek}
            lastWeek={macro.lastWeek}
            target={macro.target}
            color={macro.color}
            unit={macro.unit}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.8)' }]} />
          <Text style={styles.legendText}>This Week</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <Text style={styles.legendText}>Last Week</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFD700' }]} />
          <Text style={styles.legendText}>Target</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function MacroComparisonBar({ name, thisWeek, lastWeek, target, color, unit }) {
  // Calculate percentages for bar visualization
  const maxValue = Math.max(thisWeek, lastWeek, target) * 1.1; // Add 10% padding
  const thisWeekPercent = (thisWeek / maxValue) * 100;
  const lastWeekPercent = (lastWeek / maxValue) * 100;
  const targetPercent = (target / maxValue) * 100;

  // Calculate change percentage
  const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  const changeText = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  const changeColor = change > 0 ? '#00D084' : change < 0 ? '#FF453A' : '#8E8E93';

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroName}>{name}</Text>
        <Text style={[styles.changeText, { color: changeColor }]}>
          {change !== 0 ? changeText : '—'}
        </Text>
      </View>

      <View style={styles.barContainer}>
        {/* This Week Bar */}
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.barFill, 
                { 
                  width: `${thisWeekPercent}%`, 
                  backgroundColor: color,
                  opacity: 0.9
                }
              ]} 
            />
            {/* Target indicator */}
            <View 
              style={[
                styles.targetIndicator, 
                { left: `${targetPercent}%` }
              ]} 
            />
          </View>
          <Text style={styles.valueText}>
            {Math.round(thisWeek)}{unit}
          </Text>
        </View>

        {/* Last Week Bar */}
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.barFill, 
                { 
                  width: `${lastWeekPercent}%`, 
                  backgroundColor: color,
                  opacity: 0.4
                }
              ]} 
            />
          </View>
          <Text style={[styles.valueText, { opacity: 0.6 }]}>
            {Math.round(lastWeek)}{unit}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  comparisonContainer: {
    marginBottom: 16,
  },
  macroRow: {
    marginBottom: 16,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  targetIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  valueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 45,
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#8E8E93',
  },
});