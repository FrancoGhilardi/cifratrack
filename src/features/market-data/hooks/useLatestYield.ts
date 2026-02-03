import { useQuery } from "@tanstack/react-query";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

async function fetchLatest(providerId: string): Promise<YieldRate | null> {
  const params = new URLSearchParams({ providerId });
  const res = await fetch(`/api/market-data/latest?${params}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch latest rate");
  }
  const raw = await res.json();
  return {
    ...raw,
    date: new Date(raw.date),
  };
}

export function useLatestYield(providerId: string | null | undefined) {
  return useQuery({
    queryKey: ["yield-latest", providerId],
    queryFn: () => (providerId ? fetchLatest(providerId) : null),
    enabled: !!providerId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
