import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { ChangePasswordUseCase } from '@/features/profile/usecases/change-password.usecase';
import { UserRepository } from '@/features/auth/repo.impl';
import { changePasswordSchema } from '@/entities/user/model/user.schema';
import { AppError } from '@/shared/lib/errors';
import { ZodError } from 'zod';

const userRepository = new UserRepository();
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    await changePasswordUseCase.execute(String(session.user.id), {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[PUT /api/profile/password] Error:', error);

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
      { error: 'Error al cambiar contraseña' },
      { status: 500 }
    );
  }
}
