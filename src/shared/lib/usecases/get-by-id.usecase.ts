import { NotFoundError } from "@/shared/lib/errors";

export interface FindByIdRepo<TEntity> {
  findById(id: string, userId: string): Promise<TEntity | null>;
}

/**
 * Caso de uso genérico: buscar entidad por ID o lanzar NotFoundError.
 * Usar solo cuando no hay reglas de negocio adicionales — si las hay,
 * escribir la clase específica de la feature.
 */
export class GetByIdUseCase<TEntity> {
  constructor(
    private readonly repo: FindByIdRepo<TEntity>,
    private readonly resourceLabel: string,
  ) {}

  async execute(id: string, userId: string): Promise<TEntity> {
    const entity = await this.repo.findById(id, userId);
    if (!entity) {
      throw new NotFoundError(this.resourceLabel, id);
    }
    return entity;
  }
}
