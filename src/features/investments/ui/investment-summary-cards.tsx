"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";

import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";

import { useInvestmentsSummary } from "../hooks/useInvestmentsSummary";
import type { InvestmentDTO } from "../model/investment.dto";

interface InvestmentSummaryCardsProps {
  investments: InvestmentDTO[];
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  emptyDescription: string;
  hasData: boolean;
  checked: boolean;
  onCheckedChange: () => void;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName: string;
}

function SummaryCard({
  title,
  value,
  description,
  emptyDescription,
  hasData,
  checked,
  onCheckedChange,
  icon: Icon,
  iconClassName,
  valueClassName,
}: SummaryCardProps) {
  return (
    <Card className="border shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {hasData ? description : emptyDescription}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            aria-label={`Mostrar tarjeta ${title}`}
            className="scale-75"
          />
          <Icon className={iconClassName} />
        </div>
      </CardHeader>

      {checked && (
        <CardContent className="space-y-1">
          <div
            className={`text-xl font-bold sm:text-2xl ${
              hasData ? valueClassName : "text-muted-foreground/50"
            }`}
          >
            {value}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function InvestmentSummaryCards({
  investments,
}: InvestmentSummaryCardsProps) {
  const { formatCurrency } = useCurrency();
  const summary = useInvestmentsSummary(investments);
  const [visibleCards, setVisibleCards] = useState({
    invested: true,
    earnings: true,
    total: true,
  });

  const toggleCard = (key: keyof typeof visibleCards) => {
    setVisibleCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        title="Invertido"
        value={formatCurrency(
          summary.hasActiveInvestments ? summary.totalPrincipal : 0,
        )}
        description={`${summary.count} ${
          summary.count === 1 ? "inversión activa" : "inversiones activas"
        }`}
        emptyDescription="No hay inversiones activas"
        hasData={summary.hasActiveInvestments}
        checked={visibleCards.invested}
        onCheckedChange={() => toggleCard("invested")}
        icon={Wallet}
        iconClassName={
          summary.hasActiveInvestments
            ? "h-4 w-4 text-sky-600 dark:text-sky-400"
            : "h-4 w-4 text-muted-foreground/50"
        }
        valueClassName="text-sky-600 dark:text-sky-400"
      />

      <SummaryCard
        title="Ganancias"
        value={formatCurrency(
          summary.hasActiveInvestments ? summary.totalYield : 0,
        )}
        description="Rendimiento acumulado"
        emptyDescription="Sin rendimientos activos"
        hasData={summary.hasActiveInvestments}
        checked={visibleCards.earnings}
        onCheckedChange={() => toggleCard("earnings")}
        icon={TrendingUp}
        iconClassName={
          summary.hasActiveInvestments
            ? "h-4 w-4 text-green-600 dark:text-green-400"
            : "h-4 w-4 text-muted-foreground/50"
        }
        valueClassName="text-green-600 dark:text-green-400"
      />

      <SummaryCard
        title="Total"
        value={formatCurrency(
          summary.hasActiveInvestments ? summary.totalAmount : 0,
        )}
        description="Principal más ganancias"
        emptyDescription="Sin saldo invertido"
        hasData={summary.hasActiveInvestments}
        checked={visibleCards.total}
        onCheckedChange={() => toggleCard("total")}
        icon={DollarSign}
        iconClassName={
          summary.hasActiveInvestments
            ? "h-4 w-4 text-amber-600 dark:text-amber-400"
            : "h-4 w-4 text-muted-foreground/50"
        }
        valueClassName="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
