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

    yieldProviderId: z.string().optional().nullable(),

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
      .optional()
      .nullable(),

    isCompound: z.boolean().default(false),

    startedOn: z.coerce.date().refine((date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return date < tomorrow;
    }, "La fecha de inicio no puede ser futura"),

    notes: z
      .string()
      .max(5000, "Las notas son demasiado largas (máx 5000 caracteres)")
      .trim()
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // Validar duración
    if (data.days !== null && data.days !== undefined) {
      if (data.days < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La duración no puede ser negativa",
          path: ["days"],
        });
      }
      if (data.days > 36500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La duración excede el límite permitido (~100 años)",
          path: ["days"],
        });
      }
      // Para inversiones NO compuestas, debe ser positivo (> 0)
      if (!data.isCompound && data.days === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La duración debe ser mayor a cero días",
          path: ["days"],
        });
      }
    }

    if (!data.isCompound && !data.days) {
      // !data.days catches 0, null, undefined.
      // Need to distinguish if we already added an error for 0 above?
      // If data.days is 0, !data.days is true.

      // If data.days is 0, we added error above.
      // If data.days is null/undefined, we add error here.
      if (data.days === null || data.days === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La duración es requerida para inversiones simples",
          path: ["days"],
        });
      }
    }
  });

/**
 * Schema para actualizar una inversión
 */
export const updateInvestmentSchema = createInvestmentSchema.partial();

/**
 * Schema para validar query params de listado
 */
export const investmentQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z
      .enum(["startedOn", "principal", "tna", "days", "platform", "title"])
      .default("startedOn"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    q: z.string().max(100).optional(), // busqueda por titulo o plataforma
    active: z.enum(["true", "false"]).optional(), // filtrar por activas (no finalizadas)
    cursor: z.string().min(1).optional(),
    cursorId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.cursor && !data.cursorId) || (!data.cursor && data.cursorId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cursor y cursorId deben enviarse juntos",
        path: ["cursor"],
      });
    }
  });

/**
 * Tipos inferidos
 */
export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
export type InvestmentQueryParams = z.infer<typeof investmentQuerySchema>;
