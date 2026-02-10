import { useQuery } from "@tanstack/react-query";

// Tipo simple para las tasas en vivo (solo para UI)
export interface YieldRate {
  providerId: string;
  rate: number;
  currency: string;
  date: Date;
  providerName?: string;
}

async function fetchLive(
  providerId?: string,
): Promise<YieldRate | YieldRate[] | null> {
  const url = providerId
    ? `/api/market-data/live?providerId=${providerId}`
    : `/api/market-data/live`;

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch live rates");
  }

  const raw = await res.json();

  if (Array.isArray(raw)) {
    return raw.map((r) => ({ ...r, date: new Date(r.date) }));
  }

  return {
    ...raw,
    date: new Date(raw.date),
  };
}

export function useLatestYield(providerId: string | null | undefined) {
  return useQuery({
    queryKey: ["yield-live", providerId],
    queryFn: () =>
      providerId ? (fetchLive(providerId) as Promise<YieldRate | null>) : null,
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllLiveRates() {
  return useQuery({
    queryKey: ["yield-live", "all"],
    queryFn: () => fetchLive() as Promise<YieldRate[]>,
    staleTime: 1000 * 60 * 5,
  });
}
