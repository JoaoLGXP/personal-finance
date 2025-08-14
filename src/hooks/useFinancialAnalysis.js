// src/hooks/useFinancialAnalysis.js
import { useMemo } from 'react';
import { formatCurrency } from '../utils/format'; // Importa a função de formatação

export default function useFinancialAnalysis({
    filteredTransactions,
    categories,
    isLoading,
    dateFilter,
    recurringTransactions,
    getPastMonthsTransactions,
}) {
    return useMemo(() => {
        if (isLoading || !Array.isArray(categories)) {
            return {
                totalIncome: 0,
                totalExpenses: 0,
                remaining: 0,
                pieData: [],
                categoryAnalysis: [],
                forecastedBalance: 0,
                comparison: {
                    percentage: 0,
                    status: 'equal'
                },
                barData: [],
                yAxisMaxValue: 0,
                upcomingBills: [], // Adicionado aqui
            };
        }

        // Cálculos principais
        const incomes = filteredTransactions.filter(t => t.type === 'income');
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const remaining = totalIncome - totalExpenses;

        // Lógica das contas a vencer (movida para cá)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let upcomingBills = [];
        if (!(dateFilter.year < currentYear || (dateFilter.year === currentYear && dateFilter.month < currentMonth))) {
            upcomingBills = recurringTransactions
                .filter(rt => rt.type === 'expense' && !filteredTransactions.some(t => t.isRecurringInstance && t.description === rt.description))
                .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
        }

        const upcomingBillsTotal = upcomingBills.reduce((sum, bill) => bill.amountHistory ? sum + bill.amountHistory[bill.amountHistory.length - 1].amount : sum, 0);
        const forecastedBalance = remaining - upcomingBillsTotal;

        // O resto da análise continua igual...
        const pastData = getPastMonthsTransactions(4);
        const lastMonthKey = `${new Date(dateFilter.year, dateFilter.month - 1).getFullYear()}-${new Date(dateFilter.year, dateFilter.month - 1).getMonth()}`;
        const lastMonthExpenses = (pastData[lastMonthKey] || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        let comparison = {
            percentage: 0,
            status: 'equal'
        };
        if (totalExpenses > 0 && lastMonthExpenses > 0) {
            const diff = ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
            comparison = {
                percentage: Math.abs(diff),
                status: diff > 0 ? 'higher' : 'lower'
            };
        }
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const barData = [];
        let yAxisMaxValue = 0;
        Object.keys(pastData).sort().forEach(key => {
            const [year, month] = key.split('-').map(Number);
            const monthIncomes = pastData[key].filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const monthExpenses = pastData[key].filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            if (monthIncomes > yAxisMaxValue) yAxisMaxValue = monthIncomes;
            if (monthExpenses > yAxisMaxValue) yAxisMaxValue = monthExpenses;
            barData.push({
                value: monthIncomes,
                label: monthNames[month],
                spacing: 2,
                frontColor: '#10B981',
                dataPointText: formatCurrency(monthIncomes),
            });
            barData.push({
                value: monthExpenses,
                frontColor: '#EF4444',
                dataPointText: formatCurrency(monthExpenses),
            });
        });
        const categoryAnalysis = categories.filter(cat => cat && cat.name !== 'Salário').map(cat => {
            const categoryExpenses = expenses.filter(exp => exp.categoryId === cat.id).reduce((sum, exp) => sum + exp.amount, 0);
            const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;
            return {
                name: cat.name,
                color: cat.color,
                amount: categoryExpenses,
                percentage: percentage
            };
        }).filter(item => item.amount > 0);
        const pieData = categoryAnalysis.map(cat => ({
            value: cat.amount,
            color: cat.color,
            text: `${cat.percentage.toFixed(0)}%`
        }));

        return {
            totalIncome,
            totalExpenses,
            remaining,
            pieData,
            categoryAnalysis,
            forecastedBalance,
            comparison,
            barData,
            yAxisMaxValue: yAxisMaxValue === 0 ? 100 : yAxisMaxValue,
            upcomingBills
        };
    }, [filteredTransactions, categories, isLoading, dateFilter, recurringTransactions, getPastMonthsTransactions]);
}