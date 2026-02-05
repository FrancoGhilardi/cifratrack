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
  // Endpoints
  private readonly CRIPTO_PESOS_URL =
    "https://api.argentinadatos.com/v1/finanzas/criptopesos/";
  private readonly RENDIMIENTOS_URL =
    "https://api.argentinadatos.com/v1/finanzas/rendimientos/";
  private readonly PLAZO_FIJO_URL =
    "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo/";
  private readonly OTROS_URL =
    "https://api.argentinadatos.com/v1/finanzas/fci/otros/ultimo/";

  // FCI Endpoints
  private readonly FCI_MM_LATEST =
    "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo/";
  private readonly FCI_MM_PREV =
    "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/penultimo/";

  private readonly FCI_RV_LATEST =
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaVariable/ultimo/";
  private readonly FCI_RV_PREV =
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaVariable/penultimo/";

  private readonly FCI_RM_LATEST =
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaMixta/ultimo/";
  private readonly FCI_RM_PREV =
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaMixta/penultimo/";

  private readonly FCI_RF_LATEST =
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaFija/ultimo/";
  private readonly FCI_RF_BASE_URL =
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaFija/"; // Append YYYY/MM/DD/

  async fetchLatestRates(): Promise<YieldRate[]> {
    try {
      const historyUrls = this.getLast5DaysUrls();

      const results = await Promise.allSettled([
        // 0-3: General
        this.fetchJson(this.CRIPTO_PESOS_URL),
        this.fetchJson(this.RENDIMIENTOS_URL),
        this.fetchJson(this.PLAZO_FIJO_URL),
        this.fetchJson(this.OTROS_URL),
        // 4-9: Paired FCI Endpoints (Latest/Prev)
        this.fetchJson(this.FCI_MM_LATEST),
        this.fetchJson(this.FCI_MM_PREV),
        this.fetchJson(this.FCI_RV_LATEST),
        this.fetchJson(this.FCI_RV_PREV),
        this.fetchJson(this.FCI_RM_LATEST),
        this.fetchJson(this.FCI_RM_PREV),
        // 10: Renta Fija Latest
        this.fetchJson(this.FCI_RF_LATEST),
        // 11+: Renta Fija History (5 days)
        ...historyUrls.map((url) => this.fetchJson(url)),
      ]);

      const data = results.map((r) =>
        r.status === "fulfilled" ? r.value : [],
      );

      const [
        criptoPesosData, // 0
        rendimientosData, // 1
        plazoFijoData, // 2
        otrosData, // 3
        mmLatest, // 4
        mmPrev, // 5
        rvLatest, // 6
        rvPrev, // 7
        rmLatest, // 8
        rmPrev, // 9
        rfLatest, // 10
        ...rfHistory // 11+
      ] = data;

      const rates: YieldRate[] = [];

      // 1. Process Explicit Yields
      rates.push(...this.parseCriptoPesos(criptoPesosData));
      rates.push(...this.parseRendimientos(rendimientosData));
      rates.push(...this.parsePlazoFijo(plazoFijoData));
      rates.push(...this.parseOtherYields(otrosData));

      // 2. Process Standard Paired FCIs
      rates.push(...this.processFciPair(mmLatest, mmPrev));
      rates.push(...this.processFciPair(rvLatest, rvPrev));
      rates.push(...this.processFciPair(rmLatest, rmPrev));

      // 3. Process Renta Fija with History
      rates.push(...this.processFciHistory(rfLatest, rfHistory));

      return rates;
    } catch (error) {
      console.error("Adapter Error:", error);
      return [];
    }
  }

  private async fetchJson(url: string) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "CifraTrack/1.0" },
      });
      if (!response.ok) {
        // console.warn(`Failed to fetch ${url}: ${response.status}`);
        return [];
      }
      return response.json();
    } catch (e) {
      // console.warn(`Error fetching ${url}:`, e);
      return [];
    }
  }

  private getLast5DaysUrls(): string[] {
    const urls: string[] = [];
    const today = new Date();
    // Fetch last 5 days
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      urls.push(`${this.FCI_RF_BASE_URL}${yyyy}/${mm}/${dd}/`);
    }
    return urls;
  }

  private parseCriptoPesos(data: any[]): YieldRate[] {
    const rates: YieldRate[] = [];
    if (!Array.isArray(data)) return [];

    for (const item of data) {
      if (!item.entidad) continue;

      const providerId = this.resolveProviderId(item.entidad);
      const name = item.entidad;
      const currency = item.token || "ARS";
      const apy = (item.tna || 0) * 100;

      rates.push(
        new YieldRate(
          crypto.randomUUID(),
          providerId,
          name,
          currency,
          parseFloat(apy.toFixed(2)),
          new Date(),
        ),
      );
    }
    return rates;
  }

  private parsePlazoFijo(data: any[]): YieldRate[] {
    const rates: YieldRate[] = [];
    if (!Array.isArray(data)) return [];

    for (const item of data) {
      if (!item.entidad || !item.tnaClientes) continue;

      const providerId = this.resolveProviderId(item.entidad);
      const apy = item.tnaClientes * 100;

      rates.push(
        new YieldRate(
          crypto.randomUUID(),
          providerId,
          item.entidad,
          "ARS",
          parseFloat(apy.toFixed(2)),
          new Date(),
        ),
      );
    }
    return rates;
  }

  private parseRendimientos(data: any[]): YieldRate[] {
    const rates: YieldRate[] = [];
    if (!Array.isArray(data)) return [];

    for (const item of data) {
      if (!item.entidad) continue;
      const providerId =
        ARGENTINA_DATOS_MAP[item.entidad.toLowerCase()] ||
        this.slugify(item.entidad);

      const arsYields = item.rendimientos.filter(
        (r: any) => r.moneda === "ARS",
      );

      for (const arsYield of arsYields) {
        const date = arsYield.fecha ? new Date(arsYield.fecha) : new Date();
        rates.push(
          new YieldRate(
            crypto.randomUUID(),
            providerId,
            getProviderName(providerId) || item.entidad,
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

    const nameToId: Record<string, string> = {};
    for (const [key, val] of Object.entries(OTROS_MAP)) {
      nameToId[val] = key;
    }

    for (const item of data) {
      if (!item.fondo) continue;
      const providerId = nameToId[item.fondo];
      if (!providerId) continue;

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

  private processFciPair(latest: any[], prev: any[]): YieldRate[] {
    if (!Array.isArray(latest) || !Array.isArray(prev)) return [];

    const prevMap = new Map<string, any>();
    prev.forEach((p) => {
      if (p.fondo) prevMap.set(p.fondo, p);
    });

    const rates: YieldRate[] = [];

    for (const latestItem of latest) {
      if (!latestItem.fondo || !latestItem.vcp) continue;

      const prevItem = prevMap.get(latestItem.fondo);
      if (!prevItem || !prevItem.vcp) continue;

      const rate = this.calculateFciRate(latestItem, prevItem);
      if (rate) rates.push(rate);
    }

    return rates;
  }

  private processFciHistory(
    latest: any[],
    historyArrays: any[][],
  ): YieldRate[] {
    const allData = [latest, ...historyArrays]
      .flat()
      .filter((x) => x && x.fondo && x.vcp && x.fecha);

    // Group by Fund
    const byFund = new Map<string, any[]>();
    for (const item of allData) {
      const list = byFund.get(item.fondo) || [];
      list.push(item);
      byFund.set(item.fondo, list);
    }

    const rates: YieldRate[] = [];

    for (const [fundName, items] of byFund.entries()) {
      // Sort by date desc
      items.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

      // Remove duplicate dates
      const distinctItems = items.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.fecha === item.fecha),
      );

      // Calculate pairs
      for (let i = 0; i < distinctItems.length - 1; i++) {
        const current = distinctItems[i];
        const previous = distinctItems[i + 1];

        const rate = this.calculateFciRate(current, previous);
        if (rate) rates.push(rate);
      }
    }

    return rates;
  }

  private calculateFciRate(latestData: any, prevData: any): YieldRate | null {
    try {
      const vcpLatest = parseFloat(latestData.vcp);
      const vcpPrev = parseFloat(prevData.vcp);
      const dateLatest = new Date(latestData.fecha);
      const datePrev = new Date(prevData.fecha);

      const daysDiff = Math.max(
        1,
        (dateLatest.getTime() - datePrev.getTime()) / (1000 * 3600 * 24),
      );

      if (daysDiff <= 0 || vcpPrev <= 0) return null;

      const periodicYield = vcpLatest / vcpPrev - 1;
      const tna = periodicYield * (365 / daysDiff) * 100;

      const fundName = latestData.fondo;
      let providerId: string | undefined;

      for (const [pid, fname] of Object.entries(FCI_MAP)) {
        if (fname === fundName) {
          providerId = pid;
          break;
        }
      }

      let isGenerated = false;
      if (!providerId) {
        providerId = this.slugify(fundName);
        isGenerated = true;
      }

      // If mapped, use Config-based name. If generated, use Fund Name (cleaner than slug)
      const pName = !isGenerated ? getProviderName(providerId) : fundName;

      return new YieldRate(
        crypto.randomUUID(),
        providerId,
        pName,
        "ARS",
        parseFloat(tna.toFixed(2)),
        dateLatest,
      );
    } catch (e) {
      return null;
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  private resolveProviderId(name: string): string {
    const normalized = name.toLowerCase();
    if (ARGENTINA_DATOS_MAP[normalized]) return ARGENTINA_DATOS_MAP[normalized];
    return this.slugify(name);
  }
}
