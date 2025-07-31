// src/screens/RecurringScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';

export default function RecurringScreen() {
    const { recurringTransactions, removeRecurringTransaction, getCategoryById } = useFinancial();

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleDelete = (rt) => {
        Alert.alert(
            "Confirmar Exclusão",
            `Deseja excluir a transação recorrente "${rt.description}"? Isso não afetará as transações já criadas.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', onPress: () => removeRecurringTransaction(rt.id), style: 'destructive' }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isIncome = item.type === 'income';
        const category = isIncome ? null : getCategoryById(item.categoryId);
        return (
            <View style={styles.itemContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons 
                        name={isIncome ? "arrow-up-circle" : "arrow-down-circle"} 
                        size={32} 
                        color={isIncome ? '#10B981' : '#EF4444'} 
                    />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                    <Text style={styles.categoryText}>
                        {isIncome ? 'Receita' : category?.name || 'Sem Categoria'} • Dia {item.dayOfMonth}
                    </Text>
                </View>
                <Text style={[styles.amountText, { color: isIncome ? '#10B981' : '#EF4444' }]}>
                    {formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color="#6B7280" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transações Recorrentes</Text>
            </View>
            <FlatList
                data={recurringTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="repeat-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyStateTitle}>Nenhuma transação recorrente</Text>
                        <Text style={styles.emptyStateText}>Você pode marcar uma despesa ou receita como recorrente ao adicioná-la.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    list: { flexGrow: 1, backgroundColor: '#F3F4F6', padding: 16 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    iconContainer: { marginRight: 12 },
    detailsContainer: { flex: 1 },
    descriptionText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    categoryText: { fontSize: 12, color: '#6B7280' },
    amountText: { fontSize: 16, fontWeight: 'bold' },
    deleteButton: { padding: 8, marginLeft: 8 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
    emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },
});