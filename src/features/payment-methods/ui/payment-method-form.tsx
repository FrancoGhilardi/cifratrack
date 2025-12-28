"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  createPaymentMethodSchema,
  type CreatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";
import type { PaymentMethodDTO } from "../api/payment-methods.api";
import { formatErrorMessage } from "@/shared/lib/utils/error-messages";
import { useDialogForm } from "@/shared/lib/hooks";

interface PaymentMethodFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePaymentMethodInput) => Promise<void>;
  paymentMethod?: PaymentMethodDTO | null;
}

export function PaymentMethodForm({
  open,
  onOpenChange,
  onSubmit,
  paymentMethod,
}: PaymentMethodFormProps) {
  const form = useForm({
    resolver: zodResolver(createPaymentMethodSchema),
    mode: "onChange",
    defaultValues: paymentMethod
      ? { name: paymentMethod.name, isActive: paymentMethod.isActive }
      : { name: "", isActive: true },
  });

  const { apiError, setApiError, clearError } = useDialogForm(
    form,
    open,
    () =>
      paymentMethod
        ? { name: paymentMethod.name, isActive: paymentMethod.isActive }
        : { name: "", isActive: true }
  );

  // Limpiar error cuando se abre el modal
  useEffect(() => {
    if (open) {
      clearError();
    }
  }, [open, clearError]);

  const handleClose = () => {
    clearError();
    onOpenChange(false);
  };

  const handleFormSubmit = async (data: CreatePaymentMethodInput) => {
    try {
      clearError();
      await onSubmit(data);
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      setApiError(formatErrorMessage(message));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {paymentMethod ? "Editar" : "Nueva"} forma de pago
          </DialogTitle>
          <DialogDescription>
            {paymentMethod
              ? "Modifica los datos de la forma de pago."
              : "Completa los datos de la nueva forma de pago."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(
            handleFormSubmit as (data: {
              name: string;
              isActive: boolean;
            }) => Promise<void>
          )}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Efectivo, Transferencia, Débito..."
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...form.register("isActive")}
              className="h-4 w-4"
            />
            <Label htmlFor="isActive" className="!mt-0">
              Activa
            </Label>
          </div>

          {apiError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {apiError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              isLoading={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Guardando..."
                : paymentMethod
                  ? "Guardar cambios"
                  : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
