// src/context/FinancialContext.js
import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinancialContext = createContext();

const initialState = {
  isLoading: true,
  transactions: [],
  recurringTransactions: [],
  categories: [],
  dateFilter: {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  },
  transactionToEdit: null,
};

function financialReducer(state, action) {
  switch (action.type) {
    case 'FINISH_LOADING': return { ...state, isLoading: false };
    case 'LOAD_DATA': return { ...state, ...action.payload };
    case 'ADD_TRANSACTION': return { ...state, transactions: [...state.transactions, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_TRANSACTION': return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.data } : t
        ),
      };
    case 'START_EDIT_TRANSACTION':
      return { ...state, transactionToEdit: action.payload };
    case 'CLEAR_EDIT_TRANSACTION':
      return { ...state, transactionToEdit: null };
    case 'ADD_RECURRING_TRANSACTION': return { ...state, recurringTransactions: [...state.recurringTransactions, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_RECURRING_TRANSACTION': return { ...state, recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== action.payload) };
    case 'UPDATE_RECURRING_TRANSACTION':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map(rt =>
          rt.id === action.payload.id ? action.payload.updatedTransaction : rt
        )
      };
    case 'ADD_CATEGORY': return { ...state, categories: [...state.categories, { ...action.payload, id: Date.now() }] };
    case 'UPDATE_CATEGORY': return { ...state, categories: state.categories.map(cat => cat.id === action.payload.id ? { ...cat, ...action.payload.data } : cat) };
    case 'REMOVE_CATEGORY': return { ...state, categories: state.categories.filter(cat => cat.id !== action.payload), transactions: state.transactions.filter(t => t.categoryId !== action.payload) };
    case 'SET_DATE_FILTER': return { ...state, dateFilter: action.payload };
    case 'CLEAR_ALL': return { ...initialState, isLoading: false };
    default: return state;
  }
}

const getAmountForDate = (recurringTransaction, year, month) => {
  const targetDate = new Date(year, month, 1);
  let applicableAmount = 0;
  if (!recurringTransaction.amountHistory) return 0;
  const sortedHistory = [...recurringTransaction.amountHistory].sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));
  for (const record of sortedHistory) {
    if (new Date(record.effectiveDate) <= targetDate) {
      applicableAmount = record.amount;
    } else {
      break;
    }
  }
  return applicableAmount;
};

