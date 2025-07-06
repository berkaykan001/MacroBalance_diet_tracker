import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMeal } from '../../context/MealContext';

export default function ConsistencyHeatmap() {
  const { getDailySummariesForPeriod } = useMeal();
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Get data for the last 4 weeks (28 days) - simplified for debugging
  const summaries = getDailySummariesForPeriod(28);
  
  // Create a map of dates to summaries for easy lookup
  const summaryMap = {};
  summaries.forEach(summary => {
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
    summaryMap[dateKey] = summary;
  });
  
  // Generate calendar grid for last 4 weeks (memoized for performance)
  const weeks = useMemo(() => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 27); // 28 days ago
    
    // Find the start of the week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    for (let week = 0; week < 4; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        
        const dateString = date.toDateString();
        const summary = summaryMap[dateString];
        const isToday = dateString === today.toDateString();
        const isFuture = date > today;
        
        // For testing, add some hardcoded consistency values
        let testConsistency = 0;
        if (!isFuture) {
          // Cycle through different consistency values for testing
          const dayOfMonth = date.getDate();
          if (dayOfMonth % 5 === 0) testConsistency = 0.9; // Excellent
          else if (dayOfMonth % 4 === 0) testConsistency = 0.75; // Good  
          else if (dayOfMonth % 3 === 0) testConsistency = 0.55; // Average
          else if (dayOfMonth % 2 === 0) testConsistency = 0.35; // Below average
          else testConsistency = 0.15; // Poor
        }

        // Create a more complete test summary for clicked days
        let testSummary = null;
        if (!isFuture && testConsistency > 0) {
          testSummary = {
            consistencyScore: testConsistency,
            macros: {
              protein: Math.round(120 * (0.8 + Math.random() * 0.4)), // 96-168g
              carbs: Math.round(180 * (0.8 + Math.random() * 0.4)),   // 144-252g  
              fat: Math.round(60 * (0.8 + Math.random() * 0.4))       // 48-84g
            },
            targetsAchieved: {
              protein: 0.8 + Math.random() * 0.4, // 80-120%
              carbs: 0.8 + Math.random() * 0.4,   // 80-120%
              fat: 0.8 + Math.random() * 0.4      // 80-120%
            },
            topFoods: ['chicken-breast', 'brown-rice', 'avocado'].slice(0, Math.floor(Math.random() * 3) + 1)
          };
        }

        weekData.push({
          date: dateString,
          dateObj: date,
          summary: testSummary,
          isToday,
          isFuture,
          consistency: testConsistency
        });
        
      }
      weeks.push(weekData);
    }
    
    return weeks;
  }, [summaries]); // Memoize based on summaries data
  
  // Get color based on consistency score (memoized)
  const getConsistencyColor = useMemo(() => (consistency) => {
    if (consistency === 0) return '#444444'; // No data - visible gray
    if (consistency < 0.3) return '#FF453A'; // Poor (red)
    if (consistency < 0.5) return '#FF9500'; // Below average (orange)
    if (consistency < 0.7) return '#FFD700'; // Average (yellow)
    if (consistency < 0.85) return '#32D74B'; // Good (light green)
    return '#00D084'; // Excellent (green)
  }, []);
  
  const getConsistencyLabel = useMemo(() => (consistency) => {
    if (consistency === 0) return 'No data';
    if (consistency < 0.3) return 'Poor';
    if (consistency < 0.5) return 'Below Average';
    if (consistency < 0.7) return 'Average';
    if (consistency < 0.85) return 'Good';
    return 'Excellent';
  }, []);
  
  const handleDayPress = (day) => {
    if (day.summary && !day.isFuture) {
      setSelectedDay(day);
    }
  };
  
  const renderDayDetail = () => {
    if (!selectedDay || !selectedDay.summary) return null;
    
    const { summary } = selectedDay;
    const date = new Date(selectedDay.dateObj).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <View style={styles.dayDetail}>
        <Text style={styles.dayDetailDate}>{date}</Text>
        <Text style={styles.dayDetailConsistency}>
          Consistency: {getConsistencyLabel(summary.consistencyScore)} ({Math.round(summary.consistencyScore * 100)}%)
        </Text>
        <View style={styles.dayDetailMacros}>
          <Text style={styles.dayDetailMacro}>
            Protein: {Math.round(summary.macros?.protein || 0)}g ({Math.round((summary.targetsAchieved?.protein || 0) * 100)}%)
          </Text>
          <Text style={styles.dayDetailMacro}>
            Carbs: {Math.round(summary.macros?.carbs || 0)}g ({Math.round((summary.targetsAchieved?.carbs || 0) * 100)}%)
          </Text>
          <Text style={styles.dayDetailMacro}>
            Fat: {Math.round(summary.macros?.fat || 0)}g ({Math.round((summary.targetsAchieved?.fat || 0) * 100)}%)
          </Text>
        </View>
        {summary.topFoods && summary.topFoods.length > 0 && (
          <View style={styles.topFoods}>
            <Text style={styles.topFoodsTitle}>Top Foods:</Text>
            <Text style={styles.topFoodsText}>
              {summary.topFoods.map(foodId => {
                // Map dummy food IDs to names
                const foodNames = {
                  'chicken-breast': 'Chicken Breast',
                  'brown-rice': 'Brown Rice', 
                  'avocado': 'Avocado'
                };
                return foodNames[foodId] || foodId;
              }).join(', ')}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // Calculate overall stats (memoized for performance)
  const stats = useMemo(() => {
    const totalDays = summaries.length;
    const excellentDays = summaries.filter(s => s.consistencyScore >= 0.85).length;
    const goodDays = summaries.filter(s => s.consistencyScore >= 0.7 && s.consistencyScore < 0.85).length;
    const averageConsistency = totalDays > 0 
      ? summaries.reduce((sum, s) => sum + s.consistencyScore, 0) / totalDays 
      : 0;
    
    return { totalDays, excellentDays, goodDays, averageConsistency };
  }, [summaries]);
  
  return (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Consistency Calendar</Text>
        <Text style={styles.subtitle}>Your daily macro tracking over time</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarScroll}>
        <View style={styles.calendar}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayLabel}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar grid - each row is a week */}
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.day,
                      {
                        backgroundColor: day.isFuture 
                          ? 'rgba(255,255,255,0.05)' 
                          : getConsistencyColor(day.consistency),
                        borderColor: day.isToday ? '#FFFFFF' : 'transparent',
                        borderWidth: day.isToday ? 1 : 0,
                      }
                    ]}
                    onPress={() => handleDayPress(day)}
                    disabled={day.isFuture || !day.summary}
                  >
                    {/* Show day number if it has data or is today */}
                    {(day.summary || day.isToday) && (
                      <Text style={styles.dayText}>
                        {day.dateObj.getDate()}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Consistency Levels</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#1A1A1A' }]} />
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
      
      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalDays}</Text>
          <Text style={styles.statLabel}>Days Tracked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.excellentDays}</Text>
          <Text style={styles.statLabel}>Excellent Days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.goodDays}</Text>
          <Text style={styles.statLabel}>Good Days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(stats.averageConsistency * 100)}%</Text>
          <Text style={styles.statLabel}>Avg Consistency</Text>
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
  calendarScroll: {
    marginBottom: 16,
  },
  calendar: {
    alignItems: 'flex-start',
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  dayLabel: {
    width: 18,
    textAlign: 'center',
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  day: {
    width: 18,
    height: 18,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00D084',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
  },
  dayDetail: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
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
    marginBottom: 8,
  },
  dayDetailMacros: {
    marginBottom: 8,
  },
  dayDetailMacro: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
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
});