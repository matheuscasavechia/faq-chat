import type { CategoryRepository, CategoryWithFaqCount } from '../repositories/CategoryRepository'

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(): Promise<CategoryWithFaqCount[]> {
    return this.categoryRepository.list()
  }
}
