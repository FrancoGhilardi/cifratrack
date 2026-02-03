import type { IPaymentMethodRepository } from "@/entities/payment-method/repo";
import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.entity";
import { NotFoundError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener forma de pago por ID
 */
export class GetPaymentMethodByIdUseCase {
  constructor(
    private readonly paymentMethodRepository: IPaymentMethodRepository
  ) {}

  async execute(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findById(
      id,
      userId
    );
    if (!paymentMethod) {
      throw new NotFoundError("Forma de pago", id);
    }

    return paymentMethod;
  }
}
