import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../model/query-keys';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';
import { toast } from '@/shared/lib/toast';

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
      toast.success('Categoría creada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear categoría'),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista y detalle específico
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.detail(variables.id) });
      toast.success('Categoría actualizada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al actualizar categoría'),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      toast.success('Categoría eliminada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al eliminar categoría'),
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
