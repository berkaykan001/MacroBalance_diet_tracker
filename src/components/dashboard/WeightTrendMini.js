import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWeight } from '../../context/WeightContext';

export default function WeightTrendMini({ 
  width = 120, 
  height = 60, 
  showLabels = true,
  style 
}) {
  const { weightEntries, progressAnalytics } = useWeight();

  if (!weightEntries || weightEntries.length < 2) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>📊</Text>
          <Text style={styles.noDataText}>No trend data</Text>
        </View>
      </View>
    );
  }

  // Use last 7 entries or all entries if less than 7
  const recentEntries = weightEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7)
    .reverse(); // Reverse to get chronological order

  if (recentEntries.length < 2) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Need more data</Text>
        </View>
      </View>
    );
  }

  const weights = recentEntries.map(entry => entry.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight;
  
  // Add padding to the range for better visualization
  const padding = Math.max(weightRange * 0.15, 0.5); // At least 0.5kg padding
  const chartMinWeight = minWeight - padding;
  const chartMaxWeight = maxWeight + padding;
  const chartRange = chartMaxWeight - chartMinWeight;

  const chartPadding = 8;
  const chartWidth = width - (chartPadding * 2);
  const chartHeight = height - (showLabels ? 20 : 8);

  // Calculate positions for data points
  const dataPoints = recentEntries.map((entry, index) => {
    const x = chartPadding + (index / (recentEntries.length - 1)) * chartWidth;
    const normalizedWeight = (entry.weight - chartMinWeight) / chartRange;
    const y = chartHeight - (normalizedWeight * chartHeight) + 4; // 4px top padding
    
    return {
      x,
      y,
      weight: entry.weight,
      date: entry.date,
      index
    };
  });

  // Create line segments between points
  const lineSegments = dataPoints.slice(0, -1).map((point, index) => {
    const nextPoint = dataPoints[index + 1];
    const segmentWidth = Math.sqrt(
      Math.pow(nextPoint.x - point.x, 2) + 
      Math.pow(nextPoint.y - point.y, 2)
    );
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
    
    return {
      key: index,
      left: point.x,
      top: point.y,
      width: segmentWidth,
      angle
    };
  });

  // Determine overall trend color
  const firstWeight = recentEntries[0].weight;
  const lastWeight = recentEntries[recentEntries.length - 1].weight;
  const overallTrend = lastWeight - firstWeight;
  const trendColor = Math.abs(overallTrend) < 0.1 ? '#8E8E93' : 
                     overallTrend > 0 ? '#FF453A' : '#00D084';

  // Get trend info
  const getTrendInfo = () => {
    if (Math.abs(overallTrend) < 0.1) {
      return { text: 'Stable', icon: '➖', color: '#8E8E93' };
    }
    
    const direction = overallTrend > 0 ? 'up' : 'down';
    const icon = overallTrend > 0 ? '📈' : '📉';
    const change = Math.abs(overallTrend).toFixed(1);
    
    return {
      text: `${direction} ${change}kg`,
      icon,
      color: trendColor
    };
  };

  const trendInfo = getTrendInfo();

  return (
    <View style={[styles.container, { width, height }, style]}>
      {/* Chart Area */}
      <View style={styles.chartArea}>
        {/* Grid lines for reference */}
        <View style={[styles.gridLine, { top: '25%', width: chartWidth, left: chartPadding }]} />
        <View style={[styles.gridLine, { top: '75%', width: chartWidth, left: chartPadding }]} />

        {/* Line segments */}
        {lineSegments.map((segment) => (
          <View
            key={segment.key}
            style={[
              styles.lineSegment,
              {
                left: segment.left,
                top: segment.top,
                width: segment.width,
                backgroundColor: trendColor,
                transform: [{ rotate: `${segment.angle}deg` }]
              }
            ]}
          />
        ))}

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <View
            key={index}
            style={[
              styles.dataPoint,
              {
                left: point.x - 2,
                top: point.y - 2,
                borderColor: trendColor,
                backgroundColor: index === 0 ? 'rgba(255, 255, 255, 0.3)' : 
                                index === dataPoints.length - 1 ? trendColor : 
                                'rgba(255, 255, 255, 0.6)'
              }
            ]}
          />
        ))}

        {/* Trend fill area (subtle) */}
        <View style={[
          styles.trendFill,
          {
            left: chartPadding,
            width: chartWidth,
            height: chartHeight,
            backgroundColor: `${trendColor}10` // Very subtle fill
          }
        ]} />
      </View>

      {/* Labels */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          <View style={styles.labelLeft}>
            <Text style={styles.labelText}>
              {recentEntries[0].weight.toFixed(1)}
            </Text>
          </View>
          
          <View style={styles.labelCenter}>
            <Text style={[styles.trendLabel, { color: trendInfo.color }]}>
              {trendInfo.icon} {trendInfo.text}
            </Text>
          </View>
          
          <View style={styles.labelRight}>
            <Text style={styles.labelText}>
              {recentEntries[recentEntries.length - 1].weight.toFixed(1)}
            </Text>
          </View>
        </View>
      )}

      {/* Summary stats overlay */}
      <View style={styles.statsOverlay}>
        <Text style={styles.statsText}>
          {recentEntries.length}d • {progressAnalytics?.weeklyTrend ? 
            `${progressAnalytics.weeklyTrend > 0 ? '+' : ''}${progressAnalytics.weeklyTrend.toFixed(2)}kg/w` :
            'tracking'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },

  // No data state
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  noDataText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Chart elements
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trendFill: {
    position: 'absolute',
    top: 4,
  },
  lineSegment: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
  },

  // Labels
  labelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 4,
    height: 16,
  },
  labelLeft: {
    alignItems: 'flex-start',
  },
  labelCenter: {
    alignItems: 'center',
  },
  labelRight: {
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '500',
  },
  trendLabel: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Stats overlay
  statsOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  statsText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});