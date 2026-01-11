"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type {
  InvestmentQueryParams,
  PaginatedInvestmentsResponse,
} from "../model/investment.dto";
import { investmentKeys } from "../model/query-keys";
import { fetchInvestments } from "../api/investments.api";
import { useTableParams } from "@/shared/lib/hooks/useTableParams";

type CursorState = {
  cursor: string;
  cursorId: string;
};

/**
 * Hook para gestionar la tabla de inversiones con filtros/orden/paginación desde la URL
 */
export function useInvestmentsTable() {
  const searchParams = useSearchParams();
  const cursorByPageRef = useRef<Record<number, CursorState>>({});
  const cursorSignatureRef = useRef<string>("");
  const sortOrderFallback = (searchParams.get("sortOrder") ??
    searchParams.get("sortDir")) as InvestmentQueryParams["sortOrder"];

  // Leer parámetros actuales desde la URL
  const {
    params: baseParams,
    updateParams,
    resetFilters,
    goToPage,
    setSort,
  } = useTableParams<InvestmentQueryParams>({
    defaultSortBy: "startedOn",
    defaultSortOrder: sortOrderFallback || "desc",
    defaultPage: 1,
    defaultPageSize: 20,
    filterKeys: ["q", "active", "pageSize"],
    mapSortBy: (sortBy) => sortBy,
  });

  const extraParams = useMemo(() => {
    const activeParam =
      (searchParams.get("active") as InvestmentQueryParams["active"]) ||
      undefined;
    return {
      active: activeParam,
    };
  }, [searchParams]);

  const params: InvestmentQueryParams = useMemo(
    () => ({
      ...baseParams,
      ...extraParams,
    }),
    [baseParams, extraParams]
  );

  const cursorSignature = useMemo(
    () =>
      JSON.stringify({
        q: baseParams.q,
        active: extraParams.active,
        sortBy: baseParams.sortBy,
        sortOrder: baseParams.sortOrder,
        pageSize: baseParams.pageSize,
      }),
    [
      baseParams.q,
      extraParams.active,
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

  const paramsWithCursor: InvestmentQueryParams = useMemo(
    () => ({
      ...params,
      cursor: cursorForPage?.cursor,
      cursorId: cursorForPage?.cursorId,
    }),
    [params, cursorForPage]
  );

  const query = useQuery<PaginatedInvestmentsResponse>({
    queryKey: investmentKeys.list(paramsWithCursor as Record<string, unknown>),
    queryFn: () => fetchInvestments(paramsWithCursor),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (
      query.isPlaceholderData ||
      !query.data?.nextCursor ||
      !query.data.nextCursorId
    ) {
      return;
    }

    cursorByPageRef.current[currentPage + 1] = {
      cursor: query.data.nextCursor,
      cursorId: query.data.nextCursorId,
    };
  }, [query.data, query.isPlaceholderData, currentPage]);

  const setFilters = useCallback(
    (filters: Partial<Pick<InvestmentQueryParams, "q" | "active">>) => {
      updateParams(filters);
    },
    [updateParams]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateParams({ pageSize });
    },
    [updateParams]
  );

  const meta = query.data
    ? {
        total: query.data.total,
        page: query.data.page,
        pageSize: query.data.pageSize,
        totalPages: query.data.totalPages,
      }
    : undefined;

  return {
    investments: query.data?.items ?? [],
    meta,
    params,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    setFilters,
    resetFilters,
    setSort,
    goToPage,
    setPageSize,
    refetch: query.refetch,
  };
}
