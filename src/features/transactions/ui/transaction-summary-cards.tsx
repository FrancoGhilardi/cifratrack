import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { useTransactionsSummary } from "../hooks/useTransactionsSummary";
import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";

interface TransactionSummaryCardsProps {
  summary?: TransactionSummaryDTO;
}

/**
 * Widget: Tarjetas de resumen de transacciones del mes
 */
export function TransactionSummaryCards({
  summary: summaryData,
}: TransactionSummaryCardsProps) {
  const { format } = useCurrency();
  const summary = useTransactionsSummary(summaryData);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Total Pagado */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagado</CardTitle>
          <CheckCircle2
            className={`h-4 w-4 ${
              summary.hasPaidTransactions
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent>
          {summary.hasPaidTransactions ? (
            <>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {format(summary.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.paidCount}{" "}
                {summary.paidCount === 1
                  ? "movimiento pagado"
                  : "movimientos pagados"}
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {format(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sin movimientos pagados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Pendiente */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
          <Clock
            className={`h-4 w-4 ${
              summary.hasPendingTransactions
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent>
          {summary.hasPendingTransactions ? (
            <>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {format(summary.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.pendingCount}{" "}
                {summary.pendingCount === 1
                  ? "movimiento pendiente"
                  : "movimientos pendientes"}
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {format(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sin movimientos pendientes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
