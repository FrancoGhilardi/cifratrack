import { TransactionRepository } from '../repo.impl';
import { NotFoundError } from '@/shared/lib/errors';

/**
 * Caso de uso: Eliminar transacción
 */
export class DeleteTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // Verificar que existe
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError('Transacción no encontrada');
    }

    // Eliminar (cascade a splits manejado en repo)
    await this.repository.delete(id, userId);
  }
}
