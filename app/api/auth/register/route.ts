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
      return err(new ValidationError('Datos inválidos', result.error.issues));
    }

    // Ejecutar caso de uso
    const user = await registerUserUseCase.execute(result.data);

    return ok(user.toDTO(), 201);
  } catch (error) {
    console.error('[Register Error]', error);

    if (error instanceof Error) {
      return err(error, 400);
    }

    return err(new Error('Error interno del servidor'), 500);
  }
}
