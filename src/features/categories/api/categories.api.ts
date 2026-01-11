import type { ApiOk } from '@/shared/lib/types';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/entities/category/model/category.schema';
import { apiFetch } from '@/shared/lib/api-client';
import { buildQueryParams } from '@/shared/lib/utils/query-params';

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
    const params = buildQueryParams({
      kind: filters?.kind,
      isActive: filters?.isActive,
    });
    const queryString = params.toString();
    const url = `/api/categories${queryString ? `?${queryString}` : ''}`;

    const result = await apiFetch<ApiOk<CategoryDTO[]>>(url);
    return result.data;
  }

  /**
   * Obtener categoría por ID
   */
  async getById(id: string): Promise<CategoryDTO> {
    const result = await apiFetch<ApiOk<CategoryDTO>>(`/api/categories/${id}`);
    return result.data;
  }

  /**
   * Crear nueva categoría
   */
  async create(data: CreateCategoryInput): Promise<CategoryDTO> {
    const result = await apiFetch<ApiOk<CategoryDTO>>('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return result.data;
  }

  /**
   * Actualizar categoría
   */
  async update(id: string, data: UpdateCategoryInput): Promise<CategoryDTO> {
    const result = await apiFetch<ApiOk<CategoryDTO>>(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return result.data;
  }

  /**
   * Eliminar categoría
   */
  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Singleton
export const categoriesApi = new CategoriesApi();
