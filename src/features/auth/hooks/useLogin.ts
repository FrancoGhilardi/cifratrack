"use client";

import type { LoginInput } from "@/entities/user/model/user.schema";
import { useCredentialsSignIn } from "./useCredentialsSignIn";

export function useLogin() {
  const { signInWithCredentials, isLoading, error } = useCredentialsSignIn();

  const login = (data: LoginInput) => signInWithCredentials(data);

  return { login, isLoading, error };
}
