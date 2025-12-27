import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { InvestmentRepository } from '@/features/investments/repo.impl';
import { ListInvestmentsUseCase } from '@/features/investments/usecases/list-investments.usecase';
import { UpsertInvestmentUseCase } from '@/features/investments/usecases/upsert-investment.usecase';
import { InvestmentMapper } from '@/features/investments/mappers/investment.mapper';
import { createInvestmentSchema, investmentQuerySchema } from '@/entities/investment/model/investment.schema';
import { AppError } from '@/shared/lib/errors';
import { ZodError } from 'zod';

const repository = new InvestmentRepository();
const listUseCase = new ListInvestmentsUseCase(repository);
const upsertUseCase = new UpsertInvestmentUseCase(repository);

/**
 * GET /api/investments
 * Listar inversiones con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parsear y validar parámetros
    const params = investmentQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortDir: searchParams.get('sortDir') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      active: searchParams.get('active') ?? undefined,
    });

    const result = await listUseCase.execute(session.user.id, params);

    // Mapear a DTOs con rendimiento calculado
    const data = InvestmentMapper.toDTOs(result.data);

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
    console.error('[GET /api/investments] Error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.issues },
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
      { error: 'Error al listar inversiones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/investments
 * Crear nueva inversión
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const data = createInvestmentSchema.parse(body);

    // Crear inversión
    const investment = await upsertUseCase.create(session.user.id, data);

    return NextResponse.json(
      { data: InvestmentMapper.toDTO(investment) },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/investments] Error:', error);

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
      { error: 'Error al crear inversión' },
      { status: 500 }
    );
  }
}
