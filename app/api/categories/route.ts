import { withApiHandler } from "@/shared/lib/api-handler";
import { CategoryRepository } from "@/features/categories/repo.impl";
import { ListCategoriesUseCase } from "@/features/categories/usecases/list-categories.usecase";
import { UpsertCategoryUseCase } from "@/features/categories/usecases/upsert-category.usecase";
import { ok } from "@/shared/lib/response";
import {
  createCategorySchema,
  listCategoriesSchema,
  type ListCategoriesInput,
} from "@/entities/category/model/category.schema";

const categoryRepository = new CategoryRepository();
const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
const upsertCategoryUseCase = new UpsertCategoryUseCase(categoryRepository);

/**
 * GET /api/categories
 * Listar categorías del usuario
 */
export const GET = withApiHandler<ListCategoriesInput>({
  query: (searchParams) =>
    listCategoriesSchema.parse({
      kind: searchParams.get("kind") || undefined,
      isActive: searchParams.get("isActive")
        ? searchParams.get("isActive") === "true"
        : undefined,
    }),
  handler: async ({ userId, query }) => {
    const categories = await listCategoriesUseCase.execute(userId, query);
    return ok(categories.map((cat) => cat.toDTO()));
  },
});

/**
 * POST /api/categories
 * Crear nueva categoría
 */
export const POST = withApiHandler({
  bodySchema: createCategorySchema,
  handler: async ({ userId, body }) => {
    const category = await upsertCategoryUseCase.create(userId, body);
    return ok(category.toDTO(), 201);
  },
});
