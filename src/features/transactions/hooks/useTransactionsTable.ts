"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";
import { fetchTransactions } from "../api/transactions.api";
import {
  transactionKeys,
  type TransactionListParams,
} from "../model/query-keys";
import { Month } from "@/shared/lib/date";

/**
 * Mapeo entre nombres de columnas del frontend (camelCase) y backend (snake_case)
 */
const SORT_COLUMN_MAP: Record<string, string> = {
  occurredOn: "occurred_on",
  title: "title",
  amount: "amount",
  createdAt: "created_at",
};

/**
 * Hook para gestionar la tabla de transacciones con filtros y paginación desde URL
 */
export function useTransactionsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extraer parámetros de la URL
  const params: TransactionListParams = useMemo(() => {
    const categoryIdsParam = searchParams.get("categoryIds");
    const sortBy = searchParams.get("sortBy") || "occurredOn";

    return {
      month: searchParams.get("month") || Month.current().toString(),
      kind: (searchParams.get("kind") as "income" | "expense") || undefined,
      status: (searchParams.get("status") as "pending" | "paid") || undefined,
      paymentMethodId: searchParams.get("paymentMethodId") || undefined,
      categoryIds: categoryIdsParam ? categoryIdsParam.split(",") : undefined,
      q: searchParams.get("q") || undefined,
      sortBy: SORT_COLUMN_MAP[sortBy] || "occurred_on", // Convertir a snake_case para el backend
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 20,
    };
  }, [searchParams]);

  // Query de transacciones
  const query = useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => fetchTransactions(params),
  });

  // Función para actualizar parámetros en la URL
  const updateParams = useCallback(
    (newParams: Partial<TransactionListParams>) => {
      const current = new URLSearchParams(searchParams.toString());

      // Actualizar o eliminar cada parámetro
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          current.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            current.set(key, value.join(","));
          } else {
            current.delete(key);
          }
        } else {
          current.set(key, String(value));
        }
      });

      // Si se cambian filtros, resetear a página 1
      const filterKeys = [
        "month",
        "kind",
        "status",
        "paymentMethodId",
        "categoryIds",
        "q",
      ];
      const isFilterChange = Object.keys(newParams).some((key) =>
        filterKeys.includes(key)
      );
      if (isFilterChange && !("page" in newParams)) {
        current.set("page", "1");
      }

      router.push(`${pathname}?${current.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Función para resetear filtros
  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Función para cambiar página
  const goToPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams]
  );

  // Función para cambiar ordenamiento
  const setSort = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      updateParams({ sortBy, sortOrder });
    },
    [updateParams]
  );

  return {
    // Data
    transactions: query.data?.data || [],
    meta: query.data?.meta,

    // Estado de la query
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Parámetros actuales
    params,

    // Acciones
    updateParams,
    resetFilters,
    goToPage,
    setSort,

    // Refetch manual
    refetch: query.refetch,
  };
}
