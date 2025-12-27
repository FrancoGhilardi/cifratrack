import { useQuery } from "@tanstack/react-query";
import { paymentMethodsApi } from "../api/payment-methods.api";
import { paymentMethodsKeys } from "../model/query-keys";

/**
 * Hook para obtener la lista de formas de pago
 */
export function usePaymentMethods(params?: { isActive?: boolean }) {
  return useQuery({
    queryKey: paymentMethodsKeys.list(params),
    queryFn: () => paymentMethodsApi.list(params),
  });
}

/**
 * Hook para obtener una forma de pago por ID
 */
export function usePaymentMethod(id: string) {
  return useQuery({
    queryKey: paymentMethodsKeys.detail(id),
    queryFn: () => paymentMethodsApi.getById(id),
    enabled: !!id,
  });
}
