import * as E from 'fp-ts/lib/Either'
import { PlayerError } from '../../../types'
import { formatValidationErrors } from '../../../validation'
import { FastifyRequest } from 'fastify'

export const validationStep = (request: FastifyRequest) =>
  E.mapLeft((errors: any): PlayerError => {
    const message = formatValidationErrors(errors)
    request.log.warn({ body: request.body, errors }, message)
    return { statusCode: 400, message }
  })
