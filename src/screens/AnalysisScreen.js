// src/screens/AnalysisScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';

const ProgressBar = ({ percentage, color }) => {
  const width = Math.min(Math.max(percentage, 0), 100);
  return (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
};

export default function AnalysisScreen() {
  const { getRulesAnalysis } = useFinancial();
  const data = getRulesAnalysis();

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <DateFilter />
        <View style={styles.emptyState}>
          <Ionicons name="cash-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Sem Dados para Análise</Text>
          <Text style={styles.emptyStateText}>Adicione sua renda mensal no Dashboard para ver a análise de gastos.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { totalIncome, analysis } = data;
  const necessitiesPercentage = totalIncome > 0 ? (analysis.necessities.spent / totalIncome) * 100 : 0;
  const wantsPercentage = totalIncome > 0 ? (analysis.wants.spent / totalIncome) * 100 : 0;
  const goalsValue = totalIncome - analysis.necessities.spent - analysis.wants.spent;
  const goalsPercentage = totalIncome > 0 ? (goalsValue / totalIncome) * 100 : 0;
  
  const ruleCategories = [
      { key: 'necessities', color: '#3B82F6', percentage: necessitiesPercentage, data: analysis.necessities },
      { key: 'wants', color: '#F59E0B', percentage: wantsPercentage, data: analysis.wants },
      { key: 'goals', color: '#10B981', percentage: goalsPercentage, data: analysis.goals, value: goalsValue }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <DateFilter />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Análise pela Regra 50-30-20</Text>
          
          <View style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>Necessidades Essenciais</Text>
              <Text style={styles.percentageText}>{necessitiesPercentage.toFixed(1)}%</Text>
            </View>
            <Text style={styles.recommendationText}>Recomendado: {analysis.necessities.recommended}%</Text>
            <ProgressBar percentage={necessitiesPercentage} color="#3B82F6" />
            <Text style={styles.amountText}>{formatCurrency(analysis.necessities.spent)} / {formatCurrency(totalIncome * (analysis.necessities.recommended / 100))}</Text>
          </View>
          
          <View style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>Desejos Pessoais</Text>
              <Text style={styles.percentageText}>{wantsPercentage.toFixed(1)}%</Text>
            </View>
            <Text style={styles.recommendationText}>Recomendado: {analysis.wants.recommended}%</Text>
            <ProgressBar percentage={wantsPercentage} color="#F59E0B" />
            <Text style={styles.amountText}>{formatCurrency(analysis.wants.spent)} / {formatCurrency(totalIncome * (analysis.wants.recommended / 100))}</Text>
          </View>
          
          <View style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>Metas Financeiras</Text>
              <Text style={styles.percentageText}>{goalsPercentage.toFixed(1)}%</Text>
            </View>
            <Text style={styles.recommendationText}>Recomendado: {analysis.goals.recommended}%</Text>
            <ProgressBar percentage={goalsPercentage} color="#10B981" />
            <Text style={styles.amountText}>{formatCurrency(goalsValue)} / {formatCurrency(totalIncome * (analysis.goals.recommended / 100))}</Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, color: '#1F2937' },
  categoryItem: { marginBottom: 24 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#374151' },
  percentageText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  recommendationText: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  progressBar: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  amountText: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'right' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});