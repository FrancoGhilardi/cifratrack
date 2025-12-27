import type { DashboardRepository } from '../repo.impl';
import type { DashboardSummaryDTO } from '../model/dashboard-summary.dto';

/**
 * Caso de uso: Obtener resumen del dashboard
 * 
 * Retorna el resumen financiero de un mes específico
 */
export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(userId: string, month: string): Promise<DashboardSummaryDTO> {
    // Validar formato de mes
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('El mes debe estar en formato YYYY-MM');
    }

    // Obtener resumen
    return await this.dashboardRepository.getSummary(userId, month);
  }
}
