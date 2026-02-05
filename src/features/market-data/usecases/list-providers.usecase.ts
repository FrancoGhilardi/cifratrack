import { IYieldRepository } from "@/entities/yield/repo";

export class ListProvidersUseCase {
  constructor(private readonly repo: IYieldRepository) {}

  async execute(): Promise<{ id: string; name: string }[]> {
    return this.repo.listProviders();
  }
}
