import type { DashboardSummaryDTO } from "./model/dashboard-summary.dto";
import type { DailyFlowRow } from "./model/balance-series.dto";

/**
 * Contrato del repositorio de dashboard
 */
export interface IDashboardRepository {
  /**
   * Obtener resumen del dashboard para un mes especifico
   */
  getSummary(userId: string, month: string): Promise<DashboardSummaryDTO>;

  /**
   * Obtener ingresos y egresos agrupados por día para un mes especifico.
   * Solo devuelve los días con movimientos; el relleno lo hace el UseCase.
   */
  getDailyFlowByMonth(userId: string, month: string): Promise<DailyFlowRow[]>;
}
