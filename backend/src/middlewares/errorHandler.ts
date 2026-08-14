import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { isAppError, NotFoundError, ValidationError, type AppErrorCode } from '../domain/errors'
import { toValidationIssues } from '../api/validation/parseRequest'
import { translatePrismaError } from '../infrastructure/database/prismaErrorTranslation'

interface ErrorResponseBody {
  error: {
    code: AppErrorCode
    message: string
    details?: unknown
    requestId: string
  }
}

const RATE_LIMIT_STATUS = 429
const SERVER_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.'

const buildBody = (
  code: AppErrorCode,
  message: string,
  requestId: string,
  details?: unknown,
): ErrorResponseBody => ({
  error: {
    code,
    message,
    ...(details === undefined ? {} : { details }),
    requestId,
  },
})

const isFastifyValidationError = (error: FastifyError): boolean =>
  error.statusCode === 400 && Array.isArray(error.validation)

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const error = new NotFoundError(`Route ${request.method} ${request.url} does not exist.`)
    return reply.status(error.statusCode).send(buildBody(error.code, error.message, request.id))
  })

  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const appError = isAppError(error) ? error : translatePrismaError(error)

    if (appError) {
      const logPayload = { err: error, requestId: request.id, code: appError.code }
      if (appError.statusCode >= 500) {
        request.log.error(logPayload, appError.message)
      } else {
        request.log.warn(logPayload, appError.message)
      }

      return reply
        .status(appError.statusCode)
        .send(buildBody(appError.code, appError.message, request.id, appError.details))
    }

    if (error instanceof ZodError) {
      const validationError = new ValidationError()
      request.log.warn({ requestId: request.id }, validationError.message)
      return reply
        .status(validationError.statusCode)
        .send(
          buildBody(
            validationError.code,
            validationError.message,
            request.id,
            toValidationIssues(error),
          ),
        )
    }

    if (isFastifyValidationError(error)) {
      request.log.warn({ err: error, requestId: request.id }, 'Request schema validation failed')
      return reply
        .status(400)
        .send(buildBody('VALIDATION_ERROR', error.message, request.id, error.validation))
    }

    if (error.statusCode === RATE_LIMIT_STATUS) {
      request.log.warn({ requestId: request.id }, 'Rate limit exceeded')
      return reply
        .status(RATE_LIMIT_STATUS)
        .send(
          buildBody(
            'RATE_LIMITED',
            'Too many questions in a short period. Please wait a moment and try again.',
            request.id,
          ),
        )
    }

    if (typeof error.statusCode === 'number' && error.statusCode < 500) {
      request.log.warn({ err: error, requestId: request.id }, 'Request rejected')
      return reply
        .status(error.statusCode)
        .send(buildBody('VALIDATION_ERROR', error.message, request.id))
    }

    request.log.error({ err: error, requestId: request.id }, 'Unhandled error')

    return reply.status(500).send(buildBody('INTERNAL_ERROR', SERVER_ERROR_MESSAGE, request.id))
  })
}
