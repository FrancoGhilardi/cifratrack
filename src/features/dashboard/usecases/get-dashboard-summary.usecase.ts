import type { IDashboardRepository } from "@/entities/dashboard/repo";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import { ValidationError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener resumen del dashboard
 *
 * Retorna el resumen financiero de un mes específico
 */
export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: string, month: string): Promise<DashboardSummaryDTO> {
    // Validar formato de mes
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new ValidationError("El mes debe estar en formato YYYY-MM");
    }

    // Obtener resumen
    return await this.dashboardRepository.getSummary(userId, month);
  }
}
