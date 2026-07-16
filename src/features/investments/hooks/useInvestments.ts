import { useQuery } from "@tanstack/react-query";
import { createCrudMutations } from "@/shared/lib/create-crud-mutations";
import { investmentKeys } from "../model/query-keys";
import type {
  InvestmentQueryParams,
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from "../model/investment.dto";
import * as api from "../api/investments.api";

/**
 * Hook para listar inversiones con paginación y filtros
 */
export function useInvestments(params: InvestmentQueryParams) {
  return useQuery({
    queryKey: investmentKeys.list(params as Record<string, unknown>),
    queryFn: () => api.fetchInvestments(params),
  });
}

/**
 * Hook para obtener inversión por ID
 */
export function useInvestment(id: string | null) {
  return useQuery({
    queryKey: investmentKeys.detail(id!),
    queryFn: () => api.fetchInvestmentById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para mutaciones de inversiones (crear, actualizar, eliminar)
 */
export const useInvestmentMutations = createCrudMutations<
  CreateInvestmentInput,
  UpdateInvestmentInput
>({
  entityLabel: "Inversión",
  api: {
    create: api.createInvestment,
    update: api.updateInvestment,
    delete: api.deleteInvestment,
  },
  queryKeys: investmentKeys,
});
