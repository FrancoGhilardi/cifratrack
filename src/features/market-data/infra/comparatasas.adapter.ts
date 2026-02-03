import { IYieldSource } from "@/entities/yield/gateway";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";
import { getProviderName } from "../config/providers";

// Map keys from ArgentinaDatos API to our internal provider IDs
const ARGENTINA_DATOS_MAP: Record<string, string> = {
  fiwind: "fiwind",
  belo: "belo",
  lemoncash: "lemon",
  letsbit: "letsbit",
  astropay: "astropay",
  buenbit: "buenbit", // if we want to support it
};

export class ComparaTasasAdapter implements IYieldSource {
  // Using ArgentinaDatos API as a reliable source for crypto wallets
  private readonly INFO_URL =
    "https://api.argentinadatos.com/v1/finanzas/rendimientos";

  async fetchLatestRates(): Promise<YieldRate[]> {
    try {
      const response = await fetch(this.INFO_URL, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "CifraTrack/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch from ArgentinaDatos: ${response.status}`,
        );
      }

      const data = await response.json();
      return this.parseArgentinaDatos(data);
    } catch (error) {
      console.error("Adapter Error:", error);
      return [];
    }
  }

  private parseArgentinaDatos(data: any[]): YieldRate[] {
    const rates: YieldRate[] = [];
    const today = new Date();

    for (const item of data) {
      const providerId = ARGENTINA_DATOS_MAP[item.entidad];
      if (!providerId) continue;

      // Find yield for ARS
      const arsYield = item.rendimientos.find((r: any) => r.moneda === "ARS");
      if (arsYield) {
        rates.push(
          new YieldRate(
            crypto.randomUUID(),
            providerId,
            getProviderName(providerId),
            "ARS",
            parseFloat(arsYield.apy) || 0, // APY is usually close to TNA for daily compounding, or we might need conversion
            today,
          ),
        );
      }
    }

    return rates;
  }
}
