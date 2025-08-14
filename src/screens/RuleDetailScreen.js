// src/screens/RuleDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function RuleDetailScreen({ route }) {
  const { rule } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {rule.details.map((detail, index) => (
          <View key={index} style={[styles.card, { borderTopColor: detail.color }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.percentage}>{detail.percentage}%</Text>
              <Text style={styles.categoryTitle}>{detail.category}</Text>
            </View>
            <Text style={styles.description}>{detail.description}</Text>
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Exemplos:</Text>
              {detail.examples.map((example, exIndex) => (
                <Text key={exIndex} style={styles.exampleText}>• {example}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16, elevation: 3, borderTopWidth: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  percentage: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginRight: 12 },
  categoryTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 16 },
  exampleContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  exampleTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  exampleText: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
});