'use client';

import { cn } from '@/shared/lib/utils';

interface TableLoadingOverlayProps {
  show: boolean;
  className?: string;
}

/**
 * Overlay ligero para indicar loading sobre una tabla sin ocultar los filtros o el layout.
 * Útil durante refetches.
 */
export function TableLoadingOverlay({ show, className }: TableLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm',
        className
      )}
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}
