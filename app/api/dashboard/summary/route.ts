import { auth } from '@/shared/lib/auth';
import { DashboardRepository } from '@/features/dashboard/repo.impl';
import { GetDashboardSummaryUseCase } from '@/features/dashboard/usecases/get-dashboard-summary.usecase';
import { ok, err } from '@/shared/lib/response';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';
import { RecurringRuleRepository } from '@/features/recurring/repo.impl';
import { GenerateMonthlyRecurringTransactionsUseCase } from '@/features/recurring/usecases/generate-monthly-recurring-transactions.usecase';

const dashboardRepository = new DashboardRepository();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(dashboardRepository);
const recurringRepository = new RecurringRuleRepository();
const generateMonthlyRecurringTransactionsUseCase = new GenerateMonthlyRecurringTransactionsUseCase(recurringRepository);

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    // Obtener mes del query param
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return err(new ValidationError('El parámetro "month" es requerido'), 400);
    }

    // Generar transacciones recurrentes del mes (idempotente)
    await generateMonthlyRecurringTransactionsUseCase.execute({
      userId: session.user.id,
      month,
    });

    // Ejecutar caso de uso
    const summary = await getDashboardSummaryUseCase.execute(session.user.id, month);

    return ok(summary);
  } catch (error) {
    console.error('[Dashboard Summary Error]', error);

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
