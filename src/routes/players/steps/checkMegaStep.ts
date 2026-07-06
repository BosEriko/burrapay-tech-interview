import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from "effect"
import { PlayerError, Tournament } from '../../../types'
import { isMega } from '../../../services/pokemon'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })

export const checkMegaStep = (request: FastifyRequest) =>
  TE.chain(({ name, tournament }: { name: string; tournament: Tournament }) =>
    pipe(
      tournament.isMega && !isMega(name.toLowerCase()) ? E.left(badRequest('Pokemon must be a mega pokemon')) : E.right(name),
      TE.fromEither
    )
  )
