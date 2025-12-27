'use client';

import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useConfirmDialog } from '@/shared/lib/hooks';

interface DeletePaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  paymentMethodName: string;
  isDeleting: boolean;
}

export function DeletePaymentMethodDialog({
  open,
  onOpenChange,
  onConfirm,
  paymentMethodName,
  isDeleting,
}: DeletePaymentMethodDialogProps) {
  const { error, handleConfirm, clearError } = useConfirmDialog();

  const handleConfirmClick = async () => {
    await handleConfirm(onConfirm, () => {
      clearError();
      onOpenChange(false);
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) clearError();
        onOpenChange(newOpen);
      }}
      onConfirm={handleConfirmClick}
      title="¿Eliminar forma de pago?"
      description={`Estás por eliminar la forma de pago "${paymentMethodName}". Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      isLoading={isDeleting}
      loadingText="Eliminando..."
      error={error}
    />
  );
}
