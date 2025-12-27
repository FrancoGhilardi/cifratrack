import type { DashboardSummaryDTO } from '@/features/dashboard/model/dashboard-summary.dto';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useCurrency } from '@/shared/lib/hooks/useCurrency';
import { calculatePercentage, getPercentageValue } from '@/shared/lib/utils/percentage';
import { EmptyState } from '@/shared/ui/empty-state';

interface ExpensesChartProps {
  summary: DashboardSummaryDTO;
}

/**
 * Widget: Lista de egresos por categoría
 * TODO: Implementar gráfico con Recharts en fase posterior
 */
export function ExpensesChart({ summary }: ExpensesChartProps) {
  const { format: formatCurrency } = useCurrency();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Egresos por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Egresos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.expensesByCategory.length === 0 ? (
            <EmptyState
              icon={ArrowDownCircle}
              title="No hay egresos"
              description="Los egresos aparecerán aquí"
            />
          ) : (
            <div className="space-y-3">
              {summary.expensesByCategory.map((item) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.categoryName}</span>
                    <span className="text-muted-foreground">
                      {calculatePercentage(item.total, summary.totalExpenses)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 dark:bg-red-400"
                        style={{ width: `${getPercentageValue(item.total, summary.totalExpenses)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingresos por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.incomeByCategory.length === 0 ? (
            <EmptyState
              icon={ArrowUpCircle}
              title="No hay ingresos"
              description="Los ingresos aparecerán aquí"
            />
          ) : (
            <div className="space-y-3">
              {summary.incomeByCategory.map((item) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.categoryName}</span>
                    <span className="text-muted-foreground">
                      {calculatePercentage(item.total, summary.totalIncome)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 dark:bg-green-400"
                        style={{ width: `${getPercentageValue(item.total, summary.totalIncome)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

