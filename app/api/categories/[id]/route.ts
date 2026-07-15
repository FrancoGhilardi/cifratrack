import { withApiHandler } from "@/shared/lib/api-handler";
import { CategoryRepository } from "@/features/categories/repo.impl";
import { UpsertCategoryUseCase } from "@/features/categories/usecases/upsert-category.usecase";
import { DeleteCategoryUseCase } from "@/features/categories/usecases/delete-category.usecase";
import { GetCategoryByIdUseCase } from "@/features/categories/usecases/get-category-by-id.usecase";
import { ok } from "@/shared/lib/response";
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "@/entities/category/model/category.schema";

const categoryRepository = new CategoryRepository();
const upsertCategoryUseCase = new UpsertCategoryUseCase(categoryRepository);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
const getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepository);

/**
 * GET /api/categories/[id]
 * Obtener categoría por ID
 */
export const GET = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    const category = await getCategoryByIdUseCase.execute(params.id, userId);
    return ok(category.toDTO());
  },
});

/**
 * PUT /api/categories/[id]
 * Actualizar categoría
 */
export const PUT = withApiHandler<
  undefined,
  UpdateCategoryInput,
  { id: string }
>({
  bodySchema: updateCategorySchema,
  handler: async ({ userId, body, params }) => {
    const category = await upsertCategoryUseCase.update(
      params.id,
      userId,
      body,
    );
    return ok(category.toDTO());
  },
});

/**
 * DELETE /api/categories/[id]
 * Eliminar categoría
 */
export const DELETE = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    await deleteCategoryUseCase.execute(params.id, userId);
    return ok({ message: "Categoría eliminada correctamente" });
  },
});
