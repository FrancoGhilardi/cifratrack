import { IInvestmentRepository } from "@/entities/investment/repo";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

export class UpdateInvestmentsWithMarketRatesUseCase {
  constructor(private readonly investmentRepo: IInvestmentRepository) {}

  async execute(rates: YieldRate[]): Promise<void> {
    if (!rates || rates.length === 0) return;

    // Iterate over rates and update investments linked to that provider
    // Using Promise.all to run updates in parallel
    await Promise.all(
      rates.map((rate) =>
        this.investmentRepo.updateRatesByProvider(rate.providerId, rate.rate),
      ),
    );
  }
}
