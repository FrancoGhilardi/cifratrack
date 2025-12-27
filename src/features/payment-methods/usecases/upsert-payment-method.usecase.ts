import type { IPaymentMethodRepository } from "@/entities/payment-method/repo";
import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.entity";
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";
import { DomainError } from "@/shared/lib/errors";

/**
 * Caso de uso: Crear o actualizar forma de pago
 */
export class UpsertPaymentMethodUseCase {
  constructor(private readonly paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(
    userId: string,
    data: CreatePaymentMethodInput | (UpdatePaymentMethodInput & { id: string })
  ): Promise<PaymentMethod> {
    const isUpdate = "id" in data;

    // Si es actualización, verificar que existe y que el usuario es el dueño
    if (isUpdate) {
      const existing = await this.paymentMethodRepository.findById(
        data.id,
        userId
      );
      if (!existing) {
        throw new DomainError("Forma de pago no encontrada");
      }

      // No permitir editar formas de pago por defecto (seeds)
      if (existing.isDefault) {
        throw new DomainError(
          "No se pueden editar las formas de pago por defecto"
        );
      }
    }

    // Verificar que no exista otra forma de pago con el mismo nombre
    const nameToCheck = isUpdate ? (data.name ?? '') : data.name;
    if (nameToCheck) {
      const existingByName = await this.paymentMethodRepository.findByName(
        nameToCheck,
        userId
      );
      if (existingByName && (!isUpdate || existingByName.id !== data.id)) {
        throw new DomainError("Ya existe una forma de pago con ese nombre");
      }
    }

    if (isUpdate) {
      return this.paymentMethodRepository.update(data.id, userId, data);
    } else {
      return this.paymentMethodRepository.create(userId, data);
    }
  }
}
