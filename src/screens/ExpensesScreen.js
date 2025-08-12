// src/screens/ExpensesScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';
import GestureContainer from '../components/GestureContainer';

export default function ExpensesScreen({ navigation }) {
  const { filteredTransactions, removeTransaction, getCategoryById, startEditTransaction } = useFinancial();

  const expenses = filteredTransactions.filter(t => t.type === 'expense');

  const handleEdit = (item) => {
    startEditTransaction(item);
    navigation.navigate('Personal Finance');
  };

  const handleDeleteTransaction = (item) => {
    const description = item.description || getCategoryById(item.categoryId)?.name || 'este gasto';
    Alert.alert('Confirmar exclusão', `Deseja excluir "${description}"?`, [{ text: 'Cancelar' }, { text: 'Excluir', onPress: () => removeTransaction(item.id), style: 'destructive' }]);
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

  const renderExpenseItem = ({ item }) => {
    const category = getCategoryById(item.categoryId);
    if (!category) return null;
    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseContent}><View style={styles.expenseHeader}><View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}><Text style={[styles.categoryBadgeText, { color: category.color }]}>{category.name}</Text></View><Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text></View>{item.description ? <Text style={styles.expenseDescription}>{item.description}</Text> : null}<Text style={styles.expenseDate}>{formatDate(item.date)}</Text></View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteTransaction(item)}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <GestureContainer>
      <SafeAreaView style={styles.container}>
        <DateFilter />
        {expenses.length === 0 ? (<View style={styles.emptyState}><Ionicons name="receipt-outline" size={64} color="#9CA3AF" /><Text style={styles.emptyStateTitle}>Nenhum gasto neste mês</Text><Text style={styles.emptyStateText}>Adicione gastos através da tela de Dashboard.</Text></View>) : (<FlatList data={expenses} renderItem={renderExpenseItem} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list} />)}
      </SafeAreaView>
    </GestureContainer>
  );
}

// Seus estilos (sem alterações)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { padding: 16, paddingBottom: 100 },
  expenseItem: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  expenseContent: { flex: 1 },
  expenseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600' },
  expenseAmount: { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
  expenseDescription: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  expenseDate: { fontSize: 12, color: '#9CA3AF' },
  actionsContainer: { flexDirection: 'row', marginLeft: 12 },
  actionButton: { padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});