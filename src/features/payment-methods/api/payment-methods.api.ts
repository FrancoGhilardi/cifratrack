import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";

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

    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Error al listar formas de pago");
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Obtener una forma de pago por ID
   */
  async getById(id: string): Promise<PaymentMethodDTO> {
    const res = await fetch(`/api/payment-methods/${id}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.error?.message || "Error al obtener forma de pago"
      );
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Crear una nueva forma de pago
   */
  async create(input: CreatePaymentMethodInput): Promise<PaymentMethodDTO> {
    const res = await fetch("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Error al crear forma de pago");
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Actualizar una forma de pago existente
   */
  async update(
    id: string,
    input: UpdatePaymentMethodInput
  ): Promise<PaymentMethodDTO> {
    const res = await fetch(`/api/payment-methods/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.error?.message || "Error al actualizar forma de pago"
      );
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Eliminar una forma de pago
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/payment-methods/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Error al eliminar forma de pago");
    }
  },
};
