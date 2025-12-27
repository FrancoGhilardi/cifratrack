import type { TransactionDTO } from '../mappers/transaction.mapper';
import type { TransactionListParams } from '../model/query-keys';
import type { ApiOk, PaginatedResponse } from '@/shared/lib/types';
import { apiFetch } from '@/shared/lib/api-client';

const API_BASE = '/api/transactions';

/**
 * Fetcher para listar transacciones con filtros y paginación
 */
export async function fetchTransactions(
  params: TransactionListParams
): Promise<PaginatedResponse<TransactionDTO>> {
  const searchParams = new URLSearchParams();

  if (params.month) searchParams.set('month', params.month);
  if (params.kind) searchParams.set('kind', params.kind);
  if (params.status) searchParams.set('status', params.status);
  if (params.paymentMethodId) searchParams.set('paymentMethodId', params.paymentMethodId);
  if (params.categoryIds && params.categoryIds.length > 0) {
    searchParams.set('categoryIds', params.categoryIds.join(','));
  }
  if (params.q) searchParams.set('q', params.q);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const url = `${API_BASE}?${searchParams.toString()}`;
  return apiFetch<PaginatedResponse<TransactionDTO>>(url);
}

/**
 * Fetcher para obtener una transacción por ID
 */
export async function fetchTransactionById(id: string): Promise<TransactionDTO> {
  const data = await apiFetch<ApiOk<TransactionDTO>>(`${API_BASE}/${id}`);
  return data.data;
}

/**
 * Crear una nueva transacción
 */
export async function createTransaction(
  data: {
    kind: 'income' | 'expense';
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    paymentMethodId?: string;
    isFixed?: boolean;
    status: 'pending' | 'paid';
    occurredOn: string;
    dueOn?: string;
    paidOn?: string;
    occurredMonth: string;
    sourceRecurringRuleId?: string;
    split: Array<{
      categoryId: string;
      allocatedAmount: number;
    }>;
  }
): Promise<TransactionDTO> {
  const result = await apiFetch<ApiOk<TransactionDTO>>(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return result.data;
}

/**
 * Actualizar una transacción existente
 */
export async function updateTransaction(
  id: string,
  data: {
    kind?: 'income' | 'expense';
    title?: string;
    description?: string;
    amount?: number;
    currency?: string;
    paymentMethodId?: string;
    isFixed?: boolean;
    status?: 'pending' | 'paid';
    occurredOn?: string;
    dueOn?: string;
    paidOn?: string;
    occurredMonth?: string;
    sourceRecurringRuleId?: string;
    split?: Array<{
      categoryId: string;
      allocatedAmount: number;
    }>;
  }
): Promise<TransactionDTO> {
  const result = await apiFetch<ApiOk<TransactionDTO>>(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return result.data;
}

/**
 * Eliminar una transacción
 */
export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch<void>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
}
