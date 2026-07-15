export interface DeleteRepo {
  delete(id: string, userId: string): Promise<void>;
}

/**
 * Caso de uso genérico: eliminar entidad (passthrough al repo).
 * Usar solo cuando no hay reglas de negocio adicionales (ej. bloquear
 * borrado de defaults, verificar relaciones) — si las hay, escribir la
 * clase específica de la feature.
 */
export class DeleteUseCase {
  constructor(private readonly repo: DeleteRepo) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.repo.delete(id, userId);
  }
}
