import { NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";
import { TransactionRepository } from "@/features/transactions/repo.impl";
import { UpsertTransactionUseCase } from "@/features/transactions/usecases/upsert-transaction.usecase";
import { DeleteTransactionUseCase } from "@/features/transactions/usecases/delete-transaction.usecase";
import { GetTransactionByIdUseCase } from "@/features/transactions/usecases/get-transaction-by-id.usecase";
import { TransactionMapper } from "@/features/transactions/mappers/transaction.mapper";
import { updateTransactionSchema } from "@/entities/transaction/model/transaction.schema";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import { err, ok } from "@/shared/lib/response";

const repository = new TransactionRepository();
const upsertUseCase = new UpsertTransactionUseCase(repository);
const deleteUseCase = new DeleteTransactionUseCase(repository);
const getByIdUseCase = new GetTransactionByIdUseCase(repository);

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/transactions/[id]
 * Obtener transacción por ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const { id } = await context.params;

    const transaction = await getByIdUseCase.execute(id, session.user.id);
    const dto = TransactionMapper.domainToDTO(transaction);

    return ok(dto);
  } catch (error) {
    console.error("[GET /api/transactions/[id]] Error:", error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    return err(error);
  }
}

/**
 * PUT /api/transactions/[id]
 * Actualizar transacción
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validar con zod
    const validation = updateTransactionSchema.safeParse(body);
    if (!validation.success) {
      return err(
        new ValidationError("Datos inválidos", validation.error.issues)
      );
    }

    const result = await upsertUseCase.update(
      id,
      session.user.id,
      validation.data
    );

    const dto = TransactionMapper.domainToDTO(result);

    return ok(dto);
  } catch (error) {
    console.error("[PUT /api/transactions/[id]] Error:", error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    return err(error);
  }
}

/**
 * DELETE /api/transactions/[id]
 * Eliminar transacción
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const { id } = await context.params;

    await deleteUseCase.execute(id, session.user.id);

    return ok({ success: true });
  } catch (error) {
    console.error("[DELETE /api/transactions/[id]] Error:", error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    return err(error);
  }
}
