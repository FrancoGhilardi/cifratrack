import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../model/query-keys';

/**
 * Hook para listar categorías
 */
export function useCategories(filters?: {
  kind?: 'income' | 'expense';
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => categoriesApi.list(filters),
  });
}

/**
 * Hook para obtener una categoría por ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}
