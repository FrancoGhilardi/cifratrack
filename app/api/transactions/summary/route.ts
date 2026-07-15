import { withApiHandler } from "@/shared/lib/api-handler";
import { TransactionRepository } from "@/features/transactions/repo.impl";
import { GetTransactionsSummaryUseCase } from "@/features/transactions/usecases/get-transactions-summary.usecase";
import { ValidationError } from "@/shared/lib/errors";
import { monthSchema } from "@/shared/lib/validation";
import { ok } from "@/shared/lib/response";

const repository = new TransactionRepository();
const getSummaryUseCase = new GetTransactionsSummaryUseCase(repository);

/**
 * GET /api/transactions/summary
 * Resumen de egresos pagados/pendientes por mes
 */
export const GET = withApiHandler<string>({
  query: (searchParams) => {
    const monthParam = searchParams.get("month");
    if (!monthParam) {
      throw new ValidationError('El parametro "month" es requerido');
    }
    const parsed = monthSchema.safeParse(monthParam);
    if (!parsed.success) {
      throw new ValidationError(
        'Parametro "month" invalido',
        parsed.error.issues,
      );
    }
    return parsed.data;
  },
  handler: async ({ userId, query: month }) => {
    const summary = await getSummaryUseCase.execute(userId, month);
    const response = ok(summary);
    response.headers.set("Cache-Control", "private, max-age=30");
    return response;
  },
});
