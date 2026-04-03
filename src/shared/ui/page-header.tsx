import { ReactNode } from "react";
import { Button } from "./button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
  const actionElement =
    action ||
    (actionText && onAction && (
      <Button onClick={onAction} className="w-full sm:w-auto">
        {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
        {actionText}
      </Button>
    ));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actionElement && (
          <div
            className={cn(
              "w-full md:w-auto md:shrink-0",
              "[&>*]:w-full md:[&>*]:w-auto",
            )}
          >
            {actionElement}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
