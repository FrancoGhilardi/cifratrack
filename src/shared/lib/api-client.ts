'use client';

import { signOut } from 'next-auth/react';

type ApiFetchOptions = RequestInit & {
  /**
   * Si es true, no dispara signOut automático en caso de 401
   */
  skipAuthRedirect?: boolean;
};

let isSigningOut = false;

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Wrapper de fetch con manejo centralizado de errores y 401 → signOut.
 */
export async function apiFetch<T = unknown>(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...init } = options;
  const response = await fetch(input, init);

  if (response.status === 401 && !skipAuthRedirect) {
    if (!isSigningOut) {
      isSigningOut = true;
      // Redirigir a login; no esperamos a que finalice para no bloquear
      void signOut({ callbackUrl: '/login' });
    }
    throw new Error('No autenticado');
  }

  if (!response.ok) {
    const data = await parseJsonSafe(response);
    const message =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      response.statusText ||
      'Error en la solicitud';
    throw new Error(message);
  }

  // Respuestas sin cuerpo (204)
  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseJsonSafe(response)) as T;
}
