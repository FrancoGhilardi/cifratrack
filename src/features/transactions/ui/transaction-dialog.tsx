"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { useTransaction } from "../hooks/useTransaction";
import { useTransactionMutations } from "../hooks/useTransactionMutations";
import { Skeleton } from "@/shared/ui/skeleton";
import { BRAND_SERIF } from "@/shared/ui/brand-fonts";
import type { CreateTransactionInput } from "@/entities/transaction/model/transaction.schema";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId?: string | null;
  onSuccess?: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transactionId,
  onSuccess,
}: TransactionDialogProps) {
  const isEditing = !!transactionId;
  const { data: transaction, isLoading } = useTransaction(
    transactionId || null,
  );
  const mutations = useTransactionMutations();

  // Reset cuando se cierra el dialog
  useEffect(() => {
    if (!open && transactionId) {
      // Limpiar estado si es necesario
    }
  }, [open, transactionId]);

  const handleSubmit = async (data: CreateTransactionInput) => {
    try {
      if (isEditing && transactionId) {
        await mutations.update.mutateAsync({
          id: transactionId,
          data: data as unknown as Parameters<
            typeof mutations.update.mutateAsync
          >[0]["data"],
        });
      } else {
        await mutations.create.mutateAsync(
          data as unknown as Parameters<typeof mutations.create.mutateAsync>[0],
        );
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // El error se muestra vía toast (useTransactionMutations) y en el form
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto sm:max-h-[90vh] sm:max-w-3xl">
        <DialogHeader className="pr-8">
          <DialogTitle
            style={{ fontFamily: BRAND_SERIF }}
            className="text-[20px] font-medium tracking-tight"
          >
            {isEditing ? "Editar movimiento" : "Nuevo movimiento"}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            {isEditing
              ? "Modificá los datos del movimiento y guardá los cambios."
              : "Completá los datos para crear un nuevo movimiento."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <TransactionForm
            transaction={transaction}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={mutations.create.isPending || mutations.update.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
