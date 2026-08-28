"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchDebounce } from "@/shared/lib/hooks/useSearchDebounce";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { SegmentedToggle } from "@/shared/ui/segmented-toggle";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { usePaymentMethods } from "@/features/payment-methods/hooks/usePaymentMethods";
import { getCategoryColor } from "@/shared/lib/category-colors";
import { cn } from "@/shared/lib/utils";

export interface TransactionFiltersBarProps {
  kind?: "income" | "expense";
  status?: "pending" | "paid";
  paymentMethodId?: string;
  categoryIds?: string[];
  q?: string;
  onFiltersChange: (filters: {
    kind?: "income" | "expense";
    status?: "pending" | "paid";
    paymentMethodId?: string;
    categoryIds?: string[];
    q?: string;
  }) => void;
  onReset: () => void;
}

const KIND_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Egresos" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "paid", label: "Pagado" },
  { value: "pending", label: "Pendiente" },
] as const;

export function TransactionFiltersBar({
  kind,
  status,
  paymentMethodId,
  categoryIds = [],
  q,
  onFiltersChange,
  onReset,
}: TransactionFiltersBarProps) {
  const { data: incomeCategories } = useCategories({ kind: "income" });
  const { data: expenseCategories } = useCategories({ kind: "expense" });
  const { data: paymentMethods } = usePaymentMethods({ isActive: true });

  // Obtener categorías según el tipo seleccionado
  const availableCategories =
    kind === "income"
      ? incomeCategories || []
      : kind === "expense"
        ? expenseCategories || []
        : [...(incomeCategories || []), ...(expenseCategories || [])];

  const handleKindChange = useCallback(
    (newKind: string) => {
      const kindValue =
        newKind === "all" ? undefined : (newKind as "income" | "expense");
      // Si cambia el tipo, resetear las categorías seleccionadas
      onFiltersChange({ kind: kindValue, categoryIds: [] });
    },
    [onFiltersChange],
  );

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      onFiltersChange({
        status:
          newStatus === "all" ? undefined : (newStatus as "pending" | "paid"),
      });
    },
    [onFiltersChange],
  );

  const handlePaymentMethodChange = useCallback(
    (newPaymentMethodId: string) => {
      onFiltersChange({
        paymentMethodId:
          newPaymentMethodId === "all" ? undefined : newPaymentMethodId,
      });
    },
    [onFiltersChange],
  );

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      const newCategoryIds = categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId];

      onFiltersChange({
        categoryIds: newCategoryIds.length > 0 ? newCategoryIds : undefined,
      });
    },
    [categoryIds, onFiltersChange],
  );

  // Búsqueda robusta con debounce genérico
  const [searchValue, setSearchValue] = useState(q ?? "");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    categoryIds.length > 0 || !!kind || !!status || !!paymentMethodId,
  );

  useSearchDebounce({
    value: searchValue,
    delay: 300,
    minLength: 2,
    enabled: true,
    caseInsensitive: false,
    onDebounced: (debounced) => {
      if (debounced !== q) {
        onFiltersChange({ q: debounced });
      }
    },
  });
  useEffect(() => {
    // Mantener el input sincronizado con q externo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(q ?? "");
  }, [q]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const getCategoryName = (categoryId: string) => {
    return (
      availableCategories.find((c) => c.id === categoryId)?.name ||
      "Desconocida"
    );
  };

  const getPaymentMethodName = (id: string) => {
    return paymentMethods?.find((pm) => pm.id === id)?.name || "Desconocida";
  };

  // Contar filtros activos
  const activeFiltersCount = [
    kind,
    status,
    paymentMethodId,
    categoryIds.length > 0,
    q,
  ].filter(Boolean).length;
  const advancedFiltersCount = [
    kind,
    status,
    paymentMethodId,
    categoryIds.length > 0,
  ].filter(Boolean).length;
  const advancedFiltersVisible =
    showAdvancedFilters || advancedFiltersCount > 0;

  const renderSegmentedFilters = () => (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Tipo
        </span>
        <SegmentedToggle
          value={kind ?? "all"}
          onChange={handleKindChange}
          options={KIND_OPTIONS}
          ariaLabel="Filtrar por tipo de movimiento"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Estado
        </span>
        <SegmentedToggle
          value={status ?? "all"}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          ariaLabel="Filtrar por estado"
        />
      </div>

      <div className="flex min-w-[13rem] items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Pago
        </span>
        <Select
          value={paymentMethodId || "all"}
          onValueChange={handlePaymentMethodChange}
        >
          <SelectTrigger
            className="h-9 rounded-full text-[13px]"
            aria-label="Filtrar por forma de pago"
          >
            <SelectValue placeholder="Todas" />
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
  );

  return (
    <div className="space-y-4">
      {/* Búsqueda + reset */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción"
            value={searchValue}
            onChange={handleSearchChange}
            aria-label="Buscar movimientos"
            className="h-10 rounded-full pl-9 text-[13.5px]"
          />
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 shrink-0 rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Disclosure mobile */}
      <div className="md:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAdvancedFilters((current) => !current)}
          className="flex h-10 w-full items-center justify-between rounded-full px-3"
        >
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros avanzados
            {advancedFiltersCount > 0 && (
              <span className="rounded-full bg-app-nav-active px-1.5 py-0.5 text-app-nav-accent">
                {advancedFiltersCount}
              </span>
            )}
          </span>
          {advancedFiltersVisible ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Segmentados: siempre visibles en desktop, en disclosure en mobile */}
      <div className="hidden md:block">{renderSegmentedFilters()}</div>
      <div
        className={cn(
          "space-y-4 border-t border-border/60 pt-4 md:hidden",
          !advancedFiltersVisible && "hidden",
        )}
      >
        {renderSegmentedFilters()}
      </div>

      {/* Categorías: chips con color de la rampa */}
      {availableCategories.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap gap-2",
            !advancedFiltersVisible && "hidden md:flex",
          )}
        >
          {availableCategories.map((category, index) => {
            const isSelected = categoryIds.includes(category.id);
            const color = getCategoryColor(index);

            return (
              <button
                key={category.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => handleCategoryToggle(category.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-nav-accent)]",
                  isSelected
                    ? "border-transparent bg-app-nav-active text-app-nav-accent"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ background: color }}
                />
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
          {kind && (
            <span className="inline-flex items-center gap-1 rounded-full bg-app-nav-active px-2.5 py-1 font-mono text-[10.5px] text-app-nav-accent">
              {kind === "income" ? "Ingresos" : "Egresos"}
              <button
                type="button"
                onClick={() => onFiltersChange({ kind: undefined })}
                aria-label={`Quitar filtro: ${kind === "income" ? "Ingresos" : "Egresos"}`}
                className="hover:text-app-neg"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-1 rounded-full bg-app-nav-active px-2.5 py-1 font-mono text-[10.5px] text-app-nav-accent">
              {status === "pending" ? "Pendiente" : "Pagado"}
              <button
                type="button"
                onClick={() => onFiltersChange({ status: undefined })}
                aria-label={`Quitar filtro: ${status === "pending" ? "Pendiente" : "Pagado"}`}
                className="hover:text-app-neg"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {paymentMethodId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-app-nav-active px-2.5 py-1 font-mono text-[10.5px] text-app-nav-accent">
              {getPaymentMethodName(paymentMethodId)}
              <button
                type="button"
                onClick={() => onFiltersChange({ paymentMethodId: undefined })}
                aria-label={`Quitar filtro: ${getPaymentMethodName(paymentMethodId)}`}
                className="hover:text-app-neg"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {categoryIds.map((categoryId) => (
            <span
              key={categoryId}
              className="inline-flex items-center gap-1 rounded-full bg-app-nav-active px-2.5 py-1 font-mono text-[10.5px] text-app-nav-accent"
            >
              {getCategoryName(categoryId)}
              <button
                type="button"
                onClick={() => handleCategoryToggle(categoryId)}
                aria-label={`Quitar filtro: ${getCategoryName(categoryId)}`}
                className="hover:text-app-neg"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {q && (
            <span className="inline-flex items-center gap-1 rounded-full bg-app-nav-active px-2.5 py-1 font-mono text-[10.5px] text-app-nav-accent">
              Búsqueda: &quot;{q}&quot;
              <button
                type="button"
                onClick={() => onFiltersChange({ q: undefined })}
                aria-label={`Quitar filtro de búsqueda: ${q}`}
                className="hover:text-app-neg"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
