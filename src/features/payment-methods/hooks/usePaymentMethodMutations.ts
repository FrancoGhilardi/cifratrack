import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentMethodsApi } from "../api/payment-methods.api";
import { paymentMethodsKeys } from "../model/query-keys";
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";
import { toast } from "@/shared/lib/toast";

/**
 * Hook para las mutaciones de payment methods
 */
export function usePaymentMethodMutations() {
  const queryClient = useQueryClient();

  const createPaymentMethod = useMutation({
    mutationFn: (input: CreatePaymentMethodInput) =>
      paymentMethodsApi.create(input),
    onSuccess: () => {
      // Invalidar todas las listas de payment methods
      queryClient.invalidateQueries({
        queryKey: paymentMethodsKeys.lists(),
      });
      toast.success("Forma de pago creada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Error al crear forma de pago"),
  });

  const updatePaymentMethod = useMutation({
    mutationFn: ({ id, ...input }: UpdatePaymentMethodInput & { id: string }) =>
      paymentMethodsApi.update(id, input),
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle específico
      queryClient.invalidateQueries({
        queryKey: paymentMethodsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: paymentMethodsKeys.detail(variables.id),
      });
      toast.success("Forma de pago actualizada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Error al actualizar forma de pago"),
  });

  const deletePaymentMethod = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.delete(id),
    onSuccess: () => {
      // Invalidar todas las listas
      queryClient.invalidateQueries({
        queryKey: paymentMethodsKeys.lists(),
      });
      toast.success("Forma de pago eliminada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Error al eliminar forma de pago"),
  });

  return {
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
}
