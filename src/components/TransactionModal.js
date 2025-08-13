import React from 'react';
import { View, Text, Modal, SafeAreaView, ScrollView, TextInput, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionModal({
  visible,
  setVisible,
  isIncome,
  newTransaction,
  setNewTransaction,
  transactionToEdit,
  updateTransaction,
  addTransaction,
  addRecurringTransaction,
  clearEditTransaction,
  getCategoryById,
  setShowCategoryPicker,
}) {
  const selectedCategoryName =
    !isIncome && newTransaction.categoryId
      ? getCategoryById(newTransaction.categoryId)?.name
      : '';

  const handleSaveTransaction = () => {
    if (!isIncome && !newTransaction.categoryId) {
      Alert.alert('Erro', 'Selecione uma categoria.');
      return;
    }
    if (!newTransaction.amount) {
      Alert.alert('Erro', 'Informe o valor.');
      return;
    }
    const amount = parseFloat(newTransaction.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    const transactionData = {
      amount,
      description: newTransaction.description,
      categoryId: newTransaction.categoryId,
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, transactionData);
    } else {
      const fullTransactionData = { type: newTransaction.type, ...transactionData };
      if (newTransaction.isRecurring) {
        if (
          !newTransaction.dayOfMonth ||
          parseInt(newTransaction.dayOfMonth, 10) < 1 ||
          parseInt(newTransaction.dayOfMonth, 10) > 31
        ) {
          Alert.alert('Erro', 'Dia do mês inválido.');
          return;
        }
        addRecurringTransaction({
          ...fullTransactionData,
          frequency: 'monthly',
          dayOfMonth: parseInt(newTransaction.dayOfMonth, 10),
        });
      } else {
        addTransaction(fullTransactionData);
      }
    }

    setVisible(false);
    clearEditTransaction();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isIncome ? 'Adicionar Receita' : 'Adicionar Despesa'}
          </Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {!isIncome && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria *</Text>
              <TouchableOpacity
                style={styles.categoryInput}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text
                  style={[
                    styles.categoryInputText,
                    { color: selectedCategoryName ? '#1F2937' : '#9CA3AF' },
                  ]}
                >
                  {selectedCategoryName || 'Selecionar categoria'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Valor (R$) *</Text>
            <TextInput
              style={styles.amountInput}
              value={newTransaction.amount}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
              placeholder="0,00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={styles.descriptionInput}
              value={newTransaction.description}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
              placeholder={isIncome ? 'Ex: Salário' : 'Ex: Conta de luz'}
              multiline
            />
          </View>

          <View style={styles.recurringContainer}>
            <Text style={styles.inputLabel}>Tornar recorrente</Text>
            <Switch
              trackColor={{ false: '#767577', true: isIncome ? '#86efac' : '#81b0ff' }}
              thumbColor={
                newTransaction.isRecurring
                  ? isIncome
                    ? '#10b981'
                    : '#3B82F6'
                  : '#f4f3f4'
              }
              onValueChange={() =>
                setNewTransaction({ ...newTransaction, isRecurring: !newTransaction.isRecurring })
              }
              value={newTransaction.isRecurring}
            />
          </View>

          {newTransaction.isRecurring && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dia do mês (1-31)</Text>
              <TextInput
                style={styles.amountInput}
                value={newTransaction.dayOfMonth}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, dayOfMonth: text })}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          )}

          <TouchableOpacity style={styles.confirmButton} onPress={handleSaveTransaction}>
            <Text style={styles.confirmButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  categoryInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
  },
  categoryInputText: { fontSize: 16 },
  amountInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#5a0394ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  recurringContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});
