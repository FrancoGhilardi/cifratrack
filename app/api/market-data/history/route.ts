import { NextRequest, NextResponse } from "next/server";
import { GetYieldHistoryUseCase } from "@/features/market-data/usecases/get-yield-history.usecase";
import { SyncYieldsUseCase } from "@/features/market-data/usecases/sync-yields.usecase";
import { YieldRepositoryImpl } from "@/features/market-data/repo.impl";
import { ArgentinaDatosAdapter } from "@/features/market-data/infra/argentinadatos.adapter";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const providerId = searchParams.get("providerId");
  const days = parseInt(searchParams.get("days") || "30");
  const force = searchParams.get("force") === "true";

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }

  try {
    const repo = new YieldRepositoryImpl();
    const useCase = new GetYieldHistoryUseCase(repo);
    let data = await useCase.execute(providerId, days);

    // Check if we need to sync (if last data point is not from today)
    const todayStr = new Date().toISOString().split("T")[0];
    const lastItem = data.length > 0 ? data[data.length - 1] : null;
    const lastDateStr = lastItem
      ? lastItem.date.toISOString().split("T")[0]
      : "";

    if (!lastItem || lastDateStr < todayStr || force) {
      try {
        const source = new ArgentinaDatosAdapter();
        const syncUseCase = new SyncYieldsUseCase(repo, source);
        await syncUseCase.execute();

        // Refresh data after sync
        data = await useCase.execute(providerId, days);
      } catch (syncError) {
        console.error("[YieldHistory] Sync failed:", syncError);
        // Continue with existing data if sync fails
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[YieldHistory] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
