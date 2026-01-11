import type { Paginated } from "@/shared/lib/types";

/**
 * DTO para inversión con rendimiento calculado
 */
export interface InvestmentDTO {
  id: string;
  userId: string;
  platform: string;
  title: string;
  principal: number;
  tna: number;
  days: number;
  startedOn: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  hasEnded: boolean;
  daysRemaining: number;
  notes: string | null;
  yield: number; // Rendimiento calculado
  total: number; // Principal + rendimiento
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Parámetros de query para listado
 */
export interface InvestmentQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: "startedOn" | "principal" | "tna" | "days" | "platform" | "title";
  sortOrder?: "asc" | "desc";
  q?: string;
  active?: "true" | "false";
  cursor?: string;
  cursorId?: string;
}

/**
 * Respuesta paginada de inversiones
 */
export type PaginatedInvestmentsResponse = Paginated<InvestmentDTO>;

/**
 * Input para crear inversión
 */
export interface CreateInvestmentInput {
  platform: string;
  title: string;
  principal: number;
  tna: number;
  days: number;
  startedOn: Date;
  notes?: string | null;
}

/**
 * Input para actualizar inversión
 */
export interface UpdateInvestmentInput {
  platform?: string;
  title?: string;
  principal?: number;
  tna?: number;
  days?: number;
  startedOn?: Date;
  notes?: string | null;
}
