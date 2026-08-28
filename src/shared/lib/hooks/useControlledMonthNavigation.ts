"use client";

import { useCallback, useMemo } from "react";
import { Month } from "@/shared/lib/date";
import { formatMonthLabel } from "@/shared/lib/utils/month-label";

interface UseControlledMonthNavigationParams {
  /** Mes vigente en formato YYYY-MM. Fuente de verdad externa (URL, store). */
  month: string;
  onMonthChange: (month: string) => void;
}

/**
 * Navegación de mes para pantallas donde el mes NO vive en el hook
 * (en movimientos vive en la URL). El panel sigue usando
 * `useMonthNavigation`, que mantiene su propio estado.
 */
export function useControlledMonthNavigation({
  month,
  onMonthChange,
}: UseControlledMonthNavigationParams) {
  const current = Month.current().toString();
  const safeMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : current;

  const goToPreviousMonth = useCallback(() => {
    onMonthChange(Month.parse(safeMonth).previous().toString());
  }, [onMonthChange, safeMonth]);

  const goToNextMonth = useCallback(() => {
    onMonthChange(Month.parse(safeMonth).next().toString());
  }, [onMonthChange, safeMonth]);

  const goToCurrentMonth = useCallback(() => {
    onMonthChange(current);
  }, [current, onMonthChange]);

  const monthLabel = useMemo(() => formatMonthLabel(safeMonth), [safeMonth]);

  return {
    month: safeMonth,
    monthLabel,
    isCurrentMonth: safeMonth === current,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
