// src/screens/DashboardScreen.js
// O código é o mesmo da última versão, apenas REMOVEMOS os botões flutuantes (FABs)
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from "react-native-gifted-charts";
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';

export default function DashboardScreen() {
    const { filteredTransactions, categories, clearAll } = useFinancial();
    const [viewMode, setViewMode] = useState('chart');

    const analysis = useMemo(() => {
        const incomes = filteredTransactions.filter(t => t.type === 'income');
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

        const categoryAnalysis = categories
            .filter(cat => cat.name !== 'Salário')
            .map(cat => {
                const categoryExpenses = expenses.filter(exp => exp.categoryId === cat.id).reduce((sum, exp) => sum + exp.amount, 0);
                const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;
                return { name: cat.name, color: cat.color, amount: categoryExpenses, percentage: percentage };
            }).filter(item => item.amount > 0);
        
        const pieData = categoryAnalysis.map(cat => ({ value: cat.amount, color: cat.color, text: `${cat.percentage.toFixed(0)}%` }));

        return { totalIncome, totalExpenses, remaining: totalIncome - totalExpenses, pieData, categoryAnalysis };
    }, [filteredTransactions, categories]);

    const handleClearAll = () => Alert.alert('Confirmar', 'Deseja limpar todos os dados?', [{ text: 'Cancelar' }, { text: 'Confirmar', onPress: clearAll, style: 'destructive' }]);
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        // Usamos um View normal aqui, pois o Drawer Navigator já cuida da SafeArea.
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <DateFilter />
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Receitas</Text><Text style={[styles.summaryValue, {color: '#10B981'}]}>{formatCurrency(analysis.totalIncome)}</Text></View>
                <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Despesas</Text><Text style={[styles.summaryValue, {color: '#EF4444'}]}>{formatCurrency(analysis.totalExpenses)}</Text></View>
                <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Saldo</Text><Text style={[styles.summaryValue, {color: analysis.remaining >= 0 ? '#10B981' : '#EF4444'}]}>{formatCurrency(analysis.remaining)}</Text></View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>📊 Distribuição de Gastos</Text>
                    <View style={styles.viewModeSelector}>
                        <TouchableOpacity onPress={() => setViewMode('chart')} style={[styles.selectorButton, viewMode === 'chart' ? styles.selectorActive : null]}><Ionicons name="pie-chart" size={20} color={viewMode === 'chart' ? '#3B82F6' : '#6B7280'} /></TouchableOpacity>
                        <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.selectorButton, viewMode === 'list' ? styles.selectorActive : null]}><Ionicons name="list" size={20} color={viewMode === 'list' ? '#3B82F6' : '#6B7280'} /></TouchableOpacity>
                    </View>
                </View>
                
                {analysis.totalExpenses > 0 
                    ? ( viewMode === 'chart' 
                        ? ( <View style={styles.chartContainer}> <PieChart data={analysis.pieData} donut radius={80} innerRadius={50} centerLabelComponent={() => <Text style={styles.chartCenterLabel}>{formatCurrency(analysis.totalExpenses)}</Text>} /> <View style={styles.legendContainer}> {analysis.categoryAnalysis.map(item => ( <View key={item.name} style={styles.legendItem}><View style={[styles.legendColor, {backgroundColor: item.color}]} /><Text style={styles.legendText}>{item.name} ({item.percentage.toFixed(1)}%)</Text></View> ))} </View> </View> ) 
                        : ( <View> {analysis.categoryAnalysis.sort((a,b) => b.amount - a.amount).map(cat => ( <View key={cat.name} style={styles.listItem}><View style={styles.listItemInfo}><View style={[styles.legendColor, {backgroundColor: cat.color}]} /><Text style={styles.listItemText}>{cat.name}</Text></View><View><Text style={styles.listItemAmount}>{formatCurrency(cat.amount)}</Text><Text style={styles.listItemPercentage}>{cat.percentage.toFixed(1)}%</Text></View></View> ))} </View> )
                    ) 
                    : ( <Text style={styles.emptyChartText}>Nenhum gasto no mês para exibir a distribuição.</Text> )
                }
            </View>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}><Ionicons name="trash-outline" size={16} color="#EF4444" /><Text style={styles.clearButtonText}>Limpar Todos os Dados</Text></TouchableOpacity>
        </ScrollView>
    );
}
// Estilos... (os estilos podem ser mantidos)
const styles = StyleSheet.create({
    container: { backgroundColor: '#F3F4F6', flex: 1 },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginTop: 16 },
    summaryCard: { flex: 1, backgroundColor: '#fff', marginHorizontal: 4, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
    summaryLabel: { fontSize: 12, color: '#6B7280' },
    summaryValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 12, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    viewModeSelector: { flexDirection: 'row', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
    selectorButton: { padding: 8 },
    selectorActive: { backgroundColor: '#E0E7FF' },
    chartContainer: { alignItems: 'center', paddingVertical: 20 },
    chartCenterLabel: { fontSize: 16, fontWeight: 'bold' },
    legendContainer: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', margin: 5, padding: 4 },
    legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendText: { fontSize: 12 },
    emptyChartText: { textAlign: 'center', color: '#6B7280', padding: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    listItemInfo: { flexDirection: 'row', alignItems: 'center' },
    listItemText: { fontSize: 14 },
    listItemAmount: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
    listItemPercentage: { fontSize: 12, color: '#6B7280', textAlign: 'right' },
    clearButton: { marginVertical: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    clearButtonText: { color: '#EF4444', marginLeft: 8 },
});