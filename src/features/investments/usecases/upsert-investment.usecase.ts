import type { IInvestmentRepository } from '@/entities/investment/repo';
import { Investment } from '@/entities/investment/model/investment.entity';
import type { CreateInvestmentInput, UpdateInvestmentInput } from '@/entities/investment/model/investment.schema';
import { InvestmentYieldCalculator } from '@/entities/investment/services/investment-yield-calculator';
import { randomUUID } from 'crypto';

/**
 * Caso de uso: Crear o actualizar inversión
 * 
 * Valida datos y persiste la inversión
 */
export class UpsertInvestmentUseCase {
  private readonly yieldCalculator: InvestmentYieldCalculator;

  constructor(private readonly investmentRepo: IInvestmentRepository) {
    this.yieldCalculator = new InvestmentYieldCalculator();
  }

  /**
   * Crear nueva inversión
   */
  async create(userId: string, data: CreateInvestmentInput): Promise<Investment> {
    // Crear entidad de dominio (valida invariantes)
    const investment = Investment.create({
      id: randomUUID(),
      userId,
      platform: data.platform,
      title: data.title,
      principal: data.principal,
      tna: data.tna,
      days: data.days,
      startedOn: data.startedOn,
      notes: data.notes ?? null,
    });

    // Persistir
    return await this.investmentRepo.create(investment);
  }

  /**
   * Actualizar inversión existente
   */
  async update(
    id: string,
    userId: string,
    data: UpdateInvestmentInput
  ): Promise<Investment> {
    // Preparar datos de actualización parcial
    // Usar tipo Record para datos que van al repo (sin readonly)
    const updateData: Record<string, unknown> = {};

    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.principal !== undefined) updateData.principal = data.principal;
    if (data.tna !== undefined) updateData.tna = data.tna;
    if (data.days !== undefined) updateData.days = data.days;
    if (data.startedOn !== undefined) updateData.startedOn = data.startedOn;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Actualizar en repositorio (cast a Partial<Investment> es seguro aquí)
    return await this.investmentRepo.update(id, userId, updateData as Partial<Investment>);
  }

  /**
   * Calcular rendimiento de una inversión
   * (utilidad para mostrar en UI sin necesidad de persistir)
   */
  calculateYield(principal: number, tna: number, days: number) {
    return this.yieldCalculator.calculate(principal, tna, days);
  }
}
