'use client';

import { useState } from 'react';

/**
 * Hook para manejar la navegación entre meses en formato YYYY-MM
 */
export function useMonthNavigation() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  /**
   * Obtener el mes actual del sistema
   */
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  /**
   * Navegar al mes anterior
   */
  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  /**
   * Navegar al mes siguiente
   */
  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  /**
   * Navegar al mes actual
   */
  const goToCurrentMonth = () => {
    setCurrentMonth(getCurrentMonth());
  };

  /**
   * Verificar si el mes seleccionado es el mes actual
   */
  const isCurrentMonth = (): boolean => {
    return currentMonth === getCurrentMonth();
  };

  /**
   * Formatear el mes para mostrar (ej: "diciembre 2025")
   */
  const formatMonth = (month: string = currentMonth): string => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
  };

  return {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    formatMonth,
  };
}
