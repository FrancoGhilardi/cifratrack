import type {
  InvestmentDTO,
  PaginatedInvestmentsResponse,
  InvestmentQueryParams,
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from "../model/investment.dto";
import type { ApiOk } from "@/shared/lib/types";
import { apiFetch } from "@/shared/lib/api-client";
import { formatDateToISO } from "@/shared/lib/date";
import { buildQueryParams } from "@/shared/lib/utils/query-params";

/**
 * Fetcher para listar inversiones
 */
export async function fetchInvestments(
  params: InvestmentQueryParams,
): Promise<PaginatedInvestmentsResponse> {
  const searchParams = buildQueryParams({
    page: params.page,
    pageSize: params.pageSize,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    q: params.q,
    active: params.active,
    cursor: params.cursor,
    cursorId: params.cursorId,
  });

  const result = await apiFetch<ApiOk<PaginatedInvestmentsResponse>>(
    `/api/investments?${searchParams.toString()}`,
  );
  return result.data;
}

/**
 * Fetcher para obtener inversión por ID
 */
export async function fetchInvestmentById(id: string): Promise<InvestmentDTO> {
  const data = await apiFetch<ApiOk<InvestmentDTO>>(`/api/investments/${id}`);
  return data.data;
}

/**
 * Fetcher para crear inversión
 */
export async function createInvestment(
  data: CreateInvestmentInput,
): Promise<InvestmentDTO> {
  const result = await apiFetch<ApiOk<InvestmentDTO>>("/api/investments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      startedOn: formatDateToISO(data.startedOn),
    }),
  });
  return result.data;
}

/**
 * Fetcher para actualizar inversión
 */
export async function updateInvestment(
  id: string,
  data: UpdateInvestmentInput,
): Promise<InvestmentDTO> {
  const result = await apiFetch<ApiOk<InvestmentDTO>>(
    `/api/investments/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        startedOn: data.startedOn ? formatDateToISO(data.startedOn) : undefined,
      }),
    },
  );
  return result.data;
}

/**
 * Fetcher para eliminar inversión
 */
export async function deleteInvestment(id: string): Promise<void> {
  await apiFetch<void>(`/api/investments/${id}`, {
    method: "DELETE",
  });
}
