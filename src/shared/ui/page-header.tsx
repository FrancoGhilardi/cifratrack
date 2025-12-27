import { ReactNode } from 'react';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  /**
   * Título principal de la página
   */
  title: string;
  /**
   * Descripción o subtítulo opcional
   */
  description?: string;
  /**
   * Acción principal (típicamente un botón de crear)
   */
  action?: ReactNode;
  /**
   * Icono opcional para el botón de acción
   */
  actionIcon?: LucideIcon;
  /**
   * Texto del botón de acción
   */
  actionText?: string;
  /**
   * Handler del botón de acción
   */
  onAction?: () => void;
  /**
   * Contenido adicional que se muestra debajo del header
   */
  children?: ReactNode;
}

/**
 * Componente reutilizable para headers de página
 * Proporciona un layout consistente con título, descripción y acción opcional
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Categorías"
 *   description="Gestiona las categorías de tus ingresos y egresos"
 *   actionIcon={Plus}
 *   actionText="Nueva Categoría"
 *   onAction={() => setIsFormOpen(true)}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  action,
  actionIcon: ActionIcon,
  actionText,
  onAction,
  children,
}: PageHeaderProps) {
  // Si se proporciona un action custom, usarlo
  const actionElement = action || (
    actionText && onAction && (
      <Button onClick={onAction}>
        {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
        {actionText}
      </Button>
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        {actionElement && <div>{actionElement}</div>}
      </div>
      {children}
    </div>
  );
}
