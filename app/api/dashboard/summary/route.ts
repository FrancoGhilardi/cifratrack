import { withApiHandler } from "@/shared/lib/api-handler";
import { DashboardRepository } from "@/features/dashboard/repo.impl";
import { GetDashboardSummaryUseCase } from "@/features/dashboard/usecases/get-dashboard-summary.usecase";
import { ValidationError } from "@/shared/lib/errors";
import { RecurringRuleRepository } from "@/features/recurring/repo.impl";
import { GenerateMonthlyRecurringTransactionsUseCase } from "@/features/recurring/usecases/generate-monthly-recurring-transactions.usecase";
import { ok } from "@/shared/lib/response";

const dashboardRepository = new DashboardRepository();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(
  dashboardRepository,
);
const recurringRepository = new RecurringRuleRepository();
const generateMonthlyRecurringTransactionsUseCase =
  new GenerateMonthlyRecurringTransactionsUseCase(recurringRepository);

export const GET = withApiHandler<string>({
  query: (searchParams) => {
    const month = searchParams.get("month");
    if (!month) {
      throw new ValidationError('El parámetro "month" es requerido');
    }
    return month;
  },
  handler: async ({ userId, query: month }) => {
    // Generar transacciones recurrentes del mes (idempotente)
    await generateMonthlyRecurringTransactionsUseCase.execute({
      userId,
      month,
    });

    const summary = await getDashboardSummaryUseCase.execute(userId, month);

    const response = ok(summary);
    response.headers.set("Cache-Control", "private, max-age=30");
    return response;
  },
});
