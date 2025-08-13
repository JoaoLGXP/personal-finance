import { useMemo } from 'react';

export default function useUpcomingBills({ recurringTransactions, filteredTransactions, dateFilter, isLoading }) {
  return useMemo(() => {
    if (isLoading) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (dateFilter.year < currentYear || (dateFilter.year === currentYear && dateFilter.month < currentMonth)) {
      return [];
    }

    const recurringExpenses = recurringTransactions.filter(rt => rt.type === 'expense');

    return recurringExpenses
      .filter(rt => {
        const alreadyGenerated = filteredTransactions.some(t =>
          t.isRecurringInstance && t.description === rt.description
        );
        return !alreadyGenerated;
      })
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth);

  }, [recurringTransactions, filteredTransactions, dateFilter, isLoading]);
}
