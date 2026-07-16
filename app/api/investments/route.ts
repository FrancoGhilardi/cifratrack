import { withApiHandler } from "@/shared/lib/api-handler";
import { InvestmentRepository } from "@/features/investments/repo.impl";
import { ListInvestmentsUseCase } from "@/features/investments/usecases/list-investments.usecase";
import { UpsertInvestmentUseCase } from "@/features/investments/usecases/upsert-investment.usecase";
import { InvestmentMapper } from "@/features/investments/mappers/investment.mapper";
import {
  createInvestmentSchema,
  investmentQuerySchema,
  type CreateInvestmentInput,
  type InvestmentQueryParams,
} from "@/entities/investment/model/investment.schema";
import { okPaginated, ok } from "@/shared/lib/response";

const repository = new InvestmentRepository();
const listUseCase = new ListInvestmentsUseCase(repository);
const upsertUseCase = new UpsertInvestmentUseCase(repository);

/**
 * GET /api/investments
 * Listar inversiones con filtros y paginación
 */
export const GET = withApiHandler<InvestmentQueryParams>({
  query: (searchParams) =>
    investmentQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder:
        searchParams.get("sortOrder") ??
        searchParams.get("sortDir") ??
        undefined,
      q: searchParams.get("q") ?? undefined,
      active: searchParams.get("active") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      cursorId: searchParams.get("cursorId") ?? undefined,
    }),
  handler: async ({ userId, query }) => {
    const result = await listUseCase.execute(userId, query);
    const data = InvestmentMapper.toDTOs(result.data);
    return okPaginated(data, result.page, result.pageSize, result.total, {
      nextCursor: result.nextCursor,
      nextCursorId: result.nextCursorId,
    });
  },
});

/**
 * POST /api/investments
 * Crear nueva inversión
 */
export const POST = withApiHandler<undefined, CreateInvestmentInput>({
  bodySchema: createInvestmentSchema,
  handler: async ({ userId, body }) => {
    const investment = await upsertUseCase.create(userId, body);
    return ok(InvestmentMapper.toDTO(investment), 201);
  },
});
