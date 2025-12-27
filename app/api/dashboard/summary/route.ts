import { NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { DashboardRepository } from '@/features/dashboard/repo.impl';
import { GetDashboardSummaryUseCase } from '@/features/dashboard/usecases/get-dashboard-summary.usecase';
import { ok, err } from '@/shared/lib/response';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';

const dashboardRepository = new DashboardRepository();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(dashboardRepository);

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(err(new AuthenticationError('No autenticado')), { status: 401 });
    }

    // Obtener mes del query param
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        err(new ValidationError('El parámetro "month" es requerido')),
        { status: 400 }
      );
    }

    // Ejecutar caso de uso
    const summary = await getDashboardSummaryUseCase.execute(session.user.id, month);

    return NextResponse.json(ok(summary));
  } catch (error) {
    console.error('[Dashboard Summary Error]', error);

    if (error instanceof Error) {
      return NextResponse.json(err(error), { status: 400 });
    }

    return NextResponse.json(
      err(new Error('Error interno del servidor')),
      { status: 500 }
    );
  }
}
