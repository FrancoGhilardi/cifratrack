'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { columnToSnakeCase } from '../utils/column-mapping';

/**
 * Parámetros base para cualquier tabla con filtros y paginación
 */
export interface BaseTableParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  q?: string; // búsqueda general
}

/**
 * Opciones de configuración para el hook
 */
export interface UseTableParamsOptions {
  /** Columnas permitidas para sorting (en snake_case) */
  allowedSortColumns?: string[];
  /** Mapeos personalizados de columnas camelCase → snake_case */
  columnMappings?: Record<string, string>;
  /** Columna de sorting por defecto (en camelCase) */
  defaultSortBy?: string;
  /** Orden por defecto */
  defaultSortOrder?: 'asc' | 'desc';
  /** Página inicial */
  defaultPage?: number;
  /** Tamaño de página por defecto */
  defaultPageSize?: number;
}

/**
 * Hook genérico para manejar parámetros de tabla desde URL
 * Maneja paginación, sorting y búsqueda de forma reutilizable
 * 
 * @example
 * ```tsx
 * const { params, updateParams, setSort, goToPage } = useTableParams({
 *   defaultSortBy: 'occurredOn',
 *   defaultSortOrder: 'desc',
 *   columnMappings: { occurredOn: 'occurred_on' }
 * });
 * ```
 */
export function useTableParams<T extends BaseTableParams>(
  options: UseTableParamsOptions = {}
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    columnMappings,
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'desc',
    defaultPage = 1,
    defaultPageSize = 20,
  } = options;

  // Parsear parámetros desde URL
  const params = useMemo(() => {
    const sortBy = searchParams.get('sortBy') || defaultSortBy;
    
    return {
      sortBy: columnToSnakeCase(sortBy, columnMappings),
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder,
      page: Number(searchParams.get('page')) || defaultPage,
      pageSize: Number(searchParams.get('pageSize')) || defaultPageSize,
      q: searchParams.get('q') || undefined,
    } as T;
  }, [searchParams, columnMappings, defaultSortBy, defaultSortOrder, defaultPage, defaultPageSize]);

  // Actualizar parámetros en la URL
  const updateParams = useCallback(
    (newParams: Partial<T>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          current.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            current.set(key, value.join(','));
          } else {
            current.delete(key);
          }
        } else {
          current.set(key, String(value));
        }
      });

      // Si se cambian filtros, resetear a página 1
      const filterKeys = ['q', 'month', 'kind', 'status'];
      const isFilterChange = Object.keys(newParams).some((key) => filterKeys.includes(key));
      if (isFilterChange && !('page' in newParams)) {
        current.set('page', '1');
      }

      router.push(`${pathname}?${current.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Resetear todos los filtros
  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Cambiar página
  const goToPage = useCallback(
    (page: number) => {
      updateParams({ page } as Partial<T>);
    },
    [updateParams]
  );

  // Cambiar sorting (mantiene sortBy en camelCase en URL)
  const setSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      updateParams({ sortBy, sortOrder } as Partial<T>);
    },
    [updateParams]
  );

  // Cambiar búsqueda
  const setSearch = useCallback(
    (q: string | undefined) => {
      updateParams({ q } as Partial<T>);
    },
    [updateParams]
  );

  return {
    params,
    updateParams,
    resetFilters,
    goToPage,
    setSort,
    setSearch,
  };
}
