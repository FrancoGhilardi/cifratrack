"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { formatCurrency } from "@/shared/lib/money";
import {
  calculateRemainingAmount,
  centsToString,
  parseInputToCents,
} from "@/shared/lib/utils/money-conversion";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export interface CategorySplit {
  categoryId: string;
  allocatedAmount: number;
}

interface CategorySplitInputProps {
  kind: "income" | "expense";
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
  const [isSplitMode, setIsSplitMode] = useState(value.length > 1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [inputAmount, setInputAmount] = useState<string>("");

  useEffect(() => {
    if (
      !isSplitMode &&
      value.length === 1 &&
      value[0].allocatedAmount !== totalAmount
    ) {
      onChange([{ ...value[0], allocatedAmount: totalAmount }]);
    }
  }, [isSplitMode, onChange, totalAmount, value]);

  const totalAllocated = value.reduce(
    (sum, split) => sum + split.allocatedAmount,
    0,
  );
  const remaining = calculateRemainingAmount(value, totalAmount);

  const availableCategories =
    categories?.filter(
      (category) => !value.some((split) => split.categoryId === category.id),
    ) || [];

  const handleAddSplit = () => {
    if (!selectedCategoryId || !inputAmount) {
      return;
    }

    const amount = parseInputToCents(inputAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      return;
    }

    if (totalAllocated + amount > totalAmount) {
      return;
    }

    onChange([
      ...value,
      { categoryId: selectedCategoryId, allocatedAmount: amount },
    ]);
    setSelectedCategoryId("");
    setInputAmount("");
  };

  const handleRemoveSplit = (categoryId: string) => {
    onChange(value.filter((split) => split.categoryId !== categoryId));
  };

  const handleUpdateAmount = (categoryId: string, newAmount: number) => {
    onChange(
      value.map((split) =>
        split.categoryId === categoryId
          ? { ...split, allocatedAmount: newAmount }
          : split,
      ),
    );
  };

  const handleAutoAssign = () => {
    if (value.length === 1) {
      onChange([{ ...value[0], allocatedAmount: totalAmount }]);
    }
  };

  const handleSimpleCategoryChange = (categoryId: string) => {
    if (categoryId === "none") {
      onChange([]);
      return;
    }

    onChange([{ categoryId, allocatedAmount: totalAmount }]);
  };

  const toggleMode = () => {
    const nextMode = !isSplitMode;
    setIsSplitMode(nextMode);

    if (!nextMode && value.length > 1) {
      onChange([]);
    } else if (!nextMode && value.length === 1) {
      onChange([{ ...value[0], allocatedAmount: totalAmount }]);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return (
      categories?.find((category) => category.id === categoryId)?.name ||
      "Desconocida"
    );
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Label>Distribución por categorías</Label>
          <p className="text-sm text-muted-foreground">
            {isSplitMode
              ? "Divide el monto entre varias categorías y controla el saldo restante."
              : "Asigna el monto completo a una sola categoría."}
          </p>
          {isSplitMode && (
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(totalAmount, "ARS")} | Asignado:{" "}
              {formatCurrency(totalAllocated, "ARS")} | Restante:{" "}
              <span
                className={remaining < 0 ? "font-medium text-destructive" : ""}
              >
                {formatCurrency(remaining, "ARS")}
              </span>
            </p>
          )}
        </div>

        {totalAmount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className="h-10 w-full text-sm text-muted-foreground hover:text-foreground sm:w-auto"
          >
            {isSplitMode ? "Modo simple" : "Dividir categorías"}
          </Button>
        )}
      </div>

      {!isSplitMode && totalAmount > 0 && (
        <div className="space-y-2">
          <Label>Seleccionar categoría</Label>
          <Select
            value={value[0]?.categoryId ?? "none"}
            onValueChange={handleSimpleCategoryChange}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Seleccionar categoría</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!isSplitMode && totalAmount <= 0 && (
        <p className="text-sm text-muted-foreground">
          Ingresa un monto para seleccionar categorías.
        </p>
      )}

      {isSplitMode && (
        <>
          {value.length > 0 && (
            <div className="space-y-3">
              {value.map((split) => (
                <div
                  key={split.categoryId}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <Badge variant="outline" className="w-fit">
                    {getCategoryName(split.categoryId)}
                  </Badge>

                  <div className="flex flex-1 items-center gap-2 sm:justify-end">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={centsToString(split.allocatedAmount)}
                      onChange={(e) => {
                        const amount = parseInputToCents(e.target.value);
                        if (!Number.isNaN(amount) && amount >= 0) {
                          handleUpdateAmount(split.categoryId, amount);
                        }
                      }}
                      className="h-10 flex-1 sm:max-w-40"
                      aria-label={`Monto asignado a ${getCategoryName(split.categoryId)}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSplit(split.categoryId)}
                      aria-label={`Quitar ${getCategoryName(split.categoryId)}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {value.length === 1 && remaining !== 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoAssign}
                  className="h-10 w-full"
                >
                  Asignar todo el monto a esta categoría
                </Button>
              )}
            </div>
          )}

          {availableCategories.length > 0 && remaining > 0 && (
            <div className="grid gap-3 rounded-xl border border-dashed bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_150px_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="category-select">Categoría</Label>
                <Select
                  value={selectedCategoryId || "none"}
                  onValueChange={(value) =>
                    setSelectedCategoryId(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger id="category-select" className="h-11">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seleccionar categoría</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
                  className="h-11"
                />
              </div>

              <Button
                type="button"
                onClick={handleAddSplit}
                disabled={!selectedCategoryId || !inputAmount}
                className="h-11 w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          )}

          {value.length === 0 && (
            <p className="text-sm italic text-muted-foreground">
              Agrega al menos una categoría para continuar.
            </p>
          )}
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isSplitMode && value.length === 0 && (
        <p className="text-sm italic text-muted-foreground">
          Selecciona una categoría para continuar.
        </p>
      )}
    </div>
  );
}
