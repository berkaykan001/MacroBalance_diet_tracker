import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function InsightsCard({ insights }) {
  const [expandedInsights, setExpandedInsights] = useState(new Set());

  if (!insights || insights.length === 0) {
    return null;
  }

  const toggleInsight = (index) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedInsights(newExpanded);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return '💡';
      case 'error': return '❌';
      default: return '📊';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return '#00D084';
      case 'warning': return '#FF9500';
      case 'info': return '#007AFF';
      case 'error': return '#FF453A';
      default: return '#8E8E93';
    }
  };

  const getInsightBgColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(0, 208, 132, 0.1)';
      case 'warning': return 'rgba(255, 149, 0, 0.1)';
      case 'info': return 'rgba(0, 122, 255, 0.1)';
      case 'error': return 'rgba(255, 69, 58, 0.1)';
      default: return 'rgba(142, 142, 147, 0.1)';
    }
  };

  const getInsightBorderColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(0, 208, 132, 0.3)';
      case 'warning': return 'rgba(255, 149, 0, 0.3)';
      case 'info': return 'rgba(0, 122, 255, 0.3)';
      case 'error': return 'rgba(255, 69, 58, 0.3)';
      default: return 'rgba(142, 142, 147, 0.3)';
    }
  };

  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case 'high': return { text: 'High Priority', color: '#FF453A' };
      case 'medium': return { text: 'Medium Priority', color: '#FF9500' };
      case 'low': return { text: 'Low Priority', color: '#8E8E93' };
      default: return { text: '', color: '#8E8E93' };
    }
  };

  // Sort insights by priority
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Insights & Recommendations</Text>
        <Text style={styles.subtitle}>
          Based on your weight tracking data
        </Text>
      </View>

      <View style={styles.insightsList}>
        {sortedInsights.map((insight, index) => {
          const isExpanded = expandedInsights.has(index);
          const priorityInfo = getPriorityDisplay(insight.priority);
          
          return (
            <Pressable
              key={index}
              style={[
                styles.insightCard,
                {
                  backgroundColor: getInsightBgColor(insight.type),
                  borderColor: getInsightBorderColor(insight.type),
                }
              ]}
              onPress={() => toggleInsight(index)}
            >
              <View style={styles.insightHeader}>
                <View style={styles.insightTitleRow}>
                  <Text style={styles.insightIcon}>
                    {getInsightIcon(insight.type)}
                  </Text>
                  <Text style={[
                    styles.insightTitle,
                    { color: getInsightColor(insight.type) }
                  ]}>
                    {insight.title}
                  </Text>
                  {priorityInfo.text && (
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityInfo.color + '20' }
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: priorityInfo.color }
                      ]}>
                        {priorityInfo.text}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.expandIcon}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </View>

              <Text style={styles.insightMessage} numberOfLines={isExpanded ? undefined : 2}>
                {insight.message}
              </Text>

              {/* Additional insight details when expanded */}
              {isExpanded && insight.details && (
                <View style={styles.insightDetails}>
                  {insight.details.map((detail, detailIndex) => (
                    <View key={detailIndex} style={styles.detailItem}>
                      <Text style={styles.detailBullet}>•</Text>
                      <Text style={styles.detailText}>{detail}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Insight actions when expanded */}
              {isExpanded && insight.actions && insight.actions.length > 0 && (
                <View style={styles.insightActions}>
                  <Text style={styles.actionsLabel}>Recommended Actions:</Text>
                  {insight.actions.map((action, actionIndex) => (
                    <Pressable
                      key={actionIndex}
                      style={[
                        styles.actionButton,
                        action.type === 'primary' && styles.primaryActionButton
                      ]}
                      onPress={() => action.onPress && action.onPress()}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        action.type === 'primary' && styles.primaryActionButtonText
                      ]}>
                        {action.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Summary */}
      {sortedInsights.length > 1 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {sortedInsights.filter(i => i.priority === 'high').length} high priority • {' '}
            {sortedInsights.filter(i => i.priority === 'medium').length} medium priority • {' '}
            {sortedInsights.filter(i => i.priority === 'low').length} low priority
          </Text>
        </View>
      )}
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

  // Header
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
    fontSize: 14,
    color: '#8E8E93',
  },

  // Insights List
  insightsList: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Priority Badge
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Content
  insightMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
  },

  // Details
  insightDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  detailBullet: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
    marginTop: 1,
  },
  detailText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    flex: 1,
  },

  // Actions
  insightActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryActionButton: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderColor: 'rgba(0, 208, 132, 0.4)',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryActionButtonText: {
    color: '#00D084',
    fontWeight: '600',
  },

  // Summary
  summary: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
});