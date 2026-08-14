import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseRequest } from '../api/validation/parseRequest'
import { listFaqsQuerySchema } from '../api/validation/schemas'
import type { ListFaqsUseCase } from '../useCases/ListFaqsUseCase'

export class FaqController {
  constructor(private readonly listFaqs: ListFaqsUseCase) {}

  handleList = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const { page, pageSize, category, search } = parseRequest(
      listFaqsQuerySchema,
      'query',
      request.query,
    )

    const { items, pagination } = await this.listFaqs.execute({
      page,
      pageSize,
      ...(category ? { categorySlug: category } : {}),
      ...(search ? { search } : {}),
    })

    return reply.status(200).send({
      data: items.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })),
      meta: { pagination },
    })
  }
}
