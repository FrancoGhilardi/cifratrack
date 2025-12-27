import type { IPaymentMethodRepository } from "@/entities/payment-method/repo";
import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.entity";

/**
 * Caso de uso: Listar formas de pago del usuario
 */
export class ListPaymentMethodsUseCase {
  constructor(private readonly paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(
    userId: string,
    options?: { isActive?: boolean }
  ): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.list(userId, options);
  }
}
