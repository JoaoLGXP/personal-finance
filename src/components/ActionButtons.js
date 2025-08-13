// src/components/ActionButtons.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActionButtons({ onIncomePress, onExpensePress }) {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={onIncomePress} style={[styles.footerButton, styles.incomeButton]}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.footerButtonText}>Receita</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onExpensePress} style={[styles.footerButton, styles.expenseButton]}>
        <Ionicons name="remove" size={24} color="#fff" />
        <Text style={styles.footerButtonText}>Despesa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: { flexDirection: 'row', padding: 12, paddingBottom: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
  incomeButton: { backgroundColor: '#10B981', marginRight: 6 },
  expenseButton: { backgroundColor: '#EF4444', marginLeft: 6 },
  footerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});