import type { YieldRate } from "@/features/market-data/hooks/useLatestYield";
import type { InvestmentDTO } from "../model/investment.dto";

export type LiveRatesMap = Map<string, YieldRate>;

export function buildLiveRatesMap(liveRates?: YieldRate[]): LiveRatesMap {
  const map: LiveRatesMap = new Map();
  for (const rate of liveRates ?? []) {
    map.set(rate.providerId, rate);
  }
  return map;
}

export function formatInvestmentDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function getDisplayMetrics(
  investment: InvestmentDTO,
  liveRatesMap: LiveRatesMap,
) {
  const liveRate = liveRatesMap.get(investment.yieldProviderId ?? "");
  const liveRateValue =
    typeof liveRate?.rate === "number" ? liveRate.rate : null;
  const hasLiveRate = liveRateValue !== null;
  const displayTna = hasLiveRate ? liveRateValue : investment.tna;
  const isLive = hasLiveRate && liveRateValue !== investment.tna;

  let currentYield = investment.yield;
  let currentTotal = investment.total;

  if (hasLiveRate && liveRateValue !== investment.tna && !investment.hasEnded) {
    const start = new Date(investment.startedOn);
    const now = new Date();
    const timeDiff = now.getTime() - start.getTime();
    const daysElapsed = Math.max(
      0,
      Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
    );

    const rate = liveRateValue / 100;
    const dailyRate = rate / 365;

    if (investment.isCompound) {
      currentTotal =
        investment.principal * Math.pow(1 + dailyRate, daysElapsed);
    } else {
      currentTotal = investment.principal * (1 + dailyRate * daysElapsed);
    }
    currentYield = currentTotal - investment.principal;
  }

  return {
    currentYield,
    currentTotal,
    displayTna,
    isLive,
    liveRateDate: liveRate?.date ?? null,
  };
}
