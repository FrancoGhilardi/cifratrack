import type {
  ITransactionRepository,
  TransactionWithNames,
} from "@/entities/transaction/repo";
import { NotFoundError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener transaccion por ID
 */
export class GetTransactionByIdUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(id: string, userId: string): Promise<TransactionWithNames> {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError("Transaccion", id);
    }

    return transaction;
  }
}
