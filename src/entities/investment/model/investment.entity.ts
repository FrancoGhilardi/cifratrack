import { ValidationError } from "@/shared/lib/errors";

/**
 * Entidad Investment (dominio)
 *
 * Representa una inversión con interés simple
 */
export class Investment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly platform: string,
    public readonly title: string,
    public readonly principal: number, // en formato decimal (no centavos)
    public readonly tna: number, // tasa nominal anual (porcentaje)
    public readonly days: number | null, // duración de la inversión (null para indefinido)
    public readonly isCompound: boolean, // indica si es interés compuesto
    public readonly startedOn: Date,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    skipValidation = false, // Flag para saltar validación (datos de DB)
  ) {
    if (!skipValidation) {
      this.validate();
    }
  }

  /**
   * Validaciones del dominio
   */
  private validate(): void {
    // Validar principal
    if (this.principal <= 0) {
      throw new ValidationError("El monto principal debe ser mayor a cero");
    }

    if (this.principal > 999999999999.99) {
      throw new ValidationError(
        "El monto principal excede el límite permitido",
      );
    }

    // Validar TNA
    if (this.tna < 0) {
      throw new ValidationError("La TNA no puede ser negativa");
    }

    if (this.tna > 999.99) {
      throw new ValidationError("La TNA excede el límite permitido (999.99%)");
    }

    // Validar días
    if (!this.isCompound && (!this.days || this.days <= 0)) {
      throw new ValidationError(
        "La duración debe ser mayor a cero días para inversiones simples",
      );
    }

    if (this.days !== null && this.days <= 0) {
      throw new ValidationError("La duración debe ser mayor a cero días");
    }

    if (this.days !== null && this.days > 36500) {
      throw new ValidationError(
        "La duración excede el límite permitido (~100 años)",
      );
    }

    // Validar textos
    if (!this.platform.trim()) {
      throw new ValidationError("La plataforma es requerida");
    }

    if (this.platform.length > 80) {
      throw new ValidationError(
        "El nombre de la plataforma es demasiado largo (máx 80 caracteres)",
      );
    }

    if (!this.title.trim()) {
      throw new ValidationError("El título es requerido");
    }

    if (this.title.length > 120) {
      throw new ValidationError(
        "El título es demasiado largo (máx 120 caracteres)",
      );
    }

    if (this.notes && this.notes.length > 5000) {
      throw new ValidationError(
        "Las notas son demasiado largas (máx 5000 caracteres)",
      );
    }

    // Validar que startedOn no sea futuro
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const started = new Date(this.startedOn);
    started.setHours(0, 0, 0, 0);

    if (started > today) {
      throw new ValidationError("La fecha de inicio no puede ser futura");
    }
  }

  /**
   * Factory method para crear una nueva inversión
   */
  static create(data: {
    id: string;
    userId: string;
    platform: string;
    title: string;
    principal: number;
    tna: number;
    days: number | null;
    isCompound?: boolean;
    startedOn: Date;
    notes?: string | null;
  }): Investment {
    const now = new Date();

    return new Investment(
      data.id,
      data.userId,
      data.platform,
      data.title,
      data.principal,
      data.tna,
      data.days,
      data.isCompound ?? false,
      data.startedOn,
      data.notes ?? null,
      now,
      now,
      false, // validar
    );
  }

  /**
   * Factory method para reconstruir desde DB (sin validar)
   */
  static fromDB(data: {
    id: string;
    userId: string;
    platform: string;
    title: string;
    principal: number;
    tna: number;
    days: number | null;
    isCompound: boolean;
    startedOn: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Investment {
    return new Investment(
      data.id,
      data.userId,
      data.platform,
      data.title,
      data.principal,
      data.tna,
      data.days,
      data.isCompound,
      data.startedOn,
      data.notes,
      data.createdAt,
      data.updatedAt,
      true, // skip validation
    );
  }

  /**
   * Calcula la fecha de finalización de la inversión
   */
  getEndDate(): Date | null {
    if (this.days === null) {
      return null;
    }
    const endDate = new Date(this.startedOn);
    endDate.setDate(endDate.getDate() + this.days);
    return endDate;
  }

  /**
   * Verifica si la inversión ya finalizó
   * Una inversión se considera finalizada DESPUÉS de su fecha de fin
   * (es decir, el día de fin todavía está activa)
   */
  hasEnded(): boolean {
    if (this.days === null) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = this.getEndDate();
    if (!endDate) return false;
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  }

  /**
   * Días restantes hasta la finalización
   */
  getDaysRemaining(): number | null {
    if (this.days === null) {
      return null;
    }
    if (this.hasEnded()) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = this.getEndDate();
    if (!endDate) return null;
    endDate.setHours(0, 0, 0, 0);

    const diffMs = endDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
