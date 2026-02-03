import { NextRequest, NextResponse } from "next/server";
import { GetYieldHistoryUseCase } from "@/features/market-data/usecases/get-yield-history.usecase";
import { YieldRepositoryImpl } from "@/features/market-data/repo.impl";

const makeHistoryUseCase = () => {
  const repo = new YieldRepositoryImpl();
  return new GetYieldHistoryUseCase(repo);
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const providerId = searchParams.get("providerId");
  const days = parseInt(searchParams.get("days") || "30");

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }

  try {
    const useCase = makeHistoryUseCase();
    const data = await useCase.execute(providerId, days);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
