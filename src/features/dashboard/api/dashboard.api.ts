import type { ApiOk } from '@/shared/lib/types';
import type { DashboardSummaryDTO } from '../model/dashboard-summary.dto';

/**
 * API client para Dashboard
 */
export class DashboardApi {
  /**
   * Obtener resumen del dashboard para un mes
   */
  async getSummary(month: string): Promise<DashboardSummaryDTO> {
    const response = await fetch(`/api/dashboard/summary?month=${month}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al obtener resumen');
    }

    const result: ApiOk<DashboardSummaryDTO> = await response.json();
    
    if (!result.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    
    return result.data;
  }
}

// Singleton
export const dashboardApi = new DashboardApi();
