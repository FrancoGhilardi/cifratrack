export interface ListRepo<TResult, TFilters> {
  list(userId: string, filters?: TFilters): Promise<TResult>;
}

/**
 * Caso de uso genérico: listar entidades del usuario (passthrough al repo).
 * Usar solo cuando no hay reglas de negocio adicionales — si las hay,
 * escribir la clase específica de la feature.
 */
export class ListUseCase<TResult, TFilters = undefined> {
  constructor(private readonly repo: ListRepo<TResult, TFilters>) {}

  async execute(userId: string, filters?: TFilters): Promise<TResult> {
    return this.repo.list(userId, filters);
  }
}
