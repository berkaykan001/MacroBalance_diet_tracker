import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const LockButton = ({ isLocked, onToggle }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, isLocked ? styles.lockedButton : styles.unlockedButton]}
      onPress={onToggle}
    >
      <Text style={styles.icon}>
        {isLocked ? '🔒' : '🔓'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  lockedButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  unlockedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    fontSize: 12,
  },
});

export default LockButton;