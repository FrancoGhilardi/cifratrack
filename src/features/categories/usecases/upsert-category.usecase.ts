import type { ICategoryRepository } from '@/entities/category/repo';
import type { Category } from '@/entities/category/model/category.entity';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';
import { DomainError } from '@/shared/lib/errors';

/**
 * Caso de uso: Crear o actualizar categoría
 */
export class UpsertCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  /**
   * Crear nueva categoría
   */
  async create(userId: string, data: CreateCategoryInput): Promise<Category> {
    // Validar que no exista una categoría con el mismo nombre y tipo
    const existing = await this.categoryRepo.list(userId, { kind: data.kind });
    const duplicate = existing.find(
      (cat) => cat.name.toLowerCase() === data.name.toLowerCase()
    );

    if (duplicate) {
      throw new DomainError(
        `Ya existe una categoría de ${data.kind === 'income' ? 'ingreso' : 'egreso'} con el nombre "${data.name}"`
      );
    }

    return this.categoryRepo.create(userId, data);
  }

  /**
   * Actualizar categoría existente
   */
  async update(
    id: string,
    userId: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    // Verificar que la categoría existe
    const existing = await this.categoryRepo.findById(id, userId);
    if (!existing) {
      throw new DomainError('Categoría no encontrada');
    }

    // No permitir editar categorías por defecto
    if (existing.isDefault) {
      throw new DomainError('No se pueden editar categorías por defecto');
    }

    // Si se cambia el nombre, validar que no exista otra con ese nombre
    if (data.name && data.name !== existing.name) {
      const allCategories = await this.categoryRepo.list(userId, {
        kind: existing.kind,
      });
      const duplicate = allCategories.find(
        (cat) => cat.id !== id && cat.name.toLowerCase() === data.name!.toLowerCase()
      );

      if (duplicate) {
        throw new DomainError(
          `Ya existe otra categoría con el nombre "${data.name}"`
        );
      }
    }

    return this.categoryRepo.update(id, userId, data);
  }
}
