import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { InvestmentRepository } from '@/features/investments/repo.impl';
import { UpsertInvestmentUseCase } from '@/features/investments/usecases/upsert-investment.usecase';
import { DeleteInvestmentUseCase } from '@/features/investments/usecases/delete-investment.usecase';
import { InvestmentMapper } from '@/features/investments/mappers/investment.mapper';
import { updateInvestmentSchema } from '@/entities/investment/model/investment.schema';
import { AppError } from '@/shared/lib/errors';
import { ZodError } from 'zod';

const repository = new InvestmentRepository();
const upsertUseCase = new UpsertInvestmentUseCase(repository);
const deleteUseCase = new DeleteInvestmentUseCase(repository);

/**
 * GET /api/investments/:id
 * Obtener inversión por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const investment = await repository.findById(id, session.user.id);

    if (!investment) {
      return NextResponse.json(
        { error: 'Inversión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: InvestmentMapper.toDTO(investment),
    });
  } catch (error) {
    console.error('[GET /api/investments/:id] Error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error al obtener inversión' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/investments/:id
 * Actualizar inversión
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const data = updateInvestmentSchema.parse(body);

    // Actualizar
    const investment = await upsertUseCase.update(id, session.user.id, data);

    return NextResponse.json({
      data: InvestmentMapper.toDTO(investment),
    });
  } catch (error) {
    console.error('[PUT /api/investments/:id] Error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar inversión' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/investments/:id
 * Eliminar inversión
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await deleteUseCase.execute(id, session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/investments/:id] Error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar inversión' },
      { status: 500 }
    );
  }
}
