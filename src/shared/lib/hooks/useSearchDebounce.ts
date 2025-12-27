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
  onDebounced,
}: {
  value: string;
  delay?: number;
  minLength?: number;
  enabled?: boolean;
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
    if (normalized.length > 0 && normalized.length < minLength) {
      onDebounced(undefined);
      return;
    }
    const callId = ++lastCall.current;
    const handler = setTimeout(() => {
      if (callId === lastCall.current) {
        onDebounced(normalized.length >= minLength ? normalized : undefined);
      }
    }, delay);
    return () => clearTimeout(handler);
  }, [internal, delay, minLength, enabled, onDebounced]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternal(e.target.value);
  };

  return {
    value: internal,
    onChange,
  };
}
