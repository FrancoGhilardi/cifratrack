import type {
  InvestmentDTO,
  PaginatedInvestmentsResponse,
  InvestmentQueryParams,
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from '../model/investment.dto';
import { apiFetch } from '@/shared/lib/api-client';

/**
 * Fetcher para listar inversiones
 */
export async function fetchInvestments(
  params: InvestmentQueryParams
): Promise<PaginatedInvestmentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.q) searchParams.set('q', params.q);
  if (params.active) searchParams.set('active', params.active);

  return apiFetch<PaginatedInvestmentsResponse>(`/api/investments?${searchParams.toString()}`);
}

/**
 * Fetcher para obtener inversión por ID
 */
export async function fetchInvestmentById(id: string): Promise<InvestmentDTO> {
  const data = await apiFetch<{ data: InvestmentDTO }>(`/api/investments/${id}`);
  return data.data;
}

/**
 * Fetcher para crear inversión
 */
export async function createInvestment(
  data: CreateInvestmentInput
): Promise<InvestmentDTO> {
  const result = await apiFetch<{ data: InvestmentDTO }>('/api/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      startedOn: data.startedOn.toISOString().split('T')[0],
    }),
  });
  return result.data;
}

/**
 * Fetcher para actualizar inversión
 */
export async function updateInvestment(
  id: string,
  data: UpdateInvestmentInput
): Promise<InvestmentDTO> {
  const result = await apiFetch<{ data: InvestmentDTO }>(`/api/investments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      startedOn: data.startedOn ? data.startedOn.toISOString().split('T')[0] : undefined,
    }),
  });
  return result.data;
}

/**
 * Fetcher para eliminar inversión
 */
export async function deleteInvestment(id: string): Promise<void> {
  await apiFetch<void>(`/api/investments/${id}`, {
    method: 'DELETE',
  });
}
