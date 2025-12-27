import type { IUserRepository } from '@/entities/user/repo';
import type { UpdateProfileInput } from '@/entities/user/model/user.schema';
import { AppError, NotFoundError } from '@/shared/lib/errors';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario', userId);
    }

    if (data.email) {
      const exists = await this.userRepository.emailExists(data.email, userId);
      if (exists) {
        throw new AppError('El email ya está en uso', 'CONFLICT', 409);
      }
    }

    const updated = await this.userRepository.updateProfile(userId, data);
    return updated.toDTO();
  }
}
