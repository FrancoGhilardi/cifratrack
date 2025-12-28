import { cn } from '@/shared/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

/**
 * Spinner minimalista para estados de carga.
 */
export function Spinner({ size = 'sm', className }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  }[size];

  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses,
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}
