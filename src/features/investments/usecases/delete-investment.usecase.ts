import type { IInvestmentRepository } from '@/entities/investment/repo';

/**
 * Caso de uso: Eliminar inversión
 */
export class DeleteInvestmentUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.investmentRepo.delete(id, userId);
  }
}
