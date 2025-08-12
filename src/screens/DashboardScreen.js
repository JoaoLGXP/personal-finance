// src/screens/DashboardScreen.js
import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Modal,
    TextInput,
    Switch,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from "react-native-gifted-charts";
import { useFinancial } from '../context/FinancialContext';
import DateFilter from '../components/DateFilter';
import GestureContainer from '../components/GestureContainer';

export default function DashboardScreen() {
    const {
        isLoading,
        filteredTransactions,
        categories,
        clearAll,
        addTransaction,
        addRecurringTransaction,
        recurringTransactions,
        getCategoryById,
        transactionToEdit,
        updateTransaction,
        clearEditTransaction,
        dateFilter,
    } = useFinancial();

    const [viewMode, setViewMode] = useState('chart');
    const [modalVisible, setModalVisible] = useState(false);
    const [isIncome, setIsIncome] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [newTransaction, setNewTransaction] = useState({});

    // ===== NOVO: LÓGICA PARA CALCULAR CONTAS A VENCER =====
    const upcomingBills = useMemo(() => {
        if (isLoading) return [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Se o mês do filtro já passou, não mostra contas a vencer.
        if (dateFilter.year < currentYear || (dateFilter.year === currentYear && dateFilter.month < currentMonth)) {
            return [];
        }

        const recurringExpenses = recurringTransactions.filter(rt => rt.type === 'expense');

        return recurringExpenses.filter(rt => {
            const alreadyGenerated = filteredTransactions.some(t =>
                t.isRecurringInstance && t.description === rt.description
            );
            // Mostra apenas se a conta ainda não foi gerada para o mês
            return !alreadyGenerated;
        }).sort((a, b) => a.dayOfMonth - b.dayOfMonth);

    }, [recurringTransactions, filteredTransactions, dateFilter, isLoading]);
    // =======================================================

    useEffect(() => {
        if (transactionToEdit) {
            setIsIncome(transactionToEdit.type === 'income');
            setNewTransaction({
                ...transactionToEdit,
                amount: transactionToEdit.amount.toString(), // Converte para string para o input
            });
            setModalVisible(true);
        }
    }, [transactionToEdit]);

    const analysis = useMemo(() => {
        if (isLoading || !Array.isArray(categories)) {
            return { totalIncome: 0, totalExpenses: 0, remaining: 0, pieData: [], categoryAnalysis: [] };
        }
        const incomes = filteredTransactions.filter(t => t.type === 'income');
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

        const categoryAnalysis = categories.filter(cat => cat && cat.name !== 'Salário').map(cat => {
            const categoryExpenses = expenses.filter(exp => exp.categoryId === cat.id).reduce((sum, exp) => sum + exp.amount, 0);
            const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;
            return { name: cat.name, color: cat.color, amount: categoryExpenses, percentage: percentage };
        }).filter(item => item.amount > 0);

        const pieData = categoryAnalysis.map(cat => ({ value: cat.amount, color: cat.color, text: `${cat.percentage.toFixed(0)}%` }));

        return { totalIncome, totalExpenses, remaining: totalIncome - totalExpenses, pieData, categoryAnalysis };
    }, [filteredTransactions, categories, isLoading]);

    const handleOpenModal = (type) => {
        setIsIncome(type === 'income');
        setNewTransaction({ type, categoryId: null, amount: '', description: '', isRecurring: false, dayOfMonth: new Date().getDate().toString() });
        setModalVisible(true);
    };

    const handleSaveTransaction = () => {
        if (!isIncome && !newTransaction.categoryId) { Alert.alert('Erro', 'Selecione uma categoria.'); return; }
        if (!newTransaction.amount) { Alert.alert('Erro', 'Informe o valor.'); return; }
        const amount = parseFloat(newTransaction.amount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) { Alert.alert('Erro', 'Valor inválido'); return; }

        const transactionData = { amount, description: newTransaction.description, categoryId: newTransaction.categoryId };

        if (transactionToEdit) { // Se estamos editando...
            updateTransaction(transactionToEdit.id, transactionData);
        } else { // Se estamos criando...
            const fullTransactionData = { type: newTransaction.type, ...transactionData };
            if (newTransaction.isRecurring) {
                if (!newTransaction.dayOfMonth || parseInt(newTransaction.dayOfMonth, 10) < 1 || parseInt(newTransaction.dayOfMonth, 10) > 31) { Alert.alert('Erro', 'Dia do mês inválido.'); return; }
                addRecurringTransaction({ ...fullTransactionData, frequency: 'monthly', dayOfMonth: parseInt(newTransaction.dayOfMonth, 10) });
            } else {
                addTransaction(fullTransactionData);
            }
        }

        setModalVisible(false);
        clearEditTransaction(); // Limpa o estado de edição
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        clearEditTransaction(); // Limpa o estado de edição ao fechar
    };

    const handleClearAll = () => Alert.alert('Confirmar', 'Deseja limpar todos os dados?', [{ text: 'Cancelar' }, { text: 'Confirmar', onPress: clearAll, style: 'destructive' }]);
    const formatCurrency = (value) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
    };
    const selectedCategoryName = !isIncome && newTransaction.categoryId ? getCategoryById(newTransaction.categoryId)?.name : '';

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
            <GestureContainer>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.summaryContainer}>
                        {/* Primeira Linha */}
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Receitas</Text><Text style={[styles.summaryValue, { color: '#10B981' }]}>{formatCurrency(analysis.totalIncome)}</Text></View>
                            <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Despesas</Text><Text style={[styles.summaryValue, { color: '#EF4444' }]}>{formatCurrency(analysis.totalExpenses)}</Text></View>
                        </View>
                        {/* Segunda Linha */}
                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryCard, styles.fullWidthCard]}><Text style={styles.summaryLabel}>Saldo</Text><Text style={[styles.summaryValue, { color: analysis.remaining >= 0 ? '#10B981' : '#EF4444' }]}>{formatCurrency(analysis.remaining)}</Text></View>
                        </View>
                    </View>

                    {upcomingBills.length > 0 ? (
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle-outline" size={24} color="#38015cff" />
                            <Text style={styles.infoCardText}>
                                Você possui contas recorrentes a vencer. Elas serão adicionadas aos gastos na virada do mês.
                            </Text>
                        </View>
                    ) : null}

                    <View style={styles.card}>
                        <View style={styles.cardHeader}><Text style={styles.cardTitle}>📊 Distribuição de Gastos</Text><View style={styles.viewModeSelector}><TouchableOpacity onPress={() => setViewMode('chart')} style={[styles.selectorButton, viewMode === 'chart' ? styles.selectorActive : null]}><Ionicons name="pie-chart" size={20} color={viewMode === 'chart' ? '#38015cff' : '#6B7280'} /></TouchableOpacity><TouchableOpacity onPress={() => setViewMode('list')} style={[styles.selectorButton, viewMode === 'list' ? styles.selectorActive : null]}><Ionicons name="list" size={20} color={viewMode === 'list' ? '#38015cff' : '#6B7280'} /></TouchableOpacity></View></View>
                        {analysis.totalExpenses > 0 ? (
                            viewMode === 'chart' ? (
                                <View style={styles.chartContainer}>
                                    <PieChart
                                        data={analysis.pieData}
                                        donut
                                        radius={80}
                                        innerRadius={50}
                                        centerLabelComponent={() => <Text style={styles.chartCenterLabel}>{formatCurrency(analysis.totalExpenses)}</Text>}
                                    />
                                    <View style={styles.legendContainer}>
                                        {/* CORREÇÃO: Adicionada verificação para garantir que 'item' é válido */}
                                        {analysis.categoryAnalysis.map((item, index) => {
                                            if (!item || !item.name) return null; // Ignora itens inválidos
                                            return (
                                                <View key={`${item.name}-${index}`} style={styles.legendItem}>
                                                    <View style={[styles.legendColor, { backgroundColor: item.color || '#888' }]} />
                                                    <Text style={styles.legendText}>
                                                        {item.name} ({item.percentage.toFixed(1)}%)
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    {/* CORREÇÃO: Adicionada verificação para garantir que 'cat' é válido */}
                                    {analysis.categoryAnalysis.sort((a, b) => b.amount - a.amount).map((cat, index) => {
                                        if (!cat || !cat.name) return null; // Ignora itens inválidos
                                        return (
                                            <View key={`${cat.name}-${index}`} style={styles.listItem}>
                                                <View style={styles.listItemInfo}>
                                                    <View style={[styles.legendColor, { backgroundColor: cat.color || '#888' }]} />
                                                    <Text style={styles.listItemText}>{cat.name}</Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.listItemAmount}>{formatCurrency(cat.amount)}</Text>
                                                    <Text style={styles.listItemPercentage}>{cat.percentage.toFixed(1)}%</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )
                        ) : (
                            <Text style={styles.emptyChartText}>Nenhum gasto no mês para exibir a distribuição.</Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}><Ionicons name="trash-outline" size={16} color="#EF4444" /><Text style={styles.clearButtonText}>Limpar Todos os Dados</Text></TouchableOpacity>
                </ScrollView>
            </GestureContainer>
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

            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}><View style={styles.modalContainer}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{isIncome ? 'Adicionar Receita' : 'Adicionar Despesa'}</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity></View><ScrollView style={styles.modalContent}>{!isIncome ? (<View style={styles.inputGroup}><Text style={styles.inputLabel}>Categoria *</Text><TouchableOpacity style={styles.categoryInput} onPress={() => setShowCategoryPicker(true)}><Text style={[styles.categoryInputText, { color: selectedCategoryName ? '#1F2937' : '#9CA3AF' }]}>{selectedCategoryName || 'Selecionar categoria'}</Text><Ionicons name="chevron-down" size={20} color="#6B7280" /></TouchableOpacity></View>) : null}<View style={styles.inputGroup}><Text style={styles.inputLabel}>Valor (R$) *</Text><TextInput style={styles.amountInput} value={newTransaction.amount} onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })} placeholder="0,00" keyboardType="numeric" /></View><View style={styles.inputGroup}><Text style={styles.inputLabel}>Descrição</Text><TextInput style={styles.descriptionInput} value={newTransaction.description} onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })} placeholder={isIncome ? "Ex: Salário" : "Ex: Conta de luz"} multiline /></View><View style={styles.recurringContainer}><Text style={styles.inputLabel}>Tornar recorrente</Text><Switch trackColor={{ false: "#767577", true: isIncome ? "#86efac" : "#81b0ff" }} thumbColor={newTransaction.isRecurring ? (isIncome ? "#10b981" : "#3B82F6") : "#f4f3f4"} onValueChange={() => setNewTransaction({ ...newTransaction, isRecurring: !newTransaction.isRecurring })} value={newTransaction.isRecurring} /></View>{newTransaction.isRecurring ? (<View style={styles.inputGroup}><Text style={styles.inputLabel}>Dia do mês (1-31)</Text><TextInput style={styles.amountInput} value={newTransaction.dayOfMonth} onChangeText={(text) => setNewTransaction({ ...newTransaction, dayOfMonth: text })} keyboardType="number-pad" maxLength={2} /></View>) : null}<TouchableOpacity style={styles.confirmButton} onPress={handleSaveTransaction}><Text style={styles.confirmButtonText}>Adicionar</Text></TouchableOpacity></ScrollView></View></SafeAreaView>
            </Modal>

            <Modal visible={showCategoryPicker} transparent animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.categoryModal}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Selecionar Categoria</Text><TouchableOpacity onPress={() => setShowCategoryPicker(false)}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity></View>

                        {/* AQUI ESTÁ A VERIFICAÇÃO DE SEGURANÇA */}
                        {Array.isArray(categories) ? (
                            <FlatList
                                data={categories.filter(c => c && typeof c === 'object' && c.name !== 'Salário')}
                                keyExtractor={(item, index) => item && item.id ? item.id.toString() : index.toString()}
                                renderItem={({ item }) => {
                                    if (!item || typeof item !== 'object' || !item.name || !item.color) {
                                        return null;
                                    }
                                    return (
                                        <TouchableOpacity
                                            style={styles.categoryOption}
                                            onPress={() => {
                                                setNewTransaction({ ...newTransaction, categoryId: item.id });
                                                setShowCategoryPicker(false);
                                            }}
                                        >
                                            <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                                            <Text style={styles.categoryOptionText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        ) : null}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6B7280'
    },
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6'
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollContent: {
        paddingBottom: 120
    },
    summaryContainer: {
        paddingHorizontal: 12,
        marginTop: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8, // Espaço entre as linhas
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        minHeight: 90, // Garante a mesma altura para todos os cards
        width: '48.5%', // Ocupa quase metade da tela, com espaço entre
    },
    fullWidthCard: {
        width: '100%', // O card de Saldo ocupa a largura total
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 12, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    viewModeSelector: { flexDirection: 'row', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' },
    selectorButton: { padding: 8 },
    selectorActive: { backgroundColor: '#E0E7FF' },
    chartContainer: { alignItems: 'center', paddingVertical: 20 },
    chartCenterLabel: { fontSize: 16, fontWeight: 'bold' },
    legendContainer: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', margin: 5, padding: 4 },
    legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendText: { fontSize: 12 },
    emptyChartText: { textAlign: 'center', color: '#6B7280', padding: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    listItemInfo: { flexDirection: 'row', alignItems: 'center' },
    listItemText: { fontSize: 14 },
    listItemAmount: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
    listItemPercentage: { fontSize: 12, color: '#6B7280', textAlign: 'right' },
    clearButton: { marginVertical: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    clearButtonText: { color: '#EF4444', marginLeft: 8 },
    footerContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: 20, // Mais espaço na parte inferior
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    incomeButton: {
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    expenseButton: {
        backgroundColor: '#EF4444',
        marginLeft: 6,
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // ===== NOVOS ESTILOS PARA O CARD DE CONTAS A VENCER =====
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8d0f8ff', // Azul claro
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
    },
    infoCardText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '500',
        color: '#38015cff', // Azul escuro
        lineHeight: 20,
    },
    // ======================================================

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
    confirmButton: { backgroundColor: '#5a0394ff', padding: 16, borderRadius: 8, alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    categoryModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
    categoryOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    categoryColor: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
    categoryOptionText: { fontSize: 16 },
    recurringContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#D1D5DB' },
});