import { useMemo } from 'react';
import { usePaymentMethods } from './usePaymentMethods';

type Params = {
  isActive?: boolean;
};

/**
 * Hook para obtener un mapa id → nombre de formas de pago.
 */
export function usePaymentMethodNameMap(params?: Params) {
  const { data, isLoading } = usePaymentMethods(params);

  const map = useMemo(() => {
    const result = new Map<string, string>();
    data?.forEach((pm) => result.set(pm.id, pm.name));
    return result;
  }, [data]);

  return { map, isLoading, paymentMethods: data };
}
