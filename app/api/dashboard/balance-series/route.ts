import { withApiHandler } from "@/shared/lib/api-handler";
import { DashboardRepository } from "@/features/dashboard/repo.impl";
import { GetBalanceSeriesUseCase } from "@/features/dashboard/usecases/get-balance-series.usecase";
import { ValidationError } from "@/shared/lib/errors";
import { ok } from "@/shared/lib/response";

const dashboardRepository = new DashboardRepository();
const getBalanceSeriesUseCase = new GetBalanceSeriesUseCase(
  dashboardRepository,
);

/**
 * GET /api/dashboard/balance-series?month=YYYY-MM
 *
 * No genera transacciones recurrentes: de eso ya se encarga
 * `/api/dashboard/summary`, que el cliente pide en paralelo.
 */
export const GET = withApiHandler<string>({
  query: (searchParams) => {
    const month = searchParams.get("month");
    if (!month) {
      throw new ValidationError('El parámetro "month" es requerido');
    }
    return month;
  },
  handler: async ({ userId, query: month }) => {
    const series = await getBalanceSeriesUseCase.execute(userId, month);

    const response = ok(series);
    response.headers.set("Cache-Control", "private, max-age=30");
    return response;
  },
});
