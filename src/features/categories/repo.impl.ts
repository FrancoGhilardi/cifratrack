import { db } from '@/shared/db/client';
import { categories, transactionCategories } from '@/shared/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Category } from '@/entities/category/model/category.entity';
import type { ICategoryRepository } from '@/entities/category/repo';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';

/**
 * Implementación del repositorio de categorías con Drizzle
 */
export class CategoryRepository implements ICategoryRepository {
  /**
   * Listar categorías del usuario
   */
  async list(
    userId: string,
    filters?: { kind?: 'income' | 'expense'; isActive?: boolean }
  ): Promise<Category[]> {
    const conditions = [eq(categories.userId, userId)];

    if (filters?.kind) {
      conditions.push(eq(categories.kind, filters.kind));
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, filters.isActive));
    }

    const rows = await db
      .select()
      .from(categories)
      .where(and(...conditions))
      .orderBy(categories.name);

    return rows.map((row) =>
      Category.fromPersistence({
        id: row.id,
        userId: row.userId,
        kind: row.kind,
        name: row.name,
        isActive: row.isActive,
        isDefault: row.isDefault,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  /**
   * Buscar categoría por ID
   */
  async findById(id: string, userId: string): Promise<Category | null> {
    const rows = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return Category.fromPersistence({
      id: row.id,
      userId: row.userId,
      kind: row.kind,
      name: row.name,
      isActive: row.isActive,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Crear nueva categoría
   */
  async create(userId: string, data: CreateCategoryInput): Promise<Category> {
    const rows = await db
      .insert(categories)
      .values({
        userId,
        kind: data.kind,
        name: data.name,
        isActive: true,
        isDefault: false,
      })
      .returning();

    const row = rows[0];
    return Category.fromPersistence({
      id: row.id,
      userId: row.userId,
      kind: row.kind,
      name: row.name,
      isActive: row.isActive,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Actualizar categoría
   */
  async update(
    id: string,
    userId: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    const rows = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    if (rows.length === 0) {
      throw new Error('Category not found');
    }

    const row = rows[0];
    return Category.fromPersistence({
      id: row.id,
      userId: row.userId,
      kind: row.kind,
      name: row.name,
      isActive: row.isActive,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Eliminar categoría
   */
  async delete(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning({ id: categories.id });

    if (result.length === 0) {
      throw new Error('Category not found');
    }
  }

  /**
   * Verificar si una categoría tiene transacciones asociadas
   */
  async hasTransactions(id: string, userId: string): Promise<boolean> {
    // Primero verificar que la categoría pertenece al usuario
    const category = await this.findById(id, userId);
    if (!category) {
      return false;
    }

    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactionCategories)
      .where(eq(transactionCategories.categoryId, id))
      .limit(1);

    return result[0]?.count > 0;
  }
}
