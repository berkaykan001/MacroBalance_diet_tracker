import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeightTrackingStatus } from '../../hooks/useWeightTrackingIntegration';

export default function WeightProgressCard({ 
  onPress, 
  style,
  showFullDetails = false 
}) {
  const { getWeightTrackingStatus, getIntegrationStats } = useWeightTrackingStatus();
  
  const status = getWeightTrackingStatus();
  const stats = getIntegrationStats();

  const formatTrend = (trend) => {
    if (!trend || Math.abs(trend) < 0.01) return { text: 'Stable', color: '#8E8E93' };
    
    const direction = trend > 0 ? 'up' : 'down';
    const rate = Math.abs(trend).toFixed(2);
    const icon = trend > 0 ? '📈' : '📉';
    const color = trend > 0 ? '#FF453A' : '#00D084';
    
    return {
      text: `${rate} kg/week`,
      icon,
      direction,
      color
    };
  };

  const getStatusDisplay = () => {
    switch (status.status) {
      case 'setup_required':
        return {
          title: 'Weight Tracking',
          subtitle: 'Complete setup to start',
          icon: '⚙️',
          color: '#FF9500'
        };
      case 'disabled':
        return {
          title: 'Weight Tracking',
          subtitle: 'Enable in settings',
          icon: '⏸️',
          color: '#8E8E93'
        };
      case 'no_data':
        return {
          title: 'Start Tracking',
          subtitle: 'Add your first weight entry',
          icon: '📊',
          color: '#007AFF'
        };
      case 'insufficient_data':
        return {
          title: `${stats.totalEntries} Entries`,
          subtitle: `${6 - stats.totalEntries} more for insights`,
          icon: '📈',
          color: '#FF9500'
        };
      case 'active':
        return {
          title: 'Weight Tracking',
          subtitle: 'Active monitoring',
          icon: '✅',
          color: '#00D084'
        };
      default:
        return {
          title: 'Weight Tracking',
          subtitle: 'Unknown status',
          icon: '❓',
          color: '#8E8E93'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // If no weight data, show setup/encouragement card
  if (!stats.hasProgressAnalytics || stats.totalEntries === 0) {
    return (
      <Pressable style={[styles.container, style]} onPress={onPress}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.statusIcon}>{statusDisplay.icon}</Text>
              <View>
                <Text style={styles.title}>{statusDisplay.title}</Text>
                <Text style={[styles.subtitle, { color: statusDisplay.color }]}>
                  {statusDisplay.subtitle}
                </Text>
              </View>
            </View>
            {status.canTrack && (
              <View style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </View>
            )}
          </View>

          <View style={styles.encouragementSection}>
            <Text style={styles.encouragementText}>
              {status.status === 'no_data' 
                ? "Start tracking your weight to see progress insights and automatic macro adjustments."
                : status.message
              }
            </Text>
          </View>

          {status.canTrack && (
            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>Tap to add entry</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  // Show active weight tracking card with data
  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <LinearGradient
        colors={[
          'rgba(0, 208, 132, 0.1)',
          'rgba(0, 208, 132, 0.05)',
          'rgba(255, 255, 255, 0.02)'
        ]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.statusIcon}>⚖️</Text>
            <View>
              <Text style={styles.title}>Weight Progress</Text>
              <Text style={styles.subtitle}>
                {stats.totalEntries} entries • {stats.lastEntryDate ? 
                  `Last: ${new Date(stats.lastEntryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
                  'No recent entries'
                }
              </Text>
            </View>
          </View>
          
          {stats.pendingAdjustments > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>!</Text>
            </View>
          )}
        </View>

        {/* Current Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statValue}>
              {/* This would come from actual weight data */}
              -- kg
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trend</Text>
            <View style={styles.trendContainer}>
              <Text style={styles.trendIcon}>📈</Text>
              <Text style={[styles.statValue, { fontSize: 14 }]}>
                Stable
              </Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={[styles.statValue, { fontSize: 14, color: '#00D084' }]}>
              On Track
            </Text>
          </View>
        </View>

        {/* Mini Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressText}>65% to goal</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.quickAction}>
            <Text style={styles.quickActionText}>📊 View Details</Text>
          </View>
          
          {stats.pendingAdjustments > 0 && (
            <View style={[styles.quickAction, styles.adjustmentAction]}>
              <Text style={styles.adjustmentActionText}>🎯 Macro Update</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  // Action Buttons
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 208, 132, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#00D084',
    fontSize: 18,
    fontWeight: '600',
  },
  notificationBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF453A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Encouragement Section (for no data state)
  encouragementSection: {
    paddingVertical: 12,
  },
  encouragementText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
  actionHint: {
    marginTop: 8,
    alignItems: 'center',
  },
  actionHintText: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: '500',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  // Progress Section
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D084',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#00D084',
    textAlign: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  adjustmentAction: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  adjustmentActionText: {
    color: '#FF9500',
    fontWeight: '600',
  },
});