import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { formatCurrency } from '../utils/format';

export default function MonthlyEvolutionChart({ analysis }) {
  const [tooltip, setTooltip] = useState(null);

  const dataWithClick = analysis.barData.map((item, index, arr) => ({
    ...item,
    onPress: () => {
      // Garante que despesas herdarem o mês da barra anterior
      const label = item.label || arr[index - 1]?.label || '';
      if (tooltip?.index === index) {
        setTooltip(null);
      } else {
        setTooltip({
          index,
          label,
          value: item.value,
          color: item.frontColor,
          type: item.frontColor === '#10B981' ? 'Receita' : 'Despesa',
        });
      }
    },
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📈 Evolução Mensal</Text>

      <View>
        <BarChart
          data={dataWithClick}
          barWidth={20}
          yAxisTextStyle={{ color: 'gray' }}
          xAxisLabelTextStyle={{
            color: 'gray',
            fontSize: 12,
            textAlign: 'center',
          }}
          noOfSections={4}
          yAxisThickness={0}
          xAxisThickness={0}
          maxValue={analysis.yAxisMaxValue * 1.25}
          disableScroll
          initialSpacing={20}
        />

        {tooltip && (
          <View style={styles.tooltipContainer}>
            <Text style={[styles.tooltipText, { color: tooltip.color }]}>
              {tooltip.type} de {tooltip.label}: {formatCurrency(tooltip.value)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.barChartLegend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: '#10B981' }]}
          />
          <Text style={styles.legendText}>Receitas</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: '#EF4444' }]}
          />
          <Text style={styles.legendText}>Despesas</Text>
        </View>
      </View>
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
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  tooltipContainer: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    elevation: 4,
  },
  tooltipText: { fontWeight: 'bold' },
  barChartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', margin: 5, padding: 4 },
  legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12 },
});
