"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface CredentialsSignInInput {
  email: string;
  password: string;
}

interface CredentialsSignInOptions {
  /** Corre antes del signIn (ej. registrar al usuario). Si lanza, el signIn no se intenta. */
  onBeforeSignIn?: () => Promise<void>;
  /** Mensaje cuando `signIn` falla por un motivo genérico (no rate-limit). */
  genericErrorMessage?: string;
}

const RATE_LIMITED_MESSAGE =
  "Demasiados intentos. Probá de nuevo en un minuto.";

/**
 * Encapsula el flujo común de login/registro: signIn con credentials,
 * manejo de isLoading/error y redirección al dashboard. Login y registro
 * comparten esta lógica; solo difieren en si hay un paso previo
 * (`onBeforeSignIn`) y en el mensaje genérico de error.
 */
export function useCredentialsSignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithCredentials = async (
    data: CredentialsSignInInput,
    options?: CredentialsSignInOptions,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      if (options?.onBeforeSignIn) {
        await options.onBeforeSignIn();
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const message =
          result.code === "rate-limited"
            ? RATE_LIMITED_MESSAGE
            : (options?.genericErrorMessage ?? "Credenciales incorrectas");
        throw new Error(message);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithCredentials, isLoading, error };
}
