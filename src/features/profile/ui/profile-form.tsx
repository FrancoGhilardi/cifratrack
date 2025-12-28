'use client';

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { useDialogForm } from '@/shared/lib/hooks/useDialogForm';
import type { UpdateProfileInput } from '@/entities/user/model/user.schema';
import { updateProfileSchema } from '@/entities/user/model/user.schema';
import type { ProfileDTO } from '../model/profile.dto';

interface ProfileFormProps {
  profile: ProfileDTO;
  onSubmit: (data: UpdateProfileInput) => Promise<void>;
}

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const getDefaultValues = useCallback(
    (): UpdateProfileInput => ({
      name: profile.name ?? '',
      email: profile.email,
    }),
    [profile.name, profile.email]
  );

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { apiError, setApiError, clearError } = useDialogForm(form, true, getDefaultValues);

  useEffect(() => {
    clearError();
  }, [profile, clearError]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setApiError(null);
      await onSubmit(data);
    } catch (error) {
      setApiError((error as Error).message);
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...form.register('name')} placeholder="Tu nombre" />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="tu@email.com"
          disabled
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      {apiError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {apiError}
        </div>
      )}

      <Button type="submit" disabled={form.formState.isSubmitting} isLoading={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  );
}
