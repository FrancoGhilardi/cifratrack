import { withApiHandler } from "@/shared/lib/api-handler";
import { ok } from "@/shared/lib/response";
import {
  createRecurringRuleSchema,
  type CreateRecurringRuleInput,
} from "@/entities/recurring-rule/model/recurring-rule.schema";
import { RecurringRuleRepository } from "@/features/recurring/repo.impl";
import { ListRecurringRulesUseCase } from "@/features/recurring/usecases/list-recurring-rules.usecase";
import { UpsertRecurringRuleUseCase } from "@/features/recurring/usecases/upsert-recurring-rule.usecase";
import { GetRecurringRuleByIdUseCase } from "@/features/recurring/usecases/get-recurring-rule-by-id.usecase";

const repo = new RecurringRuleRepository();
const listRecurringRules = new ListRecurringRulesUseCase(repo);
const upsertRecurringRule = new UpsertRecurringRuleUseCase(repo);
const getRecurringRuleById = new GetRecurringRuleByIdUseCase(repo);

export const GET = withApiHandler({
  handler: async ({ userId }) => {
    const dtos = await listRecurringRules.execute(userId);
    return ok(dtos);
  },
});

export const POST = withApiHandler<undefined, CreateRecurringRuleInput>({
  bodySchema: createRecurringRuleSchema,
  handler: async ({ userId, body }) => {
    const rule = await upsertRecurringRule.create(userId, body);
    const dto = await getRecurringRuleById.execute(rule.id, userId);
    return ok(dto, 201);
  },
});
