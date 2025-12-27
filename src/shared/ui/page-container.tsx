import { ReactNode } from 'react';
import { ErrorState } from './error-state';
import { Skeleton } from './skeleton';

export interface PageContainerProps {
  /**
   * Contenido de la página
   */
  children: ReactNode;
  /**
   * Estado de carga
   */
  isLoading?: boolean;
  /**
   * Error a mostrar
   */
  error?: Error | null;
  /**
   * Mensaje de error personalizado
   */
  errorMessage?: string;
  /**
   * Componente de skeleton personalizado
   */
  loadingSkeleton?: ReactNode;
  /**
   * Número de skeletons a mostrar (si no se proporciona loadingSkeleton)
   */
  skeletonCount?: number;
  /**
   * Mostrar botón de recarga en error
   */
  showReloadButton?: boolean;
}

/**
 * Contenedor reutilizable para páginas con manejo de loading y error states
 * Simplifica el patrón común de mostrar loading, error o contenido
 * 
 * @example
 * ```tsx
 * <PageContainer
 *   isLoading={isLoading}
 *   error={error}
 *   loadingSkeleton={<CategoryListSkeleton />}
 * >
 *   <CategoryList categories={categories} />
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  isLoading,
  error,
  errorMessage,
  loadingSkeleton,
  skeletonCount = 3,
  showReloadButton = true,
}: PageContainerProps) {
  // Mostrar error si existe y no está cargando
  if (error && !isLoading) {
    return (
      <ErrorState
        message={errorMessage || error.message || 'Ha ocurrido un error'}
        showReloadButton={showReloadButton}
      />
    );
  }

  // Mostrar loading state
  if (isLoading) {
    if (loadingSkeleton) {
      return <>{loadingSkeleton}</>;
    }
    
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Mostrar contenido
  return <>{children}</>;
}
