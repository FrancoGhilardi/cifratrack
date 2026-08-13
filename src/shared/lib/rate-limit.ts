import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/shared/config/env";

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis) {
  console.warn(
    "[RateLimit] UPSTASH_REDIS_REST_URL/TOKEN no configuradas — rate limiting deshabilitado",
  );
}

/**
 * Crea un limitador sliding-window de 5 intentos/minuto con el prefix dado.
 * Fail-open (retorna `true` siempre) si Redis no está configurado.
 */
function createRateLimiter(prefix: string) {
  const limiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: `ratelimit:${prefix}`,
      })
    : null;

  return async (identifier: string): Promise<boolean> => {
    if (!limiter) return true;
    const { success } = await limiter.limit(identifier);
    return success;
  };
}

export const checkLoginRateLimit = createRateLimiter("login");
export const checkRegisterRateLimit = createRateLimiter("register");
export const checkChangePasswordRateLimit = createRateLimiter("change-password");

/** Extrae la IP del cliente desde headers de proxy (Vercel, etc). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
