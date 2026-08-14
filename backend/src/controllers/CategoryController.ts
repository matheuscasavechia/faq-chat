import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListCategoriesUseCase } from '../useCases/ListCategoriesUseCase'

export class CategoryController {
  constructor(private readonly listCategories: ListCategoriesUseCase) {}

  handleList = async (_request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const categories = await this.listCategories.execute()

    return reply.status(200).send({ data: categories })
  }
}
