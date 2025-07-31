import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinancialContext = createContext();

const initialState = {
  transactions: [], // NOVO: Unifica rendas e despesas. type: 'income' | 'expense'
  recurringTransactions: [], // NOVO: Guarda os modelos de transações recorrentes
  categories: [],
  dateFilter: {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  },
};

function financialReducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    
    // Ações de Transações Recorrentes
    case 'ADD_RECURRING_TRANSACTION':
      return { ...state, recurringTransactions: [...state.recurringTransactions, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_RECURRING_TRANSACTION':
      return { ...state, recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== action.payload) };
    
    // Ações de Categoria
    case 'ADD_CATEGORY': return { ...state, categories: [...state.categories, { ...action.payload, id: Date.now() }] };
    case 'UPDATE_CATEGORY': return { ...state, categories: state.categories.map(cat => cat.id === action.payload.id ? { ...cat, ...action.payload.data } : cat) };
    case 'REMOVE_CATEGORY': return { ...state, categories: state.categories.filter(cat => cat.id !== action.payload), transactions: state.transactions.filter(t => t.categoryId !== action.payload) };
    
    // Outras ações
    case 'SET_DATE_FILTER': return { ...state, dateFilter: action.payload };
    case 'LOAD_DATA': return { ...state, ...action.payload };
    case 'CLEAR_ALL': return { ...initialState, dateFilter: state.dateFilter };
    default: return state;
  }
}

export function FinancialProvider({ children }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  // Lógica para carregar e gerar transações recorrentes
  useEffect(() => {
    const loadAndProcessData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('financialData');
        let dataToLoad = savedData ? JSON.parse(savedData) : {};

        // Normalização de dados para a nova estrutura (se vier de uma versão antiga)
        if (dataToLoad.expenses || dataToLoad.incomes) {
            dataToLoad.transactions = [
                ...(dataToLoad.expenses?.map(e => ({...e, type: 'expense'})) || []),
                ...Object.entries(dataToLoad.incomes || {}).map(([key, value]) => {
                    const [year, month] = key.split('-');
                    return { id: `income-${key}`, type: 'income', amount: parseFloat(value), description: 'Renda Mensal', date: new Date(year, month, 1).toISOString() }
                })
            ];
            delete dataToLoad.expenses;
            delete dataToLoad.incomes;
        }

        if (!dataToLoad.categories || dataToLoad.categories.length === 0) {
            dataToLoad.categories = [
                { id: 1, name: 'Moradia', color: '#3B82F6' },
                { id: 2, name: 'Alimentação', color: '#10B981' },
                { id: 3, name: 'Transporte', color: '#F59E0B' },
                { id: 4, name: 'Salário', color: '#14B8A6' },
            ];
        }

        if (!dataToLoad.transactions) dataToLoad.transactions = [];
        if (!dataToLoad.recurringTransactions) dataToLoad.recurringTransactions = [];

        // LÓGICA DE GERAÇÃO DE RECORRÊNCIAS
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let generatedTransactions = false;

        dataToLoad.recurringTransactions.forEach(rt => {
            const lastInstance = rt.lastInstance || { year: 0, month: 0 };
            const shouldGenerate = lastInstance.year < currentYear || (lastInstance.year === currentYear && lastInstance.month < currentMonth);

            if (shouldGenerate) {
                const newTransaction = {
                    ...rt,
                    id: Date.now() + Math.random(), // ID único para a instância
                    date: new Date(currentYear, currentMonth, rt.dayOfMonth).toISOString(),
                    isRecurringInstance: true, // Flag para identificar
                };
                delete newTransaction.lastInstance;
                delete newTransaction.dayOfMonth;
                delete newTransaction.frequency;

                const alreadyExists = dataToLoad.transactions.some(t => {
                   const tDate = new Date(t.date);
                   return t.description === newTransaction.description && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                });

                if(!alreadyExists) {
                    dataToLoad.transactions.push(newTransaction);
                    rt.lastInstance = { year: currentYear, month: currentMonth };
                    generatedTransactions = true;
                }
            }
        });

        dispatch({ type: 'LOAD_DATA', payload: dataToLoad });
      } catch (error) { console.error('Erro ao carregar dados:', error); }
    };
    loadAndProcessData();
  }, []);

  // Salvar dados
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = { transactions: state.transactions, recurringTransactions: state.recurringTransactions, categories: state.categories };
        await AsyncStorage.setItem('financialData', JSON.stringify(dataToSave));
      } catch (error) { console.error('Erro ao salvar dados:', error); }
    };
    if (state !== initialState) {
      saveData();
    }
  }, [state.transactions, state.recurringTransactions, state.categories]);
  
  // Memoização para performance
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === state.dateFilter.month && 
             transactionDate.getFullYear() === state.dateFilter.year;
    });
  }, [state.transactions, state.dateFilter]);

  // Ações expostas pelo contexto
  const addTransaction = useCallback((transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction }), []);
  const removeTransaction = useCallback((id) => dispatch({ type: 'REMOVE_TRANSACTION', payload: id }), []);
  
  const addRecurringTransaction = useCallback((rt) => dispatch({ type: 'ADD_RECURRING_TRANSACTION', payload: rt }), []);
  const removeRecurringTransaction = useCallback((id) => dispatch({ type: 'REMOVE_RECURRING_TRANSACTION', payload: id }), []);

  const setDateFilter = useCallback((newFilter) => dispatch({ type: 'SET_DATE_FILTER', payload: newFilter }), []);
  // ... outras funções (addCategory, etc.)
  const addCategory = useCallback((category) => dispatch({ type: 'ADD_CATEGORY', payload: category }), []);
  const updateCategory = useCallback((id, data) => dispatch({ type: 'UPDATE_CATEGORY', payload: { id, data } }), []);
  const removeCategory = useCallback((id) => dispatch({ type: 'REMOVE_CATEGORY', payload: id }), []);
  const clearAll = useCallback(() => { AsyncStorage.removeItem('financialData'); dispatch({ type: 'CLEAR_ALL' }); }, []);
  const getCategoryById = useCallback((id) => state.categories.find(cat => cat.id === id), [state.categories]);

  const value = {
    ...state,
    filteredTransactions,
    addTransaction,
    removeTransaction,
    addRecurringTransaction,
    removeRecurringTransaction,
    setDateFilter,
    getCategoryById,
    clearAll,
    addCategory,
    updateCategory,
    removeCategory,
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) { throw new Error('useFinancial deve ser usado dentro de um FinancialProvider'); }
  return context;
}