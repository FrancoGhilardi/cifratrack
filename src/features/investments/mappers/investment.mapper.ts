import { Investment } from '@/entities/investment/model/investment.entity';
import type { InvestmentDTO } from '../model/investment.dto';
import { InvestmentYieldCalculator } from '@/entities/investment/services/investment-yield-calculator';

/**
 * Mapper para conversión entre Investment (dominio) y InvestmentDTO
 * 
 * Centraliza la lógica de mapeo según AGENTS.md: "Mappers explícitos"
 */
export class InvestmentMapper {
  private static readonly yieldCalculator = new InvestmentYieldCalculator();

  /**
   * Convierte una entidad de dominio Investment a DTO con rendimiento calculado
   */
  static toDTO(investment: Investment): InvestmentDTO {
    const yieldResult = this.yieldCalculator.calculate(
      investment.principal,
      investment.tna,
      investment.days
    );

    return {
      id: investment.id,
      userId: investment.userId,
      platform: investment.platform,
      title: investment.title,
      principal: investment.principal,
      tna: investment.tna,
      days: investment.days,
      startedOn: investment.startedOn.toISOString().split('T')[0],
      endDate: investment.getEndDate().toISOString().split('T')[0],
      hasEnded: investment.hasEnded(),
      daysRemaining: investment.getDaysRemaining(),
      notes: investment.notes,
      yield: yieldResult.yield,
      total: yieldResult.total,
      createdAt: investment.createdAt.toISOString(),
      updatedAt: investment.updatedAt.toISOString(),
    };
  }

  /**
   * Convierte un array de entidades de dominio a DTOs
   */
  static toDTOs(investments: Investment[]): InvestmentDTO[] {
    return investments.map((investment) => this.toDTO(investment));
  }

  /**
   * Convierte datos de DB a entidad de dominio
   * (ya implementado en Investment.fromDB, este método es un alias por consistencia)
   */
  static fromDB(data: {
    id: string;
    userId: string;
    platform: string;
    title: string;
    principal: number;
    tna: number;
    days: number;
    startedOn: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Investment {
    return Investment.fromDB(data);
  }
}
