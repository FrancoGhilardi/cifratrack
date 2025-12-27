import { apiFetch } from '@/shared/lib/api-client';
import type { ProfileDTO } from '../model/profile.dto';
import type { UpdateProfileInput, ChangePasswordInput } from '@/entities/user/model/user.schema';

export async function fetchProfile(): Promise<ProfileDTO> {
  const result = await apiFetch<{ data: ProfileDTO }>('/api/profile');
  return result.data;
}

export async function updateProfile(data: UpdateProfileInput): Promise<ProfileDTO> {
  const result = await apiFetch<{ data: ProfileDTO }>('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return result.data;
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  await apiFetch('/api/profile/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
