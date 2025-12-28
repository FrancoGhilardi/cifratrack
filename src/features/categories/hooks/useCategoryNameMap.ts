import { useMemo } from 'react';
import { useCategories } from './useCategories';

type Params = {
  kind?: 'income' | 'expense';
  isActive?: boolean;
};

/**
 * Hook para obtener un mapa id → nombre de categorías.
 * Útil en tablas/listas para resolver nombres sin repetir lógica.
 */
export function useCategoryNameMap(params?: Params) {
  const { data, isLoading } = useCategories(params);

  const map = useMemo(() => {
    const result = new Map<string, string>();
    data?.forEach((cat) => result.set(cat.id, cat.name));
    return result;
  }, [data]);

  return { map, isLoading, categories: data };
}
