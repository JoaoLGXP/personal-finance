import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';
import GestureContainer from '../components/GestureContainer';
import { formatCurrency } from '../utils/format';
import useUpcomingBills from '../hooks/useUpcomingBills';
import useFinancialAnalysis from '../hooks/useFinancialAnalysis';
import SummaryCards from '../components/SummaryCards';
import UpcomingBillsCard from '../components/UpcomingBillsCard';
import IntelligenceCards from '../components/IntelligenceCards';
import MonthlyEvolutionChart from '../components/MonthlyEvolutionChart';
import ExpenseDistribution from '../components/ExpenseDistribution';
import TransactionModal from '../components/TransactionModal';
import CategoryPickerModal from '../components/CategoryPickerModal';
import styles from './DashboardScreen.styles';

export default function DashboardScreen() {
  const {
    isLoading, filteredTransactions, categories, clearAll, addTransaction,
    addRecurringTransaction, recurringTransactions, getCategoryById,
    transactionToEdit, updateTransaction, clearEditTransaction, dateFilter, getPastMonthsTransactions
  } = useFinancial();

  const [viewMode, setViewMode] = useState('chart');
  const [modalVisible, setModalVisible] = useState(false);
  const [isIncome, setIsIncome] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newTransaction, setNewTransaction] = useState({});

  const upcomingBills = useUpcomingBills({ recurringTransactions, filteredTransactions, dateFilter, isLoading });
  const analysis = useFinancialAnalysis({ filteredTransactions, categories, isLoading, dateFilter, recurringTransactions, getPastMonthsTransactions, formatCurrency });

  useEffect(() => {
    if (transactionToEdit) {
      setIsIncome(transactionToEdit.type === 'income');
      setNewTransaction({
        ...transactionToEdit,
        amount: transactionToEdit.amount.toString(),
      });
      setModalVisible(true);
    }
  }, [transactionToEdit]);

  const handleOpenModal = (type) => {
    setIsIncome(type === 'income');
    setNewTransaction({ type, categoryId: null, amount: '', description: '', isRecurring: false, dayOfMonth: new Date().getDate().toString() });
    setModalVisible(true);
  };

  const handleClearAll = () => Alert.alert('Confirmar', 'Deseja limpar todos os dados?', [
    { text: 'Cancelar' },
    { text: 'Confirmar', onPress: clearAll, style: 'destructive' }
  ]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DateFilter />
      <View style={{ flex: 1 }}>
        <GestureContainer>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <SummaryCards analysis={analysis} formatCurrency={formatCurrency} />
            {upcomingBills.length > 0 && <UpcomingBillsCard />}
            <IntelligenceCards analysis={analysis} formatCurrency={formatCurrency} />
            <MonthlyEvolutionChart analysis={analysis} formatCurrency={formatCurrency} />
            <ExpenseDistribution viewMode={viewMode} setViewMode={setViewMode} analysis={analysis} formatCurrency={formatCurrency} />
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.clearButtonText}>Limpar Todos os Dados</Text>
            </TouchableOpacity>
          </ScrollView>
        </GestureContainer>
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => handleOpenModal('income')} style={[styles.footerButton, styles.incomeButton]}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.footerButtonText}>Receita</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOpenModal('expense')} style={[styles.footerButton, styles.expenseButton]}>
          <Ionicons name="remove" size={24} color="#fff" />
          <Text style={styles.footerButtonText}>Despesa</Text>
        </TouchableOpacity>
      </View>

      <TransactionModal
        visible={modalVisible}
        setVisible={setModalVisible}
        isIncome={isIncome}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        transactionToEdit={transactionToEdit}
        updateTransaction={updateTransaction}
        addTransaction={addTransaction}
        addRecurringTransaction={addRecurringTransaction}
        clearEditTransaction={clearEditTransaction}
        getCategoryById={getCategoryById}
        setShowCategoryPicker={setShowCategoryPicker}
        formatCurrency={formatCurrency}
      />

      <CategoryPickerModal
        visible={showCategoryPicker}
        setVisible={setShowCategoryPicker}
        categories={categories}
        setNewTransaction={setNewTransaction}
        newTransaction={newTransaction}
      />
    </SafeAreaView>
  );
}
