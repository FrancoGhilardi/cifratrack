'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { RegisterInput } from '@/entities/user/model/user.schema';
import { authApi } from '../api/auth.api';

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Registrar usuario
      await authApi.register(data);

      // Auto-login después de registro
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Error al iniciar sesión automáticamente');
      }

      // Redirigir al dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
