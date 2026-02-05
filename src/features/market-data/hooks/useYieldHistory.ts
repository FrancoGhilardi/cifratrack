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

async function fetchLive(providerId: string): Promise<YieldRate | null> {
  try {
    const res = await fetch(`/api/market-data/live?providerId=${providerId}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Return simple object structure compatible with YieldRate interface for UI
    return {
      ...data,
      date: new Date(data.date),
    };
  } catch (error) {
    console.warn("Failed to fetch live rate", error);
    return null;
  }
}

export function useYieldHistory(providerId: string, days: number = 30) {
  const historyQuery = useQuery({
    queryKey: ["yield-history", providerId, days],
    queryFn: () => fetchHistory(providerId, days),
    enabled: !!providerId,
    staleTime: 1000 * 60 * 60, // 1 hour for DB history
  });

  const liveQuery = useQuery({
    queryKey: ["yield-live", providerId],
    queryFn: () => fetchLive(providerId),
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5, // 5 min for live data
  });

  // Merge Data
  const history = historyQuery.data || [];
  const live = liveQuery.data;

  let mergedData = [...history];

  if (live) {
    // Check if live data is newer than last history item
    // OR if history is empty
    const lastHistory = history.length > 0 ? history[history.length - 1] : null;

    // Use UTC to ensure consistent comparison regardless of local timezone hours
    // (API dates usually come as ISO strings, e.g. T00:00:00.000Z or T03:00:00.000Z)
    const toUTCInputDate = (d: Date) => d.toISOString().split("T")[0];

    const liveDateStr = toUTCInputDate(live.date);

    // Filter out ANY history item that is equal or newer than the live date.
    // This removes:
    // 1. Duplicates (history has 04/02, live is 04/02) -> We keep Live.
    // 2. Future 'garbage' (history has 05/02 projected, live is 04/02 authentic) -> We keep Live as the cut-off.
    mergedData = mergedData.filter((item) => {
      const itemDateStr = toUTCInputDate(item.date);
      // Keep only strictly older items
      return itemDateStr < liveDateStr;
    });

    // Add Live Data
    mergedData.push(live);
  }

  // Ensure sorting by date
  mergedData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // REMOVED PROJECTION: The user requested that if the latest data is from yesterday (e.g. 04/02),
  // the chart should end there with the API data, instead of projecting to today (05/02).

  return {
    ...historyQuery, // keep isLoading, error from main query
    data: mergedData,
    isLiveLoading: liveQuery.isLoading,
  };
}
