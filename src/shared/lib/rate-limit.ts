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

const loginRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "ratelimit:login",
    })
  : null;

const registerRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "ratelimit:register",
    })
  : null;

/** Retorna true si el intento está permitido (fail-open si Redis no está configurado). */
export async function checkLoginRateLimit(
  identifier: string,
): Promise<boolean> {
  if (!loginRatelimit) return true;
  const { success } = await loginRatelimit.limit(identifier);
  return success;
}

export async function checkRegisterRateLimit(
  identifier: string,
): Promise<boolean> {
  if (!registerRatelimit) return true;
  const { success } = await registerRatelimit.limit(identifier);
  return success;
}

/** Extrae la IP del cliente desde headers de proxy (Vercel, etc). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
