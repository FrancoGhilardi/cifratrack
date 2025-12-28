'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { CategorySplitInput } from './category-split-input';
import { type CreateTransactionInput } from '@/entities/transaction/model/transaction.schema';
import { type TransactionDTO } from '../mappers/transaction.mapper';
import { usePaymentMethods } from '@/features/payment-methods/hooks/usePaymentMethods';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Month } from '@/shared/lib/date';
import { pesosTocents, centsToPesos, validateSplitsSum } from '@/shared/lib/utils/money-conversion';
import { isoStringToDateInput, getCurrentDateInput } from '@/shared/lib/utils/form-data';

/**
 * Schema para el formulario
 * Extiende el schema de creación pero permite montos en pesos (se convierten a centavos)
 */
const formSchema = z.object({
  kind: z.enum(['income', 'expense']),
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  amount: z.number().positive('El monto debe ser mayor a cero'),
  paymentMethodId: z.string().uuid('Selecciona una forma de pago').optional(),
  isFixed: z.boolean().optional(),
  status: z.enum(['pending', 'paid']),
  occurredOn: z.string(), // Se maneja como string en el form (input date)
  dueOn: z.string().optional(),
  paidOn: z.string().optional(),
  split: z.array(z.object({
    categoryId: z.string().uuid(),
    allocatedAmount: z.number().int().positive(),
  })).min(1, 'Debe haber al menos una categoría'),
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
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      kind: transaction?.kind ?? 'expense',
      title: transaction?.title ?? '',
      description: transaction?.description ?? '',
      amount: transaction?.amount ? centsToPesos(transaction.amount) : undefined,
      paymentMethodId: transaction?.paymentMethodId ?? undefined,
      isFixed: transaction?.isFixed,
      status: transaction?.status ?? 'paid',
      occurredOn: isoStringToDateInput(transaction?.occurredOn) ?? getCurrentDateInput(),
      dueOn: isoStringToDateInput(transaction?.dueOn),
      paidOn: isoStringToDateInput(transaction?.paidOn),
      split: transaction?.categories.map((cat) => ({
        categoryId: cat.categoryId,
        allocatedAmount: cat.allocatedAmount,
      })) ?? [],
    },
  });

  // Observar campos relevantes
  const watchKind = useWatch({ control: form.control, name: 'kind', defaultValue: transaction?.kind ?? 'expense' });
  const watchIsFixed = useWatch({ control: form.control, name: 'isFixed' });
  const watchAmount = useWatch({ control: form.control, name: 'amount' });

  // Limpiar splits cuando cambia el tipo (income <-> expense)
  const prevKindRef = useRef(watchKind);
  useEffect(() => {
    if (prevKindRef.current !== watchKind && prevKindRef.current !== undefined) {
      form.setValue('split', []);
    }
    prevKindRef.current = watchKind;
  }, [watchKind, form]);

  // Ajustar status cuando cambia isFixed
  useEffect(() => {
    if (watchIsFixed && watchKind === 'expense') {
      const currentStatus = form.getValues('status');
      if (!currentStatus) {
        form.setValue('status', 'pending');
      }
    } else {
      form.setValue('status', 'paid');
    }
  }, [watchIsFixed, watchKind, form]);

  const handleFormSubmit = (values: FormValues) => {
    // Convertir el monto a centavos
    const amountInCents = pesosTocents(values.amount);

    // Validar que la suma de splits coincida con el monto total
    if (!validateSplitsSum(values.split, amountInCents)) {
      const totalAllocated = values.split.reduce(
        (sum, split) => sum + split.allocatedAmount,
        0
      );
      form.setError('split', {
        type: 'manual',
        message: `La suma de categorías (${centsToPesos(totalAllocated)}) debe ser igual al monto total (${values.amount})`,
      });
      return;
    }

    // Convertir valores del formulario al formato de CreateTransactionInput
    const occurredDate = new Date(values.occurredOn);
    const occurredMonth = Month.fromDate(occurredDate).toString();

    const payload: CreateTransactionInput = {
      kind: values.kind,
      title: values.title,
      description: values.description || null,
      amount: amountInCents,
      currency: 'ARS',
      paymentMethodId: values.paymentMethodId || null,
      isFixed: values.isFixed,
      status: values.status,
      occurredOn: occurredDate,
      occurredMonth,
      dueOn: values.dueOn ? new Date(values.dueOn) : null,
      paidOn: values.paidOn ? new Date(values.paidOn) : null,
      sourceRecurringRuleId: null,
      split: values.split,
    };

    onSubmit(payload);
  };

  const showStatusAndDue = watchIsFixed && watchKind === 'expense';
  const amountInCents = watchAmount ? Math.round(watchAmount * 100) : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Tipo de movimiento */}
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
                  disabled={isEdit} // No permitir cambiar el tipo en edición
                >
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

        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Compra supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Detalles adicionales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Monto */}
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
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Forma de pago */}
        <FormField
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de pago (opcional)</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una forma de pago" />
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

        {/* Es fijo? (solo para gastos) */}
        {watchKind === 'expense' && (
          <FormField
            control={form.control}
            name="isFixed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Es un gasto fijo recurrente</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Estado y fecha de vencimiento (solo si es gasto fijo) */}
        {showStatusAndDue && (
          <>
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
              name="dueOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vencimiento (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Fecha de ocurrencia */}
        <FormField
          control={form.control}
          name="occurredOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de ocurrencia</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de pago (opcional) */}
        <FormField
          control={form.control}
          name="paidOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de pago (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categorías (splits) */}
        <FormField
          control={form.control}
          name="split"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categorías</FormLabel>
              <FormControl>
                <CategorySplitInput
                  kind={watchKind}
                  totalAmount={amountInCents}
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.split?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
