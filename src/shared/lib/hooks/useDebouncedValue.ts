'use client';

import { useEffect, useState } from 'react';

/**
 * Hook simple para obtener un valor debounced.
 * Útil para inputs de búsqueda que no deben disparar requests en cada tecla.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    // Si el valor es igual, no hacer nada
    if (Object.is(debounced, value)) return;

    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay, debounced]);

  return debounced;
}
