"use client";

import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { useBalanceSeries } from "@/features/dashboard/hooks/useBalanceSeries";
import { BalanceHero } from "@/widgets/dashboard/balance-hero";
import { FlowTiles } from "@/widgets/dashboard/flow-tiles";
import { ExpensesChart } from "@/widgets/dashboard/expenses-chart";
import {
  DashboardHeroSkeleton,
  ExpensesChartSkeleton,
} from "@/widgets/dashboard/dashboard-skeleton";
import { useMonthNavigation } from "@/shared/lib/hooks/useMonthNavigation";
import { MonthSelector } from "@/shared/ui/month-selector";
import { ErrorState } from "@/shared/ui/error-state";
import { PageHeader } from "@/shared/ui/page-header";

/**
 * Página del Dashboard
 */
export function DashboardPageClient() {
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    formatMonth,
  } = useMonthNavigation();

  const { data: summary, isLoading, error } = useDashboardSummary(currentMonth);
  const { data: series, isLoading: isSeriesLoading } =
    useBalanceSeries(currentMonth);

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
    <div className="space-y-5">
      <PageHeader
        title="Panel principal"
        description="Ingresos, egresos y balance del período seleccionado."
        action={
          <MonthSelector
            currentMonth={currentMonth}
            monthLabel={formatMonth()}
            isCurrentMonth={isCurrentMonth()}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onCurrentMonth={goToCurrentMonth}
          />
        }
      />

      {error && !isLoading && (
        <ErrorState
          message={error.message}
          showReloadButton
          className="max-w-3xl"
        />
      )}

      {isLoading ? (
        <>
          <DashboardHeroSkeleton />
          <ExpensesChartSkeleton />
        </>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <BalanceHero
                summary={displaySummary}
                series={series}
                isSeriesLoading={isSeriesLoading}
                monthLabel={formatMonth()}
              />
            </div>
            <div className="lg:col-span-5">
              <FlowTiles summary={displaySummary} />
            </div>
          </section>

          <ExpensesChart summary={displaySummary} />
        </>
      )}
    </div>
  );
}
