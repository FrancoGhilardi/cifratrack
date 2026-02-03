import { NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";
import { InvestmentRepository } from "@/features/investments/repo.impl";
import { UpsertInvestmentUseCase } from "@/features/investments/usecases/upsert-investment.usecase";
import { DeleteInvestmentUseCase } from "@/features/investments/usecases/delete-investment.usecase";
import { GetInvestmentByIdUseCase } from "@/features/investments/usecases/get-investment-by-id.usecase";
import { InvestmentMapper } from "@/features/investments/mappers/investment.mapper";
import { updateInvestmentSchema } from "@/entities/investment/model/investment.schema";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/errors";
import { ZodError } from "zod";
import { err, ok } from "@/shared/lib/response";

const repository = new InvestmentRepository();
const upsertUseCase = new UpsertInvestmentUseCase(repository);
const deleteUseCase = new DeleteInvestmentUseCase(repository);
const getByIdUseCase = new GetInvestmentByIdUseCase(repository);

/**
 * GET /api/investments/:id
 * Obtener inversión por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const investment = await getByIdUseCase.execute(id, session.user.id);

    return ok(InvestmentMapper.toDTO(investment));
  } catch (error) {
    console.error("[GET /api/investments/:id] Error:", error);

    if (error instanceof NotFoundError) {
      return err(error, 404);
    }

    return err(error);
  }
}

/**
 * PUT /api/investments/:id
 * Actualizar inversión
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    const body = await request.json();

    // Validar datos
    const data = updateInvestmentSchema.parse(body);

    // Actualizar
    const investment = await upsertUseCase.update(id, session.user.id, data);

    return ok(InvestmentMapper.toDTO(investment));
  } catch (error) {
    console.error("[PUT /api/investments/:id] Error:", error);

    if (error instanceof ZodError) {
      return err(new ValidationError("Datos inválidos", error.issues));
    }

    return err(error);
  }
}

/**
 * DELETE /api/investments/:id
 * Eliminar inversión
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AuthenticationError("No autenticado"), 401);
    }

    await deleteUseCase.execute(id, session.user.id);

    return ok({ success: true });
  } catch (error) {
    console.error("[DELETE /api/investments/:id] Error:", error);

    return err(error);
  }
}
