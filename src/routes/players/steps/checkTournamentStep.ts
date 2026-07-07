import { Either, Effect, pipe } from "effect"
import { PlayerError, Tournament } from '../../../types'
import { getTournament } from '../../../storage'
import { FastifyRequest } from 'fastify'

const notFound = (message: string): PlayerError => ({ statusCode: 404, message })

export const checkTournamentStep = (request: FastifyRequest, tournamentId: string) =>
  Effect.flatMap((context: { name: string }) =>
    pipe(
      getTournament(tournamentId),
      Either.fromOption((): PlayerError => {
        request.log.warn({ tournamentId }, 'Tournament not found')
        return notFound('Tournament not found')
      }),
      Either.map((tournament: Tournament) => ({ name: context.name, tournament })),
      Either.match({
        onLeft: (e) => Effect.fail(e),
        onRight: (a) => Effect.succeed(a)
      })
    )
  )
