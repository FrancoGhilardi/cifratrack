"use client";

import type { ChangeEvent } from "react";
import { Search } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { InvestmentQueryParams } from "../model/investment.dto";

const MOBILE_SORT_OPTIONS: Array<{
  value: `${NonNullable<InvestmentQueryParams["sortBy"]>}:${NonNullable<InvestmentQueryParams["sortOrder"]>}`;
  label: string;
}> = [
  { value: "startedOn:desc", label: "Inicio: más recientes" },
  { value: "startedOn:asc", label: "Inicio: más antiguas" },
  { value: "principal:desc", label: "Monto: mayor a menor" },
  { value: "principal:asc", label: "Monto: menor a mayor" },
  { value: "tna:desc", label: "TNA: mayor a menor" },
  { value: "tna:asc", label: "TNA: menor a mayor" },
  { value: "days:desc", label: "Duración: mayor a menor" },
  { value: "days:asc", label: "Duración: menor a mayor" },
  { value: "platform:asc", label: "Plataforma: A-Z" },
  { value: "platform:desc", label: "Plataforma: Z-A" },
  { value: "title:asc", label: "Título: A-Z" },
  { value: "title:desc", label: "Título: Z-A" },
];

interface InvestmentFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilterValue: "all" | "active" | "ended";
  onActiveChange: (value: string) => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  showCreateButton: boolean;
  onCreate: () => void;
  mobileSortValue: string;
  onSortChange: (
    sortBy: NonNullable<InvestmentQueryParams["sortBy"]>,
    sortOrder: NonNullable<InvestmentQueryParams["sortOrder"]>,
  ) => void;
}

export function InvestmentFilters({
  searchValue,
  onSearchChange,
  activeFilterValue,
  onActiveChange,
  activeFiltersCount,
  onResetFilters,
  showCreateButton,
  onCreate,
  mobileSortValue,
  onSortChange,
}: InvestmentFiltersProps) {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleMobileSortChange = (value: string) => {
    const [nextSortBy, nextSortOrder] = value.split(":");
    if (nextSortBy && (nextSortOrder === "asc" || nextSortOrder === "desc")) {
      onSortChange(
        nextSortBy as NonNullable<InvestmentQueryParams["sortBy"]>,
        nextSortOrder,
      );
    }
  };

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o plataforma"
            value={searchValue}
            onChange={handleSearchChange}
            className="h-11 pl-9"
          />
        </div>

        <Select value={activeFilterValue} onValueChange={onActiveChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="ended">Finalizadas</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="h-11 w-full sm:w-auto"
            >
              Limpiar filtros ({activeFiltersCount})
            </Button>
          )}

          {!showCreateButton && (
            <Button onClick={onCreate} className="h-11 w-full sm:w-auto">
              Nueva inversión
            </Button>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <Select value={mobileSortValue} onValueChange={handleMobileSortChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Ordenar inversiones" />
          </SelectTrigger>
          <SelectContent>
            {MOBILE_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
