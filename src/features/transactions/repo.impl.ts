import { db } from '@/shared/db/client';
import { transactions, transactionCategories, categories, paymentMethods } from '@/shared/db/schema';
import { eq, and, desc, asc, sql, inArray, like, or, type SQL } from 'drizzle-orm';
import type { CreateTransactionInput, UpdateTransactionInput } from '@/entities/transaction/model/transaction.schema';
import type { ITransactionRepository, ListTransactionsParams, PaginatedTransactions, TransactionWithNames } from '@/entities/transaction/repo';
import type { Transaction } from '@/entities/transaction/model/transaction.entity';
import { NotFoundError, ValidationError } from '@/shared/lib/errors';
import { TransactionMapper } from './mappers/transaction.mapper';

export interface TransactionWithRelations {
  transaction: typeof transactions.$inferSelect;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    allocatedAmount: number;
  }>;
  paymentMethod: typeof paymentMethods.$inferSelect | null;
}

/**
 * Repositorio de transacciones con Drizzle ORM
 * Implementa ITransactionRepository
 */
export class TransactionRepository implements ITransactionRepository {
  /**
   * Listar transacciones con filtros, paginación y ordenamiento
   */
  async list(params: ListTransactionsParams): Promise<PaginatedTransactions> {
    const {
      userId,
      month,
      kind,
      status,
      paymentMethodId,
      categoryIds,
      q,
      sortBy = 'occurred_on',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20,
    } = params;

    // Validar parámetros
    const validSortBy = ['occurred_on', 'amount', 'title', 'created_at'];
    if (!validSortBy.includes(sortBy)) {
      throw new ValidationError(`sortBy debe ser uno de: ${validSortBy.join(', ')}`);
    }

    if (pageSize > 100) {
      throw new ValidationError('pageSize no puede ser mayor a 100');
    }

    // Construir condiciones WHERE
    const conditions = [eq(transactions.userId, userId)];

    if (month) {
      // month viene en formato YYYY-MM, occurredMonth en DB es char(7) con el mismo formato
      conditions.push(eq(transactions.occurredMonth, month));
    }

    if (kind) {
      conditions.push(eq(transactions.kind, kind));
    }

    if (status) {
      conditions.push(eq(transactions.status, status));
    }

    if (paymentMethodId) {
      conditions.push(eq(transactions.paymentMethodId, paymentMethodId));
    }

    if (q) {
      conditions.push(
        or(
          like(transactions.title, `%${q}%`),
          like(transactions.description, `%${q}%`)
        )!
      );
    }

    // Filtro por categorías (requiere subquery)
    if (categoryIds && categoryIds.length > 0) {
      const transactionIdsSubquery = db
        .selectDistinct({ id: transactionCategories.transactionId })
        .from(transactionCategories)
        .where(inArray(transactionCategories.categoryId, categoryIds));

      conditions.push(
        inArray(
          transactions.id,
          sql`(${transactionIdsSubquery})`
        )
      );
    }

    // Ordenamiento
    const orderColumn = sortBy === 'occurred_on' 
      ? transactions.occurredOn
      : sortBy === 'amount'
      ? transactions.amount
      : sortBy === 'title'
      ? transactions.title
      : transactions.createdAt;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Contar total
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    // Obtener transacciones
    const transactionRows = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(pageSize)
      .offset(offset);

    // Obtener categorías asociadas
    const transactionIds = transactionRows.map((t) => t.id);
    const categoriesData = transactionIds.length > 0
      ? await db
          .select({
            transactionId: transactionCategories.transactionId,
            categoryId: transactionCategories.categoryId,
            categoryName: categories.name,
            allocatedAmount: transactionCategories.allocatedAmount,
          })
          .from(transactionCategories)
          .innerJoin(categories, eq(transactionCategories.categoryId, categories.id))
          .where(inArray(transactionCategories.transactionId, transactionIds))
      : [];

    // Obtener payment methods
    const paymentMethodIds = transactionRows
      .filter((t) => t.paymentMethodId)
      .map((t) => t.paymentMethodId!);

    const paymentMethodsData = paymentMethodIds.length > 0
      ? await db
          .select()
          .from(paymentMethods)
          .where(inArray(paymentMethods.id, paymentMethodIds))
      : [];

    // Mapear resultados a entidades de dominio
    const transactionsWithRelations: TransactionWithRelations[] = transactionRows.map((transaction) => {
      const transactionCategories = categoriesData.filter(
        (c) => c.transactionId === transaction.id
      );

      const paymentMethod = transaction.paymentMethodId
        ? paymentMethodsData.find((pm) => pm.id === transaction.paymentMethodId) ?? null
        : null;

      return {
        transaction,
        categories: transactionCategories.map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          allocatedAmount: c.allocatedAmount,
        })),
        paymentMethod,
      };
    });

    // Convertir a entidades de dominio
    const domainTransactions = transactionsWithRelations.map((item) =>
      TransactionMapper.rowToDomain(item)
    );

    return {
      data: domainTransactions,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Buscar transacción por ID con sus relaciones
   */
  async findById(id: string, userId: string): Promise<TransactionWithNames | null> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (!transaction) {
      return null;
    }

    // Obtener categorías
    const categoriesData = await db
      .select({
        categoryId: transactionCategories.categoryId,
        categoryName: categories.name,
        allocatedAmount: transactionCategories.allocatedAmount,
      })
      .from(transactionCategories)
      .innerJoin(categories, eq(transactionCategories.categoryId, categories.id))
      .where(eq(transactionCategories.transactionId, id));

    // Obtener payment method
    let paymentMethod = null;
    if (transaction.paymentMethodId) {
      const [pm] = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.id, transaction.paymentMethodId))
        .limit(1);
      paymentMethod = pm ?? null;
    }

    const transactionWithRelations: TransactionWithRelations = {
      transaction,
      categories: categoriesData.map((c) => ({
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        allocatedAmount: c.allocatedAmount,
      })),
      paymentMethod,
    };

    // Convertir a entidad de dominio
    return TransactionMapper.rowToDomain(transactionWithRelations);
  }

  /**
   * Crear transacción con splits en transacción DB
   */
  async create(
    userId: string,
    data: CreateTransactionInput
  ): Promise<TransactionWithNames> {
    // Validar que la suma de splits coincida con el monto
    if (data.split && data.split.length > 0) {
      const totalSplit = data.split.reduce((sum: number, s) => sum + s.allocatedAmount, 0);
      if (totalSplit !== data.amount) {
        throw new ValidationError(
          `La suma de los splits (${totalSplit}) debe coincidir con el monto total (${data.amount})`
        );
      }
    }

    return await db.transaction(async (tx) => {
      // Crear transacción usando SQL raw para omitir occurredMonth (calculado por trigger)
      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId,
          kind: data.kind,
          title: data.title,
          description: data.description ?? null,
          amount: data.amount,
          currency: data.currency ?? 'ARS',
          paymentMethodId: data.paymentMethodId ?? null,
          isFixed: data.isFixed ?? false,
          status: data.status,
          occurredOn: data.occurredOn.toISOString().split('T')[0],
          dueOn: data.dueOn ? data.dueOn.toISOString().split('T')[0] : null,
          paidOn: data.paidOn ? data.paidOn.toISOString().split('T')[0] : null,
          occurredMonth: data.occurredOn.toISOString().split('T')[0].substring(0, 7),
          sourceRecurringRuleId: data.sourceRecurringRuleId ?? null,
        })
        .returning();

      // Crear splits
      const categoriesData: Array<{
        categoryId: string;
        categoryName: string;
        allocatedAmount: number;
      }> = [];

      if (data.split && data.split.length > 0) {
        await tx.insert(transactionCategories).values(
          data.split.map((split) => ({
            transactionId: transaction.id,
            categoryId: split.categoryId,
            allocatedAmount: split.allocatedAmount,
          }))
        );

        // Obtener nombres de categorías
        const categoryIds = data.split.map((s) => s.categoryId);
        const categoriesRows = await tx
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(inArray(categories.id, categoryIds));

        data.split.forEach((split) => {
          const category = categoriesRows.find((c) => c.id === split.categoryId);
          if (category) {
            categoriesData.push({
              categoryId: split.categoryId,
              categoryName: category.name,
              allocatedAmount: split.allocatedAmount,
            });
          }
        });
      }

      // Obtener payment method
      let paymentMethod = null;
      if (transaction.paymentMethodId) {
        const [pm] = await tx
          .select()
          .from(paymentMethods)
          .where(eq(paymentMethods.id, transaction.paymentMethodId))
          .limit(1);
        paymentMethod = pm ?? null;
      }

      const transactionWithRelations: TransactionWithRelations = {
        transaction,
        categories: categoriesData,
        paymentMethod,
      };

      // Convertir a entidad de dominio
      return TransactionMapper.rowToDomain(transactionWithRelations);
    });
  }

  /**
   * Actualizar transacción y sus splits
   */
  async update(
    id: string,
    userId: string,
    data: UpdateTransactionInput
  ): Promise<TransactionWithNames> {
    // Validar que existe
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Transacción no encontrada');
    }

    // Validar splits si se envían
    if (data.split && data.split.length > 0 && data.amount) {
      const totalSplit = data.split.reduce((sum: number, s) => sum + s.allocatedAmount, 0);
      if (totalSplit !== data.amount) {
        throw new ValidationError(
          `La suma de los splits (${totalSplit}) debe coincidir con el monto total (${data.amount})`
        );
      }
    }

    return await db.transaction(async (tx) => {
      // Actualizar transacción
      const updateData: Record<string, string | number | boolean | null | SQL> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.occurredOn !== undefined) {
        // Verificar tipo y convertir si es necesario
        let dateStr: string;
        if (data.occurredOn instanceof Date) {
          dateStr = data.occurredOn.toISOString().split('T')[0];
        } else if (typeof data.occurredOn === 'string') {
          dateStr = new Date(data.occurredOn).toISOString().split('T')[0];
        } else {
          // Fallback: convertir cualquier otro tipo a Date primero
          dateStr = new Date(data.occurredOn as any).toISOString().split('T')[0];
        }
        updateData.occurredOn = dateStr;
        // Actualizar occurredMonth en formato YYYY-MM
        updateData.occurredMonth = dateStr.substring(0, 7);
      }
      if (data.dueOn !== undefined) {
        // Verificar tipo y convertir si es necesario
        if (data.dueOn === null) {
          updateData.dueOn = null;
        } else if (data.dueOn instanceof Date) {
          updateData.dueOn = data.dueOn.toISOString().split('T')[0];
        } else if (typeof data.dueOn === 'string') {
          updateData.dueOn = new Date(data.dueOn).toISOString().split('T')[0];
        }
      }
      if (data.paidOn !== undefined) {
        // Verificar tipo y convertir si es necesario
        if (data.paidOn === null) {
          updateData.paidOn = null;
        } else if (data.paidOn instanceof Date) {
          updateData.paidOn = data.paidOn.toISOString().split('T')[0];
        } else if (typeof data.paidOn === 'string') {
          updateData.paidOn = new Date(data.paidOn).toISOString().split('T')[0];
        }
      }
      if (data.paymentMethodId !== undefined) updateData.paymentMethodId = data.paymentMethodId;
      if (data.isFixed !== undefined) updateData.isFixed = data.isFixed;

      updateData.updatedAt = sql`now()`;

      const [transaction] = await tx
        .update(transactions)
        .set(updateData)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning();

      console.log('Transaction updated raw:', transaction);


      // Actualizar splits si se envían
      const categoriesData: Array<{
        categoryId: string;
        categoryName: string;
        allocatedAmount: number;
      }> = [];

      if (data.split !== undefined) {
        // Eliminar splits existentes
        await tx
          .delete(transactionCategories)
          .where(eq(transactionCategories.transactionId, id));

        // Crear nuevos splits
        if (data.split.length > 0) {
          await tx.insert(transactionCategories).values(
            data.split.map((split) => ({
              transactionId: id,
              categoryId: split.categoryId,
              allocatedAmount: split.allocatedAmount,
            }))
          );

          // Obtener nombres de categorías
          const categoryIds = data.split.map((s) => s.categoryId);
          const categoriesRows = await tx
            .select({ id: categories.id, name: categories.name })
            .from(categories)
            .where(inArray(categories.id, categoryIds));

          data.split.forEach((split) => {
            const category = categoriesRows.find((c) => c.id === split.categoryId);
            if (category) {
              categoriesData.push({
                categoryId: split.categoryId,
                categoryName: category.name,
                allocatedAmount: split.allocatedAmount,
              });
            }
          });
        }
      } else {
        // Mantener splits existentes
        const existingCategories = await tx
          .select({
            categoryId: transactionCategories.categoryId,
            categoryName: categories.name,
            allocatedAmount: transactionCategories.allocatedAmount,
          })
          .from(transactionCategories)
          .innerJoin(categories, eq(transactionCategories.categoryId, categories.id))
          .where(eq(transactionCategories.transactionId, id));

        categoriesData.push(...existingCategories);
      }

      // Obtener payment method
      let paymentMethod = null;
      if (transaction.paymentMethodId) {
        const [pm] = await tx
          .select()
          .from(paymentMethods)
          .where(eq(paymentMethods.id, transaction.paymentMethodId))
          .limit(1);
        paymentMethod = pm ?? null;
      }

      const transactionWithRelations: TransactionWithRelations = {
        transaction,
        categories: categoriesData,
        paymentMethod,
      };

      // Convertir a entidad de dominio
      return TransactionMapper.rowToDomain(transactionWithRelations);
    });
  }

  /**
   * Eliminar transacción con cascade a splits
   */
  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Transacción no encontrada');
    }

    await db.transaction(async (tx) => {
      // Eliminar splits
      await tx
        .delete(transactionCategories)
        .where(eq(transactionCategories.transactionId, id));

      // Eliminar transacción
      await tx
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    });
  }

  /**
   * Obtener transacciones de un mes específico
   */
  async getByMonth(userId: string, month: string): Promise<Transaction[]> {
    const result = await this.list({
      userId,
      month,
      pageSize: 1000, // suficiente para un mes
    });

    return result.data.map((item) => item.transaction);
  }

  /**
   * Obtener resumen mensual
   */
  async getMonthlySummary(
    userId: string,
    month: string
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionsCount: number;
  }> {
    const result = await this.list({
      userId,
      month,
      pageSize: 1000,
    });

    const totalIncome = result.data
      .filter((t) => t.transaction.kind === 'income')
      .reduce((sum, t) => sum + t.transaction.amount, 0);

    const totalExpenses = result.data
      .filter((t) => t.transaction.kind === 'expense')
      .reduce((sum, t) => sum + t.transaction.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionsCount: result.total,
    };
  }
}
