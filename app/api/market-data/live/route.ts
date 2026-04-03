import { NextRequest, NextResponse } from "next/server";
import { GetLiveYieldsUseCase } from "@/features/market-data/usecases/get-live-yields.usecase";

export const dynamic = "force-dynamic";

const getLiveYieldsUseCase = new GetLiveYieldsUseCase();

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams
    .get("providerId")
    ?.trim()
    .toLowerCase();

  try {
    const result = await getLiveYieldsUseCase.execute(providerId);

    if (providerId && !result) {
      return NextResponse.json(
        { error: "Provider not found in selector catalog" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/market-data/live] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live rate" },
      { status: 500 },
    );
  }
}
