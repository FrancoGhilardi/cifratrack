import { auth } from "@/shared/lib/auth";
import { TransactionRepository } from "@/features/transactions/repo.impl";
import { GetTransactionsSummaryUseCase } from "@/features/transactions/usecases/get-transactions-summary.usecase";
import { AuthenticationError, ValidationError } from "@/shared/lib/errors";
import { monthSchema } from "@/shared/lib/validation";
import { err, ok } from "@/shared/lib/response";

const repository = new TransactionRepository();
const getSummaryUseCase = new GetTransactionsSummaryUseCase(repository);

/**
 * GET /api/transactions/summary
 * Resumen de egresos pagados/pendientes por mes
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    if (!monthParam) {
      return err(new ValidationError('El parametro "month" es requerido'), 400);
    }

    const parsed = monthSchema.safeParse(monthParam);
    if (!parsed.success) {
      return err(
        new ValidationError('Parametro "month" invalido', parsed.error.issues)
      );
    }

    const summary = await getSummaryUseCase.execute(
      session.user.id,
      parsed.data
    );

    return ok(summary);
  } catch (error) {
    console.error("[GET /api/transactions/summary] Error:", error);

    if (error instanceof ValidationError) {
      return err(error, 400);
    }

    return err(error);
  }
}
