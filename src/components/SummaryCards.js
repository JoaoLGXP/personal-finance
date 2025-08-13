import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SummaryCards({ analysis, formatCurrency }) {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {formatCurrency(analysis.totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
            {formatCurrency(analysis.totalExpenses)}
          </Text>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.fullWidthCard]}>
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={[
            styles.summaryValue,
            { color: analysis.remaining >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {formatCurrency(analysis.remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    minHeight: 90,
    width: '48.5%',
  },
  fullWidthCard: {
    width: '100%',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1,
  },
});
