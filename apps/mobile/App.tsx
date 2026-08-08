import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { APP_CONFIG } from '@gbud/config';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_CONFIG.name} — Mobile App</Text>
      <Text style={styles.subtitle}>{APP_CONFIG.description}</Text>
      <Text style={styles.badge}>Phase 0 — Project Foundation Active</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 20,
  },
  badge: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
});
