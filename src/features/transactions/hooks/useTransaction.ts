'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTransactionById } from '../api/transactions.api';
import { transactionKeys } from '../model/query-keys';

/**
 * Hook para obtener una transacción específica por ID
 */
export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: transactionKeys.detail(id || ''),
    queryFn: () => fetchTransactionById(id!),
    enabled: !!id,
  });
}
