import { createCrudMutations } from "@/shared/lib/create-crud-mutations";
import { paymentMethodsApi } from "../api/payment-methods.api";
import { paymentMethodsKeys } from "../model/query-keys";
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";

const usePaymentMethodCrudMutations = createCrudMutations<
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput
>({
  entityLabel: "Forma de pago",
  api: paymentMethodsApi,
  queryKeys: paymentMethodsKeys,
});

/**
 * Hook para las mutaciones de payment methods
 */
export function usePaymentMethodMutations() {
  const {
    create,
    update,
    delete: deleteMutation,
    isLoading,
  } = usePaymentMethodCrudMutations();

  return {
    createPaymentMethod: create,
    updatePaymentMethod: update,
    deletePaymentMethod: deleteMutation,
    isLoading,
  };
}
