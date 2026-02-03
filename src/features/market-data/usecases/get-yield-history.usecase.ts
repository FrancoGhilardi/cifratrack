import { IYieldRepository } from "@/entities/yield/repo";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

export class GetYieldHistoryUseCase {
  constructor(private readonly yieldRepo: IYieldRepository) {}

  async execute(providerId: string, days: number = 30): Promise<YieldRate[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    return this.yieldRepo.getHistory(providerId, from, to);
  }
}
