import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Componente base para elementos skeleton con efecto shimmer
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded bg-muted animate-pulse', className)}
    >
      {/* Shimmer animado */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
          animation: 'shimmer 1.5s ease-in-out infinite',
          transform: 'translateX(-100%)',
        }}
      />
    </div>
  );
}
