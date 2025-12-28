'use client';

import { useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { usePaymentMethods } from '@/features/payment-methods/hooks/usePaymentMethods';
import { centsToPesos, pesosTocents, validateSplitsSum } from '@/shared/lib/utils/money-conversion';
import { CategorySplitInput } from '@/features/transactions/ui/category-split-input';
import { Month } from '@/shared/lib/date';
import type { RecurringRuleDTO } from '../model/recurring-rule.dto';
import type { CreateRecurringRuleInput } from '@/entities/recurring-rule/model/recurring-rule.schema';
import { useDialogForm } from '@/shared/lib/hooks';
import { formatErrorMessage } from '@/shared/lib/utils/error-messages';

const formSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  amount: z.number().positive('El monto debe ser mayor a cero'),
  kind: z.enum(['income', 'expense']),
  dayOfMonth: z.number().int().min(1, 'Día mínimo 1').max(31, 'Día máximo 31'),
  status: z.enum(['pending', 'paid']),
  paymentMethodId: z.string().uuid().optional(),
  activeFromMonth: z.string(),
  activeToMonth: z.string().optional().nullable(),
  categories: z
    .array(
      z.object({
        categoryId: z.string().uuid(),
        allocatedAmount: z.number().int().positive(),
      })
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

export function RecurringRuleForm({ open, onOpenChange, onSubmit, rule }: RecurringRuleFormProps) {
  const getDefaultValues = useCallback((): FormValues => ({
    title: rule?.title ?? '',
    description: rule?.description ?? '',
    amount: rule ? centsToPesos(rule.amount) : 0,
    kind: rule?.kind ?? 'expense',
    dayOfMonth: rule?.dayOfMonth ?? 1,
    status: rule?.status ?? 'pending',
    paymentMethodId: rule?.paymentMethodId ?? undefined,
    activeFromMonth: rule?.activeFromMonth ?? Month.current().toString(),
    activeToMonth: rule?.activeToMonth ?? '',
    categories: rule?.categories ?? [],
  }), [rule]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { apiError, setApiError, clearError } = useDialogForm(form, open, getDefaultValues);
  const { data: paymentMethods } = usePaymentMethods();

  const watchAmount = useWatch({ control: form.control, name: 'amount' });
  const watchKind = useWatch({ control: form.control, name: 'kind' });
  const amountInCents = watchAmount ? pesosTocents(watchAmount) : 0;

  useEffect(() => {
    if (open) {
      clearError();
    }
  }, [open, clearError]);

  const handleSubmit = async (values: FormValues) => {
    const amount = pesosTocents(values.amount);
    if (values.categories && values.categories.length > 0 && !validateSplitsSum(values.categories, amount)) {
      form.setError('categories', {
        type: 'manual',
        message: 'La suma de categorías debe coincidir con el monto total',
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
      const message = error instanceof Error ? error : 'Error desconocido';
      setApiError(formatErrorMessage(message));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar regla' : 'Nueva regla recurrente'}</DialogTitle>
          <DialogDescription>
            Define los datos de la regla recurrente. Las actualizaciones generan una nueva versión a partir del mes actual.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Alquiler" {...field} />
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
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
                name="dayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día del mes</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={31} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
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
                  <FormItem>
                    <FormLabel>Forma de pago (opcional)</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona forma de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods?.map((pm) => (
                            <SelectItem key={pm.id} value={pm.id}>
                              {pm.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
            </div>

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorías (opcional)</FormLabel>
                  <FormControl>
                    <CategorySplitInput
                      kind={watchKind}
                      totalAmount={amountInCents}
                      value={field.value ?? []}
                      onChange={(splits) => field.onChange(splits)}
                      error={form.formState.errors.categories?.message as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {apiError && <p className="text-sm text-destructive">{apiError}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} isLoading={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : rule ? 'Guardar cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
