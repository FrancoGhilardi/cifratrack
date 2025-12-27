import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { TransactionRepository } from '@/features/transactions/repo.impl';
import { UpsertTransactionUseCase } from '@/features/transactions/usecases/upsert-transaction.usecase';
import { DeleteTransactionUseCase } from '@/features/transactions/usecases/delete-transaction.usecase';
import { TransactionMapper } from '@/features/transactions/mappers/transaction.mapper';
import { updateTransactionSchema } from '@/entities/transaction/model/transaction.schema';
import { AppError, NotFoundError } from '@/shared/lib/errors';
import { getFriendlyErrorMessage } from '@/shared/lib/utils/error-messages';

const repository = new TransactionRepository();
const upsertUseCase = new UpsertTransactionUseCase(repository);
const deleteUseCase = new DeleteTransactionUseCase(repository);

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
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await context.params;

    const transaction = await repository.findById(id, session.user.id);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    const dto = TransactionMapper.domainToDTO(transaction);

    return NextResponse.json({ data: dto });
  } catch (error) {
    console.error('[GET /api/transactions/[id]] Error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error al obtener transacción' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/transactions/[id]
 * Actualizar transacción
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  console.log('[PUT /api/transactions/[id]] Request received');
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validar con zod
    const validation = updateTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await upsertUseCase.update(id, session.user.id, validation.data);
    console.log('Update result received in route');
    
    if (result && result.transaction) {
      console.log('Transaction object keys:', Object.keys(result.transaction));
      console.log('occurredOn type:', typeof result.transaction.occurredOn);
      console.log('occurredOn constructor:', result.transaction.occurredOn?.constructor?.name);
    }

    const dto = TransactionMapper.domainToDTO(result);

    return NextResponse.json({ data: dto });
  } catch (error) {
    console.error('[PUT /api/transactions/[id]] Error:', error);

    const message = getFriendlyErrorMessage(error instanceof Error ? error : null);

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

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

/**
 * DELETE /api/transactions/[id]
 * Eliminar transacción
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await context.params;

    await deleteUseCase.execute(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/transactions/[id]] Error:', error);

    const message = getFriendlyErrorMessage(error instanceof Error ? error : null);

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

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
