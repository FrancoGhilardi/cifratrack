import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "@/shared/lib/toast";

type CrudApi<TCreate, TUpdate, TItem> = {
  create: (data: TCreate) => Promise<TItem>;
  update: (id: string, data: TUpdate) => Promise<TItem>;
  delete: (id: string) => Promise<unknown>;
};

type CrudQueryKeys = {
  lists: () => QueryKey;
  detail: (id: string) => QueryKey;
};

/**
 * Factory para el patrón de mutaciones CRUD repetido en cada feature:
 * create/update/delete + invalidación de lista/detalle + toast de éxito/error.
 * `entityLabel` va en género femenino (ej. "Categoría", "Inversión") porque
 * todos los sufijos de toast ("creada"/"actualizada"/"eliminada") lo son.
 */
export function createCrudMutations<TCreate, TUpdate, TItem = unknown>(config: {
  entityLabel: string;
  api: CrudApi<TCreate, TUpdate, TItem>;
  queryKeys: CrudQueryKeys;
  /** Invalidaciones extra además de lists() (ej. summaries, dashboard). */
  extraInvalidate?: (queryClient: QueryClient) => void;
}) {
  return function useCrudMutations() {
    const queryClient = useQueryClient();
    const label = config.entityLabel.toLowerCase();

    const invalidateLists = () => {
      queryClient.invalidateQueries({ queryKey: config.queryKeys.lists() });
      config.extraInvalidate?.(queryClient);
    };

    const create = useMutation({
      mutationFn: config.api.create,
      onSuccess: () => {
        invalidateLists();
        toast.success(`${config.entityLabel} creada`);
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : `Error al crear ${label}`),
    });

    const update = useMutation({
      mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
        config.api.update(id, data),
      onSuccess: (_, variables) => {
        invalidateLists();
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.detail(variables.id),
        });
        toast.success(`${config.entityLabel} actualizada`);
      },
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : `Error al actualizar ${label}`
        ),
    });

    const deleteMutation = useMutation({
      mutationFn: config.api.delete,
      onSuccess: () => {
        invalidateLists();
        toast.success(`${config.entityLabel} eliminada`);
      },
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : `Error al eliminar ${label}`
        ),
    });

    return {
      create,
      update,
      delete: deleteMutation,
      isLoading: create.isPending || update.isPending || deleteMutation.isPending,
    };
  };
}
