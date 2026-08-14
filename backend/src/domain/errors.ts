export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DOMAIN_RULE_VIOLATION'
  | 'INFRASTRUCTURE_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

interface AppErrorOptions {
  details?: unknown
  cause?: unknown
}

export abstract class AppError extends Error {
  readonly code: AppErrorCode
  readonly statusCode: number
  readonly details: unknown

  protected constructor(
    code: AppErrorCode,
    statusCode: number,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message, { cause: options.cause })
    this.name = new.target.name
    this.code = code
    this.statusCode = statusCode
    this.details = options.details
  }
}

export class ValidationError extends AppError {
  constructor(message = 'The request payload is invalid.', details?: unknown) {
    super('VALIDATION_ERROR', 400, message, { details })
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.') {
    super('NOT_FOUND', 404, message)
  }
}

export class DomainError extends AppError {
  constructor(message: string, details?: unknown) {
    super('DOMAIN_RULE_VIOLATION', 422, message, { details })
  }
}

export class InfrastructureError extends AppError {
  constructor(message = 'A downstream dependency is unavailable.', cause?: unknown) {
    super('INFRASTRUCTURE_ERROR', 503, message, { cause })
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError
