import type { ApiOk } from "@/shared/lib/types";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import type { BalanceSeriesDTO } from "@/entities/dashboard/model/balance-series.dto";
import { apiFetch } from "@/shared/lib/api-client";

/**
 * API client para Dashboard
 */
export class DashboardApi {
  /**
   * Obtener resumen del dashboard para un mes
   */
  async getSummary(month: string): Promise<DashboardSummaryDTO> {
    const result = await apiFetch<ApiOk<DashboardSummaryDTO>>(
      `/api/dashboard/summary?month=${month}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!result.data) {
      throw new Error("No se recibieron datos del servidor");
    }

    return result.data;
  }

  /**
   * Obtener la serie diaria de saldo acumulado de un mes
   */
  async getBalanceSeries(month: string): Promise<BalanceSeriesDTO> {
    const result = await apiFetch<ApiOk<BalanceSeriesDTO>>(
      `/api/dashboard/balance-series?month=${month}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!result.data) {
      throw new Error("No se recibieron datos del servidor");
    }

    return result.data;
  }
}

// Singleton
export const dashboardApi = new DashboardApi();
