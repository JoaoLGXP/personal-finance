import { useMemo } from 'react';

export default function useFinancialAnalysis({ filteredTransactions, categories, isLoading, dateFilter, recurringTransactions, getPastMonthsTransactions, formatCurrency }) {
  return useMemo(() => {
    if (isLoading || !Array.isArray(categories)) {
      return { totalIncome: 0, totalExpenses: 0, remaining: 0, pieData: [], categoryAnalysis: [], forecastedBalance: 0, comparison: { percentage: 0, status: 'equal' }, barData: [] };
    }

    const incomes = filteredTransactions.filter(t => t.type === 'income');
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const remaining = totalIncome - totalExpenses;

    const upcomingBillsTotal = recurringTransactions
      .filter(rt => rt.type === 'expense' && !filteredTransactions.some(t => t.isRecurringInstance && t.description === rt.description))
      .reduce((sum, bill) => sum + bill.amountHistory[bill.amountHistory.length - 1].amount, 0);
    const forecastedBalance = remaining - upcomingBillsTotal;

    const pastData = getPastMonthsTransactions(4);
    const lastMonthKey = `${new Date(dateFilter.year, dateFilter.month - 1).getFullYear()}-${new Date(dateFilter.year, dateFilter.month - 1).getMonth()}`;
    const lastMonthExpenses = (pastData[lastMonthKey] || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    let comparison = { percentage: 0, status: 'equal' };
    if (totalExpenses > 0 && lastMonthExpenses > 0) {
      const diff = ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
      comparison = {
        percentage: Math.abs(diff),
        status: diff > 0 ? 'higher' : 'lower',
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
        dataPointText: formatCurrency(monthIncomes, true),
      });
      barData.push({
        value: monthExpenses,
        frontColor: '#EF4444',
        dataPointText: formatCurrency(monthExpenses, true),
      });
    });

    const categoryAnalysis = categories
      .filter(cat => cat && cat.name !== 'Salário')
      .map(cat => {
        const categoryExpenses = expenses.filter(exp => exp.categoryId === cat.id).reduce((sum, exp) => sum + exp.amount, 0);
        const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;
        return { name: cat.name, color: cat.color, amount: categoryExpenses, percentage: percentage };
      })
      .filter(item => item.amount > 0);

    const pieData = categoryAnalysis.map(cat => ({ value: cat.amount, color: cat.color, text: `${cat.percentage.toFixed(0)}%` }));

    return { totalIncome, totalExpenses, remaining, pieData, categoryAnalysis, forecastedBalance, comparison, barData, yAxisMaxValue: yAxisMaxValue === 0 ? 100 : yAxisMaxValue };
  }, [filteredTransactions, categories, isLoading, dateFilter, recurringTransactions, getPastMonthsTransactions, formatCurrency]);
}
