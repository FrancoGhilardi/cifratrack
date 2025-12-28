'use client';

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { useDialogForm } from '@/shared/lib/hooks/useDialogForm';
import { changePasswordSchema, type ChangePasswordInput } from '@/entities/user/model/user.schema';

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordInput) => Promise<void>;
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const getDefaultValues = useCallback(
    (): ChangePasswordInput => ({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }),
    []
  );

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { apiError, setApiError, clearError } = useDialogForm(form, true, getDefaultValues);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setApiError(null);
      await onSubmit(data);
      form.reset();
    } catch (error) {
      setApiError((error as Error).message);
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" type="password" {...form.register('currentPassword')} />
        {form.formState.errors.currentPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input id="newPassword" type="password" {...form.register('newPassword')} />
        {form.formState.errors.newPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      {apiError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {apiError}
        </div>
      )}

      <Button type="submit" disabled={form.formState.isSubmitting} isLoading={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
      </Button>
    </form>
  );
}
