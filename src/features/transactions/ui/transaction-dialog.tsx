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
import { convertDatesToISO } from "@/shared/lib/utils/form-data";
import { logMutationError } from "@/shared/lib/utils/mutation-handlers";
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
      // Mantener nulls para poder limpiar columnas nullable en el update.
      const apiData = convertDatesToISO(data);

      if (isEditing && transactionId) {
        await mutations.update.mutateAsync({
          id: transactionId,
          data: apiData as unknown as Parameters<
            typeof mutations.update.mutateAsync
          >[0]["data"],
        });
      } else {
        await mutations.create.mutateAsync(
          apiData as unknown as Parameters<
            typeof mutations.create.mutateAsync
          >[0],
        );
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logMutationError(isEditing ? "update" : "create", "movimiento", error);
      // El error se muestra en el form
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto sm:max-h-[90vh] sm:max-w-3xl">
        <DialogHeader className="pr-8">
          <DialogTitle>
            {isEditing ? "Editar Movimiento" : "Nuevo Movimiento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del movimiento y guarda los cambios."
              : "Completa los datos para crear un nuevo movimiento."}
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
