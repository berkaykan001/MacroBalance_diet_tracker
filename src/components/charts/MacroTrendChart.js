import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function MacroTrendChart({ data, targets }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const chartWidth = width - 32; // Account for margins
  const chartHeight = 180;
  const padding = 30;
  const plotWidth = chartWidth - (padding * 2);
  const plotHeight = chartHeight - (padding * 2);

  // Calculate calories target
  const caloriesTarget = (targets.protein * 4) + (targets.carbs * 4) + (targets.fat * 9);
  
  // Normalize all values to percentage of target (0-200% range for display)
  const normalizeValue = (value, target) => {
    if (!value || !target || target === 0) return 0;
    return (value / target) * 100;
  };
  
  // Generate path data for each macro
  const macros = [
    { 
      name: 'Protein', 
      color: '#FF6B6B', 
      getData: (point) => {
        const value = point.macros?.protein || 0;
        return normalizeValue(value, targets.protein);
      }
    },
    { 
      name: 'Carbs', 
      color: '#4ECDC4', 
      getData: (point) => {
        const value = point.macros?.carbs || 0;
        return normalizeValue(value, targets.carbs);
      }
    },
    { 
      name: 'Fat', 
      color: '#45B7D1', 
      getData: (point) => {
        const value = point.macros?.fat || 0;
        return normalizeValue(value, targets.fat);
      }
    },
    { 
      name: 'Calories', 
      color: '#9B59B6', 
      getData: (point) => {
        const value = point.macros?.calories || 0;
        return normalizeValue(value, caloriesTarget);
      }
    }
  ];

  // Set consistent range (0-200% of target)
  const minValue = 0;
  const maxValue = 200;
  const range = maxValue - minValue;

  // Generate path data for each macro
  const macroLines = macros.map(macro => {
    const pathData = data.map((point, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * plotWidth;
      const normalizedValue = Math.max(0, Math.min(200, macro.getData(point))); // Clamp between 0-200%
      const y = padding + plotHeight - ((normalizedValue - minValue) / range) * plotHeight;
      
      // Ensure coordinates are valid numbers
      return { 
        x: isNaN(x) ? padding : x, 
        y: isNaN(y) ? padding + plotHeight : y, 
        value: normalizedValue 
      };
    });

    const pathString = pathData.reduce((path, point, index) => {
      if (isNaN(point.x) || isNaN(point.y)) return path;
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    return { ...macro, pathData, pathString };
  });

  // Target line at 100%
  const targetY = padding + plotHeight - ((100 - minValue) / range) * plotHeight;

  return (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>7-Day Macro Trends</Text>
        <Text style={styles.subtitle}>All macros normalized to target percentage</Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
          {/* Target line at 100% */}
          <Path
            d={`M ${padding} ${targetY} L ${chartWidth - padding} ${targetY}`}
            stroke="#FFD700"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Target label */}
          <SvgText
            x={chartWidth - padding - 5}
            y={targetY - 5}
            fontSize="10"
            fill="#FFD700"
            textAnchor="end"
          >
            Target (100%)
          </SvgText>

          {/* Macro trend lines */}
          {macroLines.map((macro, macroIndex) => (
            <React.Fragment key={macroIndex}>
              {macro.pathString && (
                <Path
                  d={macro.pathString}
                  stroke={macro.color}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Data points */}
              {macro.pathData.map((point, pointIndex) => {
                if (isNaN(point.x) || isNaN(point.y)) return null;
                return (
                  <Circle
                    key={`${macroIndex}-${pointIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={macro.color}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                );
              })}
            </React.Fragment>
          ))}

          {/* X-axis day labels */}
          {data.map((point, index) => {
            const x = padding + (index / Math.max(1, data.length - 1)) * plotWidth;
            if (isNaN(x)) return null;
            
            const date = new Date(point.date);
            const dayLabel = isNaN(date.getTime()) ? index + 1 : date.getDate().toString();
            
            return (
              <SvgText
                key={`day-${index}`}
                x={x}
                y={chartHeight - 5}
                fontSize="10"
                fill="rgba(255,255,255,0.6)"
                textAnchor="middle"
              >
                {dayLabel}
              </SvgText>
            );
          })}

          {/* Y-axis percentage labels */}
          {[0, 50, 100, 150, 200].map(percentage => {
            const y = padding + plotHeight - ((percentage - minValue) / range) * plotHeight;
            return (
              <SvgText
                key={`percent-${percentage}`}
                x={padding - 5}
                y={y + 3}
                fontSize="9"
                fill="rgba(255,255,255,0.4)"
                textAnchor="end"
              >
                {percentage}%
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {macros.map((macro, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: macro.color }]} />
            <Text style={styles.legendText}>{macro.name}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
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
  chartContainer: {
    marginBottom: 16,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
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
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyChart: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});