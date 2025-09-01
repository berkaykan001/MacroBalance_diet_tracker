import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressStatsCard({ 
  statistics, 
  progressAnalytics, 
  userProfile 
}) {
  if (!statistics && !progressAnalytics) {
    return null;
  }

  const getGoalDisplay = (goal) => {
    switch (goal) {
      case 'cutting': return 'Weight Loss';
      case 'aggressive_cutting': return 'Aggressive Weight Loss';
      case 'bulking': return 'Weight Gain';
      case 'aggressive_bulking': return 'Aggressive Weight Gain';
      case 'maintenance': return 'Maintain Weight';
      default: return 'No Goal Set';
    }
  };

  const formatTrend = (trend) => {
    if (!trend || Math.abs(trend) < 0.01) return 'Stable';
    const direction = trend > 0 ? 'gaining' : 'losing';
    const rate = Math.abs(trend).toFixed(2);
    return `${direction} ${rate} kg/week`;
  };

  const getTrendColor = (trend, goal) => {
    if (!trend || Math.abs(trend) < 0.01) return '#8E8E93';
    
    const isGaining = trend > 0;
    const isGoalGain = goal === 'bulking' || goal === 'aggressive_bulking';
    const isGoalLoss = goal === 'cutting' || goal === 'aggressive_cutting';
    
    if ((isGaining && isGoalGain) || (!isGaining && isGoalLoss)) {
      return '#00D084'; // Good trend
    } else if ((isGaining && isGoalLoss) || (!isGaining && isGoalGain)) {
      return '#FF453A'; // Concerning trend
    }
    
    return '#8E8E93'; // Neutral
  };

  const getProgressColor = (progressPercent) => {
    if (!progressPercent) return '#8E8E93';
    if (progressPercent >= 75) return '#00D084';
    if (progressPercent >= 50) return '#FF9500';
    if (progressPercent >= 25) return '#FFCC02';
    return '#8E8E93';
  };

  const formatConsistency = (consistency) => {
    if (!consistency) return 'Start tracking';
    if (consistency >= 80) return 'Excellent';
    if (consistency >= 60) return 'Good';
    if (consistency >= 40) return 'Fair';
    return 'Improve';
  };

  const getConsistencyColor = (consistency) => {
    if (!consistency) return '#8E8E93';
    if (consistency >= 80) return '#00D084';
    if (consistency >= 60) return '#FF9500';
    if (consistency >= 40) return '#FFCC02';
    return '#FF453A';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Overview</Text>
      
      <View style={styles.statsGrid}>
        {/* Current Weight */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {statistics?.currentWeight?.toFixed(1) || 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Current Weight</Text>
          <Text style={styles.statUnit}>kg</Text>
        </View>

        {/* Total Change */}
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { 
              color: !statistics?.totalChange ? '#8E8E93' :
                     statistics.totalChange > 0 ? '#FF453A' : 
                     statistics.totalChange < 0 ? '#00D084' : '#8E8E93'
            }
          ]}>
            {statistics?.totalChange ? 
              `${statistics.totalChange > 0 ? '+' : ''}${statistics.totalChange.toFixed(1)}` : 
              'N/A'
            }
          </Text>
          <Text style={styles.statLabel}>Total Change</Text>
          <Text style={styles.statUnit}>kg</Text>
        </View>

        {/* Weekly Trend */}
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { color: getTrendColor(progressAnalytics?.weeklyTrend, userProfile?.goal) }
          ]}>
            {progressAnalytics?.weeklyTrend ? 
              `${progressAnalytics.weeklyTrend > 0 ? '+' : ''}${progressAnalytics.weeklyTrend.toFixed(2)}` : 
              'N/A'
            }
          </Text>
          <Text style={styles.statLabel}>Weekly Trend</Text>
          <Text style={styles.statUnit}>kg/week</Text>
        </View>

        {/* Tracking Days */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {statistics?.trackingDays || 0}
          </Text>
          <Text style={styles.statLabel}>Days Tracked</Text>
          <Text style={styles.statUnit}>days</Text>
        </View>
      </View>

      {/* Detailed Stats Row */}
      <View style={styles.detailedStats}>
        {/* Goal Progress */}
        {progressAnalytics?.goalWeight && (
          <View style={styles.detailedStatItem}>
            <View style={styles.detailedStatHeader}>
              <Text style={styles.detailedStatLabel}>Goal Progress</Text>
              <Text style={[
                styles.detailedStatValue,
                { color: getProgressColor(progressAnalytics.progressPercentage) }
              ]}>
                {progressAnalytics.progressPercentage?.toFixed(0) || 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { 
                  width: `${Math.min(progressAnalytics.progressPercentage || 0, 100)}%`,
                  backgroundColor: getProgressColor(progressAnalytics.progressPercentage)
                }
              ]} />
            </View>
            <Text style={styles.progressText}>
              Target: {progressAnalytics.goalWeight.toFixed(1)} kg • {getGoalDisplay(userProfile?.goal)}
            </Text>
          </View>
        )}

        {/* Consistency Score */}
        <View style={styles.detailedStatItem}>
          <View style={styles.detailedStatHeader}>
            <Text style={styles.detailedStatLabel}>Tracking Consistency</Text>
            <Text style={[
              styles.detailedStatValue,
              { color: getConsistencyColor(statistics?.consistency) }
            ]}>
              {formatConsistency(statistics?.consistency)}
            </Text>
          </View>
          <View style={styles.consistencyIndicator}>
            <View style={[
              styles.consistencyFill,
              { 
                width: `${Math.min(statistics?.consistency || 0, 100)}%`,
                backgroundColor: getConsistencyColor(statistics?.consistency)
              }
            ]} />
          </View>
          <Text style={styles.consistencyText}>
            {statistics?.totalEntries || 0} entries • {statistics?.consistency?.toFixed(0) || 0}% consistent
          </Text>
        </View>

        {/* On Track Status */}
        {progressAnalytics?.isOnTrack !== null && (
          <View style={styles.detailedStatItem}>
            <View style={styles.detailedStatHeader}>
              <Text style={styles.detailedStatLabel}>Progress Status</Text>
              <Text style={[
                styles.detailedStatValue,
                { 
                  color: progressAnalytics.isOnTrack === true ? '#00D084' : 
                         progressAnalytics.isOnTrack === false ? '#FF453A' : '#8E8E93'
                }
              ]}>
                {progressAnalytics.isOnTrack === true ? 'On Track' : 
                 progressAnalytics.isOnTrack === false ? 'Needs Attention' : 'Analyzing'}
              </Text>
            </View>
            <Text style={styles.statusText}>
              {progressAnalytics.isOnTrack === true ? 
                'Your progress aligns with your goal timeline' :
                progressAnalytics.isOnTrack === false ?
                'Consider adjusting nutrition or activity levels' :
                'Keep tracking for more accurate analysis'
              }
            </Text>
          </View>
        )}

        {/* Projected Goal Date */}
        {progressAnalytics?.projectedGoalDate && (
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>📅 Projected Goal Achievement</Text>
            <Text style={styles.projectionDate}>
              {new Date(progressAnalytics.projectedGoalDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <Text style={styles.projectionSubtext}>
              Based on current trend of {formatTrend(progressAnalytics.weeklyTrend)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    minWidth: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Detailed Stats
  detailedStats: {
    gap: 16,
  },
  detailedStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailedStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailedStatLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailedStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Progress Bar
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Consistency Indicator
  consistencyIndicator: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  consistencyFill: {
    height: '100%',
    borderRadius: 2,
  },
  consistencyText: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Status and Projection
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    marginTop: 4,
  },
  projectionItem: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  projectionLabel: {
    fontSize: 14,
    color: '#00D084',
    fontWeight: '600',
    marginBottom: 6,
  },
  projectionDate: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  projectionSubtext: {
    fontSize: 12,
    color: '#66E6AC',
  },
});