'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from '../model/query-keys';

/**
 * Hook para obtener el resumen del dashboard
 */
export function useDashboardSummary(month: string) {
  return useQuery({
    queryKey: dashboardKeys.summary(month),
    queryFn: () => dashboardApi.getSummary(month),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
