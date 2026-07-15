import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCrudMutations } from "@/shared/lib/create-crud-mutations";
import { recurringApi } from "../api/recurring.api";
import { recurringKeys } from "../model/query-keys";
import { transactionKeys } from "@/features/transactions/model/query-keys";
import { dashboardKeys } from "@/features/dashboard/model/query-keys";
import { toast } from "@/shared/lib/toast";
import type {
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
} from "@/entities/recurring-rule/model/recurring-rule.schema";

const useRecurringRuleCrudMutations = createCrudMutations<
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput
>({
  entityLabel: "Regla recurrente",
  api: recurringApi,
  queryKeys: recurringKeys,
});

export function useRecurringRuleMutations() {
  const queryClient = useQueryClient();
  const {
    create,
    update,
    delete: deleteMutation,
    isLoading,
  } = useRecurringRuleCrudMutations();

  const generateRecurringTransactions = useMutation({
    mutationFn: (month: string) => recurringApi.generate(month),
    onSuccess: (_result, month) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary(month) });
      toast.success("Transacciones recurrentes generadas");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al generar transacciones",
      ),
  });

  return {
    createRecurringRule: create,
    updateRecurringRule: update,
    deleteRecurringRule: deleteMutation,
    generateRecurringTransactions,
    isLoading,
  };
}
