import type { IInvestmentRepository } from "@/entities/investment/repo";
import type { Investment } from "@/entities/investment/model/investment.entity";
import { NotFoundError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener inversion por ID
 */
export class GetInvestmentByIdUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(id: string, userId: string): Promise<Investment> {
    const investment = await this.investmentRepo.findById(id, userId);
    if (!investment) {
      throw new NotFoundError("Inversion", id);
    }

    return investment;
  }
}
