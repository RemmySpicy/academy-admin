import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function App(): JSX.Element {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Academy Students App</Text>
        <Text style={styles.subtitle}>🚧 Under Development</Text>
        <Text style={styles.description}>
          This is the base structure for the Academy Students & Parents mobile app.
          {'\n\n'}
          📂 Place your existing code in the 'existing-code' folder
          {'\n\n'}
          🛠️ Start rebuilding using the shared API client and types
        </Text>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
  },
});