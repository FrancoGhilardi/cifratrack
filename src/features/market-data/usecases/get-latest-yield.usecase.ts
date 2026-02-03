import { IYieldRepository } from "@/entities/yield/repo";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

export class GetLatestYieldUseCase {
  constructor(private readonly yieldRepo: IYieldRepository) {}

  async execute(providerId: string): Promise<YieldRate | null> {
    return this.yieldRepo.getLatest(providerId);
  }
}
