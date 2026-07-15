import { withApiHandler } from "@/shared/lib/api-handler";
import { UpdateProfileUseCase } from "@/features/profile/usecases/update-profile.usecase";
import { GetProfileUseCase } from "@/features/profile/usecases/get-profile.usecase";
import { UserRepository } from "@/features/auth/repo.impl";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/entities/user/model/user.schema";
import { ok } from "@/shared/lib/response";

const userRepository = new UserRepository();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const getProfileUseCase = new GetProfileUseCase(userRepository);

export const GET = withApiHandler({
  handler: async ({ userId }) => {
    const user = await getProfileUseCase.execute(userId);
    return ok(user);
  },
});

export const PUT = withApiHandler<undefined, UpdateProfileInput>({
  bodySchema: updateProfileSchema,
  handler: async ({ userId, body }) => {
    const updated = await updateProfileUseCase.execute(userId, body);
    return ok(updated);
  },
});
