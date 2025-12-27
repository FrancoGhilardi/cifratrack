'use client';

import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { SummaryCards } from '@/widgets/dashboard/summary-cards';
import { ExpensesChart } from '@/widgets/dashboard/expenses-chart';
import { SummaryCardsSkeleton, ExpensesChartSkeleton } from '@/widgets/dashboard/dashboard-skeleton';
import { useMonthNavigation } from '@/shared/lib/hooks/useMonthNavigation';
import { MonthSelector } from '@/shared/ui/month-selector';
import { ErrorState } from '@/shared/ui/error-state';

/**
 * Página del Dashboard
 */
export default function DashboardPage() {
  // Hook de navegación de meses
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    formatMonth,
  } = useMonthNavigation();

  // Query del resumen
  const { data: summary, isLoading, error } = useDashboardSummary(currentMonth);

  // Summary por defecto si no hay datos o hay error
  const displaySummary = summary || {
    month: currentMonth,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    expensesByCategory: [],
    incomeByCategory: [],
    expensesByPaymentMethod: [],
    transactionsCount: {
      total: 0,
      income: 0,
      expenses: 0,
      pending: 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Selector de mes */}
        <MonthSelector
          currentMonth={currentMonth}
          monthLabel={formatMonth()}
          isCurrentMonth={isCurrentMonth()}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onCurrentMonth={goToCurrentMonth}
        />
      </div>

      {/* Mensaje de error */}
      {error && !isLoading && (
        <ErrorState
          message={error.message}
          showReloadButton
        />
      )}

      {/* Dashboard Content - Siempre visible */}
      {isLoading ? (
        <>
          <SummaryCardsSkeleton />
          <ExpensesChartSkeleton />
        </>
      ) : (
        <>
          <SummaryCards summary={displaySummary} />
          <ExpensesChart summary={displaySummary} />
        </>
      )}
    </div>
  );
}
