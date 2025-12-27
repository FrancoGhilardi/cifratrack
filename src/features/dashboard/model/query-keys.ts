/**
 * Query keys para TanStack Query
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (month: string) => [...dashboardKeys.all, 'summary', month] as const,
};
