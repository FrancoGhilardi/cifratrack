import { NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";
import { ok, err } from "@/shared/lib/response";
import { PaymentMethodRepository } from "@/features/payment-methods/repo.impl";
import { UpsertPaymentMethodUseCase } from "@/features/payment-methods/usecases/upsert-payment-method.usecase";
import { DeletePaymentMethodUseCase } from "@/features/payment-methods/usecases/delete-payment-method.usecase";
import { updatePaymentMethodSchema } from "@/entities/payment-method/model/payment-method.schema";
import { DomainError, ValidationError } from "@/shared/lib/errors";

const paymentMethodRepo = new PaymentMethodRepository();

/**
 * GET /api/payment-methods/[id]
 * Obtiene una forma de pago por ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("No autenticado", 401);
    }

    const { id } = await context.params;
    const paymentMethod = await paymentMethodRepo.findById(id, session.user.id);

    if (!paymentMethod) {
      return err("Forma de pago no encontrada", 404);
    }

    return ok(paymentMethod.toDTO());
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return err("Error al obtener forma de pago", 500);
  }
}

/**
 * PUT /api/payment-methods/[id]
 * Actualiza una forma de pago existente
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("No autenticado", 401);
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validar con schema zod
    const parsed = updatePaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return err(
        parsed.error.issues[0]?.message || "Datos inválidos",
        400
      );
    }

    const useCase = new UpsertPaymentMethodUseCase(paymentMethodRepo);
    const paymentMethod = await useCase.execute(session.user.id, {
      ...parsed.data,
      id,
    });

    return ok(paymentMethod.toDTO());
  } catch (error) {
    console.error("Error updating payment method:", error);

    if (error instanceof DomainError || error instanceof ValidationError) {
      return err(error.message, 400);
    }

    return err("Error al actualizar forma de pago", 500);
  }
}

/**
 * DELETE /api/payment-methods/[id]
 * Elimina una forma de pago
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("No autenticado", 401);
    }

    const { id } = await context.params;

    const useCase = new DeletePaymentMethodUseCase(paymentMethodRepo);
    await useCase.execute(id, session.user.id);

    return ok({ success: true });
  } catch (error) {
    console.error("Error deleting payment method:", error);

    if (error instanceof DomainError || error instanceof ValidationError) {
      return err(error.message, 400);
    }

    return err("Error al eliminar forma de pago", 500);
  }
}
