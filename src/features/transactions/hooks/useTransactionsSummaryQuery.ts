"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchTransactions } from "../api/transactions.api";
import { transactionKeys } from "../model/query-keys";

/**
 * Hook para obtener todas las transacciones del mes (sin filtros) para el resumen
 *
 * @param month - Mes en formato YYYY-MM
 * @returns Query con todas las transacciones del mes
 */
export function useTransactionsSummaryQuery(month: string) {
  // Parámetros solo con mes, sin otros filtros, con pageSize máximo permitido
  const params = useMemo(
    () => ({
      month,
      pageSize: 100, // Máximo permitido por el backend
      page: 1,
    }),
    [month]
  );

  const query = useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => fetchTransactions(params),
  });

  return {
    transactions: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
