import type { IDashboardRepository } from "@/entities/dashboard/repo";
import type { BalanceSeriesDTO } from "@/entities/dashboard/model/balance-series.dto";
import { buildBalanceSeries } from "@/features/dashboard/lib/balance-series";

/**
 * Caso de uso: Obtener la serie diaria de saldo acumulado de un mes.
 *
 * El repositorio devuelve solo los días con movimientos; la función pura
 * `buildBalanceSeries` completa el mes y acumula.
 */
export class GetBalanceSeriesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: string, month: string): Promise<BalanceSeriesDTO> {
    // `buildBalanceSeries` valida el formato del mes (lanza ValidationError).
    const rows = await this.dashboardRepository.getDailyFlowByMonth(
      userId,
      month,
    );
    return buildBalanceSeries(month, rows);
  }
}
