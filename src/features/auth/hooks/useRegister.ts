"use client";

import type { RegisterInput } from "@/entities/user/model/user.schema";
import { authApi } from "../api/auth.api";
import { useCredentialsSignIn } from "./useCredentialsSignIn";

export function useRegister() {
  const { signInWithCredentials, isLoading, error } = useCredentialsSignIn();

  const register = (data: RegisterInput) =>
    signInWithCredentials(data, {
      onBeforeSignIn: () => authApi.register(data).then(() => undefined),
      genericErrorMessage: "Error al iniciar sesión automáticamente",
    });

  return { register, isLoading, error };
}
