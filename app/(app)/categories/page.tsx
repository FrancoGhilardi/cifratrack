'use client';

import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryList } from '@/features/categories/ui/category-list';
import { CategoryListSkeleton } from '@/features/categories/ui/category-list-skeleton';
import { ErrorState } from '@/shared/ui/error-state';
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las categorías de tus ingresos y egresos
        </p>
      </div>

      {/* Mensaje de error */}
      {error && !isLoading && (
        <ErrorState
          message={friendlyErrorMessage}
          showReloadButton
        />
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-6">
          <CategoryListSkeleton />
          <CategoryListSkeleton />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Categorías de Egresos */}
          <CategoryList categories={expenseCategories || []} kind="expense" showCreateButton />

          {/* Categorías de Ingresos */}
          <CategoryList categories={incomeCategories || []} kind="income" />
        </div>
      )}
    </div>
  );
}
