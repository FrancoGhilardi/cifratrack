import { auth } from '@/shared/lib/auth';
import { CategoryRepository } from '@/features/categories/repo.impl';
import { UpsertCategoryUseCase } from '@/features/categories/usecases/upsert-category.usecase';
import { DeleteCategoryUseCase } from '@/features/categories/usecases/delete-category.usecase';
import { ok, err } from '@/shared/lib/response';
import { AuthenticationError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { updateCategorySchema } from '@/entities/category/model/category.schema';

const categoryRepository = new CategoryRepository();
const upsertCategoryUseCase = new UpsertCategoryUseCase(categoryRepository);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);

/**
 * GET /api/categories/[id]
 * Obtener categoría por ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    // Buscar categoría
    const category = await categoryRepository.findById(id, session.user.id);

    if (!category) {
      return err(new NotFoundError('Categoría'), 404);
    }

    return ok(category.toDTO());
  } catch (error) {
    console.error('[Category Get Error]', error);

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}

/**
 * PUT /api/categories/[id]
 * Actualizar categoría
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    // Parsear body
    const body = await request.json();

    // Validar datos
    const validated = updateCategorySchema.parse(body);

    // Ejecutar caso de uso
    const category = await upsertCategoryUseCase.update(
      id,
      session.user.id,
      validated
    );

    return ok(category.toDTO());
  } catch (error) {
    console.error('[Category Update Error]', error);

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return err(error, 400);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}

/**
 * DELETE /api/categories/[id]
 * Eliminar categoría
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    // Ejecutar caso de uso
    await deleteCategoryUseCase.execute(id, session.user.id);

    return ok({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('[Category Delete Error]', error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
