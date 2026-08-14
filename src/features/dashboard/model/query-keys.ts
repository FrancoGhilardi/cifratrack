/**
 * Query keys para TanStack Query
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (month: string) => [...dashboardKeys.all, 'summary', month] as const,
  balanceSeries: (month: string) =>
    [...dashboardKeys.all, 'balance-series', month] as const,
};
