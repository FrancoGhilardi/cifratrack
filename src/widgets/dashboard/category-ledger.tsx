"use client";

import { memo } from "react";
import {
  calculatePercentage,
  getPercentageValue,
} from "@/shared/lib/utils/percentage";
import { getCategoryColor } from "@/shared/lib/category-colors";

interface CategoryLedgerProps {
  items: Array<{ categoryId: string; categoryName: string; total: number }>;
  totalReference: number;
  formatCurrency: (value: number) => string;
}

/**
 * Widget: categorías como filas de libro mayor.
 * Cada fila lleva su color de la rampa, el importe alineado a la derecha en
 * mono tabular y una barra hairline con su proporción.
 */
export const CategoryLedger = memo(function CategoryLedger({
  items,
  totalReference,
  formatCurrency,
}: CategoryLedgerProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const width = getPercentageValue(item.total, totalReference);
        const color = getCategoryColor(index);

        return (
          <div
            key={item.categoryId}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-border/60 py-2.5 first:border-t-0"
          >
            <span className="flex min-w-0 items-center gap-2.5 text-[13.5px]">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ background: color }}
              />
              <span className="truncate">{item.categoryName}</span>
            </span>

            <span className="text-right font-mono text-[13px] tabular-nums">
              {formatCurrency(item.total)}
            </span>

            <span className="h-[2px] overflow-hidden rounded-sm bg-muted">
              <span
                className="block h-full rounded-sm"
                style={{ width: `${width}%`, background: color }}
              />
            </span>

            <span className="text-right font-mono text-[10.5px] tabular-nums text-muted-foreground">
              {calculatePercentage(item.total, totalReference)} %
            </span>
          </div>
        );
      })}
    </div>
  );
});
