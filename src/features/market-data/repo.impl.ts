import { db } from "@/shared/db/client";
import { yieldRates } from "@/shared/db/schema";
import { IYieldRepository } from "@/entities/yield/repo";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";

import { getProviderName } from "./config/providers";

export class YieldRepositoryImpl implements IYieldRepository {
  async saveBatch(yields: YieldRate[]): Promise<void> {
    if (yields.length === 0) return;

    await db.transaction(async (tx) => {
      for (const item of yields) {
        await tx
          .insert(yieldRates)
          .values({
            providerId: item.providerId,
            rate: item.rate.toString(),
            currency: item.currency,
            date: item.date.toISOString().split("T")[0],
          })
          .onConflictDoUpdate({
            target: [yieldRates.providerId, yieldRates.date],
            set: {
              rate: item.rate.toString(),
              currency: item.currency,
            },
          });
      }
    });
  }

  async getHistory(
    providerId: string,
    from: Date,
    to: Date,
  ): Promise<YieldRate[]> {
    const rows = await db
      .select()
      .from(yieldRates)
      .where(
        and(
          eq(yieldRates.providerId, providerId),
          gte(yieldRates.date, from.toISOString().split("T")[0]),
          lte(yieldRates.date, to.toISOString().split("T")[0]),
        ),
      )
      .orderBy(yieldRates.date);

    return rows.map(this.mapToEntity);
  }

  async getLatest(providerId: string): Promise<YieldRate | null> {
    const rows = await db
      .select()
      .from(yieldRates)
      .where(eq(yieldRates.providerId, providerId))
      .orderBy(desc(yieldRates.date))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToEntity(rows[0]);
  }

  async getLatestForProviders(providerIds: string[]): Promise<YieldRate[]> {
    if (providerIds.length === 0) return [];

    const rows = await db
      .selectDistinctOn([yieldRates.providerId])
      .from(yieldRates)
      .where(inArray(yieldRates.providerId, providerIds))
      .orderBy(yieldRates.providerId, desc(yieldRates.date));

    return rows.map(this.mapToEntity);
  }

  async listProviders(): Promise<{ id: string; name: string }[]> {
    const rows = await db
      .selectDistinct({ providerId: yieldRates.providerId })
      .from(yieldRates);

    return rows
      .map((r) => ({
        id: r.providerId,
        name: getProviderName(r.providerId),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private mapToEntity(row: typeof yieldRates.$inferSelect): YieldRate {
    return new YieldRate(
      row.id,
      row.providerId,
      getProviderName(row.providerId),
      row.currency,
      parseFloat(row.rate),
      new Date(row.date),
    );
  }
}
