import type { ICategoryRepository } from "@/entities/category/repo";
import type { Category } from "@/entities/category/model/category.entity";
import { GetByIdUseCase } from "@/shared/lib/usecases/get-by-id.usecase";

/**
 * Caso de uso: Obtener categoria por ID (passthrough al repo, sin reglas propias)
 */
export class GetCategoryByIdUseCase extends GetByIdUseCase<Category> {
  constructor(categoryRepo: ICategoryRepository) {
    super(categoryRepo, "Categoria");
  }
}
