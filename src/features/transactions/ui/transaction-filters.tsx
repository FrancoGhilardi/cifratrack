'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchDebounce } from '@/shared/lib/hooks/useSearchDebounce';
import { Search, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { usePaymentMethods } from '@/features/payment-methods/hooks/usePaymentMethods';
import { Month } from '@/shared/lib/date';

export interface TransactionFiltersProps {
  month?: string;
  kind?: 'income' | 'expense';
  status?: 'pending' | 'paid';
  paymentMethodId?: string;
  categoryIds?: string[];
  q?: string;
  onFiltersChange: (filters: {
    month?: string;
    kind?: 'income' | 'expense';
    status?: 'pending' | 'paid';
    paymentMethodId?: string;
    categoryIds?: string[];
    q?: string;
  }) => void;
  onReset: () => void;
}

export function TransactionFilters({
  month,
  kind,
  status,
  paymentMethodId,
  categoryIds = [],
  q,
  onFiltersChange,
  onReset,
}: TransactionFiltersProps) {
  const { data: incomeCategories } = useCategories({ kind: 'income' });
  const { data: expenseCategories } = useCategories({ kind: 'expense' });
  const { data: paymentMethods } = usePaymentMethods({ isActive: true });

  // Obtener categorías según el tipo seleccionado
  const availableCategories = kind === 'income'
    ? incomeCategories || []
    : kind === 'expense'
    ? expenseCategories || []
    : [...(incomeCategories || []), ...(expenseCategories || [])];

  const handleMonthChange = useCallback(
    (newMonth: string) => {
      onFiltersChange({ month: newMonth });
    },
    [onFiltersChange]
  );

  const handleKindChange = useCallback(
    (newKind: string) => {
      const kindValue = newKind === 'all' ? undefined : (newKind as 'income' | 'expense');
      // Si cambia el tipo, resetear las categorías seleccionadas
      onFiltersChange({ kind: kindValue, categoryIds: [] });
    },
    [onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      onFiltersChange({ status: newStatus === 'all' ? undefined : (newStatus as 'pending' | 'paid') });
    },
    [onFiltersChange]
  );

  const handlePaymentMethodChange = useCallback(
    (newPaymentMethodId: string) => {
      onFiltersChange({ paymentMethodId: newPaymentMethodId === 'all' ? undefined : newPaymentMethodId });
    },
    [onFiltersChange]
  );

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      const newCategoryIds = categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId];
      
      onFiltersChange({ categoryIds: newCategoryIds.length > 0 ? newCategoryIds : undefined });
    },
    [categoryIds, onFiltersChange]
  );

  // Búsqueda robusta con debounce genérico
  const [searchValue, setSearchValue] = useState(q ?? '');
  useSearchDebounce({
    value: searchValue,
    delay: 300,
    minLength: 2,
    enabled: true,
    onDebounced: (debounced) => {
      if (debounced !== q) {
        onFiltersChange({ q: debounced });
      }
    },
  });
  useEffect(() => {
    // Mantener el input sincronizado con q externo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(q ?? '');
  }, [q]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const getCategoryName = (categoryId: string) => {
    return availableCategories.find((c) => c.id === categoryId)?.name || 'Desconocida';
  };

  const getPaymentMethodName = (id: string) => {
    return paymentMethods?.find((pm) => pm.id === id)?.name || 'Desconocida';
  };

  // Contar filtros activos
  const activeFiltersCount = [
    kind,
    status,
    paymentMethodId,
    categoryIds.length > 0,
    q,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y reset */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Filtros principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mes */}
        <div className="space-y-2">
          <Label>Mes</Label>
          <Input
            type="month"
            value={month || Month.current().toString()}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={kind || 'all'} onValueChange={handleKindChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Egresos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Forma de pago */}
        <div className="space-y-2">
          <Label>Forma de pago</Label>
          <Select value={paymentMethodId || 'all'} onValueChange={handlePaymentMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las formas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las formas</SelectItem>
              {paymentMethods?.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>
                  {pm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de categorías (multi-select con badges) */}
      {availableCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Categorías</Label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const isSelected = categoryIds.includes(category.id);
              return (
                <Badge
                  key={category.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  {category.name}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {kind && (
            <Badge variant="secondary">
              {kind === 'income' ? 'Ingresos' : 'Egresos'}
              <button
                onClick={() => onFiltersChange({ kind: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {status && (
            <Badge variant="secondary">
              {status === 'pending' ? 'Pendiente' : 'Pagado'}
              <button
                onClick={() => onFiltersChange({ status: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {paymentMethodId && (
            <Badge variant="secondary">
              {getPaymentMethodName(paymentMethodId)}
              <button
                onClick={() => onFiltersChange({ paymentMethodId: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {categoryIds.map((categoryId) => (
            <Badge key={categoryId} variant="secondary">
              {getCategoryName(categoryId)}
              <button
                onClick={() => handleCategoryToggle(categoryId)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {q && (
            <Badge variant="secondary">
              Búsqueda: &quot;{q}&quot;
              <button
                onClick={() => onFiltersChange({ q: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
