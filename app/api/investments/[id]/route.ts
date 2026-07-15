import { withApiHandler } from "@/shared/lib/api-handler";
import { InvestmentRepository } from "@/features/investments/repo.impl";
import { UpsertInvestmentUseCase } from "@/features/investments/usecases/upsert-investment.usecase";
import { DeleteInvestmentUseCase } from "@/features/investments/usecases/delete-investment.usecase";
import { GetInvestmentByIdUseCase } from "@/features/investments/usecases/get-investment-by-id.usecase";
import { InvestmentMapper } from "@/features/investments/mappers/investment.mapper";
import {
  updateInvestmentSchema,
  type UpdateInvestmentInput,
} from "@/entities/investment/model/investment.schema";
import { ok } from "@/shared/lib/response";

const repository = new InvestmentRepository();
const upsertUseCase = new UpsertInvestmentUseCase(repository);
const deleteUseCase = new DeleteInvestmentUseCase(repository);
const getByIdUseCase = new GetInvestmentByIdUseCase(repository);

/**
 * GET /api/investments/:id
 * Obtener inversión por ID
 */
export const GET = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    const investment = await getByIdUseCase.execute(params.id, userId);
    return ok(InvestmentMapper.toDTO(investment));
  },
});

/**
 * PUT /api/investments/:id
 * Actualizar inversión
 */
export const PUT = withApiHandler<
  undefined,
  UpdateInvestmentInput,
  { id: string }
>({
  bodySchema: updateInvestmentSchema,
  handler: async ({ userId, body, params }) => {
    const investment = await upsertUseCase.update(params.id, userId, body);
    return ok(InvestmentMapper.toDTO(investment));
  },
});

/**
 * DELETE /api/investments/:id
 * Eliminar inversión
 */
export const DELETE = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    await deleteUseCase.execute(params.id, userId);
    return ok({ success: true });
  },
});