export function FinancialProvider({ children }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  useEffect(() => {
    const loadAndProcessData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('financialData');
        let dataToLoad = savedData ? JSON.parse(savedData) : {};
        if (!dataToLoad.categories || dataToLoad.categories.length === 0) {
          dataToLoad.categories = [{ id: 1, name: 'Moradia', color: '#3B82F6' }, { id: 2, name: 'Alimentação', color: '#10B981' }, { id: 3, name: 'Transporte', color: '#F59E0B' }, { id: 4, name: 'Salário', color: '#14B8A6' }];
        }
        if (!dataToLoad.transactions) dataToLoad.transactions = [];
        if (!dataToLoad.recurringTransactions) dataToLoad.recurringTransactions = [];

        dataToLoad.recurringTransactions.forEach(rt => {
          if (rt.amount && !rt.amountHistory) {
            rt.amountHistory = [{ amount: rt.amount, effectiveDate: new Date(2020, 0, 1).toISOString() }];
            delete rt.amount;
          }
        });

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        dataToLoad.recurringTransactions.forEach(rt => {
          let lastInstance = rt.lastInstance || { year: currentYear, month: currentMonth - 1 };
          let cursorDate = new Date(lastInstance.year, lastInstance.month + 1, 1);

          while (cursorDate <= now) {
            const year = cursorDate.getFullYear();
            const month = cursorDate.getMonth();
            const alreadyExists = dataToLoad.transactions.some(t => {
              const tDate = new Date(t.date);
              return t.isRecurringInstance && t.description === rt.description && tDate.getFullYear() === year && tDate.getMonth() === month;
            });

            if (!alreadyExists) {
                const amountForMonth = getAmountForDate(rt, year, month);
                if (amountForMonth > 0) {
                    const newTransactionDate = new Date(year, month, rt.dayOfMonth);
                    const newTransaction = {
                        type: rt.type,
                        amount: amountForMonth,
                        description: rt.description,
                        categoryId: rt.categoryId,
                        id: Date.now() + Math.random(),
                        date: newTransactionDate.toISOString(),
                        isRecurringInstance: true,
                        recurringId: rt.id,
                    };
                    dataToLoad.transactions.push(newTransaction);
                    rt.lastInstance = { year, month };
                }
            }
            cursorDate.setMonth(cursorDate.getMonth() + 1);
          }
        });
        dispatch({ type: 'LOAD_DATA', payload: dataToLoad });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally { dispatch({ type: 'FINISH_LOADING' }); }
    };
    loadAndProcessData();
  }, []);

  useEffect(() => { const saveData = async () => { try { const dataToSave = { transactions: state.transactions, recurringTransactions: state.recurringTransactions, categories: state.categories }; await AsyncStorage.setItem('financialData', JSON.stringify(dataToSave)); } catch (error) { console.error('Erro ao salvar dados:', error); } }; if (state !== initialState) { saveData(); } }, [state.transactions, state.recurringTransactions, state.categories]);

  const filteredTransactions = useMemo(() => {
    if (state.isLoading) return [];
    return state.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === state.dateFilter.month &&
        transactionDate.getFullYear() === state.dateFilter.year;
    });
  }, [state.transactions, state.dateFilter, state.isLoading]);

  // ===== NOVO: FUNÇÃO PARA BUSCAR TRANSAÇÕES PASSADAS =====
  const getPastMonthsTransactions = useCallback((numberOfMonths) => {
    const pastTransactions = {};
    const allTransactions = state.transactions;

    for (let i = 0; i < numberOfMonths; i++) {
        const date = new Date(state.dateFilter.year, state.dateFilter.month - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
        
        pastTransactions[key] = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month;
        });
    }
    return pastTransactions;
  }, [state.transactions, state.dateFilter]);
  // =======================================================

  const addTransaction = useCallback((transactionData) => {
    const transactionDate = new Date(state.dateFilter.year, state.dateFilter.month, new Date().getDate());
    const fullTransaction = { ...transactionData, date: transactionDate.toISOString() };
    dispatch({ type: 'ADD_TRANSACTION', payload: fullTransaction });
  }, [state.dateFilter]);
  
  const addRecurringTransaction = useCallback((rt) => {
    // AQUI ESTAVA O BUG: Estava salvando `rt` em vez de `newRecurrence`
    const newRecurrence = {
      ...rt,
      amountHistory: [{ amount: rt.amount, effectiveDate: new Date().toISOString() }],
    };
    delete newRecurrence.amount;
    dispatch({ type: 'ADD_RECURRING_TRANSACTION', payload: newRecurrence });

    const { year, month } = state.dateFilter;
    const firstInstanceDate = new Date(year, month, rt.dayOfMonth);
    const firstInstance = {
      ...newRecurrence,
      date: firstInstanceDate.toISOString(),
      isRecurringInstance: true,
      amount: newRecurrence.amountHistory[0].amount,
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: firstInstance });
  }, [state.dateFilter]);
  
  const updateRecurringTransaction = useCallback((id, newAmount, effectiveDate) => {
    const transactionToUpdate = state.recurringTransactions.find(rt => rt.id === id);
    if (!transactionToUpdate) return;
    const newHistory = [...transactionToUpdate.amountHistory, { amount: newAmount, effectiveDate }];
    const updatedTransaction = { ...transactionToUpdate, amountHistory: newHistory };
    dispatch({ type: 'UPDATE_RECURRING_TRANSACTION', payload: { id, updatedTransaction } });
  }, [state.recurringTransactions]);

  const removeTransaction = useCallback((id) => dispatch({ type: 'REMOVE_TRANSACTION', payload: id }), []);
  const removeRecurringTransaction = useCallback((id) => dispatch({ type: 'REMOVE_RECURRING_TRANSACTION', payload: id }), []);
  const setDateFilter = useCallback((newFilter) => dispatch({ type: 'SET_DATE_FILTER', payload: newFilter }), []);
  const addCategory = useCallback((category) => dispatch({ type: 'ADD_CATEGORY', payload: category }), []);
  const updateCategory = useCallback((id, data) => dispatch({ type: 'UPDATE_CATEGORY', payload: { id, data } }), []);
  const removeCategory = useCallback((id) => dispatch({ type: 'REMOVE_CATEGORY', payload: id }), []);
  const clearAll = useCallback(() => { AsyncStorage.removeItem('financialData'); dispatch({ type: 'CLEAR_ALL' }); }, []);
  const getCategoryById = useCallback((id) => { const found = state.categories.find(cat => cat && cat.id === id); return found || { name: 'Sem Categoria', color: '#888' }; }, [state.categories]);
  const updateTransaction = useCallback((id, data) => dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, data } }), []);
  const startEditTransaction = useCallback((transaction) => dispatch({ type: 'START_EDIT_TRANSACTION', payload: transaction }), []);
  const clearEditTransaction = useCallback(() => dispatch({ type: 'CLEAR_EDIT_TRANSACTION' }), []);

  const getFinancialAnalysis = useCallback(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const remaining = totalIncome - totalExpenses;
    const savingsPercentage = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0;
    return { salary: totalIncome, totalExpenses, remaining, savingsPercentage };
  }, [filteredTransactions]);

  const getSuggestions = useCallback(() => {
    const analysis = getFinancialAnalysis(); const suggestions = [];
    if (analysis.salary <= 0) { suggestions.push({ type: 'default', title: 'Comece Adicionando Receitas', message: 'Vá ao Dashboard ou à tela de Gastos e adicione suas receitas para o mês atual.', icon: 'information-circle' }); return suggestions; }
    if (analysis.savingsPercentage < 20) { suggestions.push({ type: 'warning', title: 'Aumente sua reserva', message: `Você está economizando apenas ${analysis.savingsPercentage.toFixed(1)}% da sua renda neste mês. O ideal é economizar pelo menos 20%.`, icon: 'warning' }); }
    if (analysis.remaining < 0) { suggestions.push({ type: 'alert', title: 'Cuidado! Contas no vermelho!', message: `Neste mês, seus gastos ultrapassaram sua renda em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(analysis.remaining))}. Revise suas despesas.`, icon: 'alert-circle' }); }
    if (analysis.remaining > 0) { suggestions.push({ type: 'investment', title: 'Oportunidade de Investimento', message: `Você tem ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analysis.remaining)} disponível neste mês. Considere investir para seus objetivos.`, icon: 'trending-up' }); }
    if (suggestions.length === 0) { suggestions.push({ type: 'success', title: 'Parabéns!', message: 'Suas finanças neste mês estão equilibradas! Continue mantendo esse controle.', icon: 'checkmark-circle' }); }
    return suggestions;
  }, [getFinancialAnalysis]);

  // AQUI ESTÁ A LIMPEZA E CORREÇÃO DO OBJETO `value`
  const value = {
    ...state,
    filteredTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    startEditTransaction,
    clearEditTransaction,
    addRecurringTransaction,
    removeRecurringTransaction,
    updateRecurringTransaction,
    setDateFilter,
    addCategory,
    updateCategory,
    removeCategory,
    getCategoryById,
    clearAll,
    getFinancialAnalysis,
    getSuggestions,
    getPastMonthsTransactions
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) { throw new Error('useFinancial deve ser usado dentro de um FinancialProvider'); }
  return context;
}