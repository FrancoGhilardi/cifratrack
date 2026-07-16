"use client";

import { memo, useMemo } from "react";
import { Calendar, CreditCard, Pencil, Trash2 } from "lucide-react";

import { formatPercentageValue } from "@/shared/lib/utils/percentage";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { TableLoadingOverlay } from "@/shared/ui/table-loading-overlay";

import type { InvestmentDTO } from "../model/investment.dto";
import {
  formatInvestmentDate,
  getDisplayMetrics,
  type LiveRatesMap,
} from "./investment-metrics";

interface InvestmentCardsMobileProps {
  investments: InvestmentDTO[];
  liveRatesMap: LiveRatesMap;
  formatCurrency: (value: number) => string;
  isLoading: boolean;
  onEdit: (investment: InvestmentDTO) => void;
  onDelete: (investment: InvestmentDTO) => void;
}

export function InvestmentCardsMobile({
  investments,
  liveRatesMap,
  formatCurrency,
  isLoading,
  onEdit,
  onDelete,
}: InvestmentCardsMobileProps) {
  return (
    <div className="relative md:hidden">
      <TableLoadingOverlay show={isLoading} className="rounded-xl" />
      <div className="space-y-3">
        {investments.map((investment) => (
          <InvestmentMobileCard
            key={investment.id}
            investment={investment}
            liveRatesMap={liveRatesMap}
            formatCurrency={formatCurrency}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

const InvestmentMobileCard = memo(function InvestmentMobileCard({
  investment,
  liveRatesMap,
  formatCurrency,
  onEdit,
  onDelete,
}: {
  investment: InvestmentDTO;
  liveRatesMap: LiveRatesMap;
  formatCurrency: (value: number) => string;
  onEdit: (investment: InvestmentDTO) => void;
  onDelete: (investment: InvestmentDTO) => void;
}) {
  const metrics = useMemo(
    () => getDisplayMetrics(investment, liveRatesMap),
    [investment, liveRatesMap],
  );

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div>
            <p className="truncate text-sm font-semibold sm:text-base">
              {investment.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {investment.platform}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={investment.hasEnded ? "outline" : "default"}
              className={
                investment.hasEnded
                  ? "bg-muted/60"
                  : "bg-green-600 hover:bg-green-600"
              }
            >
              {investment.hasEnded ? "Finalizada" : "Activa"}
            </Badge>
            {investment.yieldProviderId && (
              <Badge variant="secondary">Tasa vinculada</Badge>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold">
            {formatCurrency(investment.principal)}
          </p>
          <p
            className={cn(
              "text-xs",
              metrics.isLive
                ? "font-medium text-blue-600 dark:text-blue-400"
                : "text-muted-foreground",
            )}
          >
            TNA {formatPercentageValue(metrics.displayTna)}%
            {metrics.isLive && " live"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Rendimiento
          </p>
          <p className="mt-1 text-base font-semibold text-green-600 dark:text-green-400">
            +{formatCurrency(metrics.currentYield)}
          </p>
          <p className="text-xs text-muted-foreground">
            Total: {formatCurrency(metrics.currentTotal)}
          </p>
        </div>

        <div className="rounded-lg border bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Duración
          </p>
          <p className="mt-1 text-sm font-medium">
            {investment.days ? `${investment.days} días` : "Sin vencimiento"}
          </p>
          <p className="text-xs text-muted-foreground">
            {investment.hasEnded
              ? "Cerrada"
              : investment.daysRemaining !== null
                ? `${investment.daysRemaining} días restantes`
                : "Activa sin fecha de cierre"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Vigencia
            </p>
            <p className="font-medium">
              {formatInvestmentDate(investment.startedOn)} →{" "}
              {formatInvestmentDate(investment.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Tipo de interés
            </p>
            <p className="font-medium">
              {investment.isCompound ? "Compuesto" : "Simple"}
            </p>
            {metrics.isLive && metrics.liveRateDate && (
              <p className="text-xs text-muted-foreground">
                Actualizado el{" "}
                {metrics.liveRateDate.toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
        </div>
      </div>

      {investment.notes && (
        <div className="mt-4 rounded-lg border bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Notas
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {investment.notes}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="h-11 flex-1"
          onClick={() => onEdit(investment)}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="outline"
          className="h-11 flex-1 text-destructive hover:text-destructive"
          onClick={() => onDelete(investment)}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </div>
    </div>
  );
});
