import {
  getProviderName,
  YIELD_PROVIDERS,
} from "@/features/market-data/config/providers";
import { YIELD_PROVIDER_LIVE_SOURCES } from "@/features/market-data/config/live-provider-sources";

const CACHE_REVALIDATE_SECONDS = 300;

export interface LiveYieldRate {
  providerId: string;
  providerName: string;
  rate: number | null;
  currency: string;
  date: Date | null;
  available: boolean;
}

interface RawAccountRate {
  fondo: string;
  tna: number | string;
  fecha?: string | null;
}

interface RawFundRate {
  fondo: string;
  fecha: string;
  vcp: number | string;
}

interface RawPlazoFijoRate {
  entidad?: string;
  fecha?: string | null;
  tna?: number | string | null;
  tnaClientes?: number | string | null;
  tnaNoClientes?: number | string | null;
}

interface SourceRate {
  rate: number;
  date: Date | null;
}

export class GetLiveYieldsUseCase {
  async execute(providerId?: string) {
    const catalog = await this.buildCatalog();

    if (!providerId) {
      return catalog;
    }

    return catalog.find((rate) => rate.providerId === providerId) ?? null;
  }

  private async buildCatalog(): Promise<LiveYieldRate[]> {
    const [accountRates, fundRates, plazoFijoRates] = await Promise.all([
      this.fetchAccountRates(),
      this.fetchFundRates(),
      this.fetchPlazoFijoRates(),
    ]);

    return Object.keys(YIELD_PROVIDERS).map((providerId) => {
      const resolvedRate =
        accountRates.get(providerId) ??
        fundRates.get(providerId) ??
        plazoFijoRates.get(providerId);

      return {
        providerId,
        providerName: getProviderName(providerId),
        rate:
          typeof resolvedRate?.rate === "number"
            ? this.roundRate(resolvedRate.rate)
            : null,
        currency: "ARS",
        date: resolvedRate?.date ?? null,
        available: !!resolvedRate,
      };
    });
  }

  private async fetchAccountRates(): Promise<Map<string, SourceRate>> {
    const data =
      (await this.fetchJson<RawAccountRate[]>(
        "https://api.argentinadatos.com/v1/finanzas/fci/otros/ultimo",
      )) ?? [];

    const ratesByName = new Map(
      data.map((item) => [this.normalizeText(item.fondo), item] as const),
    );

    const resolvedRates = new Map<string, SourceRate>();

    for (const [providerId, source] of Object.entries(
      YIELD_PROVIDER_LIVE_SOURCES,
    )) {
      const accountRate = this.findFirstMatch(ratesByName, source.accountNames);
      const rate = this.normalizePercent(accountRate?.tna);

      if (!accountRate || rate === null) {
        continue;
      }

      resolvedRates.set(providerId, {
        rate,
        date: this.parseDate(accountRate.fecha),
      });
    }

    return resolvedRates;
  }

  private async fetchFundRates(): Promise<Map<string, SourceRate>> {
    const [
      mercadoDineroRates,
      rentaFijaRates,
      rentaMixtaRates,
      rentaVariableRates,
    ] = await Promise.all([
      this.fetchFundCategoryRates(
        "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo",
        "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/penultimo",
      ),
      this.fetchRentaFijaRates(),
      this.fetchFundCategoryRates(
        "https://api.argentinadatos.com/v1/finanzas/fci/rentaMixta/ultimo",
        "https://api.argentinadatos.com/v1/finanzas/fci/rentaMixta/penultimo",
      ),
      this.fetchFundCategoryRates(
        "https://api.argentinadatos.com/v1/finanzas/fci/rentaVariable/ultimo",
        "https://api.argentinadatos.com/v1/finanzas/fci/rentaVariable/penultimo",
      ),
    ]);

    const fundRatesByName = new Map<string, SourceRate>();

    for (const [fundName, rate] of [
      ...mercadoDineroRates,
      ...rentaFijaRates,
      ...rentaMixtaRates,
      ...rentaVariableRates,
    ]) {
      fundRatesByName.set(this.normalizeText(fundName), rate);
    }

    const resolvedRates = new Map<string, SourceRate>();

    for (const [providerId, source] of Object.entries(
      YIELD_PROVIDER_LIVE_SOURCES,
    )) {
      const fundRate = this.findFirstMatch(fundRatesByName, source.fundNames);

      if (fundRate) {
        resolvedRates.set(providerId, fundRate);
      }
    }

    return resolvedRates;
  }

