"use client";

import { createCrudMutations } from "@/shared/lib/create-crud-mutations";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions.api";
import { transactionKeys } from "../model/query-keys";
import { dashboardKeys } from "@/features/dashboard/model/query-keys";

type CreateTransactionInput = Parameters<typeof createTransaction>[0];
type UpdateTransactionInput = Parameters<typeof updateTransaction>[1];

/**
 * Hook para mutaciones de transacciones (crear, actualizar, eliminar)
 */
export const useTransactionMutations = createCrudMutations<
  CreateTransactionInput,
  UpdateTransactionInput
>({
  entityLabel: "Transacción",
  api: {
    create: createTransaction,
    update: updateTransaction,
    delete: deleteTransaction,
  },
  queryKeys: transactionKeys,
  extraInvalidate: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  },
});
