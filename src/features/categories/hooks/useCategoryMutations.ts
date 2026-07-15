import { createCrudMutations } from "@/shared/lib/create-crud-mutations";
import { categoriesApi } from "../api/categories.api";
import { categoriesKeys } from "../model/query-keys";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/entities/category/model/category.schema";

const useCategoryCrudMutations = createCrudMutations<
  CreateCategoryInput,
  UpdateCategoryInput
>({
  entityLabel: "Categoría",
  api: categoriesApi,
  queryKeys: categoriesKeys,
});

/**
 * Hook para mutaciones de categorías
 */
export function useCategoryMutations() {
  const {
    create,
    update,
    delete: deleteMutation,
    isLoading,
  } = useCategoryCrudMutations();

  return {
    createCategory: create,
    updateCategory: update,
    deleteCategory: deleteMutation,
    isLoading,
  };
}
