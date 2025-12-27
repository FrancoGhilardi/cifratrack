import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../model/query-keys';
import * as api from '../api/profile.api';
import type { UpdateProfileInput, ChangePasswordInput } from '@/entities/user/model/user.schema';

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
    },
  });

  const changePassword = useMutation({
    mutationFn: (data: ChangePasswordInput) => api.changePassword(data),
  });

  return { updateProfile, changePassword };
}
