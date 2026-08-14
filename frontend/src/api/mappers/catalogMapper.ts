import type { CategoryOption, FaqCollection } from '@/types/catalog'
import type { CategoryListDto, FaqListDto } from '../dto/catalogDto'

export const toFaqCollection = (dto: FaqListDto): FaqCollection => ({
  items: dto.data.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    categoryName: faq.category.name,
    categorySlug: faq.category.slug,
  })),
  page: dto.meta.pagination.page,
  totalPages: dto.meta.pagination.totalPages,
  total: dto.meta.pagination.total,
})

export const toCategoryOptions = (dto: CategoryListDto): CategoryOption[] =>
  dto.data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    faqCount: category.faqCount,
  }))
