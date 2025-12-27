import { TransactionRepository } from '../repo.impl';
import type { ListTransactionsParams, PaginatedTransactions } from '@/entities/transaction/repo';
import { ValidationError } from '@/shared/lib/errors';

/**
 * Caso de uso: Listar transacciones con filtros y paginación
 */
export class ListTransactionsUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(params: ListTransactionsParams): Promise<PaginatedTransactions> {
    // Validar sortBy (whitelist)
    const allowedSortBy = ['occurred_on', 'amount', 'title', 'created_at'];
    if (params.sortBy && !allowedSortBy.includes(params.sortBy)) {
      throw new ValidationError(`sortBy debe ser uno de: ${allowedSortBy.join(', ')}`);
    }

    // Validar pageSize límite
    const pageSize = params.pageSize ?? 20;
    if (pageSize > 100) {
      throw new ValidationError('pageSize no puede exceder 100');
    }

    // Validar page mínimo
    const page = params.page ?? 1;
    if (page < 1) {
      throw new ValidationError('page debe ser mayor o igual a 1');
    }

    // Ejecutar consulta
    return await this.repository.list({
      ...params,
      page,
      pageSize,
    });
  }
}
