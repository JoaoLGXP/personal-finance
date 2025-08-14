// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';
import GestureContainer from '../components/GestureContainer';
import useFinancialAnalysis from '../hooks/useFinancialAnalysis';
import SummaryCards from '../components/SummaryCards';
import IntelligenceCards from '../components/IntelligenceCards';
import MonthlyEvolutionChart from '../components/MonthlyEvolutionChart';
import ExpenseDistribution from '../components/ExpenseDistribution';
import TransactionModal from '../components/TransactionModal';
import CategoryPickerModal from '../components/CategoryPickerModal';
import ActionButtons from '../components/ActionButtons';
import styles from './DashboardScreen.styles';
import UpcomingBillsCard from '../components/UpcomingBillsCard';
import RulesHighlightCard from '../components/RulesHighlightCard';

export default function DashboardScreen() {
  const {
    isLoading, categories, clearAll, addTransaction, addRecurringTransaction,
    getCategoryById, transactionToEdit, updateTransaction, clearEditTransaction,
    filteredTransactions, recurringTransactions, dateFilter, getPastMonthsTransactions
  } = useFinancial();

  const [viewMode, setViewMode] = useState('chart');
  const [modalVisible, setModalVisible] = useState(false);
  const [isIncome, setIsIncome] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newTransaction, setNewTransaction] = useState({});

  const analysis = useFinancialAnalysis({
    filteredTransactions, categories, isLoading, dateFilter, recurringTransactions, getPastMonthsTransactions
  });

  useEffect(() => {
    if (transactionToEdit) {
      setIsIncome(transactionToEdit.type === 'income');
      setNewTransaction({ ...transactionToEdit, amount: transactionToEdit.amount.toString() });
      setModalVisible(true);
    }
  }, [transactionToEdit]);

  const handleOpenModal = (type) => {
    clearEditTransaction();
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
        <ActivityIndicator size="large" color="#5a0394ff" />
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
            <SummaryCards analysis={analysis} />
            {analysis.upcomingBills && analysis.upcomingBills.length > 0 && <UpcomingBillsCard />}
            <IntelligenceCards analysis={analysis} />
            <RulesHighlightCard />
            <MonthlyEvolutionChart analysis={analysis} />
            <ExpenseDistribution viewMode={viewMode} setViewMode={setViewMode} analysis={analysis} />
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.clearButtonText}>Limpar Todos os Dados</Text>
            </TouchableOpacity>
          </ScrollView>
        </GestureContainer>
      </View>
      <ActionButtons
        onIncomePress={() => handleOpenModal('income')}
        onExpensePress={() => handleOpenModal('expense')}
      />
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