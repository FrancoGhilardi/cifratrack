import type { IInvestmentRepository } from "@/entities/investment/repo";
import type { Investment } from "@/entities/investment/model/investment.entity";
import { GetByIdUseCase } from "@/shared/lib/usecases/get-by-id.usecase";

/**
 * Caso de uso: Obtener inversion por ID (passthrough al repo, sin reglas propias)
 */
export class GetInvestmentByIdUseCase extends GetByIdUseCase<Investment> {
  constructor(investmentRepo: IInvestmentRepository) {
    super(investmentRepo, "Inversion");
  }
}
