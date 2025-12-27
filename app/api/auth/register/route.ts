import { NextResponse } from 'next/server';
import { registerSchema } from '@/entities/user/model/user.schema';
import { RegisterUserUseCase } from '@/features/auth/usecases/register-user.usecase';
import { UserRepository } from '@/features/auth/repo.impl';
import { ok, err } from '@/shared/lib/response';
import { ValidationError } from '@/shared/lib/errors';

const userRepository = new UserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        err(new ValidationError('Datos inválidos', result.error.issues)),
        { status: 400 }
      );
    }

    // Ejecutar caso de uso
    const user = await registerUserUseCase.execute(result.data);

    return NextResponse.json(ok(user.toDTO()), { status: 201 });
  } catch (error) {
    console.error('[Register Error]', error);

    if (error instanceof Error) {
      return NextResponse.json(
        err(error),
        { status: 400 }
      );
    }

    return NextResponse.json(
      err(new Error('Error interno del servidor')),
      { status: 500 }
    );
  }
}
