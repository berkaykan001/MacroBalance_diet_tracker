import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeightChart({ entries, timeframe, width, height }) {
  if (!entries || entries.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data to display</Text>
        </View>
      </View>
    );
  }

  // Sort entries chronologically (oldest first for chart)
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (sortedEntries.length < 2) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Need at least 2 entries for chart</Text>
        </View>
      </View>
    );
  }

  const weights = sortedEntries.map(entry => entry.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight;
  
  // Add padding to the range for better visualization
  const padding = Math.max(weightRange * 0.1, 1); // At least 1kg padding
  const chartMinWeight = minWeight - padding;
  const chartMaxWeight = maxWeight + padding;
  const chartRange = chartMaxWeight - chartMinWeight;

  const chartPadding = 20;
  const chartWidth = width - (chartPadding * 2);
  const chartHeight = height - 60; // Leave space for labels

  // Calculate positions for data points
  const dataPoints = sortedEntries.map((entry, index) => {
    const x = chartPadding + (index / (sortedEntries.length - 1)) * chartWidth;
    const normalizedWeight = (entry.weight - chartMinWeight) / chartRange;
    const y = chartHeight - (normalizedWeight * chartHeight) + 30; // 30px top padding
    
    return {
      x,
      y,
      weight: entry.weight,
      date: entry.date,
      index
    };
  });

  // Create path for the line
  const pathData = dataPoints.map((point, index) => {
    return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
  }).join(' ');

  // Calculate trend line
  const firstPoint = dataPoints[0];
  const lastPoint = dataPoints[dataPoints.length - 1];
  const trendSlope = (lastPoint.y - firstPoint.y) / (lastPoint.x - firstPoint.x);
  const trendIntercept = firstPoint.y - (trendSlope * firstPoint.x);
  
  const trendStartY = trendSlope * firstPoint.x + trendIntercept;
  const trendEndY = trendSlope * lastPoint.x + trendIntercept;

  // Determine trend color based on goal (assuming weight loss is generally desired)
  const weightChange = lastPoint.weight - firstPoint.weight;
  const trendColor = weightChange < 0 ? '#00D084' : weightChange > 0 ? '#FF453A' : '#8E8E93';

  // Generate Y-axis labels
  const getYAxisLabels = () => {
    const labels = [];
    const labelCount = 5;
    
    for (let i = 0; i < labelCount; i++) {
      const weight = chartMinWeight + (chartRange * i / (labelCount - 1));
      const y = chartHeight - (i / (labelCount - 1)) * chartHeight + 30;
      
      labels.push({
        weight: weight.toFixed(1),
        y
      });
    }
    
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  // Generate X-axis labels
  const getXAxisLabels = () => {
    const labels = [];
    const maxLabels = Math.min(sortedEntries.length, 6);
    const step = Math.max(1, Math.floor(sortedEntries.length / maxLabels));
    
    for (let i = 0; i < sortedEntries.length; i += step) {
      const entry = sortedEntries[i];
      const point = dataPoints[i];
      const date = new Date(entry.date);
      
      let label;
      if (timeframe === 'week') {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeframe === 'month') {
        label = date.toLocaleDateString('en-US', { day: 'numeric' });
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      labels.push({
        label,
        x: point.x,
        y: chartHeight + 45
      });
    }
    
    return labels;
  };

  const xAxisLabels = getXAxisLabels();

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Chart Area */}
      <View style={styles.chartArea}>
        {/* Grid Lines */}
        {yAxisLabels.map((label, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              {
                top: label.y,
                left: chartPadding,
                width: chartWidth
              }
            ]}
          />
        ))}

        {/* Y-axis Labels */}
        {yAxisLabels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.yAxisLabel,
              {
                top: label.y - 8,
                left: 2
              }
            ]}
          >
            {label.weight}
          </Text>
        ))}

        {/* Trend Line */}
        <View
          style={[
            styles.trendLine,
            {
              position: 'absolute',
              left: firstPoint.x,
              top: Math.min(trendStartY, trendEndY),
              width: Math.sqrt(
                Math.pow(lastPoint.x - firstPoint.x, 2) + 
                Math.pow(trendEndY - trendStartY, 2)
              ),
              height: 1,
              backgroundColor: trendColor,
              opacity: 0.5,
              transform: [{
                rotate: `${Math.atan2(trendEndY - trendStartY, lastPoint.x - firstPoint.x)}rad`
              }]
            }
          ]}
        />

        {/* Data Line Segments */}
        {dataPoints.slice(0, -1).map((point, index) => {
          const nextPoint = dataPoints[index + 1];
          const segmentWidth = Math.sqrt(
            Math.pow(nextPoint.x - point.x, 2) + 
            Math.pow(nextPoint.y - point.y, 2)
          );
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
          
          return (
            <View
              key={index}
              style={[
                styles.lineSegment,
                {
                  left: point.x,
                  top: point.y,
                  width: segmentWidth,
                  transform: [{ rotate: `${angle}deg` }]
                }
              ]}
            />
          );
        })}

        {/* Data Points */}
        {dataPoints.map((point, index) => (
          <View
            key={index}
            style={[
              styles.dataPoint,
              {
                left: point.x - 4,
                top: point.y - 4
              }
            ]}
          >
            <View style={styles.dataPointInner} />
          </View>
        ))}

        {/* X-axis Labels */}
        {xAxisLabels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.xAxisLabel,
              {
                left: label.x - 20,
                top: label.y
              }
            ]}
          >
            {label.label}
          </Text>
        ))}
      </View>

      {/* Chart Info */}
      <View style={styles.chartInfo}>
        <View style={styles.chartInfoItem}>
          <Text style={styles.chartInfoLabel}>Change</Text>
          <Text style={[
            styles.chartInfoValue,
            { color: weightChange < 0 ? '#00D084' : weightChange > 0 ? '#FF453A' : '#8E8E93' }
          ]}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
          </Text>
        </View>
        
        <View style={styles.chartInfoItem}>
          <Text style={styles.chartInfoLabel}>Range</Text>
          <Text style={styles.chartInfoValue}>
            {minWeight.toFixed(1)} - {maxWeight.toFixed(1)} kg
          </Text>
        </View>
        
        <View style={styles.chartInfoItem}>
          <Text style={styles.chartInfoLabel}>Entries</Text>
          <Text style={styles.chartInfoValue}>{sortedEntries.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  
  // Grid and Axis
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
    width: 40,
  },
  
  // Chart Elements
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#00D084',
    borderRadius: 1,
  },
  trendLine: {
    position: 'absolute',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00D084',
  },
  dataPointInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00D084',
  },
  
  // Chart Info
  chartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartInfoItem: {
    alignItems: 'center',
  },
  chartInfoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  chartInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});