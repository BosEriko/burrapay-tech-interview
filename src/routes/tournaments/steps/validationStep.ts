import * as E from 'fp-ts/lib/Either'
import { FastifyRequest } from 'fastify'

export const validationStep = (request: FastifyRequest) =>
  E.mapLeft((error: string) => {
    request.log.warn({ body: request.body, error }, error)
    return error
  })
