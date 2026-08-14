import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AskQuestionUseCase } from '../useCases/AskQuestionUseCase'
import { chatQueryBodySchema } from '../api/validation/schemas'
import { parseRequest } from '../api/validation/parseRequest'
import { toChatAnswerResponse } from './presenters/chatPresenter'

export class ChatController {
  constructor(private readonly askQuestion: AskQuestionUseCase) {}

  handleQuery = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const { question, sessionId } = parseRequest(chatQueryBodySchema, 'body', request.body)

    const result = await this.askQuestion.execute({
      question,
      sessionId: sessionId ?? null,
    })

    return reply.status(200).send({ data: toChatAnswerResponse(result) })
  }
}
