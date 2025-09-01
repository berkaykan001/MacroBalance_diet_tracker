import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function WeightEntryCard({ 
  entry, 
  previousEntry, 
  onEdit, 
  onDelete, 
  style 
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeightChange = () => {
    if (!previousEntry) return null;
    
    const change = entry.weight - previousEntry.weight;
    const changeText = Math.abs(change).toFixed(1);
    
    return {
      value: change,
      text: changeText,
      isIncrease: change > 0,
      isDecrease: change < 0,
      isNoChange: Math.abs(change) < 0.1
    };
  };

  const weightChange = getWeightChange();

  const getChangeIcon = () => {
    if (!weightChange) return null;
    if (weightChange.isNoChange) return '➖';
    if (weightChange.isIncrease) return '📈';
    return '📉';
  };

  const getChangeColor = () => {
    if (!weightChange) return '#8E8E93';
    if (weightChange.isNoChange) return '#8E8E93';
    if (weightChange.isIncrease) return '#FF453A';
    return '#00D084';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mainContent}>
        {/* Weight Display */}
        <View style={styles.weightSection}>
          <Text style={styles.weight}>{entry.weight.toFixed(1)}</Text>
          <Text style={styles.weightUnit}>kg</Text>
          
          {/* Weight Change Indicator */}
          {weightChange && !weightChange.isNoChange && (
            <View style={[styles.changeIndicator, { backgroundColor: getChangeColor() + '20' }]}>
              <Text style={styles.changeIcon}>{getChangeIcon()}</Text>
              <Text style={[styles.changeText, { color: getChangeColor() }]}>
                {weightChange.isIncrease ? '+' : '-'}{weightChange.text}
              </Text>
            </View>
          )}
        </View>

        {/* Date and Details */}
        <View style={styles.detailsSection}>
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
            <Text style={styles.fullDate}>{formatFullDate(entry.date)}</Text>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            {entry.bodyFat && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Body Fat</Text>
                <Text style={styles.infoValue}>{entry.bodyFat.toFixed(1)}%</Text>
              </View>
            )}
            
            {entry.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText} numberOfLines={2}>
                  {entry.notes}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </Pressable>
        
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Weight Section
  weightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  weight: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weightUnit: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 2,
    marginTop: 4,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  changeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Details Section
  detailsSection: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fullDate: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Additional Info
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  infoValue: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: '500',
  },
  notesContainer: {
    flex: 1,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 16,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  editButton: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  editButtonText: {
    fontSize: 14,
  },
  deleteButtonText: {
    fontSize: 14,
  },
});