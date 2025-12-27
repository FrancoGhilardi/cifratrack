import type { ICategoryRepository } from '@/entities/category/repo';
import { DomainError } from '@/shared/lib/errors';

/**
 * Caso de uso: Eliminar categoría
 */
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // Verificar que la categoría existe
    const category = await this.categoryRepo.findById(id, userId);
    if (!category) {
      throw new DomainError('Categoría no encontrada');
    }

    // No permitir eliminar categorías por defecto
    if (category.isDefault) {
      throw new DomainError('No se pueden eliminar categorías por defecto');
    }

    // Verificar que no tenga transacciones asociadas
    const hasTransactions = await this.categoryRepo.hasTransactions(id, userId);
    if (hasTransactions) {
      throw new DomainError(
        'No se puede eliminar la categoría porque tiene transacciones asociadas. Puedes desactivarla en su lugar.'
      );
    }

    await this.categoryRepo.delete(id, userId);
  }
}
