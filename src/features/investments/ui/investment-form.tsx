"use client";

import { useEffect, useCallback } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
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
import { YIELD_PROVIDERS } from "@/features/market-data/config/providers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useLatestYield } from "@/features/market-data/hooks/useLatestYield";

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
            yieldProviderId: investment.yieldProviderId ?? undefined,
            principal: investment.principal,
            tna: investment.tna,
            days: investment.days,
            isCompound: investment.isCompound,
            startedOn: new Date(investment.startedOn),
            notes: investment.notes,
          }
        : {
            platform: "",
            title: "",
            yieldProviderId: undefined,
            principal: 0,
            tna: 0,
            days: 30,
            isCompound: false,
            startedOn: new Date(),
            notes: "",
          },
    [investment],
  );

  const form = useForm<CreateInvestmentInput>({
    resolver: zodResolver(
      createInvestmentSchema,
    ) as Resolver<CreateInvestmentInput>,
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  const isCompound = form.watch("isCompound");
  const yieldProviderId = form.watch("yieldProviderId");

  const { data: latestYield, isLoading: isLoadingYield } =
    useLatestYield(yieldProviderId);

  // Auto-update TNA when yield provider changes
  useEffect(() => {
    if (yieldProviderId && latestYield) {
      form.setValue("tna", latestYield.rate);
      // Optional: Auto-fill platform/title if empty?
      // const providerName = YIELD_PROVIDERS[yieldProviderId]?.name;
      // if (!form.getValues("platform")) form.setValue("platform", providerName);
      // if (!form.getValues("title")) form.setValue("title", `${providerName} Money Market`);
    }
  }, [yieldProviderId, latestYield, form]);

  const { apiError, setApiError, clearError } = useDialogForm(
    form,
    open,
    getDefaultValues,
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

          <div className="space-y-2">
            <Label htmlFor="yieldProviderId">
              Vincular Rendimiento (Opcional)
            </Label>
            <Controller
              name="yieldProviderId"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "none" ? null : val)
                  }
                  value={field.value || "none"}
                >
                  <SelectTrigger id="yieldProviderId">
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin vinculación</SelectItem>
                    {Object.entries(YIELD_PROVIDERS).map(([id, cfg]) => (
                      <SelectItem key={id} value={id}>
                        {cfg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Al vincular un proveedor, podrás ver gráficos de rendimiento
              histórico.
            </p>
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
              <div className="relative">
                <Input
                  id="tna"
                  type="number"
                  step="0.01"
                  disabled={!!yieldProviderId}
                  className={yieldProviderId ? "bg-muted pr-8" : ""}
                  {...form.register("tna", { valueAsNumber: true })}
                  placeholder="45.50"
                />
                {isLoadingYield && (
                  <div className="absolute right-2 top-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                )}
              </div>
              {yieldProviderId && latestYield && (
                <p className="text-[0.7rem] text-muted-foreground mt-1">
                  Actualizado automáticamente (
                  {latestYield.date.toLocaleDateString()})
                </p>
              )}
              {form.formState.errors.tna && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.tna.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="days">
                  Días {!isCompound && <span className="text-red-500">*</span>}
                </Label>
                {isCompound && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-pointer text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[250px]">
                          Dejar vacío para inversiones indefinidas (ej:
                          billeteras virtuales). Asignar días si es un plazo
                          fijo con vencimiento.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                id="days"
                type="number"
                {...form.register("days", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
                placeholder={isCompound ? "-" : "30"}
              />
              {form.formState.errors.days && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.days.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <Controller
                control={form.control}
                name="isCompound"
                render={({ field }) => (
                  <Checkbox
                    id="isCompound"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked === true) {
                        form.setValue("days", "" as any);
                      }
                    }}
                  />
                )}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="isCompound" className="cursor-pointer">
                  Interés Compuesto
                </Label>
                <p className="text-xs text-muted-foreground">
                  Habilitar capitalización diaria
                </p>
              </div>
            </div>
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
