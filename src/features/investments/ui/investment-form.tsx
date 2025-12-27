"use client";

import { useEffect, useCallback } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
  createInvestmentSchema,
  type CreateInvestmentInput,
} from "@/entities/investment/model/investment.schema";
import type { InvestmentDTO } from "../model/investment.dto";
import { useDialogForm } from "@/shared/lib/hooks";

interface InvestmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInvestmentInput) => Promise<void>;
  investment?: InvestmentDTO | null;
}

export function InvestmentForm({
  open,
  onOpenChange,
  onSubmit,
  investment,
}: InvestmentFormProps) {
  const getDefaultValues = useCallback(
    (): CreateInvestmentInput =>
      investment
        ? {
            platform: investment.platform,
            title: investment.title,
            principal: investment.principal,
            tna: investment.tna,
            days: investment.days,
            startedOn: new Date(investment.startedOn),
            notes: investment.notes,
          }
        : {
            platform: "",
            title: "",
            principal: 0,
            tna: 0,
            days: 30,
            startedOn: new Date(),
            notes: "",
          },
    [investment]
  );

  const form = useForm<CreateInvestmentInput>({
    resolver: zodResolver(createInvestmentSchema) as Resolver<CreateInvestmentInput>,
    defaultValues: getDefaultValues(),
  });

  const { apiError, setApiError, clearError } = useDialogForm(
    form,
    open,
    getDefaultValues
  );

  useEffect(() => {
    if (open) {
      clearError();
    }
  }, [open, clearError]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setApiError(null);
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      setApiError((error as Error).message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {investment ? "Editar inversión" : "Nueva inversión"}
          </DialogTitle>
          <DialogDescription>
            {investment
              ? "Modifica los datos de la inversión"
              : "Ingresa los datos de la nueva inversión"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">
                Plataforma <span className="text-red-500">*</span>
              </Label>
              <Input
                id="platform"
                {...form.register("platform")}
                placeholder="ej: Mercado Pago, Brubank"
              />
              {form.formState.errors.platform && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.platform.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="ej: Plazo Fijo UVA"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">
                Monto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="principal"
                type="number"
                step="0.01"
                {...form.register("principal", { valueAsNumber: true })}
                placeholder="10000.00"
              />
              {form.formState.errors.principal && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.principal.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tna">
                TNA % <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tna"
                type="number"
                step="0.01"
                {...form.register("tna", { valueAsNumber: true })}
                placeholder="45.50"
              />
              {form.formState.errors.tna && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.tna.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">
                Días <span className="text-red-500">*</span>
              </Label>
              <Input
                id="days"
                type="number"
                {...form.register("days", { valueAsNumber: true })}
                placeholder="30"
              />
              {form.formState.errors.days && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.days.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startedOn">
              Fecha de inicio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startedOn"
              type="date"
              {...form.register("startedOn", {
                setValueAs: (value) => (value ? new Date(value) : new Date()),
              })}
            />
            {form.formState.errors.startedOn && (
              <p className="text-sm text-red-500">
                {form.formState.errors.startedOn.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              {...form.register("notes")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Notas adicionales sobre la inversión..."
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-500">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {apiError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {apiError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Guardando..."
                : investment
                  ? "Guardar cambios"
                  : "Crear inversión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
