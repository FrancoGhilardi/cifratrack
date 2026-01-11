import type {
  ITransactionRepository,
  ListTransactionsParams,
  PaginatedTransactions,
} from "@/entities/transaction/repo";
import { ValidationError } from "@/shared/lib/errors";

/**
 * Caso de uso: Listar transacciones con filtros y paginación
 */
export class ListTransactionsUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(
    params: ListTransactionsParams
  ): Promise<PaginatedTransactions> {
    // Validar sortBy (whitelist)
    const allowedSortBy = ["occurred_on", "amount", "title", "created_at"];
    if (params.sortBy && !allowedSortBy.includes(params.sortBy)) {
      throw new ValidationError(
        `sortBy debe ser uno de: ${allowedSortBy.join(", ")}`
      );
    }

    // Validar pageSize límite
    const pageSize = params.pageSize ?? 20;
    if (pageSize > 100) {
      throw new ValidationError("pageSize no puede exceder 100");
    }

    // Validar page mínimo
    const page = params.page ?? 1;
    if (page < 1) {
      throw new ValidationError("page debe ser mayor o igual a 1");
    }

    if (
      (params.cursor && !params.cursorId) ||
      (!params.cursor && params.cursorId)
    ) {
      throw new ValidationError("cursor y cursorId deben enviarse juntos");
    }

    if (params.cursor) {
      const sortBy = params.sortBy ?? "occurred_on";
      if (sortBy === "amount" && Number.isNaN(Number(params.cursor))) {
        throw new ValidationError("cursor invalido para sortBy amount");
      }
      if (
        (sortBy === "occurred_on" || sortBy === "created_at") &&
        Number.isNaN(Date.parse(params.cursor))
      ) {
        throw new ValidationError(`cursor invalido para sortBy ${sortBy}`);
      }
    }

    // Ejecutar consulta
    return await this.repository.list({
      ...params,
      page,
      pageSize,
    });
  }
}
