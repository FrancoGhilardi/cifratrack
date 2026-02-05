import { NextResponse } from "next/server";
import { SyncYieldsUseCase } from "@/features/market-data/usecases/sync-yields.usecase";
import { UpdateInvestmentsWithMarketRatesUseCase } from "@/features/investments/usecases/update-investments-rates.usecase";
import { YieldRepositoryImpl } from "@/features/market-data/repo.impl";
import { InvestmentRepository } from "@/features/investments/repo.impl";
import { ArgentinaDatosAdapter } from "@/features/market-data/infra/argentinadatos.adapter";

// simple factory (in real app use dependency injection container)
const makeUseCases = () => {
  const yieldRepo = new YieldRepositoryImpl();
  const investmentRepo = new InvestmentRepository();
  const source = new ArgentinaDatosAdapter();

  const syncUseCase = new SyncYieldsUseCase(yieldRepo, source);
  const updateInvestmentsUseCase = new UpdateInvestmentsWithMarketRatesUseCase(
    investmentRepo,
  );

  return { syncUseCase, updateInvestmentsUseCase };
};

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { syncUseCase, updateInvestmentsUseCase } = makeUseCases();

    // 1. Sync market rates
    const result = await syncUseCase.execute();

    // 2. Update active investments with new rates (only use the latest rate per provider)
    if (result.length > 0) {
      const latestRatesMap = new Map();
      for (const rate of result) {
        // Ensure rate is valid number
        if (typeof rate.rate !== "number" || isNaN(rate.rate)) continue;

        const existing = latestRatesMap.get(rate.providerId);
        if (!existing || rate.date > existing.date) {
          latestRatesMap.set(rate.providerId, rate);
        }
      }

      const latestRates = Array.from(latestRatesMap.values()) as any[];

      // Filter safe rates for investments table (CHECK constraint: tna <= 999.99)
      const safeRates = latestRates.filter(
        (r) => r.rate >= 0 && r.rate <= 999.99,
      );

      await updateInvestmentsUseCase.execute(safeRates);
    }

    return NextResponse.json({
      success: true,
      count: result.length,
      data: result,
      investmentsUpdated: true,
    });
  } catch (error: any) {
    console.error("Cron Error details:", error?.message || error);
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error?.message,
      },
      { status: 500 },
    );
  }
}
