"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTransactionsSummary } from "../api/transactions.api";
import { transactionKeys } from "../model/query-keys";

/**
 * Hook para obtener el resumen de egresos del mes (paid/pending)
 *
 * @param month - Mes en formato YYYY-MM
 * @returns Query con el resumen del mes
 */
export function useTransactionsSummaryQuery(month: string) {
  const query = useQuery({
    queryKey: transactionKeys.summary(month),
    queryFn: () => fetchTransactionsSummary(month),
    enabled: Boolean(month),
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
