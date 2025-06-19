import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FoodManagementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Database</Text>
      <Text style={styles.subtitle}>Manage your foods</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});