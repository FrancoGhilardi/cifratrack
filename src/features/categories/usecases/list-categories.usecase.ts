import { ListUseCase } from "@/shared/lib/usecases/list.usecase";
import type { Category } from "@/entities/category/model/category.entity";
import type { ListCategoriesInput } from "@/entities/category/model/category.schema";

/**
 * Caso de uso: Listar categorías (passthrough al repo, sin reglas propias)
 */
export class ListCategoriesUseCase extends ListUseCase<
  Category[],
  ListCategoriesInput
> {}
