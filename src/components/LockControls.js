import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const LockControls = ({ 
  isLocked, 
  hasMaxLimit, 
  hasMinLimit, 
  onToggleLock, 
  onToggleMaxLimit, 
  onToggleMinLimit,
  maxLimitValue,
  minLimitValue 
}) => {
  return (
    <View style={styles.container}>
      {/* Min Limit Button */}
      <TouchableOpacity 
        style={[styles.button, hasMinLimit ? styles.minLimitButton : styles.unlockedButton]}
        onPress={onToggleMinLimit}
      >
        <Text style={styles.icon}>
          ⬇️
        </Text>
      </TouchableOpacity>

      {/* Full Lock Button */}
      <TouchableOpacity 
        style={[styles.button, isLocked ? styles.lockedButton : styles.unlockedButton]}
        onPress={onToggleLock}
      >
        <Text style={styles.icon}>
          {isLocked ? '🔒' : '🔓'}
        </Text>
      </TouchableOpacity>

      {/* Max Limit Button */}
      <TouchableOpacity 
        style={[styles.button, hasMaxLimit ? styles.maxLimitButton : styles.unlockedButton]}
        onPress={onToggleMaxLimit}
      >
        <Text style={styles.icon}>
          ⬆️
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  lockedButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  maxLimitButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  minLimitButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  unlockedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    fontSize: 10,
  },
});

export default LockControls;