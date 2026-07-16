import { withApiHandler } from "@/shared/lib/api-handler";
import { TransactionRepository } from "@/features/transactions/repo.impl";
import { ListTransactionsUseCase } from "@/features/transactions/usecases/list-transactions.usecase";
import { UpsertTransactionUseCase } from "@/features/transactions/usecases/upsert-transaction.usecase";
import { TransactionMapper } from "@/features/transactions/mappers/transaction.mapper";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  type CreateTransactionInput,
  type ListTransactionsQueryParams,
} from "@/entities/transaction/model/transaction.schema";
import { ok, okPaginated } from "@/shared/lib/response";

const repository = new TransactionRepository();
const listUseCase = new ListTransactionsUseCase(repository);
const upsertUseCase = new UpsertTransactionUseCase(repository);

/**
 * GET /api/transactions
 * Listar transacciones con filtros y paginación
 */
export const GET = withApiHandler<ListTransactionsQueryParams>({
  query: (searchParams) =>
    listTransactionsQuerySchema.parse(Object.fromEntries(searchParams)),
  handler: async ({ userId, query }) => {
    const result = await listUseCase.execute({ userId, ...query });
    const data = TransactionMapper.domainsToDTOs(result.data);
    return okPaginated(data, result.page, result.pageSize, result.total, {
      nextCursor: result.nextCursor,
      nextCursorId: result.nextCursorId,
    });
  },
});

/**
 * POST /api/transactions
 * Crear nueva transacción
 */
export const POST = withApiHandler<undefined, CreateTransactionInput>({
  bodySchema: createTransactionSchema,
  handler: async ({ userId, body }) => {
    const result = await upsertUseCase.create(userId, body);
    const dto = TransactionMapper.domainToDTO(result);
    return ok(dto, 201);
  },
});
