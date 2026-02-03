import { IYieldRepository } from "@/entities/yield/repo";
import { IYieldSource } from "@/entities/yield/gateway";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

export class SyncYieldsUseCase {
  constructor(
    private readonly yieldRepo: IYieldRepository,
    private readonly yieldSource: IYieldSource,
  ) {}

  async execute(): Promise<YieldRate[]> {
    try {
      // 1. Fetch external data
      const rates = await this.yieldSource.fetchLatestRates();

      if (rates.length === 0) {
        console.warn("SyncYields: No rates fetched from source.");
        return [];
      }

      // 2. Save to DB
      await this.yieldRepo.saveBatch(rates);

      return rates;
    } catch (error) {
      console.error("SyncYields Failed:", error);
      throw error;
    }
  }
}
