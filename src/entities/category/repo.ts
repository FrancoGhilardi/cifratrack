import type { Category } from './model/category.entity';
import type { CreateCategoryInput, UpdateCategoryInput } from './model/category.schema';

/**
 * Contrato del repositorio de categorías
 */
export interface ICategoryRepository {
  /**
   * Listar categorías del usuario
   */
  list(
    userId: string,
    filters?: { kind?: 'income' | 'expense'; isActive?: boolean }
  ): Promise<Category[]>;

  /**
   * Buscar categoría por ID
   */
  findById(id: string, userId: string): Promise<Category | null>;

  /**
   * Crear nueva categoría
   */
  create(userId: string, data: CreateCategoryInput): Promise<Category>;

  /**
   * Actualizar categoría
   */
  update(id: string, userId: string, data: UpdateCategoryInput): Promise<Category>;

  /**
   * Eliminar categoría
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Verificar si una categoría tiene transacciones asociadas
   */
  hasTransactions(id: string, userId: string): Promise<boolean>;
}
