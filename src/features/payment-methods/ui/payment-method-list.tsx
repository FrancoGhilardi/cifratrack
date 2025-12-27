'use client';

import { useState } from 'react';
import { Pencil, Trash2, CreditCard } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { DataTable } from '@/shared/ui/data-table';
import type { DataTableColumn } from '@/shared/ui/data-table';
import type { PaymentMethodDTO } from '../api/payment-methods.api';
import { PaymentMethodForm } from './payment-method-form';
import { DeletePaymentMethodDialog } from './delete-payment-method-dialog';
import { usePaymentMethodMutations } from '../hooks/usePaymentMethodMutations';
import type { CreatePaymentMethodInput } from '@/entities/payment-method/model/payment-method.schema';

interface PaymentMethodListProps {
  paymentMethods: PaymentMethodDTO[];
  /**
   * Controla si se muestra el botón de crear forma de pago en el header
   * @default false
   */
  showCreateButton?: boolean;
}

/**
 * Lista de formas de pago con acciones de edición/eliminación
 */
export function PaymentMethodList({
  paymentMethods,
  showCreateButton = false,
}: PaymentMethodListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodDTO | null>(null);

  const { createPaymentMethod, updatePaymentMethod, deletePaymentMethod } =
    usePaymentMethodMutations();

  const handleCreate = () => {
    setSelectedPaymentMethod(null);
    setFormOpen(true);
  };

  const handleEdit = (paymentMethod: PaymentMethodDTO) => {
    setSelectedPaymentMethod(paymentMethod);
    setFormOpen(true);
  };

  const handleDelete = (paymentMethod: PaymentMethodDTO) => {
    setSelectedPaymentMethod(paymentMethod);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreatePaymentMethodInput) => {
    if (selectedPaymentMethod) {
      await updatePaymentMethod.mutateAsync({
        ...data,
        id: selectedPaymentMethod.id,
      });
    } else {
      await createPaymentMethod.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedPaymentMethod) {
      await deletePaymentMethod.mutateAsync(selectedPaymentMethod.id);
      setDeleteDialogOpen(false);
      setSelectedPaymentMethod(null);
    }
  };

  const columns: DataTableColumn<PaymentMethodDTO>[] = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      className: 'font-medium',
    },
    {
      header: 'Estado',
      cell: (pm) => (
        <Badge variant={pm.isActive ? 'default' : 'secondary'}>
          {pm.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      header: 'Tipo',
      cell: (pm) => (
        <Badge variant={pm.isDefault ? 'outline' : 'secondary'}>
          {pm.isDefault ? 'Por defecto' : 'Personalizada'}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Formas de pago"
        description="Administra las formas de pago para tus movimientos"
        data={paymentMethods}
        columns={columns}
        actions={[
          {
            label: 'Editar forma de pago',
            icon: Pencil,
            onClick: handleEdit,
            variant: 'ghost',
            disabled: (pm) => pm.isDefault,
          },
          {
            label: 'Eliminar forma de pago',
            icon: Trash2,
            onClick: handleDelete,
            variant: 'ghost',
            disabled: (pm) => pm.isDefault,
          },
        ]}
        onCreate={handleCreate}
        createButtonLabel="Nueva forma de pago"
        showCreateButton={showCreateButton}
        emptyStateIcon={CreditCard}
        emptyStateTitle="Sin formas de pago"
        emptyStateDescription="No hay formas de pago. Crea una para comenzar."
        getItemKey={(pm) => pm.id}
      />

      <PaymentMethodForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        paymentMethod={selectedPaymentMethod}
      />

      <DeletePaymentMethodDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        paymentMethodName={selectedPaymentMethod?.name || ""}
        isDeleting={deletePaymentMethod.isPending}
      />
    </>
  );
}
