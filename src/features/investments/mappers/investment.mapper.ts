import { Investment } from "@/entities/investment/model/investment.entity";
import type { InvestmentDTO } from "../model/investment.dto";
import { InvestmentYieldCalculator } from "@/entities/investment/services/investment-yield-calculator";

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
    let calculationDays = investment.days;

    if (calculationDays === null) {
      // Si no tiene duración definida, calcular rendimiento hasta la fecha actual
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const start = new Date(investment.startedOn);
      start.setHours(0, 0, 0, 0);
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      calculationDays = Math.max(0, diffDays);
    }

    const yieldResult = this.yieldCalculator.calculate(
      investment.principal,
      investment.tna,
      calculationDays,
      investment.isCompound,
    );

    return {
      id: investment.id,
      userId: investment.userId,
      platform: investment.platform,
      title: investment.title,
      yieldProviderId: investment.yieldProviderId,
      principal: investment.principal,
      tna: investment.tna,
      days: investment.days,
      isCompound: investment.isCompound,
      startedOn: investment.startedOn.toISOString().split("T")[0],
      endDate: investment.getEndDate()?.toISOString().split("T")[0] ?? null,
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
    yieldProviderId: string | null;
    principal: number;
    tna: number;
    days: number | null;
    isCompound: boolean;
    startedOn: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Investment {
    return Investment.fromDB(data);
  }
}
