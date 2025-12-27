/**
 * Entidad PaymentMethod (dominio)
 * 
 * Representa una forma de pago (efectivo, tarjeta, etc.)
 */
export class PaymentMethod {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly isActive: boolean,
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crear desde datos de persistencia
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    name: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentMethod {
    return new PaymentMethod(
      data.id,
      data.userId,
      data.name,
      data.isActive,
      data.isDefault,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Convertir a DTO para API
   */
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      isActive: this.isActive,
      isDefault: this.isDefault,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Verificar si puede ser eliminada
   */
  canBeDeleted(): boolean {
    return !this.isDefault;
  }
}

export type PaymentMethodDTO = ReturnType<PaymentMethod['toDTO']>;
