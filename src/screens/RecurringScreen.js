import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';
import EditRecurringModal from '../components/EditRecurringModal';

export default function RecurringScreen({ navigation }) { // Adicionado navigation
    const { recurringTransactions, removeRecurringTransaction, getCategoryById } = useFinancial();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const recurringIncomes = recurringTransactions.filter(rt => rt.type === 'income');
    const recurringExpenses = recurringTransactions.filter(rt => rt.type === 'expense');

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalVisible(true);
    };

    const handleDelete = (rt) => {
        Alert.alert(
            "Confirmar Exclusão",
            `Deseja excluir a transação recorrente "${rt.description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', onPress: () => removeRecurringTransaction(rt.id), style: 'destructive' }
            ]
        );
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const renderItem = (item) => {
        const isIncome = item.type === 'income';
        const now = new Date();
        const sortedHistory = [...item.amountHistory].sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));
        
        let currentAmount = 0;
        let nextChange = null;

        for (const record of sortedHistory) {
            if (new Date(record.effectiveDate) <= now) {
                currentAmount = record.amount;
            } else if (!nextChange) {
                nextChange = record;
            }
        }
        
        const category = isIncome ? null : getCategoryById(item.categoryId);
        return (
            <View key={item.id} style={styles.itemContainer}>
                <View style={styles.mainContent}>
                    <View style={styles.iconContainer}><Ionicons name={isIncome ? "arrow-up-circle" : "arrow-down-circle"} size={32} color={isIncome ? '#10B981' : '#EF4444'} /></View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.descriptionText}>{item.description}</Text>
                        <Text style={styles.categoryText}>{isIncome ? 'Receita' : category?.name || 'Sem Categoria'} • Todo dia {item.dayOfMonth}</Text>
                    </View>
                    <Text style={[styles.amountText, { color: isIncome ? '#10B981' : '#EF4444' }]}>{formatCurrency(currentAmount)}</Text>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}><Ionicons name="pencil" size={20} color="#6B7280" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}><Ionicons name="trash-outline" size={24} color="#6B7280" /></TouchableOpacity>
                    </View>
                </View>

                {/* ===== INÍCIO DA MUDANÇA DE LAYOUT ===== */}
                {nextChange ? (
                    <View style={styles.futureValueContainer}>
                        <Ionicons name="arrow-forward-circle-outline" size={16} color="#38015cff" />
                        <Text style={styles.futureValueText}>
                            Será {formatCurrency(nextChange.amount)} a partir de {new Date(nextChange.effectiveDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                ) : null}
                {/* ===== FIM DA MUDANÇA DE LAYOUT ===== */}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.section}><Text style={styles.sectionTitle}>Receitas Recorrentes</Text>{recurringIncomes.length > 0 ? recurringIncomes.map(item => renderItem(item)) : <Text style={styles.emptyText}>Nenhuma receita recorrente.</Text>}</View>
                <View style={styles.section}><Text style={styles.sectionTitle}>Despesas Recorrentes</Text>{recurringExpenses.length > 0 ? recurringExpenses.map(item => renderItem(item)) : <Text style={styles.emptyText}>Nenhuma despesa recorrente.</Text>}</View>
                {recurringTransactions.length === 0 && ( <View style={styles.emptyState}><Ionicons name="repeat-outline" size={64} color="#9CA3AF" /><Text style={styles.emptyStateTitle}>Nenhuma transação recorrente</Text><Text style={styles.emptyStateText}>Marque uma transação como recorrente ao adicioná-la no Dashboard.</Text></View> )}
            </ScrollView>
            <EditRecurringModal 
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                transaction={selectedTransaction}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
    container: { flex: 1 },
    section: { marginTop: 16, marginHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
    // ===== ESTILOS ATUALIZADOS =====
    itemContainer: { 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12, 
        elevation: 2 
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // =============================
    iconContainer: { marginRight: 12 },
    detailsContainer: { flex: 1 },
    descriptionText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    categoryText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    amountText: { fontSize: 16, fontWeight: 'bold' },
    actionsContainer: { flexDirection: 'row', marginLeft: 8 },
    actionButton: { padding: 8 },
    emptyText: { textAlign: 'center', color: '#6B7280', padding: 20, backgroundColor: '#fff', borderRadius: 12 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
    emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },
    // ===== NOVOS ESTILOS PARA O AVISO DE REAJUSTE =====
    futureValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12, // Espaço entre a linha principal e o aviso
        backgroundColor: '#e8d0f8ff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e3bbfdff',
    },
    futureValueText: {
        fontSize: 13,
        color: '#38015cff', // Azul mais escuro para contraste
        marginLeft: 8,
        fontWeight: '500',
        flexShrink: 1, // Garante que o texto quebre a linha se for muito grande
    },
});