import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../model/query-keys';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';

/**
 * Hook para mutaciones de categorías
 */
export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (data: CreateCategoryInput) => categoriesApi.create(data),
    onSuccess: () => {
      // Invalidar todas las listas de categorías
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista y detalle específico
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.detail(variables.id) });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
