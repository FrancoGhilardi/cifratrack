import { TransactionRepository } from '../repo.impl';
import type { TransactionWithNames } from '@/entities/transaction/repo';
import type { CreateTransactionInput, UpdateTransactionInput } from '@/entities/transaction/model/transaction.schema';
import { ValidationError } from '@/shared/lib/errors';

/**
 * Caso de uso: Crear o actualizar transacción
 */
export class UpsertTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  /**
   * Crear nueva transacción
   */
  async create(
    userId: string,
    data: CreateTransactionInput
  ): Promise<TransactionWithNames> {
    // Validar splits
    if (data.split && data.split.length > 0) {
      this.validateSplits(data.amount, data.split);
    } else {
      throw new ValidationError('Debe especificar al menos una categoría en split');
    }

    return await this.repository.create(userId, data);
  }

  /**
   * Actualizar transacción existente
   */
  async update(
    id: string,
    userId: string,
    data: UpdateTransactionInput
  ): Promise<TransactionWithNames> {
    // Si se envían splits, validar que sumen correctamente
    if (data.split && data.split.length > 0) {
      const existingTransaction = await this.repository.findById(id, userId);
      const amount = data.amount ?? existingTransaction?.transaction.amount;
      if (!amount) {
        throw new ValidationError('No se puede determinar el monto para validar split');
      }
      this.validateSplits(amount, data.split);
    }

    return await this.repository.update(id, userId, data);
  }

  /**
   * Validar que los splits sumen el monto total
   */
  private validateSplits(
    amount: number,
    splits: Array<{ categoryId: string; allocatedAmount: number }>
  ): void {
    if (splits.length === 0) {
      throw new ValidationError('Debe especificar al menos una categoría');
    }

    const totalAllocated = splits.reduce((sum, split) => sum + split.allocatedAmount, 0);

    if (totalAllocated !== amount) {
      throw new ValidationError(
        `La suma de los importes por categoría (${totalAllocated}) debe coincidir con el monto total (${amount})`
      );
    }

    // Validar que no haya importes negativos o cero
    const invalidSplit = splits.find((s) => s.allocatedAmount <= 0);
    if (invalidSplit) {
      throw new ValidationError('Los importes de categorías deben ser mayores a cero');
    }

    // Validar que no haya categorías duplicadas
    const categoryIds = splits.map((s) => s.categoryId);
    const uniqueIds = new Set(categoryIds);
    if (categoryIds.length !== uniqueIds.size) {
      throw new ValidationError('No puede asignar la misma categoría más de una vez');
    }
  }
}
