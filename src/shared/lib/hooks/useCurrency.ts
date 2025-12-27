'use client';

import { useMemo } from 'react';

interface UseCurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Hook para formatear montos en pesos argentinos
 * Los montos se almacenan como enteros (centavos) y se convierten a ARS
 */
export function useCurrency(options: UseCurrencyOptions = {}) {
  const {
    locale = 'es-AR',
    currency = 'ARS',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      }),
    [locale, currency, minimumFractionDigits, maximumFractionDigits]
  );

  /**
   * Formatear un monto de centavos a moneda
   * @param amountInCents - Monto en centavos (ej: 100000 = $1.000,00)
   */
  const format = (amountInCents: number): string => {
    const value = amountInCents / 100;
    return formatter.format(value);
  };

  /**
   * Formatear un monto decimal directo a moneda
   * @param amount - Monto en formato decimal (ej: 1000.00 = $1.000,00)
   */
  const formatCurrency = (amount: number): string => {
    return formatter.format(amount);
  };

  return { format, formatCurrency };
}
