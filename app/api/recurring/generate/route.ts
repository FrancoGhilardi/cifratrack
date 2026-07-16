import { withApiHandler } from "@/shared/lib/api-handler";
import { ok } from "@/shared/lib/response";
import { ValidationError } from "@/shared/lib/errors";
import { monthSchema } from "@/shared/lib/validation";
import { GenerateMonthlyRecurringTransactionsUseCase } from "@/features/recurring/usecases/generate-monthly-recurring-transactions.usecase";
import { RecurringRuleRepository } from "@/features/recurring/repo.impl";

const repo = new RecurringRuleRepository();
const generateMonthly = new GenerateMonthlyRecurringTransactionsUseCase(repo);

export const POST = withApiHandler<string>({
  query: (searchParams) => {
    const monthParam = searchParams.get("month");
    if (!monthParam) {
      throw new ValidationError("El parámetro month es requerido");
    }
    return monthSchema.parse(monthParam);
  },
  handler: async ({ userId, query: month }) => {
    await generateMonthly.execute({ userId, month });
    return ok({ message: "Transacciones recurrentes generadas correctamente" });
  },
});
