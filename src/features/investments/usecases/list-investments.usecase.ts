import { ListUseCase } from "@/shared/lib/usecases/list.usecase";
import type { PaginatedInvestments } from "@/entities/investment/repo";
import type { InvestmentQueryParams } from "@/entities/investment/model/investment.schema";

/**
 * Caso de uso: Listar inversiones con paginación y filtros (passthrough al repo, sin reglas propias)
 */
export class ListInvestmentsUseCase extends ListUseCase<
  PaginatedInvestments,
  InvestmentQueryParams
> {}
