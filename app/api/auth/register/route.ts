import { withApiHandler } from "@/shared/lib/api-handler";
import {
  registerSchema,
  type RegisterInput,
} from "@/entities/user/model/user.schema";
import { RegisterUserUseCase } from "@/features/auth/usecases/register-user.usecase";
import { UserRepository } from "@/features/auth/repo.impl";
import { ok, err } from "@/shared/lib/response";
import { RateLimitError } from "@/shared/lib/errors";
import { checkRegisterRateLimit, getClientIp } from "@/shared/lib/rate-limit";

const userRepository = new UserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);

export const POST = withApiHandler<undefined, RegisterInput>({
  public: true,
  bodySchema: registerSchema,
  handler: async ({ body, request }) => {
    const ip = getClientIp(request);
    const allowed = await checkRegisterRateLimit(ip);
    if (!allowed) {
      return err(new RateLimitError(), 429);
    }

    const user = await registerUserUseCase.execute(body);
    return ok(user.toDTO(), 201);
  },
});
