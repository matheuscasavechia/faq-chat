import { Prisma } from '@prisma/client'
import { InfrastructureError, ValidationError, type AppError } from '../../domain/errors'

const CONNECTIVITY_ERROR_PREFIX = 'P1'
const UNIQUE_CONSTRAINT_CODE = 'P2002'
const FOREIGN_KEY_CONSTRAINT_CODE = 'P2003'

export const translatePrismaError = (error: unknown): AppError | null => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new InfrastructureError('The database is not reachable.', error)
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code.startsWith(CONNECTIVITY_ERROR_PREFIX)) {
      return new InfrastructureError('The database is not reachable.', error)
    }

    if (error.code === UNIQUE_CONSTRAINT_CODE) {
      return new ValidationError('The resource already exists.')
    }

    if (error.code === FOREIGN_KEY_CONSTRAINT_CODE) {
      return new ValidationError('A referenced resource does not exist.')
    }
  }

  return null
}
