import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";
import { apiFetch } from "@/shared/lib/api-client";

export interface PaymentMethodDTO {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cliente API para payment methods
 */
export const paymentMethodsApi = {
  /**
   * Obtener todas las formas de pago del usuario
   */
  async list(params?: { isActive?: boolean }): Promise<PaymentMethodDTO[]> {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) {
      searchParams.set("isActive", params.isActive.toString());
    }

    const url = `/api/payment-methods${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const data = await apiFetch<{ data: PaymentMethodDTO[] }>(url);
    return data.data;
  },

  /**
   * Obtener una forma de pago por ID
   */
  async getById(id: string): Promise<PaymentMethodDTO> {
    const data = await apiFetch<{ data: PaymentMethodDTO }>(`/api/payment-methods/${id}`);
    return data.data;
  },

  /**
   * Crear una nueva forma de pago
   */
  async create(input: CreatePaymentMethodInput): Promise<PaymentMethodDTO> {
    const data = await apiFetch<{ data: PaymentMethodDTO }>("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return data.data;
  },

  /**
   * Actualizar una forma de pago existente
   */
  async update(
    id: string,
    input: UpdatePaymentMethodInput
  ): Promise<PaymentMethodDTO> {
    const data = await apiFetch<{ data: PaymentMethodDTO }>(`/api/payment-methods/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return data.data;
  },

  /**
   * Eliminar una forma de pago
   */
  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/api/payment-methods/${id}`, {
      method: "DELETE",
    });
  },
};
