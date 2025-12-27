'use client';

import { useState } from 'react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { X, Plus } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/money';
import {
  pesosTocents,
  centsToPesos,
  centsToString,
  parseInputToCents,
  calculateRemainingAmount,
} from '@/shared/lib/utils/money-conversion';

export interface CategorySplit {
  categoryId: string;
  allocatedAmount: number;
}

interface CategorySplitInputProps {
  kind: 'income' | 'expense';
  totalAmount: number;
  value: CategorySplit[];
  onChange: (splits: CategorySplit[]) => void;
  error?: string;
}

export function CategorySplitInput({
  kind,
  totalAmount,
  value,
  onChange,
  error,
}: CategorySplitInputProps) {
  const { data: categories, isLoading } = useCategories({ kind });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<string>('');

  // Calcular total asignado y restante
  const totalAllocated = value.reduce((sum, split) => sum + split.allocatedAmount, 0);
  const remaining = calculateRemainingAmount(value, totalAmount);

  // Categorías disponibles (no seleccionadas aún)
  const availableCategories = categories?.filter(
    (cat) => !value.some((split) => split.categoryId === cat.id)
  ) || [];

  const handleAddSplit = () => {
    if (!selectedCategoryId || !inputAmount) return;

    const amount = parseInputToCents(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    // No permitir exceder el total
    if (totalAllocated + amount > totalAmount) {
      return;
    }

    onChange([...value, { categoryId: selectedCategoryId, allocatedAmount: amount }]);
    setSelectedCategoryId('');
    setInputAmount('');
  };

  const handleRemoveSplit = (categoryId: string) => {
    onChange(value.filter((split) => split.categoryId !== categoryId));
  };

  const handleUpdateAmount = (categoryId: string, newAmount: number) => {
    onChange(
      value.map((split) =>
        split.categoryId === categoryId
          ? { ...split, allocatedAmount: newAmount }
          : split
      )
    );
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c) => c.id === categoryId)?.name || 'Desconocida';
  };

  // Auto-asignar todo el monto si solo hay un split
  const handleAutoAssign = () => {
    if (value.length === 1) {
      onChange([{ ...value[0], allocatedAmount: totalAmount }]);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando categorías...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Distribución por categorías</Label>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(totalAmount, 'ARS')} | Asignado:{' '}
          {formatCurrency(totalAllocated, 'ARS')} | Restante:{' '}
          <span className={remaining < 0 ? 'text-destructive font-medium' : ''}>
            {formatCurrency(remaining, 'ARS')}
          </span>
        </p>
      </div>

      {/* Splits actuales */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((split) => (
            <div
              key={split.categoryId}
              className="flex items-center gap-2 p-3 rounded-lg border bg-card"
            >
              <Badge variant="outline" className="shrink-0">
                {getCategoryName(split.categoryId)}
              </Badge>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={centsToString(split.allocatedAmount)}
                onChange={(e) => {
                  const amount = parseInputToCents(e.target.value);
                  if (!isNaN(amount) && amount >= 0) {
                    handleUpdateAmount(split.categoryId, amount);
                  }
                }}
                className="w-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSplit(split.categoryId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {value.length === 1 && remaining !== 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoAssign}
              className="w-full"
            >
              Asignar todo el monto a esta categoría
            </Button>
          )}
        </div>
      )}

      {/* Agregar nuevo split */}
      {availableCategories.length > 0 && remaining > 0 && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="category-select">Categoría</Label>
            <select
              id="category-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Seleccionar categoría</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <Label htmlFor="amount-input">Monto</Label>
            <Input
              id="amount-input"
              type="number"
              step="0.01"
              min="0"
              max={(remaining / 100).toFixed(2)}
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddSplit}
            disabled={!selectedCategoryId || !inputAmount}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Agrega al menos una categoría para continuar
        </p>
      )}
    </div>
  );
}
