// src/screens/ExpensesScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, FlatList, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';

export default function ExpensesScreen() {
  const { filteredTransactions, categories, addTransaction, removeTransaction, getCategoryById, addRecurringTransaction } = useFinancial();
  const [modalVisible, setModalVisible] = useState(false);
  const [isIncome, setIsIncome] = useState(false);
  const [newTransaction, setNewTransaction] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const expenses = filteredTransactions.filter(t => t.type === 'expense');

  const handleOpenModal = (type) => {
      setIsIncome(type === 'income');
      setNewTransaction({
          type: type,
          categoryId: null,
          amount: '',
          description: '',
          isRecurring: false,
          dayOfMonth: new Date().getDate().toString(),
      });
      setModalVisible(true);
  };

  const handleAddTransaction = () => {
    if (!isIncome && !newTransaction.categoryId) { Alert.alert('Erro', 'Selecione uma categoria.'); return; }
    if (!newTransaction.amount) { Alert.alert('Erro', 'Informe o valor.'); return; }
    const amount = parseFloat(newTransaction.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { Alert.alert('Erro', 'Valor inválido'); return; }

    const transactionData = {
        type: newTransaction.type,
        amount,
        description: newTransaction.description,
        categoryId: isIncome ? categories.find(c=>c.name==='Salário')?.id : newTransaction.categoryId,
    };
    
    if (newTransaction.isRecurring) {
        if (!newTransaction.dayOfMonth || parseInt(newTransaction.dayOfMonth, 10) < 1 || parseInt(newTransaction.dayOfMonth, 10) > 31) { Alert.alert('Erro', 'Dia do mês inválido.'); return; }
        addRecurringTransaction({ ...transactionData, frequency: 'monthly', dayOfMonth: parseInt(newTransaction.dayOfMonth, 10) });
    } else {
        addTransaction({ ...transactionData, date: new Date().toISOString() });
    }
    setModalVisible(false);
  };

  const handleDeleteTransaction = (id, description) => Alert.alert('Confirmar exclusão', `Deseja excluir "${description}"?`, [{ text: 'Cancelar' }, { text: 'Excluir', onPress: () => removeTransaction(id), style: 'destructive' }]);
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

  const selectedCategoryName = !isIncome && newTransaction.categoryId ? getCategoryById(newTransaction.categoryId)?.name : '';

  const renderExpenseItem = ({ item }) => {
      const category = getCategoryById(item.categoryId);
      if (!category) return null;
      return (
          <View style={styles.expenseItem}>
              <View style={styles.expenseContent}>
                  <View style={styles.expenseHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}><Text style={[styles.categoryBadgeText, { color: category.color }]}>{category.name}</Text></View>
                      <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
                  </View>
                  {item.description ? <Text style={styles.expenseDescription}>{item.description}</Text> : null}
                  <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTransaction(item.id, item.description || category.name)}><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
          </View>
      );
  };

  return (
    <View style={styles.container}>
      <DateFilter />
      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Nenhum gasto neste mês</Text>
            <Text style={styles.emptyStateText}>Toque no botão + para adicionar um gasto ou receita.</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => handleOpenModal('expense')}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal Genérico */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#F9FAFB'}}><View style={styles.modalContainer}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{isIncome ? 'Adicionar Receita' : 'Adicionar Despesa'}</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity></View><ScrollView style={styles.modalContent}>{!isIncome && (<View style={styles.inputGroup}><Text style={styles.inputLabel}>Categoria *</Text><TouchableOpacity style={styles.categoryInput} onPress={() => setShowCategoryPicker(true)}><Text style={[styles.categoryInputText, { color: selectedCategoryName ? '#1F2937' : '#9CA3AF' }]}>{selectedCategoryName || 'Selecionar categoria'}</Text><Ionicons name="chevron-down" size={20} color="#6B7280" /></TouchableOpacity></View>)}<View style={styles.inputGroup}><Text style={styles.inputLabel}>Valor (R$) *</Text><TextInput style={styles.amountInput} value={newTransaction.amount} onChangeText={(text) => setNewTransaction({...newTransaction, amount: text})} placeholder="0,00" keyboardType="numeric" /></View><View style={styles.inputGroup}><Text style={styles.inputLabel}>Descrição</Text><TextInput style={styles.descriptionInput} value={newTransaction.description} onChangeText={(text) => setNewTransaction({...newTransaction, description: text})} placeholder={isIncome ? "Ex: Salário" : "Ex: Conta de luz"} multiline /></View><View style={styles.recurringContainer}><Text style={styles.inputLabel}>Tornar recorrente</Text><Switch trackColor={{ false: "#767577", true: isIncome ? "#86efac" : "#81b0ff" }} thumbColor={newTransaction.isRecurring ? (isIncome ? "#10b981" : "#3B82F6") : "#f4f3f4"} onValueChange={() => setNewTransaction({...newTransaction, isRecurring: !newTransaction.isRecurring})} value={newTransaction.isRecurring} /></View>{newTransaction.isRecurring && (<View style={styles.inputGroup}><Text style={styles.inputLabel}>Dia do mês (1-31)</Text><TextInput style={styles.amountInput} value={newTransaction.dayOfMonth} onChangeText={(text) => setNewTransaction({...newTransaction, dayOfMonth: text})} keyboardType="number-pad" maxLength={2} /></View>)}<TouchableOpacity style={styles.confirmButton} onPress={handleAddTransaction}><Text style={styles.confirmButtonText}>Adicionar</Text></TouchableOpacity></ScrollView></View></SafeAreaView>
      </Modal>

      {/* Modal de Categoria */}
      <Modal visible={showCategoryPicker} transparent animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
          <View style={styles.modalOverlay}><View style={styles.categoryModal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Selecionar Categoria</Text><TouchableOpacity onPress={() => setShowCategoryPicker(false)}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity></View><FlatList data={categories.filter(c => c.name !== 'Salário')} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => ( <TouchableOpacity style={styles.categoryOption} onPress={() => { setNewTransaction({...newTransaction, categoryId: item.id}); setShowCategoryPicker(false); }}> <View style={[styles.categoryColor, { backgroundColor: item.color }]} /> <Text style={styles.categoryOptionText}>{item.name}</Text> </TouchableOpacity> )} /></View></View>
      </Modal>
    </View>
  );
}

// Estilos...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    list: { padding: 16 },
    fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3B82F6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    expenseItem: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 3 },
    expenseContent: { flex: 1 },
    expenseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    categoryBadgeText: { fontSize: 12, fontWeight: '600' },
    expenseAmount: { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
    expenseDescription: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
    expenseDate: { fontSize: 12, color: '#9CA3AF' },
    deleteButton: { padding: 8, marginLeft: 12 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyStateTitle: { fontSize: 18, fontWeight: 'bold' },
    emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
    modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalContent: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    categoryInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 16 },
    categoryInputText: { fontSize: 16 },
    amountInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 16, fontSize: 16 },
    descriptionInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 16, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
    confirmButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    categoryModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
    categoryOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    categoryColor: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
    categoryOptionText: { fontSize: 16 },
    recurringContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8, marginBottom: 20 },
});