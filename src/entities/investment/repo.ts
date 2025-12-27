import type { Investment } from './model/investment.entity';
import type { InvestmentQueryParams } from './model/investment.schema';

/**
 * Resultado paginado de inversiones
 */
export interface PaginatedInvestments {
  data: Investment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interfaz del repositorio de inversiones (contrato)
 * 
 * Define las operaciones de persistencia para la entidad Investment
 */
export interface IInvestmentRepository {
  /**
   * Lista inversiones con paginación y filtros
   */
  list(userId: string, params: InvestmentQueryParams): Promise<PaginatedInvestments>;

  /**
   * Busca una inversión por ID y userId
   */
  findById(id: string, userId: string): Promise<Investment | null>;

  /**
   * Crea una nueva inversión
   */
  create(investment: Investment): Promise<Investment>;

  /**
   * Actualiza una inversión existente
   */
  update(id: string, userId: string, data: Partial<Investment>): Promise<Investment>;

  /**
   * Elimina una inversión
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Cuenta el total de inversiones de un usuario
   */
  count(userId: string): Promise<number>;

  /**
   * Obtiene el total invertido por un usuario
   */
  getTotalInvested(userId: string): Promise<number>;
}
