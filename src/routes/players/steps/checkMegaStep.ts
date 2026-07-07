import { Effect } from "effect"
import { PlayerError, Tournament } from '../../../types'
import { isMega } from '../../../services/pokemon'
import { FastifyRequest } from 'fastify'

const badRequest = (message: string): PlayerError => ({ statusCode: 400, message })

export const checkMegaStep = (request: FastifyRequest) =>
  Effect.flatMap(({ name, tournament }: { name: string; tournament: Tournament }) => {
    if (tournament.isMega && !isMega(name.toLowerCase())) {
      return Effect.fail(badRequest('Pokemon must be a mega pokemon'))
    }
    return Effect.succeed(name)
  })
