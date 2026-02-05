import { IYieldRepository } from "@/entities/yield/repo";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

export class GetYieldHistoryUseCase {
  constructor(private readonly yieldRepo: IYieldRepository) {}

  async execute(providerId: string, days: number = 30): Promise<YieldRate[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    const data = await this.yieldRepo.getHistory(providerId, from, to);
    if (data.length === 0) return [];

    return this.fillGaps(data, from, to);
  }

  private fillGaps(data: YieldRate[], from: Date, to: Date): YieldRate[] {
    const filled: YieldRate[] = [];
    const dataMap = new Map(
      data.map((item) => [item.date.toISOString().split("T")[0], item]),
    );

    // Sort data by date just in case
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    let current = new Date(from);
    // Normalize start date to ensure we are comparing dates correctly
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(to);
    endDate.setHours(0, 0, 0, 0);

    // Find the first available rate to use as initial value if the range starts before first data point
    // Or just start filling from the first actual data point available if we prefer not to extrapolate backwards
    // Here we'll start from the first requested day, but if no data, we wait until we find first data point.
    // Actually, user wants history. If we have data on day 5, and requested day 1..5. We can backfill day 1..4 with day 5? No, that's misleading.
    // Better: Start filling from the first actual data point we have in range (or before range if we could query it).
    // Given we only queried `from`...`to`, we can only fill gaps BETWEEN data points or carry forward.

    // Simplified approach: Iterate through the requested range.
    // If data exists for day, use it and update `lastKnown`.
    // If not, use `lastKnown`.
    // If no `lastKnown` yet (start of chart missing), skip until we find one.

    let lastKnown: YieldRate | null = null;

    // To properly carry forward, we ideally need the last rate BEFORE `from`.
    // But we don't have it. So gaps at the start of the chart will remain empty.

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];
      const items = data.filter(
        (d) => d.date.toISOString().split("T")[0] === dateStr,
      );

      // In case multiple records per day (shouldn't happen due to DB unique constraint), take last
      const item = items.length > 0 ? items[items.length - 1] : null;

      if (item) {
        filled.push(item);
        lastKnown = item;
      } else if (lastKnown) {
        // Simple interpolation logic if we have a future point?
        // For now, simpler stick to carry forward but looking ahead could allow linear interpolation.
        // Given we iterate day by day, we don't know the "next" value yet easily without lookahead.
        // Stick to carry forward as it's safe fallback.

        filled.push(
          new YieldRate(
            crypto.randomUUID(), // Virtual ID
            lastKnown.providerId,
            lastKnown.providerName,
            lastKnown.currency,
            lastKnown.rate,
            new Date(current), // Current missing date
          ),
        );
      }

      current.setDate(current.getDate() + 1);
    }

    return filled;
  }
}
