import { YieldRate } from "./model/yield-rate.entity";

export interface IYieldRepository {
  /**
   * Upsert a batch of yield rates.
   * If a rate exists for the same provider and date, it should be updated.
   */
  saveBatch(yields: YieldRate[]): Promise<void>;

  /**
   * Get historical rates for a specific provider in a date range.
   */
  getHistory(providerId: string, from: Date, to: Date): Promise<YieldRate[]>;

  /**
   * Get the latest rate available for a specific provider.
   */
  getLatest(providerId: string): Promise<YieldRate | null>;

  /**
   * Get the latest rates for a list of providers.
   * Useful when showing a list of investment options.
   */
  getLatestForProviders(providerIds: string[]): Promise<YieldRate[]>;
}
