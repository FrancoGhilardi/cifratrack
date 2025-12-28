import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringApi } from '../api/recurring.api';
import { recurringKeys } from '../model/query-keys';
import { transactionKeys } from '@/features/transactions/model/query-keys';
import { dashboardKeys } from '@/features/dashboard/model/query-keys';

export function useRecurringRuleMutations() {
  const queryClient = useQueryClient();

  const invalidateRecurring = () => {
    queryClient.invalidateQueries({ queryKey: recurringKeys.all });
  };

  const createRecurringRule = useMutation({
    mutationFn: recurringApi.create,
    onSuccess: () => {
      invalidateRecurring();
    },
  });

  const updateRecurringRule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof recurringApi.update>[1] }) =>
      recurringApi.update(id, data),
    onSuccess: (_, variables) => {
      invalidateRecurring();
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(variables.id) });
    },
  });

  const deleteRecurringRule = useMutation({
    mutationFn: recurringApi.delete,
    onSuccess: () => {
      invalidateRecurring();
    },
  });

  const generateRecurringTransactions = useMutation({
    mutationFn: (month: string) => recurringApi.generate(month),
    onSuccess: (_result, month) => {
      invalidateRecurring();
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary(month) });
    },
  });

  return {
    createRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    generateRecurringTransactions,
  };
}
