import { auth } from '@/shared/lib/auth';
import { err, ok } from '@/shared/lib/response';
import { AuthenticationError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { RecurringRuleRepository } from '@/features/recurring/repo.impl';
import { UpsertRecurringRuleUseCase } from '@/features/recurring/usecases/upsert-recurring-rule.usecase';
import { DeleteRecurringRuleUseCase } from '@/features/recurring/usecases/delete-recurring-rule.usecase';
import { updateRecurringRuleSchema } from '@/entities/recurring-rule/model/recurring-rule.schema';
import { RecurringRuleMapper } from '@/features/recurring/mappers/recurring-rule.mapper';

const repo = new RecurringRuleRepository();
const upsertRecurringRule = new UpsertRecurringRuleUseCase(repo);
const deleteRecurringRule = new DeleteRecurringRuleUseCase(repo);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const rule = await repo.findById(id, session.user.id);
    if (!rule) {
      return err(new NotFoundError('Regla recurrente'), 404);
    }

    const categories = await repo.findCategories(rule.id);
    return ok(RecurringRuleMapper.toDTO(rule, categories));
  } catch (error) {
    console.error('[Recurring Rule Get Error]', error);

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const body = await request.json();
    const validated = updateRecurringRuleSchema.parse(body);

    const updated = await upsertRecurringRule.update(id, session.user.id, validated);
    const categories = await repo.findCategories(updated.id);

    return ok(RecurringRuleMapper.toDTO(updated, categories));
  } catch (error) {
    console.error('[Recurring Rule Update Error]', error);

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return err(error, 400);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    await deleteRecurringRule.execute(id, session.user.id);

    return ok({ message: 'Regla recurrente eliminada correctamente' });
  } catch (error) {
    console.error('[Recurring Rule Delete Error]', error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
