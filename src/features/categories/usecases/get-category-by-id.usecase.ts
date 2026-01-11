import type { ICategoryRepository } from "@/entities/category/repo";
import type { Category } from "@/entities/category/model/category.entity";
import { NotFoundError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener categoria por ID
 */
export class GetCategoryByIdUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id, userId);
    if (!category) {
      throw new NotFoundError("Categoria", id);
    }

    return category;
  }
}
