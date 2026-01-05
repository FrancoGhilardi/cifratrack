import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TrendingUp, Wallet, DollarSign } from "lucide-react";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { useInvestmentsSummary } from "../hooks/useInvestmentsSummary";
import type { InvestmentDTO } from "../model/investment.dto";

interface InvestmentSummaryCardsProps {
  investments: InvestmentDTO[];
}

/**
 * Widget: Tarjetas de resumen de inversiones activas
 */
export function InvestmentSummaryCards({
  investments,
}: InvestmentSummaryCardsProps) {
  const { formatCurrency } = useCurrency();
  const summary = useInvestmentsSummary(investments);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Principal Invertido */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invertido</CardTitle>
          <Wallet
            className={`h-4 w-4 ${
              summary.hasActiveInvestments
                ? "text-blue-600 dark:text-blue-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent>
          {summary.hasActiveInvestments ? (
            <>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(summary.totalPrincipal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.count}{" "}
                {summary.count === 1
                  ? "inversión activa"
                  : "inversiones activas"}
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                No hay inversiones activas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Ganancias */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancias</CardTitle>
          <TrendingUp
            className={`h-4 w-4 ${
              summary.hasActiveInvestments
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent>
          {summary.hasActiveInvestments ? (
            <>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalYield)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendimiento acumulado
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sin rendimientos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Acumulado */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <DollarSign
            className={`h-4 w-4 ${
              summary.hasActiveInvestments
                ? "text-purple-600 dark:text-purple-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent>
          {summary.hasActiveInvestments ? (
            <>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(summary.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Principal + ganancias
              </p>
            </>
          ) : (
            <div className="py-4">
              <div className="text-2xl font-bold text-muted-foreground/50">
                {formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sin inversiones
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
