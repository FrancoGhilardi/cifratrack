import { useState } from 'react';
import { formatErrorMessage } from '../utils/error-messages';

/**
 * Hook para manejar confirmaciones de eliminación
 * Centraliza la lógica de manejo de errores en dialogs de confirmación
 */
export function useConfirmDialog() {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (
    onConfirm: () => Promise<void>,
    onSuccess?: () => void
  ) => {
    try {
      setError(null);
      await onConfirm();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(formatErrorMessage(message));
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    handleConfirm,
    clearError,
  };
}
