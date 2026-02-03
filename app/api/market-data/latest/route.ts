import { NextRequest, NextResponse } from "next/server";
import { GetLatestYieldUseCase } from "@/features/market-data/usecases/get-latest-yield.usecase";
import { SyncYieldsUseCase } from "@/features/market-data/usecases/sync-yields.usecase";
import { YieldRepositoryImpl } from "@/features/market-data/repo.impl";
import { ArgentinaDatosAdapter } from "@/features/market-data/infra/argentinadatos.adapter";

const makeUseCase = () => {
  const repo = new YieldRepositoryImpl();
  return new GetLatestYieldUseCase(repo);
};

const makeSyncUseCase = () => {
  const repo = new YieldRepositoryImpl();
  const source = new ArgentinaDatosAdapter();
  return new SyncYieldsUseCase(repo, source);
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const providerId = searchParams.get("providerId");

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }

  try {
    const useCase = makeUseCase();
    let data = await useCase.execute(providerId);

    // If no data found, try to sync first (lazy load)
    if (!data) {
      console.log(`No data for ${providerId}, triggering on-demand sync...`);
      const syncUseCase = makeSyncUseCase();
      await syncUseCase.execute();

      // Try again after sync
      data = await useCase.execute(providerId);
    }

    // Check again
    if (!data) {
      return NextResponse.json(
        { error: "Provider not found data" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Latest Yield Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest rate" },
      { status: 500 },
    );
  }
}
