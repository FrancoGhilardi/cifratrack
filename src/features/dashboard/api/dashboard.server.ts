import { auth } from "@/shared/lib/auth";
import { AuthenticationError } from "@/shared/lib/errors";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import { DashboardRepository } from "@/features/dashboard/repo.impl";
import { GetDashboardSummaryUseCase } from "@/features/dashboard/usecases/get-dashboard-summary.usecase";
import { RecurringRuleRepository } from "@/features/recurring/repo.impl";
import { GenerateMonthlyRecurringTransactionsUseCase } from "@/features/recurring/usecases/generate-monthly-recurring-transactions.usecase";

const dashboardRepository = new DashboardRepository();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(
  dashboardRepository,
);
const recurringRepository = new RecurringRuleRepository();
const generateMonthlyRecurringTransactionsUseCase =
  new GenerateMonthlyRecurringTransactionsUseCase(recurringRepository);

/**
 * Fetch del resumen del dashboard para Server Components (prefetch RSC).
 * Llama a los usecases directamente in-process (mismo camino que
 * GET /api/dashboard/summary) en vez de hacer un fetch HTTP a la propia API,
 * que sumaba una vuelta de red completa a cada navegación al dashboard.
 */
export async function getDashboardSummaryServer(
  month: string,
): Promise<DashboardSummaryDTO> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new AuthenticationError();

  await generateMonthlyRecurringTransactionsUseCase.execute({
    userId,
    month,
  });

  return getDashboardSummaryUseCase.execute(userId, month);
}
