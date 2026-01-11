"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { fetchTransactions } from "../api/transactions.api";
import {
  transactionKeys,
  type TransactionListParams,
} from "../model/query-keys";
import { Month } from "@/shared/lib/date";
import { columnToCamelCase } from "@/shared/lib/utils/column-mapping";
import { useTableParams } from "@/shared/lib/hooks/useTableParams";

type CursorState = {
  cursor: string;
  cursorId: string;
};

/**
 * Hook para gestionar la tabla de transacciones con filtros y paginación desde URL
 */
export function useTransactionsTable() {
  const searchParams = useSearchParams();
  const cursorByPageRef = useRef<Record<number, CursorState>>({});
  const cursorSignatureRef = useRef<string>("");

  // Extraer parámetros de la URL
  const {
    params: baseParams,
    updateParams,
    resetFilters,
    goToPage,
    setSort,
  } = useTableParams<TransactionListParams>({
    defaultSortBy: "occurredOn",
    defaultSortOrder: "desc",
    defaultPage: 1,
    defaultPageSize: 20,
    filterKeys: [
      "month",
      "kind",
      "status",
      "paymentMethodId",
      "categoryIds",
      "q",
    ],
    mapSortBy: columnToCamelCase,
  });

  const extraParams = useMemo(() => {
    const categoryIdsParam = searchParams.get("categoryIds");
    return {
      month: searchParams.get("month") || Month.current().toString(),
      kind: (searchParams.get("kind") as "income" | "expense") || undefined,
      status: (searchParams.get("status") as "pending" | "paid") || undefined,
      paymentMethodId: searchParams.get("paymentMethodId") || undefined,
      categoryIds: categoryIdsParam
        ? categoryIdsParam.split(",").filter(Boolean)
        : undefined,
    };
  }, [searchParams]);

  const params: TransactionListParams = useMemo(
    () => ({
      ...baseParams,
      ...extraParams,
    }),
    [baseParams, extraParams]
  );

  const cursorSignature = useMemo(
    () =>
      JSON.stringify({
        month: extraParams.month,
        kind: extraParams.kind,
        status: extraParams.status,
        paymentMethodId: extraParams.paymentMethodId,
        categoryIds: extraParams.categoryIds?.join(",") ?? "",
        q: baseParams.q,
        sortBy: baseParams.sortBy,
        sortOrder: baseParams.sortOrder,
        pageSize: baseParams.pageSize,
      }),
    [
      extraParams.month,
      extraParams.kind,
      extraParams.status,
      extraParams.paymentMethodId,
      extraParams.categoryIds,
      baseParams.q,
      baseParams.sortBy,
      baseParams.sortOrder,
      baseParams.pageSize,
    ]
  );

  useEffect(() => {
    if (cursorSignatureRef.current !== cursorSignature) {
      cursorSignatureRef.current = cursorSignature;
      cursorByPageRef.current = {};
    }
  }, [cursorSignature]);

  const currentPage = params.page ?? 1;
  const cursorForPage =
    currentPage > 1 ? cursorByPageRef.current[currentPage] : undefined;

  const paramsWithCursor: TransactionListParams = useMemo(
    () => ({
      ...params,
      cursor: cursorForPage?.cursor,
      cursorId: cursorForPage?.cursorId,
    }),
    [params, cursorForPage]
  );

  // Query de transacciones
  const query = useQuery({
    queryKey: transactionKeys.list(paramsWithCursor),
    queryFn: () => fetchTransactions(paramsWithCursor),
  });

  useEffect(() => {
    if (!query.data?.nextCursor || !query.data.nextCursorId) {
      return;
    }

    cursorByPageRef.current[currentPage + 1] = {
      cursor: query.data.nextCursor,
      cursorId: query.data.nextCursorId,
    };
  }, [query.data, currentPage]);

  const meta = query.data
    ? {
        total: query.data.total,
        page: query.data.page,
        pageSize: query.data.pageSize,
        totalPages: query.data.totalPages,
      }
    : undefined;

  return {
    // Data
    transactions: query.data?.items || [],
    meta,

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
