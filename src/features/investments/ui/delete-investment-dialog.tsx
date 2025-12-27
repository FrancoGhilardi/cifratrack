'use client';

import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import type { InvestmentDTO } from '../model/investment.dto';
import { useCurrency } from '@/shared/lib/hooks';

interface DeleteInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  investment: InvestmentDTO | null;
}

export function DeleteInvestmentDialog({
  open,
  onOpenChange,
  onConfirm,
  investment,
}: DeleteInvestmentDialogProps) {
  const { formatCurrency } = useCurrency();

  if (!investment) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="¿Eliminar inversión?"
      description={`Estás por eliminar la inversión "${investment.title}" en ${investment.platform}. Monto: ${formatCurrency(investment.principal)}, Rendimiento: +${formatCurrency(investment.yield)}. Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
    />
  );
}
