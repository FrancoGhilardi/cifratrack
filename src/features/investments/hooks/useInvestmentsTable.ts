"use client";

import { useCallback, useMemo, useState } from "react";
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

  const [cursorBySignature, setCursorBySignature] = useState<
    Record<string, Record<number, CursorState>>
  >({});

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

  const cursorMap = cursorBySignature[cursorSignature] ?? {};
  const currentPage = params.page ?? 1;
  const cursorForPage =
    currentPage > 1 ? cursorMap[currentPage] : undefined;

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

  const storeNextCursor = useCallback(() => {
    if (!query.data || query.data.page !== currentPage) {
      return;
    }

    const { nextCursor, nextCursorId } = query.data;
    if (!nextCursor || !nextCursorId) {
      return;
    }

    setCursorBySignature((prev) => {
      const nextPage = currentPage + 1;
      const signatureMap = prev[cursorSignature] ?? {};
      const existing = signatureMap[nextPage];
      if (
        existing &&
        existing.cursor === nextCursor &&
        existing.cursorId === nextCursorId
      ) {
        return prev;
      }

      return {
        ...prev,
        [cursorSignature]: {
          ...signatureMap,
          [nextPage]: {
            cursor: nextCursor,
            cursorId: nextCursorId,
          },
        },
      };
    });
  }, [cursorSignature, currentPage, query.data]);

  const goToPageWithCursor = useCallback(
    (page: number) => {
      if (page === currentPage + 1) {
        storeNextCursor();
      }
      goToPage(page);
    },
    [currentPage, goToPage, storeNextCursor]
  );

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
    goToPage: goToPageWithCursor,
    setPageSize,
    refetch: query.refetch,
  };
}
