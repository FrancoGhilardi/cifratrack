import { useQuery } from "@tanstack/react-query";
import { YieldRate } from "@/entities/yield/model/yield-rate.entity";

async function fetchHistory(
  providerId: string,
  days: number = 30,
): Promise<YieldRate[]> {
  const params = new URLSearchParams({
    providerId,
    days: days.toString(),
  });

  const res = await fetch(`/api/market-data/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch yield history");

  const rawData = await res.json();
  // Revive dates because JSON
  return rawData.map((d: any) => ({
    ...d,
    date: new Date(d.date),
  }));
}

export function useYieldHistory(providerId: string, days: number = 30) {
  return useQuery({
    queryKey: ["yield-history", providerId, days],
    queryFn: () => fetchHistory(providerId, days),
    enabled: !!providerId,
    // Cache for 1 hour, data doesn't change that often
    staleTime: 1000 * 60 * 60,
  });
}
