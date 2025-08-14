import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { formatCurrency } from '../utils/format';

export default function ExpenseDistribution({ viewMode, setViewMode, analysis }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>📊 Distribuição de Gastos</Text>
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            onPress={() => setViewMode('chart')}
            style={[styles.selectorButton, viewMode === 'chart' && styles.selectorActive]}
          >
            <Ionicons
              name="pie-chart"
              size={20}
              color={viewMode === 'chart' ? '#38015cff' : '#6B7280'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.selectorButton, viewMode === 'list' && styles.selectorActive]}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' ? '#38015cff' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {analysis.totalExpenses > 0 ? (
        viewMode === 'chart' ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={analysis.pieData}
              donut
              radius={80}
              innerRadius={50}
              centerLabelComponent={() => (
                <Text style={styles.chartCenterLabel}>
                  {formatCurrency(analysis.totalExpenses)}
                </Text>
              )}
            />
            <View style={styles.legendContainer}>
              {analysis.categoryAnalysis.map((item, index) => {
                if (!item || !item.name) return null;
                return (
                  <View key={`${item.name}-${index}`} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color || '#888' }]} />
                    <Text style={styles.legendText}>
                      {item.name} ({item.percentage.toFixed(1)}%)
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View>
            {analysis.categoryAnalysis
              .sort((a, b) => b.amount - a.amount)
              .map((cat, index) => {
                if (!cat || !cat.name) return null;
                return (
                  <View key={`${cat.name}-${index}`} style={styles.listItem}>
                    <View style={styles.listItemInfo}>
                      <View style={[styles.legendColor, { backgroundColor: cat.color || '#888' }]} />
                      <Text style={styles.listItemText}>{cat.name}</Text>
                    </View>
                    <View>
                      <Text style={styles.listItemAmount}>{formatCurrency(cat.amount)}</Text>
                      <Text style={styles.listItemPercentage}>{cat.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )
      ) : (
        <Text style={styles.emptyChartText}>
          Nenhum gasto no mês para exibir a distribuição.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  viewModeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectorButton: { padding: 8 },
  selectorActive: { backgroundColor: '#E0E7FF' },
  chartContainer: { alignItems: 'center', paddingVertical: 20 },
  chartCenterLabel: { fontSize: 16, fontWeight: 'bold' },
  legendContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', margin: 5, padding: 4 },
  legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12 },
  emptyChartText: { textAlign: 'center', color: '#6B7280', padding: 20 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listItemInfo: { flexDirection: 'row', alignItems: 'center' },
  listItemText: { fontSize: 14 },
  listItemAmount: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  listItemPercentage: { fontSize: 12, color: '#6B7280', textAlign: 'right' },
});
