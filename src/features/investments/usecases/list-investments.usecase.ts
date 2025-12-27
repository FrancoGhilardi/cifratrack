import type { IInvestmentRepository, PaginatedInvestments } from '@/entities/investment/repo';
import type { InvestmentQueryParams } from '@/entities/investment/model/investment.schema';

/**
 * Caso de uso: Listar inversiones
 * 
 * Obtiene inversiones paginadas con filtros y ordenamiento
 */
export class ListInvestmentsUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(userId: string, params: InvestmentQueryParams): Promise<PaginatedInvestments> {
    return await this.investmentRepo.list(userId, params);
  }
}
