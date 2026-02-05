import { useQuery } from "@tanstack/react-query";
import { YIELD_PROVIDERS } from "../config/providers";

export interface Provider {
  id: string;
  name: string;
  color?: string;
}

async function fetchProviders(): Promise<Provider[]> {
  const res = await fetch("/api/market-data/providers");
  if (!res.ok) throw new Error("Failed to fetch providers");
  return res.json();
}

export function useProviders() {
  return useQuery({
    queryKey: ["yield-providers"],
    queryFn: async () => {
      const dbProviders = await fetchProviders();

      // Merge with static config to get colors or overrides
      return dbProviders.map((p) => ({
        id: p.id,
        name: YIELD_PROVIDERS[p.id]?.name || p.name, // Prefer static config name if exists (prettier) or DB/Fallback
        color: YIELD_PROVIDERS[p.id]?.color || generateColor(p.id),
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

function generateColor(str: string): string {
  // Simple hash for consistent color generation for unknown providers
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}
