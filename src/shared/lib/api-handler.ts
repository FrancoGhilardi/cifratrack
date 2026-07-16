import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { auth } from "@/shared/lib/auth";
import { err } from "@/shared/lib/response";
import { AuthenticationError, ValidationError } from "@/shared/lib/errors";

type ParamsRecord = Record<string, string>;

type ApiHandlerContext<TQuery, TBody, TParams extends ParamsRecord> = {
  userId: string;
  query: TQuery;
  body: TBody;
  params: TParams;
  request: NextRequest;
};

type RouteContext<TParams extends ParamsRecord> = {
  params: Promise<TParams>;
};

/**
 * Factory para route handlers: centraliza auth check, parseo de
 * query/body y try/catch uniforme (ZodError -> ValidationError,
 * AppError -> status desde error.statusCode, resto -> 500).
 *
 * `query`/`bodySchema` ausentes => ese campo llega como `undefined`.
 */
export function withApiHandler<
  TQuery = undefined,
  TBody = undefined,
  TParams extends ParamsRecord = ParamsRecord,
>(config: {
  /** Si es true, salta el chequeo de sesión (rutas públicas). Default: false. */
  public?: boolean;
  /** Parsea/valida los search params. Recibe el URLSearchParams crudo. */
  query?: (searchParams: URLSearchParams) => TQuery;
  /** Valida el body con un schema Zod. */
  bodySchema?: ZodSchema<TBody>;
  handler: (
    ctx: ApiHandlerContext<TQuery, TBody, TParams>,
  ) => Promise<NextResponse>;
}) {
  return async (
    request: NextRequest,
    context?: RouteContext<TParams>,
  ): Promise<NextResponse> => {
    try {
      let userId = "";
      if (!config.public) {
        const session = await auth();
        if (!session?.user?.id) {
          return err(new AuthenticationError(), 401);
        }
        userId = session.user.id;
      }

      const params = context ? await context.params : ({} as TParams);
      const query = config.query
        ? config.query(request.nextUrl.searchParams)
        : (undefined as TQuery);
      const body = config.bodySchema
        ? config.bodySchema.parse(await request.json())
        : (undefined as TBody);

      return await config.handler({ userId, query, body, params, request });
    } catch (error) {
      if (error instanceof ZodError) {
        return err(new ValidationError("Datos inválidos", error.issues));
      }
      console.error("[API Error]", error);
      return err(error);
    }
  };
}
