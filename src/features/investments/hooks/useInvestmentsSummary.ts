import { useMemo } from "react";
import type { InvestmentDTO } from "../model/investment.dto";

/**
 * Resumen de inversiones activas
 */
export interface InvestmentsSummary {
  totalPrincipal: number;
  totalYield: number;
  totalAmount: number;
  count: number;
  hasActiveInvestments: boolean;
}

/**
 * Hook para calcular el resumen de inversiones activas
 *
 * Filtra las inversiones activas (hasEnded === false) y calcula:
 * - totalPrincipal: suma de todos los montos principales invertidos
 * - totalYield: suma de todos los rendimientos
 * - totalAmount: suma de principal + rendimientos
 * - count: número de inversiones activas
 *
 * @param investments - Lista de inversiones
 * @returns Resumen de inversiones activas
 */
export function useInvestmentsSummary(
  investments: InvestmentDTO[]
): InvestmentsSummary {
  return useMemo(() => {
    const activeInvestments = investments.filter((inv) => !inv.hasEnded);

    const totalPrincipal = activeInvestments.reduce(
      (sum, inv) => sum + inv.principal,
      0
    );
    const totalYield = activeInvestments.reduce(
      (sum, inv) => sum + inv.yield,
      0
    );
    const totalAmount = activeInvestments.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const count = activeInvestments.length;

    return {
      totalPrincipal,
      totalYield,
      totalAmount,
      count,
      hasActiveInvestments: count > 0,
    };
  }, [investments]);
}
