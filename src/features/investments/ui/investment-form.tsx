"use client";

import { useCallback, useEffect } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle } from "lucide-react";

import {
  createInvestmentSchema,
  type CreateInvestmentInput,
} from "@/entities/investment/model/investment.schema";
import {
  supportsLiveYieldProvider,
  YIELD_PROVIDERS,
} from "@/features/market-data/config/providers";
import { useLatestYield } from "@/features/market-data/hooks/useLatestYield";
import { useDialogForm } from "@/shared/lib/hooks";
import {
  dateInputToUTCDate,
  getCurrentDateInput,
} from "@/shared/lib/utils/form-data";
import { formatPercentageValue } from "@/shared/lib/utils/percentage";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

import type { InvestmentDTO } from "../model/investment.dto";

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
            yieldProviderId: investment.yieldProviderId || null,
            principal: investment.principal,
            tna: investment.tna,
            days: investment.days,
            isCompound: investment.isCompound,
            startedOn:
              dateInputToUTCDate(investment.startedOn) ??
              new Date(investment.startedOn),
            notes: investment.notes ?? "",
          }
        : {
            platform: "",
            title: "",
            yieldProviderId: null,
            principal: 0,
            tna: 0,
            days: 30,
            isCompound: false,
            startedOn:
              dateInputToUTCDate(getCurrentDateInput()) ?? new Date(),
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

  const isCompound = useWatch({ control: form.control, name: "isCompound" });
  const yieldProviderId = useWatch({
    control: form.control,
    name: "yieldProviderId",
  });
  const hasLiveIntegration = supportsLiveYieldProvider(yieldProviderId);

  const { data: latestYield, isLoading: isLoadingYield } = useLatestYield(
    hasLiveIntegration ? yieldProviderId : null,
  );
  const liveRate =
    typeof latestYield?.rate === "number" ? latestYield.rate : null;
  const hasResolvedLiveRate = liveRate !== null;

  useEffect(() => {
    if (
      hasLiveIntegration &&
      yieldProviderId &&
      hasResolvedLiveRate &&
      latestYield
    ) {
      form.setValue("tna", liveRate, { shouldValidate: true });
    }
  }, [
    form,
    hasLiveIntegration,
    hasResolvedLiveRate,
    liveRate,
    latestYield,
    yieldProviderId,
  ]);

  const { apiError, setApiError, clearError } = useDialogForm(
    form,
    open,
    getDefaultValues,
  );

  useEffect(() => {
    if (open) {
      clearError();
    }
  }, [clearError, open]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setApiError(null);
      await onSubmit({
        ...data,
        days:
          data.isCompound && (!data.days || data.days <= 0) ? null : data.days,
        notes: data.notes?.trim() ? data.notes : null,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      setApiError((error as Error).message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto sm:max-h-[90vh] sm:max-w-3xl">
        <DialogHeader className="pr-8">
          <DialogTitle>
            {investment ? "Editar inversión" : "Nueva inversión"}
          </DialogTitle>
          <DialogDescription>
            {investment
              ? "Actualiza los datos de la inversión y su configuración de rendimiento."
              : "Ingresa los datos de la nueva inversión para empezar a seguir su evolución."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Datos básicos</h3>
              <p className="text-sm text-muted-foreground">
                Identifica la inversión y agrega el contexto necesario para
                reconocerla rápido.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">
                  Plataforma <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="platform"
                  {...form.register("platform")}
                  placeholder="Ej: Mercado Pago, Brubank"
                  className="h-11"
                  autoComplete="off"
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
                  placeholder="Ej: Plazo fijo UVA"
                  className="h-11"
                  autoComplete="off"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <textarea
                id="notes"
                {...form.register("notes")}
                className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Anota condiciones, observaciones o recordatorios sobre esta inversión."
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Rendimiento y capital</h3>
              <p className="text-sm text-muted-foreground">
                Carga el capital inicial y, si corresponde, vincula una tasa en
                vivo para mantener la TNA actualizada.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yieldProviderId">Vincular rendimiento</Label>
              <Controller
                name="yieldProviderId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    value={field.value || "none"}
                  >
                    <SelectTrigger id="yieldProviderId" className="h-11">
                      <SelectValue placeholder="Seleccionar proveedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin vinculación</SelectItem>
                      {Object.entries(YIELD_PROVIDERS).map(([id, config]) => (
                        <SelectItem key={id} value={id}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Al vincular un proveedor podrás recalcular el rendimiento con
                tasas live cuando exista una fuente disponible.
              </p>
              {yieldProviderId && !hasLiveIntegration && (
                <p className="text-[0.8rem] text-muted-foreground">
                  Este proveedor se guarda como referencia, pero hoy no tiene
                  feed live conectado en la app.
                </p>
              )}
              {yieldProviderId &&
                hasLiveIntegration &&
                !isLoadingYield &&
                !hasResolvedLiveRate && (
                  <p className="text-[0.8rem] text-muted-foreground">
                    La integración existe, pero no devolvió una tasa vigente en
                    este momento. Puedes cargar la TNA manualmente.
                  </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  className="h-11"
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
                    disabled={hasLiveIntegration && hasResolvedLiveRate}
                    className={
                      hasLiveIntegration && hasResolvedLiveRate
                        ? "h-11 bg-muted pr-9"
                        : "h-11"
                    }
                    {...form.register("tna", { valueAsNumber: true })}
                    placeholder="45.50"
                  />
                  {isLoadingYield && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>
                {hasLiveIntegration &&
                  yieldProviderId &&
                  latestYield &&
                  typeof latestYield.rate === "number" && (
                    <p className="text-[0.75rem] text-muted-foreground">
                      TNA live: {formatPercentageValue(latestYield.rate)}%.{" "}
                      Actualizado automáticamente el{" "}
                      {latestYield.date?.toLocaleDateString("es-AR")}
                    </p>
                  )}
                {form.formState.errors.tna && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.tna.message}
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-background/70 p-4 xl:col-span-1">
                <div className="flex items-start gap-3">
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
                            form.setValue("days", null, {
                              shouldValidate: true,
                            });
                            form.clearErrors("days");
                          }
                        }}
                        className="mt-0.5"
                      />
                    )}
                  />

                  <div className="space-y-1">
                    <Label htmlFor="isCompound" className="cursor-pointer">
                      Interés compuesto
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Habilita capitalización diaria para inversiones sin plazo
                      fijo obligatorio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Plazo y fecha de inicio</h3>
              <p className="text-sm text-muted-foreground">
                Define cuándo comenzó la inversión y si tiene o no vencimiento.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="days">
                    Días{" "}
                    {!isCompound && <span className="text-red-500">*</span>}
                  </Label>
                  {isCompound && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 cursor-pointer text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[250px]">
                            Déjalo vacío para inversiones indefinidas, como una
                            billetera remunerada. Cárgalo si existe una fecha de
                            vencimiento concreta.
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
                    setValueAs: (value) =>
                      value === "" ? null : Number(value),
                  })}
                  placeholder={isCompound ? "-" : "30"}
                  className="h-11"
                />
                {form.formState.errors.days && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.days.message}
                  </p>
                )}
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="startedOn">
                  Fecha de inicio <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="startedOn"
                  render={({ field }) => (
                    <Input
                      id="startedOn"
                      type="date"
                      className="h-11 min-w-0"
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = dateInputToUTCDate(e.target.value);
                        if (date) {
                          field.onChange(date);
                        }
                      }}
                    />
                  )}
                />
                {form.formState.errors.startedOn && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.startedOn.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {apiError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{apiError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
              className="h-11 w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              isLoading={form.formState.isSubmitting}
              className="h-11 w-full sm:w-auto"
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
