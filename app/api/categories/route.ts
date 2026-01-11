import { auth } from '@/shared/lib/auth';
import { CategoryRepository } from '@/features/categories/repo.impl';
import { ListCategoriesUseCase } from '@/features/categories/usecases/list-categories.usecase';
import { UpsertCategoryUseCase } from '@/features/categories/usecases/upsert-category.usecase';
import { ok, err } from '@/shared/lib/response';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';
import { createCategorySchema, listCategoriesSchema } from '@/entities/category/model/category.schema';

const categoryRepository = new CategoryRepository();
const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
const upsertCategoryUseCase = new UpsertCategoryUseCase(categoryRepository);

/**
 * GET /api/categories
 * Listar categorías del usuario
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    // Obtener filtros del query param
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind') as 'income' | 'expense' | null;
    const isActiveParam = searchParams.get('isActive');

    // Validar filtros
    const filters = listCategoriesSchema.parse({
      kind: kind || undefined,
      isActive: isActiveParam ? isActiveParam === 'true' : undefined,
    });

    // Ejecutar caso de uso
    const categories = await listCategoriesUseCase.execute(session.user.id, filters);

    // Convertir a DTOs
    const dtos = categories.map((cat) => cat.toDTO());

    return ok(dtos);
  } catch (error) {
    console.error('[Categories List Error]', error);

    if (error instanceof ValidationError) {
      return err(error, 400);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}

/**
 * POST /api/categories
 * Crear nueva categoría
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    // Parsear body
    const body = await request.json();

    // Validar datos
    const validated = createCategorySchema.parse(body);

    // Ejecutar caso de uso
    const category = await upsertCategoryUseCase.create(session.user.id, validated);

    return ok(category.toDTO(), 201);
  } catch (error) {
    console.error('[Categories Create Error]', error);

    if (error instanceof ValidationError) {
      return err(error, 400);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
