/**
 * Transaction Query Keys Factory
 * Organiza las keys de TanStack Query para transacciones
 */

export interface TransactionListParams {
  month?: string;
  kind?: 'income' | 'expense';
  status?: 'pending' | 'paid';
  paymentMethodId?: string;
  categoryIds?: string[];
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionListParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};
