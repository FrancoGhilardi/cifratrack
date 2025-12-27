import type { DashboardSummaryDTO } from '@/features/dashboard/model/dashboard-summary.dto';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '@/shared/lib/hooks/useCurrency';

interface SummaryCardsProps {
  summary: DashboardSummaryDTO;
}

/**
 * Widget: Tarjetas de resumen del dashboard
 */
export function SummaryCards({ summary }: SummaryCardsProps) {
  const { format: formatCurrency } = useCurrency();

  const hasIncome = summary.transactionsCount.income > 0;
  const hasExpenses = summary.transactionsCount.expenses > 0;
  const hasData = summary.transactionsCount.total > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Ingresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          <ArrowUpCircle className={`h-4 w-4 ${
            hasIncome ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/50'
          }`} />
        </CardHeader>
        <CardContent>
          {hasIncome ? (
            <>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.transactionsCount.income} transacciones
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                No hay ingresos este mes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Egresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egresos</CardTitle>
          <ArrowDownCircle className={`h-4 w-4 ${
            hasExpenses ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground/50'
          }`} />
        </CardHeader>
        <CardContent>
          {hasExpenses ? (
            <>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.transactionsCount.expenses} transacciones
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                No hay egresos este mes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          {!hasData ? (
            <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
          ) : summary.balance >= 0 ? (
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          )}
        </CardHeader>
        <CardContent>
          {hasData ? (
            <>
              <div
                className={`text-2xl font-bold ${
                  summary.balance >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {formatCurrency(summary.balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.transactionsCount.pending > 0
                  ? `${summary.transactionsCount.pending} pendientes`
                  : 'Todo al día'}
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sin movimientos este mes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
