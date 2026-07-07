import { Either } from 'effect'
import { FastifyRequest } from 'fastify'

export const validationStep = (request: FastifyRequest) =>
  Either.mapLeft((error: string) => {
    request.log.warn({ body: request.body, error }, error)
    return error
  })
