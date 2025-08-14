// src/screens/IncomesScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';
import GestureContainer from '../components/GestureContainer';

export default function IncomesScreen({ navigation }) {
  const { filteredTransactions, removeTransaction, startEditTransaction } = useFinancial();
  
  // Filtra apenas as transações do tipo 'income'
  const incomes = filteredTransactions.filter(t => t.type === 'income');

  const handleEdit = (item) => {
    startEditTransaction(item);
    navigation.navigate('SaldoUp');
  };

  const handleDeleteTransaction = (item) => {
    const description = item.description || 'esta receita';
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => removeTransaction(item.id), style: 'destructive' }
      ]
    );
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

  const renderIncomeItem = ({ item }) => {
    return (
      <View style={styles.incomeItem}>
        <View style={styles.incomeContent}>
          <View style={styles.incomeHeader}>
            {/* O badge agora sempre mostra "Receita" */}
            <View style={[styles.categoryBadge, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.categoryBadgeText, { color: '#065F46' }]}>Receita</Text>
            </View>
            <Text style={styles.incomeAmount}>{formatCurrency(item.amount)}</Text>
          </View>
          
          {/* A descrição da receita (ex: "Salário") agora fica aqui */}
          {item.description ? (
            <Text style={styles.incomeDescription}>{item.description}</Text>
          ) : null}

          <Text style={styles.incomeDate}>{formatDate(item.date)}</Text>
        </View>
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
        {incomes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Nenhuma receita neste mês</Text>
            <Text style={styles.emptyStateText}>Adicione receitas através da tela de Dashboard.</Text>
          </View>
        ) : (
          <FlatList
            data={incomes}
            renderItem={renderIncomeItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </GestureContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { padding: 16, paddingBottom: 100 },
  incomeItem: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  incomeContent: { flex: 1 },
  incomeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600' },
  incomeAmount: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
  incomeDescription: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  incomeDate: { fontSize: 12, color: '#9CA3AF' },
  actionsContainer: { flexDirection: 'row', marginLeft: 12 },
  actionButton: { padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});