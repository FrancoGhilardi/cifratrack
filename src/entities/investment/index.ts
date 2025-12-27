// Entidad
export { Investment } from './model/investment.entity';

// Schemas
export {
  createInvestmentSchema,
  updateInvestmentSchema,
  investmentQuerySchema,
  type CreateInvestmentInput,
  type UpdateInvestmentInput,
  type InvestmentQueryParams,
} from './model/investment.schema';

// Servicios de dominio
export {
  InvestmentYieldCalculator,
  type InvestmentYieldResult,
} from './services/investment-yield-calculator';

// Repositorio
export {
  type IInvestmentRepository,
  type PaginatedInvestments,
} from './repo';
