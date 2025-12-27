import bcrypt from 'bcryptjs';
import type { IUserRepository } from '@/entities/user/repo';
import { AppError, NotFoundError } from '@/shared/lib/errors';
import { User } from '@/entities/user/model/user.entity';

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: ChangePasswordInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario', userId);
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.hashedPassword);
    if (!isValid) {
      throw new AppError('La contraseña actual es incorrecta', 'BAD_REQUEST', 400);
    }

    User.validateNewPasswordStrength(input.newPassword);

    const newHashed = await bcrypt.hash(input.newPassword, 10);
    user.validatePasswordChange(newHashed);

    const updated = await this.userRepository.updatePassword(userId, newHashed);
    return updated.toDTO();
  }
}
