'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction, updateTransaction, deleteTransaction } from '../api/transactions.api';
import { transactionKeys } from '../model/query-keys';

/**
 * Hook para mutaciones de transacciones (crear, actualizar, eliminar)
 */
export function useTransactionMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidar todas las listas de transacciones
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Invalidar el resumen del dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTransaction>[1] }) =>
      updateTransaction(id, data),
    onSuccess: (_, variables) => {
      // Invalidar la transacción específica
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Invalidar el dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Invalidar el dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    isLoading:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
