'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { InvestmentQueryParams } from '../model/investment.dto';
import { investmentKeys } from '../model/query-keys';
import { fetchInvestments } from '../api/investments.api';

/**
 * Hook para gestionar la tabla de inversiones con filtros/orden/paginación desde la URL
 */
export function useInvestmentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Leer parámetros actuales desde la URL
  const params: InvestmentQueryParams = useMemo(() => {
    const sortByParam = searchParams.get('sortBy') as InvestmentQueryParams['sortBy'];
    const sortDirParam = searchParams.get('sortDir') as InvestmentQueryParams['sortDir'];
    const pageParam = Number(searchParams.get('page')) || 1;
    const pageSizeParam = Number(searchParams.get('pageSize')) || 20;
    const qParam = searchParams.get('q') || undefined;
    const activeParam = searchParams.get('active') as InvestmentQueryParams['active'];

    return {
      page: pageParam,
      pageSize: pageSizeParam,
      sortBy: sortByParam || 'startedOn',
      sortDir: sortDirParam || 'desc',
      q: qParam,
      active: activeParam,
    };
  }, [searchParams]);

  const query = useQuery({
    queryKey: investmentKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchInvestments(params),
    keepPreviousData: true,
  });

  const updateParams = useCallback(
    (newParams: Partial<InvestmentQueryParams>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      // Si cambian filtros o pageSize, resetear página a 1
      const filterKeys = ['q', 'active', 'pageSize'];
      const isFilterChange = Object.keys(newParams).some((key) => filterKeys.includes(key));
      if (isFilterChange && !('page' in newParams)) {
        current.set('page', '1');
      }

      router.push(`${pathname}?${current.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const setFilters = useCallback(
    (filters: Partial<Pick<InvestmentQueryParams, 'q' | 'active'>>) => {
      updateParams(filters);
    },
    [updateParams]
  );

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const goToPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateParams({ pageSize });
    },
    [updateParams]
  );

  const setSort = useCallback(
    (sortBy: NonNullable<InvestmentQueryParams['sortBy']>, sortDir: NonNullable<InvestmentQueryParams['sortDir']>) => {
      updateParams({ sortBy, sortDir });
    },
    [updateParams]
  );

  return {
    investments: query.data?.data ?? [],
    meta: query.data?.meta,
    params,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    setFilters,
    resetFilters,
    setSort,
    goToPage,
    setPageSize,
    refetch: query.refetch,
  };
}
