import { auth } from '@/shared/lib/auth';
import { err, ok } from '@/shared/lib/response';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';
import { monthSchema } from '@/shared/lib/validation';
import { GenerateMonthlyRecurringTransactionsUseCase } from '@/features/recurring/usecases/generate-monthly-recurring-transactions.usecase';
import { RecurringRuleRepository } from '@/features/recurring/repo.impl';

const repo = new RecurringRuleRepository();
const generateMonthly = new GenerateMonthlyRecurringTransactionsUseCase(repo);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    if (!monthParam) {
      return err(new ValidationError('El parámetro month es requerido'), 400);
    }

    const month = monthSchema.parse(monthParam);
    await generateMonthly.execute({ userId: session.user.id, month });

    return ok({ message: 'Transacciones recurrentes generadas correctamente' });
  } catch (error) {
    console.error('[Recurring Generate Error]', error);

    if (error instanceof ValidationError) {
      return err(error, 400);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
