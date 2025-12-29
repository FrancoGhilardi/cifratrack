import { useEffect, useRef, useState } from 'react';

/**
 * Hook robusto y genérico para debouncing de búsquedas.
 * - Solo dispara si hay al menos minLength caracteres (default: 2)
 * - Delay configurable (default: 300ms)
 * - Normaliza espacios
 * - Previene race conditions
 * - Permite deshabilitar el debounce
 */
export function useSearchDebounce({
  value,
  delay = 300,
  minLength = 2,
  enabled = true,
  caseInsensitive = true,
  onDebounced,
}: {
  value: string;
  delay?: number;
  minLength?: number;
  enabled?: boolean;
  /**
   * Normaliza el valor a minúsculas para búsquedas case-insensitive
   * @default true
   */
  caseInsensitive?: boolean;
  onDebounced: (debounced: string | undefined) => void;
}) {
  const [internal, setInternal] = useState(value);
  const lastCall = useRef(0);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  useEffect(() => {
    if (!enabled) return;
    const normalized = internal.trim();
    const searchTerm = caseInsensitive ? normalized.toLocaleLowerCase() : normalized;

    if (searchTerm.length > 0 && searchTerm.length < minLength) {
      onDebounced(undefined);
      return;
    }
    const callId = ++lastCall.current;
    const handler = setTimeout(() => {
      if (callId === lastCall.current) {
        onDebounced(searchTerm.length >= minLength ? searchTerm : undefined);
      }
    }, delay);
    return () => clearTimeout(handler);
  }, [internal, delay, minLength, enabled, caseInsensitive, onDebounced]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternal(e.target.value);
  };

  return {
    value: internal,
    onChange,
  };
}
