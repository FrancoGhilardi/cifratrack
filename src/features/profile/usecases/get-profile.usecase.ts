import type { IUserRepository } from "@/entities/user/repo";
import { NotFoundError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener perfil del usuario
 */
export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuario", userId);
    }

    return user.toDTO();
  }
}
