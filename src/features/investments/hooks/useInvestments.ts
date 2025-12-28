import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentKeys } from '../model/query-keys';
import type { InvestmentQueryParams } from '../model/investment.dto';
import * as api from '../api/investments.api';
import { toast } from '@/shared/lib/toast';

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
export function useInvestmentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: api.createInvestment,
    onSuccess: () => {
      // Invalidar lista de inversiones
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      toast.success('Inversión creada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear inversión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateInvestment>[1] }) =>
      api.updateInvestment(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lista y detalle específico
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: investmentKeys.detail(variables.id) });
      toast.success('Inversión actualizada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al actualizar inversión'),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteInvestment,
    onSuccess: () => {
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      toast.success('Inversión eliminada');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al eliminar inversión'),
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
