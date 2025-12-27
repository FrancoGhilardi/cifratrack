import { useState, useCallback } from 'react';

/**
 * Estado para gestionar dialogs de CRUD (Create, Read, Update, Delete)
 */
export interface CrudDialogState {
  isFormOpen: boolean;
  editingId: string | null;
  deleteId: string | null;
}

/**
 * Acciones para gestionar el estado de dialogs CRUD
 */
export interface CrudDialogActions {
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeForm: () => void;
  openDelete: (id: string) => void;
  closeDelete: () => void;
  reset: () => void;
}

/**
 * Hook para gestionar el estado de dialogs en operaciones CRUD
 * Simplifica el manejo de estados para formularios de creación/edición y confirmación de eliminación
 * 
 * @example
 * ```tsx
 * const { state, actions } = useCrudDialogState();
 * 
 * // Abrir dialog de creación
 * <Button onClick={actions.openCreate}>Crear</Button>
 * 
 * // Abrir dialog de edición
 * <Button onClick={() => actions.openEdit(item.id)}>Editar</Button>
 * 
 * // Dialog de formulario
 * <Dialog open={state.isFormOpen} onOpenChange={actions.closeForm}>
 *   <Form itemId={state.editingId} />
 * </Dialog>
 * 
 * // Dialog de confirmación
 * <ConfirmDialog 
 *   open={!!state.deleteId} 
 *   onOpenChange={actions.closeDelete}
 * />
 * ```
 */
export function useCrudDialogState() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    // Delay para que la animación de cierre termine antes de limpiar el ID
    setTimeout(() => setEditingId(null), 300);
  }, []);

  const openDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const closeDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const reset = useCallback(() => {
    setIsFormOpen(false);
    setEditingId(null);
    setDeleteId(null);
  }, []);

  return {
    state: {
      isFormOpen,
      editingId,
      deleteId,
    } as CrudDialogState,
    actions: {
      openCreate,
      openEdit,
      closeForm,
      openDelete,
      closeDelete,
      reset,
    } as CrudDialogActions,
  };
}
