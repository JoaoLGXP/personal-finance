import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IntelligenceCards({ analysis, formatCurrency }) {
  return (
    <View style={styles.intelligenceRow}>
      <View style={[styles.intelligenceCard, { marginRight: 8 }]}>
        <Text style={styles.intelligenceLabel}>Saldo Previsto</Text>
        <Text style={styles.intelligenceValue}>
          {formatCurrency(analysis.forecastedBalance)}
        </Text>
      </View>
      <View style={styles.intelligenceCard}>
        <Text style={styles.intelligenceLabel}>vs. Mês Anterior</Text>
        <Text style={[
          styles.intelligenceValue,
          { color: analysis.comparison.status === 'lower' ? '#10B981' : '#EF4444' }
        ]}>
          {analysis.comparison.status !== 'equal'
            ? `${analysis.comparison.percentage.toFixed(0)}% ${analysis.comparison.status === 'lower' ? 'a menos' : 'a mais'}`
            : 'N/A'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intelligenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  intelligenceCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    alignItems: 'center',
  },
  intelligenceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  intelligenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
