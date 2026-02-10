"use client";

import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { ExternalLink } from "lucide-react";
import { useInvestmentsTable } from "@/features/investments/hooks";
import {
  InvestmentList,
  InvestmentListSkeleton,
  InvestmentSummaryCards,
  InvestmentSummaryCardsSkeleton,
  InvestmentDistributionCharts,
  InvestmentDistributionChartsSkeleton,
} from "@/features/investments/ui";
import { ErrorState } from "@/shared/ui/error-state";

export default function InvestmentsPage() {
  const {
    investments,
    meta,
    params,
    isLoading,
    isFetching,
    error,
    setFilters,
    resetFilters,
    setSort,
    goToPage,
    setPageSize,
  } = useInvestmentsTable();

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Inversiones" />
        <ErrorState message={`Error al cargar inversiones: ${error.message}`} />
      </PageContainer>
    );
  }

  const isInitialLoading = isLoading && investments.length === 0;

  if (isInitialLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Inversiones"
          description="Gestiona tus inversiones y rendimientos"
        />
        <div className="space-y-6">
          <InvestmentSummaryCardsSkeleton />
          <InvestmentDistributionChartsSkeleton />
          <InvestmentListSkeleton />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Inversiones"
        description="Gestiona tus inversiones y rendimientos"
        action={
          <Button
            variant="outline"
            onClick={() => window.open("https://comparatasas.ar/", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Comparar Tasas
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Cards de resumen de inversiones activas */}
        <InvestmentSummaryCards investments={investments} />

        {/* Gráficos de distribución */}
        <InvestmentDistributionCharts investments={investments} />

        <InvestmentList
          investments={investments}
          meta={meta}
          isLoading={isFetching}
          sortBy={params.sortBy ?? "startedOn"}
          sortOrder={params.sortOrder ?? "desc"}
          filters={{ q: params.q, active: params.active }}
          onFiltersChange={setFilters}
          onResetFilters={resetFilters}
          onSortChange={setSort}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          showCreateButton={true}
        />
      </div>
    </PageContainer>
  );
}
