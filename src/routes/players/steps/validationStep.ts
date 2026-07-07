import * as E from 'fp-ts/lib/Either'
import { PlayerError } from '../../../types'
import { FastifyRequest } from 'fastify'

export const validationStep = (request: FastifyRequest) =>
  E.mapLeft((error: string): PlayerError => {
    request.log.warn({ body: request.body, error }, error)
    return { statusCode: 400, message: error }
  })
