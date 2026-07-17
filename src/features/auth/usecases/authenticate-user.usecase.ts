import type { IUserRepository } from "@/entities/user/repo";
import type { LoginInput } from "@/entities/user/model/user.schema";
import type { User } from "@/entities/user/model/user.entity";
import { AuthenticationError } from "@/shared/lib/errors";
import { verifyPassword } from "@/shared/lib/password";

/**
 * Hash bcrypt (cost 10, igual a MIN_SALT_ROUNDS de password.ts) de una cadena
 * aleatoria fija, sin contraseña real asociada. Se compara contra ella cuando
 * el email no existe para que esa rama pague el mismo costo de bcrypt que la
 * de password incorrecto, evitando enumerar usuarios por timing.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$10$aKjtBs1uwu5E.6hBsYkWr.FSbKHnrT73F2FL7CJKra.p.FYNkKQt2";

export class AuthenticateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<User> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      await verifyPassword(input.password, DUMMY_PASSWORD_HASH);
      throw new AuthenticationError("Credenciales inválidas");
    }

    const isValidPassword = await verifyPassword(
      input.password,
      user.hashedPassword,
    );

    if (!isValidPassword) {
      throw new AuthenticationError("Credenciales inválidas");
    }

    return user;
  }
}
