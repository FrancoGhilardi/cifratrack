import { NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";
import { TransactionRepository } from "@/features/transactions/repo.impl";
import { ListTransactionsUseCase } from "@/features/transactions/usecases/list-transactions.usecase";
import { UpsertTransactionUseCase } from "@/features/transactions/usecases/upsert-transaction.usecase";
import { TransactionMapper } from "@/features/transactions/mappers/transaction.mapper";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from "@/entities/transaction/model/transaction.schema";
import { AuthenticationError, ValidationError } from "@/shared/lib/errors";
import { err, ok, okPaginated } from "@/shared/lib/response";
import { ZodError } from "zod";

const repository = new TransactionRepository();
const listUseCase = new ListTransactionsUseCase(repository);
const upsertUseCase = new UpsertTransactionUseCase(repository);

/**
 * GET /api/transactions
 * Listar transacciones con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const { searchParams } = new URL(request.url);

    // Parsear parámetros
    const parsedParams = listTransactionsQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    const result = await listUseCase.execute({
      userId: session.user.id,
      ...parsedParams,
    });

    // Mapear entidades de dominio a DTOs
    const data = TransactionMapper.domainsToDTOs(result.data);

    return okPaginated(data, result.page, result.pageSize, result.total, {
      nextCursor: result.nextCursor,
      nextCursorId: result.nextCursorId,
    });
  } catch (error) {
    console.error("[GET /api/transactions] Error:", error);

    if (error instanceof ZodError) {
      return err(new ValidationError("Parámetros inválidos", error.issues));
    }

    return err(error);
  }
}

/**
 * POST /api/transactions
 * Crear nueva transacción
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const body = await request.json();

    // Validar con zod
    const validation = createTransactionSchema.safeParse(body);
    if (!validation.success) {
      return err(
        new ValidationError("Datos inválidos", validation.error.issues)
      );
    }

    const result = await upsertUseCase.create(session.user.id, validation.data);
    const dto = TransactionMapper.domainToDTO(result);

    return ok(dto, 201);
  } catch (error) {
    console.error("[POST /api/transactions] Error:", error);

    return err(error);
  }
}
