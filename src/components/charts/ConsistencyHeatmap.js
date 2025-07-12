import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMeal } from '../../context/MealContext';
import { useFood } from '../../context/FoodContext';

export default function ConsistencyHeatmap() {
  const { getDailySummariesForPeriod, getTodaysSummary } = useMeal();
  const { getFoodById } = useFood();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Get all summaries for a longer period to cover multiple months
  const allSummaries = getDailySummariesForPeriod(365);
  
  // Create a map of dates to summaries for easy lookup
  const summaryMap = useMemo(() => {
    const map = {};
    allSummaries.forEach(summary => {
      // Handle both date formats: ISO string (YYYY-MM-DD) and Date string
      let dateKey;
      if (summary.date.includes('-')) {
        // ISO format YYYY-MM-DD
        const dateObj = new Date(summary.date + 'T00:00:00');
        dateKey = dateObj.toDateString();
      } else {
        // Already in toDateString format
        dateKey = summary.date;
      }
      map[dateKey] = summary;
    });
    
    // Also add today's real-time summary if it exists
    const todaysSummary = getTodaysSummary();
    if (todaysSummary) {
      const todayKey = new Date().toDateString();
      map[todayKey] = todaysSummary;
    }
    
    return map;
  }, [allSummaries, getTodaysSummary]);
  
  // Generate calendar grid for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and first day of calendar grid (previous Sunday)
    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Go to previous Sunday
    
    const weeks = [];
    const today = new Date();
    
    // Generate 6 weeks to ensure we cover the full month
    for (let week = 0; week < 6; week++) {
      const weekData = [];
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        
        const dateString = date.toDateString();
        const summary = summaryMap[dateString];
        const isToday = dateString === today.toDateString();
        const isFuture = date > today;
        const isCurrentMonth = date.getMonth() === month;
        
        weekData.push({
          date: dateString,
          dateObj: date,
          summary: summary,
          isToday,
          isFuture,
          isCurrentMonth,
          dayNumber: date.getDate(),
          consistency: summary?.consistencyScore || 0
        });
      }
      weeks.push(weekData);
    }
    
    return weeks;
  }, [currentDate, summaryMap]);
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const goToPreviousYear = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() - 1);
      return newDate;
    });
  };
  
  const goToNextYear = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null); // Clear any selected day when navigating to today
  };
  
  // Get color based on consistency score
  const getConsistencyColor = (consistency) => {
    if (consistency === 0) return 'rgba(255,255,255,0.1)'; // No data - subtle gray
    if (consistency < 0.3) return '#FF453A'; // Poor (red)
    if (consistency < 0.5) return '#FF9500'; // Below average (orange)
    if (consistency < 0.7) return '#FFD700'; // Average (yellow)
    if (consistency < 0.85) return '#32D74B'; // Good (light green)
    return '#00D084'; // Excellent (green)
  };
  
  const getConsistencyLabel = (consistency) => {
    if (consistency === 0) return 'No data';
    if (consistency < 0.3) return 'Poor';
    if (consistency < 0.5) return 'Below Average';
    if (consistency < 0.7) return 'Average';
    if (consistency < 0.85) return 'Good';
    return 'Excellent';
  };
  
  const handleDayPress = (day) => {
    setSelectedDay(day);
  };
  
  const renderMacroStatus = (macroName, result) => {
    const statusIcon = result.achieved ? '✅' : '❌';
    const statusText = result.status === 'hit' ? '✓ Hit' : 
                     result.status === 'over' ? '✗ Over target' : 
                     '✗ Under target';
    
    return (
      <Text style={[styles.dayDetailMacro, { color: result.achieved ? '#00D084' : '#FF453A' }]}>
        {statusIcon} {macroName}: {Math.round(result.actual)}g ({Math.round(result.percentage * 100)}% of {Math.round(result.target)}g) {statusText}
      </Text>
    );
  };

  const renderNutrientStatus = (nutrientName, result, unit = 'g') => {
    const statusIcon = result.achieved ? '✅' : '❌';
    const deficitText = result.achieved ? '✓ Hit' : `✗ Need ${result.deficit.toFixed(1)}${unit} more`;
    
    return (
      <Text style={[styles.dayDetailNutrient, { color: result.achieved ? '#00D084' : '#FF453A' }]}>
        {statusIcon} {nutrientName}: {result.actual.toFixed(1)}{unit} (≥{result.target}{unit} minimum) {deficitText}
      </Text>
    );
  };

  const renderDayDetail = () => {
    if (!selectedDay) return null;
    
    const date = selectedDay.dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!selectedDay.summary) {
      return (
        <View style={styles.dayDetail}>
          <Text style={styles.dayDetailDate}>{date}</Text>
          <Text style={styles.noDataText}>No meal data recorded for this day</Text>
        </View>
      );
    }
    
    const { summary } = selectedDay;
    
    return (
      <ScrollView style={styles.dayDetail} showsVerticalScrollIndicator={false}>
        <Text style={styles.dayDetailDate}>{date}</Text>
        <Text style={styles.dayDetailConsistency}>
          Overall Consistency: {getConsistencyLabel(summary.consistencyScore)} ({Math.round(summary.consistencyScore * 100)}%)
        </Text>
        
        {/* Macro Targets Section */}
        {summary.macroResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 MACRO TARGETS (60% weight)</Text>
            {renderMacroStatus('Protein', summary.macroResults.protein)}
            {renderMacroStatus('Carbs', summary.macroResults.carbs)}
            {renderMacroStatus('Fat', summary.macroResults.fat)}
            <Text style={styles.scoreText}>
              → Macro Score: {summary.macroScore || 0}/60 points
            </Text>
          </View>
        )}
        
        {/* Nutrient Targets Section */}
        {summary.nutrientResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔬 NUTRIENT TARGETS (40% weight)</Text>
            {renderNutrientStatus('Fiber', summary.nutrientResults.fiber)}
            {renderNutrientStatus('Omega-3', summary.nutrientResults.omega3)}
            {renderNutrientStatus('Iron', summary.nutrientResults.iron, 'mg')}
            {renderNutrientStatus('Calcium', summary.nutrientResults.calcium, 'mg')}
            {renderNutrientStatus('Vitamin D', summary.nutrientResults.vitaminD, 'mcg')}
            <Text style={styles.scoreText}>
              → Nutrient Score: {summary.nutrientScore || 0}/40 points
            </Text>
          </View>
        )}
        
        {/* Total Score */}
        <View style={styles.totalScore}>
          <Text style={styles.totalScoreText}>
            TOTAL: {(summary.macroScore || 0) + (summary.nutrientScore || 0)}/100 = {getConsistencyLabel(summary.consistencyScore)} ({Math.round(summary.consistencyScore * 100)}%)
          </Text>
        </View>
        
        {/* Top Foods */}
        {summary.topFoods && summary.topFoods.length > 0 && (
          <View style={styles.topFoods}>
            <Text style={styles.topFoodsTitle}>Top Foods:</Text>
            <Text style={styles.topFoodsText}>
              {summary.topFoods.map(foodId => {
                const food = getFoodById(foodId);
                return food ? food.name : foodId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              }).join(', ')}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Consistency Calendar</Text>
        <Text style={styles.subtitle}>Track your daily macro achievements</Text>
      </View>
      
      {/* Navigation Controls */}
      <View style={styles.navigation}>
        <View style={styles.yearNavigation}>
          <TouchableOpacity onPress={goToPreviousYear} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.yearText}>{currentDate.getFullYear()}</Text>
          <TouchableOpacity onPress={goToNextYear} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendar}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {calendarData.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.day,
                    {
                      backgroundColor: getConsistencyColor(day.consistency),
                      borderColor: day.isToday ? '#FFFFFF' : 'transparent',
                      borderWidth: day.isToday ? 2 : 0,
                      opacity: day.isCurrentMonth ? 1 : 0.3,
                    }
                  ]}
                  onPress={() => handleDayPress(day)}
                >
                  <Text style={[
                    styles.dayText,
                    { 
                      color: day.isCurrentMonth ? '#FFFFFF' : '#8E8E93',
                      fontWeight: day.isToday ? 'bold' : 'normal'
                    }
                  ]}>
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Consistency Levels</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <Text style={styles.legendText}>No data</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF453A' }]} />
            <Text style={styles.legendText}>Poor</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>Below Avg</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.legendText}>Average</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#32D74B' }]} />
            <Text style={styles.legendText}>Good</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#00D084' }]} />
            <Text style={styles.legendText}>Excellent</Text>
          </View>
        </View>
      </View>
      
      {/* Day detail */}
      {renderDayDetail()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  navigation: {
    marginBottom: 16,
  },
  yearNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
    marginHorizontal: 16,
  },
  navButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  yearText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  monthText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 140,
    textAlign: 'center',
  },
  todayButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  todayButtonText: {
    color: '#00D084',
    fontSize: 12,
    fontWeight: '600',
  },
  calendar: {
    marginBottom: 16,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
    minHeight: 32,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  legend: {
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  dayDetail: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  dayDetailDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dayDetailConsistency: {
    fontSize: 12,
    color: '#00D084',
    marginBottom: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  dayDetailMacro: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 14,
  },
  dayDetailNutrient: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 14,
  },
  scoreText: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '600',
  },
  totalScore: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  totalScoreText: {
    fontSize: 11,
    color: '#00D084',
    fontWeight: '700',
    textAlign: 'center',
  },
  topFoods: {
    marginTop: 4,
  },
  topFoodsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  topFoodsText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  noDataText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});