  private async fetchFundCategoryRates(
    latestUrl: string,
    previousUrl: string,
  ): Promise<Map<string, SourceRate>> {
    const [latest, previous] = await Promise.all([
      this.fetchJson<RawFundRate[]>(latestUrl),
      this.fetchJson<RawFundRate[]>(previousUrl),
    ]);

    return this.buildFundRates(latest ?? [], previous ?? []);
  }

  private async fetchRentaFijaRates(): Promise<Map<string, SourceRate>> {
    const latest =
      (await this.fetchJson<RawFundRate[]>(
        "https://api.argentinadatos.com/v1/finanzas/fci/rentaFija/ultimo",
      )) ?? [];

    const previous = await this.fetchRentaFijaPreviousSamples(latest);

    return this.buildFundRates(latest, previous);
  }

  private async fetchRentaFijaPreviousSamples(latest: RawFundRate[]) {
    const previousByTargetDate = new Map<string, RawFundRate[]>();
    const previousSamples: RawFundRate[] = [];
    const today = new Date();

    for (const fund of latest) {
      const fundDate = this.parseDate(fund.fecha);

      if (!fundDate || this.daysBetweenDates(fundDate, today) > 30) {
        continue;
      }

      const targetDate = new Date(fundDate);
      targetDate.setDate(targetDate.getDate() - 30);

      const targetDateKey = this.formatDateKey(targetDate);
      let snapshot = previousByTargetDate.get(targetDateKey);

      if (!snapshot) {
        snapshot = await this.fetchNearestRentaFijaSnapshot(targetDate);
        previousByTargetDate.set(targetDateKey, snapshot);
      }

      const fundMatch = snapshot
        .filter(
          (item) =>
            this.normalizeText(item.fondo) === this.normalizeText(fund.fondo),
        )
        .filter((item) => {
          const itemDate = this.parseDate(item.fecha);
          return !!itemDate && itemDate.getTime() <= targetDate.getTime();
        })
        .sort((a, b) => {
          const dateA = this.parseDate(a.fecha)?.getTime() ?? 0;
          const dateB = this.parseDate(b.fecha)?.getTime() ?? 0;
          return dateB - dateA;
        })[0];

      if (fundMatch) {
        previousSamples.push(fundMatch);
      }
    }

    return previousSamples;
  }

  private async fetchNearestRentaFijaSnapshot(
    targetDate: Date,
    retriesLeft = 7,
  ): Promise<RawFundRate[]> {
    if (retriesLeft <= 0) {
      return [];
    }

    const snapshot =
      (await this.fetchJson<RawFundRate[]>(
        `https://api.argentinadatos.com/v1/finanzas/fci/rentaFija/${this.formatDatePath(
          targetDate,
        )}`,
      )) ?? [];

    if (snapshot.length > 0) {
      return snapshot;
    }

    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);

