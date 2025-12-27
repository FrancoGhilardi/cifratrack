/**
 * Resultado del cálculo de rendimiento de una inversión
 */
export interface InvestmentYieldResult {
  /** Rendimiento generado (ganancia) */
  yield: number;
  /** Total final (principal + rendimiento) */
  total: number;
  /** TNA utilizada */
  tna: number;
  /** Días utilizados */
  days: number;
}

/**
 * Servicio de dominio: Calculadora de rendimiento de inversiones
 * 
 * Implementa el cálculo de interés simple para inversiones
 * Fórmula: Rendimiento = Principal × (TNA / 100) × (Días / 365)
 */
export class InvestmentYieldCalculator {
  /**
   * Calcula el rendimiento de una inversión con interés simple
   * 
   * @param principal Monto principal invertido
   * @param tna Tasa Nominal Anual (porcentaje, ej: 45.5 para 45.5%)
   * @param days Duración de la inversión en días
   * @returns Objeto con el rendimiento y total
   */
  calculate(principal: number, tna: number, days: number): InvestmentYieldResult {
    // Validaciones básicas
    if (principal <= 0) {
      throw new Error('El principal debe ser mayor a cero');
    }

    if (tna < 0) {
      throw new Error('La TNA no puede ser negativa');
    }

    if (days <= 0) {
      throw new Error('Los días deben ser mayor a cero');
    }

    // Cálculo de interés simple
    // yield = P × (r / 100) × (t / 365)
    const yieldAmount = principal * (tna / 100) * (days / 365);
    const total = principal + yieldAmount;

    // Redondear a 2 decimales
    return {
      yield: Math.round(yieldAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      tna,
      days,
    };
  }

  /**
   * Calcula el rendimiento anualizado (TEA - Tasa Efectiva Anual)
   * para inversiones con duración diferente a 365 días
   * 
   * @param principal Monto principal invertido
   * @param finalAmount Monto final recibido
   * @param days Duración de la inversión en días
   * @returns TEA (Tasa Efectiva Anual) en porcentaje
   */
  calculateTEA(principal: number, finalAmount: number, days: number): number {
    if (principal <= 0 || finalAmount <= 0 || days <= 0) {
      throw new Error('Los valores deben ser mayores a cero');
    }

    // TEA = ((Final / Principal) - 1) × (365 / días) × 100
    const tea = ((finalAmount / principal) - 1) * (365 / days) * 100;
    
    return Math.round(tea * 100) / 100;
  }

  /**
   * Calcula el monto final esperado dada una TNA y duración
   * 
   * @param principal Monto principal invertido
   * @param tna Tasa Nominal Anual (porcentaje)
   * @param days Duración de la inversión en días
   * @returns Monto final (principal + rendimiento)
   */
  calculateFinalAmount(principal: number, tna: number, days: number): number {
    const result = this.calculate(principal, tna, days);
    return result.total;
  }

  /**
   * Calcula cuántos días se necesitan para alcanzar un objetivo de ganancia
   * 
   * @param principal Monto principal invertido
   * @param tna Tasa Nominal Anual (porcentaje)
   * @param targetYield Ganancia objetivo
   * @returns Cantidad de días necesarios
   */
  calculateDaysForTargetYield(principal: number, tna: number, targetYield: number): number {
    if (principal <= 0 || tna <= 0 || targetYield <= 0) {
      throw new Error('Los valores deben ser mayores a cero');
    }

    // Despejando días de la fórmula: yield = principal × (tna / 100) × (días / 365)
    // días = (yield × 365) / (principal × (tna / 100))
    const days = (targetYield * 365) / (principal * (tna / 100));
    
    return Math.ceil(days); // Redondear hacia arriba
  }
}
