import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * Hook para manejar formularios en dialogs
 * Centraliza la lógica de manejo de errores API y reset de formularios
 */
export function useDialogForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  isOpen: boolean,
  getDefaultValues: () => T
) {
  const [apiError, setApiError] = useState<string | null>(null);

  // Resetear form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const values = getDefaultValues();
      form.reset(values);
    }
  }, [isOpen, getDefaultValues, form]);

  const clearError = useCallback(() => setApiError(null), []);

  return {
    apiError,
    setApiError,
    clearError,
  };
}
