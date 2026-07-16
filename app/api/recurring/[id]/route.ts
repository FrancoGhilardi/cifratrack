import { withApiHandler } from "@/shared/lib/api-handler";
import { ok } from "@/shared/lib/response";
import { RecurringRuleRepository } from "@/features/recurring/repo.impl";
import { UpsertRecurringRuleUseCase } from "@/features/recurring/usecases/upsert-recurring-rule.usecase";
import { DeleteRecurringRuleUseCase } from "@/features/recurring/usecases/delete-recurring-rule.usecase";
import { GetRecurringRuleByIdUseCase } from "@/features/recurring/usecases/get-recurring-rule-by-id.usecase";
import {
  updateRecurringRuleSchema,
  type UpdateRecurringRuleInput,
} from "@/entities/recurring-rule/model/recurring-rule.schema";

const repo = new RecurringRuleRepository();
const upsertRecurringRule = new UpsertRecurringRuleUseCase(repo);
const deleteRecurringRule = new DeleteRecurringRuleUseCase(repo);
const getRecurringRuleById = new GetRecurringRuleByIdUseCase(repo);

export const GET = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    const dto = await getRecurringRuleById.execute(params.id, userId);
    return ok(dto);
  },
});

export const PUT = withApiHandler<
  undefined,
  UpdateRecurringRuleInput,
  { id: string }
>({
  bodySchema: updateRecurringRuleSchema,
  handler: async ({ userId, body, params }) => {
    const updated = await upsertRecurringRule.update(params.id, userId, body);
    const dto = await getRecurringRuleById.execute(updated.id, userId);
    return ok(dto);
  },
});

export const DELETE = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    await deleteRecurringRule.execute(params.id, userId);
    return ok({ message: "Regla recurrente eliminada correctamente" });
  },
});
