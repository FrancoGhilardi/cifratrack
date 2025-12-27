'use client';

import { Skeleton } from './skeleton';

interface FormFieldsSkeletonProps {
  rows?: number;
  actionWidth?: number;
}

/**
 * Skeleton simple para formularios verticales.
 */
export function FormFieldsSkeleton({ rows = 3, actionWidth = 128 }: FormFieldsSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-10 w-full" />
      ))}
      <div style={{ width: `${actionWidth}px` }}>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
