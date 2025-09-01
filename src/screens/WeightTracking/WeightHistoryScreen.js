import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeight } from '../../context/WeightContext';
import { useSettings } from '../../context/SettingsContext';
import { PrimaryButton, SecondaryButton } from '../Onboarding/components/OnboardingComponents';
import WeightChart from './components/WeightChart';
import WeightEntryCard from './components/WeightEntryCard';
import ProgressStatsCard from './components/ProgressStatsCard';
import InsightsCard from './components/InsightsCard';

const { width: screenWidth } = Dimensions.get('window');

export default function WeightHistoryScreen({ navigation }) {
  const { 
    weightEntries, 
    progressAnalytics, 
    insights,
    isLoading, 
    error,
    deleteWeightEntry,
    loadWeightData,
    getWeightStatistics
  } = useWeight();
  
  const { userProfile } = useSettings();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // 'week', 'month', 'quarter', 'all'

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeightData();
    setRefreshing(false);
  };

  const handleAddWeight = () => {
    navigation.navigate('WeightEntry');
  };

  const handleEditEntry = (entry) => {
    navigation.navigate('WeightEntry', {
      entryId: entry.id,
      entry: entry
    });
  };

  const handleDeleteEntry = (entry) => {
    Alert.alert(
      'Delete Weight Entry',
      `Are you sure you want to delete the weight entry from ${formatDate(entry.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteWeightEntry(entry.id);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete entry');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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

  const getFilteredEntries = () => {
    if (!weightEntries || selectedTimeframe === 'all') {
      return weightEntries || [];
    }

    const now = new Date();
    let cutoffDate = new Date(now);

    switch (selectedTimeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return weightEntries || [];
    }

    return (weightEntries || []).filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
  };

  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case 'week': return 'Past Week';
      case 'month': return 'Past Month';
      case 'quarter': return 'Past 3 Months';
      default: return 'All Time';
    }
  };

  const filteredEntries = getFilteredEntries();
  const statistics = getWeightStatistics();

  if (isLoading && !refreshing) {
    return (
      <LinearGradient colors={['#000000', '#1C1C1E']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading weight history...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1C1C1E']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D084"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weight History</Text>
          <Text style={styles.subtitle}>
            Track your progress and see trends over time
          </Text>
        </View>

        {/* Empty State */}
        {(!weightEntries || weightEntries.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Weight Entries Yet</Text>
            <Text style={styles.emptyMessage}>
              Start tracking your weight to see progress analytics and trends.
            </Text>
            <PrimaryButton
              title="Add First Entry"
              onPress={handleAddWeight}
              style={styles.emptyButton}
            />
          </View>
        )}

        {/* Content - Only show if there are entries */}
        {weightEntries && weightEntries.length > 0 && (
          <>
            {/* Progress Statistics */}
            {statistics && (
              <ProgressStatsCard 
                statistics={statistics}
                progressAnalytics={progressAnalytics}
                userProfile={userProfile}
              />
            )}

            {/* Insights */}
            {insights && insights.length > 0 && (
              <InsightsCard insights={insights} />
            )}

            {/* Weight Chart */}
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Weight Trend</Text>
                
                {/* Timeframe Selector */}
                <View style={styles.timeframeSelector}>
                  {['week', 'month', 'quarter', 'all'].map((timeframe) => (
                    <Pressable
                      key={timeframe}
                      style={[
                        styles.timeframeButton,
                        selectedTimeframe === timeframe && styles.timeframeButtonActive
                      ]}
                      onPress={() => setSelectedTimeframe(timeframe)}
                    >
                      <Text style={[
                        styles.timeframeButtonText,
                        selectedTimeframe === timeframe && styles.timeframeButtonTextActive
                      ]}>
                        {timeframe === 'week' ? '1W' : 
                         timeframe === 'month' ? '1M' :
                         timeframe === 'quarter' ? '3M' : 'All'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <WeightChart 
                entries={filteredEntries}
                timeframe={selectedTimeframe}
                width={screenWidth - 48}
                height={200}
              />
              
              <Text style={styles.chartSubtitle}>
                Showing {getTimeframeLabel()} • {filteredEntries.length} entries
              </Text>
            </View>

            {/* Weight Entries List */}
            <View style={styles.entriesSection}>
              <View style={styles.entriesHeader}>
                <Text style={styles.entriesTitle}>Recent Entries</Text>
                <SecondaryButton
                  title="Add Entry"
                  onPress={handleAddWeight}
                  style={styles.addButton}
                />
              </View>

              {filteredEntries.length === 0 ? (
                <View style={styles.noEntriesMessage}>
                  <Text style={styles.noEntriesText}>
                    No entries for {getTimeframeLabel().toLowerCase()}
                  </Text>
                </View>
              ) : (
                <View style={styles.entriesList}>
                  {filteredEntries.map((entry, index) => (
                    <WeightEntryCard
                      key={entry.id}
                      entry={entry}
                      previousEntry={filteredEntries[index + 1]}
                      onEdit={() => handleEditEntry(entry)}
                      onDelete={() => handleDeleteEntry(entry)}
                      style={styles.entryCard}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Show All Entries Button */}
            {selectedTimeframe !== 'all' && weightEntries.length > filteredEntries.length && (
              <View style={styles.showAllSection}>
                <SecondaryButton
                  title={`Show All ${weightEntries.length} Entries`}
                  onPress={() => setSelectedTimeframe('all')}
                  style={styles.showAllButton}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {weightEntries && weightEntries.length > 0 && (
        <Pressable style={styles.floatingButton} onPress={handleAddWeight}>
          <LinearGradient
            colors={['#00D084', '#00A86B']}
            style={styles.floatingButtonGradient}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </LinearGradient>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    width: '100%',
  },

  // Chart Section
  chartSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
  },

  // Timeframe Selector
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: '#00D084',
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  timeframeButtonTextActive: {
    color: '#FFFFFF',
  },

  // Entries Section
  entriesSection: {
    marginBottom: 24,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    marginBottom: 0,
  },
  noEntriesMessage: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noEntriesText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Show All Section
  showAllSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  showAllButton: {
    paddingHorizontal: 24,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});