import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Pressable, TextInput, Keyboard, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFood } from '../context/FoodContext';

export default function LoadPresetModal({ 
  visible, 
  onClose, 
  onLoadPreset,
  presets,
  onDeletePreset 
}) {
  const { foods } = useFood();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = searchQuery.trim() 
    ? presets.filter(preset => 
        preset.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : presets.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));

  const handleLoadPreset = (preset) => {
    onLoadPreset(preset);
    onClose();
  };

  const handleDeletePreset = (preset) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeletePreset(preset.id)
        }
      ]
    );
  };

  const getFoodName = (foodId) => {
    const food = foods.find(f => f.id === foodId);
    return food ? food.name : 'Unknown Food';
  };

  const renderPreset = ({ item: preset }) => {
    const foodSummary = preset.foods
      .slice(0, 3)
      .map(food => getFoodName(food.foodId))
      .join(', ');
    
    const remainingCount = Math.max(0, preset.foods.length - 3);
    const displayText = remainingCount > 0 
      ? `${foodSummary} +${remainingCount} more`
      : foodSummary;

    return (
      <Pressable 
        style={styles.presetItem}
        onPressIn={() => Keyboard.dismiss()}
        onPress={() => handleLoadPreset(preset)}
        onLongPress={() => handleDeletePreset(preset)}
      >
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.presetGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.presetHeader}>
            <Text style={styles.presetName}>{preset.name}</Text>
            <View style={styles.presetMeta}>
              <Text style={styles.presetCalories}>{preset.totalCalories} cal</Text>
              <Text style={styles.presetDate}>
                {new Date(preset.lastUsed).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.presetFoods} numberOfLines={2}>
            {displayText}
          </Text>
          
          <View style={styles.presetStats}>
            <View style={styles.presetStat}>
              <Text style={styles.presetStatValue}>{preset.foods.length}</Text>
              <Text style={styles.presetStatLabel}>foods</Text>
            </View>
            <View style={styles.presetStat}>
              <Text style={styles.presetStatValue}>{Math.round(preset.calculatedMacros.protein)}g</Text>
              <Text style={styles.presetStatLabel}>protein</Text>
            </View>
            <View style={styles.presetStat}>
              <Text style={styles.presetStatValue}>{Math.round(preset.calculatedMacros.carbs)}g</Text>
              <Text style={styles.presetStatLabel}>carbs</Text>
            </View>
            <View style={styles.presetStat}>
              <Text style={styles.presetStatValue}>{Math.round(preset.calculatedMacros.fat)}g</Text>
              <Text style={styles.presetStatLabel}>fat</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Load Meal Preset</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.searchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search presets..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </LinearGradient>
        </View>

        {/* Presets List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {searchQuery.trim() 
                ? `Search results (${filteredPresets.length})`
                : `Your saved presets (${presets.length})`
              }
            </Text>
            {!searchQuery.trim() && presets.length > 0 && (
              <Text style={styles.listHeaderSubtext}>
                Sorted by recently used • Long press to delete
              </Text>
            )}
          </View>

          <FlatList
            data={filteredPresets}
            renderItem={renderPreset}
            keyExtractor={(item) => item.id}
            style={styles.presetsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            contentContainerStyle={styles.presetsListContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>
                  {searchQuery.trim() ? 'No presets found' : 'No saved presets yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery.trim() 
                    ? 'Try a different search term'
                    : 'Save your first meal preset to see it here'
                  }
                </Text>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },

  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listHeaderSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  presetsList: {
    flex: 1,
  },
  presetsListContent: {
    paddingBottom: 20,
  },

  // Preset Item
  presetItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  presetGradient: {
    padding: 16,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  presetMeta: {
    alignItems: 'flex-end',
  },
  presetCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 2,
  },
  presetDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  presetFoods: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 18,
  },
  presetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  presetStat: {
    alignItems: 'center',
    flex: 1,
  },
  presetStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D084',
    marginBottom: 2,
  },
  presetStatLabel: {
    fontSize: 9,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});