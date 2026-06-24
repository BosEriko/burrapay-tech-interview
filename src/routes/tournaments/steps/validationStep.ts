import * as E from 'fp-ts/lib/Either'
import { formatValidationErrors } from '../../../validation'
import { FastifyRequest } from 'fastify'

export const validationStep = (request: FastifyRequest) =>
  E.mapLeft((errors: any) => {
    const message = formatValidationErrors(errors)
    request.log.warn({ body: request.body, errors }, message)
    return message
  })
