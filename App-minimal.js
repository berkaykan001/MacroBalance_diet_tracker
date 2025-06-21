import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('Minimal App starting...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>MacroBalance - Minimal Test</Text>
      <Text style={styles.subtitle}>If you see this, basic React Native works!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
});