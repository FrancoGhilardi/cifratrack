'use client';

import { useState } from 'react';
import { Pencil, Trash2, Repeat } from 'lucide-react';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { DataTable } from '@/shared/ui/data-table';
import { Badge } from '@/shared/ui/badge';
import { formatCurrency } from '@/shared/lib/money';
import type { RecurringRuleDTO } from '../model/recurring-rule.dto';
import { RecurringRuleForm } from './recurring-rule-form';
import { useRecurringRuleMutations } from '../hooks/useRecurringRuleMutations';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useConfirmDialog } from '@/shared/lib/hooks';
import type { CreateRecurringRuleInput } from '@/entities/recurring-rule/model/recurring-rule.schema';
import { useCategoryNameMap } from '@/features/categories/hooks/useCategoryNameMap';
import { usePaymentMethodNameMap } from '@/features/payment-methods/hooks/usePaymentMethodNameMap';

interface RecurringRulesListProps {
  rules: RecurringRuleDTO[];
}

export function RecurringRulesList({ rules }: RecurringRulesListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RecurringRuleDTO | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { createRecurringRule, updateRecurringRule, deleteRecurringRule } = useRecurringRuleMutations();
  const { error, handleConfirm, clearError } = useConfirmDialog();

  const { map: categoryNames } = useCategoryNameMap();
  const { map: paymentMethodNames } = usePaymentMethodNameMap();

  const handleCreate = () => {
    setSelectedRule(null);
    setFormOpen(true);
  };

  const handleEdit = (rule: RecurringRuleDTO) => {
    setSelectedRule(rule);
    setFormOpen(true);
  };

  const handleDelete = (rule: RecurringRuleDTO) => {
    setSelectedRule(rule);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: CreateRecurringRuleInput) => {
    if (selectedRule) {
      await updateRecurringRule.mutateAsync({ id: selectedRule.id, data });
    } else {
      await createRecurringRule.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    await handleConfirm(
      async () => {
        if (selectedRule) {
          await deleteRecurringRule.mutateAsync(selectedRule.id);
          setSelectedRule(null);
        }
      },
      () => {
        setDeleteOpen(false);
      }
    );
  };

  const columns: DataTableColumn<RecurringRuleDTO>[] = [
    {
      header: 'Título',
      accessorKey: 'title',
      className: 'font-medium',
    },
    {
      header: 'Tipo',
      cell: (rule) => (
        <Badge variant={rule.kind === 'income' ? 'default' : 'secondary'}>
          {rule.kind === 'income' ? 'Ingreso' : 'Egreso'}
        </Badge>
      ),
    },
    {
      header: 'Monto',
      cell: (rule) => formatCurrency(rule.amount, 'ARS'),
    },
    {
      header: 'Día',
      cell: (rule) => `Día ${rule.dayOfMonth}`,
    },
    {
      header: 'Estado',
      cell: (rule) => (
        <Badge variant={rule.status === 'paid' ? 'default' : 'outline'}>
          {rule.status === 'paid' ? 'Pagado' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      header: 'Vigencia',
      cell: (rule) => `${rule.activeFromMonth} → ${rule.activeToMonth ?? 'Actual'}`,
    },
    {
      header: 'Forma de pago',
      cell: (rule) => paymentMethodNames.get(rule.paymentMethodId ?? '') ?? '—',
    },
    {
      header: 'Categorías',
      cell: (rule) =>
        rule.categories.length === 0
          ? '—'
          : rule.categories
              .map((cat) => categoryNames.get(cat.categoryId) ?? 'Categoría')
              .join(', '),
    },
  ];

  return (
    <>
      <DataTable
        title="Recurrentes"
        description="Administra reglas recurrentes y genera transacciones automáticamente por mes"
        data={rules}
        columns={columns}
        actions={[
          {
            label: 'Editar',
            icon: Pencil,
            onClick: handleEdit,
            variant: 'ghost',
          },
          {
            label: 'Eliminar',
            icon: Trash2,
            onClick: handleDelete,
            variant: 'ghost',
          },
        ]}
        onCreate={handleCreate}
        createButtonLabel="Nueva regla"
        showCreateButton
        emptyStateIcon={Repeat}
        emptyStateTitle="Sin reglas recurrentes"
        emptyStateDescription="Crea tu primera regla para automatizar tus movimientos."
        getItemKey={(rule) => rule.id}
      />

      <RecurringRuleForm
        open={formOpen}
        onOpenChange={(value) => {
          if (!value) {
            setSelectedRule(null);
          }
          setFormOpen(value);
        }}
        onSubmit={handleFormSubmit}
        rule={selectedRule}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(value) => {
          if (!value) {
            clearError();
          }
          setDeleteOpen(value);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar regla recurrente?"
        description={`Esta acción eliminará "${selectedRule?.title ?? ''}". Si la regla está activa se cerrará a partir del mes anterior.`}
        confirmText="Eliminar"
        isLoading={deleteRecurringRule.isPending}
        loadingText="Eliminando..."
        error={error}
      />
    </>
  );
}
