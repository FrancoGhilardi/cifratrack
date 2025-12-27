'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Pencil, Trash2, Plus, FolderOpen } from 'lucide-react';
import type { CategoryDTO } from '../api/categories.api';
import { CategoryForm } from './category-form';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { useCategoryMutations } from '../hooks/useCategoryMutations';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';

interface CategoryListProps {
  categories: CategoryDTO[];
  kind: 'income' | 'expense';
  /**
   * Controla si se muestra el botón de crear categoría en el header
   * @default false
   */
  showCreateButton?: boolean;
}

/**
 * Lista de categorías con acciones de edición/eliminación
 */
export function CategoryList({ categories, kind, showCreateButton = false }: CategoryListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(null);
  
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: CategoryDTO) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: CategoryDTO) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    // El error se propagará al formulario para que lo capture
    if (selectedCategory) {
      await updateCategory.mutateAsync({ id: selectedCategory.id, data: data as UpdateCategoryInput });
    } else {
      // No sobrescribir el kind que viene del formulario, el usuario lo seleccionó
      await createCategory.mutateAsync(data as CreateCategoryInput);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      await deleteCategory.mutateAsync(selectedCategory.id);
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const title = kind === 'income' ? 'Ingresos' : 'Egresos';
  const emptyMessage = kind === 'income' 
    ? 'No hay categorías de ingreso. Crea una para comenzar.'
    : 'No hay categorías de egreso. Crea una para comenzar.';

  return (
    <>
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Administra tus categorías de {kind === 'income' ? 'ingresos' : 'egresos'}
            </CardDescription>
          </div>
          {showCreateButton && (
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva categoría
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Sin categorías"
              description={emptyMessage}
              action={
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear categoría
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Por defecto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {category.isDefault && (
                        <Badge variant="outline">Por defecto</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        disabled={category.isDefault}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        disabled={category.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        kind={kind}
        isLoading={
          createCategory.isPending || updateCategory.isPending
        }
      />

      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={selectedCategory?.name || ''}
        isLoading={deleteCategory.isPending}
      />
    </>
  );
}
