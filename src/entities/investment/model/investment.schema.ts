import { z } from "zod";

/**
 * Schema para crear una inversión
 */
export const createInvestmentSchema = z
  .object({
    platform: z
      .string()
      .min(1, "La plataforma es requerida")
      .max(80, "La plataforma es demasiado larga (máx 80 caracteres)")
      .trim(),

    title: z
      .string()
      .min(1, "El título es requerido")
      .max(120, "El título es demasiado largo (máx 120 caracteres)")
      .trim(),

    principal: z
      .number()
      .positive("El monto principal debe ser mayor a cero")
      .max(999999999999.99, "El monto principal excede el límite permitido")
      .refine(
        (val) => {
          // Validar máximo 2 decimales
          const decimals = val.toString().split(".")[1];
          return !decimals || decimals.length <= 2;
        },
        { message: "El monto principal solo puede tener hasta 2 decimales" },
      ),

    tna: z
      .number()
      .min(0, "La TNA no puede ser negativa")
      .max(999.99, "La TNA excede el límite permitido (999.99%)")
      .refine(
        (val) => {
          // Validar máximo 2 decimales
          const decimals = val.toString().split(".")[1];
          return !decimals || decimals.length <= 2;
        },
        { message: "La TNA solo puede tener hasta 2 decimales" },
      ),

    days: z
      .number()
      .int("Los días deben ser un número entero")
      .positive("La duración debe ser mayor a cero días")
      .max(36500, "La duración excede el límite permitido (~100 años)")
      .optional()
      .nullable(),

    isCompound: z.boolean().default(false),

    startedOn: z.coerce
      .date()
      .max(new Date(), "La fecha de inicio no puede ser futura"),

    notes: z
      .string()
      .max(5000, "Las notas son demasiado largas (máx 5000 caracteres)")
      .trim()
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.isCompound && !data.days) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La duración es requerida para inversiones simples",
        path: ["days"],
      });
    }
  });

/**
 * Schema para actualizar una inversión
 */
export const updateInvestmentSchema = createInvestmentSchema.partial();

/**
 * Schema para validar query params de listado
 */
export const investmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["startedOn", "principal", "tna", "days", "platform", "title"])
    .default("startedOn"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  q: z.string().max(100).optional(), // búsqueda por título o plataforma
  active: z.enum(["true", "false"]).optional(), // filtrar por activas (no finalizadas)
});

/**
 * Tipos inferidos
 */
export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
export type InvestmentQueryParams = z.infer<typeof investmentQuerySchema>;
