import type { IUserRepository } from "@/entities/user/repo";
import { AppError, NotFoundError } from "@/shared/lib/errors";
import { User } from "@/entities/user/model/user.entity";
import { hashPassword, verifyPassword } from "@/shared/lib/password";

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: ChangePasswordInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuario", userId);
    }

    const isValid = await verifyPassword(
      input.currentPassword,
      user.hashedPassword,
    );
    if (!isValid) {
      throw new AppError(
        "La contraseña actual es incorrecta",
        "BAD_REQUEST",
        400,
      );
    }

    User.validateNewPasswordStrength(input.newPassword);

    const newHashed = await hashPassword(input.newPassword);
    user.validatePasswordChange(newHashed);

    const updated = await this.userRepository.updatePassword(userId, newHashed);
    return updated.toDTO();
  }
}
