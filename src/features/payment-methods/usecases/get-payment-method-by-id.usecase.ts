import type { IPaymentMethodRepository } from "@/entities/payment-method/repo";
import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.entity";
import { GetByIdUseCase } from "@/shared/lib/usecases/get-by-id.usecase";

/**
 * Caso de uso: Obtener forma de pago por ID (passthrough al repo, sin reglas propias)
 */
export class GetPaymentMethodByIdUseCase extends GetByIdUseCase<PaymentMethod> {
  constructor(paymentMethodRepository: IPaymentMethodRepository) {
    super(paymentMethodRepository, "Forma de pago");
  }
}
