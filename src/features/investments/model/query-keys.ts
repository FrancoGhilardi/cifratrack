/**
 * Factory para query keys de TanStack Query
 * 
 * Centraliza las keys para mantener consistencia y facilitar invalidaciones
 */
export const investmentKeys = {
  all: ['investments'] as const,
  lists: () => [...investmentKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...investmentKeys.lists(), params] as const,
  details: () => [...investmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...investmentKeys.details(), id] as const,
};
