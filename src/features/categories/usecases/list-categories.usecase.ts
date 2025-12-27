import type { ICategoryRepository } from '@/entities/category/repo';
import type { Category } from '@/entities/category/model/category.entity';

/**
 * Caso de uso: Listar categorías
 */
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(
    userId: string,
    filters?: { kind?: 'income' | 'expense'; isActive?: boolean }
  ): Promise<Category[]> {
    return this.categoryRepo.list(userId, filters);
  }
}
