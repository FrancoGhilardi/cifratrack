import { withApiHandler } from "@/shared/lib/api-handler";
import { TransactionRepository } from "@/features/transactions/repo.impl";
import { UpsertTransactionUseCase } from "@/features/transactions/usecases/upsert-transaction.usecase";
import { DeleteTransactionUseCase } from "@/features/transactions/usecases/delete-transaction.usecase";
import { GetTransactionByIdUseCase } from "@/features/transactions/usecases/get-transaction-by-id.usecase";
import { TransactionMapper } from "@/features/transactions/mappers/transaction.mapper";
import {
  updateTransactionSchema,
  type UpdateTransactionInput,
} from "@/entities/transaction/model/transaction.schema";
import { ok } from "@/shared/lib/response";

const repository = new TransactionRepository();
const upsertUseCase = new UpsertTransactionUseCase(repository);
const deleteUseCase = new DeleteTransactionUseCase(repository);
const getByIdUseCase = new GetTransactionByIdUseCase(repository);

/**
 * GET /api/transactions/[id]
 * Obtener transacción por ID
 */
export const GET = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    const transaction = await getByIdUseCase.execute(params.id, userId);
    const dto = TransactionMapper.domainToDTO(transaction);
    return ok(dto);
  },
});

/**
 * PUT /api/transactions/[id]
 * Actualizar transacción
 */
export const PUT = withApiHandler<
  undefined,
  UpdateTransactionInput,
  { id: string }
>({
  bodySchema: updateTransactionSchema,
  handler: async ({ userId, body, params }) => {
    const result = await upsertUseCase.update(params.id, userId, body);
    const dto = TransactionMapper.domainToDTO(result);
    return ok(dto);
  },
});

/**
 * DELETE /api/transactions/[id]
 * Eliminar transacción
 */
export const DELETE = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    await deleteUseCase.execute(params.id, userId);
    return ok({ success: true });
  },
});
