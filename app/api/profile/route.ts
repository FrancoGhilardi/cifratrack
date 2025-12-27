import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { UpdateProfileUseCase } from '@/features/profile/usecases/update-profile.usecase';
import { UserRepository } from '@/features/auth/repo.impl';
import { updateProfileSchema } from '@/entities/user/model/user.schema';
import { AppError } from '@/shared/lib/errors';
import { ZodError } from 'zod';

const userRepository = new UserRepository();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const user = await userRepository.findById(String(session.user.id));
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ data: user.toDTO() });
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updated = await updateProfileUseCase.execute(String(session.user.id), data);

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PUT /api/profile] Error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
