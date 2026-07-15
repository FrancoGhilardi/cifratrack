"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface MobileSortOption {
  value: string;
  label: string;
}

interface MobileSortSelectProps {
  options: readonly MobileSortOption[];
  /** Valor actual en formato "campo:asc|desc" */
  value: string;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  placeholder?: string;
}

/**
 * Select de orden para la vista mobile de tablas responsive.
 * Cada opción codifica campo y dirección como "campo:asc|desc".
 */
export function MobileSortSelect({
  options,
  value,
  onSortChange,
  placeholder = "Ordenar",
}: MobileSortSelectProps) {
  const handleChange = (next: string) => {
    const [sortBy, sortOrder] = next.split(":");
    if (sortBy && (sortOrder === "asc" || sortOrder === "desc")) {
      onSortChange(sortBy, sortOrder);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
