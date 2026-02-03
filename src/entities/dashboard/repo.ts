import type { DashboardSummaryDTO } from "./model/dashboard-summary.dto";

/**
 * Contrato del repositorio de dashboard
 */
export interface IDashboardRepository {
  /**
   * Obtener resumen del dashboard para un mes especifico
   */
  getSummary(userId: string, month: string): Promise<DashboardSummaryDTO>;
}
