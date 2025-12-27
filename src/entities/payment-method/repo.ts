import type { PaymentMethod } from './model/payment-method.entity';
import type { CreatePaymentMethodInput, UpdatePaymentMethodInput } from './model/payment-method.schema';

/**
 * Contrato del repositorio de formas de pago
 */
export interface IPaymentMethodRepository {
  /**
   * Listar formas de pago del usuario
   */
  list(userId: string, filters?: { isActive?: boolean }): Promise<PaymentMethod[]>;

  /**
   * Buscar forma de pago por ID
   */
  findById(id: string, userId: string): Promise<PaymentMethod | null>;

  /**
   * Buscar forma de pago por nombre
   */
  findByName(name: string, userId: string): Promise<PaymentMethod | null>;

  /**
   * Crear nueva forma de pago
   */
  create(userId: string, data: CreatePaymentMethodInput): Promise<PaymentMethod>;

  /**
   * Actualizar forma de pago
   */
  update(id: string, userId: string, data: UpdatePaymentMethodInput): Promise<PaymentMethod>;

  /**
   * Eliminar forma de pago
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Verificar si una forma de pago tiene transacciones asociadas
   */
  hasTransactions(id: string, userId: string): Promise<boolean>;
}
