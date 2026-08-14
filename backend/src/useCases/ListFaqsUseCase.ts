import type { Faq } from '../domain/faq/Faq'
import type { FaqRepository, ListFaqsFilter } from '../repositories/FaqRepository'

export interface ListFaqsOutput {
  items: Faq[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class ListFaqsUseCase {
  constructor(private readonly faqRepository: FaqRepository) {}

  async execute(filter: ListFaqsFilter): Promise<ListFaqsOutput> {
    const { items, total } = await this.faqRepository.list(filter)

    return {
      items,
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / filter.pageSize),
      },
    }
  }
}
