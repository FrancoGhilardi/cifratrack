import { ValidationError } from '@/shared/lib/errors';

/**
 * Value Object: TransactionSplit
 * 
 * Representa la distribución de una transacción entre categorías
 */
export class TransactionSplit {
  constructor(
    public readonly splits: Array<{
      categoryId: string;
      allocatedAmount: number; // en centavos
    }>
  ) {
    this.validate();
  }

  /**
   * Validar que el split sea correcto
   */
  private validate(): void {
    if (this.splits.length === 0) {
      throw new ValidationError('Debe haber al menos una categoría asignada');
    }

    // Validar que todos los montos sean positivos
    for (const split of this.splits) {
      if (split.allocatedAmount <= 0) {
        throw new ValidationError('Los montos asignados deben ser mayores a cero');
      }
    }

    // Validar que no haya categorías duplicadas
    const categoryIds = this.splits.map((s) => s.categoryId);
    const uniqueIds = new Set(categoryIds);
    if (categoryIds.length !== uniqueIds.size) {
      throw new ValidationError('No puede haber categorías duplicadas en el split');
    }
  }

  /**
   * Obtener el total asignado en el split
   */
  getTotal(): number {
    return this.splits.reduce((sum, split) => sum + split.allocatedAmount, 0);
  }

  /**
   * Verificar si el split coincide con el monto de la transacción
   */
  matchesAmount(transactionAmount: number): boolean {
    return this.getTotal() === transactionAmount;
  }

  /**
   * Convertir a formato para persistencia
   */
  toPersistence() {
    return this.splits;
  }

  /**
   * Crear desde datos de persistencia
   */
  static fromPersistence(
    data: Array<{ categoryId: string; allocatedAmount: number }>
  ): TransactionSplit {
    return new TransactionSplit(data);
  }
}
