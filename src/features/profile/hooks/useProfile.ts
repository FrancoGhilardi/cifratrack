import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../model/query-keys';
import * as api from '../api/profile.api';
import type { UpdateProfileInput, ChangePasswordInput } from '@/entities/user/model/user.schema';
import { toast } from '@/shared/lib/toast';

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: api.fetchProfile,
  });
}

export function useProfileMutations() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfileInput) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      toast.success('Perfil actualizado');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al actualizar perfil'),
  });

  const changePassword = useMutation({
    mutationFn: (data: ChangePasswordInput) => api.changePassword(data),
    onSuccess: () => toast.success('Contraseña actualizada'),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al cambiar contraseña'),
  });

  return { updateProfile, changePassword };
}
