import type { UserDTO } from '@/entities/user/model/user.entity';

export type ProfileDTO = UserDTO;

export type UpdateProfileInput = {
  name?: string | null;
  email?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
