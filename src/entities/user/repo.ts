import type { User } from './model/user.entity';
import type { RegisterInput, UpdateProfileInput } from './model/user.schema';

/**
 * Interface del repositorio de usuarios
 * Define el contrato que debe cumplir cualquier implementación
 *
 * Principio: Las entidades definen QUÉ operaciones necesitan,
 * las features implementan CÓMO se hacen.
 */
export interface IUserRepository {
  /**
   * Buscar usuario por email
   * @returns User si existe, null si no
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Buscar usuario por ID
   * @returns User si existe, null si no
   */
  findById(id: string): Promise<User | null>;

  /**
   * Crear nuevo usuario
   * @param data Datos del usuario (email, password ya hasheado, name opcional)
   * @returns Usuario creado
   */
  create(data: {
    email: string;
    hashedPassword: string;
    name?: string | null;
  }): Promise<User>;

  /**
   * Actualizar perfil de usuario
   * @param userId ID del usuario
   * @param data Datos a actualizar (name, email)
   * @returns Usuario actualizado
   */
  updateProfile(userId: string, data: UpdateProfileInput): Promise<User>;

  /**
   * Actualizar password hasheado
   * @param userId ID del usuario
   * @param hashedPassword Nuevo password hasheado
   * @returns Usuario actualizado
   */
  updatePassword(userId: string, hashedPassword: string): Promise<User>;

  /**
   * Verificar si un email ya existe
   * @param email Email a verificar
   * @param excludeUserId Opcional: excluir un usuario específico (útil para updates)
   * @returns true si existe, false si no
   */
  emailExists(email: string, excludeUserId?: string): Promise<boolean>;
}