    return this.fetchNearestRentaFijaSnapshot(previousDay, retriesLeft - 1);
  }

  private buildFundRates(latest: RawFundRate[], previous: RawFundRate[]) {
    const previousByName = new Map(
      previous.map((item) => [this.normalizeText(item.fondo), item] as const),
    );
    const resolvedRates = new Map<string, SourceRate>();

    for (const latestItem of latest) {
      const previousItem = previousByName.get(
        this.normalizeText(latestItem.fondo),
      );

      if (!previousItem) {
        continue;
      }

      const rate = this.calculateFundTna(latestItem, previousItem);

      if (!rate) {
        continue;
      }

      resolvedRates.set(latestItem.fondo, rate);
    }

    return resolvedRates;
  }

  private calculateFundTna(
    current: RawFundRate,
    previous: RawFundRate,
  ): SourceRate | null {
    const currentDate = this.parseDate(current.fecha);
    const previousDate = this.parseDate(previous.fecha);
    const currentVcp = this.normalizeNumber(current.vcp);
    const previousVcp = this.normalizeNumber(previous.vcp);

    if (
      !currentDate ||
      !previousDate ||
      currentVcp === null ||
      previousVcp === null ||
      previousVcp <= 0
    ) {
      return null;
    }

    const isCurrentNewer = currentDate.getTime() >= previousDate.getTime();
    const newerDate = isCurrentNewer ? currentDate : previousDate;
    const olderDate = isCurrentNewer ? previousDate : currentDate;
    const newerVcp = isCurrentNewer ? currentVcp : previousVcp;
    const olderVcp = isCurrentNewer ? previousVcp : currentVcp;
    const days = this.daysBetweenDates(newerDate, olderDate);

    if (days <= 0) {
      return null;
    }

    const dailyReturn = (newerVcp - olderVcp) / olderVcp / days;
    const rate = dailyReturn * 365 * 100;

    if (!Number.isFinite(rate)) {
      return null;
    }

    return {
      rate: this.roundRate(rate),
      date: newerDate,
    };
  }

  private async fetchPlazoFijoRates(): Promise<Map<string, SourceRate>> {
    const data =
      (await this.fetchJson<RawPlazoFijoRate[]>(
        "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo",
      )) ?? [];

    const resolvedRates = new Map<string, SourceRate>();
    const fallbackDate = this.getTodayUtcDate();

    for (const item of data) {
      if (!item.entidad) {
        continue;
      }

      const providerId = this.normalizePlazoFijoProviderId(item.entidad);
      const rate = this.normalizePercent(
        item.tnaClientes ?? item.tnaNoClientes ?? item.tna,
      );

      if (!providerId || rate === null || resolvedRates.has(providerId)) {
        continue;
      }

      resolvedRates.set(providerId, {
        rate,
        date: this.parseDate(item.fecha) ?? fallbackDate,
      });
    }

    return resolvedRates;
  }

  private findFirstMatch<T>(
    source: Map<string, T>,
    names: string[] | undefined,
  ): T | undefined {
    if (!names?.length) {
      return undefined;
    }

    for (const name of names) {
      const match = source.get(this.normalizeText(name));

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  private normalizePlazoFijoProviderId(entidad: string): string | null {
    const normalized = this.normalizeText(entidad);

    const aliases: Array<[string, string[]]> = [
      ["supervielle", ["supervielle", "banco supervielle"]],
      ["galicia", ["galicia", "ggal"]],
      ["macro", ["macro", "banco macro"]],
      ["santander", ["santander"]],
      ["icbc", ["industrial and commercial bank of china", "icbc"]],
      ["bna", ["banco de la nacion", "nacion argentina", "bna"]],
    ];

    for (const [providerId, providerAliases] of aliases) {
      if (
        providerAliases.some(
          (alias) => normalized === alias || normalized.includes(alias),
        )
      ) {
        return providerId;
      }
    }

    return null;
  }

  private normalizeText(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9$]+/g, " ")
      .trim();
  }

  private normalizePercent(value: number | string | null | undefined) {
    const numericValue = this.normalizeNumber(value);

    if (numericValue === null) {
      return null;
    }

    const normalizedValue =
      numericValue <= 1 ? numericValue * 100 : numericValue;

    return this.roundRate(normalizedValue);
  }

  private normalizeNumber(value: number | string | null | undefined) {
    const numericValue =
      typeof value === "number" ? value : Number.parseFloat(String(value));

    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private parseDate(value: string | null | undefined) {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private daysBetweenDates(a: Date, b: Date) {
    return Math.abs(
      Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  private formatDatePath(value: Date) {
    return this.formatDateKey(value).replace(/-/g, "/");
  }

  private formatDateKey(value: Date) {
    return value.toISOString().split("T")[0] ?? "";
  }

  private roundRate(value: number) {
    return Math.round(value * 100) / 100;
  }

  private getTodayUtcDate() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  private async fetchJson<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url, {
        next: { revalidate: CACHE_REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        throw new Error(`Unexpected response ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`[market-data] failed to fetch ${url}`, error);
      return null;
    }
  }
}
