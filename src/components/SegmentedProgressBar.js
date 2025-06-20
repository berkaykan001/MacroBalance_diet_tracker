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

  // Calculate label positions for segments
  const getAbbreviation = (name, isSmall = false, isVertical = false) => {
    const abbreviations = {
      'Saturated': isVertical ? 'S' : (isSmall ? 'Sat' : 'Sat'),
      'Monounsaturated': isVertical ? 'M' : (isSmall ? 'Mono' : 'Mono'),
      'Polyunsaturated': isVertical ? 'P' : (isSmall ? 'Poly' : 'Poly'),
      'Omega-3': isVertical ? 'Ω' : 'Ω3',
      'Trans': isVertical ? 'T' : 'Trans',
      'Added Sugars': isVertical ? 'A' : (isSmall ? 'Add' : 'Added'),
      'Natural Sugars': isVertical ? 'N' : (isSmall ? 'Nat' : 'Natural'),
      'Other Carbs': isVertical ? 'C' : (isSmall ? 'Carb' : 'Carbs'),
      'Fiber': isVertical ? 'F' : 'Fiber',
      'Protein': isVertical ? 'P' : (isSmall ? 'Prot' : 'Protein'),
      'Unknown': '?'
    };
    return abbreviations[name] || name.slice(0, isVertical ? 1 : (isSmall ? 3 : 5));
  };

  // Calculate cumulative positions for label centering with smart overlap detection
  let cumulativeWidth = 0;
  const labelPositions = segmentsWithWidths.map((segment, index) => {
    const centerPosition = cumulativeWidth + (segment.widthPercent / 2);
    cumulativeWidth += segment.widthPercent;
    
    // Always show labels, but adapt their style based on size
    const showLabel = segment.widthPercent > 3; // Even tiny segments get vertical labels
    
    return {
      ...segment,
      centerPosition,
      showLabel,
      abbreviation: getAbbreviation(segment.name, segment.widthPercent < 12),
      index
    };
  });

  // Detect overlaps and adjust label rotation with consistent directions
  const finalLabelPositions = labelPositions.map((current, index) => {
    if (!current.showLabel) return current;
    
    // Check for overlap with next label
    const nextLabel = labelPositions[index + 1];
    const hasOverlap = nextLabel && nextLabel.showLabel && 
      Math.abs(current.centerPosition - nextLabel.centerPosition) < 12; // 12% minimum spacing
    
    // Determine label orientation based on segment size
    let rotation = 0;
    let isVertical = false;
    
    if (current.widthPercent < 6) {
      // Very tiny segments: vertical text
      rotation = -90;
      isVertical = true;
    } else if (current.widthPercent < 12 || hasOverlap) {
      // Small segments or overlapping: consistent diagonal (bottom-left to top-right)
      rotation = -45;
    }
    // Medium/large segments: horizontal (rotation = 0)
    
    return {
      ...current,
      rotation,
      isVertical,
      // Update abbreviation based on final orientation
      abbreviation: getAbbreviation(current.name, current.widthPercent < 12, isVertical)
    };
  });

  return (
    <View style={styles.container}>
      {/* Progress bar row: Label | Progress Bar | Value */}
      <View style={styles.progressRow}>
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

      {/* Label row underneath progress bar */}
      {finalLabelPositions.some(pos => pos.showLabel) && (
        <View style={styles.labelRow}>
          <View style={styles.labelSpacer} />
          <View style={styles.labelContainer}>
            {finalLabelPositions.map((segment, index) => 
              segment.showLabel && (
                <Text 
                  key={index}
                  style={[
                    styles.segmentLabel,
                    segment.isVertical && styles.verticalLabel,
                    { 
                      left: `${segment.centerPosition}%`,
                      transform: [
                        { translateX: -20 },
                        { rotate: `${segment.rotation}deg` }
                      ]
                    }
                  ]}
                >
                  {segment.abbreviation}
                </Text>
              )
            )}
          </View>
          <View style={styles.labelSpacer} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
  labelRow: {
    flexDirection: 'row',
    height: 16, // Increased height for rotated text
    alignItems: 'center',
  },
  labelSpacer: {
    width: 45 + 8, // Same as label width + margin
  },
  labelContainer: {
    flex: 1,
    position: 'relative',
    height: '100%',
    marginRight: 8,
  },
  segmentLabel: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    width: 40,
  },
  verticalLabel: {
    fontSize: 9, // Larger for single character vertical text
    width: 20,
    fontWeight: '600',
  },
});