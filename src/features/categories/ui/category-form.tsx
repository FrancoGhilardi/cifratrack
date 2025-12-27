'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { createCategorySchema, updateCategorySchema, type CreateCategoryInput, type UpdateCategoryInput } from '@/entities/category/model/category.schema';
import type { CategoryDTO } from '../api/categories.api';
import { formatErrorMessage } from '@/shared/lib/utils/error-messages';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  category?: CategoryDTO | null;
  kind?: 'income' | 'expense';
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
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: category
      ? { name: category.name, isActive: category.isActive }
      : { kind: 'expense' as const, name: '' },
  });

  // Solo resetear cuando se abre el modal por primera vez o cambia la categoría a editar
  useEffect(() => {
    if (isOpen) {
      const values = category
        ? { name: category.name, isActive: category.isActive }
        : { kind: 'expense' as const, name: '' };
      reset(values);
    }
  }, [isOpen, category, reset]);

  const handleFormSubmit = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    try {
      setApiError(null);
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Capturar error de la API y determinar el tipo
      if (error instanceof Error) {
        const message = error.message;
        
        // Detectar si es un error de duplicado
        if (message.includes('Ya existe una categoría')) {
          setApiError(`${message}`);
        } 
        // Error de creación o actualización genérico
        else if (message.includes('crear') || message.includes('actualizar')) {
          setApiError(`${message}`);
        }
        // Cualquier otro error
        else {
          setApiError(`Error: ${message}`);
        }
      } else {
        setApiError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    }
  };

  const handleClose = () => {
    setApiError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos de la categoría'
              : 'Completa los datos de la nueva categoría'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Mensaje de error de API */}
          {apiError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="kind">Tipo</Label>
              <select
                id="kind"
                {...register('kind')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="expense">Egreso</option>
                <option value="income">Ingreso</option>
              </select>
              {'kind' in errors && errors.kind && (
                <p className="text-sm text-destructive">{errors.kind.message as string}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Supermercado"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 rounded border-input"
                disabled={isLoading}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Categoría activa
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
