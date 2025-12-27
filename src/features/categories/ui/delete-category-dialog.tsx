'use client';

import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isLoading?: boolean;
}

/**
 * Diálogo de confirmación para eliminar categoría
 */
export function DeleteCategoryDialog({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isLoading,
}: DeleteCategoryDialogProps) {
  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={onClose}
      title="¿Eliminar categoría?"
      description={`Estás por eliminar la categoría ${categoryName}. Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

