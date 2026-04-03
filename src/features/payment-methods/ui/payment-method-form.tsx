"use client";

import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
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

type PaymentMethodFormValues = z.input<typeof createPaymentMethodSchema>;

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
  const getDefaultValues = useCallback(
    (): PaymentMethodFormValues =>
      paymentMethod
        ? { name: paymentMethod.name, isActive: paymentMethod.isActive }
        : { name: "", isActive: true },
    [paymentMethod],
  );

  const form = useForm<
    PaymentMethodFormValues,
    undefined,
    CreatePaymentMethodInput
  >({
    resolver: zodResolver(createPaymentMethodSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  const { apiError, setApiError, clearError } = useDialogForm(
    form,
    open,
    getDefaultValues,
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
      <DialogContent className="sm:max-w-md">
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
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Efectivo, Transferencia, Débito..."
              className="h-11"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/70 px-3 py-3">
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Checkbox
                  id="isActive"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) =>
                    field.onChange(Boolean(checked))
                  }
                  className="mt-0.5"
                />
              )}
            />
            <div className="space-y-1">
              <Label htmlFor="isActive" className="cursor-pointer !mt-0">
                Activa
              </Label>
              <p className="text-sm text-muted-foreground">
                Si la desactivas, no se ofrecerá como opción para nuevos
                movimientos.
              </p>
            </div>
          </div>

          {apiError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              {apiError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              isLoading={form.formState.isSubmitting}
              className="w-full sm:w-auto"
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
