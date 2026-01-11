import { NextRequest } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { InvestmentRepository } from '@/features/investments/repo.impl';
import { ListInvestmentsUseCase } from '@/features/investments/usecases/list-investments.usecase';
import { UpsertInvestmentUseCase } from '@/features/investments/usecases/upsert-investment.usecase';
import { InvestmentMapper } from '@/features/investments/mappers/investment.mapper';
import { createInvestmentSchema, investmentQuerySchema } from '@/entities/investment/model/investment.schema';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';
import { ZodError } from 'zod';
import { err, ok, okPaginated } from '@/shared/lib/response';

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
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const { searchParams } = new URL(request.url);

    // Parsear y validar parámetros
    const params = investmentQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? searchParams.get('sortDir') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      active: searchParams.get('active') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      cursorId: searchParams.get('cursorId') ?? undefined,
    });

    const result = await listUseCase.execute(session.user.id, params);

    // Mapear a DTOs con rendimiento calculado
    const data = InvestmentMapper.toDTOs(result.data);

    return okPaginated(data, result.page, result.pageSize, result.total, {
      nextCursor: result.nextCursor,
      nextCursorId: result.nextCursorId,
    });
  } catch (error) {
    console.error('[GET /api/investments] Error:', error);

    if (error instanceof ZodError) {
      return err(new ValidationError('Parámetros inválidos', error.issues));
    }

    return err(error);
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
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const body = await request.json();

    // Validar datos
    const data = createInvestmentSchema.parse(body);

    // Crear inversión
    const investment = await upsertUseCase.create(session.user.id, data);

    return ok(InvestmentMapper.toDTO(investment), 201);
  } catch (error) {
    console.error('[POST /api/investments] Error:', error);

    if (error instanceof ZodError) {
      return err(new ValidationError('Datos inválidos', error.issues));
    }

    return err(error);
  }
}
