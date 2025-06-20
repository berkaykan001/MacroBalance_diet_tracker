import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SegmentedProgressBar({ 
  label, 
  current, 
  target, 
  segments = [], 
  unit = 'g' 
}) {
  // Calculate the maximum scale (target * 1.5 so target appears at 66% of the bar)
  const maxValue = target * 1.5;
  const currentPercentage = Math.min(100, (current / maxValue) * 100);
  const targetPercentage = (target / maxValue) * 100;
  
  // Determine overall status color for the value text
  const difference = Math.abs(current - target);
  const tolerance = target * 0.05; // 5% tolerance
  
  let valueColor;
  if (difference <= tolerance) {
    valueColor = '#00D084'; // Green when close to target
  } else if (current < target) {
    valueColor = '#FF9500'; // Orange when under
  } else {
    valueColor = '#FF453A'; // Red when over
  }

  // Calculate segment widths based on their proportion of the current value
  // Use current value as the basis for proportions, not segment sum
  const segmentsWithWidths = segments
    .filter(segment => segment.value > 0) // Only show segments with values
    .map(segment => ({
      ...segment,
      widthPercent: current > 0 ? (segment.value / current) * currentPercentage : 0
    }));

  // If segments don't add up to the full current value, add a gray "unknown" segment
  const totalSegmentValue = segments.reduce((sum, segment) => sum + segment.value, 0);
  const unknownValue = current - totalSegmentValue;
  
  if (unknownValue > 0.1) { // Only show if significant difference (> 0.1g)
    segmentsWithWidths.push({
      value: unknownValue,
      colors: ['#6A6A6A', '#8A8A8A'], // Gray for unknown composition
      name: 'Unknown',
      widthPercent: (unknownValue / current) * currentPercentage
    });
  }

  return (
    <View style={styles.container}>
      {/* Single row: Label | Progress Bar | Value */}
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.trackContainer}>
        {/* Background track */}
        <View style={styles.background} />
        
        {/* Target indicator line */}
        <View style={[styles.targetIndicator, { left: `${targetPercentage}%` }]} />
        
        {/* Segmented progress fill */}
        <View style={styles.segmentContainer}>
          {segmentsWithWidths.map((segment, index) => (
            <LinearGradient
              key={index}
              colors={segment.colors}
              style={[styles.segment, { width: `${segment.widthPercent}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ))}
        </View>
      </View>
      
      <Text style={[styles.value, { color: valueColor }]}>
        {current}{unit}/{target}{unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 45,
    marginRight: 8,
  },
  trackContainer: {
    flex: 1,
    height: 4,
    position: 'relative',
    marginRight: 8,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
  },
  targetIndicator: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    marginLeft: -0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  segment: {
    height: '100%',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  value: {
    fontSize: 9,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});