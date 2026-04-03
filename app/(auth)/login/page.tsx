"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginInput,
} from "@/entities/user/model/user.schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/widgets/auth/auth-shell";

export default function LoginPage() {
  const { login, isLoading } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setErrorMessage(null);
      await login(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error al iniciar sesión",
      );
    }
  };

  return (
    <AuthShell
      title="Inicia sesion"
      description="Accede a tu cuenta para revisar tu dashboard, registrar movimientos y seguir tu portafolio desde cualquier dispositivo."
      footer={
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Registrate
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electronico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    inputMode="email"
                    className="h-11"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contrasena</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage && (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
              aria-live="polite"
            >
              {errorMessage}
            </div>
          )}

          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar sesion
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
