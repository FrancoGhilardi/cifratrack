import { withApiHandler } from "@/shared/lib/api-handler";
import { ok } from "@/shared/lib/response";
import { PaymentMethodRepository } from "@/features/payment-methods/repo.impl";
import { ListPaymentMethodsUseCase } from "@/features/payment-methods/usecases/list-payment-methods.usecase";
import { UpsertPaymentMethodUseCase } from "@/features/payment-methods/usecases/upsert-payment-method.usecase";
import {
  createPaymentMethodSchema,
  type CreatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";

const paymentMethodRepo = new PaymentMethodRepository();
const listPaymentMethodsUseCase = new ListPaymentMethodsUseCase(
  paymentMethodRepo,
);
const upsertPaymentMethodUseCase = new UpsertPaymentMethodUseCase(
  paymentMethodRepo,
);

type ListPaymentMethodsQuery = { isActive?: boolean };

/**
 * GET /api/payment-methods
 * Lista todas las formas de pago del usuario
 */
export const GET = withApiHandler<ListPaymentMethodsQuery>({
  query: (searchParams) => ({
    isActive: searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined,
  }),
  handler: async ({ userId, query }) => {
    const paymentMethods = await listPaymentMethodsUseCase.execute(
      userId,
      query,
    );
    return ok(paymentMethods.map((pm) => pm.toDTO()));
  },
});

/**
 * POST /api/payment-methods
 * Crea una nueva forma de pago
 */
export const POST = withApiHandler<undefined, CreatePaymentMethodInput>({
  bodySchema: createPaymentMethodSchema,
  handler: async ({ userId, body }) => {
    const paymentMethod = await upsertPaymentMethodUseCase.execute(
      userId,
      body,
    );
    return ok(paymentMethod.toDTO());
  },
});
