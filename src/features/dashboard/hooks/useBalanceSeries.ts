'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from '../model/query-keys';

/**
 * Hook para obtener la serie diaria de saldo acumulado de un mes
 */
export function useBalanceSeries(month: string) {
  return useQuery({
    queryKey: dashboardKeys.balanceSeries(month),
    queryFn: () => dashboardApi.getBalanceSeries(month),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
