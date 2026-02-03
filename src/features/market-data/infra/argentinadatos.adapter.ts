import { IYieldSource } from "@/entities/yield/gateway";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";
import { getProviderName } from "../config/providers";

// Map keys from ArgentinaDatos API to our internal provider IDs
const ARGENTINA_DATOS_MAP: Record<string, string> = {
  fiwind: "fiwind",
  belo: "belo",
  letsbit: "letsbit",
  buenbit: "buenbit",
};

// Map internal provider IDs to FCI names in ArgentinaDatos
const FCI_MAP: Record<string, string> = {
  mercadopago: "Mercado Fondo - Clase A",
  uala: "Ualintec Ahorro Pesos - Clase A",
  personal_pay: "Delta Pesos - Clase A",
  prex: "Allaria Ahorro - Clase E",
  galicia: "Fima Premium - Clase A",
  santander: "Super Ahorro $ - Clase A",
  macro: "Pionero Pesos - Clase A",
  icbc: "Alpha Pesos - Clase A",
  balanz: "Balanz Capital Money Market - Clase A",
  cocos: "Cocos Ahorro - Clase A",
  claro_pay: "SBS Ahorro Pesos - Clase A",
  supervielle: "Premier Renta CP en Pesos - Clase A",
  bna: "Pellegrini Renta Pesos - Clase A",
  iol: "Adcap Ahorro Pesos Fondo de Dinero - Clase A",
  lemon: "Fima Premium - Clase P",
  astropay: "ST Zero - Clase D",
};

// Map provider IDs for "Other" accounts (money market equivalents/remunerated accounts)
const OTROS_MAP: Record<string, string> = {
  naranja_x: "NARANJA X",
  carrefour_banco: "CARREFOUR BANCO",
};

export class ArgentinaDatosAdapter implements IYieldSource {
  private readonly RENDIMIENTOS_URL =
    "https://api.argentinadatos.com/v1/finanzas/rendimientos";
  private readonly FCI_LATEST_URL =
    "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo";
  private readonly FCI_PREV_URL =
    "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/penultimo";
  private readonly OTROS_URL =
    "https://api.argentinadatos.com/v1/finanzas/fci/otros/ultimo";

  async fetchLatestRates(): Promise<YieldRate[]> {
    try {
      const [rendimientosRes, fciLatestRes, fciPrevRes, otrosRes] =
        await Promise.all([
          this.fetchJson(this.RENDIMIENTOS_URL),
          this.fetchJson(this.FCI_LATEST_URL),
          this.fetchJson(this.FCI_PREV_URL),
          this.fetchJson(this.OTROS_URL),
        ]);

      const cryptoRates = this.parseCryptoYields(rendimientosRes);
      const fciRates = this.parseFciYields(fciLatestRes, fciPrevRes);
      const otherRates = this.parseOtherYields(otrosRes);

      return [...cryptoRates, ...fciRates, ...otherRates];
    } catch (error) {
      console.error("Adapter Error:", error);
      return [];
    }
  }

  private async fetchJson(url: string) {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "CifraTrack/1.0" },
    });
    if (!response.ok)
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return response.json();
  }

  private parseCryptoYields(data: any[]): YieldRate[] {
    const rates: YieldRate[] = [];

    if (!Array.isArray(data)) return [];

    for (const item of data) {
      if (!item.entidad) continue;
      const providerId = ARGENTINA_DATOS_MAP[item.entidad];
      if (!providerId) continue;

      const arsYield = item.rendimientos.find((r: any) => r.moneda === "ARS");
      if (arsYield) {
        // Use data date if available, otherwise fallback to execution date
        const date = arsYield.fecha ? new Date(arsYield.fecha) : new Date();

        rates.push(
          new YieldRate(
            crypto.randomUUID(),
            providerId,
            getProviderName(providerId),
            "ARS",
            parseFloat(arsYield.apy) || 0,
            date,
          ),
        );
      }
    }
    return rates;
  }

  private parseOtherYields(data: any[]): YieldRate[] {
    const rates: YieldRate[] = [];

    if (!Array.isArray(data)) return [];

    // Reverse map for lookup
    const nameToId: Record<string, string> = {};
    for (const [key, val] of Object.entries(OTROS_MAP)) {
      nameToId[val] = key;
    }

    for (const item of data) {
      if (!item.fondo) continue;

      const providerId = nameToId[item.fondo];
      if (!providerId) continue;

      // API returns TNA as decimal (e.g. 0.25), convert to percentage
      const tnaPercentage = item.tna * 100;
      const date = item.fecha ? new Date(item.fecha) : new Date();

      rates.push(
        new YieldRate(
          crypto.randomUUID(),
          providerId,
          getProviderName(providerId),
          "ARS",
          parseFloat(tnaPercentage.toFixed(2)),
          date,
        ),
      );
    }

    return rates;
  }

  private parseFciYields(latest: any[], prev: any[]): YieldRate[] {
    const rates: YieldRate[] = [];

    if (!Array.isArray(latest) || !Array.isArray(prev)) return [];

    // Create a map for previous values for quick lookup
    const prevMap = new Map<string, any>();
    prev.forEach((p) => prevMap.set(p.fondo, p));

    for (const [providerId, fciName] of Object.entries(FCI_MAP)) {
      const latestData = latest.find((f) => f.fondo === fciName);
      const prevData = prevMap.get(fciName);

      if (!latestData) continue;
      if (!prevData) continue;

      if (latestData && prevData && latestData.vcp && prevData.vcp) {
        const vcpLatest = parseFloat(latestData.vcp);
        const vcpPrev = parseFloat(prevData.vcp);

        // Ensure dates are valid
        const dateLatest = new Date(latestData.fecha); // e.g. "2026-01-30"
        const datePrev = new Date(prevData.fecha); // e.g. "2026-01-29"

        // Calculate days difference
        const daysDiff = Math.max(
          1,
          (dateLatest.getTime() - datePrev.getTime()) / (1000 * 3600 * 24),
        );

        if (daysDiff > 0 && vcpPrev > 0) {
          // annualized TNA: (yield_period) * (365 / days)
          const periodicYield = vcpLatest / vcpPrev - 1;
          const tna = periodicYield * (365 / daysDiff) * 100;

          rates.push(
            new YieldRate(
              crypto.randomUUID(),
              providerId,
              getProviderName(providerId),
              "ARS",
              parseFloat(tna.toFixed(2)),
              dateLatest,
            ),
          );
        }
      }
    }

    return rates;
  }
}
