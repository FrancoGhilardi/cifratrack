import { withApiHandler } from "@/shared/lib/api-handler";
import { ChangePasswordUseCase } from "@/features/profile/usecases/change-password.usecase";
import { UserRepository } from "@/features/auth/repo.impl";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/entities/user/model/user.schema";
import { ok } from "@/shared/lib/response";

const userRepository = new UserRepository();
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

export const PUT = withApiHandler<undefined, ChangePasswordInput>({
  bodySchema: changePasswordSchema,
  handler: async ({ userId, body }) => {
    await changePasswordUseCase.execute(userId, {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
    return ok({ success: true });
  },
});
