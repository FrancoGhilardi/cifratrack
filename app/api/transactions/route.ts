import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { TransactionRepository } from '@/features/transactions/repo.impl';
import { ListTransactionsUseCase } from '@/features/transactions/usecases/list-transactions.usecase';
import { UpsertTransactionUseCase } from '@/features/transactions/usecases/upsert-transaction.usecase';
import { TransactionMapper } from '@/features/transactions/mappers/transaction.mapper';
import { createTransactionSchema } from '@/entities/transaction/model/transaction.schema';
import { AppError } from '@/shared/lib/errors';
import { getFriendlyErrorMessage } from '@/shared/lib/utils/error-messages';

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
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parsear parámetros
    const params = {
      userId: session.user.id,
      month: searchParams.get('month') ?? undefined,
      kind: (searchParams.get('kind') as 'income' | 'expense' | undefined) ?? undefined,
      status: (searchParams.get('status') as 'pending' | 'paid' | undefined) ?? undefined,
      paymentMethodId: searchParams.get('paymentMethodId') ?? undefined,
      categoryIds: searchParams.get('categoryIds')?.split(',').filter(Boolean) ?? undefined,
      q: searchParams.get('q') ?? undefined,
      sortBy: (searchParams.get('sortBy') as 'occurred_on' | 'amount' | 'title' | 'created_at' | undefined) ?? 'occurred_on',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) ?? 'desc',
      page: parseInt(searchParams.get('page') ?? '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') ?? '20', 10),
    };

    const result = await listUseCase.execute(params);

    // Mapear entidades de dominio a DTOs
    const data = TransactionMapper.domainsToDTOs(result.data);

    return NextResponse.json({
      data,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('[GET /api/transactions] Error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error al listar transacciones' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar con zod
    const validation = createTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await upsertUseCase.create(session.user.id, validation.data);
    const dto = TransactionMapper.domainToDTO(result);

    return NextResponse.json({ data: dto }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/transactions] Error:', error);

    const message = getFriendlyErrorMessage(error instanceof Error ? error : null);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
