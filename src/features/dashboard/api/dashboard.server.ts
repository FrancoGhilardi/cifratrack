import { headers } from "next/headers";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import type { ApiResponse } from "@/shared/lib/types";
import { isApiOk } from "@/shared/lib/types";
import { env } from "@/shared/config/env";

/**
 * Fetch del resumen del dashboard para Server Components (prefetch RSC).
 * Reenvía la cookie de sesión a la propia API route.
 */
export async function getDashboardSummaryServer(
  month: string,
): Promise<DashboardSummaryDTO> {
  const cookie = (await headers()).get("cookie") ?? "";

  const response = await fetch(
    `${env.NEXTAUTH_URL}/api/dashboard/summary?month=${month}`,
    { headers: { cookie }, cache: "no-store" },
  );

  const result = (await response.json()) as ApiResponse<DashboardSummaryDTO>;

  if (!isApiOk(result)) {
    throw new Error(result.error.message);
  }

  return result.data;
}
