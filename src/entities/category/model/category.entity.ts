import type { entryKind } from '@/shared/db/schema';

type EntryKind = typeof entryKind.enumValues[number];

/**
 * Entidad Category (dominio)
 * 
 * Representa una categoría de ingreso o egreso
 */
export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly kind: EntryKind,
    public readonly name: string,
    public readonly isActive: boolean,
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crear desde datos de persistencia
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    kind: 'income' | 'expense';
    name: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return new Category(
      data.id,
      data.userId,
      data.kind,
      data.name,
      data.isActive,
      data.isDefault,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Convertir a DTO para API
   */
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      kind: this.kind,
      name: this.name,
      isActive: this.isActive,
      isDefault: this.isDefault,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Verificar si es una categoría de ingreso
   */
  isIncome(): boolean {
    return this.kind === 'income';
  }

  /**
   * Verificar si es una categoría de egreso
   */
  isExpense(): boolean {
    return this.kind === 'expense';
  }

  /**
   * Verificar si puede ser eliminada
   */
  canBeDeleted(): boolean {
    return !this.isDefault;
  }
}

export type CategoryDTO = ReturnType<Category['toDTO']>;
