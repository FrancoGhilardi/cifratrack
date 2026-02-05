import { NextResponse } from "next/server";
import { ListProvidersUseCase } from "@/features/market-data/usecases/list-providers.usecase";
import { YieldRepositoryImpl } from "@/features/market-data/repo.impl";

export async function GET() {
  try {
    const repo = new YieldRepositoryImpl();
    const useCase = new ListProvidersUseCase(repo);

    const providers = await useCase.execute();

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Error listing providers:", error);
    return NextResponse.json(
      { error: "Failed to list providers" },
      { status: 500 },
    );
  }
}
