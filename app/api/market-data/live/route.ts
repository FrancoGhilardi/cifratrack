import { withApiHandler } from "@/shared/lib/api-handler";
import { GetLiveYieldsUseCase } from "@/features/market-data/usecases/get-live-yields.usecase";
import { NotFoundError } from "@/shared/lib/errors";
import { ok } from "@/shared/lib/response";

export const dynamic = "force-dynamic";

const getLiveYieldsUseCase = new GetLiveYieldsUseCase();

export const GET = withApiHandler<string | undefined>({
  public: true,
  query: (searchParams) =>
    searchParams.get("providerId")?.trim().toLowerCase() || undefined,
  handler: async ({ query: providerId }) => {
    const result = await getLiveYieldsUseCase.execute(providerId);

    if (providerId && !result) {
      throw new NotFoundError("Proveedor", providerId);
    }

    return ok(result);
  },
});
