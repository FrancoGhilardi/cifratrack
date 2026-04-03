"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { type CreateTransactionInput } from "@/entities/transaction/model/transaction.schema";
import { usePaymentMethods } from "@/features/payment-methods/hooks/usePaymentMethods";
import { Month } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";
import {
  centsToPesos,
  pesosTocents,
  validateSplitsSum,
} from "@/shared/lib/utils/money-conversion";
import {
  getCurrentDateInput,
  isoStringToDateInput,
} from "@/shared/lib/utils/form-data";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
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

import { CategorySplitInput } from "./category-split-input";
import { type TransactionDTO } from "../mappers/transaction.mapper";

const formSchema = z.object({
  kind: z.enum(["income", "expense"]),
  title: z
    .string()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  amount: z.coerce
    .number()
    .positive("El monto debe ser mayor a cero")
    .max(21000000, "El monto excede el límite permitido por el sistema ($21M)"),
  paymentMethodId: z.string().uuid("Selecciona una forma de pago").optional(),
  isFixed: z.boolean().optional(),
  status: z.enum(["pending", "paid"]),
  occurredOn: z.string(),
  dueOn: z.string().optional(),
  paidOn: z.string().optional(),
  split: z
    .array(
      z.object({
        categoryId: z.string().uuid(),
        allocatedAmount: z.number().int().positive(),
      }),
    )
    .min(1, "Debe haber al menos una categoría"),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  transaction?: TransactionDTO;
  onSubmit: (data: CreateTransactionInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const { data: paymentMethods } = usePaymentMethods();
  const isEdit = !!transaction;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    mode: "onChange",
    defaultValues: {
      kind: transaction?.kind ?? "expense",
      title: transaction?.title ?? "",
      description: transaction?.description ?? "",
      amount: transaction?.amount
        ? centsToPesos(transaction.amount)
        : undefined,
      paymentMethodId: transaction?.paymentMethodId ?? undefined,
      isFixed: transaction?.isFixed,
      status: transaction?.status ?? "paid",
      occurredOn:
        isoStringToDateInput(transaction?.occurredOn) ?? getCurrentDateInput(),
      dueOn: isoStringToDateInput(transaction?.dueOn),
      paidOn: isoStringToDateInput(transaction?.paidOn),
      split:
        transaction?.categories.map((category) => ({
          categoryId: category.categoryId,
          allocatedAmount: category.allocatedAmount,
        })) ?? [],
    },
  });

  const watchKind = useWatch({
    control: form.control,
    name: "kind",
    defaultValue: transaction?.kind ?? "expense",
  });
  const watchIsFixed = useWatch({ control: form.control, name: "isFixed" });
  const watchStatus = useWatch({
    control: form.control,
    name: "status",
    defaultValue: transaction?.status ?? "paid",
  });
  const watchAmount = useWatch({ control: form.control, name: "amount" });

  const prevKindRef = useRef(watchKind);
  useEffect(() => {
    if (
      prevKindRef.current !== watchKind &&
      prevKindRef.current !== undefined
    ) {
      form.setValue("split", []);
    }
    prevKindRef.current = watchKind;
  }, [form, watchKind]);

  useEffect(() => {
    if (watchIsFixed && watchKind === "expense") {
      const currentStatus = form.getValues("status");
      if (!currentStatus) {
        form.setValue("status", "pending");
      }
    } else {
      form.setValue("status", "paid");
    }
  }, [form, watchIsFixed, watchKind]);

  const showStatusAndDue = watchIsFixed && watchKind === "expense";
  const showPaidOnField = !showStatusAndDue || watchStatus === "paid";

  useEffect(() => {
    if (!showStatusAndDue || watchStatus !== "pending") {
      return;
    }

    if (!form.getValues("dueOn")) {
      form.setValue("dueOn", form.getValues("occurredOn"));
    }

    if (form.getValues("paidOn")) {
      form.setValue("paidOn", "");
    }
  }, [form, showStatusAndDue, watchStatus]);

  const handleFormSubmit = (values: FormValues) => {
    const amountInCents = pesosTocents(values.amount);

    if (!validateSplitsSum(values.split, amountInCents)) {
      const totalAllocated = values.split.reduce(
        (sum, split) => sum + split.allocatedAmount,
        0,
      );

      form.setError("split", {
        type: "manual",
        message: `La suma de categorías (${centsToPesos(totalAllocated)}) debe ser igual al monto total (${values.amount})`,
      });
      return;
    }

    const normalizedDueOn =
      showStatusAndDue && values.status === "pending"
        ? new Date(values.dueOn || values.occurredOn)
        : values.dueOn
          ? new Date(values.dueOn)
          : null;

    const normalizedPaidOn =
      showStatusAndDue && values.status === "pending"
        ? null
        : values.paidOn
          ? new Date(values.paidOn)
          : null;

    const occurredDate = new Date(values.occurredOn);
    const occurredMonth = Month.fromDate(occurredDate).toString();

    const payload: CreateTransactionInput = {
      kind: values.kind,
      title: values.title,
      description: values.description || null,
      amount: amountInCents,
      currency: "ARS",
      paymentMethodId: values.paymentMethodId || null,
      isFixed: values.isFixed,
      status: values.status,
      occurredOn: occurredDate,
      occurredMonth,
      dueOn: normalizedDueOn,
      paidOn: normalizedPaidOn,
      sourceRecurringRuleId: null,
      split: values.split,
    };

    onSubmit(payload);
  };

  const amountInCents = watchAmount ? Math.round(watchAmount * 100) : 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-5"
      >
        <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Detalle del movimiento</h3>
            <p className="text-sm text-muted-foreground">
              Define el tipo, el nombre y una referencia breve para este
              movimiento.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de movimiento</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEdit}
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
                      placeholder="Ej: Compra supermercado"
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
                    placeholder="Detalles adicionales o contexto útil"
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
            <h3 className="text-sm font-semibold">Monto y medio</h3>
            <p className="text-sm text-muted-foreground">
              Carga el importe y, si corresponde, la forma de pago asociada.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                      inputMode="decimal"
                      placeholder="0.00"
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
              name="paymentMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pago (opcional)</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona una forma de pago" />
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

          {watchKind === "expense" && (
            <FormField
              control={form.control}
              name="isFixed"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-lg border bg-background/70 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Es un gasto fijo recurrente</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Activa seguimiento mensual de estado y vencimiento.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}
        </section>

        <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Fechas y estado</h3>
            <p className="text-sm text-muted-foreground">
              Define cuándo ocurrió el movimiento y su seguimiento si aplica.
            </p>
          </div>

          <div
            className={cn(
              "grid gap-4",
              showStatusAndDue ? "md:grid-cols-3" : "md:grid-cols-2",
            )}
          >
            <FormField
              control={form.control}
              name="occurredOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de ocurrencia</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showStatusAndDue && (
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
            )}

            {showStatusAndDue && (
              <FormField
                control={form.control}
                name="dueOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showPaidOnField && (
              <FormField
                control={form.control}
                name="paidOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de pago (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Categorías</h3>
            <p className="text-sm text-muted-foreground">
              Asigna el monto completo o distribúyelo entre varias categorías.
            </p>
          </div>

          <FormField
            control={form.control}
            name="split"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CategorySplitInput
                    kind={watchKind}
                    totalAmount={amountInCents}
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.split?.message}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="h-11 w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full sm:w-auto"
          >
            {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
