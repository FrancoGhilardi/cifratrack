import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface LiveYieldRate {
  providerId: string;
  providerName: string;
  rate: number;
  currency: string;
  date: Date;
}

/**
 * Función auxiliar para obtener tasas en vivo desde API externa
 * Reemplaza el adapter eliminado, llamando directamente a la API
 */
async function fetchLiveRatesFromExternalAPI(): Promise<LiveYieldRate[]> {
  try {
    // Llamada directa a la API de Argentina Datos
    const response = await fetch(
      "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo",
      {
        next: { revalidate: 300 }, // Cache por 5 minutos
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from external API");
    }

    const data = await response.json();

    // Mapeo simple de la respuesta
    const rates: LiveYieldRate[] = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const item of data) {
      if (!item.entidad || typeof item.tna !== "number") continue;

      // Normalizar ID del proveedor
      const providerId = normalizeProviderId(item.entidad);
      if (!providerId) continue;

      rates.push({
        providerId,
        providerName: item.entidad,
        rate: item.tna,
        currency: "ARS",
        date: today,
      });
    }

    return rates;
  } catch (error) {
    console.error("Error fetching live rates:", error);
    return [];
  }
}

/**
 * Normaliza el nombre de la entidad a un providerId
 */
function normalizeProviderId(entidad: string): string | null {
  const normalized = entidad.toLowerCase().trim();

  // Mapeo de nombres de entidades a providerIds
  const mapping: Record<string, string> = {
    "mercado pago": "mercadopago",
    mercadopago: "mercadopago",
    ualá: "uala",
    uala: "uala",
    "personal pay": "personal_pay",
    "naranja x": "naranja_x",
    prex: "prex",
    fiwind: "fiwind",
    letsbit: "letsbit",
    "carrefour banco": "carrefour_banco",
    belo: "belo",
    "lemon cash": "lemon",
    lemon: "lemon",
    astropay: "astropay",
    "claro pay": "claro_pay",
    supervielle: "supervielle",
    galicia: "galicia",
    macro: "macro",
    santander: "santander",
    icbc: "icbc",
    "banco nación": "bna",
    bna: "bna",
    cocos: "cocos",
    iol: "iol",
    "invertir online": "iol",
    balanz: "balanz",
  };

  return mapping[normalized] || null;
}

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");

  try {
    const rates = await fetchLiveRatesFromExternalAPI();

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
