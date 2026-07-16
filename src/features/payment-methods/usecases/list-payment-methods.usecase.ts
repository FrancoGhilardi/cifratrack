import { ListUseCase } from "@/shared/lib/usecases/list.usecase";
import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.entity";

/**
 * Caso de uso: Listar formas de pago del usuario (passthrough al repo, sin reglas propias)
 */
export class ListPaymentMethodsUseCase extends ListUseCase<
  PaymentMethod[],
  { isActive?: boolean }
> {}
