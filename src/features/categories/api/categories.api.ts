import type { ApiOk } from '@/shared/lib/types';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';

export interface CategoryDTO {
  id: string;
  userId: string;
  kind: 'income' | 'expense';
  name: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API client para Categorías
 */
export class CategoriesApi {
  /**
   * Listar categorías
   */
  async list(filters?: {
    kind?: 'income' | 'expense';
    isActive?: boolean;
  }): Promise<CategoryDTO[]> {
    const params = new URLSearchParams();
    if (filters?.kind) params.set('kind', filters.kind);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));

    const queryString = params.toString();
    const url = `/api/categories${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al obtener categorías');
    }

    const result: ApiOk<CategoryDTO[]> = await response.json();
    return result.data;
  }

  /**
   * Obtener categoría por ID
   */
  async getById(id: string): Promise<CategoryDTO> {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al obtener categoría');
    }

    const result: ApiOk<CategoryDTO> = await response.json();
    return result.data;
  }

  /**
   * Crear nueva categoría
   */
  async create(data: CreateCategoryInput): Promise<CategoryDTO> {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al crear categoría');
    }

    const result: ApiOk<CategoryDTO> = await response.json();
    return result.data;
  }

  /**
   * Actualizar categoría
   */
  async update(id: string, data: UpdateCategoryInput): Promise<CategoryDTO> {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al actualizar categoría');
    }

    const result: ApiOk<CategoryDTO> = await response.json();
    return result.data;
  }

  /**
   * Eliminar categoría
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al eliminar categoría');
    }
  }
}

// Singleton
export const categoriesApi = new CategoriesApi();
