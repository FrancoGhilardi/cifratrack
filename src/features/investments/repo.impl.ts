import { db } from "@/shared/db/client";
import { investments } from "@/shared/db/schema";
import {
  eq,
  and,
  desc,
  asc,
  sql,
  like,
  or,
  gt,
  lt,
  type SQL,
} from "drizzle-orm";
import type {
  IInvestmentRepository,
  PaginatedInvestments,
} from "@/entities/investment/repo";
import { Investment } from "@/entities/investment/model/investment.entity";
import type { InvestmentQueryParams } from "@/entities/investment/model/investment.schema";
import { NotFoundError, ValidationError } from "@/shared/lib/errors";

/**
 * Repositorio de inversiones con Drizzle ORM
 * Implementa IInvestmentRepository
 */
export class InvestmentRepository implements IInvestmentRepository {
  /**
   * Listar inversiones con filtros, paginación y ordenamiento
   */
  async list(
    userId: string,
    params: InvestmentQueryParams,
  ): Promise<PaginatedInvestments> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = "startedOn",
      sortOrder = "desc",
      q,
      active,
      cursor,
      cursorId,
    } = params;

    // Validar parámetros
    const validSortBy = [
      "startedOn",
      "principal",
      "tna",
      "days",
      "platform",
      "title",
    ];
    if (!validSortBy.includes(sortBy)) {
      throw new ValidationError(
        `sortBy debe ser uno de: ${validSortBy.join(", ")}`,
      );
    }

    if (pageSize > 100) {
      throw new ValidationError("pageSize no puede ser mayor a 100");
    }

    // Construir condiciones WHERE
    const baseConditions: SQL[] = [eq(investments.userId, userId)];
    const conditions: SQL[] = [...baseConditions];
    const addBaseCondition = (condition: SQL) => {
      baseConditions.push(condition);
      conditions.push(condition);
    };

    // Filtro de búsqueda
    if (q) {
      addBaseCondition(
        or(
          like(investments.title, `%${q}%`),
          like(investments.platform, `%${q}%`),
          like(investments.notes, `%${q}%`),
        )!,
      );
    }

    // Filtro por inversiones activas (no finalizadas)
    if (active === "true") {
      // Inversión activa: (days IS NULL) OR (endDate >= hoy)
      conditions.push(
        or(
          sql`${investments.days} IS NULL`,
          sql`${investments.startedOn} + INTERVAL '1 day' * ${investments.days} >= CURRENT_DATE`,
        )!,
      );
    } else if (active === "false") {
      // Inversión finalizada: (days IS NOT NULL) AND (endDate < hoy)
      conditions.push(
        and(
          sql`${investments.days} IS NOT NULL`,
          sql`${investments.startedOn} + INTERVAL '1 day' * ${investments.days} < CURRENT_DATE`,
        )!,
      );
    }

    // Determinar ordenamiento
    const getOrderColumn = () => {
      switch (sortBy) {
        case "startedOn":
          return investments.startedOn;
        case "principal":
          return investments.principal;
        case "tna":
          return investments.tna;
        case "days":
          return investments.days;
        case "platform":
          return investments.platform;
        case "title":
          return investments.title;
        default:
          return investments.startedOn;
      }
    };
    const orderByColumn = getOrderColumn();
    const orderFn = sortOrder === "asc" ? asc : desc;

    const parseCursorValue = (value: string) => {
      switch (sortBy) {
        case "principal":
        case "tna":
        case "days":
          return Number(value);
        case "startedOn":
          return value;
        default:
          return value;
      }
    };

    const useKeyset = Boolean(cursor && cursorId);
    const cursorValue = cursor ? parseCursorValue(cursor) : undefined;

    if (useKeyset && cursorValue !== undefined) {
      if (
        (sortBy === "principal" || sortBy === "tna" || sortBy === "days") &&
        !Number.isFinite(cursorValue as number)
      ) {
        throw new ValidationError(`cursor invalido para sortBy ${sortBy}`);
      }
      if (
        sortBy === "startedOn" &&
        Number.isNaN(Date.parse(cursorValue as string))
      ) {
        throw new ValidationError("cursor invalido para sortBy startedOn");
      }

      const primaryCmp =
        sortOrder === "asc"
          ? gt(orderByColumn, cursorValue)
          : lt(orderByColumn, cursorValue);
      const tieCmp =
        sortOrder === "asc"
          ? gt(investments.id, cursorId!)
          : lt(investments.id, cursorId!);

      const keysetCondition = or(
        primaryCmp,
        and(eq(orderByColumn, cursorValue), tieCmp),
      );
      if (keysetCondition) {
        conditions.push(keysetCondition);
      }
    }

    const baseWhereClause = and(...baseConditions);
    const whereClause = and(...conditions);

    // Contar total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(investments)
      .where(baseWhereClause);

    // Obtener datos paginados
    const offset = (page - 1) * pageSize;
    const listQuery = db
      .select()
      .from(investments)
      .where(whereClause)
      .orderBy(orderFn(orderByColumn), orderFn(investments.id))
      .limit(pageSize);

    const rows = await (useKeyset ? listQuery : listQuery.offset(offset));

    // Mapear a entidades de dominio
    const data = rows.map((row) =>
      Investment.fromDB({
        id: row.id,
        userId: row.userId,
        platform: row.platform,
        title: row.title,
        yieldProviderId: row.yieldProviderId,
        principal: parseFloat(row.principal),
        tna: parseFloat(row.tna),
        days: row.days,
        isCompound: row.isCompound,
        startedOn: new Date(row.startedOn),
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );

    const getCursorValue = (item: Investment) => {
      switch (sortBy) {
        case "principal":
          return String(item.principal);
        case "tna":
          return String(item.tna);
        case "days":
          return String(item.days);
        case "platform":
          return item.platform;
        case "title":
          return item.title;
        case "startedOn":
        default:
          return item.startedOn.toISOString().split("T")[0];
      }
    };

    const hasNextPage = data.length === pageSize;
    const lastItem = hasNextPage ? data[data.length - 1] : undefined;

    return {
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      nextCursor: lastItem ? getCursorValue(lastItem) : undefined,
      nextCursorId: lastItem ? lastItem.id : undefined,
    };
  }

  /**
   * Buscar inversión por ID
   */
  async findById(id: string, userId: string): Promise<Investment | null> {
    const [row] = await db
      .select()
      .from(investments)
      .where(and(eq(investments.id, id), eq(investments.userId, userId)))
      .limit(1);

    if (!row) {
      return null;
    }

    return Investment.fromDB({
      id: row.id,
      userId: row.userId,
      platform: row.platform,
      title: row.title,
      yieldProviderId: row.yieldProviderId,
      principal: parseFloat(row.principal),
      tna: parseFloat(row.tna),
      days: row.days,
      isCompound: row.isCompound,
      startedOn: new Date(row.startedOn),
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  /**
   * Crear nueva inversión
   */
  async create(investment: Investment): Promise<Investment> {
    const [row] = await db
      .insert(investments)
      .values({
        id: investment.id,
        userId: investment.userId,
        platform: investment.platform,
        title: investment.title,
        yieldProviderId: investment.yieldProviderId,
        principal: investment.principal.toString(),
        tna: investment.tna.toString(),
        days: investment.days === 0 ? null : investment.days,
        isCompound: investment.isCompound,
        startedOn: investment.startedOn.toISOString().split("T")[0],
        notes: investment.notes,
      })
      .returning();

    return Investment.fromDB({
      id: row.id,
      userId: row.userId,
      platform: row.platform,
      title: row.title,
      yieldProviderId: row.yieldProviderId,
      principal: parseFloat(row.principal),
      tna: parseFloat(row.tna),
      days: row.days,
      isCompound: row.isCompound,
      startedOn: new Date(row.startedOn),
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  /**
   * Actualizar inversión
   */
  async update(
    id: string,
    userId: string,
    data: Partial<Investment>,
  ): Promise<Investment> {
    // Verificar que existe
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Inversión no encontrada");
    }

    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };

    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.yieldProviderId !== undefined)
      updateData.yieldProviderId = data.yieldProviderId;
    if (data.principal !== undefined)
      updateData.principal = data.principal.toString();
    if (data.tna !== undefined) updateData.tna = data.tna.toString();
    if (data.days !== undefined)
      updateData.days = data.days === 0 ? null : data.days;
    if (data.isCompound !== undefined) updateData.isCompound = data.isCompound;
    if (data.startedOn !== undefined) {
      updateData.startedOn = data.startedOn.toISOString().split("T")[0];
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [row] = await db
      .update(investments)
      .set(updateData)
      .where(and(eq(investments.id, id), eq(investments.userId, userId)))
      .returning();

    return Investment.fromDB({
      id: row.id,
      userId: row.userId,
      platform: row.platform,
      title: row.title,
      yieldProviderId: row.yieldProviderId,
      principal: parseFloat(row.principal),
      tna: parseFloat(row.tna),
      days: row.days,
      isCompound: row.isCompound,
      startedOn: new Date(row.startedOn),
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  /**
   * Eliminar inversión
   */
  async delete(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(investments)
      .where(and(eq(investments.id, id), eq(investments.userId, userId)))
      .returning({ id: investments.id });

    if (result.length === 0) {
      throw new NotFoundError("Inversión no encontrada");
    }
  }

  /**
   * Contar inversiones de un usuario
   */
  async count(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(investments)
      .where(eq(investments.userId, userId));

    return count;
  }

  /**
   * Obtener suma total invertido por un usuario
   */
  async getTotalInvested(userId: string): Promise<number> {
    const [{ total }] = await db
      .select({ total: sql<string>`COALESCE(SUM(principal), 0)` })
      .from(investments)
      .where(eq(investments.userId, userId));

    return parseFloat(total);
  }
}
