import type { TransactionDTO } from "../mappers/transaction.mapper";
import type { TransactionListParams } from "../model/query-keys";
import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";
import type { ApiOk, Paginated } from "@/shared/lib/types";
import { apiFetch } from "@/shared/lib/api-client";
import { columnToSnakeCase } from "@/shared/lib/utils/column-mapping";
import { buildQueryParams } from "@/shared/lib/utils/query-params";

const API_BASE = "/api/transactions";

/**
 * Fetcher para listar transacciones con filtros y paginación
 */
export async function fetchTransactions(
  params: TransactionListParams
): Promise<Paginated<TransactionDTO>> {
  const searchParams = buildQueryParams({
    month: params.month,
    kind: params.kind,
    status: params.status,
    paymentMethodId: params.paymentMethodId,
    categoryIds: params.categoryIds,
    q: params.q,
    sortBy: params.sortBy ? columnToSnakeCase(params.sortBy) : undefined,
    sortOrder: params.sortOrder,
    page: params.page,
    pageSize: params.pageSize,
    cursor: params.cursor,
    cursorId: params.cursorId,
  });

  const url = `${API_BASE}?${searchParams.toString()}`;
  const result = await apiFetch<ApiOk<Paginated<TransactionDTO>>>(url);
  return result.data;
}

/**
 * Fetcher para obtener una transacción por ID
 */
export async function fetchTransactionById(
  id: string
): Promise<TransactionDTO> {
  const data = await apiFetch<ApiOk<TransactionDTO>>(`${API_BASE}/${id}`);
  return data.data;
}

/**
 * Fetcher para obtener resumen de egresos pagados/pendientes por mes
 */
export async function fetchTransactionsSummary(
  month: string
): Promise<TransactionSummaryDTO> {
  const searchParams = buildQueryParams({ month });
  const url = `${API_BASE}/summary?${searchParams.toString()}`;
  const data = await apiFetch<ApiOk<TransactionSummaryDTO>>(url);
  return data.data;
}

/**
 * Crear una nueva transacción
 */
export async function createTransaction(data: {
  kind: "income" | "expense";
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  isFixed?: boolean;
  status: "pending" | "paid";
  occurredOn: string;
  dueOn?: string;
  paidOn?: string;
  occurredMonth: string;
  sourceRecurringRuleId?: string;
  split: Array<{
    categoryId: string;
    allocatedAmount: number;
  }>;
}): Promise<TransactionDTO> {
  const result = await apiFetch<ApiOk<TransactionDTO>>(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    kind?: "income" | "expense";
    title?: string;
    description?: string;
    amount?: number;
    currency?: string;
    paymentMethodId?: string;
    isFixed?: boolean;
    status?: "pending" | "paid";
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return result.data;
}

/**
 * Eliminar una transacción
 */
export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch<void>(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}
