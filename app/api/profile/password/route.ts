import { NextRequest } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { ChangePasswordUseCase } from '@/features/profile/usecases/change-password.usecase';
import { UserRepository } from '@/features/auth/repo.impl';
import { changePasswordSchema } from '@/entities/user/model/user.schema';
import { AuthenticationError, ValidationError } from '@/shared/lib/errors';
import { ZodError } from 'zod';
import { err, ok } from '@/shared/lib/response';

const userRepository = new UserRepository();
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError('No autenticado'), 401);
    }

    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    await changePasswordUseCase.execute(String(session.user.id), {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    return ok({ success: true });
  } catch (error) {
    console.error('[PUT /api/profile/password] Error:', error);

    if (error instanceof ZodError) {
      return err(new ValidationError('Datos inválidos', error.issues));
    }

    return err(error);
  }
}
