import type { PrismaClient } from '@prisma/client'
import type {
  CategoryRepository,
  CategoryWithFaqCount,
} from '../../repositories/CategoryRepository'

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<CategoryWithFaqCount[]> {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { faqs: { where: { active: true } } } },
      },
      orderBy: { name: 'asc' },
    })

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      faqCount: category._count.faqs,
    }))
  }
}
