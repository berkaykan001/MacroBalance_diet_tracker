import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function CircularProgress({ 
  size = 80, 
  strokeWidth = 8, 
  current = 0, 
  target = 1, 
  color = ['#4ECDC4', '#6EDCD6'], 
  label = '', 
  unit = 'g' 
}) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress percentage
  const actualPercentage = target > 0 ? (current / target) * 100 : 0;
  
  // Base progress (up to 100%)
  const basePercentage = Math.min(100, actualPercentage);
  const baseStrokeDashoffset = circumference - (basePercentage / 100) * circumference;
  
  // Overflow progress (beyond 100%, up to 200% max display)
  const overflowPercentage = Math.max(0, Math.min(100, actualPercentage - 100));
  const overflowStrokeDashoffset = circumference - (overflowPercentage / 100) * circumference;
  
  // Determine colors based on achievement
  const isComplete = actualPercentage >= 95 && actualPercentage <= 105;
  const isUnder = actualPercentage < 95;
  const isSlightlyOver = actualPercentage > 105 && actualPercentage <= 120;
  const isSignificantlyOver = actualPercentage > 120;
  
  // Base colors (lighter)
  const baseColor = isSignificantlyOver ? '#FF6B6B' : 
                   isSlightlyOver ? '#FFB84D' : 
                   isComplete ? '#32D74B' : 
                   color[0];
  
  // Overflow colors (darker versions)
  const overflowColor = isSignificantlyOver ? '#CC1F1F' : 
                       isSlightlyOver ? '#CC7A00' : 
                       isComplete ? '#1B7A2B' : 
                       '#1B7A2B'; // Default to dark green for any overflow
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color[0]} />
            <Stop offset="100%" stopColor={color[1]} />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Base progress circle (up to 100%) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={baseColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={baseStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        
        {/* Overflow progress circle (beyond 100%) */}
        {overflowPercentage > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={overflowColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={overflowStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={[styles.percentage, { color: overflowPercentage > 0 ? overflowColor : baseColor }]}>
          {Math.round(actualPercentage)}%
        </Text>
        <Text style={styles.values}>
          {Math.round(current)}/{target}{unit}
        </Text>
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
      </View>
    </View>
  );
}

export function CircularProgressSection() {
  const { getDailyProgress } = require('../../context/MealContext').useMeal();
  const dailyProgress = getDailyProgress();
  
  const macros = [
    {
      label: 'Protein',
      current: dailyProgress.consumed.protein,
      target: dailyProgress.targets.protein,
      color: ['#FF6B6B', '#FF8E8E'],
      unit: 'g'
    },
    {
      label: 'Carbs',
      current: dailyProgress.consumed.carbs,
      target: dailyProgress.targets.carbs,
      color: ['#4ECDC4', '#6EDCD6'],
      unit: 'g'
    },
    {
      label: 'Fat',
      current: dailyProgress.consumed.fat,
      target: dailyProgress.targets.fat,
      color: ['#45B7D1', '#6BC5D7'],
      unit: 'g'
    }
  ];
  
  const calculateCalories = () => {
    const consumed = (dailyProgress.consumed.protein * 4) + 
                    (dailyProgress.consumed.carbs * 4) + 
                    (dailyProgress.consumed.fat * 9);
    const target = (dailyProgress.targets.protein * 4) + 
                   (dailyProgress.targets.carbs * 4) + 
                   (dailyProgress.targets.fat * 9);
    return { consumed: Math.round(consumed), target: Math.round(target) };
  };
  
  const calories = calculateCalories();
  
  return (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.sectionContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Target Progress</Text>
      </View>
      
      <View style={styles.progressGrid}>
        {/* Main macros */}
        {macros.map((macro, index) => (
          <CircularProgress
            key={index}
            current={macro.current}
            target={macro.target}
            color={macro.color}
            label={macro.label}
            unit={macro.unit}
            size={90}
            strokeWidth={8}
          />
        ))}
        
        {/* Calories - larger ring */}
        <View style={styles.caloriesContainer}>
          <CircularProgress
            current={calories.consumed}
            target={calories.target}
            color={['#9B59B6', '#BB6BD9']}
            label="Calories"
            unit=""
            size={110}
            strokeWidth={10}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  values: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  // Section styles
  sectionContainer: {
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
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  caloriesContainer: {
    marginTop: 16,
    alignSelf: 'center',
  },
});