import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function MacroTrendChart({ data, macro, color, title, unit = 'g', target }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const chartWidth = width - 64; // Account for margins
  const chartHeight = 120;
  const padding = 20;
  const plotWidth = chartWidth - (padding * 2);
  const plotHeight = chartHeight - (padding * 2);

  // Calculate data range
  const values = data.map(d => d.macros[macro] || 0);
  const minValue = Math.min(...values, target * 0.8); // Include target in range
  const maxValue = Math.max(...values, target * 1.2);
  const range = maxValue - minValue || 1; // Prevent division by zero

  // Generate path data for line chart
  const pathData = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * plotWidth;
    const y = padding + plotHeight - ((point.macros[macro] - minValue) / range) * plotHeight;
    return { x, y, value: point.macros[macro] };
  });

  // Create SVG path string
  const pathString = pathData.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Calculate target line position
  const targetY = padding + plotHeight - ((target - minValue) / range) * plotHeight;

  // Get current and average values
  const currentValue = values[values.length - 1] || 0;
  const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Calculate trend (simple slope)
  const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;
  const trendPercentage = values[0] !== 0 ? ((trend / values[0]) * 100) : 0;

  return (
    <LinearGradient
      colors={['#1A1A1A', '#2A2A2A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.stats}>
          <Text style={styles.currentValue}>
            {Math.round(currentValue)}{unit}
          </Text>
          <Text style={[styles.trend, { color: trend >= 0 ? '#00D084' : '#FF453A' }]}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trendPercentage).toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
          {/* Target line */}
          <Path
            d={`M ${padding} ${targetY} L ${chartWidth - padding} ${targetY}`}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Main trend line */}
          <Path
            d={pathString}
            stroke={color[0]}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {pathData.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={color[0]}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          ))}

          {/* Target label */}
          <SvgText
            x={chartWidth - padding - 5}
            y={targetY - 5}
            fontSize="10"
            fill="rgba(255,255,255,0.6)"
            textAnchor="end"
          >
            Target: {target}{unit}
          </SvgText>
        </Svg>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerStat}>
          <Text style={styles.footerLabel}>Average</Text>
          <Text style={styles.footerValue}>{Math.round(averageValue)}{unit}</Text>
        </View>
        <View style={styles.footerStat}>
          <Text style={styles.footerLabel}>Target</Text>
          <Text style={styles.footerValue}>{target}{unit}</Text>
        </View>
        <View style={styles.footerStat}>
          <Text style={styles.footerLabel}>Gap</Text>
          <Text style={[
            styles.footerValue, 
            { color: currentValue >= target ? '#00D084' : '#FF9500' }
          ]}>
            {currentValue >= target ? '+' : ''}{Math.round(currentValue - target)}{unit}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stats: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  chartContainer: {
    marginBottom: 16,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  footerStat: {
    alignItems: 'center',
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});