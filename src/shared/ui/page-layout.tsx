import { ReactNode } from 'react';
import { PageHeader, PageHeaderProps } from './page-header';
import { PageContainer, PageContainerProps } from './page-container';

export interface PageLayoutProps extends PageHeaderProps, Omit<PageContainerProps, 'children'> {
  /**
   * Contenido de la página
   */
  children: ReactNode;
}

/**
 * Layout completo para páginas que combina PageHeader y PageContainer
 * Proporciona una estructura consistente para todas las páginas de la app
 * 
 * @example
 * ```tsx
 * <PageLayout
 *   title="Categorías"
 *   description="Gestiona tus categorías"
 *   actionIcon={Plus}
 *   actionText="Nueva Categoría"
 *   onAction={handleCreate}
 *   isLoading={isLoading}
 *   error={error}
 *   loadingSkeleton={<CategoryListSkeleton />}
 * >
 *   <CategoryList categories={categories} />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  title,
  description,
  action,
  actionIcon,
  actionText,
  onAction,
  children: headerChildren,
  isLoading,
  error,
  errorMessage,
  loadingSkeleton,
  skeletonCount,
  showReloadButton,
  children,
}: PageLayoutProps & { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={action}
        actionIcon={actionIcon}
        actionText={actionText}
        onAction={onAction}
      >
        {headerChildren}
      </PageHeader>

      <PageContainer
        isLoading={isLoading}
        error={error}
        errorMessage={errorMessage}
        loadingSkeleton={loadingSkeleton}
        skeletonCount={skeletonCount}
        showReloadButton={showReloadButton}
      >
        {children}
      </PageContainer>
    </div>
  );
}
