import { NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";
import { UpdateProfileUseCase } from "@/features/profile/usecases/update-profile.usecase";
import { GetProfileUseCase } from "@/features/profile/usecases/get-profile.usecase";
import { UserRepository } from "@/features/auth/repo.impl";
import { updateProfileSchema } from "@/entities/user/model/user.schema";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import { ZodError } from "zod";
import { err, ok } from "@/shared/lib/response";

const userRepository = new UserRepository();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const getProfileUseCase = new GetProfileUseCase(userRepository);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const user = await getProfileUseCase.execute(String(session.user.id));

    return ok(user);
  } catch (error) {
    console.error("[GET /api/profile] Error:", error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    return err(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updated = await updateProfileUseCase.execute(
      String(session.user.id),
      data
    );

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/profile] Error:", error);

    if (error instanceof ZodError) {
      return err(new ValidationError("Datos inválidos", error.issues));
    }

    return err(error);
  }
}
