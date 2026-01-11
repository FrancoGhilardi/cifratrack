export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

export function buildQueryParams(
  params: Record<string, QueryParamValue>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }
      searchParams.set(key, value.join(','));
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}
