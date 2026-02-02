import type {
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from "@/entities/investment/model/investment.schema";

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
  days: number | null;
  isCompound: boolean;
  startedOn: string; // ISO date string YYYY-MM-DD
  endDate: string | null; // ISO date string YYYY-MM-DD
  hasEnded: boolean;
  daysRemaining: number | null;
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
  sortDir?: "asc" | "desc";
  q?: string;
  active?: "true" | "false";
}

/**
 * Respuesta paginada de inversiones
 */
export interface PaginatedInvestmentsResponse {
  data: InvestmentDTO[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export type { CreateInvestmentInput, UpdateInvestmentInput };
