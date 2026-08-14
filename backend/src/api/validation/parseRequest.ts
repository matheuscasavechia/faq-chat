import type { ZodError, ZodType, ZodTypeDef } from 'zod'
import { ValidationError } from '../../domain/errors'

export type RequestSource = 'body' | 'query' | 'params'

export interface ValidationIssue {
  field: string
  message: string
}

export const toValidationIssues = (error: ZodError): ValidationIssue[] =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }))

const MESSAGE_BY_SOURCE: Record<RequestSource, string> = {
  body: 'The request body is invalid.',
  query: 'The query parameters are invalid.',
  params: 'The route parameters are invalid.',
}

export const parseRequest = <TOutput, TInput>(
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
  source: RequestSource,
  data: unknown,
): TOutput => {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new ValidationError(MESSAGE_BY_SOURCE[source], toValidationIssues(result.error))
  }

  return result.data
}
