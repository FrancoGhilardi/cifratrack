'use client';

import { PageContainer } from '@/shared/ui/page-container';
import { PageHeader } from '@/shared/ui/page-header';
import { useInvestmentsTable } from '@/features/investments/hooks';
import { InvestmentList, InvestmentListSkeleton } from '@/features/investments/ui';
import { ErrorState } from '@/shared/ui/error-state';

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
        <InvestmentListSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Inversiones"
        description="Gestiona tus inversiones y rendimientos"
      />
      <InvestmentList
        investments={investments}
        meta={meta}
        isLoading={isFetching}
        sortBy={params.sortBy ?? 'startedOn'}
        sortDir={params.sortDir ?? 'desc'}
        filters={{ q: params.q, active: params.active }}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        onSortChange={setSort}
        onPageChange={goToPage}
        onPageSizeChange={setPageSize}
        showCreateButton={true}
      />
    </PageContainer>
  );
}
