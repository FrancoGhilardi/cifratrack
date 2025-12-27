import type {
  InvestmentDTO,
  PaginatedInvestmentsResponse,
  InvestmentQueryParams,
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from '../model/investment.dto';

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

  const response = await fetch(`/api/investments?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar inversiones');
  }

  return response.json();
}

/**
 * Fetcher para obtener inversión por ID
 */
export async function fetchInvestmentById(id: string): Promise<InvestmentDTO> {
  const response = await fetch(`/api/investments/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar inversión');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Fetcher para crear inversión
 */
export async function createInvestment(
  data: CreateInvestmentInput
): Promise<InvestmentDTO> {
  const response = await fetch('/api/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      startedOn: data.startedOn.toISOString().split('T')[0],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear inversión');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetcher para actualizar inversión
 */
export async function updateInvestment(
  id: string,
  data: UpdateInvestmentInput
): Promise<InvestmentDTO> {
  const response = await fetch(`/api/investments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      startedOn: data.startedOn
        ? data.startedOn.toISOString().split('T')[0]
        : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar inversión');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetcher para eliminar inversión
 */
export async function deleteInvestment(id: string): Promise<void> {
  const response = await fetch(`/api/investments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar inversión');
  }
}
