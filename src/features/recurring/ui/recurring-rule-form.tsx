"use client";

import { useCallback, useEffect } from "react";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { CreateRecurringRuleInput } from "@/entities/recurring-rule/model/recurring-rule.schema";
import { usePaymentMethods } from "@/features/payment-methods/hooks/usePaymentMethods";
import { CategorySplitInput } from "@/features/transactions/ui/category-split-input";
import { Month } from "@/shared/lib/date";
import { useDialogForm } from "@/shared/lib/hooks";
import { formatErrorMessage } from "@/shared/lib/utils/error-messages";
import {
  centsToPesos,
  pesosTocents,
  validateSplitsSum,
} from "@/shared/lib/utils/money-conversion";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { RecurringRuleDTO } from "../model/recurring-rule.dto";

const formSchema = z.object({
  title: z
    .string()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  amount: z.coerce
    .number()
    .positive("El monto debe ser mayor a cero")
    .max(21000000, "El monto excede el límite permitido por el sistema ($21M)"),
  kind: z.enum(["income", "expense"]),
  dayOfMonth: z.number().int().min(1, "Día mínimo 1").max(31, "Día máximo 31"),
  status: z.enum(["pending", "paid"]),
  paymentMethodId: z.string().uuid().optional(),
  activeFromMonth: z.string(),
  activeToMonth: z.string().optional().nullable(),
  categories: z
    .array(
      z.object({
        categoryId: z.string().uuid(),
        allocatedAmount: z.number().int().positive(),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRecurringRuleInput) => Promise<void>;
  rule?: RecurringRuleDTO | null;
}

export function RecurringRuleForm({
  open,
  onOpenChange,
  onSubmit,
  rule,
}: RecurringRuleFormProps) {
  const getDefaultValues = useCallback(
    (): FormValues => ({
      title: rule?.title ?? "",
      description: rule?.description ?? "",
      amount: rule ? centsToPesos(rule.amount) : 0,
      kind: rule?.kind ?? "expense",
      dayOfMonth: rule?.dayOfMonth ?? 1,
      status: rule?.status ?? "pending",
      paymentMethodId: rule?.paymentMethodId ?? undefined,
      activeFromMonth: rule?.activeFromMonth ?? Month.current().toString(),
      activeToMonth: rule?.activeToMonth ?? "",
      categories: rule?.categories ?? [],
    }),
    [rule],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  const { apiError, setApiError, clearError } = useDialogForm(
    form,
    open,
    getDefaultValues,
  );
  const { data: paymentMethods } = usePaymentMethods();

  const watchAmount = useWatch({ control: form.control, name: "amount" });
  const watchKind = useWatch({ control: form.control, name: "kind" });
  const amountInCents = watchAmount ? pesosTocents(watchAmount) : 0;

  useEffect(() => {
    if (open) {
      clearError();
    }
  }, [clearError, open]);

  const handleSubmit = async (values: FormValues) => {
    const amount = pesosTocents(values.amount);

    if (
      values.categories &&
      values.categories.length > 0 &&
      !validateSplitsSum(values.categories, amount)
    ) {
      form.setError("categories", {
        type: "manual",
        message: "La suma de categorías debe coincidir con el monto total",
      });
      return;
    }

    const payload: CreateRecurringRuleInput = {
      title: values.title,
      description: values.description ?? null,
      amount,
      kind: values.kind,
      dayOfMonth: values.dayOfMonth,
      status: values.status,
      paymentMethodId: values.paymentMethodId ?? null,
      activeFromMonth: values.activeFromMonth,
      activeToMonth: values.activeToMonth || null,
      categories: values.categories ?? [],
    };

    try {
      clearError();
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error : "Error desconocido";
      setApiError(formatErrorMessage(message));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto sm:max-h-[90vh] sm:max-w-3xl">
        <DialogHeader className="pr-8">
          <DialogTitle>
            {rule ? "Editar regla" : "Nueva regla recurrente"}
          </DialogTitle>
          <DialogDescription>
            Define los datos de la regla recurrente y actualiza la misma regla
            cuando necesites cambiarla.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Datos básicos</h3>
                <p className="text-sm text-muted-foreground">
                  Define qué movimiento se generará y con qué importe.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <FormField
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Ingreso</SelectItem>
                            <SelectItem value="expense">Egreso</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Alquiler"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Notas internas o contexto adicional"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto (ARS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Programación</h3>
                <p className="text-sm text-muted-foreground">
                  Configura cuándo se genera la regla y cómo se registra.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dayOfMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día del mes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          className="h-11"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Forma de pago (opcional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecciona forma de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods?.map((paymentMethod) => (
                              <SelectItem
                                key={paymentMethod.id}
                                value={paymentMethod.id}
                              >
                                {paymentMethod.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Vigencia</h3>
                <p className="text-sm text-muted-foreground">
                  Define desde cuándo corre la regla y, si hace falta, hasta qué
                  mes permanece activa.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="activeFromMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activo desde</FormLabel>
                      <FormControl>
                        <Input
                          type="month"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activeToMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activo hasta (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="month"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Categorías</h3>
                <p className="text-sm text-muted-foreground">
                  Puedes dejar una sola categoría o dividir el monto en varias.
                </p>
              </div>

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CategorySplitInput
                        kind={watchKind}
                        totalAmount={amountInCents}
                        value={field.value ?? []}
                        onChange={(splits) => field.onChange(splits)}
                        error={
                          form.formState.errors.categories?.message as string
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>

            {apiError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
            )}

            <DialogFooter className="pt-1">
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
                  : rule
                    ? "Guardar cambios"
                    : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
