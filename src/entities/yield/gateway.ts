import { YieldRate } from "./model/yield-rate.entity";

export interface IYieldSource {
  fetchLatestRates(): Promise<YieldRate[]>;
}
