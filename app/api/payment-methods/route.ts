import { NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";
import { ok, err } from "@/shared/lib/response";
import { PaymentMethodRepository } from "@/features/payment-methods/repo.impl";
import { ListPaymentMethodsUseCase } from "@/features/payment-methods/usecases/list-payment-methods.usecase";
import { UpsertPaymentMethodUseCase } from "@/features/payment-methods/usecases/upsert-payment-method.usecase";
import { createPaymentMethodSchema } from "@/entities/payment-method/model/payment-method.schema";
import { DomainError, ValidationError } from "@/shared/lib/errors";

const paymentMethodRepo = new PaymentMethodRepository();

/**
 * GET /api/payment-methods
 * Lista todas las formas de pago del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("No autenticado", 401);
    }

    const { searchParams } = request.nextUrl;
    const isActive = searchParams.get("isActive");

    const useCase = new ListPaymentMethodsUseCase(paymentMethodRepo);
    const paymentMethods = await useCase.execute(session.user.id, {
      isActive: isActive ? isActive === "true" : undefined,
    });

    return ok(paymentMethods.map((pm) => pm.toDTO()));
  } catch (error) {
    console.error("Error listing payment methods:", error);
    return err("Error al listar formas de pago", 500);
  }
}

/**
 * POST /api/payment-methods
 * Crea una nueva forma de pago
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("No autenticado", 401);
    }

    const body = await request.json();

    // Validar con schema zod
    const parsed = createPaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return err(
        parsed.error.issues[0]?.message || "Datos inválidos",
        400
      );
    }

    const useCase = new UpsertPaymentMethodUseCase(paymentMethodRepo);
    const paymentMethod = await useCase.execute(session.user.id, parsed.data);

    return ok(paymentMethod.toDTO());
  } catch (error) {
    console.error("Error creating payment method:", error);

    if (error instanceof DomainError || error instanceof ValidationError) {
      return err(error.message, 400);
    }

    return err("Error al crear forma de pago", 500);
  }
}
