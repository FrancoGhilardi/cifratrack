import { auth } from '@/shared/lib/auth';
import { err, ok } from '@/shared/lib/response';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';
import { createRecurringRuleSchema } from '@/entities/recurring-rule/model/recurring-rule.schema';
import { RecurringRuleRepository } from '@/features/recurring/repo.impl';
import { ListRecurringRulesUseCase } from '@/features/recurring/usecases/list-recurring-rules.usecase';
import { UpsertRecurringRuleUseCase } from '@/features/recurring/usecases/upsert-recurring-rule.usecase';
import { RecurringRuleMapper } from '@/features/recurring/mappers/recurring-rule.mapper';

const repo = new RecurringRuleRepository();
const listRecurringRules = new ListRecurringRulesUseCase(repo);
const upsertRecurringRule = new UpsertRecurringRuleUseCase(repo);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const rules = await listRecurringRules.execute(session.user.id);
    const categoriesByRule: Record<string, Awaited<ReturnType<typeof repo.findCategories>>> = {};

    for (const rule of rules) {
      categoriesByRule[rule.id] = await repo.findCategories(rule.id);
    }

    const dtos = RecurringRuleMapper.toDTOs(rules, categoriesByRule);
    return ok(dtos);
  } catch (error) {
    console.error('[Recurring Rules List Error]', error);

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const body = await request.json();
    const validated = createRecurringRuleSchema.parse(body);

    const rule = await upsertRecurringRule.create(session.user.id, validated);
    const categories = await repo.findCategories(rule.id);

    return ok(RecurringRuleMapper.toDTO(rule, categories), 201);
  } catch (error) {
    console.error('[Recurring Rule Create Error]', error);

    if (error instanceof ValidationError) {
      return err(error, 400);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
