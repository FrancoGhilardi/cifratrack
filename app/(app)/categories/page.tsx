'use client';

import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryList } from '@/features/categories/ui/category-list';
import { CategoryListSkeleton } from '@/features/categories/ui/category-list-skeleton';
import { PageHeader } from '@/shared/ui/page-header';
import { PageContainer } from '@/shared/ui/page-container';
import { getFriendlyErrorMessage } from '@/shared/lib/utils/error-messages';

/**
 * Página de administración de categorías
 */
export default function CategoriesPage() {
  const { data: expenseCategories, isLoading: isLoadingExpenses, error: errorExpenses } =
    useCategories({ kind: 'expense', isActive: undefined });

  const { data: incomeCategories, isLoading: isLoadingIncome, error: errorIncome } =
    useCategories({ kind: 'income', isActive: undefined });

  const isLoading = isLoadingExpenses || isLoadingIncome;
  const error = errorExpenses || errorIncome;
  const friendlyErrorMessage = getFriendlyErrorMessage(error);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Gestiona las categorías de tus ingresos y egresos"
      />

      <PageContainer
        isLoading={isLoading}
        error={error}
        errorMessage={friendlyErrorMessage}
        loadingSkeleton={
          <div className="space-y-6">
            <CategoryListSkeleton />
            <CategoryListSkeleton />
          </div>
        }
      >
        <div className="space-y-6">
          <CategoryList categories={expenseCategories || []} kind="expense" showCreateButton />
          <CategoryList categories={incomeCategories || []} kind="income" />
        </div>
      </PageContainer>
    </div>
  );
}
