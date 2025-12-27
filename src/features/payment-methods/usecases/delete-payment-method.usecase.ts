import type { IPaymentMethodRepository } from "@/entities/payment-method/repo";
import { DomainError } from "@/shared/lib/errors";

/**
 * Caso de uso: Eliminar forma de pago
 */
export class DeletePaymentMethodUseCase {
  constructor(private readonly paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // Verificar que existe y que el usuario es el dueño
    const paymentMethod = await this.paymentMethodRepository.findById(id, userId);
    if (!paymentMethod) {
      throw new DomainError("Forma de pago no encontrada");
    }

    // No permitir eliminar formas de pago por defecto (seeds)
    if (paymentMethod.isDefault) {
      throw new DomainError(
        "No se pueden eliminar las formas de pago por defecto"
      );
    }

    // Verificar que no tenga transacciones asociadas
    const hasTransactions = await this.paymentMethodRepository.hasTransactions(
      id,
      userId
    );
    if (hasTransactions) {
      throw new DomainError(
        "No se puede eliminar una forma de pago con movimientos asociados"
      );
    }

    // Eliminar
    await this.paymentMethodRepository.delete(id, userId);
  }
}
