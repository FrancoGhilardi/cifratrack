import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /**
   * Ícono de Lucide para mostrar
   */
  icon: LucideIcon;
  /**
   * Título del estado vacío
   */
  title: string;
  /**
   * Descripción opcional
   */
  description?: string;
  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
}

/**
 * Componente reutilizable para mostrar estados vacíos
 */
export function EmptyState({ icon: Icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="rounded-full bg-muted/50 p-3 mb-3">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70">{description}</p>
      )}
    </div>
  );
}
