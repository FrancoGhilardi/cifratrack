/**
 * Query keys para TanStack Query (payment methods)
 */
export const paymentMethodsKeys = {
  all: ["payment-methods"] as const,
  lists: () => [...paymentMethodsKeys.all, "list"] as const,
  list: (filters?: { isActive?: boolean }) =>
    [...paymentMethodsKeys.lists(), filters] as const,
  details: () => [...paymentMethodsKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentMethodsKeys.details(), id] as const,
};
