import { NextRequest, NextResponse } from "next/server";
import { ArgentinaDatosAdapter } from "@/features/market-data/infra/argentinadatos.adapter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");

  try {
    const adapter = new ArgentinaDatosAdapter();
    // This fetches from external API (cached by Next.js fetch config inside adapter)
    const rates = await adapter.fetchLatestRates();

    if (!providerId) {
      return NextResponse.json(rates);
    }

    const match = rates.find((r) => r.providerId === providerId);

    if (!match) {
      return NextResponse.json(
        { error: "Provider data not found in live feed" },
        { status: 404 },
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Live Rate Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live rate" },
      { status: 500 },
    );
  }
}
