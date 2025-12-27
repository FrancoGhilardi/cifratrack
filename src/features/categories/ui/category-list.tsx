'use client';

import { useState } from 'react';
import { Pencil, Trash2, FolderOpen } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { DataTable } from '@/shared/ui/data-table';
import type { DataTableColumn } from '@/shared/ui/data-table';
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

  const columns: DataTableColumn<CategoryDTO>[] = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      className: 'font-medium',
    },
    {
      header: 'Estado',
      cell: (cat) => (
        <Badge variant={cat.isActive ? 'default' : 'secondary'}>
          {cat.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      header: 'Por defecto',
      cell: (cat) => cat.isDefault ? <Badge variant="outline">Por defecto</Badge> : null,
    },
  ];

  return (
    <>
      <DataTable
        title={title}
        description={`Administra tus categorías de ${kind === 'income' ? 'ingresos' : 'egresos'}`}
        data={categories}
        columns={columns}
        actions={[
          {
            label: 'Editar categoría',
            icon: Pencil,
            onClick: handleEdit,
            variant: 'ghost',
            disabled: (cat) => cat.isDefault,
          },
          {
            label: 'Eliminar categoría',
            icon: Trash2,
            onClick: handleDelete,
            variant: 'ghost',
            disabled: (cat) => cat.isDefault,
          },
        ]}
        onCreate={handleCreate}
        createButtonLabel="Nueva categoría"
        showCreateButton={showCreateButton}
        emptyStateIcon={FolderOpen}
        emptyStateTitle="Sin categorías"
        emptyStateDescription={emptyMessage}
        getItemKey={(cat) => cat.id}
      />

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
