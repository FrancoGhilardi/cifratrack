import { and, eq, inArray } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/shared/db/client";
import type { DbTransaction } from "@/shared/db/client";

type Executor = typeof db | DbTransaction;

/**
 * Verifica que todas las filas de `ids` en `table` pertenezcan a `userId`
 * (compara la cantidad de filas encontradas contra la cantidad de ids
 * únicos pedidos). Uso: checks de ownership antes de asociar una fila
 * (forma de pago, categoría) a un recurso del usuario autenticado.
 *
 * No sirve cuando además hace falta traer otras columnas de la fila (ej.
 * `name`) en la misma query — para esos casos, dejar el `select` inline.
 */
export async function verifyOwnership<T extends PgTable>(
  executor: Executor,
  table: T,
  idColumn: PgColumn,
  userIdColumn: PgColumn,
  userId: string,
  ids: string[],
): Promise<boolean> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return true;

  const rows = await executor
    .select({ id: idColumn })
    .from(table as PgTable)
    .where(and(inArray(idColumn, uniqueIds), eq(userIdColumn, userId)));

  return rows.length === uniqueIds.length;
}
