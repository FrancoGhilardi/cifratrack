import { withApiHandler } from "@/shared/lib/api-handler";
import { ok } from "@/shared/lib/response";
import { PaymentMethodRepository } from "@/features/payment-methods/repo.impl";
import { UpsertPaymentMethodUseCase } from "@/features/payment-methods/usecases/upsert-payment-method.usecase";
import { DeletePaymentMethodUseCase } from "@/features/payment-methods/usecases/delete-payment-method.usecase";
import { GetPaymentMethodByIdUseCase } from "@/features/payment-methods/usecases/get-payment-method-by-id.usecase";
import {
  updatePaymentMethodSchema,
  type UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";

const paymentMethodRepo = new PaymentMethodRepository();
const getPaymentMethodByIdUseCase = new GetPaymentMethodByIdUseCase(
  paymentMethodRepo,
);
const upsertPaymentMethodUseCase = new UpsertPaymentMethodUseCase(
  paymentMethodRepo,
);
const deletePaymentMethodUseCase = new DeletePaymentMethodUseCase(
  paymentMethodRepo,
);

/**
 * GET /api/payment-methods/[id]
 * Obtiene una forma de pago por ID
 */
export const GET = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    const paymentMethod = await getPaymentMethodByIdUseCase.execute(
      params.id,
      userId,
    );
    return ok(paymentMethod.toDTO());
  },
});

/**
 * PUT /api/payment-methods/[id]
 * Actualiza una forma de pago existente
 */
export const PUT = withApiHandler<
  undefined,
  UpdatePaymentMethodInput,
  { id: string }
>({
  bodySchema: updatePaymentMethodSchema,
  handler: async ({ userId, body, params }) => {
    const paymentMethod = await upsertPaymentMethodUseCase.execute(userId, {
      ...body,
      id: params.id,
    });
    return ok(paymentMethod.toDTO());
  },
});

/**
 * DELETE /api/payment-methods/[id]
 * Elimina una forma de pago
 */
export const DELETE = withApiHandler<undefined, undefined, { id: string }>({
  handler: async ({ userId, params }) => {
    await deletePaymentMethodUseCase.execute(params.id, userId);
    return ok({ success: true });
  },
});
