"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { AlertCircle } from "lucide-react";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/entities/category/model/category.schema";
import type { CategoryDTO } from "../api/categories.api";

type CategoryFormValues = {
  kind?: "income" | "expense";
  name?: string;
  isActive?: boolean;
};

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  category?: CategoryDTO | null;
  kind?: "income" | "expense";
  isLoading?: boolean;
}

/**
 * Formulario de creación/edición de categoría
 */
export function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  category,
  kind,
  isLoading,
}: CategoryFormProps) {
  const isEditing = !!category;
  const schema = isEditing ? updateCategorySchema : createCategorySchema;
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: category
      ? { name: category.name, isActive: category.isActive }
      : { kind: kind ?? "expense", name: "" },
  });

  // Solo resetear cuando se abre el modal por primera vez o cambia la categoría a editar
  useEffect(() => {
    if (isOpen) {
      const values = category
        ? { name: category.name, isActive: category.isActive }
        : { kind: kind ?? "expense", name: "" };
      reset(values);
    }
  }, [isOpen, category, kind, reset]);

  const handleFormSubmit = async (data: CategoryFormValues) => {
    try {
      setApiError(null);
      await onSubmit(data as CreateCategoryInput | UpdateCategoryInput);
      onClose();
    } catch (error) {
      // Capturar error de la API y determinar el tipo
      if (error instanceof Error) {
        const message = error.message;

        // Detectar si es un error de duplicado
        if (message.includes("Ya existe una categoría")) {
          setApiError(`${message}`);
        }
        // Error de creación o actualización genérico
        else if (message.includes("crear") || message.includes("actualizar")) {
          setApiError(`${message}`);
        }
        // Cualquier otro error
        else {
          setApiError(`Error: ${message}`);
        }
      } else {
        setApiError("Ocurrió un error inesperado. Intenta nuevamente.");
      }
    }
  };

  const handleClose = () => {
    setApiError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la categoría"
              : "Completa los datos de la nueva categoría"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Mensaje de error de API */}
          {apiError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {apiError}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="kind">Tipo</Label>
                <Controller
                  control={control}
                  name="kind"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as "income" | "expense")
                      }
                    >
                      <SelectTrigger id="kind" className="h-11">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Egreso</SelectItem>
                        <SelectItem value="income">Ingreso</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {"kind" in errors && errors.kind && (
                  <p className="text-sm text-destructive">
                    {errors.kind.message as string}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Supermercado"
                className="h-11"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message as string}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-start gap-3 rounded-lg border border-border/70 px-3 py-3">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Checkbox
                    id="isActive"
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                )}
              />
              <div className="space-y-1">
                <Label htmlFor="isActive" className="cursor-pointer">
                  Categoría activa
                </Label>
                <p className="text-sm text-muted-foreground">
                  Si la desactivas, dejará de aparecer en nuevos formularios.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
