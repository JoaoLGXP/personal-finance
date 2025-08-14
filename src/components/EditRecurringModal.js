// src/components/EditRecurringModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFinancial } from '../context/FinancialContext';

export default function EditRecurringModal({ visible, onClose, transaction }) {
  const { updateRecurringTransaction } = useFinancial();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(''); // Formato YYYY-MM

  useEffect(() => {
    if (transaction && transaction.amountHistory && transaction.amountHistory.length > 0) {
        // Pega o valor mais recente para preencher o campo ao abrir o modal
        const latestAmountRecord = [...transaction.amountHistory].sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))[0];
        setAmount(latestAmountRecord.amount.toString());
        setDate('');
    }
  }, [transaction]);

  if (!transaction) {
    return null;
  }

  const handleClose = () => {
    setAmount('');
    setDate('');
    onClose();
  };

  const handleSave = () => {
    const newAmount = parseFloat(amount.replace(',', '.'));
    const [year, month] = date.split('-').map(Number);
    
    if (isNaN(newAmount) || newAmount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(date) || month < 1 || month > 12) {
        Alert.alert('Erro', 'Use o formato AAAA-MM para a data (ex: 2025-12).');
        return;
    }
    
    const effectiveDate = new Date(year, month - 1, 1).toISOString();
    updateRecurringTransaction(transaction.id, newAmount, effectiveDate);
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Agendar Reajuste</Text>
          <Text style={styles.modalSubtitle}>Para: {transaction.description}</Text>
          
          {/* ===== INÍCIO DA MUDANÇA VISUAL ===== */}
          <Text style={styles.inputLabel}>Novo Valor</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                keyboardType="numeric"
            />
          </View>
          {/* ===== FIM DA MUDANÇA VISUAL ===== */}
          
          <Text style={styles.inputLabel}>A partir do Mês (AAAA-MM)</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="Ex: 2025-12"
            maxLength={7}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Agendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    
    // ===== NOVOS ESTILOS PARA O CAMPO DE VALOR =====
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        marginBottom: 16,
    },
    currencySymbol: {
        fontSize: 16,
        color: '#6B7280',
        paddingLeft: 12,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16
    },
    // ===========================================

    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
    cancelButtonText: { color: '#6B7280', fontWeight: '600' },
    saveButton: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#3B82F6', borderRadius: 8, marginLeft: 16 },
    saveButtonText: { color: '#fff', fontWeight: '600' },
});