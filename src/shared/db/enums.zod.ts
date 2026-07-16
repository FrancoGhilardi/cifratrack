import { z } from "zod";
import { entryKind, transactionStatus, recurringCadence } from "./schema";

/**
 * Schemas Zod derivados de los pgEnum de Drizzle.
 * Única fuente de verdad: si un enum cambia en `schema.ts`, estos schemas
 * se actualizan solos (evita mantener las listas de valores sincronizadas a mano).
 */
export const entryKindSchema = z.enum(entryKind.enumValues);
export const transactionStatusSchema = z.enum(transactionStatus.enumValues);
export const recurringCadenceSchema = z.enum(recurringCadence.enumValues);
