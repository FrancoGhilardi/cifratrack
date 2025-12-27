import { DomainError } from '@/shared/lib/errors';

/**
 * Entidad User del dominio
 * Representa un usuario del sistema con sus datos básicos
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly hashedPassword: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * Validaciones de invariantes del dominio
   */
  private validate(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new DomainError('Email inválido');
    }

    if (!this.hashedPassword) {
      throw new DomainError('Password hasheado es requerido');
    }

    if (this.hashedPassword.length < 20) {
      throw new DomainError('Password hasheado inválido');
    }
  }

  /**
   * Factory method para crear usuario desde datos de DB
   */
  static fromPersistence(data: {
    id: string;
    email: string;
    name: string | null;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.hashedPassword,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Convertir a objeto plano para persistencia
   */
  toPersistence() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      hashedPassword: this.hashedPassword,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convertir a DTO seguro (sin password)
   */
  toDTO() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Verificar si el usuario tiene un nombre configurado
   */
  hasName(): boolean {
    return this.name !== null && this.name.trim().length > 0;
  }

  /**
   * Obtener nombre o email como fallback
   */
  getDisplayName(): string {
    return this.hasName() ? this.name! : this.email;
  }

  /**
   * Validar que una nueva contraseña cumpla con los requisitos mínimos.
   * No realiza hashing; se espera que el caller envíe la contraseña en texto plano
   * antes de encriptarla.
   */
  static validateNewPasswordStrength(newPassword: string): void {
    if (!newPassword || newPassword.length < 8) {
      throw new DomainError('La contraseña debe tener al menos 8 caracteres');
    }

    if (newPassword.length > 100) {
      throw new DomainError('La contraseña no puede superar los 100 caracteres');
    }

    // Requisitos básicos: mayúscula, minúscula y número
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber) {
      throw new DomainError(
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      );
    }
  }

  /**
   * Validar que el nuevo hash no sea igual al actual (evita reusar la misma contraseña).
   */
  validatePasswordChange(newHashedPassword: string): void {
    if (!newHashedPassword) {
      throw new DomainError('La nueva contraseña es requerida');
    }

    if (newHashedPassword === this.hashedPassword) {
      throw new DomainError('La nueva contraseña debe ser diferente a la actual');
    }
  }
}

/**
 * Type para DTO de usuario (sin datos sensibles)
 */
export type UserDTO = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};
